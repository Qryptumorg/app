import { useState } from "react";
import { usePublicClient } from "wagmi";
import { RefreshCwIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { validatePasswordFormat, syncChainPosition, getChainPosition } from "@/lib/password";
import type { VaultVersion } from "@/hooks/useVault";

interface ChainSyncModalProps {
    walletAddress: `0x${string}`;
    vaultAddress: `0x${string}`;
    vaultVersion?: VaultVersion;
}

export default function ChainSyncModal({ walletAddress, vaultAddress, vaultVersion }: ChainSyncModalProps) {
    const { toast } = useToast();
    const publicClient = usePublicClient();

    const [syncProof, setSyncProof] = useState("");
    const [showSyncProof, setShowSyncProof] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ ok: boolean; pos?: number } | null>(null);

    const syncProofValid = validatePasswordFormat(syncProof);
    const isV6 = vaultVersion === "v6";
    const currentChainPos = isV6 ? getChainPosition(walletAddress) : null;

    const handleSyncChain = async () => {
        if (!syncProofValid || !publicClient) return;
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

    if (!isV6) {
        return (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                OTP chain is only available on V6 Qrypt-Safe vaults.
            </p>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                    <RefreshCwIcon size={17} color="#4ade80" />
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Chain Position Recovery</p>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>OTP Chain · V6 Vault</p>
                </div>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                Your chain position is automatically verified and self-healed every time you do a Shield, Transfer, or Unshield. This manual recovery is only needed if you cannot perform any operation and suspect a desync.
            </p>

            {currentChainPos !== null && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                        Local position: <span style={{ color: "#4ade80", fontFamily: "monospace", fontWeight: 700 }}>{currentChainPos}</span> operations remaining
                    </p>
                </div>
            )}
            {currentChainPos === null && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#F59E0B" }}>
                        No local position stored. The chain will auto-recover on your next operation.
                    </p>
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Label className="text-foreground font-medium">Vault Proof</Label>
                <div style={{ position: "relative" }}>
                    <Input
                        type={showSyncProof ? "text" : "password"}
                        value={syncProof}
                        onChange={e => { setSyncProof(e.target.value); setSyncResult(null); }}
                        placeholder="Your vault proof (e.g. abc123)"
                        maxLength={6}
                        autoComplete="new-password"
                        className="pr-10 font-mono tracking-widest text-center text-lg"
                        disabled={isSyncing}
                    />
                    <button
                        type="button"
                        onClick={() => setShowSyncProof(!showSyncProof)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                        {showSyncProof ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                </div>
                {syncProof.length > 0 && (
                    <p style={{ fontSize: 12, margin: 0, color: syncProofValid ? "#4ade80" : "#F59E0B" }}>
                        {syncProofValid ? "Valid vault proof" : "Need 3 letters and 3 numbers"}
                    </p>
                )}
            </div>

            {syncResult && (
                <p style={{ fontSize: 13, margin: 0, color: syncResult.ok ? "#4ade80" : "#f87171" }}>
                    {syncResult.ok
                        ? `Synced. ${syncResult.pos} operations remaining.`
                        : "Sync failed. Check your vault proof."}
                </p>
            )}

            <Button
                className="w-full"
                onClick={handleSyncChain}
                disabled={!syncProofValid || isSyncing}
                style={{ pointerEvents: isSyncing ? "none" : undefined }}
            >
                {isSyncing
                    ? <><RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" /> Syncing (takes ~2s)...</>
                    : "Sync Chain Position"}
            </Button>
        </div>
    );
}
