import { useEffect, useState } from "react";
import SharedNavBar from "@/components/SharedNavBar";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

type SR1 = typeof translations.en.sepoliaRecord.v1;

const FACTORY_V1 = "0xd05F4fb3f24C7bF0cb482123186CF797E42CF17A";
const IMPL_V1    = "0x5E398e1E0Ba28f9659013B1212f24b8B43d69393";
const TX_DEPLOY  = "0xf240a2beec5303a6d83fdd8abfc585b608bb51bacb6185d11564cd98e4a4aeb5";
const ETHERSCAN  = "https://sepolia.etherscan.io";
const PASS       = "#22C55E";
const W          = 1200;
const GITHUB_TEST = "https://github.com/Qryptumorg/contracts/blob/main/test/QryptSafeV1.test.js";

// On-chain live test data (Test Wallet A, Sepolia)
const WALLET_A       = "0x2459A9B3D481Bb02e6844Cf28314b2c3eaC431e4";
const VAULT_A        = "0x184765A9f694F4bb311c3886c4495ac824D204B2";
const TX_CREATE_VAULT = "0x62b94b8b0547fb3ccd5eb036ad1194a2a947f663cf72a39602c7983adee4ae2c";
const TX_SHIELD      = "0x75cfdeba7c9f2461ba216c1e9acf9ad10f234d7e65596e5dee8c3b6cca956526";
const TX_UNSHIELD    = "0x1b20536e007968d0e0e6b47c7a245cb9d2c29e998544b471104ce695bf1b0792";

const LIVE_TXS = [
    { label: "createVault()", detail: "Deploy proxy vault for Wallet A", tx: TX_CREATE_VAULT, status: "PASS" },
    { label: "shield(USDC, 1e6, password)", detail: "Shield 1 USDC — confirms 18-dec qToken bug", tx: TX_SHIELD, status: "PASS" },
    { label: "unshield(USDC, 1e6, password)", detail: "Unshield 1 USDC back to Wallet A", tx: TX_UNSHIELD, status: "PASS" },
];

const short = (v: string, h = 8, t = 6) => `${v.slice(0, h)}...${v.slice(-t)}`;

/* ── Shared UI ──────────────────────────────────────────────────── */
function CopySpan({ value, display }: { value: string; display?: string }) {
    const [ok, setOk] = useState(false);
    return (
        <span
            onClick={() => { navigator.clipboard.writeText(value).then(() => { setOk(true); setTimeout(() => setOk(false), 1600); }); }}
            title="Click to copy"
            style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 6, padding: "3px 9px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {display ?? value}
            {ok
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={PASS} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>}
        </span>
    );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer"
            style={{ color: "#627EEA", fontSize: 12, fontFamily: "'Inter',sans-serif", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}>
            {children}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
        </a>
    );
}

function AddrRow({ label, value, link, verified }: { label: string; value: string; link: string; verified?: boolean }) {
    return (
        <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{label}</span>
                {verified && (
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: PASS, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 4, padding: "1px 6px" }}>VERIFIED MIT</span>
                )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <CopySpan value={value} display={short(value)} />
                <ExtLink href={link}>Etherscan</ExtLink>
            </div>
        </div>
    );
}

function TxRow({ label, hash }: { label: string; hash: string }) {
    return (
        <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{label}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <CopySpan value={hash} display={short(hash, 12, 6)} />
                <ExtLink href={`${ETHERSCAN}/tx/${hash}`}>Etherscan</ExtLink>
            </div>
        </div>
    );
}

function SectionHead({ text, color = PASS }: { text: string; color?: string }) {
    return (
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color, marginBottom: 12, paddingTop: 6 }}>{text}</div>
    );
}

