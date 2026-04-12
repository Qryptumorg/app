/**
 * Railgun integration — built from scratch following official docs:
 * https://docs.railgun.org/developer-guide/wallet/getting-started
 *
 * Key changes from previous implementation:
 * - level-js (IndexedDB) replaces custom in-memory LevelDOWN → wallet persists across sessions
 * - IndexedDB artifact store → ZK circuit files cached, no re-download each session
 * - FallbackProviderJsonConfig with multiple RPCs → resilient to single RPC failures
 * - Groth16 prover loaded from window.snarkjs (script tag in index.html)
 * - setOnBalanceUpdateCallback → event-driven, no polling loop
 */

import {
    startRailgunEngine,
    loadProvider,
    createRailgunWallet,
    loadWalletByID,
    getRailgunAddress,
    getShieldPrivateKeySignatureMessage,
    populateShield,
    generateUnshieldProof,
    populateProvedUnshield,
    fullWalletForID,
    balanceForERC20Token,
    refreshBalances,
    rescanFullUTXOMerkletreesAndWallets,
    ArtifactStore,
    setOnUTXOMerkletreeScanCallback,
    setOnTXIDMerkletreeScanCallback,
    setOnBalanceUpdateCallback,
    getProver,
    type SnarkJSGroth16,
} from "@railgun-community/wallet";
import {
    NetworkName,
    TXIDVersion,
    type RailgunBalancesEvent,
    type FallbackProviderJsonConfig,
} from "@railgun-community/shared-models";

export { NetworkName, TXIDVersion };

// ─── Network config ───────────────────────────────────────────────────────────

export const RAILGUN_CHAIN_MAP: Partial<Record<number, NetworkName>> = {
    1: NetworkName.Ethereum,
    137: NetworkName.Polygon,
    56: NetworkName.BNBChain,
    42161: NetworkName.Arbitrum,
    11155111: NetworkName.EthereumSepolia,
};

/**
 * Step 2 — Multi-RPC FallbackProviderJsonConfig per network.
 * Multiple providers with priority/weight for resilience.
 * https://docs.railgun.org/developer-guide/wallet/getting-started/2.-setting-up-networks-and-rpc-providers
 */
const NETWORK_PROVIDERS: Partial<Record<number, FallbackProviderJsonConfig>> = {
    1: {
        chainId: 1,
        providers: [
            { provider: "https://eth.llamarpc.com", priority: 1, weight: 2 },
            { provider: "https://rpc.ankr.com/eth", priority: 2, weight: 1 },
            { provider: "https://cloudflare-eth.com", priority: 3, weight: 1 },
        ],
    },
    137: {
        chainId: 137,
        providers: [
            { provider: "https://polygon.llamarpc.com", priority: 1, weight: 2 },
            { provider: "https://rpc.ankr.com/polygon", priority: 2, weight: 1 },
        ],
    },
    56: {
        chainId: 56,
        providers: [
            { provider: "https://binance.llamarpc.com", priority: 1, weight: 2 },
            { provider: "https://rpc.ankr.com/bsc", priority: 2, weight: 1 },
        ],
    },
    42161: {
        chainId: 42161,
        providers: [
            { provider: "https://arbitrum.llamarpc.com", priority: 1, weight: 2 },
            { provider: "https://rpc.ankr.com/arbitrum", priority: 2, weight: 1 },
        ],
    },
    11155111: {
        chainId: 11155111,
        providers: [
            { provider: "https://ethereum-sepolia-rpc.publicnode.com", priority: 1, weight: 2 },
            { provider: "https://rpc.sepolia.org", priority: 2, weight: 1 },
            { provider: "https://rpc2.sepolia.org", priority: 3, weight: 1 },
            { provider: "https://sepolia.drpc.org", priority: 4, weight: 1 },
        ],
    },
};

// Fallback single-URL for any network not in NETWORK_PROVIDERS
const FALLBACK_RPC: Partial<Record<number, string>> = {
    1: "https://eth.llamarpc.com",
    137: "https://polygon.llamarpc.com",
    56: "https://binance.llamarpc.com",
    42161: "https://arbitrum.llamarpc.com",
    11155111: "https://ethereum-sepolia-rpc.publicnode.com",
};

export const PUBLIC_RPC = FALLBACK_RPC;

// ─── Step 3 — IndexedDB artifact store ───────────────────────────────────────
/**
 * Persistent artifact store using IndexedDB.
 * ZK circuit artifacts are large (>10 MB) and must be cached across sessions.
 * https://docs.railgun.org/developer-guide/wallet/getting-started/4.-build-a-persistent-store-for-artifact-downloads
 */
