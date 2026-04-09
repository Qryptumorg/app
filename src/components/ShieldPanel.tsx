import { useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ShieldIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PERSONAL_VAULT_ABI, ERC20_ABI } from "@/lib/abi";
import { validatePasswordFormat } from "@/lib/password";
import { recordTransaction } from "@/lib/api";

interface ShieldPanelProps {
    vaultAddress: `0x${string}`;
    walletAddress: string;
    chainId: number;
}

export default function ShieldPanel({ vaultAddress, walletAddress, chainId }: ShieldPanelProps) {
    const { toast } = useToast();
    const [tokenAddress, setTokenAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [_step, setStep] = useState<"input" | "approve" | "shield">("input");

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

    const { data: allowance } = useReadContract({
        address: isValidToken ? tokenAddress as `0x${string}` : undefined,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [walletAddress as `0x${string}`, vaultAddress],
        query: { enabled: isValidToken },
    });

    const { writeContract: writeApprove, data: approveTxHash } = useWriteContract();
    const { isSuccess: approveSuccess, isLoading: approveLoading } = useWaitForTransactionReceipt({ hash: approveTxHash });

    const { writeContract: writeShield, data: shieldTxHash } = useWriteContract();
    const { isSuccess: shieldSuccess, isLoading: shieldLoading } = useWaitForTransactionReceipt({ hash: shieldTxHash });

    const decimals = tokenDecimals ?? 18;
    const parsedAmount = amount && !isNaN(parseFloat(amount)) ? parseUnits(amount, decimals) : 0n;
    const hasEnoughAllowance = allowance !== undefined && parsedAmount > 0n && allowance >= parsedAmount;
    const passwordValid = validatePasswordFormat(password);

    const canProceed = isValidToken && parsedAmount > 0n && passwordValid;

    const handleApprove = () => {
        if (!isValidToken || parsedAmount === 0n) return;
        writeApprove({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [vaultAddress, parsedAmount],
        }, {
            onSuccess: () => {
                toast({ title: "Approval submitted", description: "Waiting for confirmation..." });
                setStep("approve");
            },
            onError: (err) => toast({ title: "Approval failed", description: err.message, variant: "destructive" }),
        });
    };

    const handleShield = () => {
        if (!canProceed) return;
        writeShield({
            address: vaultAddress,
            abi: PERSONAL_VAULT_ABI,
            functionName: "shield",
            args: [tokenAddress as `0x${string}`, parsedAmount, password],
        }, {
            onSuccess: async (hash) => {
                toast({ title: "Shield submitted", description: "Shielding tokens into your Qrypt-Safe..." });
                setStep("shield");
                try {
                    await recordTransaction({
                        walletAddress,
                        txHash: hash,
                        type: "shield",
                        tokenAddress,
                        tokenSymbol: tokenSymbol || "???",
                        tokenName: tokenName || "Unknown Token",
                        amount: amount,
                        fromAddress: walletAddress,
                        networkId: chainId,
                    });
                } catch {}
            },
            onError: (err) => toast({ title: "Shield failed", description: err.message, variant: "destructive" }),
        });
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
                    <p className="text-muted-foreground text-sm mb-6">
                        You now hold q{tokenSymbol} in your MetaMask wallet.
                    </p>
                    <Button onClick={() => { setAmount(""); setPassword(""); setStep("input"); }}>
                        Shield More Tokens
                    </Button>
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

            <div className="glass rounded-2xl p-6 space-y-5">
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
                            className="pr-10 font-mono tracking-widest text-center text-lg"
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
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleApprove}
                        disabled={!canProceed || approveLoading}
                    >
                        {approveLoading ? "Approving..." : "Approve Token"}
                    </Button>
                ) : (
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleShield}
                        disabled={!canProceed || shieldLoading}
                    >
                        {shieldLoading ? "Shielding..." : "Shield Tokens"}
                    </Button>
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
