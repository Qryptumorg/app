import { useState, useRef, useEffect } from "react";
import { useWalletClient, usePublicClient, useReadContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import {
    EyeOffIcon, ShieldIcon, CheckCircle2Icon, ClockIcon, LoaderIcon,
    AlertCircleIcon, EyeIcon, ChevronDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PERSONAL_VAULT_ABI, getVaultABI } from "@/lib/abi";
import { validatePasswordFormat, hashPassword, peekNextProof, consumeProofAtPosition } from "@/lib/password";
import {
    ensureRailgunEngine,
    loadRailgunProvider,
    deriveEncryptionKey,
    getOrCreateRailgunWallet,
    getRailgunWalletAddress,
    getShieldSignMessage,
    buildShieldTx,
    buildUnshieldTx,
    waitForRailgunBalance,
    hasRailgunBalance,
    clearZKArtifactCache,
    subscribeScanProgress,
    RAILGUN_CHAIN_MAP,
} from "@/lib/railgun";
import { recordTransaction, broadcastUnshieldTx, fetchRailgunPending, saveRailgunPending, clearRailgunPending, type RailgunPendingData } from "@/lib/api";

interface ShieldedToken {
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    shieldedBalance: bigint | undefined;
    decimals: number;
    color: string;
}

interface QryptShieldPanelProps {
    vaultAddress: `0x${string}`;
    walletAddress: string;
    chainId: number;
    tokensWithBalances: ShieldedToken[];
    initialTokenAddress?: string;
    vaultVersion?: "v5" | "v6";
    onComplete?: () => void;
    onLockChange?: (locked: boolean) => void;
}

type StepStatus = "pending" | "active" | "done" | "error";

interface Step {
    id: string;
    label: string;
    status: StepStatus;
    detail?: string;
    txHash?: string;
    progress?: number;
}

const INITIAL_STEPS: Step[] = [
    { id: "engine",        label: "Prepare privacy engine",              status: "pending" },
    { id: "atomicShield",  label: "Enter Railgun pool",                  status: "pending" },
    { id: "sync",          label: "Build privacy index",                  status: "pending" },
    { id: "proof",         label: "Generate delivery proof",             status: "pending" },
    { id: "deliver",       label: "Deliver to recipient",                status: "pending" },
];

const PRIMARY = "#8B5CF6";

export default function QryptShieldPanel({
    vaultAddress,
    walletAddress,
    chainId,
    tokensWithBalances,
    initialTokenAddress,
    vaultVersion = "v5",
    onComplete,
    onLockChange,
}: QryptShieldPanelProps) {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient({ chainId });

    const tokenLocked = !!initialTokenAddress;

    const [selectedToken, setSelectedToken] = useState<ShieldedToken | null>(() => {
        if (initialTokenAddress) {
            return tokensWithBalances.find(
                t => t.tokenAddress.toLowerCase() === initialTokenAddress.toLowerCase()
            ) ?? tokensWithBalances[0] ?? null;
        }
        return tokensWithBalances.find(t => t.shieldedBalance && t.shieldedBalance > 0n) ?? tokensWithBalances[0] ?? null;
    });

    // Sync selectedToken when tokensWithBalances arrives late (data loads after mount)
    useEffect(() => {
        if (tokensWithBalances.length === 0) return;
        setSelectedToken(prev => {
            // If no token selected yet, pick the right one
            if (!prev) {
                if (initialTokenAddress) {
                    return tokensWithBalances.find(
                        t => t.tokenAddress.toLowerCase() === initialTokenAddress.toLowerCase()
                    ) ?? tokensWithBalances[0];
                }
                return tokensWithBalances.find(t => t.shieldedBalance && t.shieldedBalance > 0n) ?? tokensWithBalances[0];
            }
            // Token already selected - just refresh its shieldedBalance from updated list
            const refreshed = tokensWithBalances.find(
                t => t.tokenAddress.toLowerCase() === prev.tokenAddress.toLowerCase()
            );
            return refreshed ?? prev;
        });
    }, [tokensWithBalances, initialTokenAddress]);

    const [showTokenPicker, setShowTokenPicker] = useState(false);
    const [amount, setAmount] = useState("");
    const [recipient, setRecipient] = useState("");
    const [vaultProof, setVaultProof] = useState("");
    const [showProof, setShowProof] = useState(false);

    const [phase, setPhase] = useState<"form" | "running" | "done" | "error">("form");
    const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
    const [fatalError, setFatalError] = useState<string | null>(null);
    // 3-minute timeout: surface "close and come back" UI early for first-time scan.
    // First-time IndexedDB build processes 375k+ historical RAILGUN commitments
    // through WASM Poseidon hashing (~1-3 hours). Progress is saved to IndexedDB
    // so the scan resumes exactly where it left off on every subsequent page load.
    // On return visits the index is already complete and sync takes seconds.
    // utxoInPool: true when deposit was indexed in pool but awaiting POI validation.
    // POI validation on mainnet takes 30-60 min (Subsquid lag + aggregator batch cycle).
    const [syncTimedOut, setSyncTimedOut] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [utxoInPool, setUtxoInPool] = useState(false);
    const SYNC_USER_TIMEOUT_MS = 3 * 60 * 1_000; // 3 min - fail fast, DB resumes

    useEffect(() => {
        onLockChange?.(phase === "running");
    }, [phase, onLockChange]);

    // Warm-up: start the RAILGUN engine and Merkle tree scan immediately on
    // component mount, before the user clicks anything. The scan processes
    // 270k+ historical events in WASM (Poseidon hashing each commitment).
    // Starting it early gives the scan a head-start so by the time the user
    // signs MetaMask and submits the shield TX, the tree is already partially
    // or fully synced. Errors are swallowed (warm-up is best-effort).
    useEffect(() => {
        if (!RAILGUN_CHAIN_MAP[chainId]) return;
        ensureRailgunEngine().catch(() => {});
        loadRailgunProvider(chainId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chainId]);
    const [doneTxHash, setDoneTxHash] = useState<string>("");

    // Pending transfer - server is primary (survives clear history), localStorage is fast local cache
    const pendingKey = `qryptum:railgun:pending:${walletAddress.toLowerCase()}:${chainId}`;
    const [pendingTransfer, setPendingTransfer] = useState<RailgunPendingData | null>(() => {
        try { const raw = localStorage.getItem(pendingKey); return raw ? JSON.parse(raw) : null; } catch { return null; }
    });

    // On mount: fetch from server (overrides localStorage, survives browser clear)
    // Finds the pending entry matching the current token's address.
    useEffect(() => {
        fetchRailgunPending(walletAddress, chainId).then(rows => {
            const match = selectedToken
                ? rows.find(r => r.tokenAddress.toLowerCase() === selectedToken.tokenAddress.toLowerCase())
                : rows[0];
            if (match) {
                setPendingTransfer(match);
                try { localStorage.setItem(pendingKey, JSON.stringify(match)); } catch {}
            }
        }).catch(() => {});
    }, [walletAddress, chainId]);

    // Auto-fill form from pending transfer when selected token matches
    useEffect(() => {
        if (!pendingTransfer || !selectedToken) return;
        if (pendingTransfer.tokenAddress.toLowerCase() !== selectedToken.tokenAddress.toLowerCase()) return;
        if (!amount) setAmount(pendingTransfer.amount);
        if (!recipient) setRecipient(pendingTransfer.recipient);
    }, [pendingTransfer, selectedToken]);

    const abortRef = useRef(false);
    const activeStepRef = useRef<string | null>(null);

    // Cache Railgun session so "Try again" never re-prompts MetaMask for signs.
    // Signs are deterministic (same message + same wallet = same signature) so
    // caching for the component lifetime is safe.
    const sessionRef = useRef<{
        encryptionKey: string;
        railgunWalletID: string;
        railgunAddress: string;
        shieldPrivateKey: string;
    } | null>(null);

    const token = selectedToken;
    const decimals = token?.decimals ?? 6;
    const parsedAmount = amount && !isNaN(parseFloat(amount)) ? parseUnits(amount, decimals) : 0n;
    // Net amount after Railgun 0.25% shield fee - used in ZK proof generation
    const netAmount = parsedAmount - (parsedAmount * 25n / 10000n);

    const proofValid = validatePasswordFormat(vaultProof);
    const recipientValid = recipient.startsWith("0x") && recipient.length === 42;
    // Only block if vault actually has tokens but not enough (resume mode has vault=0, allow it)
    const exceedsBalance = token?.shieldedBalance !== undefined &&
        token.shieldedBalance > 0n &&
        parsedAmount > 0n &&
        parsedAmount > token.shieldedBalance;

    const railgunSupported = !!RAILGUN_CHAIN_MAP[chainId];

    const canSend = !!token && parsedAmount > 0n && proofValid && recipientValid && !exceedsBalance && railgunSupported;

    function updateStep(id: string, patch: Partial<Step>) {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    }

    function stepDone(id: string, txHash?: string) {
        updateStep(id, { status: "done", txHash });
    }

    function stepActive(id: string, detail?: string) {
        activeStepRef.current = id;
        updateStep(id, { status: "active", detail });
    }

    function stepError(id: string, detail: string) {
        updateStep(id, { status: "error", detail });
    }

    async function handleSend() {
        if (!canSend || !walletClient || !publicClient || !token) return;

        abortRef.current = false;
        setSteps(INITIAL_STEPS.map(s => ({ ...s })));
        setFatalError(null);
        setDoneTxHash("");
        setPhase("running");

        try {
            const account = walletAddress as `0x${string}`;

            // ── STEP 1: Init Railgun engine ─────────────────────────────────
            // If session is cached (i.e. user clicked "Try again") skip all
            // MetaMask signs - engine is already running and keys are derived.
            stepActive("engine", "Loading privacy engine...");

            // Engine init + RPC connection with 3-minute hard timeout.
            // skipMerkletreeScans=true means NO historical 100k-event scan on startup,
            // so this should complete in seconds. The timeout is a safety net for
            // slow RPC connections or WASM load issues.
            const ENGINE_TIMEOUT_MS = 3 * 60 * 1_000;
            const engineTimeout = new Promise<"timeout">(res =>
                setTimeout(() => res("timeout"), ENGINE_TIMEOUT_MS)
            );
            const engineInit = (async () => {
                await ensureRailgunEngine(msg => updateStep("engine", { detail: msg }));
                await loadRailgunProvider(chainId, msg => updateStep("engine", { detail: msg }));
                return "done" as const;
            })();
            const engineResult = await Promise.race([engineInit, engineTimeout]);
            if (engineResult === "timeout") {
                updateStep("engine", {
                    detail: "Network connection slow - proceeding anyway. Shield may take longer.",
                });
            }

            if (!sessionRef.current) {
                // First run - need both MetaMask signs (deterministic, cached after this)
                updateStep("engine", { detail: "Sign to authorize your privacy wallet (1 of 2)..." });
                const encKeySignature = await walletClient.signMessage({
                    account,
                    message: "Qryptum: authorize privacy wallet",
                });
                const encryptionKey = deriveEncryptionKey(encKeySignature);
                const railgunWalletID = await getOrCreateRailgunWallet(
                    walletAddress,
                    encryptionKey,
                    chainId,
                    msg => updateStep("engine", { detail: msg }),
                );
                const railgunAddress = getRailgunWalletAddress(railgunWalletID);

                updateStep("engine", { detail: "Sign to authorize your shield key (2 of 2)..." });
                const shieldSignMsg = getShieldSignMessage();
                const shieldSig = await walletClient.signMessage({ account, message: shieldSignMsg });
                const shieldPrivateKey = deriveEncryptionKey(shieldSig);

                sessionRef.current = { encryptionKey, railgunWalletID, railgunAddress, shieldPrivateKey };
            } else {
                updateStep("engine", { detail: "Privacy wallet ready (session cached)." });
            }

            const { encryptionKey, railgunWalletID, railgunAddress, shieldPrivateKey } = sessionRef.current;

            stepDone("engine");

            // ── RESUME CHECK ────────────────────────────────────────────────
            // Server pending state is the most reliable resume signal.
            // It's set after atomicShield confirms and cleared only on success.
            // localStorage is a fast local cache; server survives clear history.
            // Fall back to on-chain Railgun balance scan only if both are empty.
            stepActive("atomicShield", "Checking for pending transfer...");

            const serverPendingList = await fetchRailgunPending(walletAddress, chainId);
            const serverPending = serverPendingList.find(
                r => r.tokenAddress.toLowerCase() === token.tokenAddress.toLowerCase()
            ) ?? null;
            const tokenIsPending = !!serverPending;

            const alreadyShielded = tokenIsPending || await hasRailgunBalance(
                railgunWalletID,
                chainId,
                token.tokenAddress,
            );

            if (alreadyShielded) {
                stepDone("atomicShield");
            } else {
                // ── STEP 2: vault.unshieldToRailgun() (atomic, 1 MetaMask TX) ─
                // Builds the Railgun shieldCalldata off-chain, then the vault
                // burns qTokens + approves Railgun + calls shield in one atomic TX.
                stepActive("atomicShield", "Building Railgun calldata...");
                const shieldTx = await buildShieldTx({
                    chainId,
                    shieldPrivateKey,
                    railgunAddress,
                    tokenAddress: token.tokenAddress,
                    amount: parsedAmount,
                    walletAddress,
                });

                const railgunProxy = shieldTx.to as `0x${string}`;
                const shieldCalldata = shieldTx.data as `0x${string}`;
                const shieldValue = BigInt(shieldTx.value?.toString() ?? "0");

                updateStep("atomicShield", { detail: "Confirm in your wallet (1 transaction)..." });

                let atomicHash: `0x${string}`;

                if (vaultVersion === "v6") {
                    // V6: needs OTP chain proof - derive via peekNextProof then consume after TX
                    const { proof: otpProof, position: otpPos } = await peekNextProof(
                        vaultProof,
                        walletAddress,
                        publicClient ? { vaultAddress: vaultAddress as string, publicClient } : undefined,
                    );
                    // mainnet uses enterRailgun, Sepolia V6 uses railgun (frozen on-chain name)
                    const railgunFnName = chainId === 1 ? "enterRailgun" : "railgun";
                    atomicHash = await walletClient.writeContract({
                        account,
                        address: vaultAddress,
                        abi: getVaultABI(chainId),
                        functionName: railgunFnName,
                        chain: undefined,
                        args: [
                            token.tokenAddress as `0x${string}`,
                            parsedAmount,
                            otpProof,
                            railgunProxy,
                            shieldCalldata,
                        ],
                        value: shieldValue,
                    });
                    updateStep("atomicShield", { detail: "Confirming on-chain...", txHash: atomicHash });
                    const atomicReceiptV6 = await publicClient!.waitForTransactionReceipt({ hash: atomicHash });
                    if (atomicReceiptV6.status === "reverted") throw new Error(`Shield transaction reverted on-chain. Check Etherscan for details. TX: ${atomicHash}`);
                    // consumeProofAtPosition is local state only - wrap so a failure here
                    // does NOT mark the step as failed (TX is already confirmed on-chain)
                    try { consumeProofAtPosition(walletAddress, otpPos); } catch { /* non-critical */ }
                } else {
                    // V5: static keccak256 hash of vault proof
                    atomicHash = await walletClient.writeContract({
                        account,
                        address: vaultAddress,
                        abi: PERSONAL_VAULT_ABI,
                        functionName: "unshieldToRailgun",
                        chain: undefined,
                        args: [
                            token.tokenAddress as `0x${string}`,
                            parsedAmount,
                            hashPassword(vaultProof),
                            railgunProxy,
                            shieldCalldata,
                        ],
                        value: shieldValue,
                    });
                    updateStep("atomicShield", { detail: "Confirming on-chain...", txHash: atomicHash });
                    const atomicReceiptV5 = await publicClient!.waitForTransactionReceipt({ hash: atomicHash });
                    if (atomicReceiptV5.status === "reverted") throw new Error(`Shield transaction reverted on-chain. Check Etherscan for details. TX: ${atomicHash}`);
                }
                stepDone("atomicShield", atomicHash);
                // Save pending state to server + localStorage so resume works
                // even if user restarts browser or clears history
                const pendingData: RailgunPendingData = {
                    walletAddress,
                    chainId,
                    atomicHash,
                    tokenAddress: token.tokenAddress,
                    tokenSymbol: token.tokenSymbol,
                    amount,
                    recipient,
                };
                setPendingTransfer(pendingData);
                try { localStorage.setItem(pendingKey, JSON.stringify(pendingData)); } catch {}
                saveRailgunPending(pendingData).catch(() => {});

                // Record vault-side event: qTokens left the vault into Railgun pool
                try {
                    await recordTransaction({
                        walletAddress,
                        txHash: atomicHash,
                        type: "transfer",
                        tokenAddress: token.tokenAddress,
                        tokenSymbol: token.tokenSymbol,
                        tokenName: token.tokenName,
                        amount,
                        fromAddress: walletAddress,
                        toAddress: recipient,
                        networkId: chainId,
                    });
                } catch {}
            }

            // ── STEP 3: Wait for Merkle tree sync ──────────────────────────
            // The RAILGUN engine hashes every historical commitment through
            // WASM Poseidon on first use. Progress is persisted to IndexedDB
            // (level-js) so subsequent visits resume from the saved position
            // and typically complete in seconds. First visit: 1-3 hours.
            stepActive("sync", "Building privacy index...");
            {
                const SYNC_TIMED_OUT = Symbol("SYNC_TIMED_OUT");
                // Subscribe to UTXO scan progress for real-time % display
                const unsubScanProgress = subscribeScanProgress((msg) => {
                    const pctMatch = msg.match(/(\d+)%/);
                    if (pctMatch) setSyncProgress(parseInt(pctMatch[1], 10));
                    updateStep("sync", { detail: msg });
                });
                const balanceProgressHandler = (msg: string) => {
                    // Detect when UTXO is found in pool (MissingInternalPOI / ShieldPending)
                    if (msg.includes("in pool") || msg.includes("Deposit indexed")) {
                        setUtxoInPool(true);
                    }
                    updateStep("sync", { detail: msg });
                };
                const syncRace = await Promise.race([
                    waitForRailgunBalance(
                        railgunWalletID,
                        chainId,
                        balanceProgressHandler,
                        token.tokenAddress,
                    ).then(() => null).finally(() => unsubScanProgress()),
                    new Promise<typeof SYNC_TIMED_OUT>(res =>
                        setTimeout(() => res(SYNC_TIMED_OUT), SYNC_USER_TIMEOUT_MS)
                    ),
                ]);
                if (syncRace === SYNC_TIMED_OUT) {
                    unsubScanProgress();
                    setSyncTimedOut(true);
                    return;
                }
            }
            stepDone("sync");

            // ── STEP 4: Generate unshield ZK proof (~60 s) ─────────────────
            // Use netAmount (after Railgun 0.25% fee) - this is what's in the pool.
            stepActive("proof", "Generating zero-knowledge proof (approx. 60 seconds)...");
            const unshieldTx = await buildUnshieldTx({
                chainId,
                walletID: railgunWalletID,
                encryptionKey,
                tokenAddress: token.tokenAddress,
                amount: netAmount,
                recipientEthAddress: recipient,
                onProgress: (pct) => updateStep("proof", {
                    detail: `Generating proof... ${Math.round(pct)}%`,
                    progress: pct,
                }),
            });
            stepDone("proof");

            // ── STEP 5: Deliver via QryptumSigner (private broadcaster) ────
            // QryptumSigner submits the TX so Wallet A does NOT appear as
            // `from` on Etherscan. NO fallback - broadcaster is mandatory.
            stepActive("deliver", "Routing via QryptumSigner...");

            const broadcastResult = await broadcastUnshieldTx({
                to: unshieldTx.to,
                data: unshieldTx.data as string,
                value: unshieldTx.value?.toString() ?? "0",
                chainId,
            });

            const deliverHash = broadcastResult.txHash as `0x${string}`;
            updateStep("deliver", { detail: `Relayed via QryptumSigner - sender address hidden.`, txHash: deliverHash });

            const deliverReceipt = await publicClient.waitForTransactionReceipt({ hash: deliverHash });
            if (deliverReceipt.status === "reverted") throw new Error(`Unshield transaction reverted on-chain (Invalid Snark Proof or gas too low). TX: ${deliverHash}`);
            stepDone("deliver", deliverHash);

            try {
                await recordTransaction({
                    walletAddress,
                    txHash: deliverHash,
                    type: "transfer",
                    tokenAddress: token.tokenAddress,
                    tokenSymbol: token.tokenSymbol,
                    tokenName: token.tokenName,
                    amount,
                    fromAddress: walletAddress,
                    toAddress: recipient,
                    networkId: chainId,
                });
            } catch {}

            // Clear pending state from server + localStorage - transfer complete
            setPendingTransfer(null);
            try { localStorage.removeItem(pendingKey); } catch {}
            clearRailgunPending(walletAddress, chainId, token.tokenAddress).catch(() => {});

            setDoneTxHash(deliverHash);
            setPhase("done");
            onComplete?.();

        } catch (err) {
            const msg = err instanceof Error ? err.message : "An unknown error occurred.";
            if (activeStepRef.current) stepError(activeStepRef.current, msg);
            setFatalError(msg);
            setPhase("error");
        }
    }

    if (!railgunSupported) {
        return (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
                <EyeOffIcon size={36} color="rgba(255,255,255,0.15)" style={{ margin: "0 auto 16px" }} />
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                    QryptShield is not available on this network.<br />
                    Switch to Ethereum, Polygon, Arbitrum, or BNB Chain.
                </p>
            </div>
        );
    }

    if (phase === "done") {
        return <DoneScreen txHash={doneTxHash} chainId={chainId} amount={amount} symbol={token?.tokenSymbol ?? ""} recipient={recipient} onReset={() => { setPhase("form"); setAmount(""); setVaultProof(""); setRecipient(""); }} />;
    }

    if (phase === "running" || phase === "error") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <Header />
                <Summary token={token} amount={amount} recipient={recipient} />
                <Stepper steps={steps} chainId={chainId} />
                {syncTimedOut && (
                    <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.3)" }}>
                        {utxoInPool ? (
                            <>
                                <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>
                                    Deposit found - awaiting POI validation
                                </p>
                                <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
                                    Your deposit is confirmed in the Railgun pool. It is waiting for the <strong style={{ color: "rgba(255,255,255,0.7)" }}>Proof of Innocence (POI)</strong> aggregator to validate it before it becomes spendable.
                                </p>
                                <p style={{ margin: "0 0 12px", fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                                    On mainnet this takes <strong style={{ color: "rgba(255,255,255,0.6)" }}>30-60 minutes</strong> after deposit confirmation (indexer lag + aggregator batch cycle). Your tokens are safe. Come back in 30-60 minutes and tap <strong style={{ color: "rgba(255,255,255,0.7)" }}>Resume Transfer</strong>.
                                </p>
                            </>
                        ) : (
                            <>
                                <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>
                                    Privacy index building in background
                                    {syncProgress > 0 && <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.5)" }}> — {syncProgress}% complete</span>}
                                </p>
                                <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
                                    Your tokens are safe in the Railgun pool. This panel shielded them successfully.
                                </p>
                                <p style={{ margin: "0 0 12px", fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                                    <strong style={{ color: "rgba(255,255,255,0.6)" }}>First-time setup</strong> hashes 375k+ historical commitments in your browser (~1-3 hours total). The index is saved to your browser storage so every return visit resumes from where it stopped. <strong style={{ color: "rgba(255,255,255,0.6)" }}>Second visit onwards is instant.</strong>
                                </p>
                                <p style={{ margin: "0 0 12px", fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                                    Close this panel and come back later -- tap <strong style={{ color: "rgba(255,255,255,0.7)" }}>Resume Transfer</strong> on the form to continue from where you left off.
                                </p>
                            </>
                        )}
                        <button
                            onClick={() => {
                                setSyncTimedOut(false);
                                setSyncProgress(0);
                                setUtxoInPool(false);
                                setPhase("form");
                                setSteps(INITIAL_STEPS.map(s => ({ ...s })));
                            }}
                            style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", background: "none", border: "1px solid rgba(139,92,246,0.4)", borderRadius: 8, cursor: "pointer", padding: "6px 16px" }}
                        >
                            OK, I will check back later
                        </button>
                    </div>
                )}
                {phase === "error" && fatalError && (
                    <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)" }}>
                        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#f87171" }}>Transfer failed</p>
                        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{fatalError}</p>
                        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 16 }}>
                            <button
                                onClick={() => { setPhase("form"); setSteps(INITIAL_STEPS.map(s => ({ ...s }))); }}
                                style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            >
                                Try again
                            </button>
                            <button
                                onClick={async () => {
                                    await clearZKArtifactCache();
                                    window.location.reload();
                                }}
                                style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            >
                                Clear ZK cache &amp; reload
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const pendingMatchesToken = pendingTransfer && token &&
        pendingTransfer.tokenAddress.toLowerCase() === token.tokenAddress.toLowerCase();

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Header />

            {pendingMatchesToken && (
                <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 10, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.35)", fontSize: 13, lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 700, color: PRIMARY, marginBottom: 4 }}>Pending transfer detected</div>
                    <div style={{ color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>
                        Your <strong style={{ color: "rgba(255,255,255,0.9)" }}>{pendingTransfer!.amount} {pendingTransfer!.tokenSymbol}</strong> tokens entered the Railgun pool but delivery was not completed.
                        Enter your vault password and click <strong style={{ color: "rgba(255,255,255,0.9)" }}>Resume</strong> to finish the transfer.
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                            TX: {pendingTransfer!.atomicHash.slice(0, 12)}...{pendingTransfer!.atomicHash.slice(-6)}
                        </span>
                        <a
                            href={`https://${chainId === 11155111 ? "sepolia." : ""}etherscan.io/tx/${pendingTransfer!.atomicHash}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: 11, color: PRIMARY, textDecoration: "none" }}
                        >
                            View on Etherscan
                        </a>
                    </div>
                </div>
            )}

            {!railgunSupported && (
                <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", fontSize: 13, color: "rgba(245,158,11,0.95)", lineHeight: 1.6 }}>
                    <strong>Wrong network.</strong> QryptShield requires a network where Railgun is deployed: Ethereum, Polygon, Arbitrum, BNB Chain, or Sepolia. Switch your wallet to one of those networks.
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Token selector: hidden when pre-selected from token card */}
                {!tokenLocked && (
                    <div style={{ position: "relative" }}>
                        <Label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                            Token
                        </Label>
                        <button
                            onClick={() => setShowTokenPicker(v => !v)}
                            style={{
                                width: "100%", padding: "10px 14px", borderRadius: 10,
                                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                cursor: "pointer", color: "#d4d6e2",
                            }}
                        >
                            <span style={{ fontSize: 14, fontWeight: 600 }}>
                                {token ? (
                                    <>
                                        <span style={{ color: PRIMARY }}>q{token.tokenSymbol}</span>
                                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>
                                            {token.shieldedBalance !== undefined
                                                ? `${formatUnits(token.shieldedBalance, token.decimals)} available`
                                                : "-"}
                                        </span>
                                    </>
                                ) : (
                                    <span style={{ color: "rgba(255,255,255,0.35)" }}>Select token</span>
                                )}
                            </span>
                            <ChevronDownIcon size={14} color="rgba(255,255,255,0.35)" />
                        </button>

                        {showTokenPicker && tokensWithBalances.length > 0 && (
                            <div style={{
                                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20,
                                background: "#111", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
                                overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
                            }}>
                                {tokensWithBalances.map(t => (
                                    <button
                                        key={t.tokenAddress}
                                        onClick={() => { setSelectedToken(t); setShowTokenPicker(false); }}
                                        style={{
                                            width: "100%", padding: "10px 14px",
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            background: t.tokenAddress === token?.tokenAddress ? "rgba(139,92,246,0.1)" : "transparent",
                                            border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "pointer",
                                        }}
                                    >
                                        <span style={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>q{t.tokenSymbol}</span>
                                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                                            {t.shieldedBalance !== undefined
                                                ? `${formatUnits(t.shieldedBalance, t.decimals)}`
                                                : "-"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Amount */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <Label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            Amount
                        </Label>
                        {token?.shieldedBalance !== undefined && (
                            <button
                                onClick={() => setAmount(formatUnits(token.shieldedBalance!, token.decimals))}
                                style={{ fontSize: 11, color: PRIMARY, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            >
                                Max
                            </button>
                        )}
                    </div>
                    <Input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#d4d6e2" }}
                    />
                    {exceedsBalance && (
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#f87171" }}>Exceeds your shielded balance.</p>
                    )}
                </div>

                {/* Recipient */}
                <div>
                    <Label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                        Recipient Address
                    </Label>
                    <Input
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                        placeholder="0x..."
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#d4d6e2", fontFamily: "monospace", fontSize: 13 }}
                    />
                    {recipientValid && (
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#4ade80" }}>
                            Recipient gets {token?.tokenSymbol ?? "tokens"} with no link to your address.
                        </p>
                    )}
                </div>

                {/* Net amount after Railgun fee */}
                {parsedAmount > 0n && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Railgun fee (0.25%)</span>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                                {formatUnits(parsedAmount * 25n / 10000n, decimals)} {token?.tokenSymbol}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>Recipient receives</span>
                            <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 700 }}>
                                {formatUnits(netAmount, decimals)} {token?.tokenSymbol}
                            </span>
                        </div>
                    </div>
                )}

                {/* Vault proof */}
                <div>
                    <Label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                        Vault Proof
                    </Label>
                    <div style={{ position: "relative" }}>
                        <Input
                            type={showProof ? "text" : "password"}
                            value={vaultProof}
                            onChange={e => setVaultProof(e.target.value)}
                            placeholder="abc123"
                            maxLength={6}
                            autoComplete="new-password"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#d4d6e2", fontFamily: "monospace", textAlign: "center", letterSpacing: "0.2em", fontSize: 18, paddingRight: 40 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowProof(v => !v)}
                            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)" }}
                        >
                            {showProof ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                        </button>
                    </div>
                    {vaultProof.length > 0 && !proofValid && (
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#f59e0b" }}>3 letters + 3 numbers (e.g. abc123)</p>
                    )}
                </div>

                {/* Privacy info */}
                <div style={{ display: "flex", gap: 8 }}>
                    {[
                        { label: "Anonymity Set", value: chainId === 11155111 ? "Testnet" : "14,000+ txs" },
                        { label: "On-chain Link", value: "None" },
                        { label: "Pool", value: "Railgun ZK" },
                    ].map(s => (
                        <div key={s.label} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", textAlign: "center" }}>
                            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", margin: "0 0 2px", letterSpacing: "0.05em", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0, fontWeight: 700 }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!canSend || !walletClient}
                    style={{
                        width: "100%", padding: "14px 0", borderRadius: 12,
                        background: canSend && walletClient ? PRIMARY : "rgba(139,92,246,0.2)",
                        border: "none", cursor: canSend && walletClient ? "pointer" : "not-allowed",
                        color: "#d4d6e2", fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                >
                    <EyeOffIcon size={16} />
                    {pendingMatchesToken ? "Resume Transfer" : "Send Privately"}
                </button>

                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
                    Your wallet will ask for 2 confirmations: one atomic vault-to-Railgun TX, then the ZK delivery.
                    No link between your address and the recipient will appear on-chain.
                </p>
            </div>
        </div>
    );
}

function Header() {
    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", marginBottom: 20,
            background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EyeOffIcon size={14} color={PRIMARY} />
                <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>QryptShield</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Railgun ZK Privacy</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 20, padding: "3px 10px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: PRIMARY, display: "inline-block" }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: PRIMARY }}>Privacy Mode</span>
            </div>
        </div>
    );
}

function Summary({ token, amount, recipient }: { token: ShieldedToken | null; amount: string; recipient: string }) {
    const rows = [
        { label: "From", value: "Qrypt-Safe Vault", sub: token ? `q${token.tokenSymbol}` : "" },
        { label: "Token", value: token ? `${amount} ${token.tokenSymbol}` : "-" },
        { label: "To", value: recipient ? `${recipient.slice(0, 8)}...${recipient.slice(-6)}` : "-" },
    ];
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, marginBottom: 20 }}>
            {rows.map(row => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", width: 50, flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{row.value}</span>
                    {row.sub && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{row.sub}</span>}
                </div>
            ))}
        </div>
    );
}

function Stepper({ steps, chainId }: { steps: Step[]; chainId: number }) {
    const etherscanTx: Record<number, string> = {
        1: "https://etherscan.io/tx/",
        11155111: "https://sepolia.etherscan.io/tx/",
        137: "https://polygonscan.com/tx/",
        42161: "https://arbiscan.io/tx/",
        56: "https://bscscan.com/tx/",
    };
    const txBase = etherscanTx[chainId] ?? "https://sepolia.etherscan.io/tx/";
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {steps.map((step, i) => {
                const isLast = i === steps.length - 1;
                const color = step.status === "done" ? "#4ade80"
                    : step.status === "active" ? PRIMARY
                    : step.status === "error" ? "#f87171"
                    : "rgba(255,255,255,0.2)";

                return (
                    <div key={step.id} style={{ display: "flex", gap: 14, paddingBottom: isLast ? 0 : 18 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: step.status === "done" ? "rgba(74,222,128,0.1)"
                                    : step.status === "active" ? "rgba(139,92,246,0.12)"
                                    : step.status === "error" ? "rgba(248,113,113,0.1)"
                                    : "rgba(255,255,255,0.03)",
                                border: `1px solid ${color}40`,
                                flexShrink: 0,
                            }}>
                                {step.status === "done" && <CheckCircle2Icon size={15} color="#4ade80" />}
                                {step.status === "active" && <LoaderIcon size={15} color={PRIMARY} style={{ animation: "spin 1.2s linear infinite" }} />}
                                {step.status === "error" && <AlertCircleIcon size={15} color="#f87171" />}
                                {step.status === "pending" && <ClockIcon size={15} color="rgba(255,255,255,0.2)" />}
                            </div>
                            {!isLast && (
                                <div style={{
                                    width: 1, flex: 1, minHeight: 8,
                                    background: step.status === "done" ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)",
                                    marginTop: 4,
                                }} />
                            )}
                        </div>
                        <div style={{ flex: 1, paddingTop: 4, paddingBottom: isLast ? 0 : 4 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color, margin: "0 0 2px" }}>{step.label}</p>
                            {step.detail && (
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.4 }}>{step.detail}</p>
                            )}
                            {step.txHash && (
                                <a
                                    href={`${txBase}${step.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: 10, color: "#60a5fa", marginTop: 2, display: "inline-block" }}
                                >
                                    {step.txHash.slice(0, 10)}... ↗
                                </a>
                            )}
                            {step.status === "active" && step.progress !== undefined && (
                                <div style={{ marginTop: 8, height: 3, background: "rgba(139,92,246,0.12)", borderRadius: 99, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${step.progress}%`, background: PRIMARY, borderRadius: 99, transition: "width 0.5s" }} />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function DoneScreen({ txHash, chainId, amount, symbol, recipient, onReset }: {
    txHash: string; chainId: number; amount: string; symbol: string; recipient: string; onReset: () => void;
}) {
    const etherscanBase: Record<number, string> = {
        1: "https://etherscan.io", 11155111: "https://sepolia.etherscan.io",
        137: "https://polygonscan.com", 42161: "https://arbiscan.io", 56: "https://bscscan.com",
    };
    const base = etherscanBase[chainId] ?? "https://etherscan.io";
    return (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
            }}>
                <ShieldIcon size={28} color={PRIMARY} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#d4d6e2", margin: "0 0 8px" }}>
                Delivered Privately
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 4px" }}>
                {amount} {symbol} sent to {recipient.slice(0, 8)}...{recipient.slice(-6)}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: "0 0 24px", lineHeight: 1.5 }}>
                No on-chain record links your Qrypt-Safe to the recipient.
            </p>
            <Button onClick={onReset} style={{ background: PRIMARY, border: "none", color: "#d4d6e2", marginBottom: 16 }}>
                New Transfer
            </Button>
            {txHash && (
                <div>
                    <a
                        href={`${base}/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "#60a5fa", display: "inline-block" }}
                    >
                        View delivery proof on explorer ↗
                    </a>
                </div>
            )}
        </div>
    );
}
