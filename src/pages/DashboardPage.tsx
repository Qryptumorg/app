import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAccount, useChainId, useDisconnect, useConnect, useBalance, useReadContracts } from "wagmi";
import { injected } from "wagmi/connectors";
import { formatUnits } from "viem";
import { useQuery } from "@tanstack/react-query";
import {
    ShieldIcon, SendIcon, SettingsIcon,
    WalletIcon, LogOutIcon, CopyIcon, CheckIcon, LockIcon,
    AlertTriangleIcon, UserIcon, XIcon,
} from "lucide-react";
import { useVault } from "@/hooks/useVault";
import CreateVaultPage from "@/pages/CreateVaultPage";
import ShieldPanel from "@/components/ShieldPanel";
import TransferPanel from "@/components/TransferPanel";
import UnshieldPanel from "@/components/UnshieldPanel";
import SettingsPanel from "@/components/SettingsPanel";
import { fetchTransactions } from "@/lib/api";
import { PERSONAL_VAULT_ABI, ERC20_ABI } from "@/lib/abi";
import { SUPPORTED_CHAIN_IDS } from "@/lib/wagmi";

const TOKEN_COLORS = ["#60a5fa","#a78bfa","#fb923c","#facc15","#c084fc","#2dd4bf","#f472b6","#38bdf8","#f87171","#4ade80"];

interface ApiTransaction {
    id: number;
    txHash: string;
    type: "shield" | "unshield" | "transfer";
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    amount: string;
    fromAddress: string;
    toAddress?: string;
    networkId: number;
    createdAt?: string;
}

interface TokenWithBalance {
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    shieldedBalance: bigint | undefined;
    decimals: number;
    color: string;
}

type ModalId = "shield" | "transfer" | "unshield" | "vaults" | "settings";