function createArtifactStore(): ArtifactStore {
    const DB_NAME = "qryptum-artifacts";
    const STORE_NAME = "files";
    let _db: IDBDatabase | null = null;

    function openDB(): Promise<IDBDatabase> {
        if (_db) return Promise.resolve(_db);
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = () => {
                req.result.createObjectStore(STORE_NAME);
            };
            req.onsuccess = () => {
                _db = req.result;
                resolve(req.result);
            };
            req.onerror = () => reject(req.error);
        });
    }

    const getFile = async (path: string): Promise<string | Buffer | null> => {
        try {
            const db = await openDB();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, "readonly");
                const req = tx.objectStore(STORE_NAME).get(path);
                req.onsuccess = () => resolve((req.result as string | Buffer | null) ?? null);
                req.onerror = () => resolve(null);
            });
        } catch {
            return null;
        }
    };

    const storeFile = async (_dir: string, path: string, item: string | Buffer): Promise<void> => {
        try {
            const db = await openDB();
            await new Promise<void>((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, "readwrite");
                tx.objectStore(STORE_NAME).put(item, path);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch {
            // best effort — if IDB fails, SDK will re-download next time
        }
    };

    const fileExists = async (path: string): Promise<boolean> => {
        try {
            const db = await openDB();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, "readonly");
                const req = tx.objectStore(STORE_NAME).count(IDBKeyRange.only(path));
                req.onsuccess = () => resolve(req.result > 0);
                req.onerror = () => resolve(false);
            });
        } catch {
            return false;
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new ArtifactStore(getFile as any, storeFile, fileExists);
}

/**
 * Delete the ZK circuit artifact cache (WASM + zkey files) stored in IndexedDB.
 * Call this when "Invalid Snark Proof" is received — it forces fresh circuit
 * downloads on next engine init, which fixes corrupted/outdated artifact caches.
 * Does NOT delete the Railgun wallet DB (wallet data is preserved).
 */
export async function clearZKArtifactCache(): Promise<void> {
    return new Promise<void>((resolve) => {
        try {
            const req = indexedDB.deleteDatabase("qryptum-artifacts");
            req.onsuccess = () => resolve();
            req.onerror = () => resolve(); // best effort — proceed even on error
            req.onblocked = () => resolve();
        } catch {
            resolve();
        }
    });
}

// ─── Engine state machine ─────────────────────────────────────────────────────

const WALLET_ID_KEY = "qryptum_rg_wallet_id";

let engineState: "idle" | "initializing" | "ready" | "error" = "idle";
let engineError: Error | null = null;
const engineWaiters: Array<{ resolve: () => void; reject: (e: Error) => void }> = [];

/**
 * Steps 3–6 combined: initialize DB, artifact store, engine, and Groth16 prover.
 * Idempotent — safe to call multiple times.
 */
