import { useEffect, useState } from "react";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

const PRIMARY = "#8B5CF6";

type LoadState = "loading" | "ready" | "error";

interface QryptShieldLoaderProps {
    chainId?: number;
    onReady?: () => void;
    onCancel?: () => void;
}

export default function QryptShieldLoader({ chainId, onReady, onCancel }: QryptShieldLoaderProps) {
    const [status, setStatus] = useState("Loading privacy engine...");
    const [loadState, setLoadState] = useState<LoadState>("loading");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            try {
                // Dynamic import — railgun 22MB does NOT block initial bundle load
                const { ensureRailgunEngine, loadRailgunProvider } = await import("@/lib/railgun");

                await ensureRailgunEngine(msg => {
                    if (!cancelled) setStatus(msg);
                });

                if (chainId) {
                    await loadRailgunProvider(chainId, msg => {
                        if (!cancelled) setStatus(msg);
                    });
                }

                if (!cancelled) {
                    setStatus("Privacy engine ready.");
                    setLoadState("ready");
                }
            } catch (err) {
                if (!cancelled) {
                    setErrorMsg(err instanceof Error ? err.message : "Failed to load privacy engine.");
                    setLoadState("error");
                }
            }
        }

        init();
        return () => { cancelled = true; };
    }, [chainId]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 380,
            padding: "40px 16px 24px",
            gap: 0,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <img
                    src="/qryptum-logo.png"
                    width={44} height={44}
                    alt="Qryptum"
                    style={{ borderRadius: 10 }}
                />
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8h12M8 2v12" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <img
                    src="/railgun-logo.png"
                    width={28} height={28}
                    alt="Railgun"
                    style={{ borderRadius: 7, opacity: 0.75 }}
                />
            </div>

            <p style={{
                margin: "0 0 6px",
                color: "#fff",
                fontSize: 17,
                fontWeight: 600,
                textAlign: "center",
                letterSpacing: "-0.01em",
            }}>
                {loadState === "ready" ? "Ready" : loadState === "error" ? "Setup failed" : "Setting up privacy engine"}
            </p>

            <p style={{
                margin: "0 0 28px",
                color: "rgba(255,255,255,0.38)",
                fontSize: 12,
                textAlign: "center",
                lineHeight: 1.6,
                maxWidth: 260,
                minHeight: 36,
            }}>
                {loadState === "error" ? errorMsg : status}
            </p>

            {loadState === "loading" && (
                <div style={{
                    width: 160,
                    height: 2,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                    marginBottom: 32,
                }}>
                    <div style={{
                        height: "100%",
                        width: "30%",
                        borderRadius: 999,
                        background: `linear-gradient(90deg, transparent, ${PRIMARY}, #a78bfa, transparent)`,
                        animation: "qs-scan 1.5s cubic-bezier(.45,0,.55,1) infinite",
                    }} />
                </div>
            )}

            {loadState === "ready" && (
                <div style={{ marginBottom: 28 }}>
                    <CheckCircle2Icon size={28} color="#22C55E" />
                </div>
            )}

            {loadState === "error" && (
                <div style={{ marginBottom: 28 }}>
                    <AlertCircleIcon size={28} color="#f87171" />
                </div>
            )}

            <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 14px",
                borderRadius: 999,
                border: `1px solid rgba(139,92,246,0.2)`,
                background: "rgba(139,92,246,0.06)",
                marginBottom: 28,
            }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 400 }}>
                    Powered by
                </span>
                <span style={{ color: "rgba(139,92,246,0.8)", fontSize: 11, fontWeight: 600 }}>
                    RAILGUN Protocol
                </span>
            </div>

            {loadState === "ready" && onReady && (
                <button
                    onClick={onReady}
                    style={{
                        width: "100%",
                        padding: "13px 0",
                        borderRadius: 12,
                        background: PRIMARY,
                        border: "none",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        marginBottom: 10,
                    }}
                >
                    Continue
                </button>
            )}

            {loadState === "error" && (
                <button
                    onClick={async () => {
                        const { clearZKArtifactCache } = await import("@/lib/railgun");
                        await clearZKArtifactCache();
                        window.location.reload();
                    }}
                    style={{
                        width: "100%",
                        padding: "13px 0",
                        borderRadius: 12,
                        background: "rgba(248,113,113,0.1)",
                        border: "1px solid rgba(248,113,113,0.25)",
                        color: "#f87171",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        marginBottom: 10,
                    }}
                >
                    Clear ZK cache &amp; reload
                </button>
            )}

            {onCancel && (
                <button
                    onClick={onCancel}
                    style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.25)",
                        fontSize: 12,
                        cursor: "pointer",
                        padding: "6px 0",
                    }}
                >
                    Cancel
                </button>
            )}

            {loadState === "loading" && (
                <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                    <button
                        onClick={async () => {
                            const { clearZKArtifactCache } = await import("@/lib/railgun");
                            await clearZKArtifactCache();
                            window.location.reload();
                        }}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 11, cursor: "pointer", padding: 0 }}
                    >
                        Clear ZK cache
                    </button>
                </div>
            )}

            <style>{`
                @keyframes qs-scan {
                    0%   { transform: translateX(-150%); }
                    100% { transform: translateX(650%); }
                }
            `}</style>
        </div>
    );
}
