import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAccount, useChainId, useDisconnect, useConnect, useBalance, useReadContracts, useSwitchChain } from "wagmi";
import type { Connector } from "wagmi";
import { formatUnits } from "viem";
import { useQuery } from "@tanstack/react-query";
import {
    ShieldIcon, SendIcon, SettingsIcon,
    WalletIcon, LogOutIcon, CopyIcon, CheckIcon, LockIcon,
    AlertTriangleIcon, UserIcon, XIcon, PlusIcon, ExternalLinkIcon, ArrowDownIcon,
    WifiOffIcon, ScanLineIcon,
} from "lucide-react";
import { getTxEtherscanUrl } from "@/lib/utils";
import { useVault } from "@/hooks/useVault";
import type { VaultVersion } from "@/hooks/useVault";
import CreateVaultPage from "@/pages/CreateVaultPage";
import ShieldPanel from "@/components/ShieldPanel";
import TransferPanel from "@/components/TransferPanel";
import UnshieldPanel from "@/components/UnshieldPanel";
import SettingsPanel from "@/components/SettingsPanel";
import TransferModeSelector from "@/components/TransferModeSelector";
import QryptAirSenderPanel from "@/components/QryptAirSenderPanel";
import QryptAirRecipientPanel from "@/components/QryptAirRecipientPanel";
import QryptShieldGate from "@/components/QryptShieldGate";
import TokenLogo from "@/components/TokenLogo";
import { fetchTransactions, fetchPortfolio } from "@/lib/api";
import { PERSONAL_VAULT_ABI, PERSONAL_VAULT_V6_ABI, ERC20_ABI } from "@/lib/abi";
import { SUPPORTED_CHAIN_IDS } from "@/lib/wagmi";
import { hasAppKit, appKitModal } from "@/lib/appkit";

const TOKEN_COLORS = ["#60a5fa","#a78bfa","#fb923c","#facc15","#c084fc","#2dd4bf","#f472b6","#38bdf8","#f87171","#4ade80"];