interface SharedProps {
    activeModal: ModalId | null;
    setActiveModal: (m: ModalId | null) => void;
    closeModal: () => void;
    isConnected: boolean;
    address: `0x${string}` | undefined;
    shortAddress: string;
    chainId: number;
    networkName: string;
    balanceStr: string;
    hasVault: boolean;
    vaultAddress: `0x${string}` | undefined;
    copied: boolean;
    copyAddress: () => void;
    showConnectMenu: boolean;
    setShowConnectMenu: (v: boolean) => void;
    handleDisconnect: () => void;
    handleConnect: () => void;
    isMobile: boolean;
    tokensWithBalances: TokenWithBalance[];
    transactions: ApiTransaction[];
    refetchData: () => void;
}

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { disconnect } = useDisconnect();
    const { connect } = useConnect();
    const { vaultAddress, hasVault } = useVault();
    const { data: balance } = useBalance({ address });

    const [activeModal, setActiveModal] = useState<ModalId | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showConnectMenu, setShowConnectMenu] = useState(false);

    const { data: txData, refetch: refetchTx } = useQuery({
        queryKey: ["transactions", address],
        queryFn: () => fetchTransactions(address!, 100),
        enabled: !!address && isConnected,
        refetchInterval: 30000,
    });

    const transactions: ApiTransaction[] = useMemo(() => {
        return txData?.transactions || [];
    }, [txData]);

    const shieldedTokenAddresses = useMemo(() => {
        const map = new Map<string, { tokenAddress: string; tokenSymbol: string; tokenName: string; index: number }>();
        transactions.forEach(tx => {
            const key = tx.tokenAddress.toLowerCase();
            if (!map.has(key)) {
                map.set(key, {
                    tokenAddress: tx.tokenAddress,
                    tokenSymbol: tx.tokenSymbol,
                    tokenName: tx.tokenName,
                    index: map.size,
                });
            }
        });
        return Array.from(map.values());
    }, [transactions]);

    const balanceContracts = useMemo(() => {
        if (!vaultAddress || shieldedTokenAddresses.length === 0) return [];
        return shieldedTokenAddresses.map(t => ({
            address: vaultAddress,
            abi: PERSONAL_VAULT_ABI,
            functionName: "getShieldedBalance" as const,
            args: [t.tokenAddress as `0x${string}`],
        }));
    }, [vaultAddress, shieldedTokenAddresses]);

    const decimalsContracts = useMemo(() => {
        if (shieldedTokenAddresses.length === 0) return [];
        return shieldedTokenAddresses.map(t => ({
            address: t.tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "decimals" as const,
        }));
    }, [shieldedTokenAddresses]);

    const { data: balanceResults } = useReadContracts({ contracts: balanceContracts });
    const { data: decimalsResults } = useReadContracts({ contracts: decimalsContracts });

    const tokensWithBalances: TokenWithBalance[] = useMemo(() => {
        return shieldedTokenAddresses
            .map((t, i) => ({
                tokenAddress: t.tokenAddress,
                tokenSymbol: t.tokenSymbol,
                tokenName: t.tokenName,
                shieldedBalance: balanceResults?.[i]?.result as bigint | undefined,
                decimals: (decimalsResults?.[i]?.result as number | undefined) ?? 18,
                color: TOKEN_COLORS[t.index % TOKEN_COLORS.length],
            }))
            .filter(t => t.shieldedBalance === undefined || t.shieldedBalance > 0n);
    }, [shieldedTokenAddresses, balanceResults, decimalsResults]);

    const prevModal = useRef<ModalId | null>(null);
    useEffect(() => {
        if (prevModal.current !== null && activeModal === null) {
            refetchTx();
        }
        prevModal.current = activeModal;
    }, [activeModal, refetchTx]);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const closeModal = useCallback(() => setActiveModal(null), []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [closeModal]);

    const copyAddress = () => {
        if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    };

    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
    const networkName = getNetworkName(chainId);
    const balanceStr = balance ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} ${balance.symbol}` : "0.0000 ETH";

    const sharedProps: SharedProps = {
        activeModal, setActiveModal, closeModal,
        isConnected, address, shortAddress,
        chainId, networkName, balanceStr, hasVault, vaultAddress,
        copied, copyAddress,
        showConnectMenu, setShowConnectMenu,
        handleDisconnect: disconnect,
        handleConnect: () => { connect({ connector: injected() }); setShowConnectMenu(false); },
        isMobile,
        tokensWithBalances,
        transactions,
        refetchData: refetchTx,
    };

    return (
        <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>
            {!SUPPORTED_CHAIN_IDS.includes(chainId) && isConnected && (
                <div style={{
                    background: "rgba(248,113,113,0.08)", borderBottom: "1px solid rgba(248,113,113,0.25)",
                    padding: "10px 20px", display: "flex", alignItems: "center", gap: 8,
                    position: "fixed", top: 0, left: 0, right: 0, zIndex: 30,
                }}>
                    <AlertTriangleIcon size={14} color="#f87171" />
                    <span style={{ fontSize: 13, color: "#f87171" }}>
                        Unsupported network (Chain {chainId}). Please switch to Ethereum, Sepolia, or Local.
                    </span>
                </div>
            )}
            {isMobile
                ? <MobileLayout {...sharedProps} />
                : <DesktopLayout {...sharedProps} />
            }
        </div>
    );
}

function getNetworkName(chainId: number) {
    return ({ 1: "Ethereum", 11155111: "Sepolia", 31337: "Local" } as Record<number, string>)[chainId] || `Chain ${chainId}`;
}

function formatBalance(balance: bigint | undefined, decimals: number): string {
    if (balance === undefined) return "...";
    const formatted = parseFloat(formatUnits(balance, decimals));
    return formatted.toFixed(4);
}

function buildTokenChart(transactions: ApiTransaction[], tokenAddress: string, _decimals: number): number[] {
    const lower = tokenAddress.toLowerCase();
    const tokenTxs = transactions
        .filter(tx => tx.tokenAddress.toLowerCase() === lower)
        .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
    if (tokenTxs.length === 0) return [0, 0, 0, 0, 0, 0, 0];
    let cumulative = 0;
    const points: number[] = [];
    for (const tx of tokenTxs.slice(-7)) {
        const amount = parseFloat(tx.amount || "0");
        if (tx.type === "shield") cumulative += amount;
        else cumulative = Math.max(0, cumulative - amount);
        points.push(cumulative);
    }
    while (points.length < 7) points.unshift(points[0] ?? 0);
    return points.slice(-7);
}

const MODAL_TITLES: Record<ModalId, string> = {
    shield:   "Shield Tokens",
    transfer: "Transfer",
    unshield: "Unshield Tokens",
    vaults:   "My Qrypt-Safe",
    settings: "Settings",
};

function Modal({ id, p }: { id: ModalId; p: SharedProps }) {
    const open = p.activeModal === id;
    return (
        <>
            <div
                onClick={p.closeModal}
                style={{
                    position: "fixed", inset: 0, zIndex: 40,
                    background: "rgba(0,0,0,0.72)",
                    backdropFilter: open ? "blur(6px)" : "none",
                    WebkitBackdropFilter: open ? "blur(6px)" : "none",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                    transition: "opacity 0.22s ease",
                }}
            />
            <div style={{
                position: "fixed",
                top: "50%", left: "50%",
                transform: open
                    ? "translate(-50%, -50%) scale(1)"
                    : "translate(-50%, -48%) scale(0.97)",
                zIndex: 50,
                width: "min(540px, calc(100vw - 32px))",
                maxHeight: "calc(100vh - 64px)",
                background: "#0d0d12",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                display: "flex", flexDirection: "column",
                opacity: open ? 1 : 0,
                pointerEvents: open ? "auto" : "none",
                transition: "opacity 0.22s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 22px", height: 56, flexShrink: 0,
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
                        {MODAL_TITLES[id]}
                    </span>
                    <button
                        onClick={p.closeModal}
                        style={{
                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)",
                            borderRadius: 8, width: 32, height: 32,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "rgba(255,255,255,0.5)",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                    >
                        <XIcon size={15} />
                    </button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "22px" }}>
                    {id === "shield" && p.vaultAddress && p.address && (
                        <ShieldPanel vaultAddress={p.vaultAddress} walletAddress={p.address} chainId={p.chainId} />
                    )}
                    {id === "shield" && (!p.vaultAddress || !p.address) && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                            Connect your wallet and create a Qrypt-Safe first.
                        </p>
                    )}
                    {id === "transfer" && p.vaultAddress && p.address && (
                        <TransferPanel vaultAddress={p.vaultAddress} walletAddress={p.address} chainId={p.chainId} />
                    )}
                    {id === "transfer" && (!p.vaultAddress || !p.address) && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                            Connect your wallet and create a Qrypt-Safe first.
                        </p>
                    )}
                    {id === "unshield" && p.vaultAddress && p.address && (
                        <UnshieldPanel vaultAddress={p.vaultAddress} walletAddress={p.address} chainId={p.chainId} />
                    )}
                    {id === "unshield" && (!p.vaultAddress || !p.address) && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                            Connect your wallet and create a Qrypt-Safe first.
                        </p>
                    )}
                    {id === "vaults" && <ModalVaults p={p} />}
                    {id === "settings" && p.vaultAddress && (
                        <SettingsPanel vaultAddress={p.vaultAddress} chainId={p.chainId} />
                    )}
                    {id === "settings" && !p.vaultAddress && (
                        <ModalSettingsNoVault p={p} />
                    )}
                </div>
            </div>
        </>
    );
}

function DesktopLayout(p: SharedProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <header style={{
                position: "fixed", top: 0, left: 0, right: 0, height: 58, zIndex: 20,
                background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 28px",
            }}>
                <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 0 }}>
                    <img src="/qryptum-logo.png" alt="Qryptum" style={{ height: 32, width: 32, objectFit: "contain" }} />
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "-0.01em", marginLeft: -4 }}>QRYPTUM</span>
                </a>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {p.isConnected ? <TopBarWallet {...p} /> : <ConnectButton {...p} />}
                </div>
            </header>

            <main style={{ marginTop: 58, flex: 1, minHeight: "calc(100vh - 58px)" }}>
                {p.isConnected && !p.hasVault
                    ? <CreateVaultPage onVaultCreated={p.refetchData} />
                    : <DesktopDashboard {...p} />
                }
            </main>

            {(["shield", "transfer", "unshield", "vaults", "settings"] as ModalId[]).map(id => (
                <Modal key={id} id={id} p={p} />
            ))}
        </div>
    );
}

function MobileLayout(p: SharedProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        if (showProfileMenu) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showProfileMenu]);

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <header style={{
                height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(0,0,0,0.97)", position: "sticky", top: 0, zIndex: 20,
            }}>
                <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 0 }}>
                    <img src="/qryptum-logo.png" alt="Qryptum" style={{ height: 32, width: 32, objectFit: "contain" }} />
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "-0.01em", marginLeft: -4 }}>QRYPTUM</span>
                </a>

                {p.isConnected ? (
                    <div style={{ position: "relative" }} ref={menuRef}>
                        <button
                            onClick={() => setShowProfileMenu(v => !v)}
                            style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: "rgba(37,99,235,0.18)", border: "1px solid rgba(37,99,235,0.35)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: "#60a5fa",
                            }}
                        >
                            <UserIcon size={16} />
                        </button>

                        {showProfileMenu && (
                            <div style={{
                                position: "absolute", top: "calc(100% + 8px)", right: 0,
                                minWidth: 220,
                                background: "#111", border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: 14, padding: 8,
                                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                                zIndex: 50,
                            }}>
                                <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 6 }}>
                                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4, letterSpacing: "0.06em" }}>CONNECTED</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
                                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{p.shortAddress}</span>
                                        <button onClick={p.copyAddress} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0, marginLeft: "auto", display: "flex" }}>
                                            {p.copied ? <CheckIcon size={12} color="#4ade80" /> : <CopyIcon size={12} />}
                                        </button>
                                    </div>
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{p.balanceStr}</p>
                                </div>

                                <button
                                    onClick={() => { setShowProfileMenu(false); p.setActiveModal("settings"); }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        width: "100%", padding: "10px 12px", borderRadius: 8,
                                        background: "none", border: "none", cursor: "pointer",
                                        color: "rgba(255,255,255,0.7)", fontFamily: "'Inter', sans-serif", fontSize: 13,
                                        textAlign: "left",
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >
                                    <SettingsIcon size={14} /> Settings
                                </button>

                                <button
                                    onClick={() => { setShowProfileMenu(false); p.handleDisconnect(); }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        width: "100%", padding: "10px 12px", borderRadius: 8,
                                        background: "none", border: "none", cursor: "pointer",
                                        color: "#f87171", fontFamily: "'Inter', sans-serif", fontSize: 13,
                                        textAlign: "left",
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.06)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >
                                    <LogOutIcon size={14} /> Disconnect
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ position: "relative" }}>
                        <button onClick={() => p.setShowConnectMenu(!p.showConnectMenu)} style={{
                            background: "#2563eb", border: "none", borderRadius: 20,
                            padding: "7px 14px", cursor: "pointer",
                            fontSize: 12, fontWeight: 600, color: "#fff",
                            display: "flex", alignItems: "center", gap: 6,
                        }}>
                            <WalletIcon size={13} /> Connect Wallet
                        </button>
                        {p.showConnectMenu && (
                            <div style={{
                                position: "absolute", top: "110%", right: 0,
                                minWidth: 180,
                                background: "#111", border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: 12, padding: 8,
                                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                                zIndex: 50,
                            }}>
                                <button onClick={p.handleConnect} style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    width: "100%", padding: "10px 12px", borderRadius: 8,
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 13, textAlign: "left",
                                }}>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" style={{ width: 20, height: 20 }} />
                                    MetaMask
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </header>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 32px" }}>
                {p.isConnected && !p.hasVault
                    ? <CreateVaultPage onVaultCreated={p.refetchData} />
                    : <MobileQryptSafe p={p} />
                }
            </div>

            {(["shield", "transfer", "unshield", "settings"] as ModalId[]).map(id => (
                <Modal key={id} id={id} p={p} />
            ))}
        </div>
    );
}

function TopBarWallet(p: SharedProps) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 20, padding: "5px 12px",
            }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{p.networkName}</span>
            </div>

            <div style={{
                display: "flex", alignItems: "center",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 20, overflow: "hidden",
            }}>
                <div style={{ padding: "5px 13px", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>{p.balanceStr}</span>
                </div>
                <button onClick={p.copyAddress} style={{
                    padding: "5px 13px", border: "none", background: "transparent", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                    fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.8)",
                    whiteSpace: "nowrap",
                }}>
                    {p.copied ? <CheckIcon size={10} color="#4ade80" /> : <CopyIcon size={10} color="rgba(255,255,255,0.4)" />}
                    {p.shortAddress}
                </button>
            </div>

            <button
                onClick={() => p.setActiveModal("settings")}
                style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 20, padding: "6px 10px", cursor: "pointer",
                    color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)"}
            >
                <SettingsIcon size={14} />
            </button>

            <button onClick={p.handleDisconnect} style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 20, padding: "6px 10px", cursor: "pointer",
                color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center",
            }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)"}
            >
                <LogOutIcon size={14} />
            </button>
        </div>
    );
}

function ConnectButton(p: SharedProps) {
    return (
        <div style={{ position: "relative" }}>
            <button onClick={() => p.setShowConnectMenu(!p.showConnectMenu)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 14px", borderRadius: 10,
                border: "1px solid rgba(37,99,235,0.4)", cursor: "pointer",
                background: "rgba(37,99,235,0.1)", color: "#60a5fa",
                fontSize: 13, fontWeight: 600,
            }}>
                <WalletIcon size={15} /> Connect Wallet
            </button>
            {p.showConnectMenu && (
                <div style={{
                    position: "absolute", top: "110%", right: 0, minWidth: 180,
                    background: "#111", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12, padding: 8,
                }}>
                    <button onClick={p.handleConnect} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "10px 12px", borderRadius: 8,
                        background: "none", border: "none", cursor: "pointer",
                        color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 13, textAlign: "left",
                    }}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" style={{ width: 20, height: 20 }} />
                        MetaMask
                    </button>
                </div>
            )}
        </div>
    );
}

const panelBase: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
};

function PH({ title, right }: { title: string; right?: React.ReactNode }) {
    return (
        <div style={{
            padding: "13px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{title}</p>
            {right}
        </div>
    );
}

function PB({ children, scroll }: { children: React.ReactNode; scroll?: boolean }) {
    return (
        <div style={{ flex: 1, padding: "14px 18px", overflowY: scroll ? "auto" : "hidden", minHeight: 0 }}>
            {children}
        </div>
    );
}

function SparkLine({ points, color = "#60a5fa", h = 52, full }: { points: number[]; color?: string; h?: number; full?: boolean }) {
    const vw = 300;
    const min = Math.min(...points), max = Math.max(...points);
    const range = max - min || 1;
    const xs = points.map((_, i) => (i / (points.length - 1)) * vw);
    const ys = points.map(pt => h - ((pt - min) / range) * (h - 8) - 4);
    const line = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
    const fillD = `${line} L ${vw} ${h} L 0 ${h} Z`;
    const gradId = `sg-${color.replace("#", "")}`;
    return (
        <svg width={full ? "100%" : 220} height={h} viewBox={`0 0 ${vw} ${h}`} preserveAspectRatio="none" style={{ overflow: "visible", display: "block" }}>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fillD} fill={`url(#${gradId})`} />
            <path d={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, marginBottom: 6, letterSpacing: "0.04em" }}>{label.toUpperCase()}</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", fontFamily: "monospace", marginBottom: 2 }}>{value}</p>
            {sub && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{sub}</p>}
        </div>
    );
}

