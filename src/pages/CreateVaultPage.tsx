import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract } from "wagmi";
import { ShieldIcon, EyeIcon, EyeOffIcon, CheckCircleIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SHIELD_FACTORY_V6_ADDRESSES } from "@/lib/wagmi";
import { SHIELD_FACTORY_V6_ABI } from "@/lib/abi";
import { validatePasswordFormat, getPasswordStrengthLabel, generateInitialChainHead, initChainState } from "@/lib/password";
import { registerVault } from "@/lib/api";
import { getTxEtherscanUrl } from "@/lib/utils";

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
    const [deriving, setDeriving] = useState(false);
    const [creating, setCreating] = useState(false);

    const factoryAddress = SHIELD_FACTORY_V6_ADDRESSES[chainId] as `0x${string}` | undefined;

    const { writeContract, data: txHash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
        pollingInterval: 1500,
    });

    const { data: realVaultAddress } = useReadContract({
        address: factoryAddress,
        abi: SHIELD_FACTORY_V6_ABI,
        functionName: "getQryptSafe",
        args: address ? [address] : undefined,
        query: {
            enabled: isSuccess && !!address && !!factoryAddress,
            refetchInterval: 1500,
        },
    });

    useEffect(() => {
        if (!isSuccess || !realVaultAddress || !address) return;
        // Initialize OTP chain state for this wallet on this chain
        initChainState(address);
        registerVault({
            walletAddress: address,
            vaultContractAddress: realVaultAddress as string,
            networkId: chainId,
        }).catch(() => {}).finally(() => {
            setTimeout(onVaultCreated, 1200);
        });
    }, [isSuccess, realVaultAddress, address, chainId, onVaultCreated]);

    const passwordValid = validatePasswordFormat(password);
    const passwordsMatch = password === confirmPassword;
    const isBusy = deriving || creating || isConfirming;
    const canCreate = passwordValid && passwordsMatch && !isBusy && !!factoryAddress && !!address;

    const strengthLabel = getPasswordStrengthLabel(password);
    const strengthColor = passwordValid ? "text-green-400" : password.length > 0 ? "text-yellow-400" : "text-muted-foreground";

    const handleCreate = async () => {
        if (!canCreate || !address) return;

        setDeriving(true);
        try {
            // Derive the OTP chain head using PBKDF2-200k (~2s)
            // walletAddress (EOA) is used as the PBKDF2 salt
            const initialChainHead = await generateInitialChainHead(password, address);

            setDeriving(false);
            setCreating(true);

            writeContract({
                address: factoryAddress!,
                abi: SHIELD_FACTORY_V6_ABI,
                functionName: "createQryptSafe",
                args: [initialChainHead],
            }, {
                onSuccess: async (hash) => {
                    toast({
                        title: "Transaction submitted",
                        description: (
                            <a
                                href={getTxEtherscanUrl(hash, chainId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#60a5fa", textDecoration: "underline" }}
                            >
                                View on Etherscan ↗
                            </a>
                        ),
                    });
                },
                onError: (err) => {
                    toast({ title: "Transaction failed", description: err.message, variant: "destructive" });
                    setCreating(false);
                },
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            toast({ title: "Error", description: message, variant: "destructive" });
            setDeriving(false);
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
                        Your Qrypt-Safe is live on-chain. Remember your vault proof. It cannot be recovered.
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                        {isReadingVault ? "Reading your Qrypt-Safe address..." : "Entering your Qrypt-Safe..."}
                    </p>
                    {!isReadingVault && (
                        <Button size="lg" variant="outline" onClick={onVaultCreated}>
                            Go to Dashboard
                        </Button>
                    )}
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

    const buttonLabel = deriving
        ? "Deriving vault chain..."
        : isConfirming
        ? "Creating Qrypt-Safe..."
        : creating
        ? "Confirm in wallet..."
        : "Create Qrypt-Safe";

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="shield-glow mb-4">
                        <ShieldIcon className="w-16 h-16 text-primary mx-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Qrypt-Safe</h1>
                    <p className="text-muted-foreground">
                        Set a vault proof to protect your tokens. This deploys a personal smart contract just for you.
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
                                autoComplete="new-password"
                                className="pr-10 font-mono tracking-widest text-center text-lg"
                                disabled={isBusy}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                disabled={isBusy}
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
                                autoComplete="new-password"
                                className="pr-10 font-mono tracking-widest text-center text-lg"
                                disabled={isBusy}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                disabled={isBusy}
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
                        <p>Your vault proof generates a one-time-proof chain stored locally. It cannot be recovered if lost.</p>
                        <p>Each vault has 99 operations before you need to recharge. Direct MetaMask transfers of shielded tokens are blocked.</p>
                    </div>

                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCreate}
                        disabled={!canCreate}
                    >
                        {(deriving || creating || isConfirming) && (
                            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {buttonLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