export async function ensureRailgunEngine(onProgress?: (msg: string) => void): Promise<void> {
    if (engineState === "ready") return;

    if (engineState === "initializing") {
        return new Promise((resolve, reject) => engineWaiters.push({ resolve, reject }));
    }

    if (engineState === "error") {
        // Engine failed to start — DB may be in a partial state.
        // A full page reload is the only safe way to recover.
        throw new Error(
            (engineError?.message ?? "Railgun engine failed to start.") +
            " Please reload the page and try again."
        );
    }

    engineState = "initializing";
    try {
        onProgress?.("Loading privacy engine...");

        // Step 3 — Database: level-js → persists wallet in IndexedDB
        // https://docs.railgun.org/developer-guide/wallet/getting-started/3.-set-up-database
        const LevelDB = (await import("level-js")).default;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = new LevelDB("qryptum-engine") as unknown as any;

        // Step 4 — Persistent artifact store (IndexedDB)
        const artifactStore = createArtifactStore();

        onProgress?.("Starting Railgun engine...");

        // Step 5 — Start engine
        // https://docs.railgun.org/developer-guide/wallet/getting-started/5.-start-the-railgun-privacy-engine
        //
        // POI node: Railgun's official public POI aggregator.
        // Without a POI node, shielded UTXOs stay in "ShieldPending" / "MissingInternalPOI"
        // bucket forever and can never be spent. This node verifies fund innocence so
        // UTXOs move to the "Spendable" bucket.
        // Serves Ethereum Mainnet (txidIndex 101,851+) and Sepolia.
        const poiNodeURLs = ["https://ppoi-agg.horsewithsixlegs.xyz"];

        await startRailgunEngine(
            "qryptum",      // walletSource — max 16 chars, lowercase
            db,
            false,          // shouldDebug
            artifactStore,
            false,          // useNativeArtifacts (browser = false)
            false,          // skipMerkletreeScans
            poiNodeURLs,
        );

        // Step 6 — Load Groth16 prover for browser
        // snarkjs.min.js is loaded async in index.html — wait up to 30s for it to be ready.
        // https://docs.railgun.org/developer-guide/wallet/getting-started/6.-load-a-groth16-prover-for-each-platform
        const groth16 = await (async () => {
            const win = window as unknown as { snarkjs?: { groth16: SnarkJSGroth16 } };
            if (win.snarkjs?.groth16) return win.snarkjs.groth16;
            // Poll every 100ms until snarkjs is available (async script may still be loading)
            return new Promise<SnarkJSGroth16>((resolve, reject) => {
                const deadline = Date.now() + 30_000;
                const id = setInterval(() => {
                    if (win.snarkjs?.groth16) {
                        clearInterval(id);
                        resolve(win.snarkjs.groth16);
                    } else if (Date.now() > deadline) {
                        clearInterval(id);
                        reject(new Error(
                            "ZK prover (snarkjs) failed to load within 30s. " +
                            "Try a hard refresh (Ctrl+Shift+R)."
                        ));
                    }
                }, 100);
            });
        })();
        getProver().setSnarkJSGroth16(groth16);

        // Scan progress callbacks — fires during UTXO + TXID Merkle tree scans
        // Consumers subscribe via subscribeScanProgress() below
        setOnUTXOMerkletreeScanCallback((data) => {
            const pct = Math.round((data.progress ?? 0) * 100);
            _scanListeners.forEach(cb => cb(`Scanning UTXO tree... ${pct}%`));
        });
        setOnTXIDMerkletreeScanCallback((data) => {
            const pct = Math.round((data.progress ?? 0) * 100);
            _scanListeners.forEach(cb => cb(`Scanning TXID tree... ${pct}%`));
        });

        // Balance update callback — fires whenever a scan completes
        // Consumers subscribe via subscribeBalanceUpdate() below
        setOnBalanceUpdateCallback((event: RailgunBalancesEvent) => {
            _balanceListeners.forEach(cb => cb(event));
        });

        engineState = "ready";
        engineWaiters.forEach(w => w.resolve());
        engineWaiters.length = 0;
    } catch (err) {
        engineState = "error";
        engineError = err instanceof Error ? err : new Error("Railgun engine init failed");
        engineWaiters.forEach(w => w.reject(engineError!));
        engineWaiters.length = 0;
        throw engineError;
    }
}

// ─── Scan progress event bus ──────────────────────────────────────────────────

type ScanListener = (msg: string) => void;
const _scanListeners: Set<ScanListener> = new Set();

/** Subscribe to UTXO + TXID Merkle tree scan progress messages. Returns unsub fn. */
export function subscribeScanProgress(cb: ScanListener): () => void {
    _scanListeners.add(cb);
    return () => _scanListeners.delete(cb);
}

// ─── Balance event bus ────────────────────────────────────────────────────────

type BalanceListener = (event: RailgunBalancesEvent) => void;
const _balanceListeners: Set<BalanceListener> = new Set();

export function subscribeBalanceUpdate(cb: BalanceListener): () => void {
    _balanceListeners.add(cb);
    return () => _balanceListeners.delete(cb);
}

// ─── Step 8 — Connect network providers ──────────────────────────────────────

// Track which chainIds already have a provider loaded — loadProvider triggers
// a fresh merkletree scan each call, so we must call it exactly once per chain.
const _loadedProviders = new Set<number>();

/**
 * https://docs.railgun.org/developer-guide/wallet/getting-started/8.-connect-engine-network-providers.
 * loadProvider kicks off the initial merkletree scan. Idempotent per chainId.
 */
export async function loadRailgunProvider(chainId: number, onProgress?: (msg: string) => void): Promise<void> {
    const networkName = RAILGUN_CHAIN_MAP[chainId];
    if (!networkName) throw new Error(`QryptShield is not available on this network (chainId ${chainId}).`);

    // Already loaded for this chain — skip to avoid duplicate scans
    if (_loadedProviders.has(chainId)) return;

    const config = NETWORK_PROVIDERS[chainId];
    if (!config) throw new Error(`No RPC configured for chainId ${chainId}.`);

    onProgress?.("Connecting to network...");

    // 5 min polling interval as recommended in docs
    await loadProvider(config as Parameters<typeof loadProvider>[0], networkName, 5 * 60 * 1000);
    _loadedProviders.add(chainId);
}

