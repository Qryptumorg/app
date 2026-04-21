import { keccak256, toBytes, encodePacked, toHex } from "viem";
import type { PublicClient } from "viem";
import { generateH0Api } from "@/lib/api";
import { dbSetChainPos, dbGetChainPos, dbDelChainPos } from "@/lib/localDb";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Total number of keccak hashes above H0. Chain yields CHAIN_DEPTH - 1 usable proofs (H{CHAIN_DEPTH-1} down to H1). H0 is reserved as the recharge proof. */
export const CHAIN_DEPTH = 100;

/** Storage slot of proofChainHead in PersonalQryptSafeV6.
 *  OZ v5.5 ReentrancyGuard uses a named ERC-7201 slot, so contract variables
 *  are sequential starting at slot 0:
 *    slot 0: owner
 *    slot 1: proofChainHead  <-- here
 *    slot 2: initialized
 *    slot 3: lastActivityBlock
 */
const CHAIN_HEAD_SLOT = toHex(1, { size: 32 });

const STORAGE_PREFIX = "qryptum:chain";

// ── Vault proof format ─────────────────────────────────────────────────────────

export function validatePasswordFormat(password: string): boolean {
    if (password.length !== 6) return false;
    let letters = 0;
    let digits = 0;
    for (const char of password) {
        if (/[a-zA-Z]/.test(char)) letters++;
        else if (/[0-9]/.test(char)) digits++;
        else return false;
    }
    return letters === 3 && digits === 3;
}

export function getPasswordStrengthLabel(password: string): string {
    if (password.length === 0) return "";
    if (password.length < 6) return "Too short";
    if (!validatePasswordFormat(password)) return "Need 3 letters and 3 numbers";
    return "Valid vault proof format";
}

// ── V5 compatibility (kept for V5 vaults, do not use in V6) ──────────────────

export function hashPassword(password: string): `0x${string}` {
    return keccak256(toBytes(password));
}

/** Commit hash for V5 revealTransfer. Uses passwordHash (static, V5 only). */
export function buildCommitHash(
    passwordHash: `0x${string}`,
    nonce: bigint,
    tokenAddress: string,
    to: string,
    amount: bigint
): `0x${string}` {
    const packed = encodePacked(
        ["bytes32", "uint256", "address", "address", "uint256"],
        [passwordHash, nonce, tokenAddress as `0x${string}`, to as `0x${string}`, amount]
    );
    return keccak256(packed);
}

// ── V6 OTP Chain: key derivation ─────────────────────────────────────────────

/**
 * Derive H0 from the vault proof via the Railway API (server-side PBKDF2-SHA256, 200k iterations).
 * PROOF_SALT never reaches the frontend - it lives only in the Railway environment.
 * H0 is never submitted to the blockchain during normal operations -- only during rechargeChain.
 */
export async function generateH0(
    vaultProof: string,
    vaultAddress: string
): Promise<`0x${string}`> {
    return generateH0Api(vaultProof, vaultAddress);
}

/**
 * Apply n keccak256 rounds starting from H0.
 *   computeChainHash(H0, 0) = H0
 *   computeChainHash(H0, 1) = keccak256(H0) = H1
 *   computeChainHash(H0, n) = H{n}
 */
export function computeChainHash(H0: `0x${string}`, n: number): `0x${string}` {
    let h: `0x${string}` = H0;
    for (let i = 0; i < n; i++) {
        h = keccak256(h);
    }
    return h;
}

/**
 * Returns H{CHAIN_DEPTH} (= keccak256^100(H0)) -- the initialChainHead to pass to createVault().
 * Async because generateH0 uses PBKDF2.
 */
export async function generateInitialChainHead(
    vaultProof: string,
    vaultAddress: string
): Promise<`0x${string}`> {
    const H0 = await generateH0(vaultProof, vaultAddress);
    return computeChainHash(H0, CHAIN_DEPTH);
}

/**
 * Returns the OTP proof at a given position.
 *   position CHAIN_DEPTH-1 (99) = H99 = first proof to submit
 *   position 1              = H1  = last usable proof (99th TX)
 *   position 0              = H0  = recharge proof only, not for normal TXs
 */
export async function getProofAtPosition(
    vaultProof: string,
    vaultAddress: string,
    position: number
): Promise<`0x${string}`> {
    const H0 = await generateH0(vaultProof, vaultAddress);
    return computeChainHash(H0, position);
}

// ── V6 OTP Chain: localStorage state ─────────────────────────────────────────

function posKey(vaultAddress: string): string {
    return `${STORAGE_PREFIX}:${vaultAddress.toLowerCase()}:position`;
}

/**
 * Read current chain position from localStorage.
 * Returns null if not set (vault never initialized or localStorage cleared).
 * Position 99 = fresh chain (H99 is next proof).
 * Position 1  = only one usable proof left (H1).
 * Position 0  = chain exhausted, must recharge (H0 is the recharge proof).
 */
