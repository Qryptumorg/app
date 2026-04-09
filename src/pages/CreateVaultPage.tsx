import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract } from "wagmi";
import { ShieldIcon, EyeIcon, EyeOffIcon, CheckCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SHIELD_FACTORY_ADDRESSES } from "@/lib/wagmi";
import { SHIELD_FACTORY_ABI } from "@/lib/abi";
import { validatePasswordFormat, hashPassword, getPasswordStrengthLabel } from "@/lib/password";
import { registerVault } from "@/lib/api";

interface CreateVaultPageProps {
    onVaultCreated: () => void;
}

export default function CreateVaultPage({ onVaultCreated }: CreateVaultPageProps) {
    const { address } = useAccount();
    const chainId = useChainId();
    const { toast } = useToast();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [creating, setCreating] = useState(false);

    const factoryAddress = SHIELD_FACTORY_ADDRESSES[chainId] as `0x${string}` | undefined;

    const { writeContract, data: txHash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    const { data: realVaultAddress } = useReadContract({
        address: factoryAddress,
        abi: SHIELD_FACTORY_ABI,
        functionName: "getVault",
        args: address ? [address] : undefined,
        query: { enabled: isSuccess && !!address && !!factoryAddress },
    });

    const passwordValid = validatePasswordFormat(password);
    const passwordsMatch = password === confirmPassword;
    const canCreate = passwordValid && passwordsMatch && !creating && !isConfirming && !!factoryAddress;

    const strengthLabel = getPasswordStrengthLabel(password);
    const strengthColor = passwordValid ? "text-green-400" : password.length > 0 ? "text-yellow-400" : "text-muted-foreground";

    const handleCreate = async () => {
        if (!canCreate || !address) return;

        setCreating(true);
        try {
            const pwHash = hashPassword(password) as `0x${string}`;

            writeContract({
                address: factoryAddress!,
                abi: SHIELD_FACTORY_ABI,
                functionName: "createVault",
                args: [pwHash],
            }, {
                onSuccess: async (_hash) => {
                    toast({ title: "Transaction submitted", description: "Creating your Qrypt-Safe on-chain..." });
                },
                onError: (err) => {
                    toast({ title: "Transaction failed", description: err.message, variant: "destructive" });
                    setCreating(false);
                }
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            toast({ title: "Error", description: message, variant: "destructive" });
            setCreating(false);
        }
    };

    if (isSuccess) {
        const isReadingVault = !realVaultAddress;
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center">
                    <div className="shield-glow mb-6">
                        <CheckCircleIcon className="w-20 h-20 text-green-400 mx-auto" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-3">Qrypt-Safe Created</h2>
                    <p className="text-muted-foreground mb-6">
                        Your Qrypt-Safe is live on the blockchain. Remember your vault proof. It cannot be recovered.
                    </p>
                    {isReadingVault && (
                        <p className="text-sm text-muted-foreground mb-4">Reading your Qrypt-Safe address...</p>
                    )}
                    <Button size="lg" disabled={isReadingVault} onClick={async () => {
                        if (address) {
                            await registerVault({
                                walletAddress: address,
                                vaultContractAddress: realVaultAddress as string,
                                networkId: chainId,
                            }).catch(() => {});
                        }
                        onVaultCreated();
                    }}>
                        {isReadingVault ? "Loading..." : "Go to Dashboard"}
                    </Button>
                </div>
            </div>
        );
    }

    if (!factoryAddress) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center">
                    <ShieldIcon className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Unsupported Network</h2>
                    <p className="text-muted-foreground">
                        Please switch to Sepolia testnet or Ethereum mainnet to use Qryptum.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="shield-glow mb-4">
                        <ShieldIcon className="w-16 h-16 text-primary mx-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Qrypt-Safe</h1>
                    <p className="text-muted-foreground">
                        Set a vault proof to protect your tokens. This deploys a Qrypt-Safe smart contract just for you.
                    </p>
                </div>

                <div className="glass rounded-2xl p-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground font-medium">
                            Vault Proof
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="e.g. abc123"
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
                        <p className={`text-xs ${strengthColor}`}>{strengthLabel || "3 letters + 3 numbers, any order"}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                            Confirm Vault Proof
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat your vault proof"
                                maxLength={6}
                                className="pr-10 font-mono tracking-widest text-center text-lg"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showConfirm ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                        {confirmPassword.length > 0 && (
                            <p className={`text-xs ${passwordsMatch ? "text-green-400" : "text-destructive"}`}>
                                {passwordsMatch ? "Vault proofs match" : "Vault proofs do not match"}
                            </p>
                        )}
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground space-y-1">
                        <p className="font-semibold text-foreground text-sm">Important</p>
                        <p>Your vault proof is hashed before going on-chain. It cannot be recovered if lost.</p>
                        <p>Direct MetaMask transfers of shielded tokens are blocked by the contract.</p>
                    </div>

                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCreate}
                        disabled={!canCreate}
                    >
                        {isConfirming ? "Creating Qrypt-Safe..." : creating ? "Confirm in MetaMask..." : "Create Qrypt-Safe"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
