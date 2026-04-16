import { useState, useEffect } from "react";
import { EyeOffIcon, ClockIcon, ArrowRightIcon, XCircleIcon, RefreshCwIcon } from "lucide-react";
import QryptShieldGate from "@/components/QryptShieldGate";
import { fetchRailgunPending, type RailgunPendingData } from "@/lib/api";

interface SharedPropsMin {
    address: string | undefined;
    chainId: number;
    vaultAddress: `0x${string}` | undefined;
    vaultVersion: "v5" | "v6" | null | undefined;
    tokensWithBalances: { tokenAddress: string; tokenSymbol: string; tokenName: string; shieldedBalance: bigint | undefined; decimals: number; color: string }[];
    refetchData: () => void;
    refetchBalances: () => void;
    setActiveModal: (id: string | null) => void;
    isVaultLoading: boolean;
    isConnected: boolean;
}

function formatAmt(amount: string, symbol: string) {
    const n = parseFloat(amount);
    if (isNaN(n)) return `${amount} ${symbol}`;
    return `${n.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`;
}

function addrShort(addr: string) {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

interface PendingListProps {
    pending: RailgunPendingData[];
    loading: boolean;
    selected: RailgunPendingData | null;
    onSelect: (p: RailgunPendingData) => void;
    onRefresh: () => void;
}

function PendingList({ pending, loading, selected, onSelect, onRefresh }: PendingListProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <div style={{
                padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
            }}>
                <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Pending Transfers</p>
                    <p style={{ margin: "3px 0 0", fontSize: 10, color: "rgba(255,255,255,0.25)", lineHeight: 1.4 }}>
                        Transfers awaiting Railgun proof delivery
                    </p>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    style={{ padding: 5, border: "none", background: "none", cursor: loading ? "not-allowed" : "pointer", color: "rgba(255,255,255,0.3)", borderRadius: 6 }}
                    title="Refresh"
                >
                    <RefreshCwIcon size={14} style={{ animation: loading ? "spin 1s linear infinite" : undefined }} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                {loading && pending.length === 0 ? (
                    <div style={{ padding: "24px 14px", textAlign: "center" }}>
                        <RefreshCwIcon size={20} color="rgba(255,255,255,0.2)" style={{ animation: "spin 1s linear infinite", margin: "0 auto 8px" }} />
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Loading...</p>
                    </div>
                ) : pending.length === 0 ? (
                    <div style={{ padding: "32px 14px", textAlign: "center" }}>
                        <ClockIcon size={28} color="rgba(255,255,255,0.1)" style={{ margin: "0 auto 12px" }} />
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
                            No pending transfers
                        </p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 6, lineHeight: 1.5 }}>
                            Transfers interrupted mid-flight will appear here automatically
                        </p>
                    </div>
                ) : (
                    pending.map(item => {
                        const isSelected = selected?.tokenAddress === item.tokenAddress;
                        return (
                            <div
                                key={item.tokenAddress}
                                onClick={() => onSelect(item)}
                                style={{
                                    margin: "0 8px", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                                    background: isSelected ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.02)",
                                    border: isSelected ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
                                    marginBottom: 6, transition: "all 0.15s",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <EyeOffIcon size={12} color="#8B5CF6" />
                                        <span style={{ fontSize: 13, fontWeight: 700, color: "#d4d6e2" }}>
                                            q{item.tokenSymbol}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5,
                                        background: "rgba(245,158,11,0.12)", color: "#F59E0B",
                                        border: "1px solid rgba(245,158,11,0.2)",
                                    }}>
                                        In Flight
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                                    {formatAmt(item.amount, item.tokenSymbol)}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                                    <ArrowRightIcon size={10} color="rgba(255,255,255,0.25)" />
                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                                        {addrShort(item.recipient)}
                                    </span>
                                </div>
                                {isSelected && (
                                    <p style={{ margin: "6px 0 0", fontSize: 10, color: "#8B5CF6", fontWeight: 600 }}>
                                        Click Resume Transfer on the right to continue
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

interface QryptShieldTabProps {
    p: SharedPropsMin;
}

export function QryptShieldTabDesktop({ p }: QryptShieldTabProps) {
    const [pending, setPending] = useState<RailgunPendingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPending, setSelectedPending] = useState<RailgunPendingData | null>(null);

    const panelBase = {
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column" as const,
        overflow: "hidden",
    };

    async function loadPending() {
        if (!p.address) { setLoading(false); return; }
        setLoading(true);
        const rows = await fetchRailgunPending(p.address, p.chainId);
        setPending(rows);
        setLoading(false);
    }

    useEffect(() => { loadPending(); }, [p.address, p.chainId]);

    const gateKey = selectedPending ? selectedPending.tokenAddress : (p.tokensWithBalances[0]?.tokenAddress ?? "none");

    return (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 14, height: "100%", minHeight: 0 }}>
            {/* Left: pending list */}
            <div style={{ ...panelBase }}>
                <PendingList
                    pending={pending}
                    loading={loading}
                    selected={selectedPending}
                    onSelect={setSelectedPending}
                    onRefresh={loadPending}
                />
            </div>

            {/* Right: QryptShieldGate form */}
            <div style={{ ...panelBase, overflow: "auto" }}>
                {p.vaultAddress && p.address ? (
                    <QryptShieldGate
                        key={gateKey}
                        vaultAddress={p.vaultAddress}
                        walletAddress={p.address}
                        chainId={p.chainId}
                        tokensWithBalances={p.tokensWithBalances}
                        initialTokenAddress={selectedPending?.tokenAddress}
                        vaultVersion={p.vaultVersion ?? "v5"}
                        onComplete={() => {
                            setSelectedPending(null);
                            loadPending();
                            p.refetchData();
                            p.refetchBalances();
                        }}
                        onCancel={() => setSelectedPending(null)}
                    />
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, padding: 32 }}>
                        <XCircleIcon size={32} color="rgba(255,255,255,0.15)" />
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.6 }}>
                            {!p.isConnected
                                ? "Connect your wallet to use QryptShield"
                                : p.isVaultLoading
                                    ? "Loading vault..."
                                    : "No vault found. Create a QryptSafe first."}
                        </p>
                        {!p.vaultAddress && !p.isVaultLoading && p.isConnected && (
                            <button
                                onClick={() => p.setActiveModal("shield")}
                                style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                            >
                                Create QryptSafe
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export function QryptShieldTabMobile({ p }: QryptShieldTabProps) {
    const [pending, setPending] = useState<RailgunPendingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPending, setSelectedPending] = useState<RailgunPendingData | null>(null);
    const [showForm, setShowForm] = useState(false);

    async function loadPending() {
        if (!p.address) { setLoading(false); return; }
        setLoading(true);
        const rows = await fetchRailgunPending(p.address, p.chainId);
        setPending(rows);
        setLoading(false);
    }

    useEffect(() => { loadPending(); }, [p.address, p.chainId]);

    const gateKey = selectedPending ? selectedPending.tokenAddress : "new";

    if (showForm) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <button
                    onClick={() => { setShowForm(false); setSelectedPending(null); }}
                    style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "10px 0 8px",
                        background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 4,
                    }}
                >
                    <ArrowRightIcon size={13} style={{ transform: "rotate(180deg)" }} /> Back to pending list
                </button>
                {p.vaultAddress && p.address ? (
                    <QryptShieldGate
                        key={gateKey}
                        vaultAddress={p.vaultAddress}
                        walletAddress={p.address}
                        chainId={p.chainId}
                        tokensWithBalances={p.tokensWithBalances}
                        initialTokenAddress={selectedPending?.tokenAddress}
                        vaultVersion={p.vaultVersion ?? "v5"}
                        onComplete={() => { setShowForm(false); setSelectedPending(null); loadPending(); p.refetchData(); p.refetchBalances(); }}
                        onCancel={() => { setShowForm(false); setSelectedPending(null); }}
                    />
                ) : (
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: 24 }}>
                        {!p.isConnected ? "Connect your wallet first." : p.isVaultLoading ? "Loading..." : "No vault found."}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Pending section */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden", minHeight: 140 }}>
                <PendingList
                    pending={pending}
                    loading={loading}
                    selected={selectedPending}
                    onSelect={item => { setSelectedPending(item); setShowForm(true); }}
                    onRefresh={loadPending}
                />
            </div>

            {/* Quick action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={() => { setSelectedPending(null); setShowForm(true); }}
                    style={{
                        flex: 1, padding: "11px 6px", borderRadius: 10,
                        border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.1)",
                        color: "#c4b5fd", fontSize: 12, fontWeight: 700, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                >
                    <EyeOffIcon size={13} /> New Shield Transfer
                </button>
            </div>
        </div>
    );
}
