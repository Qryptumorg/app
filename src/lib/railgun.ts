/**
 * Railgun integration - built from scratch following official docs:
 * https://docs.railgun.org/developer-guide/wallet/getting-started
 *
 * Key changes from previous implementation:
 * - level-js (IndexedDB) replaces custom in-memory LevelDOWN → wallet persists across sessions
 * - IndexedDB artifact store → ZK circuit files cached, no re-download each session
 * - FallbackProviderJsonConfig with multiple RPCs → resilient to single RPC failures
 * - Groth16 prover injected dynamically - NOT loaded at page boot (saves 676KB on startup)
 * - setOnBalanceUpdateCallback → event-driven, no polling loop
 * - @railgun-community/wallet is lazy-loaded - only downloads when user first shields
 */

import type { SnarkJSGroth16 } from "@railgun-community/wallet";
import {
    NetworkName,
    TXIDVersion,
    type RailgunBalancesEvent,
    type FallbackProviderJsonConfig,
} from "@railgun-community/shared-models";

// ─── Lazy loader for @railgun-community/wallet ────────────────────────────────
// The wallet SDK is WASM-heavy. It is NOT imported statically so it is kept out
// of the initial JS bundle entirely. The chunk only downloads the first time
// ensureRailgunEngine() is called (i.e. when user actually needs to shield).
type WalletPkg = typeof import("@railgun-community/wallet");
let _wp: WalletPkg | null = null;
async function wp(): Promise<WalletPkg> {
    if (!_wp) _wp = await import("@railgun-community/wallet");
    return _wp;
}
// Synchronous accessor - only valid AFTER wp() has resolved at least once.
// Safe to call inside any function that runs after ensureRailgunEngine() completes.
function wpSync(): WalletPkg {
    if (!_wp) throw new Error("Railgun wallet package not yet loaded. Call ensureRailgunEngine() first.");
    return _wp;
}

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
 * Step 2 - Multi-RPC FallbackProviderJsonConfig per network.
 * Multiple providers with priority/weight for resilience.
 * https://docs.railgun.org/developer-guide/wallet/getting-started/2.-setting-up-networks-and-rpc-providers
 */
