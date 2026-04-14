import { useState } from "react";
import { formatUnits } from "viem";
import { useLocation } from "wouter";
import { WifiOffIcon, ArrowUpIcon, ExternalLinkIcon } from "lucide-react";
import QryptAirLauncherModal from "./QryptAirLauncherModal";
import MintAirBagsModal from "./MintAirBagsModal";
import type { VaultVersion } from "@/hooks/useVault";

interface Token {
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    shieldedBalance: bigint | undefined;
    decimals: number;
}

interface QryptAirSenderPanelProps {
    walletAddress: string;
    chainId: number;
    tokensWithBalances: Token[];
    initialTokenAddress?: string;
    initialShowBudgetManager?: boolean;
    vaultVersion: VaultVersion;
    vaultAddress?: `0x${string}`;
    airBudgets: { [tokenAddress: string]: bigint };
}

export default function QryptAirSenderPanel({
    walletAddress,
    chainId,
    tokensWithBalances,
    initialTokenAddress,
    initialShowBudgetManager,
    vaultVersion,
    vaultAddress,
    airBudgets,
}: QryptAirSenderPanelProps) {
    const [, navigate] = useLocation();
    const [showLauncher, setShowLauncher] = useState(!initialShowBudgetManager);
    const [showMintModal, setShowMintModal] = useState(!!initialShowBudgetManager);

    const isV6 = vaultVersion === "v6";

    const preselected = initialTokenAddress
        ? (tokensWithBalances.find(t => t.tokenAddress.toLowerCase() === initialTokenAddress.toLowerCase()) ?? tokensWithBalances[0] ?? null)
        : (tokensWithBalances[0] ?? null);
    const [selectedToken] = useState<Token | null>(preselected);

    const selectedAirBudget = selectedToken
        ? (airBudgets[selectedToken.tokenAddress.toLowerCase()] ?? 0n)
        : 0n;
    const selectedShielded = selectedToken?.shieldedBalance ?? 0n;

    const handleOpenOffline = () => {
        setShowLauncher(false);
        navigate("/air");
    };

    const handleMintAirBags = () => {
        setShowLauncher(false);
        setShowMintModal(true);
    };

    const handleDismissLauncher = () => {
        setShowLauncher(false);
    };

    if (!tokensWithBalances.length) {
        return (
            <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
                No shielded tokens found. Shield a token first.
            </div>
        );
    }

    return (
        <>
            {showLauncher && (
                <QryptAirLauncherModal
                    onOpenOffline={handleOpenOffline}
                    onMintAirBags={handleMintAirBags}
                    onDismiss={handleDismissLauncher}
                />
            )}

            {showMintModal && isV6 && vaultAddress && selectedToken && (
                <MintAirBagsModal
                    token={selectedToken}
                    airBudget={selectedAirBudget}
                    shieldedBalance={selectedShielded}
                    walletAddress={walletAddress}
                    vaultAddress={vaultAddress}
                    chainId={chainId}
                    onClose={() => setShowMintModal(false)}
                />
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {isV6 && selectedToken && (
                    <div style={{
                        padding: "12px 14px", borderRadius: 10,
                        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                <WifiOffIcon size={12} color="#F59E0B" />
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.05em" }}>AIR BAGS</span>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B", fontFamily: "monospace" }}>
                                {formatUnits(selectedAirBudget, selectedToken.decimals)} {selectedToken.tokenSymbol}
                            </span>
                            {selectedAirBudget === 0n && (
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>
                                    Mint air bags to create offline vouchers
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowMintModal(true)}
                            style={{
                                padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.4)",
                                background: "rgba(245,158,11,0.1)", color: "#F59E0B",
                                fontSize: 11, fontWeight: 600, cursor: "pointer",
                                fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
                                display: "flex", alignItems: "center", gap: 5,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.2)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; }}
                        >
                            <ArrowUpIcon size={11} /> Manage
                        </button>
                    </div>
                )}

                <div style={{
                    padding: "20px", borderRadius: 14,
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex", flexDirection: "column", gap: 14, textAlign: "center",
                }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <WifiOffIcon size={28} color="#F59E0B" />
                    </div>
                    <div>
                        <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                            Create offline vouchers
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                            Sign blockchain transactions with no internet connection. Open QryptAir to authorize transfers offline.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/air")}
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                            padding: "12px", borderRadius: 10, border: "none",
                            background: "#F59E0B", color: "#000",
                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        <ExternalLinkIcon size={14} /> Open QryptAir
                    </button>
                </div>
            </div>
        </>
    );
}
