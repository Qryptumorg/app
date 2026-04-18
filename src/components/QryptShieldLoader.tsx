import { useEffect, useRef, useState } from "react";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

const PRIMARY = "#8B5CF6";

type LoadState = "loading" | "ready" | "error";

interface QryptShieldLoaderProps {
    chainId?: number;
    onReady?: () => void;
    onCancel?: () => void;
}

// Message → target progress milestones
const MILESTONES: { match: string; pct: number }[] = [
    { match: "Loading privacy engine",  pct: 8  },
    { match: "Starting Railgun engine", pct: 28 },
    { match: "Connecting to network",   pct: 55 },
    { match: "Privacy engine ready",    pct: 100 },
];

function milestoneFor(msg: string): number | null {
    for (const m of MILESTONES) {
        if (msg.includes(m.match)) return m.pct;
    }
    // Parse explicit % from message (e.g. "Scanning commitments: 72%")
    const match = msg.match(/(\d+)%/);
    if (match) {
        const raw = parseInt(match[1], 10);
        // Map 0-100 of scan phase into 28-55 range (between engine ready and network connect)
        return Math.round(28 + (raw / 100) * 27);
    }
    return null;
}

export default function QryptShieldLoader({ chainId, onReady, onCancel }: QryptShieldLoaderProps) {

    const [status, setStatus] = useState("Loading privacy engine...");
    const [loadState, setLoadState] = useState<LoadState>("loading");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [progress, setProgress] = useState(2);

    // targetRef holds the milestone we're smoothly animating toward
    const targetRef = useRef(2);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Smooth ticker: nudge progress toward targetRef every 80ms
    useEffect(() => {
        tickRef.current = setInterval(() => {
            setProgress(prev => {
                const target = targetRef.current;
                if (prev >= target) return prev;
                // Fast when far, slow when close
                const step = Math.max(0.3, (target - prev) * 0.06);
                return Math.min(target, prev + step);
            });
        }, 80);
        return () => { if (tickRef.current) clearInterval(tickRef.current); };
    }, []);

    function advanceTo(pct: number) {
        // Only move forward, never back
        targetRef.current = Math.max(targetRef.current, pct);
    }

    useEffect(() => {
        let cancelled = false;

        function onMsg(msg: string) {
            if (cancelled) return;
            setStatus(msg);
            const pct = milestoneFor(msg);
            if (pct !== null) advanceTo(pct);
        }

        async function init() {
            try {
                advanceTo(5);
                const { ensureRailgunEngine, loadRailgunProvider } = await import("@/lib/railgun");

                await ensureRailgunEngine(onMsg);
                advanceTo(50);

                if (chainId) {
                    await loadRailgunProvider(chainId, onMsg);
                }
                advanceTo(95);

                if (!cancelled) {
                    onMsg("Privacy engine ready.");
                    // Brief pause so user sees 100% before transitioning
                    await new Promise(r => setTimeout(r, 300));
                    advanceTo(100);
                    await new Promise(r => setTimeout(r, 250));
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

    // Display percentage: round to nearest integer, cap at 99 while still loading
    const displayPct = loadState === "ready" ? 100
        : loadState === "error" ? null
        : Math.min(99, Math.round(progress));

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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, width: "100%" }}>
                <img
                    src={`${import.meta.env.BASE_URL}qryptum-logo.png`}
                    width={56} height={56}
                    alt="Qryptum"
                    style={{ borderRadius: 12, display: "block" }}
                />
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                     style={{ flexShrink: 0, marginLeft: 4, marginRight: 16 }}>
                    <path d="M2 8h12M8 2v12" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <img
                    src={`${import.meta.env.BASE_URL}railgun-logo.png`}
                    width={28} height={28}
                    alt="Railgun"
                    style={{ borderRadius: 7, opacity: 0.75, display: "block" }}
                />
            </div>

            <p style={{
                margin: "0 0 6px",
                color: "#d4d6e2",
                fontSize: 17,
                fontWeight: 600,
                textAlign: "center",
                letterSpacing: "-0.01em",
            }}>
                {loadState === "ready" ? "Ready" : loadState === "error" ? "Setup failed" : "Setting up privacy engine"}
            </p>

            <p style={{
                margin: "0 0 20px",
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
                <div style={{ width: 200, marginBottom: 28 }}>
                    {/* Track */}
                    <div style={{
                        width: "100%",
                        height: 4,
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.07)",
                        overflow: "hidden",
                        marginBottom: 7,
                    }}>
                        {/* Fill */}
                        <div style={{
                            height: "100%",
                            width: `${progress}%`,
                            borderRadius: 999,
                            background: `linear-gradient(90deg, #7c3aed, ${PRIMARY}, #a78bfa)`,
                            transition: "width 0.08s linear",
                            boxShadow: `0 0 8px rgba(139,92,246,0.6)`,
                        }} />
                    </div>
                    {/* Percentage label */}
                    <p style={{
                        margin: 0,
                        textAlign: "right",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "rgba(139,92,246,0.7)",
                        letterSpacing: "0.04em",
                        fontVariantNumeric: "tabular-nums",
                    }}>
                        {displayPct}%
                    </p>
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
                        color: "#d4d6e2",
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
                    <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 11 }}>·</span>
                    <button
                        onClick={async () => {
                            // Delete qryptum-engine IndexedDB (stale UTXO scan state)
                            await new Promise<void>((resolve) => {
                                const req = indexedDB.deleteDatabase("qryptum-engine");
                                req.onsuccess = () => resolve();
                                req.onerror = () => resolve();
                                req.onblocked = () => resolve();
                            });
                            // Clear wallet ID from localStorage so wallet is re-created
                            // with the new 50k-block scan window
                            Object.keys(localStorage)
                                .filter(k => k.startsWith("qryptum_rg_wallet_id"))
                                .forEach(k => localStorage.removeItem(k));
                            // Clear stale pending transfer state — stale WETH/token pending
                            // causes waitForRailgunBalance to check the wrong token on resume.
                            Object.keys(localStorage)
                                .filter(k => k.startsWith("qryptum:railgun:pending:"))
                                .forEach(k => localStorage.removeItem(k));
                            window.location.reload();
                        }}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 11, cursor: "pointer", padding: 0 }}
                        title="Stuck for 30+ min? Delete stale scan state and rescan from 7-day window"
                    >
                        Reset scan
                    </button>
                </div>
            )}
        </div>
    );
}
