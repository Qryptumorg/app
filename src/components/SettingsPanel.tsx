import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { SettingsIcon, EyeIcon, EyeOffIcon, ExternalLinkIcon, AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PERSONAL_VAULT_ABI } from "@/lib/abi";
import { validatePasswordFormat } from "@/lib/password";

interface SettingsPanelProps {
    vaultAddress: `0x${string}`;
    chainId?: number;
}

function getEtherscanUrl(address: string, chainId?: number): string {
    if (chainId === 1) return `https://etherscan.io/address/${address}`;
    if (chainId === 11155111) return `https://sepolia.etherscan.io/address/${address}`;
    return `https://sepolia.etherscan.io/address/${address}`;
}

export default function SettingsPanel({ vaultAddress, chainId }: SettingsPanelProps) {
    const { toast } = useToast();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNew, setConfirmNew] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data: emergencyBlock } = useReadContract({
        address: vaultAddress,
        abi: PERSONAL_VAULT_ABI,
        functionName: "getEmergencyWithdrawAvailableBlock",
    });

    const { data: lastActivityBlock } = useReadContract({
        address: vaultAddress,
        abi: PERSONAL_VAULT_ABI,
        functionName: "lastActivityBlock",
    });

    const { writeContract, data: txHash } = useWriteContract();
    const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    const oldValid = validatePasswordFormat(oldPassword);
    const newValid = validatePasswordFormat(newPassword);
    const match = newPassword === confirmNew;
    const canChange = oldValid && newValid && match && !isLoading;

    const handleChangePassword = () => {
        if (!canChange) return;
        writeContract({
            address: vaultAddress,
            abi: PERSONAL_VAULT_ABI,
            functionName: "changeVaultProof",
            args: [oldPassword, newPassword],
        }, {
            onSuccess: () => toast({ title: "Vault proof updated", description: "Your QRYPTANK proof has been updated." }),
            onError: (err) => toast({ title: "Failed to update vault proof", description: err.message, variant: "destructive" }),
        });
    };

    const blocksUntilEmergency = emergencyBlock && lastActivityBlock
        ? Number(emergencyBlock) - Number(lastActivityBlock)
        : null;

    const daysUntilEmergency = blocksUntilEmergency !== null
        ? Math.ceil(blocksUntilEmergency * 12 / 86400)
        : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Settings</h2>
            </div>

            <div className="glass rounded-2xl p-6 space-y-2">
                <Label className="text-foreground font-semibold text-base">QRYPTANK Address</Label>
                <div className="flex items-center gap-2">
                    <code className="text-xs text-muted-foreground font-mono bg-muted rounded-lg px-3 py-2 flex-1 break-all">
                        {vaultAddress}
                    </code>
                    <a
                        href={getEtherscanUrl(vaultAddress, chainId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                    >
                        <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                </div>
            </div>

            <div className="glass rounded-2xl p-6 space-y-5">
                <h3 className="text-lg font-semibold text-foreground">Change Vault Proof</h3>

                <div className="space-y-2">
                    <Label className="text-foreground font-medium">Current Vault Proof</Label>
                    <div className="relative">
                        <Input
                            type={showOld ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Current vault proof"
                            maxLength={6}
                            className="pr-10 font-mono tracking-widest text-center text-lg"
                        />
                        <button type="button" onClick={() => setShowOld(!showOld)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showOld ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-foreground font-medium">New Vault Proof</Label>
                    <div className="relative">
                        <Input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New vault proof (e.g. abc123)"
                            maxLength={6}
                            className="pr-10 font-mono tracking-widest text-center text-lg"
                        />
                        <button type="button" onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showNew ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-foreground font-medium">Confirm New Vault Proof</Label>
                    <div className="relative">
                        <Input
                            type={showConfirm ? "text" : "password"}
                            value={confirmNew}
                            onChange={(e) => setConfirmNew(e.target.value)}
                            placeholder="Repeat vault proof"
                            maxLength={6}
                            className="pr-10 font-mono tracking-widest text-center text-lg"
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showConfirm ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                    </div>
                    {confirmNew.length > 0 && (
                        <p className={`text-xs ${match ? "text-green-400" : "text-destructive"}`}>
                            {match ? "Vault proofs match" : "Vault proofs do not match"}
                        </p>
                    )}
                </div>

                {isSuccess && (
                    <p className="text-green-400 text-sm">Vault proof updated successfully.</p>
                )}

                <Button
                    className="w-full"
                    onClick={handleChangePassword}
                    disabled={!canChange}
                >
                    {isLoading ? "Updating..." : "Update Vault Proof"}
                </Button>
            </div>

            <div className="glass rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2">
                    <AlertTriangleIcon className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-foreground">Emergency Withdrawal</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                    If you lose your vault proof, you can withdraw all tokens after 180 days of inactivity (approximately 1,296,000 blocks).
                </p>
                {daysUntilEmergency !== null && (
                    <p className="text-xs text-muted-foreground">
                        Available in approximately {daysUntilEmergency} days from last activity.
                    </p>
                )}
                <p className="text-xs text-yellow-400">
                    Emergency withdrawal does not require a vault proof but has a mandatory waiting period.
                </p>
            </div>
        </div>
    );
}
