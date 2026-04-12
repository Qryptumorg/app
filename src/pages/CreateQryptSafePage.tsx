import { useEffect, useState } from "react";
import SharedNavBar from "../components/SharedNavBar";
import { useLanguage } from "@/lib/LanguageContext";

function useIsMobile() {
    const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
    useEffect(() => {
        const h = () => setM(window.innerWidth < 768);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);
    return m;
}

const CYAN = "#06b6d4";
const PURPLE = "#7c3aed";
const GREEN = "#10b981";

function HeroSection() {
    const { t } = useLanguage();
    const p = t.createQryptSafe;
    const STAT_VALUES = ["~$1.20", "1 tx", "Zero", "Any ERC-20"];
    return (
        <section style={{
            position: "relative",
            minHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            paddingTop: 60,
        }}>
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "url(/images/create-qrypt-safe-hero.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.35,
            }} />
            <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 70%, #000 100%)",
            }} />
            <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px", maxWidth: 900 }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(6,182,212,0.1)",
                    border: "1px solid rgba(6,182,212,0.3)",
                    borderRadius: 20, padding: "4px 14px",
                    marginBottom: 28,
                }}>
                    <ShieldIcon color={CYAN} size={13} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: CYAN, textTransform: "uppercase" }}>{p.hero.badge}</span>
                </div>
                <h1 style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "clamp(36px, 6vw, 72px)",
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1.05,
                    letterSpacing: "-0.03em",
                    marginBottom: 20,
                }}>
                    {p.hero.headline}<br />
                    <span style={{ color: CYAN }}>
                        {p.hero.highlight}
                    </span>
                </h1>
                <p style={{
                    fontSize: "clamp(15px, 2vw, 18px)",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.65,
                    maxWidth: 600,
                    margin: "0 auto 40px",
                }}>
                    {p.hero.body}
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <a href="/app" style={{
                        textDecoration: "none",
                        padding: "13px 32px",
                        background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
                        borderRadius: 10,
                        fontWeight: 700, fontSize: 14,
                        color: "#fff",
                    }}>{p.hero.btn1}</a>
                    <a href="/docs/introduction/how-it-works" style={{
                        textDecoration: "none",
                        padding: "13px 32px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 10,
                        fontWeight: 700, fontSize: 14,
                        color: "#fff",
                    }}>{p.hero.btn2}</a>
                </div>
            </div>

            <div style={{
                position: "relative", zIndex: 1,
                display: "flex", gap: 40, marginTop: 64,
                flexWrap: "wrap", justifyContent: "center",
                padding: "0 24px",
            }}>
                {p.hero.stats.map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{STAT_VALUES[i]}</div>
                        <div style={{ fontSize: 12, color: CYAN, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.note}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function WhatSection() {
    const { t } = useLanguage();
    const p = t.createQryptSafe;
    const isMobile = useIsMobile();
    return (
        <section style={{ background: "#050810", padding: isMobile ? "64px 16px" : "96px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                <SectionLabel color={CYAN} text={p.what.sectionLabel} />
                <h2 style={headingStyle}>{p.what.heading}</h2>
                <p style={subStyle}>{p.what.body}</p>

                {isMobile ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 36 }}>
                        {[
                            { img: "/images/card-smart-contract.jpg", color: CYAN, bg: "#0a0f1e", title: p.what.card1.title, body: p.what.card1.body, link: { href: "/docs/introduction/overview", text: p.what.card1.link } },
                            { img: "/images/card-dual-factor.jpg", color: PURPLE, bg: "#080b14", title: p.what.card2.title, body: p.what.card2.body },
                            { img: "/images/card-on-chain.jpg", color: GREEN, bg: "#060c10", title: p.what.card3.title, body: p.what.card3.body },
                            { img: "/images/card-non-custodial.jpg", color: "#f59e0b", bg: "#100a04", title: p.what.card4.title, body: p.what.card4.body, link: { href: "/docs/introduction/overview", text: p.what.card4.link } },
                        ].map((card, i) => (
                            <div key={i} style={{ borderRadius: 16, overflow: "hidden", border: `1px solid rgba(${hexToRgb(card.color)},0.18)`, background: card.bg }}>
                                <div style={{ position: "relative", height: 180 }}>
                                    <img src={card.img} alt={card.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.78 }} />
                                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: `linear-gradient(to bottom, transparent, ${card.bg})` }} />
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
                        ))}
                    </div>
                ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 52 }}>

                    {/* Wide card: text left, image right */}
                    <div style={{
                        gridColumn: "1 / 3",
                        position: "relative", minHeight: 240,
                        background: "linear-gradient(135deg, #0a0f1e 0%, #060c18 100%)",
                        border: `1px solid rgba(${hexToRgb(CYAN)},0.18)`,
                        borderRadius: 18, overflow: "hidden",
                        display: "flex", alignItems: "stretch",
                    }}>
                        <div style={{ flex: "0 0 52%", padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
                            <div style={{ width: 32, height: 2, background: CYAN, borderRadius: 1, marginBottom: 14 }} />
                            <div style={{ fontWeight: 900, fontSize: 20, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>{p.what.card1.title}</div>
                            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 20 }}>
                                {p.what.card1.body}
                            </div>
                            <a href="/docs/introduction/overview" style={{ textDecoration: "none", fontSize: 12, fontWeight: 700, color: CYAN, display: "flex", alignItems: "center", gap: 5 }}>
                                {p.what.card1.link} <span style={{ fontSize: 14 }}>→</span>
                            </a>
                        </div>
                        <div style={{ flex: 1, position: "relative" }}>
                            <img src="/images/card-smart-contract.jpg" alt="Smart Contract" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0a0f1e 0%, transparent 50%)" }} />
                        </div>
                    </div>

                    {/* Square card: image top, text bottom */}
                    <div style={{
                        position: "relative",
                        background: "#080b14",
                        border: `1px solid rgba(${hexToRgb(PURPLE)},0.18)`,
                        borderRadius: 18, overflow: "hidden",
                        display: "flex", flexDirection: "column",
                    }}>
                        <div style={{ position: "relative", flex: 1, minHeight: 150 }}>
                            <img src="/images/card-dual-factor.jpg" alt="Dual Factor" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to bottom, transparent, #080b14)" }} />
                        </div>
                        <div style={{ padding: "0 22px 24px" }}>
                            <div style={{ width: 24, height: 2, background: PURPLE, borderRadius: 1, marginBottom: 10 }} />
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 8 }}>{p.what.card2.title}</div>
                            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{p.what.card2.body}</div>
                        </div>
                    </div>

                    {/* Square card: image top, text bottom */}
                    <div style={{
                        position: "relative",
                        background: "#060c10",
                        border: `1px solid rgba(${hexToRgb(GREEN)},0.18)`,
                        borderRadius: 18, overflow: "hidden",
                        display: "flex", flexDirection: "column",
                    }}>
                        <div style={{ position: "relative", flex: 1, minHeight: 150 }}>
                            <img src="/images/card-on-chain.jpg" alt="On Chain" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to bottom, transparent, #060c10)" }} />
                        </div>
                        <div style={{ padding: "0 22px 24px" }}>
                            <div style={{ width: 24, height: 2, background: GREEN, borderRadius: 1, marginBottom: 10 }} />
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 8 }}>{p.what.card3.title}</div>
                            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{p.what.card3.body}</div>
                        </div>
                    </div>

                    {/* Wide card: image left, text right */}
                    <div style={{
                        gridColumn: "2 / 4",
                        position: "relative", minHeight: 240,
                        background: "linear-gradient(135deg, #100a04 0%, #0c0804 100%)",
                        border: `1px solid rgba(245,158,11,0.18)`,
                        borderRadius: 18, overflow: "hidden",
                        display: "flex", alignItems: "stretch",
                    }}>
                        <div style={{ flex: 1, position: "relative" }}>
                            <img src="/images/card-non-custodial.jpg" alt="Non-Custodial" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, #100a04 0%, transparent 50%)" }} />
                        </div>
                        <div style={{ flex: "0 0 52%", padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
                            <div style={{ width: 32, height: 2, background: "#f59e0b", borderRadius: 1, marginBottom: 14 }} />
                            <div style={{ fontWeight: 900, fontSize: 20, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>{p.what.card4.title}</div>
                            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 20 }}>
                                {p.what.card4.body}
                            </div>
                            <a href="/docs/introduction/overview" style={{ textDecoration: "none", fontSize: 12, fontWeight: 700, color: "#f59e0b", display: "flex", alignItems: "center", gap: 5 }}>
                                {p.what.card4.link} <span style={{ fontSize: 14 }}>→</span>
                            </a>
                        </div>
                    </div>

                </div>
                )}
            </div>
        </section>
    );
}

