import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { useTxStatus, TxEntry } from "@/lib/txStatusContext";
import { CheckCircle2Icon, XCircleIcon, LoaderCircleIcon, ExternalLinkIcon } from "lucide-react";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx/";
const AUTO_DISMISS_MS = 6000;

function TxToast({ entry, onDismiss }: { entry: TxEntry; onDismiss: () => void }) {
    const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
        hash: entry.hash,
        pollingInterval: 1500,
    });

    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (isSuccess || isError) {
            const t = setTimeout(() => {
                setLeaving(true);
                setTimeout(onDismiss, 350);
            }, AUTO_DISMISS_MS);
            return () => clearTimeout(t);
        }
        return undefined;
    }, [isSuccess, isError, onDismiss]);

    const status: "pending" | "success" | "error" = isSuccess
        ? "success"
        : isError
        ? "error"
        : "pending";

    const borderColor =
        status === "success" ? "rgba(34,197,94,0.45)"
        : status === "error" ? "rgba(239,68,68,0.45)"
        : "rgba(255,255,255,0.13)";

    const accentColor =
        status === "success" ? "#22C55E"
        : status === "error" ? "#EF4444"
        : "rgba(255,255,255,0.55)";

    const label =
        status === "success" ? "Confirmed"
        : status === "error" ? "Failed"
        : isLoading ? "Confirming..."
        : "Submitted";

    const shortHash = entry.hash.slice(0, 8) + "..." + entry.hash.slice(-6);

    return (
        <div
            onClick={() => {
                setLeaving(true);
                setTimeout(onDismiss, 350);
            }}
            style={{
                background: "#111118",
                border: `1px solid ${borderColor}`,
                borderRadius: 14,
                padding: "12px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                cursor: "pointer",
                userSelect: "none",
                minWidth: 280,
                maxWidth: 340,
                transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(40px) scale(0.96)",
                opacity: visible && !leaving ? 1 : 0,
                transition: "opacity 0.3s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)",
            }}
        >
            <div style={{ marginTop: 1, flexShrink: 0, color: accentColor }}>
                {status === "success" && <CheckCircle2Icon size={18} />}
                {status === "error" && <XCircleIcon size={18} />}
                {status === "pending" && (
                    <LoaderCircleIcon
                        size={18}
                        style={{ animation: "spin 1s linear infinite" }}
                    />
                )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 13, fontWeight: 700, color: "#fff",
                    marginBottom: 2, letterSpacing: "-0.01em",
                }}>
                    {entry.label}
                </div>
                <div style={{
                    fontSize: 11, color: "rgba(255,255,255,0.45)",
                    display: "flex", alignItems: "center", gap: 4,
                }}>
                    <span style={{ color: accentColor, fontWeight: 600 }}>{label}</span>
                    <span style={{ opacity: 0.5 }}>·</span>
                    <a
                        href={SEPOLIA_EXPLORER + entry.hash}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                            color: "rgba(255,255,255,0.4)",
                            textDecoration: "none",
                            display: "flex", alignItems: "center", gap: 3,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                    >
                        {shortHash}
                        <ExternalLinkIcon size={10} />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function TxStatusBanner() {
    const { entries, dismissEntry } = useTxStatus();

    if (entries.length === 0) return null;

    return (
        <>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
            <div style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "flex-end",
                pointerEvents: "none",
            }}>
                {entries.map(entry => (
                    <div key={entry.id} style={{ pointerEvents: "auto" }}>
                        <TxToast
                            entry={entry}
                            onDismiss={() => dismissEntry(entry.id)}
                        />
                    </div>
                ))}
            </div>
        </>
    );
}
