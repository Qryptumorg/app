import { useState, useEffect } from "react";
import SharedNavBar from "@/components/SharedNavBar";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { useLocation } from "wouter";

type FP = typeof translations.en.featurePages;

export default function QryptAirPage() {
    const { t } = useLanguage();
    const p = (t.featurePages as FP).qryptAir;
    const [, navigate] = useLocation();
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const PRIMARY = "#F59E0B";
    const SECONDARY = "#d97706";

    return (
        <div style={{ background: "#000", minHeight: "100vh", color: "#d4d6e2", fontFamily: "'Inter',sans-serif" }}>
            <SharedNavBar onConnect={() => navigate("/app")} isConnecting={false} />

            {/* HERO */}
            <section style={{ padding: isMobile ? "120px 24px 72px" : "140px 72px 80px", maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 100, padding: "6px 14px", marginBottom: 32 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: PRIMARY }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: PRIMARY }}>{p.badge}</span>
                </div>
                <h1 style={{ fontSize: isMobile ? 36 : 58, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20 }}>
                    {p.heroTitle}{" "}
                    <span style={{ color: PRIMARY }}>{p.heroHighlight}</span>
                </h1>
                <p style={{ fontSize: 17, lineHeight: 1.65, color: "rgba(255,255,255,0.72)", maxWidth: 680, marginBottom: 40 }}>
                    {p.heroSubtitle}
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
                    {p.heroButtons.map((b, i) => (
                        <a
                            key={i}
                            href={i === 0 ? "/making-transfers" : "/vault-proof-security"}
                            style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${i === 0 ? PRIMARY : "rgba(255,255,255,0.15)"}`, background: i === 0 ? "rgba(245,158,11,0.15)" : "transparent", color: "#d4d6e2", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
                        >
                            {b.label}
                        </a>
                    ))}
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 16 : 24, marginTop: 64, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 40 }}>
                    {[
                        { value: "Optional", label: p.stats[0].label, note: p.stats[0].note },
                        { value: "EIP-712", label: p.stats[1].label, note: p.stats[1].note },
                        { value: "QR", label: p.stats[2].label, note: p.stats[2].note },
                        { value: "Anyone", label: p.stats[3].label, note: p.stats[3].note },
                    ].map((s, i) => (
                        <div key={i}>
                            <div style={{ fontSize: isMobile ? 28 : 38, fontWeight: 900, color: PRIMARY, letterSpacing: "-0.03em" }}>{s.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginTop: 4 }}>{s.label}</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.note}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS - SPLIT: Sender / Recipient */}
            <section style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: isMobile ? "72px 24px" : "96px 72px", background: "rgba(245,158,11,0.02)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ marginBottom: 56 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 18, height: 2, background: PRIMARY, borderRadius: 1 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{p.voucherFlowBadge}</span>
                        </div>
                        <h2 style={{ fontSize: isMobile ? 28 : 44, fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 12 }}>
                            {p.howItWorksTitle}
                        </h2>
                        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", maxWidth: 560 }}>
                            {p.howItWorksBody}
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 48 : 64 }}>
                        {/* Sender Side */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, padding: "10px 16px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", width: "fit-content" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: PRIMARY }} />
                                <span style={{ fontSize: 12, fontWeight: 800, color: PRIMARY, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{p.senderLabel}</span>
                            </div>
                            {p.senderSteps.map((step, i) => (
                                <div key={i} style={{ display: "flex", gap: 20, marginBottom: 32 }}>
                                    <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(245,158,11,0.08)" }}>
                                        <span style={{ fontSize: 12, fontWeight: 800, color: PRIMARY }}>{step.n}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{step.title}</div>
                                        <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>{step.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recipient Side */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, padding: "10px 16px", borderRadius: 10, background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)", width: "fit-content" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: SECONDARY }} />
                                <span style={{ fontSize: 12, fontWeight: 800, color: SECONDARY, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{p.recipientLabel}</span>
                            </div>
                            {p.recipientSteps.map((step, i) => (
                                <div key={i} style={{ display: "flex", gap: 20, marginBottom: 32 }}>
                                    <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(217,119,6,0.4)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(217,119,6,0.08)" }}>
                                        <span style={{ fontSize: 12, fontWeight: 800, color: SECONDARY }}>{step.n}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{step.title}</div>
                                        <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>{step.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* BENTO CARDS */}
            <section style={{ padding: isMobile ? "72px 24px" : "96px 72px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ marginBottom: 48 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 18, height: 2, background: PRIMARY, borderRadius: 1 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{p.deepDiveBadge}</span>
                        </div>
                        <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 900, letterSpacing: "-0.025em" }}>
                            {p.sectionHeading}
                        </h2>
                        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 12, maxWidth: 560 }}>{p.sectionBody}</p>
                    </div>

                    {/* Row 1: wide + square */}
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
                        <div style={{ borderRadius: 20, overflow: "hidden", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                            <img src="/images/qa-sign-offline.jpg" alt="" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
                            <div style={{ padding: "28px 28px 32px" }}>
                                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{p.cards[0].title}</div>
                                <div style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.55)" }}>{p.cards[0].body}</div>
                            </div>
                        </div>
                        <div style={{ borderRadius: 20, overflow: "hidden", background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.15)" }}>
                            <img src="/images/qa-qr-generate.jpg" alt="" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
                            <div style={{ padding: "28px 28px 32px" }}>
                                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{p.cards[1].title}</div>
                                <div style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.55)" }}>{p.cards[1].body}</div>
                                {p.cards[1].linkText && (
                                    <a href="/vault-proof-security" style={{ display: "inline-block", marginTop: 14, fontSize: 13, fontWeight: 600, color: PRIMARY, textDecoration: "none" }}>
                                        {p.cards[1].linkText} →
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: square + wide */}
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: 16 }}>
                        <div style={{ borderRadius: 20, overflow: "hidden", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                            <img src="/images/qa-recipient-scan.jpg" alt="" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                            <div style={{ padding: "28px 28px 32px" }}>
                                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{p.cards[2].title}</div>
                                <div style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.55)" }}>{p.cards[2].body}</div>
                            </div>
                        </div>
                        <div style={{ borderRadius: 20, overflow: "hidden", background: "rgba(180,83,9,0.06)", border: "1px solid rgba(180,83,9,0.15)" }}>
                            <img src="/images/qa-transfer-code.jpg" alt="" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                            <div style={{ padding: "28px 28px 32px" }}>
                                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{p.cards[3].title}</div>
                                <div style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.55)" }}>{p.cards[3].body}</div>
                                {p.cards[3].linkText && (
                                    <a href="/vault-proof-security" style={{ display: "inline-block", marginTop: 14, fontSize: 13, fontWeight: 600, color: PRIMARY, textDecoration: "none" }}>
                                        {p.cards[3].linkText} →
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* GUIDE: Sender + Recipient columns */}
            <section style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: isMobile ? "72px 24px" : "96px 72px", background: "rgba(245,158,11,0.02)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ marginBottom: 48 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 18, height: 2, background: PRIMARY, borderRadius: 1 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{p.stepByStepBadge}</span>
                        </div>
                        <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 900, letterSpacing: "-0.025em" }}>{p.guideTitle}</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 64 }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "8px 14px", borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", width: "fit-content" }}>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: PRIMARY }} />
                                <span style={{ fontSize: 12, fontWeight: 800, color: PRIMARY, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{p.senderGuideLabel}</span>
                            </div>
                            {p.senderGuide.map((item, i) => (
                                <div key={i} style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                                    <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: PRIMARY, marginTop: 2 }}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                                        <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "8px 14px", borderRadius: 8, background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)", width: "fit-content" }}>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: SECONDARY }} />
                                <span style={{ fontSize: 12, fontWeight: 800, color: SECONDARY, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{p.recipientGuideLabel}</span>
                            </div>
                            {p.recipientGuide.map((item, i) => (
                                <div key={i} style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                                    <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: "rgba(217,119,6,0.15)", border: "1px solid rgba(217,119,6,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: SECONDARY, marginTop: 2 }}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                                        <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* TECH NOTE */}
            <section style={{ padding: isMobile ? "48px 24px" : "64px 72px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 32px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 16 }}>{p.techNoteBadge}</div>
                        <pre style={{ margin: 0, fontFamily: "'Fira Code','JetBrains Mono',monospace", fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.72)", overflowX: "auto" as const }}>
                            {[
                                "// Step 1: Sender signs offline (no internet needed)",
                                "voucher = { token, to, amount, nonce, deadline }",
                                "transferCodeHash = keccak256(transferCode)",
                                "sig = wallet.signTypedData(EIP712Domain, voucher)",
                                "",
                                "// Step 2: QR code shared, transfer code sent separately",
                                "qr = encode(voucher + sig)",
                                "",
                                "// Step 3: Recipient redeems on-chain",
                                "PersonalQryptSafe.redeemVoucher(voucher, transferCode, sig)",
                            ].join("\n")}
                        </pre>
                    </div>
                </div>
            </section>

            {/* SECURITY NOTE */}
            <section style={{ padding: isMobile ? "0 24px 72px" : "0 72px 96px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ padding: "28px 32px", borderRadius: 16, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: PRIMARY, marginBottom: 10 }}>{p.securityModelTitle}</div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>
                            {p.securityModelBody}
                        </p>
                    </div>
                </div>
            </section>

            {/* RELATED LINKS */}
            <section style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: isMobile ? "40px 24px" : "48px 72px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 12, flexWrap: "wrap" as const }}>
                    {[
                        { label: p.relatedLinks[0].label, href: "/making-transfers", color: PRIMARY },
                        { label: p.relatedLinks[1].label, href: "/vault-proof-security", color: SECONDARY },
                        { label: p.relatedLinks[2].label, href: "/transfer-engine", color: "#b45309" },
                    ].map((link, i) => (
                        <a key={i} href={link.href} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${link.color}40`, background: `${link.color}10`, color: link.color, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                            {link.label} →
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
}
