const BASE = `${import.meta.env.BASE_URL}api`;

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
    const res = await fetch(`${BASE}/shield/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });
    const json = await res.json();
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
