import { useState, useCallback, useRef, useEffect } from "react";
import { keccak256, toBytes, parseUnits, formatUnits } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import {
    SendIcon, EyeIcon, EyeOffIcon, CheckCircle2Icon,
    CopyIcon, DownloadIcon, AlertTriangleIcon, ChevronDownIcon,
    ZapIcon, ArrowUpIcon, RefreshCwIcon, Loader2Icon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addDays, format } from "date-fns";
import { peekNextProof, consumeProofAtPosition } from "@/lib/password";
import { PERSONAL_VAULT_V6_ABI } from "@/lib/abi";
import { useTxStatus } from "@/lib/txStatusContext";
import { recordTransaction } from "@/lib/api";
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

const STEP = { form: 0, signing: 1, done: 2 } as const;

function field(label: string, children: React.ReactNode, hint?: string) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}>
                {label}
            </label>
            {children}
            {hint && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>{hint}</p>}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#d4d6e2", fontFamily: "'Inter', sans-serif", fontSize: 13,
    outline: "none", boxSizing: "border-box",
};

const DEADLINES = [
    { label: "1 day", days: 1 },
    { label: "3 days", days: 3 },
    { label: "7 days", days: 7 },
    { label: "30 days", days: 30 },
];

function AirBudgetManager({
    token,
    airBudget,
    shieldedBalance,
    walletAddress,
    vaultAddress,
    chainId,
    onDone,
}: {
    token: Token;
    airBudget: bigint;
    shieldedBalance: bigint;
    walletAddress: string;
    vaultAddress: `0x${string}`;
    chainId: number;
    onDone: () => void;
}) {
    const { toast } = useToast();
    const { pushTx } = useTxStatus();
    const [fundAmount, setFundAmount] = useState("");
    const [subMode, setSubMode] = useState<"fund" | "reclaim">("fund");
    const [vaultProof, setVaultProof] = useState("");
    const [showVaultProof, setShowVaultProof] = useState(false);
    const pendingPositionRef = useRef<number | null>(null);
    const fundAmountRef = useRef("");

    const { writeContract: writeFund, data: fundTxHash, isPending: isFundPending } = useWriteContract();
    const { writeContract: writeReclaim, data: reclaimTxHash, isPending: isReclaimPending } = useWriteContract();

    const { isLoading: fundConfirming, isSuccess: fundSuccess } = useWaitForTransactionReceipt({ hash: fundTxHash });
    const { isLoading: reclaimConfirming, isSuccess: reclaimSuccess } = useWaitForTransactionReceipt({ hash: reclaimTxHash });

    useEffect(() => {
        if (fundSuccess && fundTxHash) {
            recordTransaction({
                walletAddress,
                txHash: fundTxHash,
                type: "fund",
                tokenAddress: token.tokenAddress,
                tokenSymbol: token.tokenSymbol,
                tokenName: token.tokenName,
                amount: fundAmountRef.current || "0",
                fromAddress: walletAddress,
                networkId: chainId,
            }).catch(() => {});
        }
    }, [fundSuccess, fundTxHash]);

    useEffect(() => {
        if (reclaimSuccess && reclaimTxHash) {
            recordTransaction({
                walletAddress,
                txHash: reclaimTxHash,
                type: "reclaim",
                tokenAddress: token.tokenAddress,
                tokenSymbol: token.tokenSymbol,
                tokenName: token.tokenName,
                amount: "0",
                fromAddress: walletAddress,
                networkId: chainId,
            }).catch(() => {});
        }
    }, [reclaimSuccess, reclaimTxHash]);

    const handleFund = useCallback(async () => {
        if (!fundAmount) {
            toast({ title: "Enter an amount", variant: "destructive" });
            return;
        }
        let parsed: bigint;
        try { parsed = parseUnits(fundAmount, token.decimals); } catch {
            toast({ title: "Invalid amount", variant: "destructive" });
            return;
        }
        if (parsed === 0n || parsed > shieldedBalance) {
            toast({ title: "Amount exceeds shielded balance", variant: "destructive" });
            return;
        }
        if (!vaultProof) {
            toast({ title: "Enter your vault proof", variant: "destructive" });
            return;
        }
        let peeked: { proof: `0x${string}`; position: number };
        try { peeked = await peekNextProof(vaultProof, walletAddress); } catch (err: any) {
            toast({ title: "Chain error", description: err.message, variant: "destructive" });
            return;
        }
        pendingPositionRef.current = peeked.position;
        fundAmountRef.current = fundAmount;
        writeFund({
            address: vaultAddress,
            abi: PERSONAL_VAULT_V6_ABI,
            functionName: "fundAirBags",
            args: [token.tokenAddress as `0x${string}`, parsed, peeked.proof],
        }, {
            onSuccess: (hash) => pushTx(hash, `Funding air budget with ${fundAmount} ${token.tokenSymbol}`),
        });
    }, [fundAmount, vaultProof, token, shieldedBalance, walletAddress, vaultAddress, writeFund, toast, pushTx]);

    const handleReclaim = useCallback(async () => {
        if (airBudget === 0n) {
            toast({ title: "Air budget is empty", variant: "destructive" });
            return;
        }
        if (!vaultProof) {
            toast({ title: "Enter your vault proof", variant: "destructive" });
            return;
        }
        let peeked: { proof: `0x${string}`; position: number };
        try { peeked = await peekNextProof(vaultProof, walletAddress); } catch (err: any) {
            toast({ title: "Chain error", description: err.message, variant: "destructive" });
            return;
        }
        pendingPositionRef.current = peeked.position;
        writeReclaim({
            address: vaultAddress,
            abi: PERSONAL_VAULT_V6_ABI,
            functionName: "reclaimAirBags",
            args: [token.tokenAddress as `0x${string}`, peeked.proof],
        }, {
            onSuccess: (hash) => pushTx(hash, `Reclaiming air budget for ${token.tokenSymbol}`),
        });
    }, [vaultProof, airBudget, walletAddress, vaultAddress, writeReclaim, token, toast, pushTx]);

    if (fundSuccess || reclaimSuccess) {
        if (pendingPositionRef.current !== null) {
            consumeProofAtPosition(walletAddress, pendingPositionRef.current);
            pendingPositionRef.current = null;
        }
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 0" }}>
                <CheckCircle2Icon size={36} color="#4ade80" />
                <p style={{ fontSize: 14, fontWeight: 600, color: "#4ade80", margin: 0 }}>
                    {fundSuccess ? "Air budget funded" : "Air budget reclaimed"}
                </p>
                <button onClick={onDone} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Inter', sans-serif",
                    textDecoration: "underline",
                }}>Done</button>
            </div>
        );
    }

    const isPending = isFundPending || isReclaimPending || fundConfirming || reclaimConfirming;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 6 }}>
                {(["fund", "reclaim"] as const).map(m => (
                    <button key={m} onClick={() => setSubMode(m)} style={{
                        flex: 1, padding: "8px", borderRadius: 8, border: "1px solid",
                        borderColor: subMode === m ? "rgba(245,158,11,0.6)" : "rgba(255,255,255,0.09)",
                        background: subMode === m ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                        color: subMode === m ? "#F59E0B" : "rgba(255,255,255,0.45)",
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                        textTransform: "capitalize", fontFamily: "'Inter', sans-serif",
                    }}>{m === "fund" ? "Fund Budget" : "Reclaim Budget"}</button>
                ))}
            </div>

            <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Current Air Bags</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B", fontFamily: "monospace" }}>
                        {formatUnits(airBudget, token.decimals)} {token.tokenSymbol}
                    </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Shielded Balance</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>
                        {formatUnits(shieldedBalance, token.decimals)} {token.tokenSymbol}
                    </span>
                </div>
            </div>

            {subMode === "fund" && field("Amount to Fund",
                <div style={{ position: "relative" }}>
                    <input
                        style={inputStyle} type="number" placeholder="0.00"
                        value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                    />
                    <button
                        onClick={() => setFundAmount(formatUnits(shieldedBalance, token.decimals))}
                        style={{
                            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: 11, fontWeight: 700, color: "#F59E0B",
                        }}
                    >MAX</button>
                </div>,
                "Moves tokens from your shielded balance into the air budget"
            )}

            {field("Vault Proof",
                <div style={{ position: "relative" }}>
                    <input
                        style={inputStyle} type={showVaultProof ? "text" : "password"}
                        placeholder="6-character vault proof" autoComplete="off"
                        value={vaultProof} onChange={e => setVaultProof(e.target.value)}
                    />
                    <button onClick={() => setShowVaultProof(v => !v)} style={{
                        position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)",
                        display: "flex", alignItems: "center",
                    }}>
                        {showVaultProof ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                    </button>
                </div>
            )}

            <button
                onClick={subMode === "fund" ? handleFund : handleReclaim}
                disabled={isPending}
                style={{
                    width: "100%", padding: "12px", borderRadius: 12, border: "none",
                    background: isPending ? "rgba(245,158,11,0.4)" : "#F59E0B",
                    color: "#000", fontFamily: "'Inter', sans-serif",
                    fontSize: 14, fontWeight: 700, cursor: isPending ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
            >
                {isPending ? (
                    <><Loader2Icon size={15} style={{ animation: "spin 1s linear infinite" }} /> Processing...</>
                ) : subMode === "fund" ? (
                    <><ArrowUpIcon size={15} /> Fund Air Bags</>
                ) : (
                    <><RefreshCwIcon size={15} /> Reclaim Air Bags</>
                )}
            </button>

            <button onClick={onDone} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.3)", fontSize: 12,
                fontFamily: "'Inter', sans-serif", textDecoration: "underline",
            }}>Cancel</button>
        </div>
    );
}

