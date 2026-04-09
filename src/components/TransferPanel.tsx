import { useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { SendIcon, EyeIcon, EyeOffIcon, ShieldIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PERSONAL_VAULT_ABI, ERC20_ABI, SHIELD_FACTORY_ABI } from "@/lib/abi";
import { SHIELD_FACTORY_ADDRESSES } from "@/lib/wagmi";
import { validatePasswordFormat, buildCommitHash } from "@/lib/password";
import { recordTransaction } from "@/lib/api";

interface TransferPanelProps {
    vaultAddress: `0x${string}`;
    walletAddress: string;
    chainId: number;
}

export default function TransferPanel({ vaultAddress, walletAddress, chainId }: TransferPanelProps) {
    const { toast } = useToast();
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [transferStep, setTransferStep] = useState<"input" | "commit" | "reveal" | "done">("input");
    const [nonce] = useState(() => BigInt(Math.floor(Math.random() * 1e15)));
    const [isProcessing, setIsProcessing] = useState(false);

    const isValidToken = tokenAddress.startsWith("0x") && tokenAddress.length === 42;
    const isValidRecipient = recipientAddress.startsWith("0x") && recipientAddress.length === 42;
    const factoryAddress = SHIELD_FACTORY_ADDRESSES[chainId] as `0x${string}`;

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

    const { data: recipientHasVault } = useReadContract({
        address: factoryAddress,
        abi: SHIELD_FACTORY_ABI,
        functionName: "hasVault",
        args: isValidRecipient ? [recipientAddress as `0x${string}`] : undefined,
        query: { enabled: isValidRecipient && !!factoryAddress },
    });

    const decimals = tokenDecimals ?? 18;
    const parsedAmount = amount && !isNaN(parseFloat(amount)) ? parseUnits(amount, decimals) : 0n;
    const passwordValid = validatePasswordFormat(password);
    const canTransfer = isValidToken && isValidRecipient && parsedAmount > 0n && passwordValid;

    const { writeContract: writeCommit, data: commitTxHash } = useWriteContract();
    const { isSuccess: commitSuccess } = useWaitForTransactionReceipt({ hash: commitTxHash });

    const { writeContract: writeReveal, data: revealTxHash } = useWriteContract();
    const { isSuccess: revealSuccess } = useWaitForTransactionReceipt({ hash: revealTxHash });

    const handleCommit = async () => {
        if (!canTransfer) return;
        setIsProcessing(true);

        const commitHash = buildCommitHash(password, nonce, tokenAddress, recipientAddress, parsedAmount);

        writeCommit({
            address: vaultAddress,
            abi: PERSONAL_VAULT_ABI,
            functionName: "commitTransfer",
            args: [commitHash],
        }, {
            onSuccess: () => {
                toast({ title: "Commit submitted", description: "Waiting for block confirmation..." });
                setTransferStep("commit");
                setIsProcessing(false);
            },
            onError: (err) => {
                toast({ title: "Commit failed", description: err.message, variant: "destructive" });
                setIsProcessing(false);
            },
        });
    };

    const handleReveal = async () => {
        if (!canTransfer) return;
        setIsProcessing(true);

        writeReveal({
            address: vaultAddress,
            abi: PERSONAL_VAULT_ABI,
            functionName: "revealTransfer",
            args: [
                tokenAddress as `0x${string}`,
                recipientAddress as `0x${string}`,
                parsedAmount,
                password,
                nonce,
            ],
        }, {
            onSuccess: async (hash) => {
                toast({ title: "Transfer submitted", description: "Sending tokens..." });
                setTransferStep("reveal");
                setIsProcessing(false);
                try {
                    await recordTransaction({
                        walletAddress,
                        txHash: hash,
                        type: "transfer",
                        tokenAddress,
                        tokenSymbol: tokenSymbol || "???",
                        tokenName: tokenName || "Unknown Token",
                        amount,
                        fromAddress: walletAddress,
                        toAddress: recipientAddress,
                        networkId: chainId,
                    });
                } catch {}
            },
            onError: (err) => {
                toast({ title: "Reveal failed", description: err.message, variant: "destructive" });
                setIsProcessing(false);
            },
        });
    };

    if (revealSuccess) {
        return (
            <div className="space-y-6">
                <SectionHeader icon={<SendIcon className="w-6 h-6 text-primary" />} title="Transfer" />
                <div className="glass rounded-2xl p-8 text-center">
                    <SendIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Transfer Complete</h3>
                    <p className="text-muted-foreground mb-2">
                        {amount} {tokenSymbol} sent to {recipientAddress.slice(0, 8)}...
                    </p>
                    <p className="text-muted-foreground text-sm mb-6">
                        Recipient received {tokenSymbol}. Your shielded balance has been reduced.
                    </p>
                    <Button onClick={() => { setAmount(""); setPassword(""); setTransferStep("input"); }}>
                        New Transfer
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SectionHeader icon={<SendIcon className="w-6 h-6 text-primary" />} title="Transfer" />
            <p className="text-muted-foreground text-sm">
                Transfer shielded tokens securely using the commit-reveal scheme.
                Your vault proof is never exposed on-chain.
            </p>

            {transferStep === "commit" && commitSuccess && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-sm text-primary">
                    Commit confirmed. Now click Reveal Transfer to complete the send.
                </div>
            )}

            <div className="glass rounded-2xl p-6 space-y-5">
                <div className="space-y-2">
                    <Label className="text-foreground font-medium">Token Contract Address</Label>
                    <Input
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                        placeholder="0x..."
                        className="font-mono text-sm"
                        disabled={transferStep !== "input"}
                    />
                    {tokenSymbol && <p className="text-green-400 text-xs">{tokenSymbol} detected</p>}
                </div>

                {shieldedBalance !== undefined && decimals !== undefined && (
                    <p className="text-xs text-muted-foreground">
                        Shielded balance: {(Number(shieldedBalance) / 10 ** decimals).toFixed(6)} q{tokenSymbol}
                    </p>
                )}

                <div className="space-y-2">
                    <Label className="text-foreground font-medium">Recipient Address</Label>
                    <Input
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="0x..."
                        className="font-mono text-sm"
                        disabled={transferStep !== "input"}
                    />
                    {isValidRecipient && recipientHasVault !== undefined && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {recipientHasVault
                                ? <><ShieldIcon className="w-3 h-3 text-primary" /> Recipient has a Qrypt-Safe.</>
                                : <><UserIcon className="w-3 h-3" /> No Qrypt-Safe detected.</>
                            }
                            <span>They will receive {tokenSymbol}.</span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-foreground font-medium">Amount</Label>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        disabled={transferStep !== "input"}
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
                </div>

                {transferStep === "input" || (transferStep === "commit" && !commitSuccess) ? (
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCommit}
                        disabled={!canTransfer || isProcessing}
                    >
                        {isProcessing ? "Submitting..." : "Step 1: Commit Transfer"}
                    </Button>
                ) : (
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleReveal}
                        disabled={!canTransfer || isProcessing}
                    >
                        {isProcessing ? "Sending..." : "Step 2: Reveal Transfer"}
                    </Button>
                )}

                <p className="text-xs text-muted-foreground text-center">
                    Two-step process: commit protects your vault proof from mempool exposure.
                </p>
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