interface TestRowProps { n: number; title: string; desc: string; isMobile: boolean }
function TestRow({ n, title, desc, isMobile }: TestRowProps) {
    return (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: isMobile ? "14px 0" : "16px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={PASS} strokeWidth="2.8"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em" }}>{String(n).padStart(2, "0")}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{title}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: PASS, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 4, padding: "2px 6px" }}>PASS</span>
                </div>
                <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.6 }}>{desc}</p>
            </div>
        </div>
    );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function SepoliaVerifiedV1Page() {
    const { t } = useLanguage();
    const sr = (t.sepoliaRecord as typeof translations.en.sepoliaRecord).v1 as SR1;

    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 900 : false);
    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    const pad = isMobile ? "0 18px" : "0 40px";
    const card = (extra?: React.CSSProperties): React.CSSProperties => ({
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        ...extra,
    });

    return (
        <div style={{ minHeight: "100vh", background: "#000000", color: "#fff" }}>
            <SharedNavBar />

            {/* ═══ HERO ══════════════════════════════════════════════ */}
            <div style={{ position: "relative", overflow: "hidden" }}>
                {/* bg image */}
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <img
                        src="/images/v1-hero-bg.png"
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", filter: "brightness(0.35) saturate(1.2)" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.6) 70%, #000 100%)" }} />
                </div>

                <div style={{ position: "relative", zIndex: 1, maxWidth: W, margin: "0 auto", padding: pad }}>
                    <div style={{ padding: isMobile ? "100px 0 40px" : "110px 0 56px" }}>
                        <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 380px", gap: 56, alignItems: "center" }}>
                            {/* Left */}
                            <div>
                                {/* Badge */}
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 20, padding: "4px 14px 4px 9px", marginBottom: 22 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444" }} />
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#EF4444", textTransform: "uppercase" }}>{sr.heroBadge}</span>
                                </div>

                                <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: isMobile ? 36 : 56, letterSpacing: "-0.03em", lineHeight: 1.04, margin: "0 0 20px", color: "#fff" }}>
                                    {sr.heroTitle}
                                </h1>

                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: isMobile ? 14 : 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: "0 0 32px", maxWidth: 540 }}>
                                    {sr.heroBody}
                                </p>

                                {/* Stat boxes */}
                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                    {[
                                        { val: "12 / 12", label: sr.statLabels[0], color: PASS },
                                        { val: "EIP-1167", label: sr.statLabels[1], color: "rgba(255,255,255,0.6)" },
                                        { val: "Ownable", label: sr.statLabels[2], color: "#EF4444" },
                                        { val: "MIT", label: sr.statLabels[3], color: "#06B6D4" },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${s.color}28`, borderRadius: 12, padding: "12px 18px", textAlign: "center", minWidth: 100 }}>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", color: s.color }}>{s.val}</div>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right image */}
                            {!isMobile && (
                                <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>
                                    <img src="/images/v1-hero-right.png" alt="V1 EIP-1167 clone visualization" style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ CONTENT ════════════════════════════════════════════ */}
            <div style={{ maxWidth: W, margin: "0 auto", padding: pad }}>

                {/* ── What V1 introduced ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20, borderColor: `${PASS}22` }) }}>
                    <SectionHead text={sr.introLabel} color={PASS} />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 8px", color: "#fff" }}>{sr.introHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 28px", lineHeight: 1.65 }}>{sr.introBody}</p>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {sr.introItems.map((item, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${i < 2 ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.1)"}`, borderRadius: 14, padding: "18px 20px", marginBottom: isMobile ? 12 : 0 }}>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: i < 2 ? "#EF4444" : PASS, marginBottom: 8, letterSpacing: "-0.01em" }}>{item.label}</div>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Contract addresses ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <SectionHead text={sr.addrLabel} color={PASS} />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 24px", color: "#fff" }}>{sr.addrHeading}</h2>
                    <AddrRow label={sr.addrLabels.factory} value={FACTORY_V1} link={`${ETHERSCAN}/address/${FACTORY_V1}#code`} verified />
                    <AddrRow label={sr.addrLabels.impl} value={IMPL_V1} link={`${ETHERSCAN}/address/${IMPL_V1}#code`} verified />
                    <TxRow label={sr.addrLabels.deployTx} hash={TX_DEPLOY} />
                </div>

                {/* ── 18-decimal bug ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20, borderColor: "rgba(239,68,68,0.18)" }) }}>
                    <SectionHead text={sr.bugLabel} color="#EF4444" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 8px", color: "#fff" }}>{sr.bugHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 18px", lineHeight: 1.65 }}>{sr.bugBody}</p>
                    <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.14)", borderRadius: 10, padding: "14px 18px" }}>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.7 }}>{sr.bugExample}</span>
                    </div>
                </div>

                {/* ── Tests ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 4 }}>
                        <SectionHead text={sr.testResultsLabel} color={PASS} />
                        <a
                            href={GITHUB_TEST}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: "#627EEA", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid rgba(98,126,234,0.22)", borderRadius: 8, padding: "5px 12px" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(98,126,234,0.5)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(98,126,234,0.22)"; }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                            {sr.testFileLink}
                        </a>
                    </div>
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.testResultsHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "0 0 24px", lineHeight: 1.6 }}>{sr.testResultsBody}</p>

                    <div>
                        {sr.tests.map((test, i) => (
                            <TestRow key={i} n={i + 1} title={test.title} desc={test.desc} isMobile={isMobile} />
                        ))}
                    </div>
                </div>

                {/* ── Live On-chain Tests ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: PASS, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 6, padding: "4px 10px" }}>LIVE ON-CHAIN</span>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Sepolia Testnet</span>
                        <a href={`${ETHERSCAN}/address/${WALLET_A}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "#627EEA", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid rgba(98,126,234,0.2)", borderRadius: 7, padding: "4px 10px" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                            Test Wallet A
                        </a>
                    </div>

                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", margin: "0 0 4px", color: "#fff" }}>
                        3 / 3 live transactions verified
                    </h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "0 0 22px", lineHeight: 1.6 }}>
                        Executed on Sepolia with Test Wallet A. Each TX is publicly verifiable on Etherscan.
                    </p>

                    {/* Addresses */}
                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 22 }}>
                        {[
                            { label: "Test Wallet A", addr: WALLET_A, link: `${ETHERSCAN}/address/${WALLET_A}` },
                            { label: "Vault (proxy)", addr: VAULT_A, link: `${ETHERSCAN}/address/${VAULT_A}` },
                        ].map(({ label, addr, link }) => (
                            <div key={addr} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>{label}</div>
                                    <CopySpan value={addr} display={short(addr, 10, 8)} />
                                </div>
                                <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#627EEA", textDecoration: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 3 }}>
                                    Etherscan
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* TX rows */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {LIVE_TXS.map((row, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.10)", borderRadius: 10, padding: isMobile ? "14px 14px" : "14px 20px", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 800, color: PASS, background: "rgba(34,197,94,0.1)", borderRadius: 5, padding: "3px 8px", whiteSpace: "nowrap" }}>PASS</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 2 }}>{row.label}</div>
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>{row.detail}</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                    <CopySpan value={row.tx} display={short(row.tx, 10, 6)} />
                                    <a href={`${ETHERSCAN}/tx/${row.tx}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "#627EEA", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3, border: "1px solid rgba(98,126,234,0.2)", borderRadius: 7, padding: "4px 10px", whiteSpace: "nowrap" }}>
                                        Etherscan
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Navigation to V2 ── */}
                <div style={{ ...card({ padding: isMobile ? "22px 18px" : "26px 32px", marginBottom: 60, borderColor: "rgba(255,255,255,0.06)" }), display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 4 }}>
                            Next Record
                        </div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                            QryptSafe V2: Decimal precision fix
                        </div>
                    </div>
                    <a
                        href="/sepolia-verified"
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", textDecoration: "none", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, padding: "10px 20px" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.11)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)"; }}
                    >
                        V2 Record
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