export default function QryptAirSenderPanel({ walletAddress, chainId, tokensWithBalances, initialTokenAddress, initialShowBudgetManager, vaultVersion, vaultAddress, airBudgets }: QryptAirSenderPanelProps) {
    const { toast } = useToast();
    const [step, setStep] = useState<0 | 1 | 2>(STEP.form);
    const preselected = initialTokenAddress
        ? (tokensWithBalances.find(t => t.tokenAddress.toLowerCase() === initialTokenAddress.toLowerCase()) ?? tokensWithBalances[0] ?? null)
        : (tokensWithBalances[0] ?? null);
    const [selectedToken, setSelectedToken] = useState<Token | null>(preselected);
    const tokenLocked = !!initialTokenAddress;
    const [amount, setAmount] = useState("");
    const [recipient, setRecipient] = useState("");
    const [deadlineDays, setDeadlineDays] = useState(7);
    const [transferCode, setTransferCode] = useState("");
    const [showCode, setShowCode] = useState(false);
    const [voucher, setVoucher] = useState<Record<string, string> | null>(null);
    const [qrValue, setQrValue] = useState<string | null>(null);
    const [showTokenMenu, setShowTokenMenu] = useState(false);
    const [showBudgetManager, setShowBudgetManager] = useState(!!initialShowBudgetManager);

    const isV6 = vaultVersion === "v6";

    const selectedAirBudget = selectedToken
        ? (airBudgets[selectedToken.tokenAddress.toLowerCase()] ?? 0n)
        : 0n;
    const selectedShielded = selectedToken?.shieldedBalance ?? 0n;
    const maxVoucherAmount = isV6 ? selectedAirBudget : selectedShielded;

    const deadline = Math.floor(addDays(new Date(), deadlineDays).getTime() / 1000);
    const nonce = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, "0")).join("")}`;

    const handleSign = useCallback(async () => {
        if (!selectedToken || !amount || !recipient || !transferCode) {
            toast({ title: "Fill all fields", description: "Token, amount, recipient, and transfer code are required.", variant: "destructive" });
            return;
        }
        if (!recipient.startsWith("0x") || recipient.length !== 42) {
            toast({ title: "Invalid address", description: "Recipient must be a valid 0x address.", variant: "destructive" });
            return;
        }
        if (transferCode.length < 4 || transferCode.length > 32) {
            toast({ title: "Invalid transfer code", description: "Transfer code must be 4-32 characters.", variant: "destructive" });
            return;
        }

        let parsedAmount: bigint;
        try {
            parsedAmount = parseUnits(amount, selectedToken.decimals);
        } catch {
            toast({ title: "Invalid amount", variant: "destructive" });
            return;
        }

        if (isV6 && parsedAmount > selectedAirBudget) {
            toast({ title: "Exceeds air budget", description: `Max voucher amount is ${formatUnits(selectedAirBudget, selectedToken.decimals)} ${selectedToken.tokenSymbol}. Fund your air budget first.`, variant: "destructive" });
            return;
        }

        const transferCodeHash = keccak256(toBytes(transferCode));
        const nonceBytes = nonce as `0x${string}`;

        const voucherMeta = {
            token: selectedToken.tokenAddress,
            amount: parsedAmount.toString(),
            recipient,
            deadline: deadline.toString(),
            nonce: nonceBytes,
            transferCodeHash,
            vaultAddress: vaultAddress ?? "",
        };
        setVoucher(voucherMeta);
        setStep(STEP.signing);

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
            domain: { name: "QryptAir", version: "1", chainId },
            message: {
                token: selectedToken.tokenAddress,
                amount: parsedAmount.toString(),
                recipient,
                deadline: deadline.toString(),
                nonce: nonceBytes,
                transferCodeHash,
            },
        };

        try {
            const ethereum = (window as any).ethereum;
            if (!ethereum) {
                toast({ title: "Wallet not found", description: "MetaMask or injected wallet required.", variant: "destructive" });
                setStep(STEP.form);
                return;
            }
            const sig: string = await ethereum.request({
                method: "eth_signTypedData_v4",
                params: [walletAddress, JSON.stringify(typedData)],
            });
            const payload = { ...voucherMeta, signature: sig };
            setQrValue(JSON.stringify(payload, null, 2));
            setStep(STEP.done);

            // Record voucher creation in history (offline TX — use sig hash as unique ID)
            const syntheticTxHash = keccak256(toBytes(sig));
            const humanAmount = formatUnits(parsedAmount, selectedToken.decimals);
            recordTransaction({
                walletAddress,
                txHash: syntheticTxHash,
                type: "voucher",
                tokenAddress: selectedToken.tokenAddress,
                tokenSymbol: selectedToken.tokenSymbol,
                tokenName: selectedToken.tokenName,
                amount: humanAmount,
                fromAddress: walletAddress,
                toAddress: recipient,
                networkId: chainId,
            }).catch(() => {});
        } catch (err: any) {
            toast({ title: "Signing failed", description: err.message ?? "Unknown error", variant: "destructive" });
            setStep(STEP.form);
        }
    }, [selectedToken, amount, recipient, deadline, transferCode, chainId, walletAddress, nonce, isV6, selectedAirBudget, toast]);

    const copyJson = useCallback(() => {
        if (!qrValue) return;
        navigator.clipboard.writeText(qrValue);
        toast({ title: "Voucher JSON copied to clipboard" });
    }, [qrValue, toast]);

    const downloadQr = useCallback(() => {
        const svg = document.getElementById("qryptair-qr") as SVGElement | null;
        if (!svg) return;
        const xml = new XMLSerializer().serializeToString(svg);
        const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
        const a = document.createElement("a"); a.href = url; a.download = "qryptair-voucher.svg"; a.click();
        URL.revokeObjectURL(url);
    }, []);

    if (!tokensWithBalances.length) {
        return (
            <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
                No shielded tokens found. Shield a token first.
            </div>
        );
    }

    if (showBudgetManager && isV6 && vaultAddress && selectedToken) {
        return (
            <AirBudgetManager
                token={selectedToken}
                airBudget={selectedAirBudget}
                shieldedBalance={selectedShielded}
                walletAddress={walletAddress}
                vaultAddress={vaultAddress}
                chainId={chainId}
                onDone={() => setShowBudgetManager(false)}
            />
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {isV6 && step === STEP.form && selectedToken && (
                <div style={{
                    padding: "12px 14px", borderRadius: 10,
                    background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                            <ZapIcon size={12} color="#F59E0B" />
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.05em" }}>AIR BAGS</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B", fontFamily: "monospace" }}>
                            {formatUnits(selectedAirBudget, selectedToken.decimals)} {selectedToken.tokenSymbol}
                        </span>
                        {selectedAirBudget === 0n && (
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>
                                Fund your air budget to create vouchers
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => setShowBudgetManager(true)}
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
                        <ArrowUpIcon size={11} /> Manage Budget
                    </button>
                </div>
            )}

            {step === STEP.form && (
                <>
                    {!tokenLocked && field("Token to Send",
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => setShowTokenMenu(v => !v)}
                                style={{
                                    ...inputStyle, display: "flex", alignItems: "center",
                                    justifyContent: "space-between", cursor: "pointer", padding: "10px 12px",
                                }}
                            >
                                <span>
                                    {selectedToken
                                        ? `${selectedToken.tokenSymbol}  \u2014  ${formatUnits(maxVoucherAmount, selectedToken.decimals)} ${isV6 ? "air budget" : "shielded"}`
                                        : "Select token"}
                                </span>
                                <ChevronDownIcon size={14} color="rgba(255,255,255,0.4)" />
                            </button>
                            {showTokenMenu && (
                                <div style={{
                                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                                    background: "#111", border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: 10, marginTop: 4, overflow: "hidden",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                                }}>
                                    {tokensWithBalances.map(t => {
                                        const ab = airBudgets[t.tokenAddress.toLowerCase()] ?? 0n;
                                        const displayBal = isV6 ? ab : (t.shieldedBalance ?? 0n);
                                        return (
                                            <button key={t.tokenAddress} onClick={() => { setSelectedToken(t); setShowTokenMenu(false); }} style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                width: "100%", padding: "10px 14px",
                                                background: "none", border: "none", cursor: "pointer",
                                                color: "rgba(255,255,255,0.8)", fontFamily: "'Inter', sans-serif", fontSize: 13,
                                            }}
                                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                                                onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                            >
                                                <span>{t.tokenSymbol}</span>
                                                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                                                    {formatUnits(displayBal, t.decimals)} {isV6 ? "budget" : ""}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {field("Amount",
                        <div style={{ position: "relative" }}>
                            <input
                                style={inputStyle} type="number" placeholder="0.00" value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                            {selectedToken && (
                                <button
                                    onClick={() => setAmount(formatUnits(maxVoucherAmount, selectedToken.decimals))}
                                    style={{
                                        position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                                        background: "none", border: "none", cursor: "pointer",
                                        fontSize: 11, fontWeight: 700, color: "#F59E0B", letterSpacing: "0.05em",
                                    }}
                                >MAX</button>
                            )}
                        </div>,
                        isV6 ? "Max = your current air budget for this token" : undefined
                    )}

                    {field("Recipient Address",
                        <input style={inputStyle} placeholder="0x..." value={recipient} onChange={e => setRecipient(e.target.value)} />
                    )}

                    {field("Expiry",
                        <div style={{ display: "flex", gap: 6 }}>
                            {DEADLINES.map(d => (
                                <button key={d.days} onClick={() => setDeadlineDays(d.days)} style={{
                                    flex: 1, padding: "8px 4px", borderRadius: 8,
                                    border: `1px solid ${deadlineDays === d.days ? "rgba(245,158,11,0.6)" : "rgba(255,255,255,0.09)"}`,
                                    background: deadlineDays === d.days ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                                    color: deadlineDays === d.days ? "#F59E0B" : "rgba(255,255,255,0.45)",
                                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                                    fontFamily: "'Inter', sans-serif",
                                }}>{d.label}</button>
                            ))}
                        </div>,
                        `Voucher valid until: ${format(addDays(new Date(), deadlineDays), "MMM d, yyyy")}`
                    )}

                    {field("Transfer Code",
                        <div style={{ position: "relative" }}>
                            <input
                                style={inputStyle} type={showCode ? "text" : "password"}
                                placeholder="4-32 characters"
                                autoComplete="off"
                                value={transferCode} onChange={e => setTransferCode(e.target.value)}
                            />
                            <button onClick={() => setShowCode(v => !v)} style={{
                                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                                background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)",
                                display: "flex", alignItems: "center",
                            }}>
                                {showCode ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                            </button>
                        </div>,
                        "Share via a separate channel, not together with the QR code"
                    )}

                    {isV6 && selectedAirBudget === 0n && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.22)" }}>
                            <AlertTriangleIcon size={13} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
                                Your air budget is empty. Click <strong style={{ color: "#F59E0B" }}>Manage Budget</strong> above to fund it from your shielded balance before creating a voucher.
                            </p>
                        </div>
                    )}

                    <button onClick={handleSign} disabled={isV6 && selectedAirBudget === 0n} style={{
                        width: "100%", padding: "13px", borderRadius: 12, border: "none",
                        background: isV6 && selectedAirBudget === 0n ? "rgba(245,158,11,0.3)" : "#F59E0B",
                        color: "#000", fontFamily: "'Inter', sans-serif",
                        fontSize: 14, fontWeight: 700,
                        cursor: isV6 && selectedAirBudget === 0n ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4,
                    }}>
                        <SendIcon size={15} /> Sign Voucher
                    </button>
                </>
            )}

            {step === STEP.signing && (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        border: "3px solid rgba(245,158,11,0.2)",
                        borderTopColor: "#F59E0B",
                        margin: "0 auto 16px",
                        animation: "spin 1s linear infinite",
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600 }}>Waiting for signature...</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 6 }}>Approve in MetaMask. No gas required.</p>
                </div>
            )}

            {step === STEP.done && qrValue && (
                <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>
                        <CheckCircle2Icon size={15} color="#4ade80" />
                        <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>Signature captured</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                        <div style={{ background: "#fff", padding: 16, borderRadius: 12, display: "inline-block" }}>
                            <QRCodeSVG id="qryptair-qr" value={qrValue} size={180} level="M" />
                        </div>

                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", textAlign: "center" }}>
                            {voucher?.tokenSymbol} {formatUnits(BigInt(voucher?.amount ?? "0"), selectedToken?.decimals ?? 18)} to {voucher?.recipient?.slice(0, 8)}...
                        </p>

                        <div style={{ display: "flex", gap: 8, width: "100%" }}>
                            <button onClick={downloadQr} style={{
                                flex: 1, padding: "10px", borderRadius: 10,
                                background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
                                color: "#F59E0B", fontSize: 12, fontWeight: 600, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                fontFamily: "'Inter', sans-serif",
                            }}>
                                <DownloadIcon size={13} /> Download SVG
                            </button>
                            <button onClick={copyJson} style={{
                                flex: 1, padding: "10px", borderRadius: 10,
                                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                fontFamily: "'Inter', sans-serif",
                            }}>
                                <CopyIcon size={13} /> Copy JSON
                            </button>
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.22)", width: "100%", boxSizing: "border-box" }}>
                            <AlertTriangleIcon size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
                                Never share your Transfer Code together with this QR code. Send them via separate channels.
                            </p>
                        </div>

                        <button onClick={() => { setStep(STEP.form); setQrValue(null); setAmount(""); setRecipient(""); setTransferCode(""); }} style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "rgba(255,255,255,0.3)", fontSize: 12,
                            fontFamily: "'Inter', sans-serif", textDecoration: "underline",
                        }}>
                            Create another voucher
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