// ─── Wallet management ────────────────────────────────────────────────────────

export function deriveEncryptionKey(signature: string): string {
    const hex = signature.startsWith("0x") ? signature.slice(2) : signature;
    return `0x${hex.slice(0, 64).padEnd(64, "0")}`;
}

/**
 * Load existing wallet from persistent DB, or create a new one.
 * With level-js (IndexedDB), loadWalletByID works across page reloads
 * — no timeout workaround needed.
 */
export async function getOrCreateRailgunWallet(
    walletAddress: string,
    encryptionKey: string,
    chainId?: number,
    onProgress?: (msg: string) => void,
): Promise<string> {
    const key = `${WALLET_ID_KEY}_${walletAddress.toLowerCase()}`;
    const rawKey = encryptionKey.startsWith("0x") ? encryptionKey.slice(2) : encryptionKey;
    const existingID = localStorage.getItem(key);

    if (existingID) {
        try {
            onProgress?.("Loading your privacy wallet...");
            const info = await loadWalletByID(rawKey, existingID, false);
            return info.id;
        } catch {
            // Wallet not in DB (e.g. IndexedDB was cleared) — fall through to create
            localStorage.removeItem(key);
        }
    }

    onProgress?.("Creating your privacy wallet...");
    const { ethers } = await import("ethers");
    const entropy = ethers.keccak256(
        ethers.solidityPacked(["address", "bytes32"], [walletAddress, encryptionKey])
    );
    const mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.getBytes(entropy));

    // creationBlockNumbers: scan the last 1,000 blocks (~3.3 h on Sepolia) for recent deposits.
    // With persistent DB this only runs once — subsequent loads use loadWalletByID.
    let creationBlockNumbers: Record<string, number> | null = null;
    const networkName = chainId ? RAILGUN_CHAIN_MAP[chainId] : undefined;
    const rpcUrl = chainId ? FALLBACK_RPC[chainId] : undefined;
    if (networkName && rpcUrl) {
        try {
            const { JsonRpcProvider } = await import("ethers");
            const provider = new JsonRpcProvider(rpcUrl);
            const currentBlock = await provider.getBlockNumber();
            creationBlockNumbers = { [networkName]: Math.max(0, currentBlock - 1_000) };
        } catch {
            // Continue without block range optimization
        }
    }

    const info = await createRailgunWallet(rawKey, mnemonic, creationBlockNumbers);
    localStorage.setItem(key, info.id);
    return info.id;
}

export function getRailgunWalletAddress(walletID: string): string {
    const addr = getRailgunAddress(walletID);
    if (!addr) throw new Error("Could not derive Railgun wallet address.");
    return addr;
}