function DeploySection() {
    const { t } = useLanguage();
    const p = t.createQryptSafe;
    const STEP_COLORS = [CYAN, PURPLE, GREEN, "#f59e0b"];
    const STEP_NUMS = ["01", "02", "03", "04"];
    const STEP_DETAILS = [
        "The onlyOwner modifier in PersonalVault.sol is bound to msg.sender at deployment. This is immutable.",
        "Only the keccak256 hash of your vault proof is stored on-chain. The plaintext is never exposed or logged.",
        "Gas used: ~150,000 gas (~$0.45 at 0.5 gwei). The vault address is deterministic and unique per wallet.",
        "The vault address appears in the app dashboard. You can verify the contract on Etherscan anytime.",
    ];

    return (
        <section style={{ background: "#000", padding: "96px 24px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <SectionLabel color={PURPLE} text={p.deploy.sectionLabel} />
                <h2 style={headingStyle}>{p.deploy.heading}</h2>
                <p style={subStyle}>{p.deploy.body}</p>

                <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 0 }}>
                    {p.deploy.steps.map((s, i) => {
                        const color = STEP_COLORS[i];
                        return (
                        <div key={i} style={{ display: "flex", gap: 0, position: "relative" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 28, flexShrink: 0 }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: "50%",
                                    background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                                    border: `2px solid ${color}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: "monospace", fontWeight: 900, fontSize: 13, color: color,
                                    flexShrink: 0,
                                }}>{STEP_NUMS[i]}</div>
                                {i < p.deploy.steps.length - 1 && (
                                    <div style={{ width: 1, flex: 1, background: `linear-gradient(to bottom, ${color}40, transparent)`, minHeight: 40, margin: "8px 0" }} />
                                )}
                            </div>
                            <div style={{ paddingBottom: 40 }}>
                                <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 8 }}>{s.title}</div>
                                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 12 }}>{s.desc}</div>
                                <div style={{
                                    background: `rgba(${hexToRgb(color)}, 0.06)`,
                                    border: `1px solid rgba(${hexToRgb(color)}, 0.2)`,
                                    borderRadius: 8, padding: "10px 14px",
                                    fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.6,
                                    fontFamily: "monospace",
                                }}>{STEP_DETAILS[i]}</div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function TechSection() {
    const { t } = useLanguage();
    const p = t.createQryptSafe;
    const SPEC_VALUES = ["EIP-1167 Minimal Proxy", "OpenZeppelin v5", "keccak256 (SHA-3)", "1,000,000 token units", "600 seconds (10 min)", "83/83 tests passing"];
    const SPEC_COLORS = [CYAN, PURPLE, GREEN, "#f59e0b", CYAN, GREEN];
    return (
        <section style={{ background: "#060a12", padding: "96px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                <SectionLabel color={CYAN} text={p.tech.sectionLabel} />
                <h2 style={headingStyle}>{p.tech.heading}</h2>
                <p style={subStyle}>{p.tech.body}</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginTop: 52 }}>
                    <div style={codeCardStyle}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: CYAN, letterSpacing: "0.08em", marginBottom: 14 }}>SHIELDFACTORY.SOL</div>
                        <pre style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{`// EIP-1167 minimal proxy deploy
function deployVault(
    bytes32 passwordHash
) external returns (address vault) {
    vault = implementation.clone();
    IPersonalVault(vault).initialize(
        msg.sender,
        passwordHash
    );
    vaults[msg.sender] = vault;
    emit VaultDeployed(msg.sender, vault);
}`}</pre>
                    </div>

                    <div style={codeCardStyle}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.08em", marginBottom: 14 }}>PERSONALVAULT.SOL</div>
                        <pre style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{`// Dual-factor authentication
modifier onlyOwner() {
    require(msg.sender == owner, "Not vault owner");
    _;
}

function shield(
    address token,
    uint256 amount,
    string calldata password
) external onlyOwner nonReentrant {
    // Verify vault proof first
    require(
        keccak256(abi.encodePacked(password))
        == passwordHash,
        "Invalid vault proof"
    );
    // ... shield logic
}`}</pre>
                    </div>
                </div>

                <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    {p.tech.specs.map((m, i) => (
                        <div key={i} style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 10, padding: "14px 16px",
                        }}>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{m.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: SPEC_COLORS[i] }}>{SPEC_VALUES[i]}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ImageCard({ img, accentColor, label, title, body }: { img: string; accentColor: string; label: string; title: string; body: string }) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "58%", background: "#080b12" }}>
                <img src={img} alt={title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to bottom, transparent, rgba(8,11,18,0.97))" }} />
            </div>
            <div style={{ padding: "18px 20px 22px", flex: 1 }}>
                <div style={{ display: "inline-block", width: 28, height: 2, background: accentColor, borderRadius: 1, marginBottom: 10 }} />
                <div style={{ fontSize: 10, fontWeight: 800, color: accentColor, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 8, lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{body}</div>
            </div>
        </div>
    );
}

function SecuritySection() {
    const { t } = useLanguage();
    const p = t.createQryptSafe;
    const isMobile = useIsMobile();
    return (
        <section style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(6,182,212,0.03) 100%)",
            borderTop: "1px solid rgba(124,58,237,0.12)",
            borderBottom: "1px solid rgba(6,182,212,0.08)",
            padding: isMobile ? "64px 16px" : "96px 24px",
        }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                <SectionLabel color={PURPLE} text={p.security.sectionLabel} />
                <h2 style={headingStyle}>{p.security.heading}</h2>
                <p style={subStyle}>
                    {p.security.body}
                </p>

                {isMobile ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 36, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
                        <ImageCard img="/images/card-sec-private-key.jpg" accentColor="#f59e0b" label={p.security.factor1.label} title={p.security.factor1.title} body={p.security.factor1.body} />
                        <div style={{ textAlign: "center", fontSize: 24, color: "rgba(255,255,255,0.15)", fontWeight: 200, padding: "4px 0" }}>+</div>
                        <ImageCard img="/images/card-sec-vault-proof.jpg" accentColor={CYAN} label={p.security.factor2.label} title={p.security.factor2.title} body={p.security.factor2.body} />
                    </div>
                ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 0, alignItems: "center", marginTop: 52, maxWidth: 860, margin: "52px auto 0" }}>
                    <ImageCard
                        img="/images/card-sec-private-key.jpg"
                        accentColor="#f59e0b"
                        label={p.security.factor1.label}
                        title={p.security.factor1.title}
                        body={p.security.factor1.body}
                    />
                    <div style={{ textAlign: "center", fontSize: 28, color: "rgba(255,255,255,0.15)", fontWeight: 200 }}>+</div>
                    <ImageCard
                        img="/images/card-sec-vault-proof.jpg"
                        accentColor={CYAN}
                        label={p.security.factor2.label}
                        title={p.security.factor2.title}
                        body={p.security.factor2.body}
                    />
                </div>
                )}

                <div style={{ marginTop: 20, maxWidth: 860, margin: "20px auto 0" }}>
                    <div style={{
                        background: "rgba(16,185,129,0.07)",
                        border: "1px solid rgba(16,185,129,0.18)",
                        borderRadius: 14, padding: "20px 24px",
                        display: "flex", gap: 14, alignItems: "flex-start",
                    }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <span style={{ color: GREEN, fontSize: 11, fontWeight: 900 }}>+</span>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: GREEN, marginBottom: 6 }}>{p.security.combined.title}</div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                                {p.security.combined.body}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 48 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>{p.security.attacksLabel}</div>

                    {isMobile ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {[
                                { img: "/images/card-sec-key-stolen.jpg", color: "#f59e0b", bg: "#10080a", title: p.security.attack1.title, body: p.security.attack1.body },
                                { img: "/images/card-sec-brute-force.jpg", color: PURPLE, bg: "#080510", title: p.security.attack2.title, body: p.security.attack2.body },
                                { img: "/images/card-sec-frontrun.jpg", color: CYAN, bg: "#040c0e", title: p.security.attack3.title, body: p.security.attack3.body },
                                { img: "/images/card-sec-reentrancy.jpg", color: GREEN, bg: "#050e08", title: p.security.attack4.title, body: p.security.attack4.body },
                            ].map((atk, i) => (
                                <div key={i} style={{ borderRadius: 14, overflow: "hidden", border: `1px solid rgba(${hexToRgb(atk.color)},0.15)`, background: atk.bg }}>
                                    <div style={{ position: "relative", height: 140 }}>
                                        <img src={atk.img} alt={atk.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
                                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: `linear-gradient(to bottom, transparent, ${atk.bg})` }} />
                                        <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800, color: GREEN, letterSpacing: "0.08em" }}>{p.security.blockedBadge}</div>
                                    </div>
                                    <div style={{ padding: "14px 18px 18px" }}>
                                        <div style={{ width: 24, height: 2, background: atk.color, borderRadius: 1, marginBottom: 10 }} />
                                        <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 6 }}>{atk.title}</div>
                                        <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.48)", lineHeight: 1.65 }}>{atk.body}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>

                        {/* Wide: image right, text left */}
                        <div style={{
                            gridColumn: "1 / 3", minHeight: 200,
                            background: "linear-gradient(135deg, #10080a, #080508)",
                            border: "1px solid rgba(245,158,11,0.15)",
                            borderRadius: 16, overflow: "hidden",
                            display: "flex", alignItems: "stretch",
                        }}>
                            <div style={{ flex: "0 0 55%", padding: "28px 28px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                                    <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800, color: GREEN, letterSpacing: "0.08em" }}>{p.security.blockedBadge}</div>
                                </div>
                                <div style={{ width: 28, height: 2, background: "#f59e0b", borderRadius: 1, marginBottom: 12 }} />
                                <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 10 }}>{p.security.attack1.title}</div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{p.security.attack1.body}</div>
                            </div>
                            <div style={{ flex: 1, position: "relative" }}>
                                <img src="/images/card-sec-key-stolen.jpg" alt="Key Stolen" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #10080a 0%, transparent 60%)" }} />
                            </div>
                        </div>

                        {/* Square: image top, text bottom */}
                        <div style={{
                            background: "#080510",
                            border: "1px solid rgba(124,58,237,0.15)",
                            borderRadius: 16, overflow: "hidden",
                            display: "flex", flexDirection: "column",
                        }}>
                            <div style={{ position: "relative", flex: 1, minHeight: 110 }}>
                                <img src="/images/card-sec-brute-force.jpg" alt="Brute Force" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "65%", background: "linear-gradient(to bottom, transparent, #080510)" }} />
                                <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800, color: GREEN, letterSpacing: "0.08em" }}>{p.security.blockedBadge}</div>
                            </div>
                            <div style={{ padding: "0 18px 20px" }}>
                                <div style={{ width: 20, height: 2, background: PURPLE, borderRadius: 1, marginBottom: 8 }} />
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{p.security.attack2.title}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{p.security.attack2.body}</div>
                            </div>
                        </div>

                        {/* Square: image top, text bottom */}
                        <div style={{
                            background: "#040c0e",
                            border: "1px solid rgba(6,182,212,0.15)",
                            borderRadius: 16, overflow: "hidden",
                            display: "flex", flexDirection: "column",
                        }}>
                            <div style={{ position: "relative", flex: 1, minHeight: 110 }}>
                                <img src="/images/card-sec-frontrun.jpg" alt="Front Run" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "65%", background: "linear-gradient(to bottom, transparent, #040c0e)" }} />
                                <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800, color: GREEN, letterSpacing: "0.08em" }}>{p.security.blockedBadge}</div>
                            </div>
                            <div style={{ padding: "0 18px 20px" }}>
                                <div style={{ width: 20, height: 2, background: CYAN, borderRadius: 1, marginBottom: 8 }} />
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{p.security.attack3.title}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{p.security.attack3.body}</div>
                            </div>
                        </div>

                        {/* Wide: image left, text right */}
                        <div style={{
                            gridColumn: "2 / 4", minHeight: 190,
                            background: "linear-gradient(135deg, #050e08, #040b06)",
                            border: "1px solid rgba(16,185,129,0.15)",
                            borderRadius: 16, overflow: "hidden",
                            display: "flex", alignItems: "stretch",
                        }}>
                            <div style={{ flex: 1, position: "relative" }}>
                                <img src="/images/card-sec-reentrancy.jpg" alt="Reentrancy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, #050e08 0%, transparent 60%)" }} />
                            </div>
                            <div style={{ flex: "0 0 55%", padding: "28px 28px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                                    <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800, color: GREEN, letterSpacing: "0.08em" }}>{p.security.blockedBadge}</div>
                                </div>
                                <div style={{ width: 28, height: 2, background: GREEN, borderRadius: 1, marginBottom: 12 }} />
                                <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 10 }}>{p.security.attack4.title}</div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{p.security.attack4.body}</div>
                            </div>
                        </div>

                    </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function FaqSection() {
    const { t } = useLanguage();
    const p = t.createQryptSafe;

    return (
        <section style={{ background: "#000", padding: "96px 24px" }}>
            <div style={{ maxWidth: 780, margin: "0 auto" }}>
                <SectionLabel color={CYAN} text={p.faq.sectionLabel} />
                <h2 style={headingStyle}>{p.faq.heading}</h2>

                <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 16 }}>
                    {p.faq.items.map(f => (
                        <div key={f.q} style={{
                            background: "rgba(255,255,255,0.025)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 12,
                            padding: "20px 22px",
                        }}>
                            <div style={{ fontWeight: 700, fontSize: 14.5, color: "#fff", marginBottom: 8 }}>{f.q}</div>
                            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{f.a}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CtaSection() {
    const { t } = useLanguage();
    const p = t.createQryptSafe;
    return (
        <section style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(124,58,237,0.08))",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "96px 24px",
            textAlign: "center",
        }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
                <ShieldIcon color={CYAN} size={40} />
                <h2 style={{ ...headingStyle, marginTop: 20, marginBottom: 16 }}>{p.cta.heading}</h2>
                <p style={{ ...subStyle, marginBottom: 36 }}>
                    {p.cta.body}
                </p>
                <a href="/app" style={{
                    display: "inline-block",
                    textDecoration: "none",
                    padding: "15px 40px",
                    background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
                    borderRadius: 12,
                    fontWeight: 800, fontSize: 15,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                }}>{p.cta.button}</a>
                <div style={{ marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                    {p.cta.note}
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer style={{
            background: "#000",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "32px 24px",
            textAlign: "center",
        }}>
            <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 0, marginBottom: 12 }}>
                <img src="/qryptum-logo.png" alt="Qryptum" style={{ height: 24, width: 24, objectFit: "contain" }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "-0.01em", marginLeft: -4 }}>QRYPTUM</span>
            </a>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Non-custodial. Open source. Ethereum L1.</div>
        </footer>
    );
}

export default function CreateQryptSafePage() {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Create Personal Qrypt-Safe - Qryptum";
    }, []);

    return (
        <div style={{ background: "#000", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#fff" }}>
            <SharedNavBar />
            <HeroSection />
            <WhatSection />
            <DeploySection />
            <TechSection />
            <SecuritySection />
            <FaqSection />
            <CtaSection />
            <Footer />
        </div>
    );
}

function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

function SectionLabel({ color, text }: { color: string; text: string }) {
    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            marginBottom: 16,
        }}>
            <div style={{ width: 18, height: 2, background: color, borderRadius: 1 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{text}</span>
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

const codeCardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "24px",
};

function ShieldIcon({ color, size }: { color: string; size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M12 3L4 6v5c0 4.97 3.4 9.12 8 10 4.6-.88 8-5.03 8-10V6l-8-3z" fill={`${color}22`} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

