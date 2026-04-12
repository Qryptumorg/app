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
    heroButtons?: Array<{ label: string; href: string; primary?: boolean }>;
    stats: Array<{ value: string; label: string; note: string }>;
    sectionBadge: string;
    sectionHeading: string;
    sectionBody: string;
    sectionColor: string;
    /** Exactly 4 cards: [wide-left, square, square, wide-right] */
    cards: [BentoCard, BentoCard, BentoCard, BentoCard];
    steps?: StepItem[];
    /** Optional tech note shown below steps */
    techNote?: { label: string; lines: string[] };
    /** Optional CTA: omit entirely for pages that don't need one */
    cta?: { title: string; body: string; button: string; href: string };
    /** Optional footer link strip */
    relatedLinks?: RelatedLink[];
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

function SectionLabel({ color, text }: { color: string; text: string }) {
    return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 18, height: 2, background: color, borderRadius: 1 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{text}</span>
        </div>
    );
}

const headingStyle: React.CSSProperties = {
    fontFamily: "'Inter',sans-serif",
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 900,
    color: "#fff",
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

function HeroSection({ badge, heroTitle, heroHighlight, heroSubtitle, primaryColor, secondaryColor, heroButtons, stats }: Pick<FeatureBentoPageProps, "badge" | "heroTitle" | "heroHighlight" | "heroSubtitle" | "primaryColor" | "secondaryColor" | "heroButtons" | "stats">) {
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
            paddingTop: 64, position: "relative", overflow: "hidden",
        }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 30%, rgba(${hexToRgb(primaryColor)},0.08) 0%, transparent 70%)` }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

            <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px", maxWidth: 860 }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: `rgba(${hexToRgb(primaryColor)},0.1)`,
                    border: `1px solid rgba(${hexToRgb(primaryColor)},0.3)`,
                    borderRadius: 20, padding: "4px 14px", marginBottom: 28,
                }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: primaryColor, textTransform: "uppercase" as const }}>{badge}</span>
                </div>
                <h1 style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "clamp(36px, 6vw, 68px)",
                    fontWeight: 900, color: "#fff",
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
                                    ? { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: "#fff" }
                                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }
                                ),
                            }}>{btn.label}</a>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 48, marginTop: 56, flexWrap: "wrap" as const, justifyContent: "center", padding: "0 24px" }}>
                {stats.map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: primaryColor, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.note}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ─── Bento Grid ─────────────────────────────────────────────────────── */

function MobileCard({ card, bg }: { card: BentoCard; bg: string }) {
    return (
        <div style={{
            borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
            background: bg, border: `1px solid rgba(${hexToRgb(card.color)},0.18)`,
        }}>
            <div style={{ position: "relative", height: 180 }}>
                <img src={card.img} alt={card.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.78 }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: `linear-gradient(to bottom, transparent, ${bg.replace(/,[^,]+\)$/, ",1)")})` }} />
            </div>
            <div style={{ padding: "20px 20px 24px" }}>
                <div style={{ width: 28, height: 2, background: card.color, borderRadius: 1, marginBottom: 12 }} />
                <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", lineHeight: 1.25, marginBottom: 10 }}>{card.title}</div>
                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: card.link ? 16 : 0 }}>{card.body}</div>
                {card.link && (
                    <a href={card.link.href} style={{ textDecoration: "none", fontSize: 12, fontWeight: 700, color: card.color, display: "flex", alignItems: "center", gap: 5 }}>
                        {card.link.text} <span style={{ fontSize: 14 }}>→</span>
                    </a>
                )}
            </div>
        </div>
    );
}

function BentoGrid({ cards, sectionBadge, sectionHeading, sectionBody, sectionColor }: Pick<FeatureBentoPageProps, "cards" | "sectionBadge" | "sectionHeading" | "sectionBody" | "sectionColor">) {
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
    useEffect(() => {
        const handle = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handle);
        return () => window.removeEventListener("resize", handle);
    }, []);

    const [c1, c2, c3, c4] = cards;
    const bg1 = `rgba(${hexToRgb(c1.color)},0.06)`;
    const bg2 = `rgba(${hexToRgb(c2.color)},0.05)`;
    const bg3 = `rgba(${hexToRgb(c3.color)},0.05)`;
    const bg4 = `rgba(${hexToRgb(c4.color)},0.06)`;

    return (
        <section style={{ background: "#050810", padding: isMobile ? "56px 16px" : "80px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                <SectionLabel color={sectionColor} text={sectionBadge} />
                <h2 style={headingStyle}>{sectionHeading}</h2>
                <p style={subStyle}>{sectionBody}</p>

                {isMobile ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 36 }}>
                        <MobileCard card={c1} bg={bg1} />
                        <MobileCard card={c2} bg={bg2} />
                        <MobileCard card={c3} bg={bg3} />
                        <MobileCard card={c4} bg={bg4} />
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 48 }}>

                        {/* Card 1: wide (2 cols), text left, image right */}
                        <div style={{
                            gridColumn: "1 / 3", minHeight: 260,
                            background: bg1, border: `1px solid rgba(${hexToRgb(c1.color)},0.18)`,
                            borderRadius: 18, overflow: "hidden", display: "flex", alignItems: "stretch",
                        }}>
                            <div style={{ flex: "0 0 50%", padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
                                <div style={{ width: 32, height: 2, background: c1.color, borderRadius: 1, marginBottom: 14 }} />
                                <div style={{ fontWeight: 900, fontSize: 19, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>{c1.title}</div>
                                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: c1.link ? 18 : 0 }}>{c1.body}</div>
                                {c1.link && (
                                    <a href={c1.link.href} style={{ textDecoration: "none", fontSize: 12, fontWeight: 700, color: c1.color, display: "flex", alignItems: "center", gap: 5 }}>
                                        {c1.link.text} <span style={{ fontSize: 14 }}>→</span>
                                    </a>
                                )}
                            </div>
                            <div style={{ flex: 1, position: "relative" }}>
                                <img src={c1.img} alt={c1.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
                                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${bg1.replace("0.06", "1")} 0%, transparent 55%)` }} />
                            </div>
                        </div>

                        {/* Card 2: square, image top, text bottom */}
                        <div style={{
                            background: bg2, border: `1px solid rgba(${hexToRgb(c2.color)},0.18)`,
                            borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column",
                        }}>
                            <div style={{ position: "relative", flex: 1, minHeight: 140 }}>
                                <img src={c2.img} alt={c2.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.78 }} />
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: `linear-gradient(to bottom, transparent, rgba(5,8,16,0.97))` }} />
                            </div>
                            <div style={{ padding: "0 20px 22px" }}>
                                <div style={{ width: 24, height: 2, background: c2.color, borderRadius: 1, marginBottom: 10 }} />
                                <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 7 }}>{c2.title}</div>
                                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{c2.body}</div>
                            </div>
                        </div>

                        {/* Card 3: square, image top, text bottom */}
                        <div style={{
                            background: bg3, border: `1px solid rgba(${hexToRgb(c3.color)},0.18)`,
                            borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column",
                        }}>
                            <div style={{ position: "relative", flex: 1, minHeight: 140 }}>
                                <img src={c3.img} alt={c3.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.78 }} />
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: `linear-gradient(to bottom, transparent, rgba(5,8,16,0.97))` }} />
                            </div>
                            <div style={{ padding: "0 20px 22px" }}>
                                <div style={{ width: 24, height: 2, background: c3.color, borderRadius: 1, marginBottom: 10 }} />
                                <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 7 }}>{c3.title}</div>
                                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{c3.body}</div>
                            </div>
                        </div>

                        {/* Card 4: wide (2 cols), image left, text right */}
                        <div style={{
                            gridColumn: "2 / 4", minHeight: 260,
                            background: bg4, border: `1px solid rgba(${hexToRgb(c4.color)},0.18)`,
                            borderRadius: 18, overflow: "hidden", display: "flex", alignItems: "stretch",
                        }}>
                            <div style={{ flex: 1, position: "relative" }}>
                                <img src={c4.img} alt={c4.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
                                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to left, ${bg4.replace("0.06", "1")} 0%, transparent 55%)` }} />
                            </div>
                            <div style={{ flex: "0 0 50%", padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
                                <div style={{ width: 32, height: 2, background: c4.color, borderRadius: 1, marginBottom: 14 }} />
                                <div style={{ fontWeight: 900, fontSize: 19, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>{c4.title}</div>
                                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: c4.link ? 18 : 0 }}>{c4.body}</div>
                                {c4.link && (
                                    <a href={c4.link.href} style={{ textDecoration: "none", fontSize: 12, fontWeight: 700, color: c4.color, display: "flex", alignItems: "center", gap: 5 }}>
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

function StepsSection({ steps, primaryColor }: { steps: StepItem[]; primaryColor: string }) {
    const { t } = useLanguage();
    return (
        <section style={{ background: "#000", padding: "80px 24px" }}>
            <div style={{ maxWidth: 860, margin: "0 auto" }}>
                <SectionLabel color={primaryColor} text={t.common.stepByStep} />
                <h2 style={headingStyle}>{t.common.howItWorks}</h2>
                <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 0 }}>
                    {steps.map((s, i) => (
                        <div key={s.n} style={{ display: "flex", gap: 0 }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 24, flexShrink: 0 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: "50%",
                                    background: `rgba(${hexToRgb(s.color)},0.1)`,
                                    border: `2px solid ${s.color}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: "monospace", fontWeight: 900, fontSize: 12, color: s.color,
                                }}>{s.n}</div>
                                {i < steps.length - 1 && (
                                    <div style={{ width: 1, flex: 1, background: `linear-gradient(to bottom, ${s.color}40, transparent)`, minHeight: 32, margin: "6px 0" }} />
                                )}
                            </div>
                            <div style={{ paddingBottom: 36 }}>
                                <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 7 }}>{s.title}</div>
                                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.58)", lineHeight: 1.7, marginBottom: 10 }}>{s.desc}</div>
                                <div style={{
                                    background: `rgba(${hexToRgb(s.color)},0.06)`,
                                    border: `1px solid rgba(${hexToRgb(s.color)},0.18)`,
                                    borderRadius: 8, padding: "9px 14px",
                                    fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, fontFamily: "monospace",
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

function TechNoteSection({ techNote, primaryColor }: { techNote: NonNullable<FeatureBentoPageProps["techNote"]>; primaryColor: string }) {
    return (
        <section style={{ background: "#030508", padding: "56px 24px" }}>
            <div style={{ maxWidth: 860, margin: "0 auto" }}>
                <div style={{
                    border: `1px solid rgba(${hexToRgb(primaryColor)},0.22)`,
                    borderRadius: 14,
                    background: `rgba(${hexToRgb(primaryColor)},0.04)`,
                    padding: "28px 32px",
                }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: primaryColor, textTransform: "uppercase", marginBottom: 16 }}>{techNote.label}</div>
                    {techNote.lines.map((line, i) => (
                        <div key={i} style={{
                            fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,0.55)",
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
            background: `linear-gradient(135deg, rgba(${hexToRgb(primaryColor)},0.07), rgba(${hexToRgb(secondaryColor)},0.05))`,
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
                    borderRadius: 12, fontWeight: 800, fontSize: 14, color: "#fff",
                }}>{cta.button}</a>
            </div>
        </section>
    );
}

/* ─── Related Links strip (optional) ────────────────────────────────── */

function RelatedLinksSection({ links }: { links: RelatedLink[] }) {
    return (
        <section style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 16, flexWrap: "wrap" as const }}>
                {links.map(l => (
                    <a key={l.label} href={l.href} style={{
                        textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 18px",
                        background: `rgba(${hexToRgb(l.color)},0.06)`,
                        border: `1px solid rgba(${hexToRgb(l.color)},0.2)`,
                        borderRadius: 10,
                        fontSize: 13, fontWeight: 600, color: l.color,
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
        <div style={{ background: "#000", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#fff" }}>
            <SharedNavBar />
            <HeroSection
                badge={props.badge}
                heroTitle={props.heroTitle}
                heroHighlight={props.heroHighlight}
                heroSubtitle={props.heroSubtitle}
                primaryColor={props.primaryColor}
                secondaryColor={props.secondaryColor}
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