export function getShieldSignMessage(): string {
    return getShieldPrivateKeySignatureMessage();
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function buildShieldTx(params: {
    chainId: number;
    shieldPrivateKey: string;
    railgunAddress: string;
    tokenAddress: string;
    amount: bigint;
    walletAddress: string;
}) {
    const networkName = RAILGUN_CHAIN_MAP[params.chainId];
    if (!networkName) throw new Error("Unsupported network for Railgun.");

    const response = await populateShield(
        TXIDVersion.V2_PoseidonMerkle,
        networkName,
        params.shieldPrivateKey,
        [{ tokenAddress: params.tokenAddress, amount: params.amount, recipientAddress: params.railgunAddress }],
        [],
    );

    if (!response.transaction) throw new Error("Shield TX construction returned empty.");
    return response.transaction;
}

export async function buildUnshieldTx(params: {
    chainId: number;
    walletID: string;
    encryptionKey: string;
    tokenAddress: string;
    amount: bigint;
    recipientEthAddress: string;
    onProgress?: (pct: number) => void;
}) {
    const networkName = RAILGUN_CHAIN_MAP[params.chainId];
    if (!networkName) throw new Error("Unsupported network for Railgun.");

    const erc20Recipients = [{
        tokenAddress: params.tokenAddress,
        amount: params.amount,
        recipientAddress: params.recipientEthAddress,
    }];

    const rawKey = params.encryptionKey.startsWith("0x") ? params.encryptionKey.slice(2) : params.encryptionKey;

    // Step: generate ZK proof (Groth16, ~30–60 s in browser)
    await generateUnshieldProof(
        TXIDVersion.V2_PoseidonMerkle,
        networkName,
        params.walletID,
        rawKey,
        erc20Recipients,
        [],
        undefined,
        true,  // sendWithPublicWallet — no broadcaster, user submits TX
        undefined,
        (progress: number) => params.onProgress?.(progress),
    );

    // Railgun ZK verifier is very gas-heavy. 500k causes reverts.
    // 1.5M gives enough headroom for Groth16 verification on-chain.
    const gasDetails = {
        evmGasType: 2,
        gasEstimate: 1_500_000n,
        maxFeePerGas: 30_000_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (populateProvedUnshield as unknown as (...a: any[]) => Promise<any>)(
        TXIDVersion.V2_PoseidonMerkle,
        networkName,
        params.walletID,
        erc20Recipients,
        [],
        undefined,
        true,
        undefined,
        gasDetails,
    );

    if (!response.transaction) throw new Error("Unshield TX construction returned empty.");
    return response.transaction as { to: string; data: string; value: { toString(): string } };
}

// ─── Balance helpers ──────────────────────────────────────────────────────────

async function checkRailgunBalance(
    walletID: string,
    networkName: NetworkName,
    tokenAddress: string,
    onlySpendable = false,
): Promise<bigint> {
    try {
        const wallet = fullWalletForID(walletID);
        return await balanceForERC20Token(
            TXIDVersion.V2_PoseidonMerkle,
            wallet,
            networkName,
            tokenAddress,
            onlySpendable,
        );
    } catch {
        return 0n;
    }
}

export async function hasRailgunBalance(
    walletID: string,
    chainId: number,
    tokenAddress: string,
): Promise<boolean> {
    try {
        const { ChainType } = await import("@railgun-community/shared-models");
        const networkName = RAILGUN_CHAIN_MAP[chainId];
        if (!networkName) return false;

        // Fast path: SDK may already have balance cached
        const immediate = await checkRailgunBalance(walletID, networkName, tokenAddress);
        if (immediate > 0n) return true;

        const chain = { type: ChainType.EVM, id: chainId };

        // Trigger a scan then wait for balance update event (max 30 s)
        return new Promise<boolean>((resolve) => {
            const timer = setTimeout(() => {
                unsub();
                resolve(false);
            }, 30_000);

            const unsub = subscribeBalanceUpdate(async () => {
                try {
                    const bal = await checkRailgunBalance(walletID, networkName, tokenAddress);
                    if (bal > 0n) {
                        clearTimeout(timer);
                        unsub();
                        resolve(true);
                    }
                } catch {
                    // balance check failed — keep waiting until timeout
                }
            });

            // Trigger scan after subscribing
            refreshBalances(chain, [walletID]).catch(() => { /* best effort */ });
        });
    } catch {
        // Any unexpected error (import failure, SDK not ready) → treat as no balance
        return false;
    }
}

/**
 * Wait for a freshly deposited token to appear in the Railgun pool and become spendable.
 *
 * Strategy:
 * 1. Subscribe to scan progress (UTXO + TXID trees) for real-time % feedback.
 * 2. On each balance update event, check:
 *    a. ANY bucket balance (committed) — token found in tree at all?
 *    b. Spendable bucket — ready for ZK proof?
 * 3. If committed but NOT spendable after 3-minute grace period, resolve anyway.
 *    This handles "ShieldPending" / "MissingInternalPOI" buckets on testnet where
 *    POI may not auto-clear. The ZK proof step will fail with a clearer error if needed.
 * 4. Hard timeout: 12 minutes.
 */
export async function waitForRailgunBalance(
    walletID: string,
    chainId: number,
    onProgress?: (msg: string) => void,
    tokenAddress?: string,
): Promise<void> {
    const { ChainType } = await import("@railgun-community/shared-models").catch(() => {
        throw new Error("Failed to load Railgun shared models. Try refreshing the page.");
    });
    const networkName = RAILGUN_CHAIN_MAP[chainId];
    const chain = { type: ChainType.EVM, id: chainId };

    const HARD_TIMEOUT_MS = 12 * 60 * 1_000;
    const startedAt = Date.now();
    let committedAt: number | null = null;

    function elapsed() {
        const s = Math.floor((Date.now() - startedAt) / 1000);
        const m = Math.floor(s / 60);
        return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
    }

    // Fast path — balance already spendable (resume scenario)
    if (tokenAddress && networkName) {
        const immediate = await checkRailgunBalance(walletID, networkName, tokenAddress, true);
        if (immediate > 0n) {
            onProgress?.("Pool balance confirmed — proceeding to proof.");
            return;
        }
        // Also check non-spendable fast path (already committed, just waiting for Spendable)
        const anyBucket = await checkRailgunBalance(walletID, networkName, tokenAddress, false);
        if (anyBucket > 0n) {
            committedAt = Date.now();
            onProgress?.("Deposit indexed — waiting for Spendable confirmation...");
        }
    }

    onProgress?.("Syncing Railgun pool (this may take a few minutes)...");

    return new Promise<void>((resolve, reject) => {
        // Hard timeout
        const hardTimer = setTimeout(() => {
            cleanup();
            // Distinguish: did we find the UTXO (in some bucket) or never find it?
            if (committedAt !== null) {
                reject(new Error(
                    "Your UTXO is in the Railgun pool but not yet Spendable after 12 minutes. " +
                    "This is a shield maturity / POI delay — your tokens are safe. " +
                    "Close this dialog and try QryptShield again in 5–10 minutes."
                ));
            } else {
                reject(new Error(
                    "Railgun pool sync timed out — UTXO not indexed after 12 minutes. " +
                    "Your tokens are safe in the Railgun pool — do not retry the deposit. " +
                    "Close this dialog and try QryptShield again (it will resume from Step 3)."
                ));
            }
        }, HARD_TIMEOUT_MS);

        // Show real scan % from the global scan progress bus
        const unsubScan = subscribeScanProgress((msg) => {
            onProgress?.(msg + ` (${elapsed()})`);
        });

        // Trigger first scan immediately (incremental — fast)
        refreshBalances(chain, [walletID]).catch(() => { /* best effort */ });

        // Re-trigger scan every 20 s.
        // If UTXO has been found in non-Spendable bucket for > 2 min, escalate to
        // full rescan which fixes corrupted local index (Railway's "Clear & Rescan").
        const FULL_RESCAN_AFTER_MS = 2 * 60 * 1_000;
        let fullRescanTriggered = false;
        const ticker = setInterval(() => {
            if (
                committedAt !== null &&
                !fullRescanTriggered &&
                Date.now() - committedAt > FULL_RESCAN_AFTER_MS
            ) {
                fullRescanTriggered = true;
                onProgress?.("UTXO stuck in ShieldPending — triggering full index rescan...");
                rescanFullUTXOMerkletreesAndWallets(chain, [walletID])
                    .catch(() => { /* best effort */ });
            } else {
                refreshBalances(chain, [walletID]).catch(() => { /* best effort */ });
            }
        }, 20_000);

        function cleanup() {
            clearTimeout(hardTimer);
            clearInterval(ticker);
            unsubScan();
            unsubBalance();
        }

        // eslint-disable-next-line prefer-const
        let unsubBalance: () => void;

        unsubBalance = subscribeBalanceUpdate(async (event: RailgunBalancesEvent) => {
            if (event.railgunWalletID !== walletID) return;

            if (!tokenAddress || !networkName) {
                cleanup();
                resolve();
                return;
            }

            // Check ALL buckets (ShieldPending, Spendable, MissingInternalPOI, etc.)
            const committed = await checkRailgunBalance(walletID, networkName, tokenAddress, false);
            if (committed === 0n) return; // not in any bucket yet

            // Record when we first found it
            if (committedAt === null) {
                committedAt = Date.now();
                onProgress?.(`Deposit indexed in pool (${elapsed()}) — waiting for Spendable...`);
            }

            // Check Spendable bucket
            const spendable = await checkRailgunBalance(walletID, networkName, tokenAddress, true);
            if (spendable > 0n) {
                cleanup();
                onProgress?.("Pool balance spendable — proceeding to proof.");
                resolve();
                return;
            }

            // UTXO found but not Spendable yet — update progress, keep waiting.
            // This means it is in ShieldPending / MissingInternalPOI bucket.
            // The SDK will move it to Spendable once the shield maturity period passes
            // (typically ~5–15 minutes on Sepolia). Do NOT proceed early — the proof
            // step will fail with "balance too low" if Spendable is still 0.
            const sinceCommit = committedAt !== null
                ? Math.floor((Date.now() - committedAt) / 1000)
                : 0;
            onProgress?.(
                `UTXO found in pool (maturing… ${sinceCommit}s). ` +
                `Waiting for Spendable confirmation. (${elapsed()})`
            );
        });
    });
}

