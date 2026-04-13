import { EyeOffIcon } from "lucide-react";

const PRIMARY = "#8B5CF6";

const POINTS = [
    "This process takes around 5 minutes.",
    "Keep this tab open while it runs.",
    "Your funds stay safe if interrupted: you can resume.",
    "Routes through a zero-knowledge privacy network.",
];

interface QryptShieldApprovalProps {
    onApprove: () => void;
    onCancel: () => void;
}

export default function QryptShieldApproval({ onApprove, onCancel }: QryptShieldApprovalProps) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            padding: "32px 4px 8px",
            gap: 0,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <EyeOffIcon size={20} color={PRIMARY} />
                <span style={{ fontSize: 17, fontWeight: 700, color: "#d4d6e2", letterSpacing: "-0.01em" }}>
                    QryptShield
                </span>
                <span style={{
                    fontSize: 10, fontWeight: 700, color: PRIMARY,
                    background: "rgba(139,92,246,0.12)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: 20, padding: "2px 8px",
                    letterSpacing: "0.05em",
                }}>
                    PRIVATE TRANSFER
                </span>
            </div>

            <p style={{
                margin: "0 0 24px",
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.5,
            }}>
                Before you start, please read the following.
            </p>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                marginBottom: 28,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.07)",
                overflow: "hidden",
            }}>
                {POINTS.map((point, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "13px 16px",
                            borderBottom: i < POINTS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                            background: "rgba(255,255,255,0.02)",
                        }}
                    >
                        <span style={{
                            width: 18, height: 18, borderRadius: "50%",
                            background: "rgba(139,92,246,0.15)",
                            border: "1px solid rgba(139,92,246,0.25)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, marginTop: 1,
                        }}>
                            <span style={{ fontSize: 9, fontWeight: 800, color: PRIMARY }}>
                                {i + 1}
                            </span>
                        </span>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                            {point}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={onApprove}
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
                    letterSpacing: "-0.01em",
                }}
            >
                Start Transfer
            </button>

            <button
                onClick={onCancel}
                style={{
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: 12,
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                }}
            >
                Cancel
            </button>
        </div>
    );
}
