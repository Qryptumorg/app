import { useEffect, useState } from "react";
import SharedNavBar from "@/components/SharedNavBar";
import { useLanguage } from "@/lib/LanguageContext";

const INDIGO = "#4f46e5";
const VIOLET = "#7c3aed";
const CYAN = "#06b6d4";
const EMERALD = "#10b981";
const RED = "#ef4444";

export default function QuantumDesignPage() {
    const { t } = useLanguage();
    const L = t.quantumDesign;
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Quantum-Resistant Design - Qryptum";
    }, []);

    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    const stats = [
        { value: L.heroStat1Value, label: L.heroStat1Label, note: L.heroStat1Note, color: CYAN },
        { value: L.heroStat2Value, label: L.heroStat2Label, note: L.heroStat2Note, color: VIOLET },
        { value: L.heroStat3Value, label: L.heroStat3Label, note: L.heroStat3Note, color: EMERALD },
        { value: L.heroStat4Value, label: L.heroStat4Label, note: L.heroStat4Note, color: INDIGO },
    ];

    const simSteps = L.simSteps as unknown as { n: string; color: string; title: string; desc: string }[];

    return (
        <div style={{ background: "#000", minHeight: "100vh", fontFamily: "'Inter',sans-serif", color: "#fff" }}>
            <SharedNavBar />

            {/* ══════════ HERO ══════════════════════════════════════════════ */}
            <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <img
                        src="/images/quantum-design-hero.jpg"
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.38 }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.6) 60%, #000 100%)" }} />
                    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 50% at 50% 40%, rgba(79,70,229,0.12) 0%, transparent 70%)` }} />
                </div>

                <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "80px 24px 60px", maxWidth: 900 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.35)",
                        borderRadius: 20, padding: "5px 16px", marginBottom: 32,
                    }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: INDIGO, boxShadow: `0 0 10px ${INDIGO}` }} />
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: INDIGO, textTransform: "uppercase" }}>{L.heroBadge}</span>
                    </div>

                    <h1 style={{
                        fontSize: "clamp(38px, 6.5vw, 80px)",
                        fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1.04,
                        color: "#fff", marginBottom: 24,
                    }}>
                        {L.heroTitle.split("Post-Quantum Era").map((part, i) => (
                            i === 0
                                ? <span key={i}>{part}<span style={{ color: CYAN }}>Post-Quantum Era</span></span>
                                : <span key={i}>{part}</span>
                        ))}
                    </h1>

                    <p style={{ fontSize: "clamp(15px, 1.8vw, 18px)", color: "rgba(255,255,255,0.56)", lineHeight: 1.7, maxWidth: 660, margin: "0 auto 48px" }}>
                        {L.heroSubtitle}
                    </p>

                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <a href="/app" style={{
                            textDecoration: "none", padding: "13px 32px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                            background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`, color: "#fff",
                        }}>{t.common.openApp}</a>
                        <a href="/vault-proof-hashing" style={{
                            textDecoration: "none", padding: "13px 32px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
                        }}>{t.common.readDocs}</a>
                    </div>
                </div>

                <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "clamp(24px, 5vw, 64px)", flexWrap: "wrap", justifyContent: "center", padding: "0 24px 80px" }}>
                    {stats.map(s => (
                        <div key={s.label} style={{ textAlign: "center", minWidth: 100 }}>
                            <div style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, letterSpacing: "-0.025em", color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.note}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════ THREAT SECTION ════════════════════════════════════ */}
            <section style={{ background: "#050810", padding: isMobile ? "64px 16px" : "96px 24px" }}>
                <div style={{ maxWidth: 1140, margin: "0 auto", display: isMobile ? "flex" : "grid", flexDirection: "column", gridTemplateColumns: "1fr 420px", gap: isMobile ? 32 : 72, alignItems: "center" }}>
                    <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                            <div style={{ width: 20, height: 2, background: RED, borderRadius: 1 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: RED, textTransform: "uppercase" }}>{L.threatLabel}</span>
                        </div>
                        <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.12, color: "#fff", marginBottom: 28 }}>
                            {L.threatHeading}
                        </h2>
                        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.52)", lineHeight: 1.8, marginBottom: 20 }}>{L.threatP1}</p>
                        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.52)", lineHeight: 1.8, marginBottom: 36 }}>{L.threatP2}</p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {(L.threatPoints as unknown as string[]).map((point, i) => (
                                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                    <div style={{
                                        flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                                        background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                                        display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                                    }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5">
                                            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                        </svg>
                                    </div>
                                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.62)", lineHeight: 1.65 }}>{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(239,68,68,0.18)" }}>
                        <img
                            src="/images/quantum-threat.jpg"
                            alt="Quantum threat visualization"
                            style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }}
                        />
                        <div style={{
                            position: "absolute", bottom: 0, left: 0, right: 0,
                            background: "linear-gradient(to top, rgba(5,8,16,0.96) 0%, transparent 60%)",
                            padding: "20px 20px 16px",
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: "0.08em", textTransform: "uppercase" }}>Shor's Algorithm</div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Polynomial-time factorization of ECDSA</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════ KECCAK256 SECTION ═════════════════════════════════ */}
            <section style={{ background: "#000", padding: "96px 24px" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 56 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                            <div style={{ width: 20, height: 2, background: CYAN, borderRadius: 1 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: CYAN, textTransform: "uppercase" }}>{L.keccakLabel}</span>
                            <div style={{ width: 20, height: 2, background: CYAN, borderRadius: 1 }} />
                        </div>
                        <h2 style={{ fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.1, color: "#fff", maxWidth: 700, margin: "0 auto 20px" }}>
                            {L.keccakHeading}
                        </h2>
                        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, maxWidth: 600, margin: "0 auto" }}>{L.keccakBody}</p>
                    </div>

                    <div style={{ display: isMobile ? "flex" : "grid", flexDirection: "column", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 24 : 40, alignItems: "start" }}>
                        <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(6,182,212,0.18)" }}>
                            <img src="/images/quantum-keccak.jpg" alt="keccak256 avalanche" style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }} />
                        </div>

                        <div>
                            <div style={{
                                background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)",
                                borderRadius: 16, padding: "20px 24px", marginBottom: 24, fontFamily: "monospace",
                            }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: CYAN, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>keccak256 Avalanche Demo</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginBottom: 6 }}>{"// Input A"}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", marginBottom: 2 }}>"vault123"</div>
                                <div style={{ fontSize: 11, color: CYAN, wordBreak: "break-all", marginBottom: 16 }}>0x3c9683017f9e4bf8817aeb4c5b5b1f63e7a...</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginBottom: 6 }}>{"// Input B (1 char different)"}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", marginBottom: 2 }}>"vault124"</div>
                                <div style={{ fontSize: 11, color: VIOLET, wordBreak: "break-all", marginBottom: 12 }}>0xf7a2c8910e2547d1b89f3a60cc7d9e4a1b...</div>
                                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 12 }} />
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>128 of 256 output bits changed. Completely unpredictable.</div>
                            </div>

                            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>{L.keccakPropTitle}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {(L.keccakProps as unknown as string[]).map((prop, i) => (
                                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                        <div style={{
                                            flexShrink: 0, width: 6, height: 6, borderRadius: "50%",
                                            background: CYAN, marginTop: 6,
                                        }} />
                                        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.58)", lineHeight: 1.6 }}>{prop}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════ THREE PILLARS (horizontal strip cards) ════════════ */}
            <section style={{ background: "#030508", padding: "80px 0" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
                    <div style={{ textAlign: "center", marginBottom: 64 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                            <div style={{ width: 20, height: 2, background: VIOLET, borderRadius: 1 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: VIOLET, textTransform: "uppercase" }}>Defense Architecture</span>
                            <div style={{ width: 20, height: 2, background: VIOLET, borderRadius: 1 }} />
                        </div>
                        <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 900, letterSpacing: "-0.025em", color: "#fff", marginBottom: 14 }}>
                            Three Independent Layers
                        </h2>
                        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
                            Every Qrypt-Safe stacks three separate quantum-resistant defenses. All must be defeated simultaneously.
                        </p>
                    </div>

                    {/* Pillar 1 - image left, text right */}
                    <div style={{
                        display: isMobile ? "flex" : "grid", flexDirection: "column", gridTemplateColumns: "440px 1fr", gap: 0, marginBottom: 16,
                        background: "rgba(255,255,255,0.025)", border: "1px solid rgba(79,70,229,0.18)",
                        borderRadius: 20, overflow: "hidden",
                    }}>
                        <div style={{ position: "relative", minHeight: isMobile ? 200 : 280, flexShrink: 0 }}>
                            <img src="/images/quantum-brute-force.jpg" alt="Brute force resistance" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", inset: 0, background: isMobile ? "linear-gradient(to bottom, transparent 60%, rgba(3,5,8,0.97) 100%)" : "linear-gradient(to right, transparent 60%, rgba(3,5,8,0.97) 100%)" }} />
                        </div>
                        <div style={{ padding: isMobile ? "24px 20px 28px" : "40px 40px 40px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16, alignSelf: "flex-start" }}>
                                <div style={{ background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.3)", borderRadius: 6, padding: "2px 10px" }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: INDIGO, letterSpacing: "0.1em", textTransform: "uppercase" }}>{L.pillar1Label}</span>
                                </div>
                            </div>
                            <h3 style={{ fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 14, lineHeight: 1.2 }}>{L.pillar1Title}</h3>
                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.52)", lineHeight: 1.75, marginBottom: 20 }}>{L.pillar1Body}</p>
                            <div style={{
                                background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.2)",
                                borderRadius: 8, padding: "10px 16px",
                                fontSize: 13, fontWeight: 700, color: INDIGO, fontFamily: "monospace",
                            }}>{L.pillar1Highlight}</div>
                        </div>
                    </div>

                    {/* Pillar 2 - text left, image right */}
                    <div style={{
                        display: isMobile ? "flex" : "grid", flexDirection: "column-reverse", gridTemplateColumns: "1fr 440px", gap: 0, marginBottom: 16,
                        background: "rgba(255,255,255,0.025)", border: "1px solid rgba(124,58,237,0.18)",
                        borderRadius: 20, overflow: "hidden",
                    }}>
                        <div style={{ padding: isMobile ? "24px 20px 28px" : "40px 32px 40px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16, alignSelf: "flex-start" }}>
                                <div style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 6, padding: "2px 10px" }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: VIOLET, letterSpacing: "0.1em", textTransform: "uppercase" }}>{L.pillar2Label}</span>
                                </div>
                            </div>
                            <h3 style={{ fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 14, lineHeight: 1.2 }}>{L.pillar2Title}</h3>
                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.52)", lineHeight: 1.75, marginBottom: 20 }}>{L.pillar2Body}</p>
                            <div style={{
                                background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
                                borderRadius: 8, padding: "10px 16px",
                                fontSize: 13, fontWeight: 700, color: VIOLET, fontFamily: "monospace",
                            }}>{L.pillar2Highlight}</div>
                        </div>
                        <div style={{ position: "relative", minHeight: isMobile ? 200 : 280, flexShrink: 0 }}>
                            <img src="/images/quantum-key-independence.jpg" alt="Key independence" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", inset: 0, background: isMobile ? "linear-gradient(to bottom, transparent 60%, rgba(3,5,8,0.97) 100%)" : "linear-gradient(to left, transparent 60%, rgba(3,5,8,0.97) 100%)" }} />
                        </div>
                    </div>

                    {/* Pillar 3 - centered, image top + text bottom */}
                    <div style={{
                        background: "rgba(255,255,255,0.025)", border: "1px solid rgba(16,185,129,0.18)",
                        borderRadius: 20, overflow: "hidden",
                    }}>
                        <div style={{ position: "relative", height: 220 }}>
                            <img src="/images/quantum-keccak.jpg" alt="On-chain verification" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(3,5,8,0.98) 100%)" }} />
                        </div>
                        <div style={{ padding: isMobile ? "0 20px 28px" : "0 40px 40px", display: isMobile ? "flex" : "grid", flexDirection: "column", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 20 : 40 }}>
                            <div>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 14, marginTop: 4 }}>
                                    <div style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6, padding: "2px 10px" }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: EMERALD, letterSpacing: "0.1em", textTransform: "uppercase" }}>{L.pillar3Label}</span>
                                    </div>
                                </div>
                                <h3 style={{ fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.2 }}>{L.pillar3Title}</h3>
                                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.52)", lineHeight: 1.75 }}>{L.pillar3Body}</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div style={{
                                    background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                                    borderRadius: 8, padding: "16px 20px", width: "100%",
                                    fontSize: 14, fontWeight: 700, color: EMERALD, fontFamily: "monospace", lineHeight: 1.6,
                                }}>{L.pillar3Highlight}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════ ATTACK SIMULATION TIMELINE ═══════════════════════ */}
            <section style={{ background: "#000", padding: "96px 24px" }}>
                <div style={{ maxWidth: 820, margin: "0 auto" }}>
                    <div style={{ marginBottom: 56 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 20, height: 2, background: CYAN, borderRadius: 1 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: CYAN, textTransform: "uppercase" }}>{L.simLabel}</span>
                        </div>
                        <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 900, letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.12, marginBottom: 16 }}>
                            {L.simHeading}
                        </h2>
                        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.48)", lineHeight: 1.75, maxWidth: 620 }}>{L.simBody}</p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {simSteps.map((step, i) => {
                            const isLast = i === simSteps.length - 1;
                            const isBlock = i >= 3;
                            return (
                                <div key={i} style={{ display: "flex", gap: 0 }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 24, flexShrink: 0, width: 48 }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: "50%",
                                            background: `rgba(${hexDecToRgb(step.color)},0.1)`,
                                            border: `2px solid ${step.color}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontFamily: "monospace", fontWeight: 900, fontSize: 11, color: step.color,
                                            position: "relative",
                                        }}>
                                            {isBlock && (
                                                <div style={{
                                                    position: "absolute", inset: -4, borderRadius: "50%",
                                                    border: `1px solid ${step.color}30`,
                                                }} />
                                            )}
                                            {step.n}
                                        </div>
                                        {!isLast && (
                                            <div style={{
                                                width: 1, flex: 1, minHeight: 32, margin: "6px 0",
                                                background: `linear-gradient(to bottom, ${step.color}50, ${simSteps[i + 1].color}30)`,
                                            }} />
                                        )}
                                    </div>

                                    <div style={{
                                        paddingBottom: isLast ? 0 : 32,
                                        flex: 1,
                                        ...(isBlock ? {
                                            background: `rgba(${hexDecToRgb(step.color)},0.05)`,
                                            border: `1px solid rgba(${hexDecToRgb(step.color)},0.2)`,
                                            borderRadius: 14, padding: "16px 20px",
                                            marginBottom: isLast ? 0 : 16,
                                        } : { paddingTop: 6 }),
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                            <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>{step.title}</span>
                                            {i < 2 && (
                                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, padding: "2px 6px" }}>COMPROMISED</span>
                                            )}
                                            {i === 3 && (
                                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22c55e", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 4, padding: "2px 6px" }}>BLOCKED</span>
                                            )}
                                            {i === 4 && (
                                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: CYAN, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 4, padding: "2px 6px" }}>PROTECTED</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.52)", lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════ CTA ═══════════════════════════════════════════════ */}
            <section style={{ position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <img src="/images/quantum-cta.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(0,0,0,0.85) 60%)" }} />
                </div>
                <div style={{ position: "relative", zIndex: 1, padding: "96px 24px", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20,
                        background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 20, padding: "5px 16px" }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: EMERALD, boxShadow: `0 0 8px ${EMERALD}` }} />
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: EMERALD, textTransform: "uppercase" }}>{L.ctaLabel}</span>
                    </div>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.1, maxWidth: 640, margin: "0 auto 20px" }}>
                        {L.ctaHeading}
                    </h2>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, maxWidth: 520, margin: "0 auto 40px" }}>{L.ctaBody}</p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <a href="/app" style={{
                            textDecoration: "none", padding: "15px 40px", borderRadius: 12, fontWeight: 800, fontSize: 15,
                            background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`, color: "#fff",
                        }}>{L.ctaPrimary}</a>
                        <a href="/vault-proof-hashing" style={{
                            textDecoration: "none", padding: "15px 40px", borderRadius: 12, fontWeight: 700, fontSize: 15,
                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "#fff",
                        }}>{L.ctaSecondary}</a>
                    </div>
                </div>
            </section>

            {/* ══════════ FOOTER ════════════════════════════════════════════ */}
            <footer style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px", textAlign: "center" }}>
                <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 0, marginBottom: 10 }}>
                    <img src="/qryptum-logo.png" alt="Qryptum" style={{ height: 22, width: 22, objectFit: "contain" }} />
                    <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em", marginLeft: -4 }}>QRYPTUM</span>
                </a>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>{t.common.footerText}</div>
            </footer>
        </div>
    );
}

function hexDecToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}