const NETWORK_PROVIDERS: Partial<Record<number, FallbackProviderJsonConfig>> = {
    1: {
        chainId: 1,
        providers: [
            // dRPC paid (via Railway proxy) injected at priority 1 in loadRailgunProvider.
            // Static fallbacks start at priority 2.
            { provider: "https://ethereum-rpc.publicnode.com", priority: 2, weight: 4 },
            { provider: "https://eth.llamarpc.com",            priority: 3, weight: 2 },
            { provider: "https://1rpc.io/eth",                 priority: 4, weight: 1 },
            // Infura ~890ms from most regions — last-resort fallback
            { provider: "https://mainnet.infura.io/v3/2002e3032d0d4a62b933ed350e51de7c", priority: 5, weight: 1 },
            { provider: "https://rpc.ankr.com/eth",            priority: 6, weight: 1 },
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
    1: "https://mainnet.infura.io/v3/2002e3032d0d4a62b933ed350e51de7c",
    137: "https://polygon.llamarpc.com",
    56: "https://binance.llamarpc.com",
    42161: "https://arbitrum.llamarpc.com",
    11155111: "https://ethereum-sepolia-rpc.publicnode.com",
};

export const PUBLIC_RPC = FALLBACK_RPC;

/**
 * Compute the Qryptum API base URL (same logic as api.ts).
 * Used to build the mainnet RPC proxy URL so the private RPC key stays server-side.
 */
function getApiBase(): string {
    const rawBase = (import.meta.env.VITE_API_BASE as string | undefined)
        ?.replace(/\/api\/?$/, "")
        ?.replace(/\/$/, "");
    if (rawBase) return `${rawBase}/api`;
    if (import.meta.env.DEV) return `${import.meta.env.BASE_URL}api`;
    return "https://qryptum-api.up.railway.app/api";
}

/** POST /api/rpc/1 - server-side proxy to private MAINNET_RPC_URL. */
function getMainnetRpcProxyUrl(): string {
    return `${getApiBase()}/rpc/1`;
}

/** POST /api/rpc/drpc - server-side proxy to dRPC paid endpoint (DRPC_API_KEY on Railway). */
function getDrpcProxyUrl(): string {
    return `${getApiBase()}/rpc/drpc`;
}

// ─── Step 3 - IndexedDB artifact store ───────────────────────────────────────
/**
 * Persistent artifact store using IndexedDB.
 * ZK circuit artifacts are large (>10 MB) and must be cached across sessions.
 * https://docs.railgun.org/developer-guide/wallet/getting-started/4.-build-a-persistent-store-for-artifact-downloads
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createArtifactStore(): any {
    const { ArtifactStore } = wpSync();
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
            // best effort - if IDB fails, SDK will re-download next time
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
 * Call this when "Invalid Snark Proof" is received - it forces fresh circuit
 * downloads on next engine init, which fixes corrupted/outdated artifact caches.
 * Does NOT delete the Railgun wallet DB (wallet data is preserved).
 */
export async function clearZKArtifactCache(): Promise<void> {
    return new Promise<void>((resolve) => {
        try {
            const req = indexedDB.deleteDatabase("qryptum-artifacts");
            req.onsuccess = () => resolve();
            req.onerror = () => resolve(); // best effort - proceed even on error
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
 * Idempotent - safe to call multiple times.
 */
export async function ensureRailgunEngine(onProgress?: (msg: string) => void): Promise<void> {
    if (engineState === "ready") return;

    if (engineState === "initializing") {
        return new Promise((resolve, reject) => engineWaiters.push({ resolve, reject }));
    }

    if (engineState === "error") {
        // Engine failed to start - DB may be in a partial state.
        // A full page reload is the only safe way to recover.
        throw new Error(
            (engineError?.message ?? "Railgun engine failed to start.") +
            " Please reload the page and try again."
        );
    }

    engineState = "initializing";
    try {
        onProgress?.("Loading privacy engine...");

        // Load the heavy wallet SDK - first call triggers the chunk download.
        // Subsequent calls return the cached module instantly.
        const {
            startRailgunEngine,
            setOnUTXOMerkletreeScanCallback,
            setOnTXIDMerkletreeScanCallback,
            setOnBalanceUpdateCallback,
            getProver,
        } = await wp();

        // Step 3 - Database: level-js → persists wallet in IndexedDB
        // https://docs.railgun.org/developer-guide/wallet/getting-started/3.-set-up-database
        const LevelDB = (await import("level-js")).default;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = new LevelDB("qryptum-engine") as unknown as any;

        // Step 4 - Persistent artifact store (IndexedDB)
        // wpSync() is safe here because wp() has already been awaited above.
        const artifactStore = createArtifactStore();

        onProgress?.("Starting Railgun engine...");

        // Step 5 - Start engine
        // https://docs.railgun.org/developer-guide/wallet/getting-started/5.-start-the-railgun-privacy-engine
        //
        // POI node(s): Railgun's official public POI aggregator(s).
        // Without a POI node, shielded UTXOs stay in "ShieldPending" / "MissingInternalPOI"
        // bucket forever and can never be spent. These nodes verify fund innocence so
        // UTXOs move to the "Spendable" bucket.
        // Multiple entries give the SDK redundant endpoints to poll for POI events.
        const poiNodeURLs = [
            "https://ppoi-agg.horsewithsixlegs.xyz",
            "https://ppoi-agg.horsewithsixlegs.xyz", // duplicate for SDK retry diversity
        ];

        await startRailgunEngine(
            "qryptum",      // walletSource - max 16 chars, lowercase
            db,
            false,          // shouldDebug
            artifactStore,
            false,          // useNativeArtifacts (browser = false)
            false,          // skipMerkletreeScans
            poiNodeURLs,
        );

        // Step 6 - Load Groth16 prover for browser
        // snarkjs is injected dynamically here (NOT loaded at page boot) to avoid
        // adding 676KB to the initial bundle on every page visit.
        // https://docs.railgun.org/developer-guide/wallet/getting-started/6.-load-a-groth16-prover-for-each-platform
        const groth16 = await (async () => {
            const win = window as unknown as { snarkjs?: { groth16: SnarkJSGroth16 } };
            if (win.snarkjs?.groth16) return win.snarkjs.groth16;
            // Inject the script tag now - it was removed from index.html to save startup time
            if (!document.querySelector('script[data-snarkjs]')) {
                const s = document.createElement("script");
                s.src = `${import.meta.env.BASE_URL}snarkjs.min.js`;
                s.setAttribute("data-snarkjs", "1");
                document.head.appendChild(s);
            }
            // Poll every 100ms until snarkjs is available
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

        // Scan progress callbacks - fires during UTXO + TXID Merkle tree scans
        // Consumers subscribe via subscribeScanProgress() below
        setOnUTXOMerkletreeScanCallback((data) => {
            const pct = Math.round((data.progress ?? 0) * 100);
            _scanListeners.forEach(cb => cb(`Scanning UTXO tree... ${pct}%`));
        });
        setOnTXIDMerkletreeScanCallback((data) => {
            const pct = Math.round((data.progress ?? 0) * 100);
            _scanListeners.forEach(cb => cb(`Scanning TXID tree... ${pct}%`));
        });

        // Balance update callback - fires whenever a scan completes
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

// ─── Step 8 - Connect network providers ──────────────────────────────────────

// Track which chainIds already have a provider loaded - loadProvider triggers
// a fresh merkletree scan each call, so we must call it exactly once per chain.
const _loadedProviders = new Set<number>();

/**
 * https://docs.railgun.org/developer-guide/wallet/getting-started/8.-connect-engine-network-providers.
 * loadProvider kicks off the initial merkletree scan. Idempotent per chainId.
 */
export async function loadRailgunProvider(chainId: number, onProgress?: (msg: string) => void): Promise<void> {
    const networkName = RAILGUN_CHAIN_MAP[chainId];
    if (!networkName) throw new Error(`QryptShield is not available on this network (chainId ${chainId}).`);

    // Already loaded for this chain - skip to avoid duplicate scans
    if (_loadedProviders.has(chainId)) return;

    const baseConfig = NETWORK_PROVIDERS[chainId];
    if (!baseConfig) throw new Error(`No RPC configured for chainId ${chainId}.`);

    // Inject dRPC paid endpoint (via Railway proxy) as priority 1.
    // Key stays hidden server-side (DRPC_API_KEY on Railway) — never in browser bundle.
    // Static fallbacks in NETWORK_PROVIDERS start at priority 2.
    const config: typeof baseConfig = {
        ...baseConfig,
        providers: [
            { provider: getDrpcProxyUrl(), priority: 1, weight: 5 },
            ...baseConfig.providers,
        ],
    };

    onProgress?.("Connecting to network...");

    const { loadProvider } = await wp();
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
 * - no timeout workaround needed.
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

    const { loadWalletByID, createRailgunWallet } = await wp();

    if (existingID) {
        try {
            onProgress?.("Loading your privacy wallet...");
            const info = await loadWalletByID(rawKey, existingID, false);
            return info.id;
        } catch {
            // Wallet not in DB (e.g. IndexedDB was cleared) - fall through to create
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
    // With persistent DB this only runs once - subsequent loads use loadWalletByID.
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
    const { getRailgunAddress } = wpSync();
    const addr = getRailgunAddress(walletID);
    if (!addr) throw new Error("Could not derive Railgun wallet address.");
    return addr;
}

export function getShieldSignMessage(): string {
    const { getShieldPrivateKeySignatureMessage } = wpSync();
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

    const { populateShield } = await wp();
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

    const { generateUnshieldProof, populateProvedUnshield } = await wp();

    // Step: generate ZK proof (Groth16, ~30–60 s in browser)
    await generateUnshieldProof(
        TXIDVersion.V2_PoseidonMerkle,
        networkName,
        params.walletID,
        rawKey,
        erc20Recipients,
        [],
        undefined,
        true,  // sendWithPublicWallet - no broadcaster, user submits TX
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
        const { fullWalletForID, balanceForERC20Token } = wpSync();
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
                    // balance check failed - keep waiting until timeout
                }
            });

            // Trigger scan after subscribing
            wpSync().refreshBalances(chain, [walletID]).catch(() => { /* best effort */ });
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
 *    a. ANY bucket balance (committed) - token found in tree at all?
 *    b. Spendable bucket - ready for ZK proof?
 * 3. If committed but NOT spendable after 3-minute grace period, resolve anyway.
 *    This handles "ShieldPending" / "MissingInternalPOI" buckets on testnet where
 *    POI may not auto-clear. The ZK proof step will fail with a clearer error if needed.
 * 4. Hard timeout: 25 minutes on mainnet (POI validation takes longer), 12 minutes on testnet.
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

    // Mainnet POI validation runs in batches off-chain and commonly takes 15-25 min.
    // Testnet traffic is sparse so the aggregator approves shields much faster.
    const IS_MAINNET = chainId === 1;
    const HARD_TIMEOUT_MS = IS_MAINNET ? 25 * 60 * 1_000 : 12 * 60 * 1_000;
    // On mainnet incremental scans need more time before escalating to full rescan.
    const FULL_RESCAN_AFTER_MS = IS_MAINNET ? 5 * 60 * 1_000 : 2 * 60 * 1_000;
    // Grace period: if UTXO is confirmed in pool (any bucket) but still not Spendable
    // after this long, force-resolve and let the ZK proof step determine the outcome.
    // POI aggregator may have validated on-chain but SDK event not received yet.
    // Mainnet: 20 min grace. Testnet: 5 min grace.
    const COMMITTED_GRACE_MS = IS_MAINNET ? 20 * 60 * 1_000 : 5 * 60 * 1_000;

    const startedAt = Date.now();
    let committedAt: number | null = null;

    function elapsed() {
        const s = Math.floor((Date.now() - startedAt) / 1000);
        const m = Math.floor(s / 60);
        return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
    }

    // Fast path - balance already spendable (resume scenario)
    if (tokenAddress && networkName) {
        const immediate = await checkRailgunBalance(walletID, networkName, tokenAddress, true);
        if (immediate > 0n) {
            onProgress?.("Pool balance confirmed: proceeding to proof.");
            return;
        }
        // Check non-spendable: UTXO is committed but POI not yet validated.
        const anyBucket = await checkRailgunBalance(walletID, networkName, tokenAddress, false);
        if (anyBucket > 0n) {
            // Back-date committedAt aggressively on resume: tokens already in pool,
            // user has been waiting — grace period fires after 2 minutes (1 full rescan + 2 ticks).
            // This avoids making the user wait another 20 min after hours of waiting.
            committedAt = Date.now() - (COMMITTED_GRACE_MS - 2 * 60 * 1_000);
            onProgress?.("Deposit found in pool (not yet Spendable). Running rescan + POI check...");
        }
    }

    const baseMsg = IS_MAINNET
        ? "Syncing Railgun pool - mainnet POI validation takes 15-25 min, please wait..."
        : "Syncing Railgun pool (this may take a few minutes)...";
    onProgress?.(baseMsg);

    return new Promise<void>((resolve, reject) => {
        // Hard timeout
        const hardTimer = setTimeout(() => {
            cleanup();
            const timeoutMin = IS_MAINNET ? "25" : "12";
            // Distinguish: did we find the UTXO (in some bucket) or never find it?
            if (committedAt !== null) {
                reject(new Error(
                    `Your UTXO is in the Railgun pool but not yet Spendable after ${timeoutMin} minutes. ` +
                    "This is normal on mainnet - POI validation by the Railgun aggregator can take up to 30 min. " +
                    "Your tokens are safe. Close this dialog and try QryptShield again in 5-10 minutes."
                ));
            } else {
                reject(new Error(
                    `Railgun pool sync timed out: UTXO not indexed after ${timeoutMin} minutes. ` +
                    "Your tokens are safe in the Railgun pool - do not retry the deposit. " +
                    "Close this dialog and try QryptShield again (it will resume from Step 3)."
                ));
            }
        }, HARD_TIMEOUT_MS);

        // Show real scan % from the global scan progress bus
        const unsubScan = subscribeScanProgress((msg) => {
            onProgress?.(msg + ` (${elapsed()})`);
        });

        // Trigger first scan immediately (incremental - fast)
        wpSync().refreshBalances(chain, [walletID]).catch(() => { /* best effort */ });

        // Re-trigger scan every 20 s.
        // Escalation ladder:
        //   > FULL_RESCAN_AFTER_MS committed  → full UTXO + TXID rescan (fixes stale local index)
        //   > COMMITTED_GRACE_MS committed     → force-resolve so ZK proof step can attempt anyway
        //     (POI may have been validated at aggregator but SDK event never arrived)
        let fullRescanTriggered = false;
        const ticker = setInterval(async () => {
            const pkg = wpSync();
            const sinceCommit = committedAt !== null ? Date.now() - committedAt : 0;

            // Grace period: UTXO in pool for too long without becoming Spendable.
            // Force-resolve so the proof step can attempt. If POI truly hasn't cleared,
            // the ZK proof will fail with an explicit "insufficient spendable balance" error.
            if (committedAt !== null && sinceCommit > COMMITTED_GRACE_MS) {
                // One final spendable check before giving up waiting
                if (tokenAddress && networkName) {
                    const spendable = await checkRailgunBalance(walletID, networkName, tokenAddress, true).catch(() => 0n);
                    if (spendable > 0n) {
                        cleanup();
                        onProgress?.("Pool balance spendable: proceeding to proof.");
                        resolve();
                        return;
                    }
                }
                cleanup();
                onProgress?.(
                    "POI validation is delayed (aggregator backlog). " +
                    "Proceeding to proof — your tokens are in the pool. " +
                    "If proof fails, close and try Resume Transfer in a few minutes."
                );
                resolve();
                return;
            }

            if (
                committedAt !== null &&
                !fullRescanTriggered &&
                sinceCommit > FULL_RESCAN_AFTER_MS
            ) {
                fullRescanTriggered = true;
                const rescanMsg = IS_MAINNET
                    ? "POI validation pending - triggering deep index rescan (normal on mainnet)..."
                    : "UTXO stuck in ShieldPending: triggering full index rescan...";
                onProgress?.(rescanMsg);
                pkg.rescanFullUTXOMerkletreesAndWallets(chain, [walletID])
                    .catch(() => { /* best effort */ });
            } else {
                pkg.refreshBalances(chain, [walletID]).catch(() => { /* best effort */ });
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
                onProgress?.(`Deposit indexed in pool (${elapsed()}): waiting for Spendable...`);
            }

            // Check Spendable bucket
            const spendable = await checkRailgunBalance(walletID, networkName, tokenAddress, true);
            if (spendable > 0n) {
                cleanup();
                onProgress?.("Pool balance spendable: proceeding to proof.");
                resolve();
                return;
            }

            // UTXO found but not Spendable yet - update progress, keep waiting.
            // This means it is in ShieldPending / MissingInternalPOI bucket.
            // The SDK will move it to Spendable once the shield maturity period passes
            // (typically ~5–15 minutes on Sepolia). Do NOT proceed early - the proof
            // step will fail with "balance too low" if Spendable is still 0.
            const sinceCommit = committedAt !== null
                ? Math.floor((Date.now() - committedAt) / 1000)
                : 0;
            const maturingMsg = IS_MAINNET
                ? `Deposit in pool - awaiting POI validation by Railgun aggregator (${sinceCommit}s, normal on mainnet). (${elapsed()})`
                : `UTXO found in pool (maturing... ${sinceCommit}s). Waiting for Spendable confirmation. (${elapsed()})`;
            onProgress?.(maturingMsg);
        });
    });
}

