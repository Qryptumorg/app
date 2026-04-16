import { useState, useEffect, useRef } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { UnlockIcon, EyeIcon, EyeOffIcon, Loader2Icon, AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PERSONAL_VAULT_ABI, getVaultABI, ERC20_ABI } from "@/lib/abi";
import { validatePasswordFormat, hashPassword, peekNextProof, consumeProofAtPosition, getChainPosition } from "@/lib/password";
import type { VaultVersion } from "@/hooks/useVault";
import { recordTransaction } from "@/lib/api";
import { getTxEtherscanUrl } from "@/lib/utils";
import { useTxStatus } from "@/lib/txStatusContext";

interface UnshieldPanelProps {
    vaultAddress: `0x${string}`;
    walletAddress: string;
    chainId: number;
    vaultVersion?: VaultVersion;
    initialTokenAddress?: string;
    onComplete?: () => void;
}

export default function UnshieldPanel({ vaultAddress, walletAddress, chainId, vaultVersion = "v6", initialTokenAddress, onComplete }: UnshieldPanelProps) {
    const [tokenAddress, setTokenAddress] = useState(initialTokenAddress ?? "");
    const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
    const [amount, setAmount] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [deriving, setDeriving] = useState(false);
    const { pushTx } = useTxStatus();
    const publicClient = usePublicClient();

    const isV6 = vaultVersion === "v6";

    useEffect(() => {
        if (initialTokenAddress) setTokenAddress(initialTokenAddress);
    }, [initialTokenAddress]);

    const isValidToken = tokenAddress.startsWith("0x") && tokenAddress.length === 42;

    const { data: tokenSymbol } = useReadContract({
        address: isValidToken ? tokenAddress as `0x${string}` : undefined,
        abi: ERC20_ABI,
        functionName: "symbol",
        query: { enabled: isValidToken },
    });

    const { data: tokenName } = useReadContract({
        address: isValidToken ? tokenAddress as `0x${string}` : undefined,
        abi: ERC20_ABI,
        functionName: "name",
        query: { enabled: isValidToken },
    });

    const { data: tokenDecimals } = useReadContract({
        address: isValidToken ? tokenAddress as `0x${string}` : undefined,
        abi: ERC20_ABI,
        functionName: "decimals",
        query: { enabled: isValidToken },
    });

    const vaultAbi = isV6 ? getVaultABI(chainId) : PERSONAL_VAULT_ABI;

    const { data: shieldedBalance } = useReadContract({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: (isV6 ? "getQryptedBalance" : "getShieldedBalance") as "getQryptedBalance",
        args: isValidToken ? [tokenAddress as `0x${string}`] : undefined,
        query: { enabled: isValidToken },
    });

    const decimals = tokenDecimals ?? 18;
    const parsedAmount = amount && !isNaN(parseFloat(amount)) ? parseUnits(amount, decimals) : 0n;
    const passwordValid = validatePasswordFormat(password);

    const { writeContract, data: txHash, isPending: isWritePending } = useWriteContract();
    const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
    const isTxLoading = isWritePending || isWaiting;

    const unshieldPosRef = useRef<number | null>(null);

    // V6 chain state
    const chainPos = isV6 ? getChainPosition(walletAddress) : 99;
    const chainExhausted = isV6 && chainPos === 0;
    const chainUnknown = isV6 && chainPos === null;

    useEffect(() => {
        if (isSuccess) {
            if (unshieldPosRef.current !== null) {
                consumeProofAtPosition(walletAddress, unshieldPosRef.current);
                unshieldPosRef.current = null;
            }
            onComplete?.();
        }
    }, [isSuccess, walletAddress]);

    const handleUnshield = async () => {
        if (!isValidToken || parsedAmount === 0n || !passwordValid || isTxLoading || deriving) return;

        if (isV6) {
            setDeriving(true);
            try {
                const { proof, position } = await peekNextProof(password, walletAddress,
                    publicClient ? { vaultAddress, publicClient } : undefined
                );
                setDeriving(false);
                writeContract({
                    address: vaultAddress,
                    abi: getVaultABI(chainId),
                    functionName: chainId === 1 ? "unQrypt" : "unqrypt",
                    args: [tokenAddress as `0x${string}`, parsedAmount, proof],
                }, {
                    onSuccess: async (hash) => {
                        unshieldPosRef.current = position;
                        pushTx(hash, `Unshielding ${amount} ${tokenSymbol || "tokens"}`);
                        setSubmittedTxHash(hash);
                        try {
                            await recordTransaction({
                                walletAddress,
                                txHash: hash,
                                type: "unshield",
                                tokenAddress,
                                tokenSymbol: tokenSymbol || "???",
                                tokenName: tokenName || "Unknown Token",
                                amount,
                                fromAddress: walletAddress,
                                networkId: chainId,
                            });
                        } catch {}
                    },
                    onError: () => {
                        setDeriving(false);
                    },
                });
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Unknown error";
                alert(message);
                setDeriving(false);
            }
        } else {
            writeContract({
                address: vaultAddress,
                abi: PERSONAL_VAULT_ABI,
                functionName: "unshield",
                args: [tokenAddress as `0x${string}`, parsedAmount, hashPassword(password)],
            }, {
                onSuccess: async (hash) => {
                    pushTx(hash, `Unshielding ${amount} ${tokenSymbol || "tokens"}`);
                    setSubmittedTxHash(hash);
                    try {
                        await recordTransaction({
                            walletAddress,
                            txHash: hash,
                            type: "unshield",
                            tokenAddress,
                            tokenSymbol: tokenSymbol || "???",
                            tokenName: tokenName || "Unknown Token",
                            amount,
                            fromAddress: walletAddress,
                            networkId: chainId,
                        });
                    } catch {}
                },
            });
        }
    };

    if (isSuccess) {
        return (
            <div className="space-y-6">
                <SectionHeader icon={<UnlockIcon className="w-6 h-6 text-primary" />} title="Unshield Tokens" />
                <div className="glass rounded-2xl p-8 text-center">
                    <UnlockIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Tokens Released</h3>
                    <p className="text-muted-foreground mb-4">
                        {amount} {tokenSymbol} returned to your wallet.
                        Your q{tokenSymbol} has been burned.
                    </p>
                    {txHash && (
                        <a href={getTxEtherscanUrl(txHash, chainId)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:underline mb-6">
                            View on Etherscan ↗
                        </a>
                    )}
                    <div className="mb-6" />
                    <Button onClick={() => { setAmount(""); setPassword(""); }}>
                        Unshield More
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SectionHeader icon={<UnlockIcon className="w-6 h-6 text-primary" />} title="Unshield Tokens" />
            <p className="text-muted-foreground text-sm">
                Release tokens from your Qrypt-Safe back to your wallet. Your q{tokenSymbol || "TOKEN"} will be burned.
            </p>

            {chainExhausted && (
                <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
                    <AlertTriangleIcon size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: "#fbbf24", margin: 0, lineHeight: 1.5 }}>
                        OTP chain exhausted. You need to recharge your vault proof chain before unshielding.
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
                        {tokenSymbol && <p className="text-green-400 text-xs">{tokenSymbol} detected</p>}
                    </div>
                ) : tokenSymbol ? (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", fontSize: 13, color: "#f87171", fontWeight: 600 }}>
                        q{tokenSymbol}
                    </div>
                ) : null}

                {shieldedBalance !== undefined && (
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                            Shielded balance: {formatUnits(shieldedBalance, decimals)} q{tokenSymbol}
                        </p>
                        <button
                            className="text-xs text-primary hover:underline"
                            onClick={() => setAmount(formatUnits(shieldedBalance, decimals))}
                        >
                            Max
                        </button>
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="text-foreground font-medium">Amount</Label>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
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
                            {passwordValid ? "Valid vault proof" : "Need 3 letters and 3 numbers"}
                        </p>
                    )}
                </div>

                <Button
                    className="w-full"
                    size="lg"
                    onClick={handleUnshield}
                    disabled={!isValidToken || parsedAmount === 0n || !passwordValid || isTxLoading || deriving || chainExhausted || chainUnknown}
                    style={{ pointerEvents: (isTxLoading || deriving) ? "none" : undefined }}
                >
                    {deriving ? (
                        <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Deriving proof...</>
                    ) : isTxLoading ? (
                        <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" />{isWritePending ? "Confirm in wallet..." : "Unshielding..."}</>
                    ) : "Unshield Tokens"}
                </Button>

                {submittedTxHash && (
                    <div style={{ textAlign: "center", marginTop: 10 }}>
                        <a href={getTxEtherscanUrl(submittedTxHash, chainId)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#60a5fa" }}>
                            View transaction on explorer ↗
                        </a>
                    </div>
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
