import { ShieldIcon, SendIcon, EyeOffIcon, ArrowRightIcon } from "lucide-react";

interface TransferModeSelectorProps {
    hasVault: boolean;
    onSelect: (mode: "qryptsafe" | "qryptair-send" | "qryptshield") => void;
}

const MODES = [
    {
        id: "qryptsafe" as const,
        label: "QryptSafe Transfer",
        color: "#22C55E",
        bg: "rgba(34,197,94,0.07)",
        border: "rgba(34,197,94,0.22)",
        icon: <ShieldIcon size={18} color="#22C55E" />,
        description: "Init-finalize vault proof. Private, on-chain, gas required for both steps.",
        badge: null,
        disabled: false,
        requiresVault: true,
    },
    {
        id: "qryptair-send" as const,
        label: "QryptAir · Send",
        color: "#F59E0B",
        bg: "rgba(245,158,11,0.07)",
        border: "rgba(245,158,11,0.22)",
        icon: <SendIcon size={18} color="#F59E0B" />,
        description: "Sign an offline voucher + QR code. Sender pays zero gas.",
        badge: "Beta",
        disabled: false,
        requiresVault: false,
    },
    {
        id: "qryptshield" as const,
        label: "QryptShield",
        color: "#8B5CF6",
        bg: "rgba(139,92,246,0.07)",
        border: "rgba(139,92,246,0.22)",
        icon: <EyeOffIcon size={18} color="#8B5CF6" />,
        description: "Railgun ZK privacy pool. Full on-chain anonymity, ZK proof generated locally.",
        badge: "Beta",
        disabled: false,
        requiresVault: false,
    },
] as const;

export default function TransferModeSelector({ hasVault, onSelect }: TransferModeSelectorProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", marginBottom: 4 }}>
                CHOOSE TRANSFER METHOD
            </p>
            {MODES.map(mode => {
                const isDisabled = mode.disabled || (mode.requiresVault && !hasVault);
                return (
                    <button
                        key={mode.id}
                        onClick={() => !isDisabled && onSelect(mode.id)}
                        disabled={isDisabled}
                        style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "15px 16px", borderRadius: 14,
                            background: mode.bg,
                            border: `1px solid ${mode.border}`,
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            opacity: isDisabled ? 0.45 : 1,
                            textAlign: "left",
                            width: "100%",
                            fontFamily: "'Inter', sans-serif",
                            transition: "opacity 0.15s",
                        }}
                    >
                        <div style={{
                            width: 38, height: 38, borderRadius: 9,
                            background: "rgba(0,0,0,0.35)",
                            border: `1px solid ${mode.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            {mode.icon}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: mode.color, whiteSpace: "nowrap" }}>
                                    {mode.label}
                                </span>
                                {mode.badge && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, color: mode.color,
                                        background: mode.bg, border: `1px solid ${mode.border}`,
                                        borderRadius: 20, padding: "1px 7px", letterSpacing: "0.05em",
                                        flexShrink: 0,
                                    }}>
                                        {mode.badge}
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.4 }}>
                                {mode.description}
                            </p>
                        </div>

                        {!isDisabled && <ArrowRightIcon size={15} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />}
                    </button>
                );
            })}
        </div>
    );
}
