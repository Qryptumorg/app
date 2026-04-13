import { useEffect, useState } from "react";
import SharedNavBar from "@/components/SharedNavBar";
import { useLanguage } from "@/lib/LanguageContext";

/* ─── Types ─────────────────────────────────────────────────────────── */

export interface BentoCard {
    img: string;
    color: string;
    title: string;
    body: string;
    link?: { text: string; href: string };
}

export interface StepItem {
    n: string;
    color: string;
    title: string;
    desc: string;
    detail: string;
}

export interface RelatedLink {
    label: string;
    href: string;
    color: string;
}

export interface FeatureBentoPageProps {
    pageTitle: string;
    badge: string;
    heroTitle: string;
    heroHighlight: string;
    heroSubtitle: string;
    primaryColor: string;
    secondaryColor: string;
    heroImg?: string;
    heroButtons?: Array<{ label: string; href: string; primary?: boolean }>;
    stats: Array<{ value: string; label: string; note: string }>;
    sectionBadge: string;
    sectionHeading: string;
    sectionBody: string;
    sectionColor: string;
    cards: [BentoCard, BentoCard, BentoCard, BentoCard];
    steps?: StepItem[];
    techNote?: { label: string; lines: string[] };
    cta?: { title: string; body: string; button: string; href: string };
    relatedLinks?: RelatedLink[];
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

function SectionLabel({ text }: { color?: string; text: string }) {
    return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 18, height: 1, background: "rgba(255,255,255,0.2)", borderRadius: 1 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>{text}</span>
        </div>
    );
}

const headingStyle: React.CSSProperties = {
    fontFamily: "'Inter',sans-serif",
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 900,
    color: "#d4d6e2",
    lineHeight: 1.1,
    letterSpacing: "-0.025em",
    marginBottom: 16,
};

const subStyle: React.CSSProperties = {
    fontSize: "clamp(14px, 1.5vw, 16px)",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.75,
    maxWidth: 640,
};

/* ─── Hero ───────────────────────────────────────────────────────────── */