function DesktopDashboard(p: SharedProps) {
    const [selected, setSelected] = useState<string>("");

    useEffect(() => {
        if (!selected && p.tokensWithBalances.length > 0) {
            setSelected(p.tokensWithBalances[0].tokenAddress);
        }
    }, [p.tokensWithBalances, selected]);

    const selectedToken = p.tokensWithBalances.find(t => t.tokenAddress === selected);
    const shieldCount = p.transactions.filter(t => t.type === "shield").length;
    const selectedTxs = p.transactions.filter(t => t.tokenAddress.toLowerCase() === selected.toLowerCase());
    const chartData = selectedToken ? buildTokenChart(p.transactions, selected, selectedToken.decimals) : [0,0,0,0,0,0,0];

    return (
        <div style={{
            position: "fixed", top: 58, left: 0, right: 0, bottom: 0,
            padding: "16px 28px 20px",
            display: "flex", flexDirection: "column",
            overflow: "hidden", boxSizing: "border-box",
        }}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14, boxSizing: "border-box" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, flexShrink: 0 }}>
                    <StatCard label="Wallet Balance" value={p.balanceStr} sub="Live" />
                    <StatCard
                        label="Shielded Qrypt-Safes"
                        value={p.tokensWithBalances.length.toString()}
                        sub={p.tokensWithBalances.length === 1 ? "active token" : "active tokens"}
                    />
                    <StatCard label="Network" value={p.networkName} sub={p.vaultAddress ? "Qrypt-Safe active" : "No Qrypt-Safe"} />
                    <StatCard label="Total Shielded Txns" value={shieldCount.toString()} sub="All time" />
                </div>

                <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "340px 1fr", gap: 14 }}>
                    <div style={{ ...panelBase }}>
                        <PH title="Active Qrypt-Safes" right={
                            <button
                                onClick={() => p.setActiveModal("shield")}
                                style={{
                                    display: "flex", alignItems: "center", gap: 5,
                                    padding: "5px 10px", borderRadius: 7,
                                    border: "1px solid rgba(37,99,235,0.35)",
                                    background: "rgba(37,99,235,0.12)", cursor: "pointer",
                                    color: "#60a5fa", fontSize: 11, fontWeight: 600,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.22)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(37,99,235,0.12)"; }}
                            >
                                <ShieldIcon size={11} /> Shield New Token
                            </button>
                        } />
                        <PB scroll>
                            {p.tokensWithBalances.length === 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, padding: "32px 0" }}>
                                    <ShieldIcon size={32} color="rgba(255,255,255,0.15)" />
                                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                                        No shielded tokens yet.<br />Shield a token to get started.
                                    </p>
                                    <button
                                        onClick={() => p.setActiveModal("shield")}
                                        style={{
                                            padding: "9px 18px", borderRadius: 8, border: "none",
                                            background: "#2563eb", color: "#fff", cursor: "pointer",
                                            fontSize: 13, fontWeight: 600,
                                        }}
                                    >
                                        Shield First Token
                                    </button>
                                </div>
                            ) : p.tokensWithBalances.map((v, i) => {
                                const isSelected = selected === v.tokenAddress;
                                return (
                                    <div key={v.tokenAddress} style={{
                                        borderBottom: i < p.tokensWithBalances.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                                    }}>
                                        <div
                                            onClick={() => setSelected(v.tokenAddress)}
                                            style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                padding: "11px 0", cursor: "pointer",
                                                background: isSelected ? "rgba(255,255,255,0.02)" : "transparent",
                                                borderRadius: isSelected ? 8 : 0,
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 7, background: `${v.color}20`, border: `1px solid ${v.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <ShieldIcon size={12} color={v.color} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#fff" : "rgba(255,255,255,0.85)" }}>q{v.tokenSymbol}</p>
                                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatBalance(v.shieldedBalance, v.decimals)}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <p style={{ fontSize: 10, color: "#4ade80" }}>Shielded</p>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div style={{ paddingBottom: 10, display: "flex", gap: 7 }}>
                                                <button
                                                    onClick={() => p.setActiveModal("transfer")}
                                                    style={{ flex: 1, padding: "8px 6px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                                                >
                                                    <SendIcon size={12} /> Transfer
                                                </button>
                                                <button
                                                    onClick={() => p.setActiveModal("unshield")}
                                                    style={{ flex: 1, padding: "8px 6px", borderRadius: 8, border: "1px solid rgba(248,113,113,0.25)", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                                                >
                                                    <LockIcon size={12} /> Unshield
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </PB>
                    </div>

                    <div style={{ ...panelBase }}>
                        {selectedToken ? (
                            <>
                                <div style={{
                                    padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                                    display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
                                }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${selectedToken.color}20`, border: `1px solid ${selectedToken.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <ShieldIcon size={14} color={selectedToken.color} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>q{selectedToken.tokenSymbol}</p>
                                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{formatBalance(selectedToken.shieldedBalance, selectedToken.decimals)} shielded</p>
                                    </div>
                                    <div style={{ marginLeft: "auto" }}>
                                        <p style={{ fontSize: 10, color: "#4ade80", textAlign: "right" }}>Shielded</p>
                                    </div>
                                </div>

                                <PB scroll>
                                    <div style={{ marginBottom: 20 }}>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 12 }}>BALANCE HISTORY</p>
                                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 14px" }}>
                                            <SparkLine points={chartData} h={80} color={selectedToken.color} full />
                                        </div>
                                    </div>

                                    <div>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 12 }}>HISTORY</p>
                                        {selectedTxs.length === 0 ? (
                                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", textAlign: "center", paddingTop: 16 }}>No history for q{selectedToken.tokenSymbol}</p>
                                        ) : selectedTxs.map((tx, i) => (
                                            <div key={tx.txHash} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < selectedTxs.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: tx.type === "shield" ? "rgba(74,222,128,0.1)" : tx.type === "transfer" ? "rgba(96,165,250,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${tx.type === "shield" ? "rgba(74,222,128,0.2)" : tx.type === "transfer" ? "rgba(96,165,250,0.2)" : "rgba(248,113,113,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        {tx.type === "shield" ? <ShieldIcon size={12} color="#4ade80" /> : tx.type === "transfer" ? <SendIcon size={12} color="#60a5fa" /> : <LockIcon size={12} color="#f87171" />}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                                                            {tx.type === "shield" ? "Shield" : tx.type === "transfer" ? "Transfer" : "Unshield"} {tx.tokenSymbol}
                                                        </p>
                                                        <p style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>{tx.txHash.slice(0, 10)}...</p>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <p style={{ fontSize: 12, fontWeight: 600, color: tx.type === "shield" ? "#4ade80" : tx.type === "transfer" ? "#60a5fa" : "#f87171" }}>
                                                        {tx.type === "shield" ? "+" : "-"}{tx.amount}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </PB>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>
                                    {p.tokensWithBalances.length === 0 ? "Shield a token to see details here." : "Select a token to view details"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MobileQryptSafe({ p }: { p: SharedProps }) {
    const [selected, setSelected] = useState<string>("");

    useEffect(() => {
        if (!selected && p.tokensWithBalances.length > 0) {
            setSelected(p.tokensWithBalances[0].tokenAddress);
        }
    }, [p.tokensWithBalances, selected]);

    const selectedToken = p.tokensWithBalances.find(t => t.tokenAddress === selected);
    const relHistory = p.transactions.filter(t => t.tokenAddress.toLowerCase() === selected.toLowerCase()).slice(0, 10);
    const chartData = selectedToken ? buildTokenChart(p.transactions, selected, selectedToken.decimals) : [0,0,0,0,0,0,0];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <StatCard label="Shielded Tokens" value={p.tokensWithBalances.length.toString()} sub="active Qrypt-Safes" />
                <StatCard label="Wallet Balance" value={p.balanceStr} sub={p.networkName} />
            </div>

            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>MY Qrypt-SafeS</p>
                    <button
                        onClick={() => p.setActiveModal("shield")}
                        style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "5px 10px", borderRadius: 7,
                            border: "1px solid rgba(37,99,235,0.35)",
                            background: "rgba(37,99,235,0.12)", cursor: "pointer",
                            color: "#60a5fa", fontSize: 11, fontWeight: 600,
                        }}
                    >
                        <ShieldIcon size={11} /> Shield New Token
                    </button>
                </div>

                {p.tokensWithBalances.length === 0 ? (
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "32px 16px", textAlign: "center" }}>
                        <ShieldIcon size={28} color="rgba(255,255,255,0.15)" style={{ margin: "0 auto 12px" }} />
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>No shielded tokens yet.</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", marginTop: 4 }}>Use Shield New Token to get started.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {p.tokensWithBalances.map(v => {
                            const isSelected = selected === v.tokenAddress;
                            return (
                                <div key={v.tokenAddress} style={{
                                    borderRadius: 14, overflow: "hidden",
                                    background: isSelected ? `${v.color}10` : "rgba(255,255,255,0.03)",
                                    border: isSelected ? `1px solid ${v.color}40` : "1px solid rgba(255,255,255,0.07)",
                                }}>
                                    <div onClick={() => setSelected(isSelected ? "" : v.tokenAddress)} style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        padding: "14px 16px", cursor: "pointer",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${v.color}20`, border: `1px solid ${v.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <ShieldIcon size={16} color={v.color} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>q{v.tokenSymbol}</p>
                                                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{formatBalance(v.shieldedBalance, v.decimals)} shielded</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <p style={{ fontSize: 11, color: "#4ade80" }}>Shielded</p>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div style={{ padding: "0 16px 14px", display: "flex", gap: 8 }}>
                                            <button onClick={() => p.setActiveModal("transfer")} style={{
                                                flex: 1, padding: "11px 8px", borderRadius: 10,
                                                border: "none", background: "#2563eb",
                                                color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                            }}>
                                                <SendIcon size={14} /> Transfer
                                            </button>
                                            <button onClick={() => p.setActiveModal("unshield")} style={{
                                                flex: 1, padding: "11px 8px", borderRadius: 10,
                                                border: "1px solid rgba(248,113,113,0.25)", background: "transparent",
                                                color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 600,
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                            }}>
                                                <LockIcon size={14} /> Unshield
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedToken && (
                <>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px" }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 12 }}>BALANCE HISTORY</p>
                        <SparkLine points={chartData} color={selectedToken.color} h={72} full />
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>Qrypt-Safe DETAILS</p>
                        </div>
                        {[
                            { label: "Token", value: `q${selectedToken.tokenSymbol}` },
                            { label: "Shielded Balance", value: formatBalance(selectedToken.shieldedBalance, selectedToken.decimals) },
                            { label: "Status", value: "Shielded" },
                            { label: "Total Txns", value: p.transactions.filter(t => t.tokenAddress.toLowerCase() === selected.toLowerCase()).length.toString() },
                        ].map((row, i, arr) => (
                            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{row.label}</span>
                                <span style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{row.value}</span>
                            </div>
                        ))}
                    </div>

                    <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 12 }}>ACTIVITY</p>
                        {relHistory.length === 0 ? (
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", textAlign: "center", paddingTop: 12 }}>No history</p>
                        ) : relHistory.map((tx, i) => (
                            <div key={tx.txHash} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < relHistory.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: tx.type === "shield" ? "rgba(74,222,128,0.1)" : tx.type === "transfer" ? "rgba(96,165,250,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${tx.type === "shield" ? "rgba(74,222,128,0.2)" : tx.type === "transfer" ? "rgba(96,165,250,0.2)" : "rgba(248,113,113,0.2)"}` }}>
                                        {tx.type === "shield" ? <ShieldIcon size={12} color="#4ade80" /> : tx.type === "transfer" ? <SendIcon size={12} color="#60a5fa" /> : <LockIcon size={12} color="#f87171" />}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                                            {tx.type === "shield" ? "Shield" : tx.type === "transfer" ? "Transfer" : "Unshield"}
                                        </p>
                                        <p style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>{tx.txHash.slice(0, 10)}...</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: tx.type === "shield" ? "#4ade80" : tx.type === "transfer" ? "#60a5fa" : "#f87171" }}>
                                        {tx.type === "shield" ? "+" : "-"}{tx.amount}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function ModalVaults({ p }: { p: SharedProps }) {
    const [selected, setSelected] = useState<string>(p.tokensWithBalances[0]?.tokenAddress || "");
    const selectedToken = p.tokensWithBalances.find(t => t.tokenAddress === selected);
    const chartData = selectedToken ? buildTokenChart(p.transactions, selected, selectedToken.decimals) : [0,0,0,0,0,0,0];
    const relHistory = p.transactions.filter(t => t.tokenAddress.toLowerCase() === selected.toLowerCase()).slice(0, 10);

    if (p.tokensWithBalances.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
                <ShieldIcon size={36} color="rgba(255,255,255,0.15)" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>No shielded tokens yet.</p>
                <button onClick={() => p.setActiveModal("shield")} style={{
                    padding: "10px 20px", borderRadius: 10, border: "none",
                    background: "#2563eb", color: "#fff", cursor: "pointer",
                    fontSize: 13, fontWeight: 600,
                }}>
                    Shield Your First Token
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {p.tokensWithBalances.map(v => (
                    <button key={v.tokenAddress} onClick={() => setSelected(v.tokenAddress)} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                        background: selected === v.tokenAddress ? `${v.color}12` : "rgba(255,255,255,0.03)",
                        border: selected === v.tokenAddress ? `1px solid ${v.color}50` : "1px solid rgba(255,255,255,0.07)",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${v.color}20`, border: `1px solid ${v.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ShieldIcon size={14} color={v.color} />
                            </div>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>q{v.tokenSymbol}</p>
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatBalance(v.shieldedBalance, v.decimals)}</p>
                            </div>
                        </div>
                        <p style={{ fontSize: 10, color: "#4ade80" }}>Shielded</p>
                    </button>
                ))}
                <button onClick={() => p.setActiveModal("shield")} style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "11px", borderRadius: 10,
                    border: "1px dashed rgba(37,99,235,0.3)", cursor: "pointer",
                    background: "transparent", color: "#60a5fa", fontSize: 13, fontWeight: 600,
                }}>
                    <ShieldIcon size={14} /> Shield New Token
                </button>
            </div>

            {selectedToken && (
                <>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 12 }}>BALANCE HISTORY</p>
                        <SparkLine points={chartData} color={selectedToken.color} h={64} full />
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => p.setActiveModal("shield")} style={{ flex: 1, padding: "11px 8px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <ShieldIcon size={14} /> Shield
                        </button>
                        <button onClick={() => p.setActiveModal("transfer")} style={{ flex: 1, padding: "11px 8px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <SendIcon size={14} /> Transfer
                        </button>
                        <button onClick={() => p.setActiveModal("unshield")} style={{ flex: 1, padding: "11px 8px", borderRadius: 10, border: "1px solid rgba(248,113,113,0.2)", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <LockIcon size={14} /> Unshield
                        </button>
                    </div>

                    <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 12 }}>ACTIVITY</p>
                        {relHistory.length === 0 ? (
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", textAlign: "center", paddingTop: 12 }}>No history</p>
                        ) : relHistory.map((tx, i) => (
                            <div key={tx.txHash} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < relHistory.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: tx.type === "shield" ? "rgba(74,222,128,0.1)" : tx.type === "transfer" ? "rgba(96,165,250,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${tx.type === "shield" ? "rgba(74,222,128,0.2)" : tx.type === "transfer" ? "rgba(96,165,250,0.2)" : "rgba(248,113,113,0.2)"}` }}>
                                        {tx.type === "shield" ? <ShieldIcon size={12} color="#4ade80" /> : tx.type === "transfer" ? <SendIcon size={12} color="#60a5fa" /> : <LockIcon size={12} color="#f87171" />}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                                            {tx.type === "shield" ? "Shield" : tx.type === "transfer" ? "Transfer" : "Unshield"} q{selectedToken.tokenSymbol}
                                        </p>
                                        <p style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>{tx.txHash.slice(0, 10)}...</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: tx.type === "shield" ? "#4ade80" : tx.type === "transfer" ? "#60a5fa" : "#f87171" }}>
                                        {tx.type === "shield" ? "+" : "-"}{tx.amount}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function ModalSettingsNoVault({ p }: { p: SharedProps }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Wallet</span>
                    <span style={{ fontSize: 12, color: "#fff", fontFamily: "monospace" }}>{p.shortAddress}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Network</span>
                    <span style={{ fontSize: 13, color: "#fff" }}>{p.networkName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px" }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Qrypt-Safe</span>
                    <span style={{ fontSize: 13, color: "#f87171" }}>Not created</span>
                </div>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
                Create a Qrypt-Safe to access security settings.
            </p>
        </div>
    );
}