export function getChainPosition(vaultAddress: string): number | null {
    const raw = localStorage.getItem(posKey(vaultAddress));
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return isNaN(n) ? null : n;
}

export function setChainPosition(vaultAddress: string, position: number): void {
    localStorage.setItem(posKey(vaultAddress), String(position));
    dbSetChainPos(posKey(vaultAddress), position).catch(() => {});
}

export function clearChainState(vaultAddress: string): void {
    localStorage.removeItem(posKey(vaultAddress));
    dbDelChainPos(posKey(vaultAddress)).catch(() => {});
}

/**
 * Call this immediately after a successful createVault() transaction.
 * Sets position to CHAIN_DEPTH - 1 (first proof available = H{CHAIN_DEPTH-1}).
 */
export function initChainState(vaultAddress: string): void {
    setChainPosition(vaultAddress, CHAIN_DEPTH - 1);
}

/** Returns true when the chain is exhausted and rechargeChain() is needed. */
export function isChainExhausted(vaultAddress: string): boolean {
    const pos = getChainPosition(vaultAddress);
    return pos !== null && pos === 0;
}

/** Returns remaining usable proofs (0 = exhausted). */
export function chainProofsRemaining(vaultAddress: string): number {
    const pos = getChainPosition(vaultAddress);
    if (pos === null) return 0;
    return pos;
}

// ── V6 OTP Chain: proof consumption ──────────────────────────────────────────

/**
 * Derive the next OTP proof WITHOUT consuming (decrementing) the chain position.
 * Use this before submitting a TX so you can check errors before committing the position.
 * Pair with consumeProofAtPosition() after the TX is successfully submitted.
 *
 * Pass `autoSync: { vaultAddress, publicClient }` to automatically verify and heal
 * the local chain position against on-chain state before returning the proof.
 * This makes sync fully transparent: if localStorage was cleared or the user
 * is on a new device, the position is recovered silently using the vault proof
 * already entered by the user.
 *
 * Throws if position cannot be recovered (wrong vault proof) or chain is exhausted.
 */
export async function peekNextProof(
    vaultProof: string,
    walletAddress: string,
    autoSync?: { vaultAddress: string; publicClient: PublicClient }
): Promise<{ proof: `0x${string}`; position: number }> {
    // Derive H0 once (PBKDF2 - the expensive step, ~300ms).
    const H0 = await generateH0(vaultProof, walletAddress);

    if (autoSync) {
        // Read current on-chain proof chain head (one cheap RPC call).
        const contractHead = await readChainHeadFromContract(autoSync.vaultAddress, autoSync.publicClient);
        const localPos = getChainPosition(walletAddress);

        // Check if local position is already correct.
        let synced = false;
        if (localPos !== null) {
            const Hlocal = computeChainHash(H0, localPos);
            synced = keccak256(Hlocal) === contractHead;
        }

        if (!synced) {
            // Auto-recover: scan H{CHAIN_DEPTH-1}..H0 to find matching position.
            // This is fast because H0 is already known (only keccak256 iterations).
            let recovered = false;
            for (let p = CHAIN_DEPTH - 1; p >= 0; p--) {
                const Hp = computeChainHash(H0, p);
                if (keccak256(Hp) === contractHead) {
                    setChainPosition(walletAddress, p);
                    recovered = true;
                    break;
                }
            }
            if (!recovered) {
                // Check for fresh vault: contractHead = H{CHAIN_DEPTH}.
                const H100 = computeChainHash(H0, CHAIN_DEPTH);
                if (H100 === contractHead) {
                    setChainPosition(walletAddress, CHAIN_DEPTH - 1);
                    recovered = true;
                }
            }
            if (!recovered) {
                throw new Error(
                    "Chain sync failed. Check that your vault proof is correct."
                );
            }
        }
    }

    // Restore position from IndexedDB if localStorage was cleared.
    if (getChainPosition(walletAddress) === null) {
        const dbPos = await dbGetChainPos(posKey(walletAddress));
        if (dbPos !== null) localStorage.setItem(posKey(walletAddress), String(dbPos));
    }

    const pos = getChainPosition(walletAddress);

    if (pos === null) {
        throw new Error(
            "OTP chain not initialized. Complete an operation on this device or enter your vault proof to recover."
        );
    }
    if (pos === 0) {
        throw new Error(
            "OTP chain exhausted. Recharge your vault proof chain before continuing."
        );
    }

    const proof = computeChainHash(H0, pos);
    return { proof, position: pos };
}

/**
 * Decrement the stored chain position after a TX is successfully submitted.
 * Call this in onSuccess of writeContract, paired with peekNextProof.
 */
export function consumeProofAtPosition(walletAddress: string, position: number): void {
    setChainPosition(walletAddress, position - 1);
}

