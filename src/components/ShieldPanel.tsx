import { useState, useEffect, useRef } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ShieldIcon, EyeIcon, EyeOffIcon, Loader2Icon, AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PERSONAL_VAULT_ABI, getVaultABI, ERC20_ABI } from "@/lib/abi";
import { validatePasswordFormat, hashPassword, peekNextProof, consumeProofAtPosition, getChainPosition } from "@/lib/password";
import type { VaultVersion } from "@/hooks/useVault";
import { recordTransaction } from "@/lib/api";
import { getTxEtherscanUrl } from "@/lib/utils";
import { useTxStatus } from "@/lib/txStatusContext";

interface ShieldPanelProps {
    vaultAddress: `0x${string}`;
    walletAddress: string;
    chainId: number;
    vaultVersion?: VaultVersion;
    onShieldSuccess?: () => void;
    initialTokenAddress?: string;
}

export default function ShieldPanel({ vaultAddress, walletAddress, chainId, vaultVersion = "v6", onShieldSuccess, initialTokenAddress }: ShieldPanelProps) {
    const [tokenAddress, setTokenAddress] = useState(initialTokenAddress ?? "");
    const [amount, setAmount] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [deriving, setDeriving] = useState(false);
    const [_step, setStep] = useState<"input" | "approve" | "shield">("input");
    const { pushTx } = useTxStatus();
    const publicClient = usePublicClient({ chainId });

    const isV6 = vaultVersion === "v6";
    const isValidToken = tokenAddress.startsWith("0x") && tokenAddress.length === 42;

    const { data: tokenName } = useReadContract({
        address: isValidToken ? tokenAddress as `0x${string}` : undefined,
        abi: ERC20_ABI,
        functionName: "name",
        query: { enabled: isValidToken },
    });

    const { data: tokenSymbol } = useReadContract({
        address: isValidToken ? tokenAddress as `0x${string}` : undefined,
        abi: ERC20_ABI,
        functionName: "symbol",
        query: { enabled: isValidToken },
    });

    const { data: tokenDecimals } = useReadContract({
        address: isValidToken ? tokenAddress as `0x${string}` : undefined,
        abi: ERC20_ABI,
        functionName: "decimals",
        query: { enabled: isValidToken },
    });

    const { data: walletBalance } = useReadContract({
        address: isValidToken ? tokenAddress as `0x${string}` : undefined,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [walletAddress as `0x${string}`],
        query: { enabled: isValidToken },
    });

    const vaultAbi = isV6 ? getVaultABI(chainId) : PERSONAL_VAULT_ABI;

    const { data: existingShieldedBalance } = useReadContract({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: (isV6 ? "getQryptedBalance" : "getShieldedBalance") as "getQryptedBalance",
        args: isValidToken ? [tokenAddress as `0x${string}`] : undefined,
        query: { enabled: isValidToken },
    });

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: isValidToken ? tokenAddress as `0x${string}` : undefined,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [walletAddress as `0x${string}`, vaultAddress],
        query: {
            enabled: isValidToken,
            refetchInterval: (query) => {
                const data = query.state.data as bigint | undefined;
                const dec = tokenDecimals ?? 18;
                const needed = amount && !isNaN(parseFloat(amount)) ? parseUnits(amount, dec) : 0n;
                return data !== undefined && needed > 0n && data >= needed ? false : 2_000;
            },
        },
    });

    const [approveErr, setApproveErr] = useState<string | null>(null);
    const [shieldErr, setShieldErr] = useState<string | null>(null);

    const { writeContract: writeApprove, data: approveTxHash, isPending: isPendingApprove } = useWriteContract();
    const { isSuccess: approveSuccess, isLoading: approveLoading, isError: approveReverted, error: approveRevertErr } = useWaitForTransactionReceipt({
        hash: approveTxHash,
        pollingInterval: 1500,
    });

    const { writeContract: writeShield, data: shieldTxHash, isPending: isPendingShield } = useWriteContract();
    const { isSuccess: shieldSuccess, isLoading: shieldLoading, isError: shieldReverted, error: shieldRevertErr } = useWaitForTransactionReceipt({
        hash: shieldTxHash,
        pollingInterval: 1500,
    });

    useEffect(() => {
        if (approveReverted && approveRevertErr) {
            setApproveErr(approveRevertErr.message ?? "Approval transaction reverted on-chain.");
        }
    }, [approveReverted, approveRevertErr]);

    useEffect(() => {
        if (shieldReverted && shieldRevertErr) {
            setShieldErr(shieldRevertErr.message ?? "Shield transaction reverted on-chain.");
        }
    }, [shieldReverted, shieldRevertErr]);

    const shieldPosRef = useRef<number | null>(null);

    useEffect(() => {
        if (initialTokenAddress !== undefined) setTokenAddress(initialTokenAddress);
    }, [initialTokenAddress]);

    useEffect(() => {
        if (approveSuccess) refetchAllowance();
    }, [approveSuccess, refetchAllowance]);

    useEffect(() => {
        if (shieldSuccess) {
            if (shieldPosRef.current !== null) {
                consumeProofAtPosition(walletAddress, shieldPosRef.current);
                shieldPosRef.current = null;
            }
            refetchAllowance();
            onShieldSuccess?.();
        }
    }, [shieldSuccess, onShieldSuccess, walletAddress, refetchAllowance]);

    const decimals = tokenDecimals ?? 18;
    const parsedAmount = amount && !isNaN(parseFloat(amount)) ? parseUnits(amount, decimals) : 0n;
    const hasEnoughAllowance = allowance !== undefined && parsedAmount > 0n && allowance >= parsedAmount;
    const passwordValid = validatePasswordFormat(password);
    const canProceed = isValidToken && parsedAmount > 0n && passwordValid;

    // V6 chain state check
    const chainPos = isV6 ? getChainPosition(walletAddress) : 99;
    const chainExhausted = isV6 && chainPos === 0;
    const chainUnknown = isV6 && chainPos === null;

    const handleApprove = () => {
        if (!isValidToken || parsedAmount === 0n) return;
        setApproveErr(null);
        setShieldErr(null);
        writeApprove({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [vaultAddress, parsedAmount],
        }, {
            onSuccess: (hash) => {
                pushTx(hash, `Approving ${tokenSymbol || "token"}`);
                setStep("approve");
            },
            onError: (err) => {
                const msg = err?.message ?? "Wallet rejected the approval.";
                if (!msg.includes("User rejected") && !msg.includes("user rejected")) {
                    setApproveErr(msg);
                }
            },
        });
    };

    const handleShield = async () => {
        if (!canProceed || deriving) return;
        setShieldErr(null);
        setApproveErr(null);

        if (isV6) {
            setDeriving(true);
            try {
                const { proof, position } = await peekNextProof(password, walletAddress,
                    publicClient ? { vaultAddress, publicClient } : undefined
                );
                setDeriving(false);
                writeShield({
                    address: vaultAddress,
                    abi: getVaultABI(chainId),
                    functionName: chainId === 1 ? "Qrypt" : "qrypt",
                    args: [tokenAddress as `0x${string}`, parsedAmount, proof],
                }, {
                    onSuccess: async (hash) => {
                        shieldPosRef.current = position;
                        pushTx(hash, `Shielding ${amount} ${tokenSymbol || "tokens"}`);
                        setStep("shield");
                        try {
                            await recordTransaction({
                                walletAddress,
                                txHash: hash,
                                type: "shield",
                                tokenAddress,
                                tokenSymbol: tokenSymbol || "???",
                                tokenName: tokenName || "Unknown Token",
                                amount,
                                fromAddress: walletAddress,
                                networkId: chainId,
                            });
                        } catch {}
                    },
                    onError: (err) => {
                        setDeriving(false);
                        const msg = err?.message ?? "Wallet rejected the transaction.";
                        if (!msg.includes("User rejected") && !msg.includes("user rejected")) {
                            setShieldErr(msg);
                        }
                    },
                });
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Unknown error";
                setShieldErr(message);
                setDeriving(false);
            }
        } else {
            writeShield({
                address: vaultAddress,
                abi: PERSONAL_VAULT_ABI,
                functionName: "shield",
                args: [tokenAddress as `0x${string}`, parsedAmount, hashPassword(password)],
            }, {
                onSuccess: async (hash) => {
                    pushTx(hash, `Shielding ${amount} ${tokenSymbol || "tokens"}`);
                    setStep("shield");
                    try {
                        await recordTransaction({
                            walletAddress,
                            txHash: hash,
                            type: "shield",
                            tokenAddress,
                            tokenSymbol: tokenSymbol || "???",
                            tokenName: tokenName || "Unknown Token",
                            amount,
                            fromAddress: walletAddress,
                            networkId: chainId,
                        });
                    } catch {}
                },
                onError: (err) => {
                    const msg = err?.message ?? "Wallet rejected the transaction.";
                    if (!msg.includes("User rejected") && !msg.includes("user rejected")) {
                        setShieldErr(msg);
                    }
                },
            });
        }
    };

    if (shieldSuccess) {
        return (
            <div className="space-y-6">
                <SectionHeader icon={<ShieldIcon className="w-6 h-6 text-primary" />} title="Shield Tokens" />
                <div className="glass rounded-2xl p-8 text-center">
                    <ShieldIcon className="w-16 h-16 text-green-400 mx-auto mb-4 shield-glow" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Tokens Shielded</h3>
                    <p className="text-muted-foreground mb-2">
                        {amount} {tokenSymbol} shielded in your Qrypt-Safe.
                    </p>
                    <p className="text-muted-foreground text-sm mb-4">
                        You now hold q{tokenSymbol} in your MetaMask wallet.
                    </p>
                    <Button onClick={() => { setAmount(""); setPassword(""); setStep("input"); }} className="mb-4">
                        Shield More Tokens
                    </Button>
                    {shieldTxHash && (
                        <div>
                            <a href={getTxEtherscanUrl(shieldTxHash, chainId)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:underline">
                                View on explorer ↗
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SectionHeader icon={<ShieldIcon className="w-6 h-6 text-primary" />} title="Shield Tokens" />
            <p className="text-muted-foreground text-sm">
                Shield ERC-20 tokens into your Qrypt-Safe. You will receive q{tokenSymbol || "TOKEN"} in your MetaMask wallet.
            </p>

            {chainExhausted && (
                <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
                    <AlertTriangleIcon size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: "#fbbf24", margin: 0, lineHeight: 1.5 }}>
                        OTP chain exhausted. You need to recharge your vault proof chain before shielding more tokens.
                    </p>
                </div>
            )}

            {chainUnknown && (
                <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <AlertTriangleIcon size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: "#f87171", margin: 0, lineHeight: 1.5 }}>
                        OTP chain not initialized on this device. Please sync your chain state using the OTP Chain icon in the header.
                    </p>
                </div>
            )}

            <div className="glass rounded-2xl p-6 space-y-5">
                {!initialTokenAddress ? (
                    <div className="space-y-2">
                        <Label className="text-foreground font-medium">Token Contract Address</Label>
                        <Input
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            placeholder="0x..."
                            className="font-mono text-sm"
                        />
                        {tokenName && tokenSymbol && (
                            <p className="text-green-400 text-xs">{tokenName} ({tokenSymbol}) detected</p>
                        )}
                    </div>
                ) : tokenName && tokenSymbol ? (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 13, color: "#4ade80", fontWeight: 600 }}>
                        {tokenName} ({tokenSymbol})
                    </div>
                ) : null}

                {existingShieldedBalance !== undefined && existingShieldedBalance > 0n && tokenSymbol && (
                    <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", fontSize: 12, color: "#fbbf24", lineHeight: 1.5 }}>
                        Your vault already has q{tokenSymbol} shielded. Shielding more will add to your existing position.
                    </div>
                )}

                {walletBalance !== undefined && decimals !== undefined && (
                    <p className="text-xs text-muted-foreground">
                        Wallet balance: {formatUnits(walletBalance, decimals)} {tokenSymbol}
                    </p>
                )}

                <div className="space-y-2">
                    <Label className="text-foreground font-medium">Amount</Label>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        min="0"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-foreground font-medium">Vault Proof</Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your vault proof (e.g. abc123)"
                            maxLength={6}
                            autoComplete="new-password"
                            className="pr-10 font-mono tracking-widest text-center text-lg"
                            disabled={deriving}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                    </div>
                    {password.length > 0 && (
                        <p className={`text-xs ${passwordValid ? "text-green-400" : "text-yellow-400"}`}>
                            {validatePasswordFormat(password) ? "Valid vault proof" : "Need 3 letters and 3 numbers"}
                        </p>
                    )}
                </div>

                {!hasEnoughAllowance ? (
                    <>
                        <Button className="w-full" size="lg" onClick={handleApprove}
                            disabled={!canProceed || isPendingApprove || approveLoading || chainExhausted || chainUnknown}
                            style={{ pointerEvents: (isPendingApprove || approveLoading) ? "none" : undefined }}
                        >
                            {isPendingApprove ? (
                                <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Confirm in wallet...</>
                            ) : approveLoading ? (
                                <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Approving...</>
                            ) : "Approve Token"}
                        </Button>
                        {approveErr && (
                            <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
                                <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#f87171" }}>Approval failed</p>
                                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, wordBreak: "break-word" }}>{approveErr}</p>
                            </div>
                        )}
                        {approveTxHash && (
                            <div style={{ textAlign: "center", marginTop: 8 }}>
                                <a href={getTxEtherscanUrl(approveTxHash, chainId)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#60a5fa" }}>
                                    View approval on explorer ↗
                                </a>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleShield}
                            disabled={!canProceed || isPendingShield || shieldLoading || deriving || chainExhausted || chainUnknown}
                            style={{ pointerEvents: (isPendingShield || shieldLoading || deriving) ? "none" : undefined }}
                        >
                            {deriving ? (
                                <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Deriving proof...</>
                            ) : isPendingShield ? (
                                <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Confirm in wallet...</>
                            ) : shieldLoading ? (
                                <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Shielding...</>
                            ) : shieldReverted ? "Retry Shield" : "Shield Tokens"}
                        </Button>
                        {shieldErr && (
                            <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
                                <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#f87171" }}>Shield failed</p>
                                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, wordBreak: "break-word" }}>{shieldErr}</p>
                            </div>
                        )}
                        {shieldTxHash && (
                            <div style={{ textAlign: "center", marginTop: 8 }}>
                                <a href={getTxEtherscanUrl(shieldTxHash, chainId)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#60a5fa" }}>
                                    View shield on explorer ↗
                                </a>
                            </div>
                        )}
                    </>
                )}

                {approveSuccess && !hasEnoughAllowance && (
                    <p className="text-xs text-green-400 text-center">Approval confirmed. Now click Shield Tokens.</p>
                )}

            </div>
        </div>
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
    );
}
