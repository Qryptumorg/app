import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from "wagmi";
import { SettingsIcon, EyeIcon, EyeOffIcon, ExternalLinkIcon, AlertTriangleIcon, ShieldCheckIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PERSONAL_VAULT_ABI } from "@/lib/abi";
import { validatePasswordFormat, hashPassword, syncChainPosition, getChainPosition } from "@/lib/password";
import { getTxEtherscanUrl } from "@/lib/utils";
import type { VaultVersion } from "@/hooks/useVault";

interface SettingsPanelProps {
    vaultAddress: `0x${string}`;
    walletAddress?: `0x${string}`;
    vaultVersion?: VaultVersion;
    chainId?: number;
}

function getEtherscanUrl(address: string, chainId?: number): string {
    if (chainId === 1) return `https://etherscan.io/address/${address}`;
    if (chainId === 11155111) return `https://sepolia.etherscan.io/address/${address}`;
    return `https://sepolia.etherscan.io/address/${address}`;
}

export default function SettingsPanel({ vaultAddress, walletAddress, vaultVersion, chainId }: SettingsPanelProps) {
    const { toast } = useToast();
    const publicClient = usePublicClient();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNew, setConfirmNew] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [syncProof, setSyncProof] = useState("");
    const [showSyncProof, setShowSyncProof] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ ok: boolean; pos?: number } | null>(null);
    const syncProofValid = validatePasswordFormat(syncProof);
    const isV6 = vaultVersion === "v6";
    const currentChainPos = isV6 && walletAddress ? getChainPosition(walletAddress) : null;

    const handleSyncChain = async () => {
        if (!syncProofValid || !walletAddress || !publicClient) return;
        setIsSyncing(true);
        setSyncResult(null);
        try {
            const pos = await syncChainPosition(syncProof, walletAddress, vaultAddress, publicClient);
            if (pos !== null) {
                setSyncResult({ ok: true, pos });
                toast({ title: "Chain position synced", description: `Position recovered: ${pos} operations remaining.` });
            } else {
                setSyncResult({ ok: false });
                toast({ title: "Sync failed", description: "Vault proof may be incorrect. Make sure you enter the same vault proof used when creating your Qrypt-Safe.", variant: "destructive" });
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            setSyncResult({ ok: false });
            toast({ title: "Sync error", description: msg, variant: "destructive" });
        } finally {
            setIsSyncing(false);
        }
    };

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
            args: [hashPassword(oldPassword), hashPassword(newPassword)],
        }, {
            onSuccess: (hash) => toast({ title: "Vault proof updated", description: (<a href={getTxEtherscanUrl(hash, chainId)} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "underline" }}>View on Etherscan ↗</a>) }),
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
                <Label className="text-foreground font-semibold text-base">Qrypt-Safe Address</Label>
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
                            autoComplete="new-password"
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
                            autoComplete="new-password"
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
                            autoComplete="new-password"
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

            {isV6 && walletAddress && (
                <div className="glass rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <RefreshCwIcon className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-foreground">Chain Position Recovery</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Your chain position is automatically verified and self-healed every time you do a Shield, Transfer, or Unshield. This manual recovery is only needed if you cannot perform any operation and suspect a desync.
                    </p>
                    {currentChainPos !== null && (
                        <p className="text-xs text-muted-foreground">
                            Local position: <span className="text-green-400 font-mono">{currentChainPos}</span> operations remaining
                        </p>
                    )}
                    {currentChainPos === null && (
                        <p className="text-xs text-yellow-400">
                            No local position stored. The chain will auto-recover on your next operation.
                        </p>
                    )}
                    <div className="space-y-2">
                        <Label className="text-foreground font-medium">Vault Proof</Label>
                        <div className="relative">
                            <Input
                                type={showSyncProof ? "text" : "password"}
                                value={syncProof}
                                onChange={(e) => { setSyncProof(e.target.value); setSyncResult(null); }}
                                placeholder="Your vault proof (e.g. abc123)"
                                maxLength={6}
                                autoComplete="new-password"
                                className="pr-10 font-mono tracking-widest text-center text-lg"
                                disabled={isSyncing}
                            />
                            <button type="button" onClick={() => setShowSyncProof(!showSyncProof)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {showSyncProof ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                        {syncProof.length > 0 && (
                            <p className={`text-xs ${syncProofValid ? "text-green-400" : "text-yellow-400"}`}>
                                {syncProofValid ? "Valid vault proof" : "Need 3 letters and 3 numbers"}
                            </p>
                        )}
                    </div>
                    {syncResult && (
                        <p className={`text-sm ${syncResult.ok ? "text-green-400" : "text-destructive"}`}>
                            {syncResult.ok ? `Synced. ${syncResult.pos} operations remaining.` : "Sync failed. Check your vault proof."}
                        </p>
                    )}
                    <Button
                        className="w-full"
                        onClick={handleSyncChain}
                        disabled={!syncProofValid || isSyncing}
                        style={{ pointerEvents: isSyncing ? "none" : undefined }}
                    >
                        {isSyncing ? (
                            <><RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" /> Syncing (takes ~2s)...</>
                        ) : "Sync Chain Position"}
                    </Button>
                </div>
            )}

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
                <div style={{ marginTop: 6, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <ShieldCheckIcon size={15} color="rgba(255,255,255,0.4)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, margin: 0 }}>
                            Qryptum has zero access to your vault. By design, your vault contract is deployed to and held entirely in your own wallet. No team, server, or protocol can move your funds.
                        </p>
                        <a
                            href="/no-admin-keys"
                            style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6 }}
                            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                        >
                            Learn more <ExternalLinkIcon size={10} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