/**
 * Convenience wrapper: peek + consume in one call.
 * Use for single-TX operations (shield, unshield) where there is no commit-reveal split.
 * Decrement happens BEFORE the TX is sent - if the user rejects MetaMask the position
 * is consumed but the proof was never used on-chain.  To avoid this, prefer using
 * peekNextProof + consumeProofAtPosition directly.
 *
 * @deprecated Prefer peekNextProof + consumeProofAtPosition for cleaner error handling.
 */
export async function getNextProof(
    vaultProof: string,
    walletAddress: string
): Promise<{ proof: `0x${string}`; position: number }> {
    const { proof, position } = await peekNextProof(vaultProof, walletAddress);
    consumeProofAtPosition(walletAddress, position);
    return { proof, position };
}

/**
 * Returns the recharge proof (H0) to pass as `currentProof` to rechargeChain().
 * The contract verifies: keccak256(H0) == proofChainHead (which is H1 after last normal TX was H1).
 * After rechargeChain succeeds, call initChainState() with the new vault address to reset position.
 */
export async function getRechargeProof(
    vaultProof: string,
    vaultAddress: string
): Promise<`0x${string}`> {
    return getProofAtPosition(vaultProof, vaultAddress, 0);
}

// ── V6 OTP Chain: recovery sync ───────────────────────────────────────────────

/**
 * Read the raw proofChainHead from contract storage slot 1.
 * Used for chain recovery when localStorage is cleared.
 */
export async function readChainHeadFromContract(
    vaultAddress: string,
    publicClient: PublicClient
): Promise<`0x${string}`> {
    const raw = await publicClient.getStorageAt({
        address: vaultAddress as `0x${string}`,
        slot: CHAIN_HEAD_SLOT,
    });
    if (!raw || raw === "0x") {
        throw new Error("Could not read chain head from contract storage.");
    }
    return raw as `0x${string}`;
}

/** @internal zero bytes32 sentinel */
const ZERO_BYTES32 = "0x" + "0".repeat(64);

export interface SyncResult {
    /** Recovered position (0-99), or null if no match found. */
    pos: number | null;
    /** Raw value read from contract storage slot 1. Shown to user for diagnostics. */
    contractHead: `0x${string}`;
    /** True when slot 1 is all-zero (vault uninitialized or wrong slot). */
    isZero: boolean;
}

/**
 * Sync local chain position by reading proofChainHead from the contract.
 * Scans H{CHAIN_DEPTH-1} down to H0 until keccak256(Hpos) matches the on-chain head.
 *
 * Use when localStorage is cleared, user moves to a new device, or after a failed TX
 * caused a local position desync.
 * Returns a SyncResult with the recovered position (null = no match),
 * the raw contractHead, and whether the slot read zero (uninitialized vault).
 *
 * @param vaultProof    - the 6-char vault proof (e.g. "abc123")
 * @param walletAddress - the EOA wallet address (PBKDF2 salt + storage key)
 * @param vaultAddress  - the QryptSafe clone address (for on-chain read)
 * @param publicClient  - Viem PublicClient connected to the correct network
 */
export async function syncChainPosition(
    vaultProof: string,
    walletAddress: string,
    vaultAddress: string,
    publicClient: PublicClient
): Promise<SyncResult> {
    const contractHead = await readChainHeadFromContract(vaultAddress, publicClient);
    const isZero = contractHead === ZERO_BYTES32;

    if (isZero) {
        return { pos: null, contractHead, isZero: true };
    }

    const H0 = await generateH0(vaultProof, walletAddress);

    // contractHead = H{pos} after submitting H{pos}.
    // Fresh vault: contractHead = H{CHAIN_DEPTH} (= keccak256^100(H0)).
    // Scan H{CHAIN_DEPTH-1} down to H0: keccak256(H{p}) === contractHead means pos = p.
    // Note: for fresh vault pos=CHAIN_DEPTH-1 catches H{CHAIN_DEPTH} since
    //       keccak256(H{CHAIN_DEPTH-1}) = H{CHAIN_DEPTH}.
    for (let pos = CHAIN_DEPTH - 1; pos >= 0; pos--) {
        const Hpos = computeChainHash(H0, pos);
        if (keccak256(Hpos) === contractHead) {
            setChainPosition(walletAddress, pos);
            return { pos, contractHead, isZero: false };
        }
    }

    return { pos: null, contractHead, isZero: false };
}

// ── V6 commit hash ────────────────────────────────────────────────────────────

/**
 * Build the commit hash for V6 commitTransfer / revealTransfer.
 * Matches Solidity: keccak256(abi.encodePacked(proof, nonce, tokenAddress, to, amount))
 * Note: `proof` here is the OTP proof (H{pos}), same value passed to revealTransfer.
 */
export function buildCommitHashV6(
    proof: `0x${string}`,
    nonce: bigint,
    tokenAddress: string,
    to: string,
    amount: bigint
): `0x${string}` {
    const packed = encodePacked(
        ["bytes32", "uint256", "address", "address", "uint256"],
        [proof, nonce, tokenAddress as `0x${string}`, to as `0x${string}`, amount]
    );
    return keccak256(packed);
}
