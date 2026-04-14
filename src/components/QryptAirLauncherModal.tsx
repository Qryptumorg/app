import { WifiOffIcon, ArrowUpIcon } from "lucide-react";

interface Props {
    onOpenOffline: () => void;
    onMintAirBags: () => void;
    onDismiss: () => void;
}

function isDesktop() {
    return window.matchMedia("(pointer: fine)").matches;
}

export default function QryptAirLauncherModal({ onOpenOffline, onMintAirBags, onDismiss }: Props) {
    const desktop = isDesktop();

    return (
        <div
            onClick={onDismiss}
            style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: "rgba(0,0,0,0.72)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 16px",
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: "100%", maxWidth: 480,
                    background: "#181929",
                    borderRadius: 20,
                    padding: "28px 28px 24px",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                    fontFamily: "'Inter', sans-serif",
                    display: "flex", flexDirection: "column", gap: 20,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <WifiOffIcon size={20} color="#F59E0B" />
                        <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
                            QryptAir
                        </span>
                        <span style={{
                            fontSize: 10, fontWeight: 700, color: "#F59E0B",
                            border: "1px solid rgba(245,158,11,0.5)",
                            borderRadius: 6, padding: "2px 7px", letterSpacing: "0.05em",
                        }}>PWA</span>
                    </div>
                    <button
                        onClick={onDismiss}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "rgba(255,255,255,0.45)", fontSize: 16, lineHeight: 1,
                            padding: 4,
                        }}
                    >X</button>
                </div>

                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6 }}>
                    Sign blockchain transactions with no internet connection. MetaMask signs locally on your device.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                        onClick={onOpenOffline}
                        style={{
                            width: "100%", padding: "15px",
                            borderRadius: 12, border: "none",
                            background: "#F59E0B", color: "#000",
                            fontSize: 15, fontWeight: 700, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}
                    >
                        <WifiOffIcon size={16} />
                        Open Offline
                    </button>

                    <button
                        onClick={onMintAirBags}
                        style={{
                            width: "100%", padding: "15px",
                            borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.04)", color: "#fff",
                            fontSize: 15, fontWeight: 700, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}
                    >
                        <ArrowUpIcon size={16} />
                        Mint Air Bags
                    </button>
                </div>

                <div style={{
                    padding: "16px", borderRadius: 12,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", flexDirection: "column", gap: 10,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: "#F59E0B",
                            border: "1px solid rgba(245,158,11,0.4)",
                            borderRadius: 5, padding: "2px 7px", letterSpacing: "0.04em", whiteSpace: "nowrap",
                        }}>
                            {desktop ? "Desktop Browser" : "Mobile Browser"}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
                            Install as {desktop ? "Desktop" : "Mobile"} App
                        </span>
                    </div>
                    {desktop ? (
                        <ul style={{ margin: 0, padding: "0 0 0 2px", listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                            {[
                                "Look for the install icon in the address bar",
                                'Or open browser menu and choose "Install QryptAir"',
                                'Click "Install" in the prompt',
                            ].map(t => (
                                <li key={t} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", paddingLeft: 0 }}>{t}</li>
                            ))}
                        </ul>
                    ) : (
                        <ul style={{ margin: 0, padding: "0 0 0 2px", listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                            {[
                                'Tap the Share icon in your browser',
                                'Choose "Add to Home Screen"',
                                'Tap "Add" to install QryptAir',
                            ].map(t => (
                                <li key={t} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", paddingLeft: 0 }}>{t}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <p style={{ margin: 0, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)", cursor: "pointer" }}
                    onClick={onDismiss}>
                    Tap outside to continue to Send form
                </p>
            </div>
        </div>
    );
}
