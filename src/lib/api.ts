// Railway URL is the canonical API. In dev, VITE_API_BASE is unset and Vite
// proxies /api to the local server. In production (GitHub Pages / IPFS),
// VITE_API_BASE may be unset too — fall back to the hardcoded Railway URL so
// no GitHub Secrets are required.
const _rawBase = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "");
const BASE = _rawBase
    ? `${_rawBase}/api`
    : import.meta.env.DEV
        ? `${import.meta.env.BASE_URL}api`
        : "https://qryptum-api.up.railway.app/api";

export async function fetchVault(walletAddress: string) {
    const res = await fetch(`${BASE}/vaults/${walletAddress}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch vault");
    return res.json();
}

export async function registerVault(data: {
    walletAddress: string;
    vaultContractAddress: string;
    networkId: number;
}) {
    const res = await fetch(`${BASE}/vaults`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to register vault");
    return res.json();
}

export async function fetchTransactions(walletAddress: string, limit = 20, offset = 0) {
    const res = await fetch(`${BASE}/transactions/${walletAddress}?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error("Failed to fetch transactions");
    return res.json();
}

export interface PortfolioToken {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    balance: string;
}

export async function fetchPortfolio(walletAddress: string, chainId: number): Promise<PortfolioToken[]> {
    try {
        const res = await fetch(`${BASE}/portfolio/${walletAddress}?chainId=${chainId}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.tokens ?? [];
    } catch {
        return [];
    }
}

export async function broadcastUnshieldTx(params: {
    to: string;
    data: string;
    value?: string;
    chainId: number;
}): Promise<{ txHash: string; broadcaster: string }> {
    let res: Response;
    try {
        res = await fetch(`${BASE}/shield/broadcast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });
    } catch {
        // Network error (offline, no backend) → fallback to direct wallet
        const err = new Error("Broadcaster unreachable");
        (err as Error & { fallback?: boolean }).fallback = true;
        throw err;
    }

    // Static hosts (GitHub Pages / IPFS) return 404/405 with non-JSON body
    // when no backend is present → fallback to direct wallet submit
    if (res.status === 404 || res.status === 405 || res.status === 0) {
        const err = new Error("Broadcaster not available");
        (err as Error & { fallback?: boolean }).fallback = true;
        throw err;
    }

    let json: { error?: string; fallback?: boolean; txHash?: string; broadcaster?: string };
    try {
        json = await res.json();
    } catch {
        // Non-JSON response (e.g. "Method Not Allowed" plain text) → fallback
        const err = new Error("Broadcaster returned invalid response");
        (err as Error & { fallback?: boolean }).fallback = true;
        throw err;
    }

    if (!res.ok) {
        const err = new Error(json.error ?? "Broadcast failed");
        (err as Error & { fallback?: boolean }).fallback = !!json.fallback;
        throw err;
    }
    return json as { txHash: string; broadcaster: string };
}

export async function recordTransaction(data: {
    walletAddress: string;
    txHash: string;
    type: "shield" | "unshield" | "transfer" | "receive" | "fund" | "reclaim" | "voucher" | "air-send" | "air-receive";
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    amount: string;
    fromAddress: string;
    toAddress?: string;
    networkId: number;
}) {
    const res = await fetch(`${BASE}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to record transaction");
    return res.json();
}

/**
 * Derive H0 server-side so PROOF_SALT never reaches the frontend bundle.
 * The server runs PBKDF2-SHA256 (200k iterations) with the secret salt.
 */
export async function generateH0Api(
    vaultProof: string,
    vaultAddress: string
): Promise<`0x${string}`> {
    const res = await fetch(`${BASE}/generate-h0`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaultProof, vaultAddress }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? "Failed to derive H0 from server");
    }
    const data = await res.json();
    return data.h0 as `0x${string}`;
}