function HeroSection({ badge, heroTitle, heroHighlight, heroSubtitle, primaryColor, secondaryColor, heroButtons, stats, heroImg }: Pick<FeatureBentoPageProps, "badge" | "heroTitle" | "heroHighlight" | "heroSubtitle" | "primaryColor" | "secondaryColor" | "heroButtons" | "stats" | "heroImg">) {
    const { t } = useLanguage();
    const defaultButtons = [
        { label: t.common.openApp, href: "/app", primary: true },
        { label: t.common.readDocs, href: "/docs/introduction/overview", primary: false },
    ];
    const buttons = heroButtons ?? defaultButtons;

    return (
        <section style={{
            minHeight: "72vh",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            paddingTop: 160, paddingBottom: 40, position: "relative", overflow: "hidden",
        }}>
            {heroImg && (
                <div style={{ position: "absolute", inset: 0 }}>
                    <img src={heroImg} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.18 }} />
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 60%, #000 100%)` }} />
                </div>
            )}
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 30%, rgba(${hexToRgb(primaryColor)},0.10) 0%, transparent 70%)` }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

            <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px", maxWidth: 860 }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 20, padding: "4px 14px", marginBottom: 28,
                }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" as const }}>{badge}</span>
                </div>
                <h1 style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "clamp(36px, 6vw, 68px)",
                    fontWeight: 900, color: "#d4d6e2",
                    lineHeight: 1.05, letterSpacing: "-0.03em",
                    marginBottom: 20,
                }}>
                    {heroTitle}<br />
                    <span style={{ color: primaryColor }}>
                        {heroHighlight}
                    </span>
                </h1>
                <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, maxWidth: 580, margin: "0 auto 40px" }}>
                    {heroSubtitle}
                </p>
                {buttons.length > 0 && (
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const }}>
                        {buttons.map(btn => (
                            <a key={btn.label} href={btn.href} style={{
                                textDecoration: "none", padding: "13px 32px", borderRadius: 10,
                                fontWeight: 700, fontSize: 14,
                                ...(btn.primary
                                    ? { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: "#d4d6e2" }
                                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#d4d6e2" }
                                ),
                            }}>{btn.label}</a>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 48, marginTop: 56, flexWrap: "wrap" as const, justifyContent: "center", padding: "0 24px" }}>
                {stats.map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 900, color: "#d4d6e2", letterSpacing: "-0.02em" }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{s.note}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ─── Bento Grid ─────────────────────────────────────────────────────── */

function MobileCard({ card }: { card: BentoCard; bg: string }) {
    return (
        <div style={{
            borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        }}>
            <div style={{ position: "relative", height: 180 }}>
                <img src={card.img} alt={card.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to bottom, transparent, rgba(5,8,16,0.97))" }} />
            </div>
            <div style={{ padding: "20px 20px 24px" }}>
                <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.18)", borderRadius: 1, marginBottom: 12 }} />
                <div style={{ fontWeight: 800, fontSize: 16, color: "#d4d6e2", lineHeight: 1.25, marginBottom: 10 }}>{card.title}</div>
                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: card.link ? 16 : 0 }}>{card.body}</div>
                {card.link && (
                    <a href={card.link.href} style={{ textDecoration: "none", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 5 }}>
                        {card.link.text} <span style={{ fontSize: 14 }}>→</span>
                    </a>
                )}
            </div>
        </div>
    );
}

function BentoGrid({ cards, sectionBadge, sectionHeading, sectionBody }: Pick<FeatureBentoPageProps, "cards" | "sectionBadge" | "sectionHeading" | "sectionBody" | "sectionColor">) {
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
    useEffect(() => {
        const handle = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handle);
        return () => window.removeEventListener("resize", handle);
    }, []);

    const [c1, c2, c3, c4] = cards;
    const bg = "rgba(255,255,255,0.03)";

    return (
        <section style={{ background: "#050810", padding: isMobile ? "56px 16px" : "80px 24px" }}>
            <div style={{ maxWidth: 1300, margin: "0 auto" }}>
                <SectionLabel text={sectionBadge} />
                <h2 style={headingStyle}>{sectionHeading}</h2>
                <p style={subStyle}>{sectionBody}</p>

                {isMobile ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 36 }}>
                        <MobileCard card={c1} bg={bg} />
                        <MobileCard card={c2} bg={bg} />
                        <MobileCard card={c3} bg={bg} />
                        <MobileCard card={c4} bg={bg} />
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 48 }}>

                        {/* Card 1: wide (2 cols), text left, image right */}
                        <div style={{
                            gridColumn: "1 / 3", minHeight: 260,
                            background: bg, border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 18, overflow: "hidden", display: "flex", alignItems: "stretch",
                        }}>
                            <div style={{ flex: "0 0 50%", padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
                                <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.18)", borderRadius: 1, marginBottom: 14 }} />
                                <div style={{ fontWeight: 900, fontSize: 19, color: "#d4d6e2", lineHeight: 1.2, marginBottom: 12 }}>{c1.title}</div>
                                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: c1.link ? 18 : 0 }}>{c1.body}</div>
                                {c1.link && (
                                    <a href={c1.link.href} style={{ textDecoration: "none", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 5 }}>
                                        {c1.link.text} <span style={{ fontSize: 14 }}>→</span>
                                    </a>
                                )}
                            </div>
                            <div style={{ flex: 1, position: "relative" }}>
                                <img src={c1.img} alt={c1.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,8,16,0.98) 0%, transparent 55%)" }} />
                            </div>
                        </div>

                        {/* Card 2: square */}
                        <div style={{
                            background: bg, border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column",
                        }}>
                            <div style={{ position: "relative", flex: 1, minHeight: 140 }}>
                                <img src={c2.img} alt={c2.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }} />
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to bottom, transparent, rgba(5,8,16,0.97))" }} />
                            </div>
                            <div style={{ padding: "0 20px 22px" }}>
                                <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.18)", borderRadius: 1, marginBottom: 10 }} />
                                <div style={{ fontWeight: 800, fontSize: 14, color: "#d4d6e2", marginBottom: 7 }}>{c2.title}</div>
                                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{c2.body}</div>
                            </div>
                        </div>

                        {/* Card 3: square */}
                        <div style={{
                            background: bg, border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column",
                        }}>
                            <div style={{ position: "relative", flex: 1, minHeight: 140 }}>
                                <img src={c3.img} alt={c3.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }} />
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to bottom, transparent, rgba(5,8,16,0.97))" }} />
                            </div>
                            <div style={{ padding: "0 20px 22px" }}>
                                <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.18)", borderRadius: 1, marginBottom: 10 }} />
                                <div style={{ fontWeight: 800, fontSize: 14, color: "#d4d6e2", marginBottom: 7 }}>{c3.title}</div>
                                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{c3.body}</div>
                            </div>
                        </div>

                        {/* Card 4: wide (2 cols) */}
                        <div style={{
                            gridColumn: "2 / 4", minHeight: 260,
                            background: bg, border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 18, overflow: "hidden", display: "flex", alignItems: "stretch",
                        }}>
                            <div style={{ flex: 1, position: "relative" }}>
                                <img src={c4.img} alt={c4.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, rgba(5,8,16,0.98) 0%, transparent 55%)" }} />
                            </div>
                            <div style={{ flex: "0 0 50%", padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
                                <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.18)", borderRadius: 1, marginBottom: 14 }} />
                                <div style={{ fontWeight: 900, fontSize: 19, color: "#d4d6e2", lineHeight: 1.2, marginBottom: 12 }}>{c4.title}</div>
                                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: c4.link ? 18 : 0 }}>{c4.body}</div>
                                {c4.link && (
                                    <a href={c4.link.href} style={{ textDecoration: "none", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 5 }}>
                                        {c4.link.text} <span style={{ fontSize: 14 }}>→</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

/* ─── Steps ──────────────────────────────────────────────────────────── */

function StepsSection({ steps }: { steps: StepItem[]; primaryColor: string }) {
    const { t } = useLanguage();
    return (
        <section style={{ background: "#000", padding: "80px 24px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <SectionLabel text={t.common.stepByStep} />
                <h2 style={headingStyle}>{t.common.howItWorks}</h2>
                <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 0 }}>
                    {steps.map((s, i) => (
                        <div key={s.n} style={{ display: "flex", gap: 0 }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 24, flexShrink: 0 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: "50%",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.14)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: "monospace", fontWeight: 900, fontSize: 12, color: "rgba(255,255,255,0.5)",
                                }}>{s.n}</div>
                                {i < steps.length - 1 && (
                                    <div style={{ width: 1, flex: 1, background: "rgba(255,255,255,0.06)", minHeight: 32, margin: "6px 0" }} />
                                )}
                            </div>
                            <div style={{ paddingBottom: 36 }}>
                                <div style={{ fontWeight: 800, fontSize: 16, color: "#d4d6e2", marginBottom: 7 }}>{s.title}</div>
                                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.52)", lineHeight: 1.7, marginBottom: 10 }}>{s.desc}</div>
                                <div style={{
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: 8, padding: "9px 14px",
                                    fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, fontFamily: "monospace",
                                }}>{s.detail}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── Tech Note ──────────────────────────────────────────────────────── */

function TechNoteSection({ techNote }: { techNote: NonNullable<FeatureBentoPageProps["techNote"]>; primaryColor: string }) {
    return (
        <section style={{ background: "#030508", padding: "56px 24px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.02)",
                    padding: "28px 32px",
                }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 16 }}>{techNote.label}</div>
                    {techNote.lines.map((line, i) => (
                        <div key={i} style={{
                            fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,0.5)",
                            lineHeight: 1.7, borderBottom: i < techNote.lines.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                            padding: "4px 0",
                        }}>{line}</div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── CTA (optional) ─────────────────────────────────────────────────── */

function CtaSection({ cta, primaryColor, secondaryColor }: { cta: NonNullable<FeatureBentoPageProps["cta"]>; primaryColor: string; secondaryColor: string }) {
    return (
        <section style={{
            background: "rgba(255,255,255,0.02)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "80px 24px", textAlign: "center",
        }}>
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <h2 style={{ ...headingStyle, marginBottom: 14 }}>{cta.title}</h2>
                <p style={{ ...subStyle, marginBottom: 32 }}>{cta.body}</p>
                <a href={cta.href} style={{
                    display: "inline-block", textDecoration: "none",
                    padding: "14px 38px",
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    borderRadius: 12, fontWeight: 800, fontSize: 14, color: "#d4d6e2",
                }}>{cta.button}</a>
            </div>
        </section>
    );
}

/* ─── Related Links strip (optional) ────────────────────────────────── */

function RelatedLinksSection({ links }: { links: RelatedLink[] }) {
    return (
        <section style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 24px" }}>
            <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", gap: 12, flexWrap: "wrap" as const }}>
                {links.map(l => (
                    <a key={l.label} href={l.href} style={{
                        textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 18px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: 10,
                        fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)",
                    }}>
                        {l.label}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                ))}
            </div>
        </section>
    );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */

function Footer() {
    const { t } = useLanguage();
    return (
        <footer style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px", textAlign: "center" }}>
            <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 0, marginBottom: 10 }}>
                <img src="/qryptum-logo.png" alt="Qryptum" style={{ height: 22, width: 22, objectFit: "contain" }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em", marginLeft: -4 }}>QRYPTUM</span>
            </a>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>{t.common.footerText}</div>
        </footer>
    );
}

/* ─── Main Export ────────────────────────────────────────────────────── */

export default function FeatureBentoPage(props: FeatureBentoPageProps) {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `${props.pageTitle} - Qryptum`;
    }, [props.pageTitle]);

    return (
        <div style={{ background: "#000", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#d4d6e2" }}>
            <SharedNavBar />
            <HeroSection
                badge={props.badge}
                heroTitle={props.heroTitle}
                heroHighlight={props.heroHighlight}
                heroSubtitle={props.heroSubtitle}
                primaryColor={props.primaryColor}
                secondaryColor={props.secondaryColor}
                heroImg={props.heroImg}
                heroButtons={props.heroButtons}
                stats={props.stats}
            />
            <BentoGrid
                cards={props.cards}
                sectionBadge={props.sectionBadge}
                sectionHeading={props.sectionHeading}
                sectionBody={props.sectionBody}
                sectionColor={props.sectionColor}
            />
            {props.steps && props.steps.length > 0 && (
                <StepsSection steps={props.steps} primaryColor={props.primaryColor} />
            )}
            {props.techNote && (
                <TechNoteSection techNote={props.techNote} primaryColor={props.primaryColor} />
            )}
            {props.cta && (
                <CtaSection cta={props.cta} primaryColor={props.primaryColor} secondaryColor={props.secondaryColor} />
            )}
            {props.relatedLinks && props.relatedLinks.length > 0 && (
                <RelatedLinksSection links={props.relatedLinks} />
            )}
            <Footer />
        </div>
    );
}
