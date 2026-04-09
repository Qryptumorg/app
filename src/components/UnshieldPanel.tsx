import { useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { UnlockIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PERSONAL_VAULT_ABI, ERC20_ABI } from "@/lib/abi";
import { validatePasswordFormat } from "@/lib/password";
import { recordTransaction } from "@/lib/api";

interface UnshieldPanelProps {
    vaultAddress: `0x${string}`;
    walletAddress: string;
    chainId: number;
}

export default function UnshieldPanel({ vaultAddress, walletAddress, chainId }: UnshieldPanelProps) {
    const { toast } = useToast();
    const [tokenAddress, setTokenAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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

    const { data: shieldedBalance } = useReadContract({
        address: vaultAddress,
        abi: PERSONAL_VAULT_ABI,
        functionName: "getShieldedBalance",
        args: isValidToken ? [tokenAddress as `0x${string}`] : undefined,
        query: { enabled: isValidToken },
    });

    const decimals = tokenDecimals ?? 18;
    const parsedAmount = amount && !isNaN(parseFloat(amount)) ? parseUnits(amount, decimals) : 0n;
    const passwordValid = validatePasswordFormat(password);

    const { writeContract, data: txHash } = useWriteContract();
    const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    const handleUnshield = () => {
        if (!isValidToken || parsedAmount === 0n || !passwordValid) return;

        writeContract({
            address: vaultAddress,
            abi: PERSONAL_VAULT_ABI,
            functionName: "unshield",
            args: [tokenAddress as `0x${string}`, parsedAmount, password],
        }, {
            onSuccess: async (hash) => {
                toast({ title: "Unshield submitted", description: "Releasing tokens from your Qrypt-Safe..." });
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
            onError: (err) => toast({ title: "Unshield failed", description: err.message, variant: "destructive" }),
        });
    };

    if (isSuccess) {
        return (
            <div className="space-y-6">
                <SectionHeader icon={<UnlockIcon className="w-6 h-6 text-primary" />} title="Unshield Tokens" />
                <div className="glass rounded-2xl p-8 text-center">
                    <UnlockIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Tokens Released</h3>
                    <p className="text-muted-foreground mb-6">
                        {amount} {tokenSymbol} returned to your wallet.
                        Your q{tokenSymbol} has been burned.
                    </p>
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

            <div className="glass rounded-2xl p-6 space-y-5">
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
                            {passwordValid ? "Valid vault proof" : "Need 3 letters and 3 numbers"}
                        </p>
                    )}
                </div>

                <Button
                    className="w-full"
                    size="lg"
                    onClick={handleUnshield}
                    disabled={!isValidToken || parsedAmount === 0n || !passwordValid || isLoading}
                >
                    {isLoading ? "Unshielding..." : "Unshield Tokens"}
                </Button>
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