const KNOWN_TOKENS_BY_CHAIN: Record<number, Array<{ address: string; symbol: string; name: string }>> = {
    11155111: [
        { address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", symbol: "USDC",  name: "USD Coin" },
        { address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", symbol: "WETH",  name: "Wrapped Ether" },
        { address: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357", symbol: "DAI",   name: "Dai Stablecoin" },
        { address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", symbol: "USDT",  name: "Tether USD" },
        { address: "0x779877A7B0D9E8603169DdbD7836e478b4624789", symbol: "LINK",  name: "ChainLink Token" },
        { address: "0x08210F9170F89Ab7658F0B5E3fF39b0E03C2Bfa", symbol: "EURC",  name: "Euro Coin" },
    ],
    1: [
        { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC",  name: "USD Coin" },
        { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH",  name: "Wrapped Ether" },
        { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI",   name: "Dai Stablecoin" },
        { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT",  name: "Tether USD" },
        { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK",  name: "ChainLink Token" },
    ],
};

interface ApiTransaction {
    id: number;
    txHash: string;
    type: "shield" | "unshield" | "transfer" | "receive" | "fund" | "reclaim" | "voucher" | "air-send" | "air-receive";
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

type ModalId = "shield" | "transfer" | "unshield" | "vaults" | "settings" | "transfer-select" | "qryptair-sender" | "qryptair-fund" | "qryptair-recipient" | "qryptshield" | "upgrade-v6";

interface WalletErc20Token {
    address: string;
    symbol: string;
    name: string;
    balance: bigint | undefined;
    decimals: number;
    color: string;
}

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
    vaultVersion: VaultVersion;
    vaultAddress: `0x${string}` | undefined;
    copied: boolean;
    copyAddress: () => void;
    showConnectMenu: boolean;
    setShowConnectMenu: (v: boolean) => void;
    handleDisconnect: () => void;
    handleConnectWith: (connector: Connector) => void;
    connectError: string | null;
    setConnectError: (e: string | null) => void;
    availableConnectors: readonly Connector[];
    isMobile: boolean;
    tokensWithBalances: TokenWithBalance[];
    walletErc20Balances: WalletErc20Token[];
    transactions: ApiTransaction[];
    refetchData: () => void;
    refetchBalances: () => void;
    activeUnshieldToken: string;
    setActiveUnshieldToken: (addr: string) => void;
    activeShieldToken: string;
    setActiveShieldToken: (addr: string) => void;
    activeTransferToken: string;
    setActiveTransferToken: (addr: string) => void;
    airBudgets: { [tokenAddress: string]: bigint };
}

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { disconnect } = useDisconnect();
    const { connect, connectors } = useConnect();
    const { vaultAddress, hasVault, vaultVersion } = useVault();
    const { data: balance } = useBalance({ address });

    const [activeModal, setActiveModal] = useState<ModalId | null>(null);
    const [activeUnshieldToken, setActiveUnshieldToken] = useState("");
    const [activeShieldToken, setActiveShieldToken] = useState("");
    const [activeTransferToken, setActiveTransferToken] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showConnectMenu, setShowConnectMenu] = useState(false);
    const [connectError, setConnectError] = useState<string | null>(null);

    const { data: txData, refetch: refetchTx } = useQuery({
        queryKey: ["transactions", address],
        queryFn: () => fetchTransactions(address!, 100),
        enabled: !!address && isConnected,
        refetchInterval: 30000,
    });

    const transactions: ApiTransaction[] = useMemo(() => {
        return txData?.transactions || [];
    }, [txData]);

    // On-chain vault scan: probe known tokens against vault.qTokens()
    const knownTokens = useMemo(() => KNOWN_TOKENS_BY_CHAIN[chainId ?? 11155111] ?? [], [chainId]);

    const qTokenProbeContracts = useMemo(() => {
        if (!vaultAddress || !hasVault || knownTokens.length === 0) return [];
        return knownTokens.map(t => ({
            address: vaultAddress,
            abi: PERSONAL_VAULT_ABI,
            functionName: "qTokens" as const,
            args: [t.address as `0x${string}`],
        }));
    }, [vaultAddress, hasVault, knownTokens]);

    const { data: qTokenProbeResults } = useReadContracts({ contracts: qTokenProbeContracts });

    const shieldedTokenAddresses = useMemo(() => {
        const map = new Map<string, { tokenAddress: string; tokenSymbol: string; tokenName: string; index: number }>();

        // Priority 1: API transaction history (has richer metadata)
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

        // Priority 2: On-chain vault scan (qTokens mapping != zero address)
        if (qTokenProbeResults) {
            const ZERO = "0x0000000000000000000000000000000000000000";
            knownTokens.forEach((t, i) => {
                const result = qTokenProbeResults[i];
                const qAddr = result?.result as string | undefined;
                if (qAddr && qAddr.toLowerCase() !== ZERO) {
                    const key = t.address.toLowerCase();
                    if (!map.has(key)) {
                        map.set(key, {
                            tokenAddress: t.address,
                            tokenSymbol: t.symbol,
                            tokenName: t.name,
                            index: map.size,
                        });
                    }
                }
            });
        }

        return Array.from(map.values());
    }, [transactions, qTokenProbeResults, knownTokens]);

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

    const { data: balanceResults, refetch: refetchBalances } = useReadContracts({
        contracts: balanceContracts,
        query: { refetchInterval: 15_000 },
    });
    const { data: decimalsResults } = useReadContracts({ contracts: decimalsContracts });

    const airBudgetContracts = useMemo(() => {
        if (!vaultAddress || vaultVersion !== "v6" || shieldedTokenAddresses.length === 0) return [];
        return shieldedTokenAddresses.map(t => ({
            address: vaultAddress,
            abi: PERSONAL_VAULT_V6_ABI,
            functionName: "getAirBudget" as const,
            args: [t.tokenAddress as `0x${string}`],
        }));
    }, [vaultAddress, vaultVersion, shieldedTokenAddresses]);

    const { data: airBudgetResults, refetch: refetchAirBudgets } = useReadContracts({
        contracts: airBudgetContracts,
        query: { refetchInterval: 15_000 },
    });

    const airBudgets = useMemo(() => {
        const map: { [tokenAddress: string]: bigint } = {};
        if (!airBudgetResults) return map;
        shieldedTokenAddresses.forEach((t, i) => {
            const val = airBudgetResults[i]?.result as bigint | undefined;
            map[t.tokenAddress.toLowerCase()] = val ?? 0n;
        });
        return map;
    }, [airBudgetResults, shieldedTokenAddresses]);

    const { data: portfolioData } = useQuery({
        queryKey: ["portfolio", address, chainId],
        queryFn: () => fetchPortfolio(address!, chainId),
        enabled: !!address && isConnected,
        refetchInterval: 30_000,
        staleTime: 15_000,
    });

    const walletErc20Balances: WalletErc20Token[] = useMemo(() => {
        if (!portfolioData) return [];
        return portfolioData.flatMap((t, i) => {
            try {
                const bal = String(t.balance ?? "0").trim();
                const balance = /^\d+$/.test(bal) ? BigInt(bal) : 0n;
                if (balance === 0n) return [];
                return [{
                    address: t.address,
                    symbol: t.symbol,
                    name: t.name,
                    balance,
                    decimals: t.decimals,
                    color: TOKEN_COLORS[i % TOKEN_COLORS.length],
                }];
            } catch {
                return [];
            }
        });
    }, [portfolioData]);

    const tokensWithBalances: TokenWithBalance[] = useMemo(() => {
        return shieldedTokenAddresses
            .map((t, i) => ({
                tokenAddress: t.tokenAddress,
                tokenSymbol: t.tokenSymbol,
                tokenName: t.tokenName,
                shieldedBalance: balanceResults?.[i]?.result as bigint | undefined,
                decimals: (decimalsResults?.[i]?.result as number | undefined) ?? 18,
                color: TOKEN_COLORS[t.index % TOKEN_COLORS.length],
            }));
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

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setActiveTransferToken("");
        setActiveShieldToken("");
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [closeModal]);

    useEffect(() => {
        if (!address || !chainId) return;
        import("@/lib/railgun").then(({ ensureRailgunEngine, loadRailgunProvider }) => {
            ensureRailgunEngine().catch(() => {});
            loadRailgunProvider(chainId).catch(() => {});
        });
    }, [address, chainId]);

    const copyAddress = () => {
        if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    };

    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
    const networkName = getNetworkName(chainId);
    const balanceStr = balance ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} ${balance.symbol}` : "0.0000 ETH";

    const sharedProps: SharedProps = {
        activeModal, setActiveModal, closeModal,
        isConnected, address, shortAddress,
        chainId, networkName, balanceStr, hasVault, vaultVersion, vaultAddress,
        copied, copyAddress,
        showConnectMenu, setShowConnectMenu,
        handleDisconnect: disconnect,
        handleConnectWith: (connector: Connector) => {
            setConnectError(null);
            if (hasAppKit && appKitModal) {
                appKitModal.open();
                setShowConnectMenu(false);
                return;
            }
            const isInjected = connector.type === "injected" || connector.id === "injected" || connector.id === "io.metamask";
            const isInIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
            if (isInjected && isInIframe) {
                setConnectError("iframe");
                setShowConnectMenu(false);
                return;
            }
            connect({ connector });
            setShowConnectMenu(false);
        },
        connectError,
        setConnectError,
        availableConnectors: connectors,
        isMobile,
        tokensWithBalances,
        walletErc20Balances,
        transactions,
        refetchData: refetchTx,
        refetchBalances,
        activeUnshieldToken,
        setActiveUnshieldToken,
        activeShieldToken,
        setActiveShieldToken,
        activeTransferToken,
        setActiveTransferToken,
        airBudgets,
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
        if (tx.type === "shield" || tx.type === "receive") cumulative += amount;
        else cumulative = Math.max(0, cumulative - amount);
        points.push(cumulative);
    }
    while (points.length < 7) points.unshift(points[0] ?? 0);
    return points.slice(-7);
}

const MODAL_TITLES: Record<ModalId, string> = {
    shield:              "Shield Tokens",
    transfer:            "QryptSafe Transfer",
    unshield:            "Unshield Tokens",
    vaults:              "My Qrypt-Safe",
    settings:            "Settings",
    "transfer-select":   "Transfer",
    "qryptair-sender":   "QryptAir · Send",
    "qryptair-fund":     "QryptAir · Fund Air Bags",
    "qryptair-recipient":"QryptAir · Receive",
    qryptshield:         "QryptShield",
    "upgrade-v6":        "Upgrade to V6 Qrypt-Safe",
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
                        <ShieldPanel
                            key={p.activeShieldToken || "none"}
                            vaultAddress={p.vaultAddress}
                            walletAddress={p.address}
                            chainId={p.chainId}
                            vaultVersion={p.vaultVersion}
                            onShieldSuccess={() => { p.refetchData(); p.refetchBalances(); }}
                            initialTokenAddress={p.activeShieldToken || undefined}
                        />
                    )}
                    {id === "shield" && (!p.vaultAddress || !p.address) && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                            Connect your wallet and create a Qrypt-Safe first.
                        </p>
                    )}
                    {id === "transfer" && p.vaultAddress && p.address && (
                        <TransferPanel key={p.activeTransferToken || "none"} vaultAddress={p.vaultAddress} walletAddress={p.address} chainId={p.chainId} vaultVersion={p.vaultVersion} initialTokenAddress={p.activeTransferToken || undefined} />
                    )}
                    {id === "transfer" && (!p.vaultAddress || !p.address) && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                            Connect your wallet and create a Qrypt-Safe first.
                        </p>
                    )}
                    {id === "transfer-select" && (
                        <TransferModeSelector
                            hasVault={p.hasVault}
                            onSelect={mode => {
                                if (mode === "qryptsafe") p.setActiveModal("transfer");
                                else if (mode === "qryptair-send") p.setActiveModal("qryptair-sender");
                                else if (mode === "qryptshield") p.setActiveModal("qryptshield");
                            }}
                        />
                    )}
                    {(id === "qryptair-sender" || id === "qryptair-fund") && p.address && (
                        <QryptAirSenderPanel
                            key={(p.activeTransferToken || "none") + id}
                            walletAddress={p.address}
                            chainId={p.chainId}
                            tokensWithBalances={p.tokensWithBalances}
                            initialTokenAddress={p.activeTransferToken || undefined}
                            initialShowBudgetManager={id === "qryptair-fund"}
                            vaultVersion={p.vaultVersion}
                            vaultAddress={p.vaultAddress}
                            airBudgets={p.airBudgets}
                        />
                    )}
                    {(id === "qryptair-sender" || id === "qryptair-fund") && !p.address && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                            Connect your wallet to create a voucher.
                        </p>
                    )}
                    {id === "qryptair-recipient" && (
                        <QryptAirRecipientPanel
                            walletAddress={p.address}
                            onComplete={() => { p.refetchData(); p.refetchBalances(); }}
                        />
                    )}
                    {id === "qryptshield" && p.vaultAddress && p.address && (
                        <QryptShieldGate
                            key={p.activeTransferToken || "none"}
                            vaultAddress={p.vaultAddress}
                            walletAddress={p.address}
                            chainId={p.chainId}
                            tokensWithBalances={p.tokensWithBalances}
                            initialTokenAddress={p.activeTransferToken || undefined}
                            vaultVersion={p.vaultVersion ?? "v5"}
                            onComplete={() => { p.refetchData(); p.refetchBalances(); }}
                            onCancel={p.closeModal}
                        />
                    )}
                    {id === "qryptshield" && (!p.vaultAddress || !p.address) && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                            Connect your wallet and create a Qrypt-Safe first.
                        </p>
                    )}
                    {id === "unshield" && p.vaultAddress && p.address && (
                        <UnshieldPanel
                            vaultAddress={p.vaultAddress}
                            walletAddress={p.address}
                            chainId={p.chainId}
                            vaultVersion={p.vaultVersion}
                            initialTokenAddress={p.activeUnshieldToken || undefined}
                            onComplete={() => { p.refetchData(); p.refetchBalances(); }}
                        />
                    )}
                    {id === "unshield" && (!p.vaultAddress || !p.address) && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                            Connect your wallet and create a Qrypt-Safe first.
                        </p>
                    )}
                    {id === "vaults" && <ModalVaults p={p} />}
                    {id === "settings" && p.vaultAddress && (
                        <SettingsPanel vaultAddress={p.vaultAddress} walletAddress={p.address} vaultVersion={p.vaultVersion} chainId={p.chainId} />
                    )}
                    {id === "settings" && !p.vaultAddress && (
                        <ModalSettingsNoVault p={p} />
                    )}
                    {id === "upgrade-v6" && p.address && (
                        <CreateVaultPage onVaultCreated={() => { p.closeModal(); p.refetchData(); }} />
                    )}
                    {id === "upgrade-v6" && !p.address && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                            Connect your wallet first.
                        </p>
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
                borderBottom: "1px solid rgba(255,255,255,0.15)",
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

            {(["shield", "transfer", "unshield", "vaults", "settings", "transfer-select", "qryptair-sender", "qryptair-fund", "qryptair-recipient", "qryptshield", "upgrade-v6"] as ModalId[]).map(id => (
                <Modal key={id} id={id} p={p} />
            ))}
        </div>
    );
}

function MobileProfileTab({ p }: { p: SharedProps }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 18px" }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 12, letterSpacing: "0.07em", fontWeight: 600 }}>CONNECTED WALLET</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
                    <span style={{ fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{p.shortAddress}</span>
                    <button onClick={p.copyAddress} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0, marginLeft: "auto", display: "flex" }}>
                        {p.copied ? <CheckIcon size={13} color="#4ade80" /> : <CopyIcon size={13} />}
                    </button>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{p.balanceStr}</p>
                {p.walletErc20Balances.length > 0 && (
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.07em", margin: 0, fontWeight: 600 }}>PORTFOLIO</p>
                        {p.walletErc20Balances.map(t => (
                            <div key={t.address} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                    <TokenLogo tokenAddress={t.address} tokenSymbol={t.symbol} color={t.color} size={24} />
                                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{t.symbol}</span>
                                </div>
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "monospace" }}>
                                    {t.balance !== undefined ? parseFloat(formatUnits(t.balance, t.decimals)).toFixed(4) : "..."}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button onClick={() => p.setActiveModal("settings")} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%",
                padding: "15px 18px", borderRadius: 12,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer", color: "rgba(255,255,255,0.7)", fontFamily: "'Inter', sans-serif",
                fontSize: 14, textAlign: "left",
            }}>
                <SettingsIcon size={17} /> Settings
            </button>

            <button onClick={p.handleDisconnect} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%",
                padding: "15px 18px", borderRadius: 12,
                background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)",
                cursor: "pointer", color: "#f87171", fontFamily: "'Inter', sans-serif",
                fontSize: 14, textAlign: "left",
            }}>
                <LogOutIcon size={17} /> Disconnect
            </button>
        </div>
    );
}

function MobileLayout(p: SharedProps) {
    const [mobileNavTab, setMobileNavTab] = useState<"safes" | "air" | "profile">("safes");

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <header style={{
                height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.97)", position: "sticky", top: 0, zIndex: 20,
            }}>
                <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 0 }}>
                    <img src="/qryptum-logo.png" alt="Qryptum" style={{ height: 32, width: 32, objectFit: "contain" }} />
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "-0.01em", marginLeft: -4 }}>QRYPTUM</span>
                </a>

                {p.isConnected && p.hasVault ? (
                    <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                        <button onClick={() => p.setActiveModal("qryptair-recipient")} style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "#F59E0B",
                        }}>
                            <ScanLineIcon size={15} />
                        </button>
                        <button onClick={() => p.setActiveModal("shield")} style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "#4ade80",
                        }}>
                            <PlusIcon size={16} />
                        </button>
                    </div>
                ) : !p.isConnected ? (
                    <div style={{ position: "relative" }}>
                        <button onClick={() => {
                            p.setConnectError(null);
                            if (hasAppKit && appKitModal) { appKitModal.open(); }
                            else { p.setShowConnectMenu(!p.showConnectMenu); }
                        }} style={{
                            background: "#2563eb", border: "none", borderRadius: 20,
                            padding: "7px 14px", cursor: "pointer",
                            fontSize: 12, fontWeight: 600, color: "#fff",
                            display: "flex", alignItems: "center", gap: 6,
                        }}>
                            <WalletIcon size={13} /> Connect Wallet
                        </button>
                        {!hasAppKit && p.showConnectMenu && !p.connectError && (
                            <ConnectorMenu connectors={p.availableConnectors} onConnect={p.handleConnectWith} />
                        )}
                        {!hasAppKit && p.connectError === "iframe" && (
                            <IframeErrorPopup onOpen={() => { window.open(window.location.href, "_blank"); p.setConnectError(null); }} onDismiss={() => p.setConnectError(null)} />
                        )}
                    </div>
                ) : null}
            </header>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 90px" }}>
                {p.isConnected && !p.hasVault
                    ? <CreateVaultPage onVaultCreated={p.refetchData} />
                    : mobileNavTab === "profile"
                        ? <MobileProfileTab p={p} />
                        : <MobileQryptSafe p={p} mobileTab={mobileNavTab === "air" ? "air" : "safes"} />
                }
            </div>

            {p.isConnected && (
                <nav style={{
                    position: "fixed", bottom: 0, left: 0, right: 0, height: 66,
                    background: "#000", borderTop: "1px solid rgba(255,255,255,0.1)",
                    display: "flex", zIndex: 30,
                }}>
                    {([
                        { id: "safes" as const, icon: <ShieldIcon size={21} />, label: "QRYPT-SAFES", color: "#22C55E" },
                        { id: "air" as const, icon: <WifiOffIcon size={21} />, label: "AIR BAGS", color: "#F59E0B" },
                        { id: "profile" as const, icon: <UserIcon size={21} />, label: "PROFILE", color: "#60a5fa" },
                    ]).map(tab => {
                        const isActive = mobileNavTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setMobileNavTab(tab.id)} style={{
                                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                                justifyContent: "center", gap: 4, background: "none", border: "none",
                                cursor: "pointer", transition: "color 0.15s",
                                color: isActive ? tab.color : "rgba(255,255,255,0.25)",
                                borderTop: isActive ? `2px solid ${tab.color}` : "2px solid transparent",
                            }}>
                                {tab.icon}
                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em" }}>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            )}

            {(["shield", "transfer", "unshield", "settings", "transfer-select", "qryptair-sender", "qryptair-fund", "qryptair-recipient", "qryptshield", "upgrade-v6"] as ModalId[]).map(id => (
                <Modal key={id} id={id} p={p} />
            ))}
        </div>
    );
}

const NETWORKS = [
    { chainId: 1,        name: "Ethereum", dot: "#4ade80" },
    { chainId: 11155111, name: "Sepolia",  dot: "#a78bfa" },
] as const;

function TopBarWallet(p: SharedProps) {
    const [showPortfolio, setShowPortfolio] = useState(false);
    const [showNetworks, setShowNetworks] = useState(false);
    const portfolioRef = useRef<HTMLDivElement>(null);
    const networkRef = useRef<HTMLDivElement>(null);
    const { switchChain, isPending: isSwitching } = useSwitchChain();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (portfolioRef.current && !portfolioRef.current.contains(e.target as Node)) {
                setShowPortfolio(false);
            }
            if (networkRef.current && !networkRef.current.contains(e.target as Node)) {
                setShowNetworks(false);
            }
        };
        if (showPortfolio || showNetworks) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showPortfolio, showNetworks]);

    const currentNet = NETWORKS.find(n => n.chainId === p.chainId) ?? { name: p.networkName, dot: "#f59e0b" };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Network selector */}
            <div style={{ position: "relative" }} ref={networkRef}>
                <button
                    onClick={() => { setShowNetworks(v => !v); setShowPortfolio(false); }}
                    style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: 20, padding: "5px 12px", cursor: "pointer",
                    }}
                    title="Switch network"
                >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: currentNet.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                        {isSwitching ? "Switching..." : currentNet.name}
                    </span>
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.4, transform: showNetworks ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                        <path d="M2 3.5L5 6.5L8 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                {showNetworks && (
                    <div style={{
                        position: "absolute", top: "calc(100% + 8px)", left: 0,
                        background: "#111", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 12, overflow: "hidden", minWidth: 140,
                        boxShadow: "0 16px 48px rgba(0,0,0,0.7)", zIndex: 60,
                    }}>
                        {NETWORKS.map(net => (
                            <button
                                key={net.chainId}
                                onClick={() => { switchChain({ chainId: net.chainId }); setShowNetworks(false); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    width: "100%", padding: "10px 14px", border: "none",
                                    background: p.chainId === net.chainId ? "rgba(255,255,255,0.06)" : "transparent",
                                    cursor: "pointer",
                                }}
                            >
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: net.dot, flexShrink: 0 }} />
                                <span style={{ fontSize: 13, color: p.chainId === net.chainId ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: p.chainId === net.chainId ? 600 : 400 }}>
                                    {net.name}
                                </span>
                                {p.chainId === net.chainId && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" style={{ marginLeft: "auto" }}>
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ position: "relative" }} ref={portfolioRef}>
                <div
                    style={{
                        display: "flex", alignItems: "center",
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: 20, overflow: "hidden",
                    }}
                >
                    <button
                        onClick={() => setShowPortfolio(v => !v)}
                        style={{
                            padding: "5px 13px", border: "none",
                            background: showPortfolio ? "rgba(255,255,255,0.06)" : "transparent",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                            borderRight: "1px solid rgba(255,255,255,0.08)",
                        }}
                        title="View wallet portfolio"
                    >
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>{p.balanceStr}</span>
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 1, opacity: 0.4, transform: showPortfolio ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                            <path d="M2 3.5L5 6.5L8 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
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

                {showPortfolio && (
                    <div style={{
                        position: "absolute", top: "calc(100% + 8px)", right: 0,
                        minWidth: 240, maxWidth: 300,
                        background: "#111", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 14, padding: 8,
                        boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                        zIndex: 60,
                    }}>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.08em", padding: "4px 12px 6px", textTransform: "uppercase", margin: 0 }}>
                            Wallet Portfolio
                        </p>
                        <div style={{ padding: "6px 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <TokenLogo tokenAddress="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" tokenSymbol="ETH" color="#818cf8" size={28} />
                                    <div>
                                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#fff" }}>ETH</p>
                                        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Ethereum</p>
                                    </div>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "monospace" }}>{p.balanceStr.split(" ")[0]}</span>
                            </div>
                        </div>
                        {p.walletErc20Balances.length === 0 ? (
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", padding: "10px 12px", margin: 0, textAlign: "center" }}>
                                No ERC-20 tokens found
                            </p>
                        ) : (
                            p.walletErc20Balances.map((t, i) => (
                                <div key={t.address} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "8px 12px", borderRadius: 8,
                                    borderBottom: i < p.walletErc20Balances.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <TokenLogo tokenAddress={t.address} tokenSymbol={t.symbol} color={t.color} size={28} />
                                        <div>
                                            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#fff" }}>{t.symbol}</p>
                                            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{t.name}</p>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "monospace" }}>
                                        {t.balance !== undefined ? parseFloat(formatUnits(t.balance, t.decimals)).toFixed(4) : "..."}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
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

function connectorIcon(id: string): string {
    if (id === "io.metamask" || id === "metaMask") return "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg";
    if (id === "walletConnect") return "https://avatars.githubusercontent.com/u/37784886?s=200&v=4";
    return "";
}

function ConnectorMenu({ connectors, onConnect }: { connectors: readonly Connector[]; onConnect: (c: Connector) => void }) {
    const seen = new Set<string>();
    const unique = connectors.filter(c => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
    });
    return (
        <div style={{
            position: "absolute", top: "110%", right: 0, minWidth: 220,
            background: "#111", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12, padding: 8, zIndex: 50,
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
        }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.08em", padding: "4px 12px 8px", textTransform: "uppercase" }}>Connect Wallet</p>
            {unique.map(c => {
                const icon = connectorIcon(c.id);
                return (
                    <button key={c.id} onClick={() => onConnect(c)} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "10px 12px", borderRadius: 8,
                        background: "none", border: "none", cursor: "pointer",
                        color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 13, textAlign: "left",
                    }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                        {icon
                            ? <img src={icon} alt={c.name} style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0 }} />
                            : <WalletIcon size={18} style={{ flexShrink: 0, color: "rgba(255,255,255,0.5)" }} />
                        }
                        <span>{c.name}</span>
                    </button>
                );
            })}
        </div>
    );
}

function IframeErrorPopup({ onOpen, onDismiss }: { onOpen: () => void; onDismiss: () => void }) {
    return (
        <div style={{
            position: "absolute", top: "110%", right: 0, width: 268, zIndex: 50,
            background: "#1a1a1a", border: "1px solid rgba(245,158,11,0.4)",
            borderRadius: 12, padding: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, flex: 1, paddingRight: 8 }}>
                    Injected wallets cannot connect inside the preview iframe.<br />
                    Open in a new tab to use MetaMask or any browser wallet.
                </p>
                <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0, flexShrink: 0 }}>
                    <XIcon size={14} />
                </button>
            </div>
            <button onClick={onOpen} style={{
                width: "100%", padding: "9px 12px", borderRadius: 8,
                background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)",
                color: "#f59e0b", fontFamily: "'Inter', sans-serif", fontSize: 13,
                fontWeight: 600, cursor: "pointer",
            }}>
                Open in New Tab
            </button>
        </div>
    );
}

function ConnectButton(p: SharedProps) {
    const handleClick = () => {
        p.setConnectError(null);
        if (hasAppKit && appKitModal) {
            appKitModal.open();
        } else {
            p.setShowConnectMenu(!p.showConnectMenu);
        }
    };
    return (
        <div style={{ position: "relative" }}>
            <button onClick={handleClick} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 14px", borderRadius: 10,
                border: "1px solid rgba(37,99,235,0.4)", cursor: "pointer",
                background: "rgba(37,99,235,0.1)", color: "#60a5fa",
                fontSize: 13, fontWeight: 600,
            }}>
                <WalletIcon size={15} /> Connect Wallet
            </button>
            {!hasAppKit && p.showConnectMenu && !p.connectError && (
                <ConnectorMenu connectors={p.availableConnectors} onConnect={p.handleConnectWith} />
            )}
            {!hasAppKit && p.connectError === "iframe" && (
                <IframeErrorPopup onOpen={() => { window.open(window.location.href, "_blank"); p.setConnectError(null); }} onDismiss={() => p.setConnectError(null)} />
            )}
        </div>
    );
}

const panelBase: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
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

const COINGECKO_IDS: Record<string, string> = {
    USDC: "usd-coin", USDT: "tether", DAI: "dai",
    WETH: "weth", ETH: "ethereum", LINK: "chainlink",
    EURC: "euro-coin", WBTC: "wrapped-bitcoin",
    UNI: "uniswap", AAVE: "aave", MATIC: "matic-network",
    SHIB: "shiba-inu", PEPE: "pepe", ARB: "arbitrum", OP: "optimism",
};

function PriceChart({ symbol, color }: { symbol: string; color: string }) {
    const cgId = COINGECKO_IDS[symbol?.toUpperCase() ?? ""] ?? null;
    const { data, isLoading } = useQuery({
        queryKey: ["price-chart", cgId],
        queryFn: async () => {
            if (!cgId) return null;
            const r = await fetch(
                `https://api.coingecko.com/api/v3/coins/${cgId}/market_chart?vs_currency=usd&days=7&interval=daily`
            );
            if (!r.ok) return null;
            return r.json() as Promise<{ prices: [number, number][] }>;
        },
        enabled: !!cgId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
    const prices = (data?.prices ?? []).map(([, p]) => p);
    const currentPrice = prices.at(-1);
    const prevPrice = prices.at(-2);
    const change24h = currentPrice !== undefined && prevPrice !== undefined
        ? ((currentPrice - prevPrice) / prevPrice) * 100 : null;
    return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", flexShrink: 0 }}>PRICE · 7D</p>
            {isLoading ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Loading...</p>
                </div>
            ) : prices.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Price data unavailable</p>
                </div>
            ) : (
                <>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0 }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>
                            ${currentPrice!.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: currentPrice! < 1 ? 6 : 2 })}
                        </p>
                        {change24h !== null && (
                            <p style={{ fontSize: 11, fontWeight: 600, color: change24h >= 0 ? "#4ade80" : "#f87171" }}>
                                {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}% 24h
                            </p>
                        )}
                    </div>
                    <div style={{ flex: 1, minHeight: 0, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 14px" }}>
                        <SparkLine points={prices} color={color} full />
                    </div>
                </>
            )}
        </div>
    );
}

function SparkLine({ points, color = "#60a5fa", h = 100, full }: { points: number[]; color?: string; h?: number; full?: boolean }) {
    const vw = 300;
    const rawMin = Math.min(...points), rawMax = Math.max(...points);
    const avg = points.reduce((a, b) => a + b, 0) / points.length;
    const minPad = avg * 0.03;
    const min = Math.min(rawMin, avg - minPad);
    const max = Math.max(rawMax, avg + minPad);
    const range = max - min || 1;
    const xs = points.map((_, i) => (i / (points.length - 1)) * vw);
    const ys = points.map(pt => h - ((pt - min) / range) * (h - 8) - 4);
    const line = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
    const fillD = `${line} L ${vw} ${h} L 0 ${h} Z`;
    const gradId = `sg-${color.replace("#", "")}`;
    return (
        <svg width={full ? "100%" : 220} height={full ? "100%" : h} viewBox={`0 0 ${vw} ${h}`} preserveAspectRatio="none" style={{ overflow: "visible", display: "block" }}>
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

function DesktopDashboard(p: SharedProps) {
    const [selected, setSelected] = useState<string>("");
    const [sidebarTab, setSidebarTab] = useState<"safes" | "air">("safes");

    useEffect(() => {
        if (!selected && p.tokensWithBalances.length > 0) {
            setSelected(p.tokensWithBalances[0].tokenAddress);
        }
    }, [p.tokensWithBalances, selected]);

    const selectedToken = p.tokensWithBalances.find(t => t.tokenAddress === selected);

    const SAFES_TYPES = ["shield", "unshield", "transfer", "receive"];
    const AIR_TYPES   = ["fund", "reclaim", "voucher", "air-send", "air-receive"];
    const allSelectedTxs = p.transactions.filter(t => t.tokenAddress.toLowerCase() === selected.toLowerCase());
    const selectedTxs = sidebarTab === "safes"
        ? allSelectedTxs.filter(tx => SAFES_TYPES.includes(tx.type))
        : allSelectedTxs.filter(tx => AIR_TYPES.includes(tx.type));

    const deskTxLabel = (type: string) =>
        type === "shield" ? "Shield" : type === "receive" ? "Received" :
        type === "transfer" ? "Transfer" : type === "unshield" ? "Unshield" :
        type === "fund" ? "Fund Air Bag" : type === "reclaim" ? "Reclaim" :
        type === "voucher" || type === "air-send" ? "Voucher Sent" :
        type === "air-receive" ? "Voucher Claimed" : type;
    const deskTxColor = (type: string) =>
        ["shield","receive","fund","air-receive"].includes(type) ? "#4ade80" :
        ["transfer","air-send","voucher"].includes(type) ? "#F59E0B" :
        type === "reclaim" ? "#60a5fa" : "#f87171";
    const deskTxBg = (type: string) =>
        ["shield","receive","fund","air-receive"].includes(type) ? "rgba(74,222,128,0.1)" :
        ["transfer","air-send","voucher"].includes(type) ? "rgba(245,158,11,0.1)" :
        type === "reclaim" ? "rgba(96,165,250,0.1)" : "rgba(248,113,113,0.1)";
    const deskTxSign = (type: string) =>
        ["shield","receive","fund","air-receive"].includes(type) ? "+" : "-";

    return (
        <div style={{
            position: "fixed", top: 58, left: 0, right: 0, bottom: 0,
            padding: "16px 28px 20px",
            display: "flex", flexDirection: "column",
            overflow: "hidden", boxSizing: "border-box",
        }}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14, boxSizing: "border-box" }}>
                {p.vaultVersion === "v5" && (
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 16px", borderRadius: 10, flexShrink: 0,
                        background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)",
                        gap: 12,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <AlertTriangleIcon size={15} color="#f59e0b" />
                            <span style={{ fontSize: 12, color: "#fbbf24", lineHeight: 1.5 }}>
                                You are using a <strong>V5 Qrypt-Safe</strong>. V6 introduces OTP chain security and air bags isolation.
                            </span>
                        </div>
                        <button
                            onClick={() => p.setActiveModal("upgrade-v6")}
                            style={{
                                flexShrink: 0, padding: "6px 12px", borderRadius: 8,
                                border: "1px solid rgba(245,158,11,0.5)",
                                background: "rgba(245,158,11,0.15)", color: "#F59E0B",
                                fontSize: 11, fontWeight: 700, cursor: "pointer",
                                fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.28)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,158,11,0.15)"; }}
                        >Upgrade to V6</button>
                    </div>
                )}

                <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "340px 1fr", gap: 14 }}>
                    <div style={{ ...panelBase }}>
                        {/* Tab header */}
                        <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
                            <div style={{ display: "flex", gap: 6 }}>
                                {(["safes", "air"] as const).map(tab => {
                                    const isActive = sidebarTab === tab;
                                    const isSafes = tab === "safes";
                                    return (
                                        <button key={tab} onClick={() => { setSidebarTab(tab); setSelected(""); }} style={{
                                            flex: 1, padding: "11px 6px", cursor: "pointer",
                                            borderRadius: 9, fontFamily: "'Inter', sans-serif",
                                            fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                                            transition: "all 0.15s",
                                            background: isActive
                                                ? (isSafes ? "rgba(34,197,94,0.14)" : "rgba(245,158,11,0.14)")
                                                : "rgba(255,255,255,0.04)",
                                            border: isActive
                                                ? (isSafes ? "1px solid rgba(34,197,94,0.45)" : "1px solid rgba(245,158,11,0.45)")
                                                : "1px solid rgba(255,255,255,0.07)",
                                            color: isActive
                                                ? (isSafes ? "#4ade80" : "#fbbf24")
                                                : "rgba(255,255,255,0.35)",
                                        }}>
                                            {tab === "safes" ? "QRYPT-SAFES" : "AIR BAGS"}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {sidebarTab === "safes" ? (
                            <>
                                <div style={{ padding: "10px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, margin: "0 0 9px" }}>
                                        Shield ERC-20 tokens into your personal smart contract vault. Transfer them on-chain via commit-reveal, or unshield to your wallet anytime.
                                    </p>
                                    <button onClick={() => p.setActiveModal("shield")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px", borderRadius: 8, border: "1px solid rgba(37,99,235,0.35)", background: "rgba(37,99,235,0.12)", cursor: "pointer", color: "#60a5fa", fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.22)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(37,99,235,0.12)"; }}>
                                        <PlusIcon size={11} /> Shield New Token
                                    </button>
                                </div>
                                <PB scroll>
                                    {p.tokensWithBalances.length === 0 ? (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, padding: "32px 0" }}>
                                            <ShieldIcon size={32} color="rgba(255,255,255,0.15)" />
                                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                                                No shielded tokens yet.<br />Shield a token to get started.
                                            </p>
                                            <button onClick={() => p.setActiveModal("shield")} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                                Shield First Token
                                            </button>
                                        </div>
                                    ) : p.tokensWithBalances.map((v, i) => {
                                        const isSelected = selected === v.tokenAddress;
                                        return (
                                            <div key={v.tokenAddress} onClick={() => setSelected(v.tokenAddress)} style={{ borderBottom: i < p.tokensWithBalances.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", cursor: "pointer" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: v.shieldedBalance === 0n ? 0.45 : 1 }}>
                                                    <TokenLogo tokenAddress={v.tokenAddress} tokenSymbol={v.tokenSymbol} color={v.color} size={28} />
                                                    <div>
                                                        <p style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#fff" : "rgba(255,255,255,0.85)" }}>q{v.tokenSymbol}</p>
                                                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatBalance(v.shieldedBalance, v.decimals)}</p>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: 10, color: v.shieldedBalance === 0n ? "rgba(255,255,255,0.25)" : isSelected ? "#22C55E" : "#4ade80" }}>
                                                    {v.shieldedBalance === 0n ? "Withdrawn" : "Shielded"}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </PB>
                            </>
                        ) : (
                            <>
                                <div style={{ padding: "10px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, margin: "0 0 9px" }}>
                                        Air Bags is your allocation for offline QryptAir vouchers. Fund tokens from your vault to let recipients claim them without gas.
                                    </p>
                                    <button
                                        onClick={() => p.setActiveModal("qryptair-recipient")}
                                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.08)", color: "#F59E0B", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}
                                    >
                                        <ScanLineIcon size={12} /> Receive / Redeem Voucher
                                    </button>
                                </div>
                                <PB scroll>
                                    {p.tokensWithBalances.length === 0 ? (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, padding: "32px 0" }}>
                                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                                                No shielded tokens.<br />Shield a token first to fund air budget.
                                            </p>
                                        </div>
                                    ) : p.tokensWithBalances.map((v, i) => {
                                        const airBal = p.airBudgets[v.tokenAddress] ?? 0n;
                                        const isSelected = selected === v.tokenAddress;
                                        return (
                                            <div key={v.tokenAddress} onClick={() => setSelected(v.tokenAddress)} style={{ borderBottom: i < p.tokensWithBalances.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", cursor: "pointer", gap: 6 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                                    <TokenLogo tokenAddress={v.tokenAddress} tokenSymbol={v.tokenSymbol} color={v.color} size={28} />
                                                    <div style={{ minWidth: 0 }}>
                                                        <p style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#fff" : "rgba(255,255,255,0.85)" }}>{v.tokenSymbol}</p>
                                                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatBalance(airBal, v.decimals)} budgeted</p>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: 10, color: airBal > 0n ? (isSelected ? "#F59E0B" : "rgba(245,158,11,0.7)") : "rgba(255,255,255,0.2)", flexShrink: 0 }}>
                                                    {airBal > 0n ? "Funded" : "Empty"}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </PB>
                            </>
                        )}
                    </div>

                    <div style={{ ...panelBase }}>
                        {selectedToken ? (
                            <>
                                <div style={{
                                    padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                                    display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
                                }}>
                                    <TokenLogo tokenAddress={selectedToken.tokenAddress} tokenSymbol={selectedToken.tokenSymbol} color={selectedToken.color} size={32} />
                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                                            {sidebarTab === "safes" ? `q${selectedToken.tokenSymbol}` : selectedToken.tokenSymbol}
                                        </p>
                                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                                            {sidebarTab === "safes"
                                                ? `${formatBalance(selectedToken.shieldedBalance, selectedToken.decimals)} shielded`
                                                : `${formatBalance(p.airBudgets[selectedToken.tokenAddress] ?? 0n, selectedToken.decimals)} budgeted`}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 12, padding: "14px 16px", overflow: "hidden" }}>
                                    <div style={{ flex: "0 0 65%", minWidth: 0, display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
                                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                            {sidebarTab === "safes" ? (
                                                <>
                                                    <button onClick={() => { p.setActiveShieldToken(selectedToken.tokenAddress); p.setActiveModal("shield"); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "13px 4px", borderRadius: 8, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.1)", color: "#4ade80", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                                        <ShieldIcon size={11} /> Shield
                                                    </button>
                                                    <button onClick={() => { p.setActiveUnshieldToken(selectedToken.tokenAddress); p.setActiveModal("unshield"); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "13px 4px", borderRadius: 8, border: "1px solid rgba(248,113,113,0.25)", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                                        <LockIcon size={11} /> Unshield
                                                    </button>
                                                    <button onClick={() => { p.setActiveTransferToken(selectedToken.tokenAddress); p.setActiveModal("transfer-select"); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "13px 4px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                                        <SendIcon size={11} /> Transfer
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => { p.setActiveTransferToken(selectedToken.tokenAddress); p.setActiveModal("qryptair-fund"); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "13px 4px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.08)", color: "#F59E0B", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                                        <PlusIcon size={11} /> Fund
                                                    </button>
                                                    <button onClick={() => { p.setActiveTransferToken(selectedToken.tokenAddress); p.setActiveModal("qryptair-sender"); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "13px 4px", borderRadius: 8, border: "none", background: "#F59E0B", color: "#000", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                                                        <SendIcon size={11} /> Transfer
                                                    </button>
                                                    <button onClick={() => p.setActiveModal("qryptair-recipient")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "13px 4px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.3)", background: "transparent", color: "#F59E0B", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                                        <ScanLineIcon size={11} /> Receive
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <PriceChart symbol={selectedToken.tokenSymbol} color={selectedToken.color} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto" }}>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 12, flexShrink: 0 }}>HISTORY</p>
                                        {selectedTxs.length === 0 ? (
                                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", textAlign: "center", paddingTop: 16 }}>No history</p>
                                        ) : selectedTxs.map((tx, i) => (
                                            <div key={tx.txHash} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < selectedTxs.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", flexShrink: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{ width: 28, height: 28, borderRadius: 7, background: deskTxBg(tx.type), border: `1px solid ${deskTxBg(tx.type).replace("0.1", "0.25")}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                        {tx.type === "shield" ? <ShieldIcon size={11} color="#4ade80" /> : tx.type === "receive" || tx.type === "air-receive" ? <ArrowDownIcon size={11} color="#4ade80" /> : tx.type === "reclaim" ? <ArrowDownIcon size={11} color="#60a5fa" /> : tx.type === "fund" ? <PlusIcon size={11} color="#4ade80" /> : <SendIcon size={11} color={tx.type === "transfer" ? "#60a5fa" : "#F59E0B"} />}
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <p style={{ fontSize: 11, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            {deskTxLabel(tx.type)}
                                                        </p>
                                                        <a href={getTxEtherscanUrl(tx.txHash, p.chainId)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontFamily: "monospace", color: "#60a5fa", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 2 }}>
                                                            {tx.txHash.slice(0, 8)}... <ExternalLinkIcon size={9} />
                                                        </a>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: 11, fontWeight: 600, color: deskTxColor(tx.type), flexShrink: 0, marginLeft: 4 }}>
                                                    {deskTxSign(tx.type)}{tx.amount}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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

function MobileQryptSafe({ p, mobileTab }: { p: SharedProps; mobileTab: "safes" | "air" }) {
    const [selected, setSelected] = useState<string>("");
    const [showAllHistory, setShowAllHistory] = useState(false);

    const selectedToken = p.tokensWithBalances.find(t => t.tokenAddress === selected);
    const relHistory = p.transactions.filter(t => t.tokenAddress.toLowerCase() === selected.toLowerCase());
    const HISTORY_PREVIEW = 5;
    const visibleHistory = showAllHistory ? relHistory : relHistory.slice(0, HISTORY_PREVIEW);
    const hasMore = relHistory.length > HISTORY_PREVIEW;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {p.vaultVersion === "v5" && (
                <div style={{
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)",
                }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                        <AlertTriangleIcon size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 12, color: "#fbbf24", lineHeight: 1.5 }}>
                            You are using a <strong>V5 Qrypt-Safe</strong>. V6 adds OTP chain security and air bags isolation.
                        </span>
                    </div>
                    <button
                        onClick={() => p.setActiveModal("upgrade-v6")}
                        style={{
                            width: "100%", padding: "8px", borderRadius: 8,
                            border: "1px solid rgba(245,158,11,0.5)",
                            background: "rgba(245,158,11,0.15)", color: "#F59E0B",
                            fontSize: 12, fontWeight: 700, cursor: "pointer",
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >Upgrade to V6 Qrypt-Safe</button>
                </div>
            )}

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>

                {mobileTab === "safes" ? (
                    <div style={{ padding: "12px 14px" }}>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 10 }}>
                            Shield ERC-20 tokens into your personal smart contract vault. Transfer on-chain or unshield to your wallet.
                        </p>
                        {p.tokensWithBalances.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "20px 0" }}>
                                <ShieldIcon size={28} color="rgba(255,255,255,0.15)" style={{ margin: "0 auto 12px" }} />
                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>No shielded tokens yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {p.tokensWithBalances.map(v => {
                                    const isSelected = selected === v.tokenAddress;
                                    return (
                                        <div key={v.tokenAddress} onClick={() => { setSelected(isSelected ? "" : v.tokenAddress); setShowAllHistory(false); }} style={{ borderRadius: 12, background: isSelected ? `${v.color}10` : "rgba(255,255,255,0.03)", border: isSelected ? `1px solid ${v.color}40` : "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: v.shieldedBalance === 0n ? 0.45 : 1 }}>
                                                <TokenLogo tokenAddress={v.tokenAddress} tokenSymbol={v.tokenSymbol} color={v.color} size={36} />
                                                <div>
                                                    <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>q{v.tokenSymbol}</p>
                                                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{formatBalance(v.shieldedBalance, v.decimals)} shielded</p>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: 11, color: v.shieldedBalance === 0n ? "rgba(255,255,255,0.25)" : "#4ade80" }}>
                                                {v.shieldedBalance === 0n ? "Withdrawn" : "Shielded"}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ padding: "12px 14px" }}>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 10 }}>
                            Air Bags is your allocation for offline QryptAir vouchers. Fund tokens from your vault so recipients can claim them without gas.
                        </p>
                        {p.tokensWithBalances.length === 0 ? (
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "20px 0" }}>
                                No shielded tokens. Shield a token first.
                            </p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {p.tokensWithBalances.map(v => {
                                    const airBal = p.airBudgets[v.tokenAddress] ?? 0n;
                                    const isSelected = selected === v.tokenAddress;
                                    return (
                                        <div key={v.tokenAddress} onClick={() => setSelected(isSelected ? "" : v.tokenAddress)} style={{ borderRadius: 12, background: isSelected ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)", border: isSelected ? "1px solid rgba(245,158,11,0.35)" : "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer", gap: 8 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                                                <TokenLogo tokenAddress={v.tokenAddress} tokenSymbol={v.tokenSymbol} color={v.color} size={36} />
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{v.tokenSymbol}</p>
                                                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{formatBalance(airBal, v.decimals)} budgeted</p>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: 11, color: airBal > 0n ? "#F59E0B" : "rgba(255,255,255,0.2)", flexShrink: 0 }}>
                                                {airBal > 0n ? "Funded" : "Empty"}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedToken && (() => {
                const SAFES_TYPES = ["shield", "unshield", "transfer", "receive"];
                const AIR_TYPES   = ["fund", "reclaim", "voucher", "air-send", "air-receive"];
                const tabHistory  = mobileTab === "safes"
                    ? relHistory.filter(tx => SAFES_TYPES.includes(tx.type))
                    : relHistory.filter(tx => AIR_TYPES.includes(tx.type));
                const visTab    = showAllHistory ? tabHistory : tabHistory.slice(0, HISTORY_PREVIEW);
                const hasMoreTab = tabHistory.length > HISTORY_PREVIEW;

                const txLabel  = (type: string) =>
                    type === "shield" ? "Shield" : type === "receive" ? "Received" :
                    type === "transfer" ? "Transfer" : type === "unshield" ? "Unshield" :
                    type === "fund" ? "Fund Air Bag" : type === "reclaim" ? "Reclaim" :
                    type === "voucher" || type === "air-send" ? "Voucher Sent" :
                    type === "air-receive" ? "Voucher Claimed" : type;
                const txColor  = (type: string) =>
                    ["shield","receive","fund","air-receive"].includes(type) ? "#4ade80" :
                    ["transfer","air-send","voucher"].includes(type) ? "#F59E0B" :
                    type === "reclaim" ? "#60a5fa" : "#f87171";
                const txBg     = (type: string) =>
                    ["shield","receive","fund","air-receive"].includes(type) ? "rgba(74,222,128,0.1)" :
                    ["transfer","air-send","voucher"].includes(type) ? "rgba(245,158,11,0.1)" :
                    type === "reclaim" ? "rgba(96,165,250,0.1)" : "rgba(248,113,113,0.1)";
                const txSign   = (type: string) =>
                    ["shield","receive","fund","air-receive"].includes(type) ? "+" : "-";

                return (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {mobileTab === "safes" ? (
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => { p.setActiveShieldToken(selectedToken.tokenAddress); p.setActiveModal("shield"); }} style={{ flex: 1, padding: "12px 8px", borderRadius: 12, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "#4ade80", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                <ShieldIcon size={14} /> Shield
                            </button>
                            <button onClick={() => { p.setActiveUnshieldToken(selectedToken.tokenAddress); p.setActiveModal("unshield"); }} style={{ flex: 1, padding: "12px 8px", borderRadius: 12, border: "1px solid rgba(248,113,113,0.25)", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                <LockIcon size={14} /> Unshield
                            </button>
                            <button onClick={() => { p.setActiveTransferToken(selectedToken.tokenAddress); p.setActiveModal("transfer-select"); }} style={{ flex: 1, padding: "12px 8px", borderRadius: 12, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                <SendIcon size={14} /> Transfer
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => { p.setActiveTransferToken(selectedToken.tokenAddress); p.setActiveModal("qryptair-fund"); }} style={{ flex: 1, padding: "12px 8px", borderRadius: 12, border: "1px solid rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.1)", color: "#F59E0B", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                <PlusIcon size={14} /> Fund
                            </button>
                            <button onClick={() => { p.setActiveTransferToken(selectedToken.tokenAddress); p.setActiveModal("qryptair-sender"); }} style={{ flex: 1, padding: "12px 8px", borderRadius: 12, border: "none", background: "#F59E0B", color: "#000", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                <SendIcon size={14} /> Transfer
                            </button>
                        </div>
                    )}
                    <div style={{ height: 180, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", minHeight: 0 }}>
                        <PriceChart symbol={selectedToken.tokenSymbol} color={selectedToken.color} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px" }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 12 }}>HISTORY</p>
                        {tabHistory.length === 0 ? (
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", paddingTop: 4, paddingBottom: 4 }}>No history</p>
                        ) : (
                            <>
                                <div style={{ overflowY: showAllHistory ? "auto" : "visible", maxHeight: showAllHistory ? 340 : "none" }}>
                                    {visTab.map((tx, i) => (
                                        <div key={tx.txHash} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < visTab.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: txBg(tx.type), border: `1px solid ${txBg(tx.type).replace("0.1", "0.25")}` }}>
                                                    {tx.type === "shield" ? <ShieldIcon size={12} color="#4ade80" /> : tx.type === "receive" || tx.type === "air-receive" ? <ArrowDownIcon size={12} color="#4ade80" /> : tx.type === "reclaim" ? <ArrowDownIcon size={12} color="#60a5fa" /> : tx.type === "fund" ? <PlusIcon size={12} color="#4ade80" /> : <SendIcon size={12} color={tx.type === "transfer" ? "#60a5fa" : "#F59E0B"} />}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {txLabel(tx.type)}
                                                    </p>
                                                    <a href={getTxEtherscanUrl(tx.txHash, p.chainId)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontFamily: "monospace", color: "#60a5fa", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 2 }}>
                                                        {tx.txHash.slice(0, 8)}... <ExternalLinkIcon size={9} />
                                                    </a>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 4 }}>
                                                <p style={{ fontSize: 12, fontWeight: 600, color: txColor(tx.type) }}>
                                                    {txSign(tx.type)}{tx.amount}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {hasMoreTab && (
                                    <button
                                        onClick={() => setShowAllHistory(v => !v)}
                                        style={{ marginTop: 10, width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em" }}
                                    >
                                        {showAllHistory ? "View Less" : `View More (${tabHistory.length - HISTORY_PREVIEW} more)`}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
                );
            })()}
        </div>
    );
}

function ModalVaults({ p }: { p: SharedProps }) {
    const [selected, setSelected] = useState<string>(p.tokensWithBalances[0]?.tokenAddress || "");
    const selectedToken = p.tokensWithBalances.find(t => t.tokenAddress === selected);
    const relHistory = p.transactions.filter(t => t.tokenAddress.toLowerCase() === selected.toLowerCase());

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
                        <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: v.shieldedBalance === 0n ? 0.45 : 1 }}>
                            <TokenLogo tokenAddress={v.tokenAddress} tokenSymbol={v.tokenSymbol} color={v.color} size={32} />
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>q{v.tokenSymbol}</p>
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatBalance(v.shieldedBalance, v.decimals)}</p>
                            </div>
                        </div>
                        <p style={{ fontSize: 10, color: v.shieldedBalance === 0n ? "rgba(255,255,255,0.25)" : "#4ade80" }}>
                            {v.shieldedBalance === 0n ? "Withdrawn" : "Shielded"}
                        </p>
                    </button>
                ))}
                <button onClick={() => p.setActiveModal("shield")} style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "11px", borderRadius: 10,
                    border: "1px dashed rgba(37,99,235,0.3)", cursor: "pointer",
                    background: "transparent", color: "#60a5fa", fontSize: 13, fontWeight: 600,
                }}>
                    <PlusIcon size={14} /> Shield New Token
                </button>
            </div>

            {selectedToken && (
                <div style={{ display: "flex", gap: 12, height: 230 }}>
                    <div style={{ flex: "0 0 65%", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
                            <PriceChart symbol={selectedToken.tokenSymbol} color={selectedToken.color} />
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                            <button onClick={() => { p.setActiveShieldToken(selectedToken.tokenAddress); p.setActiveModal("shield"); }} style={{ flex: 1, padding: "14px 6px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "#4ade80", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                <ShieldIcon size={13} /> Shield
                            </button>
                            <button onClick={() => { p.setActiveUnshieldToken(selectedToken.tokenAddress); p.setActiveModal("unshield"); }} style={{ flex: 1, padding: "14px 6px", borderRadius: 10, border: "1px solid rgba(248,113,113,0.2)", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                <LockIcon size={13} /> Unshield
                            </button>
                            <button onClick={() => { p.setActiveTransferToken(selectedToken.tokenAddress); p.setActiveModal("transfer-select"); }} style={{ flex: 1, padding: "14px 6px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                <SendIcon size={13} /> Transfer
                            </button>
                        </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto" }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 12, flexShrink: 0 }}>ACTIVITY</p>
                        {relHistory.length === 0 ? (
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", paddingTop: 12 }}>No history</p>
                        ) : relHistory.map((tx, i) => (
                            <div key={tx.txHash} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: i < relHistory.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", flexShrink: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                    <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: tx.type === "shield" || tx.type === "receive" ? "rgba(74,222,128,0.1)" : tx.type === "transfer" ? "rgba(96,165,250,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${tx.type === "shield" || tx.type === "receive" ? "rgba(74,222,128,0.2)" : tx.type === "transfer" ? "rgba(96,165,250,0.2)" : "rgba(248,113,113,0.2)"}` }}>
                                        {tx.type === "shield" ? <ShieldIcon size={11} color="#4ade80" /> : tx.type === "receive" ? <ArrowDownIcon size={11} color="#4ade80" /> : tx.type === "transfer" ? <SendIcon size={11} color="#60a5fa" /> : <LockIcon size={11} color="#f87171" />}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {tx.type === "shield" ? "Shield" : tx.type === "receive" ? "Received" : tx.type === "transfer" ? "Transfer" : "Unshield"}
                                        </p>
                                        <a href={getTxEtherscanUrl(tx.txHash, p.chainId)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontFamily: "monospace", color: "#60a5fa", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 2 }}>
                                            {tx.txHash.slice(0, 8)}... <ExternalLinkIcon size={9} />
                                        </a>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 4 }}>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: tx.type === "shield" || tx.type === "receive" ? "#4ade80" : tx.type === "transfer" ? "#60a5fa" : "#f87171" }}>
                                        {tx.type === "shield" || tx.type === "receive" ? "+" : "-"}{tx.amount}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
