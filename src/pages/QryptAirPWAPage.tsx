import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSyncChannel } from "@/hooks/useSyncChannel";
import { keccak256, toBytes, parseUnits, formatUnits } from "viem";
import { QRCodeSVG } from "qrcode.react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { useVault } from "@/hooks/useVault";
import { PERSONAL_VAULT_ABI, PERSONAL_VAULT_V6_ABI } from "@/lib/abi";
import {
    DownloadIcon, SendIcon, CopyIcon,
    ClockIcon, CheckCircle2Icon, AlertTriangleIcon,
    WifiOffIcon, WifiIcon, Loader2Icon, ChevronDownIcon,
    RefreshCwIcon, SmartphoneIcon, MonitorIcon, ArrowRightIcon,
    CheckIcon, ShieldCheckIcon,
} from "lucide-react";
import { addDays, formatDistanceToNow } from "date-fns";

const HISTORY_KEY = "qryptair_history";
const DEADLINES = [
    { label: "1d", days: 1 },
    { label: "3d", days: 3 },
    { label: "7d", days: 7 },
    { label: "30d", days: 30 },
];

const KNOWN_TOKENS: Record<number, Array<{ address: string; symbol: string; name: string; decimals: number }>> = {
    11155111: [
        { address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", symbol: "USDC",  name: "USD Coin",        decimals: 6  },
        { address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", symbol: "WETH",  name: "Wrapped Ether",  decimals: 18 },
        { address: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357", symbol: "DAI",   name: "Dai Stablecoin", decimals: 18 },
        { address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", symbol: "USDT",  name: "Tether USD",     decimals: 6  },
        { address: "0x779877A7B0D9E8603169DdbD7836e478b4624789", symbol: "LINK",  name: "ChainLink Token",decimals: 18 },
        { address: "0x08210F9170F89Ab7658F0B5E3fF39b0E03C2Bfa", symbol: "EURC",  name: "Euro Coin",      decimals: 6  },
    ],
    1: [
        { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC",  name: "USD Coin",        decimals: 6  },
        { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH",  name: "Wrapped Ether",  decimals: 18 },
        { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI",   name: "Dai Stablecoin", decimals: 18 },
        { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT",  name: "Tether USD",     decimals: 6  },
        { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK",  name: "ChainLink Token",decimals: 18 },
    ],
};

interface AirToken {
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    decimals: number;
    airBudget: bigint;
}

interface VoucherRecord {
    id: string;
    tokenAddress: string;
    tokenSymbol: string;
    amount: string;
    recipient: string;
    vaultAddress: string;
    deadline: number;
    chainId: number;
    createdAt: number;
    status: "pending" | "expired" | "claimed";
    qrData: string;
    signature: string;
    nonce?: string;
}

function loadHistory(): VoucherRecord[] {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(r: VoucherRecord[]) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(r));
}

function encodeQrPayload(payload: object): string {
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    bytes.forEach(b => { binary += String.fromCharCode(b); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function syncExpired(records: VoucherRecord[]): { records: VoucherRecord[]; changed: boolean } {
    const now = Math.floor(Date.now() / 1000);
    let changed = false;
    const updated = records.map(r => {
        if (r.status === "pending" && r.deadline < now) { changed = true; return { ...r, status: "expired" as const }; }
        return r;
    });
    return { records: updated, changed };
}

function decodeNonce(qrData: string): string | null {
    try {
        const decoded = JSON.parse(atob(qrData.replace(/-/g, "+").replace(/_/g, "/")));
        return decoded.nonce ?? null;
    } catch { return null; }
}

const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
    color: "#d4d6e2", fontFamily: "'Inter', sans-serif", fontSize: 12,
    outline: "none", boxSizing: "border-box",
};

function useAirBagTokens(
    vaultAddress: `0x${string}` | undefined,
    vaultVersion: string | null,
    chainId: number,
) {
    const knownTokens = useMemo(
        () => KNOWN_TOKENS[chainId] ?? KNOWN_TOKENS[11155111],
        [chainId],
    );

    const qTokenContracts = useMemo(() => {
        if (!vaultAddress) return [];
        return knownTokens.map(t => ({
            address: vaultAddress,
            abi: PERSONAL_VAULT_ABI,
            functionName: "qTokens" as const,
            args: [t.address as `0x${string}`],
        }));
    }, [vaultAddress, knownTokens]);

    const { data: qTokenResults, refetch: refetchQTokens } = useReadContracts({
        contracts: qTokenContracts,
        query: { enabled: !!vaultAddress },
    });

    const shieldedTokens = useMemo(() => {
        if (!qTokenResults) return [];
        const ZERO = "0x0000000000000000000000000000000000000000";
        return knownTokens.filter((_, i) => {
            const addr = qTokenResults[i]?.result as string | undefined;
            return addr && addr.toLowerCase() !== ZERO;
        });
    }, [qTokenResults, knownTokens]);

    const airBagContracts = useMemo(() => {
        if (!vaultAddress || vaultVersion !== "v6" || shieldedTokens.length === 0) return [];
        return shieldedTokens.map(t => ({
            address: vaultAddress,
            abi: PERSONAL_VAULT_V6_ABI,
            functionName: "getAirBags" as const,
            args: [t.address as `0x${string}`],
        }));
    }, [vaultAddress, vaultVersion, shieldedTokens]);

    const { data: airBagResults, refetch: refetchAirBags } = useReadContracts({
        contracts: airBagContracts,
        query: { enabled: !!vaultAddress && vaultVersion === "v6", refetchInterval: 15_000 },
    });

    const airTokens: AirToken[] = useMemo(() => {
        if (shieldedTokens.length === 0) return [];
        if (vaultVersion !== "v6") {
            return shieldedTokens.map(t => ({
                tokenAddress: t.address,
                tokenSymbol: t.symbol,
                tokenName: t.name,
                decimals: t.decimals,
                airBudget: 0n,
            }));
        }
        if (!airBagResults) return [];
        return shieldedTokens
            .map((t, i) => ({
                tokenAddress: t.address,
                tokenSymbol: t.symbol,
                tokenName: t.name,
                decimals: t.decimals,
                airBudget: (airBagResults[i]?.result as bigint | undefined) ?? 0n,
            }))
            .filter(t => t.airBudget > 0n);
    }, [airBagResults, shieldedTokens, vaultVersion]);

    const refetch = useCallback(() => {
        refetchQTokens();
        refetchAirBags();
    }, [refetchQTokens, refetchAirBags]);

    return { airTokens, refetch };
}

function QrCard({ record }: { record: VoucherRecord }) {
    const logoUrl = `${import.meta.env.BASE_URL}qryptum-logo.png`;
    const isExpired = record.status === "expired";
    const isClaimed = record.status === "claimed";
    const isInactive = isExpired || isClaimed;
    const [copied, setCopied] = useState(false);

    const copy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(record.qrData);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = record.qrData;
            document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [record.qrData]);

    const download = useCallback(() => {
        const container = document.getElementById(`qr-${record.id}`);
        const svg = container?.querySelector("svg") as SVGSVGElement | null;
        if (!svg) return;
        const xml = new XMLSerializer().serializeToString(svg);
        const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
        const a = document.createElement("a");
        a.href = url; a.download = `air-${record.tokenSymbol}-${record.id.slice(0, 6)}.svg`; a.click();
        URL.revokeObjectURL(url);
    }, [record]);

    const badgeLabel = isClaimed ? "CLAIMED" : isExpired ? "EXPIRED" : "ACTIVE";
    const badgeBg = isClaimed ? "rgba(74,222,128,0.08)" : isExpired ? "rgba(255,255,255,0.05)" : "rgba(245,158,11,0.1)";
    const badgeColor = isClaimed ? "#4ade80" : isExpired ? "rgba(255,255,255,0.25)" : "#F59E0B";
    const badgeBorder = isClaimed ? "1px solid rgba(74,222,128,0.2)" : isExpired ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(245,158,11,0.25)";

    return (
        <div style={{
            background: isInactive ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
            borderRadius: 14,
            border: `1px solid ${isClaimed ? "rgba(74,222,128,0.12)" : isExpired ? "rgba(255,255,255,0.05)" : "rgba(245,158,11,0.18)"}`,
            padding: "14px",
            display: "flex", flexDirection: "column", gap: 10,
            opacity: isInactive ? 0.55 : 1,
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#F59E0B", fontFamily: "monospace" }}>
                        {record.amount} {record.tokenSymbol}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                        {record.recipient.slice(0, 8)}...{record.recipient.slice(-4)}
                    </p>
                </div>
                <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: "0.07em",
                    padding: "3px 7px", borderRadius: 5, whiteSpace: "nowrap",
                    background: badgeBg, color: badgeColor, border: badgeBorder,
                }}>{badgeLabel}</span>
            </div>

            {!isInactive && (
                <div id={`qr-${record.id}`} style={{ alignSelf: "center" }}>
                    <div style={{ background: "#fff", padding: 10, borderRadius: 8, display: "inline-block" }}>
                        <QRCodeSVG
                            value={record.qrData}
                            size={148}
                            level="H"
                            bgColor="#ffffff"
                            fgColor="#1e1b4b"
                            imageSettings={{ src: logoUrl, height: 30, width: 30, excavate: true }}
                        />
                    </div>
                </div>
            )}

            {!isExpired && (
                <div
                    onClick={copy}
                    title="Click to copy raw payload"
                    style={{
                        fontFamily: "monospace", fontSize: 9,
                        color: "rgba(255,255,255,0.3)",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 6, padding: "6px 8px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        letterSpacing: "0.02em", cursor: "pointer",
                        userSelect: "all",
                    }}
                >
                    {record.qrData.slice(0, 72)}…
                </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", display: "flex", alignItems: "center", gap: 3 }}>
                    <ClockIcon size={9} />
                    {isClaimed ? "Claimed" : isExpired ? "Expired" : `Expires ${formatDistanceToNow(new Date(record.deadline * 1000), { addSuffix: true })}`}
                </span>
                {!isInactive && (
                    <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={copy} style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "5px 9px", borderRadius: 6,
                            background: copied ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.06)",
                            border: `1px solid ${copied ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`,
                            color: copied ? "#4ade80" : "rgba(255,255,255,0.5)",
                            fontSize: 10, fontWeight: 600, cursor: "pointer",
                            fontFamily: "'Inter', sans-serif", transition: "all 0.15s",
                        }}>
                            {copied ? <CheckIcon size={9} /> : <CopyIcon size={9} />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                        <button onClick={download} style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "5px 9px", borderRadius: 6,
                            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                            color: "#F59E0B", fontSize: 10, fontWeight: 600, cursor: "pointer",
                            fontFamily: "'Inter', sans-serif",
                        }}>
                            <DownloadIcon size={9} /> SVG
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function TokenDropdown({
    airTokens,
    selected,
    onSelect,
    loading,
}: {
    airTokens: AirToken[];
    selected: AirToken | null;
    onSelect: (t: AirToken) => void;
    loading: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const displayBudget = (t: AirToken) =>
        formatUnits(t.airBudget, t.decimals);

    if (loading) {
        return (
            <div style={{
                ...inp, display: "flex", alignItems: "center", gap: 8,
                color: "rgba(255,255,255,0.3)",
            }}>
                <Loader2Icon size={11} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                <span style={{ fontSize: 11 }}>Loading tokens...</span>
            </div>
        );
    }

    if (airTokens.length === 0) {
        return (
            <div style={{
                ...inp, display: "flex", alignItems: "center", gap: 8,
                color: "rgba(255,255,255,0.3)",
            }}>
                <span style={{ fontSize: 11 }}>No Air Bags found in vault</span>
            </div>
        );
    }

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    ...inp, display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", background: open ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.05)",
                    border: open ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.09)",
                    padding: "9px 12px",
                } as React.CSSProperties}
            >
                {selected ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                        <span style={{ fontWeight: 700, color: "#d4d6e2" }}>{selected.tokenSymbol}</span>
                        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{selected.tokenName}</span>
                        <span style={{
                            marginLeft: "auto", fontSize: 10, color: "#F59E0B", fontWeight: 600,
                            background: "rgba(245,158,11,0.08)", padding: "1px 6px", borderRadius: 4,
                            border: "1px solid rgba(245,158,11,0.2)",
                        }}>
                            {displayBudget(selected)} avail.
                        </span>
                    </span>
                ) : (
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Select token...</span>
                )}
                <ChevronDownIcon size={12} color="rgba(255,255,255,0.35)" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>

            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
                    background: "#1a1a24", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}>
                    {airTokens.map(t => (
                        <button
                            key={t.tokenAddress}
                            onClick={() => { onSelect(t); setOpen(false); }}
                            style={{
                                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "10px 14px", background: selected?.tokenAddress === t.tokenAddress ? "rgba(245,158,11,0.08)" : "transparent",
                                border: "none", cursor: "pointer",
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#d4d6e2" }}>{t.tokenSymbol}</span>
                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{t.tokenName}</span>
                            </div>
                            <span style={{
                                fontSize: 11, fontWeight: 600, color: "#F59E0B",
                                background: "rgba(245,158,11,0.08)", padding: "2px 8px",
                                borderRadius: 5, border: "1px solid rgba(245,158,11,0.2)",
                            }}>
                                {displayBudget(t)}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function SendForm({
    walletAddress,
    vaultAddress,
    airTokens,
    loadingTokens,
    onVoucherCreated,
    history,
    chainId,
}: {
    walletAddress: string;
    vaultAddress: string;
    airTokens: AirToken[];
    loadingTokens: boolean;
    onVoucherCreated: (r: VoucherRecord) => void;
    history: VoucherRecord[];
    chainId: number;
}) {
    const [selectedToken, setSelectedToken] = useState<AirToken | null>(null);
    const [amount, setAmount] = useState("");
    const [recipient, setRecipient] = useState("");
    const [deadlineDays, setDeadlineDays] = useState(7);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Deduct pending (unredeemed) voucher amounts from each token's available budget
    const adjustedTokens = useMemo(() => {
        const pendingByToken: Record<string, bigint> = {};
        for (const r of history) {
            if (r.status === "pending") {
                const key = r.tokenAddress.toLowerCase();
                const token = airTokens.find(t => t.tokenAddress.toLowerCase() === key);
                if (token) {
                    try {
                        pendingByToken[key] = (pendingByToken[key] ?? 0n) + parseUnits(r.amount, token.decimals);
                    } catch { /* skip malformed records */ }
                }
            }
        }
        return airTokens.map(t => {
            const locked = pendingByToken[t.tokenAddress.toLowerCase()] ?? 0n;
            const effectiveBudget = t.airBudget > locked ? t.airBudget - locked : 0n;
            return { ...t, airBudget: effectiveBudget };
        });
    }, [airTokens, history]);

    useEffect(() => {
        if (!selectedToken && adjustedTokens.length > 0) {
            setSelectedToken(adjustedTokens[0]);
        }
    }, [adjustedTokens, selectedToken]);

    // Always derive effective budget from adjustedTokens so it updates after each voucher creation
    const effectiveSelected = selectedToken
        ? (adjustedTokens.find(t => t.tokenAddress === selectedToken.tokenAddress) ?? selectedToken)
        : null;

    const maxAmount = effectiveSelected
        ? formatUnits(effectiveSelected.airBudget, effectiveSelected.decimals)
        : "0";

    const handleMax = () => setAmount(maxAmount);

    const handleGenerate = useCallback(async () => {
        setError(null);
        if (!selectedToken) { setError("Select a token."); return; }
        if (!amount) { setError("Enter an amount."); return; }
        if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
            setError("Invalid recipient address."); return;
        }
        if (!vaultAddress || !vaultAddress.startsWith("0x") || vaultAddress.length !== 42) {
            setError("Vault address not loaded."); return;
        }

        const eth = (window as any).ethereum;
        if (!eth) { setError("MetaMask not found."); return; }

        setLoading(true);
        try {
            let parsedAmount: bigint;
            try {
                parsedAmount = parseUnits(amount, selectedToken.decimals);
            } catch {
                setError("Invalid amount."); setLoading(false); return;
            }

            const effectiveBudget = effectiveSelected?.airBudget ?? 0n;
            if (effectiveBudget === 0n) {
                setError(`No remaining budget. All funds are locked in pending offTokens.`);
                setLoading(false); return;
            }
            if (parsedAmount > effectiveBudget) {
                setError(`Only ${maxAmount} ${selectedToken.tokenSymbol} available. Pending offTokens have been deducted.`);
                setLoading(false); return;
            }

            const deadline = Math.floor(addDays(new Date(), deadlineDays).getTime() / 1000);
            const nonce = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, "0")).join("")}` as `0x${string}`;
            // Auto-generate transfer code, embedded in QR payload so claimer needs no separate secret
            const rawTransferCode = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                .map(b => b.toString(16).padStart(2, "0")).join("");
            const transferCodeHash = keccak256(toBytes(rawTransferCode));

            const typedData = {
                types: {
                    EIP712Domain: [
                        { name: "name", type: "string" },
                        { name: "version", type: "string" },
                        { name: "chainId", type: "uint256" },
                    ],
                    Voucher: [
                        { name: "token", type: "address" },
                        { name: "amount", type: "uint256" },
                        { name: "recipient", type: "address" },
                        { name: "deadline", type: "uint256" },
                        { name: "nonce", type: "bytes32" },
                        { name: "transferCodeHash", type: "bytes32" },
                    ],
                },
                primaryType: "Voucher",
                domain: { name: "QryptAir", version: "1", chainId: chainId },
                message: {
                    token: selectedToken.tokenAddress,
                    amount: parsedAmount.toString(),
                    recipient,
                    deadline: deadline.toString(),
                    nonce,
                    transferCodeHash,
                },
            };

            const sig: string = await eth.request({
                method: "eth_signTypedData_v4",
                params: [walletAddress, JSON.stringify(typedData)],
            });

            const qrPayload = {
                token: selectedToken.tokenAddress,
                amount: parsedAmount.toString(),
                recipient,
                deadline: deadline.toString(),
                nonce,
                transferCodeHash,
                transferCode: rawTransferCode,
                vaultAddress,
                signature: sig,
            };

            const id = keccak256(toBytes(sig)).slice(2, 18);
            const record: VoucherRecord = {
                id,
                tokenAddress: selectedToken.tokenAddress,
                tokenSymbol: selectedToken.tokenSymbol,
                amount,
                recipient,
                vaultAddress,
                deadline,
                chainId,
                nonce,
                createdAt: Math.floor(Date.now() / 1000),
                status: "pending",
                qrData: encodeQrPayload(qrPayload),
                signature: sig,
            };

            const history = loadHistory();
            saveHistory([record, ...history]);
            onVoucherCreated(record);
            setSuccess(true);
            setAmount(""); setRecipient("");
            setTimeout(() => setSuccess(false), 3000);
        } catch (e: any) {
            setError(e.message ?? "Signing failed.");
        } finally {
            setLoading(false);
        }
    }, [walletAddress, vaultAddress, selectedToken, amount, recipient, deadlineDays, maxAmount, onVoucherCreated, chainId]);

    const fieldLabel = (label: string) => (
        <label style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {label}
        </label>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {fieldLabel("Token")}
                <TokenDropdown
                    airTokens={adjustedTokens}
                    selected={effectiveSelected}
                    onSelect={setSelectedToken}
                    loading={loadingTokens}
                />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {fieldLabel("Amount")}
                <div style={{ position: "relative" }}>
                    <input
                        style={{ ...inp, paddingRight: 52 }}
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                    <button
                        onClick={handleMax}
                        style={{
                            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                            background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
                            borderRadius: 4, padding: "2px 7px", cursor: "pointer",
                            color: "#F59E0B", fontSize: 9, fontWeight: 800,
                            fontFamily: "'Inter', sans-serif", letterSpacing: "0.05em",
                        }}
                    >MAX</button>
                </div>
                {selectedToken && (
                    <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
                        Available: {maxAmount} {selectedToken.tokenSymbol}
                    </p>
                )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {fieldLabel("Recipient")}
                <input style={inp} placeholder="0x..." value={recipient} onChange={e => setRecipient(e.target.value)} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {fieldLabel("Expiry")}
                <div style={{ display: "flex", gap: 4 }}>
                    {DEADLINES.map(d => (
                        <button key={d.days} onClick={() => setDeadlineDays(d.days)} style={{
                            flex: 1, padding: "7px 2px", borderRadius: 6, border: "1px solid",
                            borderColor: deadlineDays === d.days ? "rgba(245,158,11,0.6)" : "rgba(255,255,255,0.08)",
                            background: deadlineDays === d.days ? "rgba(245,158,11,0.1)" : "transparent",
                            color: deadlineDays === d.days ? "#F59E0B" : "rgba(255,255,255,0.35)",
                            fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                        }}>{d.label}</button>
                    ))}
                </div>
            </div>

            <div style={{
                display: "flex", alignItems: "flex-start", gap: 6,
                padding: "8px 10px", borderRadius: 8,
                background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)",
            }}>
                <ShieldCheckIcon size={11} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                    Transfer code auto-generated and embedded in QR. Recipient scans and signs. No separate secret needed.
                </p>
            </div>

            {error && (
                <div style={{
                    display: "flex", alignItems: "flex-start", gap: 6,
                    padding: "8px 10px", borderRadius: 8,
                    background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)",
                }}>
                    <AlertTriangleIcon size={11} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ margin: 0, fontSize: 11, color: "#ef4444", lineHeight: 1.4 }}>{error}</p>
                </div>
            )}

            {success && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 10px", borderRadius: 8,
                    background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.2)",
                }}>
                    <CheckCircle2Icon size={11} color="#4ade80" />
                    <p style={{ margin: 0, fontSize: 11, color: "#4ade80" }}>off{selectedToken?.tokenSymbol} created</p>
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={loading || loadingTokens || airTokens.length === 0}
                style={{
                    width: "100%", padding: "12px",
                    borderRadius: 10, border: "none",
                    background: (loading || loadingTokens || airTokens.length === 0) ? "rgba(245,158,11,0.3)" : "#F59E0B",
                    color: "#000", fontFamily: "'Inter', sans-serif",
                    fontSize: 13, fontWeight: 700,
                    cursor: (loading || loadingTokens || airTokens.length === 0) ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    marginTop: 4,
                }}
            >
                {loading
                    ? <><Loader2Icon size={13} style={{ animation: "spin 1s linear infinite" }} /> Signing...</>
                    : <><SendIcon size={13} /> Send off{selectedToken?.tokenSymbol ?? "Token"}</>
                }
            </button>

            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.5 }}>
                MetaMask signs locally. No internet needed.
            </p>
        </div>
    );
}

function LandingCard({ onEnter, isOnline }: { onEnter: () => void; isOnline: boolean }) {
    const logoUrl = `${import.meta.env.BASE_URL}qryptum-logo.png`;
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || !!(window.navigator as any).standalone;
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [installed, setInstalled] = useState(isStandalone);

    useEffect(() => {
        const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
        const onInstalled = () => setInstalled(true);
        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", onInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") setInstalled(true);
        setDeferredPrompt(null);
    };

    const steps = [
        { n: "01", text: "Turn off your WiFi or mobile data" },
        { n: "02", text: "Open QryptAir (installed as PWA or this page)" },
        { n: "03", text: "Select token, fill in amount and recipient" },
        { n: "04", text: "MetaMask signs locally, no internet needed" },
        { n: "05", text: "Share the QR code - anyone can broadcast it, funds always reach the recipient" },
    ];

    const isDesktop = window.matchMedia("(min-width: 769px)").matches;

    const statusBlock = (
        <div style={{
            borderRadius: 12,
            background: isOnline ? "rgba(245,158,11,0.06)" : "rgba(74,222,128,0.06)",
            border: `1px solid ${isOnline ? "rgba(245,158,11,0.2)" : "rgba(74,222,128,0.2)"}`,
            padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 12,
        }}>
            <div style={{
                width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isOnline ? "rgba(245,158,11,0.12)" : "rgba(74,222,128,0.12)",
                border: `1px solid ${isOnline ? "rgba(245,158,11,0.3)" : "rgba(74,222,128,0.3)"}`,
                animation: isOnline ? "pulse-ring 2s ease-in-out infinite" : "none",
            }}>
                {isOnline ? <WifiIcon size={16} color="#F59E0B" /> : <WifiOffIcon size={16} color="#4ade80" />}
            </div>
            <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: isOnline ? "#F59E0B" : "#4ade80" }}>
                    {isOnline ? "You are online" : "Offline - ready"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
                    {isOnline
                        ? "Turn off WiFi or mobile data before creating offTokens."
                        : "MetaMask signs locally. No data leaves your device."}
                </p>
            </div>
        </div>
    );

    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

    const installBlock = installed ? (
        <div style={{
            padding: "10px 14px", borderRadius: 10,
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.2)",
        }}>
            <CheckIcon size={13} color="#4ade80" />
            <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>App installed</span>
        </div>
    ) : (
        <div>
            <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Install for offline use
            </p>

            {deferredPrompt ? (
                <button onClick={handleInstall} style={{
                    width: "100%", padding: "11px 16px", borderRadius: 10,
                    border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.09)",
                    color: "#F59E0B", fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                    {isAndroid ? <SmartphoneIcon size={13} /> : <MonitorIcon size={13} />}
                    {isAndroid ? "Install on Android" : "Install on Desktop"}
                </button>
            ) : isIOS ? (
                isSafari ? (
                    <div style={{
                        padding: "12px 14px", borderRadius: 10,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                        <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            iPhone / iPad
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
                            Tap the Share icon at the bottom of Safari then choose Add to Home Screen.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        padding: "12px 14px", borderRadius: 10,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                        <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            iPhone / iPad
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
                            Open this page in Safari to install it on your home screen.
                        </p>
                    </div>
                )
            ) : isAndroid ? (
                <div style={{
                    padding: "12px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                }}>
                    <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Android
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
                        Open this page in Chrome then tap the menu at the top right and select Add to Home Screen.
                    </p>
                </div>
            ) : (
                <div style={{
                    padding: "12px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                }}>
                    <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Desktop
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
                        Look for the install icon at the right side of your browser address bar and click it to install.
                    </p>
                </div>
            )}
        </div>
    );

    const ctaBlock = (
        <div>
            <button
                onClick={isOnline ? undefined : onEnter}
                disabled={isOnline}
                style={{
                    width: "100%", padding: "14px",
                    borderRadius: 12, border: isOnline ? "1px solid rgba(255,255,255,0.07)" : "none",
                    background: isOnline ? "rgba(255,255,255,0.04)" : "#F59E0B",
                    color: isOnline ? "rgba(255,255,255,0.2)" : "#000",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14, fontWeight: 800,
                    cursor: isOnline ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                }}
            >
                {isOnline ? <WifiIcon size={15} /> : <WifiOffIcon size={15} />}
                {isOnline ? "Turn off internet first" : "Open QryptAir"}
                {!isOnline && <ArrowRightIcon size={14} />}
            </button>
            {isOnline && (
                <p style={{ margin: "8px 0 0", fontSize: 10, color: "rgba(245,158,11,0.5)", textAlign: "center", lineHeight: 1.5 }}>
                    Disable WiFi or mobile data to unlock this button.
                </p>
            )}
        </div>
    );

    if (isDesktop) {
        return (
            <div style={{
                minHeight: "100vh", background: "#0d0d12",
                fontFamily: "'Inter', sans-serif", color: "#d4d6e2",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "40px 48px", boxSizing: "border-box",
            }}>
                <style>{`@keyframes pulse-ring { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }`}</style>
                <div style={{
                    width: "100%", maxWidth: 920,
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 22, overflow: "hidden",
                    display: "flex",
                }}>
                    {/* Left column */}
                    <div style={{
                        flex: "0 0 420px", padding: "44px 40px",
                        borderRight: "1px solid rgba(255,255,255,0.06)",
                        display: "flex", flexDirection: "column", gap: 32,
                    }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 14 }}>
                                <img src={logoUrl} alt="Qryptum" style={{ width: 52, height: 52, objectFit: "contain" }} />
                                <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, marginLeft: -2 }}>
                                    Qrypt<span style={{ color: "#F59E0B" }}>Air</span>
                                </span>
                                <span style={{
                                    fontSize: 9, fontWeight: 800, letterSpacing: "0.07em",
                                    border: "1px solid rgba(245,158,11,0.4)", borderRadius: 4,
                                    padding: "2px 6px", color: "#F59E0B", marginLeft: 4,
                                    alignSelf: "flex-start", marginTop: 7,
                                }}>PWA</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
                                Sign blockchain transactions with no internet connection. MetaMask signs locally on your device. No network required.
                            </p>
                        </div>

                        <div>
                            <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                How it works
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                                {steps.map(s => (
                                    <div key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                        <span style={{
                                            fontSize: 9, fontWeight: 800, color: "#F59E0B",
                                            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                                            borderRadius: 4, padding: "2px 5px", flexShrink: 0, letterSpacing: "0.04em", marginTop: 2,
                                        }}>{s.n}</span>
                                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{s.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div style={{
                        flex: 1, padding: "44px 40px",
                        display: "flex", flexDirection: "column", gap: 24, justifyContent: "center",
                    }}>
                        {statusBlock}
                        {installBlock}
                        {(isIOS || isAndroid) && (
                            <div style={{
                                padding: "12px 14px", borderRadius: 10,
                                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                            }}>
                                <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                                    Mobile offline tip
                                </p>
                                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>
                                    WalletConnect cannot sign when offline. For offline signing on mobile, open this page inside your wallet's built-in browser (MetaMask, Trust Wallet, OKX, Bitget, etc.).
                                </p>
                            </div>
                        )}
                        <div style={{ marginTop: 8 }}>
                            {ctaBlock}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh", background: "#0d0d12",
            fontFamily: "'Inter', sans-serif", color: "#d4d6e2",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "28px 18px", boxSizing: "border-box",
        }}>
            <style>{`@keyframes pulse-ring { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }`}</style>
            <div style={{
                width: "100%", maxWidth: 480,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, overflow: "hidden",
                display: "flex", flexDirection: "column", gap: 0,
            }}>
                <div style={{ padding: "32px 28px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 10 }}>
                        <img src={logoUrl} alt="Qryptum" style={{ width: 46, height: 46, objectFit: "contain" }} />
                        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, marginLeft: -2 }}>
                            Qrypt<span style={{ color: "#F59E0B" }}>Air</span>
                        </span>
                        <span style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: "0.07em",
                            border: "1px solid rgba(245,158,11,0.4)", borderRadius: 4,
                            padding: "2px 6px", color: "#F59E0B", marginLeft: 4, alignSelf: "flex-start", marginTop: 6,
                        }}>PWA</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                        Sign blockchain transactions with no internet connection. MetaMask signs locally.
                    </p>
                </div>

                <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {statusBlock}
                </div>

                <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        How it works
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {steps.map(s => (
                            <div key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                                <span style={{
                                    fontSize: 9, fontWeight: 800, color: "#F59E0B",
                                    background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                                    borderRadius: 4, padding: "2px 5px", flexShrink: 0, letterSpacing: "0.04em", marginTop: 1,
                                }}>{s.n}</span>
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{s.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {installBlock}
                </div>

                <div style={{ padding: "20px 28px" }}>
                    {ctaBlock}
                </div>
            </div>
        </div>
    );
}

export default function QryptAirPWAPage() {
    const { address, isConnected, connector } = useAccount();
    const chainId = useChainId();
    const { vaultAddress, vaultVersion, hasVault } = useVault();
    const { airTokens, refetch: refetchTokens } = useAirBagTokens(vaultAddress, vaultVersion, chainId);

    const loadingTokens = !!address && isConnected && hasVault && airTokens.length === 0;

    const [history, setHistory] = useState<VoucherRecord[]>(loadHistory);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showLanding, setShowLanding] = useState(true);
    const [mobileTab, setMobileTab] = useState<"send" | "history">("send");
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;

    const logoUrl = `${import.meta.env.BASE_URL}qryptum-logo.png`;

    useEffect(() => {
        const base = import.meta.env.BASE_URL;

        const link = document.createElement("link");
        link.rel = "manifest";
        link.id = "air-manifest-link";
        link.href = `${base}air-manifest.json`;
        document.head.appendChild(link);

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register(`${base}air-sw.js`, { scope: `${base}air` })
                .catch(() => {});
        }

        return () => {
            if (document.head.contains(link)) document.head.removeChild(link);
        };
    }, []);

    useEffect(() => {
        const on = () => {
            setIsOnline(true);
            setShowLanding(true);
            refetchTokens();
            const { records, changed } = syncExpired(loadHistory());
            const latest = changed ? records : loadHistory();
            if (changed) saveHistory(records);
            setHistory(latest);
        };
        const off = () => setIsOnline(false);
        window.addEventListener("online", on);
        window.addEventListener("offline", off);
        return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
    }, [refetchTokens]);

    useEffect(() => {
        if (!isOnline) {
            const { records, changed } = syncExpired(loadHistory());
            if (changed) { saveHistory(records); setHistory(records); }
        }
    }, [isOnline]);

    // Unified sync: BroadcastChannel (same device) + WebSocket (cross-device)
    const { broadcast } = useSyncChannel(address, (msg) => {
        if (msg.type === "MINT_SUCCESS") refetchTokens();
    });

    const onVoucherCreated = useCallback((r: VoucherRecord) => {
        setHistory(prev => [r, ...prev]);
        broadcast({ type: "VOUCHER_CREATED" });
    }, [broadcast]);

    // Auto-resolve pending offTokens by checking usedVoucherNonces on-chain
    const nonceLookups = useMemo(() => {
        const result: Array<{ id: string; vaultAddress: string; nonce: `0x${string}` }> = [];
        for (const r of history) {
            if (r.status !== "pending") continue;
            const n: string | null = r.nonce ?? decodeNonce(r.qrData);
            if (n) result.push({ id: r.id, vaultAddress: r.vaultAddress, nonce: n as `0x${string}` });
        }
        return result;
    }, [history]);

    const nonceContracts = useMemo(() =>
        nonceLookups.map(l => ({
            address: l.vaultAddress as `0x${string}`,
            abi: PERSONAL_VAULT_V6_ABI,
            functionName: "usedVoucherNonces" as const,
            args: [l.nonce] as const,
        })),
        [nonceLookups],
    );

    const { data: nonceResults } = useReadContracts({
        contracts: nonceContracts,
        query: { enabled: nonceContracts.length > 0 && isConnected, refetchInterval: 30_000 },
    });

    useEffect(() => {
        if (!nonceResults || nonceLookups.length === 0) return;
        const claimedIds = new Set<string>();
        nonceResults.forEach((result, i) => {
            if (result.result === true) claimedIds.add(nonceLookups[i].id);
        });
        if (claimedIds.size === 0) return;
        setHistory(prev => {
            const updated = prev.map(r =>
                claimedIds.has(r.id) ? { ...r, status: "claimed" as const } : r,
            );
            saveHistory(updated);
            return updated;
        });
    }, [nonceResults, nonceLookups]);

    const pending = history.filter(r => r.status === "pending").length;

    const sidebarContent = (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

            <div style={{
                padding: "20px 24px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                    <img src={logoUrl} alt="Qryptum" style={{ width: 42, height: 42, objectFit: "contain", flexShrink: 0 }} />
                    <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginLeft: -2 }}>
                        Qrypt<span style={{ color: "#F59E0B" }}>Air</span>
                    </span>
                    <span style={{
                        fontSize: 8, fontWeight: 800, letterSpacing: "0.07em",
                        border: "1px solid rgba(245,158,11,0.4)", borderRadius: 4,
                        padding: "2px 6px", color: "#F59E0B", marginLeft: 2,
                    }}>PWA</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {isOnline
                        ? <WifiIcon size={11} color="#4ade80" />
                        : <WifiOffIcon size={11} color="rgba(255,255,255,0.3)" />}
                    <span style={{ fontSize: 11, color: isOnline ? "#4ade80" : "rgba(255,255,255,0.3)" }}>
                        {isOnline ? "Online" : "Offline"}
                    </span>
                    {isOnline && (
                        <span style={{
                            marginLeft: 4, fontSize: 10,
                            color: "rgba(245,158,11,0.7)",
                            background: "rgba(245,158,11,0.07)",
                            border: "1px solid rgba(245,158,11,0.15)",
                            padding: "1px 6px", borderRadius: 4,
                        }}>
                            Turn off internet to use offline
                        </span>
                    )}
                </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                {(() => {
                    const isWC = connector && (
                        connector.id.toLowerCase().includes("walletconnect") ||
                        connector.id.toLowerCase().startsWith("wc")
                    );
                    const isMobileUA = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    if (isConnected && isWC && isMobileUA) return (
                        <div style={{
                            padding: "12px 14px", borderRadius: 10,
                            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)",
                        }}>
                            <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "rgba(239,68,68,0.8)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                                Offline signing not available
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                                WalletConnect needs internet to relay signing requests. For offline use, open this page inside your wallet's built-in browser (MetaMask, Trust Wallet, OKX, Bitget, etc.).
                            </p>
                        </div>
                    );
                    return null;
                })()}

                {!isConnected || !address ? (
                    <div style={{
                        padding: "14px 16px", borderRadius: 10,
                        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)",
                        marginTop: 8,
                    }}>
                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                            Connect MetaMask on the main dashboard first, then return here.
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{
                            padding: "9px 12px", borderRadius: 8,
                            background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)",
                            display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {address.slice(0, 10)}...{address.slice(-6)}
                            </span>
                            <button
                                onClick={refetchTokens}
                                title="Refresh tokens"
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center",
                                    padding: 2,
                                }}
                            >
                                <RefreshCwIcon size={11} />
                            </button>
                        </div>

                        {!hasVault && (
                            <div style={{
                                padding: "10px 12px", borderRadius: 8,
                                background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                            }}>
                                <p style={{ margin: 0, fontSize: 11, color: "rgba(239,68,68,0.8)", lineHeight: 1.5 }}>
                                    No QryptSafe vault found. Create one in the main dashboard first.
                                </p>
                            </div>
                        )}

                        {hasVault && (
                            <SendForm
                                walletAddress={address}
                                vaultAddress={vaultAddress as string ?? ""}
                                airTokens={airTokens}
                                loadingTokens={loadingTokens}
                                onVoucherCreated={onVoucherCreated}
                                history={history}
                                chainId={chainId}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );

    const historyContent = (
        <div style={{ padding: "24px 28px" }}>
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 20,
            }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}>
                    History
                </span>
                {pending > 0 && (
                    <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                        padding: "3px 8px", borderRadius: 5,
                        background: "rgba(245,158,11,0.1)", color: "#F59E0B",
                        border: "1px solid rgba(245,158,11,0.25)",
                    }}>{pending} active</span>
                )}
            </div>

            {history.length === 0 ? (
                <div style={{ textAlign: "center", paddingTop: 60 }}>
                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, margin: 0 }}>No offTokens yet</p>
                    <p style={{ color: "rgba(255,255,255,0.1)", fontSize: 11, margin: "6px 0 0" }}>
                        Generated offTokens appear here
                    </p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 14,
                }}>
                    {history.map(r => <QrCard key={r.id} record={r} />)}
                </div>
            )}
        </div>
    );

    if (showLanding) {
        return <LandingCard onEnter={() => setShowLanding(false)} isOnline={isOnline} />;
    }

    if (isMobile) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "#0d0d12",
                fontFamily: "'Inter', sans-serif",
                color: "#d4d6e2",
                display: "flex", flexDirection: "column",
            }}>
                <div style={{ flex: 1, overflowY: "auto" }}>
                    {mobileTab === "send" ? sidebarContent : historyContent}
                </div>
                <div style={{
                    display: "flex", borderTop: "1px solid rgba(255,255,255,0.06)",
                    background: "#0d0d12", flexShrink: 0,
                }}>
                    {(["send", "history"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setMobileTab(tab)}
                            style={{
                                flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
                                background: mobileTab === tab ? "rgba(245,158,11,0.08)" : "transparent",
                                color: mobileTab === tab ? "#F59E0B" : "rgba(255,255,255,0.3)",
                                fontSize: 12, fontWeight: 700, textTransform: "capitalize",
                                fontFamily: "'Inter', sans-serif",
                                borderTop: mobileTab === tab ? "2px solid #F59E0B" : "2px solid transparent",
                            }}
                        >
                            {tab === "history" && pending > 0 ? `History (${pending})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            height: "100vh",
            background: "#0d0d12",
            fontFamily: "'Inter', sans-serif",
            color: "#d4d6e2",
            display: "flex",
            overflow: "hidden",
        }}>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
            `}</style>

            <div style={{
                width: 400,
                minWidth: 400,
                borderRight: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: "rgba(255,255,255,0.01)",
            }}>
                {sidebarContent}
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
                {historyContent}
            </div>
        </div>
    );
}
