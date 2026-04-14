import { useState, useCallback, useRef, useEffect } from "react";
import { parseUnits, formatUnits } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { EyeIcon, EyeOffIcon, Loader2Icon, ArrowUpIcon, RefreshCwIcon, CheckCircle2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { peekNextProof, consumeProofAtPosition } from "@/lib/password";
import { PERSONAL_VAULT_V6_ABI } from "@/lib/abi";
import { useTxStatus } from "@/lib/txStatusContext";
import { recordTransaction } from "@/lib/api";

interface Token {
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    decimals: number;
}

interface Props {
    token: Token;
    airBudget: bigint;
    shieldedBalance: bigint;
    walletAddress: string;
    vaultAddress: `0x${string}`;
    chainId: number;
    onClose: () => void;
}

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 12,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#d4d6e2", fontFamily: "'Inter', sans-serif", fontSize: 14,
    outline: "none", boxSizing: "border-box",
};

export default function MintAirBagsModal({ token, airBudget, shieldedBalance, walletAddress, vaultAddress, chainId, onClose }: Props) {
    const { toast } = useToast();
    const { pushTx } = useTxStatus();
    const [subMode, setSubMode] = useState<"fund" | "reclaim">("fund");
    const [fundAmount, setFundAmount] = useState("");
    const [vaultProof, setVaultProof] = useState("");
    const [showProof, setShowProof] = useState(false);
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
        if (!fundAmount) { toast({ title: "Enter an amount", variant: "destructive" }); return; }
        let parsed: bigint;
        try { parsed = parseUnits(fundAmount, token.decimals); } catch {
            toast({ title: "Invalid amount", variant: "destructive" }); return;
        }
        if (parsed === 0n || parsed > shieldedBalance) {
            toast({ title: "Amount exceeds shielded balance", variant: "destructive" }); return;
        }
        if (!vaultProof) { toast({ title: "Enter your vault proof", variant: "destructive" }); return; }
        let peeked: { proof: `0x${string}`; position: number };
        try { peeked = await peekNextProof(vaultProof, walletAddress); } catch (err: any) {
            toast({ title: "Chain error", description: err.message, variant: "destructive" }); return;
        }
        pendingPositionRef.current = peeked.position;
        fundAmountRef.current = fundAmount;
        writeFund({
            address: vaultAddress,
            abi: PERSONAL_VAULT_V6_ABI,
            functionName: "fundAirBags",
            args: [token.tokenAddress as `0x${string}`, parsed, peeked.proof],
        }, {
            onSuccess: (hash) => pushTx(hash, `Minting ${fundAmount} ${token.tokenSymbol} to air budget`),
        });
    }, [fundAmount, vaultProof, token, shieldedBalance, walletAddress, vaultAddress, writeFund, toast, pushTx]);

    const handleReclaim = useCallback(async () => {
        if (airBudget === 0n) { toast({ title: "Air budget is empty", variant: "destructive" }); return; }
        if (!vaultProof) { toast({ title: "Enter your vault proof", variant: "destructive" }); return; }
        let peeked: { proof: `0x${string}`; position: number };
        try { peeked = await peekNextProof(vaultProof, walletAddress); } catch (err: any) {
            toast({ title: "Chain error", description: err.message, variant: "destructive" }); return;
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

    const isSuccess = fundSuccess || reclaimSuccess;
    if (isSuccess && pendingPositionRef.current !== null) {
        consumeProofAtPosition(walletAddress, pendingPositionRef.current);
        pendingPositionRef.current = null;
    }

    const isPending = isFundPending || isReclaimPending || fundConfirming || reclaimConfirming;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 10000,
                background: "rgba(0,0,0,0.72)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 16px",
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: "100%", maxWidth: 480,
                    background: "#111116",
                    borderRadius: 20,
                    padding: "24px",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
                    fontFamily: "'Inter', sans-serif",
                    display: "flex", flexDirection: "column", gap: 20,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>QryptAir</span>
                    <button
                        onClick={onClose}
                        style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: "rgba(255,255,255,0.08)", border: "none",
                            cursor: "pointer", color: "rgba(255,255,255,0.6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 14, fontWeight: 600,
                        }}
                    >X</button>
                </div>

                {isSuccess ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 0" }}>
                        <CheckCircle2Icon size={40} color="#4ade80" />
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#4ade80", margin: 0 }}>
                            {fundSuccess ? "Minted successfully" : "Reclaimed successfully"}
                        </p>
                        <button onClick={onClose} style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'Inter', sans-serif",
                            textDecoration: "underline", marginTop: 4,
                        }}>Done</button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: "flex", gap: 8 }}>
                            {(["fund", "reclaim"] as const).map(m => (
                                <button key={m} onClick={() => setSubMode(m)} style={{
                                    flex: 1, padding: "11px 8px", borderRadius: 12, border: "1px solid",
                                    borderColor: subMode === m ? "rgba(245,158,11,0.6)" : "rgba(255,255,255,0.09)",
                                    background: subMode === m ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                                    color: subMode === m ? "#F59E0B" : "rgba(255,255,255,0.45)",
                                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                                    fontFamily: "'Inter', sans-serif",
                                }}>{m === "fund" ? "Mint Air Bags" : "Reclaim"}</button>
                            ))}
                        </div>

                        {subMode === "fund" && (
                            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                                Burn your q{token.tokenSymbol} to mint a{token.tokenSymbol} Air Bags. Use them to send tokens offline via QryptAir without a wallet.
                            </p>
                        )}
                        {subMode === "reclaim" && (
                            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                                Return unused Air Bags back to your shielded balance.
                            </p>
                        )}

                        <div style={{
                            padding: "14px 16px", borderRadius: 12,
                            background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)",
                            display: "flex", flexDirection: "column", gap: 8,
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Current Air Bags</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B", fontFamily: "monospace" }}>
                                    {formatUnits(airBudget, token.decimals)} {token.tokenSymbol}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Shielded Balance</span>
                                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>
                                    {formatUnits(shieldedBalance, token.decimals)} {token.tokenSymbol}
                                </span>
                            </div>
                        </div>

                        {subMode === "fund" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}>
                                    Amount to Mint
                                </label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        style={inputStyle} type="number" placeholder="0.00"
                                        value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                                    />
                                    <button
                                        onClick={() => setFundAmount(formatUnits(shieldedBalance, token.decimals))}
                                        style={{
                                            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                                            background: "none", border: "none", cursor: "pointer",
                                            fontSize: 11, fontWeight: 800, color: "#F59E0B", letterSpacing: "0.06em",
                                        }}
                                    >MAX</button>
                                </div>
                                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                                    Burns your q{token.tokenSymbol} to mint a{token.tokenSymbol} Air Bags
                                </p>
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}>
                                Vault Proof
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    style={inputStyle}
                                    type={showProof ? "text" : "password"}
                                    placeholder="6-character vault proof"
                                    autoComplete="off"
                                    value={vaultProof}
                                    onChange={e => setVaultProof(e.target.value)}
                                />
                                <button onClick={() => setShowProof(v => !v)} style={{
                                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)",
                                    display: "flex", alignItems: "center",
                                }}>
                                    {showProof ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={subMode === "fund" ? handleFund : handleReclaim}
                            disabled={isPending}
                            style={{
                                width: "100%", padding: "14px",
                                borderRadius: 12, border: "none",
                                background: isPending ? "rgba(245,158,11,0.4)" : "#F59E0B",
                                color: "#000", fontFamily: "'Inter', sans-serif",
                                fontSize: 15, fontWeight: 700,
                                cursor: isPending ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                marginTop: 4,
                            }}
                        >
                            {isPending ? (
                                <><Loader2Icon size={16} style={{ animation: "spin 1s linear infinite" }} /> Processing...</>
                            ) : subMode === "fund" ? (
                                <><ArrowUpIcon size={16} /> Mint</>
                            ) : (
                                <><RefreshCwIcon size={16} /> Reclaim Air Bags</>
                            )}
                        </button>

                        <button onClick={onClose} style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "rgba(255,255,255,0.35)", fontSize: 13,
                            fontFamily: "'Inter', sans-serif", textDecoration: "underline",
                        }}>Cancel</button>
                    </>
                )}
            </div>
        </div>
    );
}
