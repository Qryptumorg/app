import { useEffect } from "react";
import SharedNavBar from "../components/SharedNavBar";
import { useLanguage } from "@/lib/LanguageContext";

type TermsSection = {
    title: string;
    body?: readonly string[];
    intro?: string;
    bullets?: readonly string[];
    post?: readonly string[];
    contact?: string;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.75rem",
                letterSpacing: "-0.01em",
            }}>{title}</h2>
            <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.55)",
            }}>{children}</div>
        </section>
    );
}

function P({ children }: { children: React.ReactNode }) {
    return <p style={{ marginBottom: "0.75rem" }}>{children}</p>;
}

export default function TermsPage() {
    const { t } = useLanguage();
    const L = t.terms;

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Terms of Service - Qryptum";
    }, []);

    const sections = L.sections as unknown as TermsSection[];

    return (
        <div style={{ background: "#000", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#fff" }}>
            <SharedNavBar />

            <main style={{
                maxWidth: 820,
                margin: "0 auto",
                padding: "80px 32px 96px",
            }}>
                <div style={{ marginBottom: "3rem" }}>
                    <p style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.28)",
                        marginBottom: "0.75rem",
                    }}>{L.eyebrow}</p>
                    <h1 style={{
                        fontSize: 40,
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                        color: "#fff",
                        marginBottom: "0.5rem",
                    }}>{L.title}</h1>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>{L.lastUpdated}</p>
                </div>

                <div style={{
                    height: 1,
                    background: "rgba(255,255,255,0.07)",
                    marginBottom: "2.5rem",
                }} />

                {sections.map((section, idx) => (
                    <Section key={idx} title={section.title}>
                        {section.body?.map((p, i) => <P key={i}>{p}</P>)}
                        {section.intro && <P>{section.intro}</P>}
                        {section.bullets && (
                            <ul style={{ paddingLeft: "1.25rem", marginBottom: "0.75rem" }}>
                                {section.bullets.map((item, i) => (
                                    <li key={i} style={{ marginBottom: "0.4rem" }}>{item}</li>
                                ))}
                            </ul>
                        )}
                        {section.post?.map((p, i) => <P key={i}>{p}</P>)}
                        {section.contact && (
                            <P>
                                {section.contact}{" "}
                                <a
                                    href="mailto:contact@qryptum.org"
                                    style={{ color: "rgba(255,255,255,0.7)", textDecoration: "underline" }}
                                >
                                    contact@qryptum.org
                                </a>.
                            </P>
                        )}
                    </Section>
                ))}
            </main>

            <footer style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "28px 32px",
                textAlign: "center",
            }}>
                <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 0, marginBottom: 10 }}>
                    <img src="/qryptum-logo.png" alt="Qryptum" style={{ height: 22, width: 22, objectFit: "contain" }} />
                    <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em", marginLeft: -4 }}>QRYPTUM</span>
                </a>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>{L.footerText}</div>
            </footer>
        </div>
    );
}
