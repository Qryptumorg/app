import { useEffect, useState } from "react";
import SharedNavBar from "@/components/SharedNavBar";
import SepoliaVersionNav from "@/components/SepoliaVersionNav";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

type SR2 = typeof translations.en.sepoliaRecord.v2;

const FACTORY_V2: string   = "0x26BAb8B6e88201ad4824ea1290a7C9c7b9B10fCf";
const IMPL_V2: string      = "0x675f70646713D4026612c673E644C61ae3aa7725";
const TX_DEPLOY: string    = "0x8e934988c40519d973ed2cdaf00a28ff0255448e2cfaf3c30101b5922ec26e30";
const ETHERSCAN    = "https://sepolia.etherscan.io";

/* Live on-chain TX hashes — mapped to translation test order (0-indexed)
   Wallet A 0x2459...431e4, vault proof: qwe123
   Only state-changing tests get a link; reverts/view calls stay null. */
const TEST_TX: (string | null)[] = [
    null,                                                                             // 00: Deploys without Pausable (bytecode check)
    null,                                                                             // 01: Admin can update minShieldAmount (setup, no captured TX)
    null,                                                                             // 02: Non-admin cannot update (revert)
    "0x3ee2b52a9b52d57d8afd38470a4c9b31b2a84da4002beec60ff3ba43e2e79c6d",           // 03: Creates vault correctly
    null,                                                                             // 04: Prevents duplicate vault (revert)
    "0x61df2b17acbb46318987cb439aafc9a9d3eeb15bdcf0bfc427a3bced5b9a52bf",           // 05: Shields tokens (shield TX)
    null,                                                                             // 06: Rejects shield below minimum (revert)
    null,                                                                             // 07: Rejects shield with wrong proof (revert)
    null,                                                                             // 08: Rejects shield from non-owner (revert)
    "0xe19da7225f0fb7a0122b9ac2f9af228713333c2cffa6dab999402ff3e012506c",           // 09: Unshields tokens correctly
    null,                                                                             // 10: Rejects unshield exceeding balance (revert)
    "0x154ac5e95eb56c75a9e2021742f8dbc1e09c1282196efc8c9bc6fa76bad9a160",           // 11: Commit stores nonce
    null,                                                                             // 12: Duplicate commit rejected (revert)
    "0xe6abf6bb5f967afff30a9e647623e0f181b4cd49eceb9bef5f720fca31377756",           // 13: Reveal transfers tokens
    null,                                                                             // 14: Reveal rejects used commit (revert)
    null,                                                                             // 15: Reveal rejects nonexistent commit (revert)
    "0xb2b01167629b80dc11053571b1ef1e9f755a66d44ddcf0a092df6db3df4ddef1",           // 16: Shields multiple token types independently
    null,                                                                             // 17: Emergency withdraw enforces delay (revert)
    null,                                                                             // 18: qToken is non-transferable (revert)
    "0x633cf142524631bbb011600e27b578838e3d0e35565cc6771d6a4f90b29f6c78",           // 19: Shields accumulate correctly (second approve+shield)
    null,                                                                             // 20: getQTokenAddress returns non-zero (view)
    null,                                                                             // 21: Factory getVault returns non-zero (view)
    null,                                                                             // 22: Unshields partial balance correctly (included in T22)
];
const PASS         = "#22C55E";
const WARN         = "#F59E0B";
const ERR          = "#EF4444";
const BLUE         = "#627EEA";
const CYAN         = "#22D3EE";
const W            = 1300;
const GITHUB_TEST  = "https://github.com/Qryptumorg/contracts/blob/main/test/QryptSafeV2.test.js";

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

function ExtLink({ href, children, color = BLUE }: { href: string; children: React.ReactNode; color?: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer"
            style={{ color, fontSize: 12, fontFamily: "'Inter',sans-serif", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}>
            {children}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
        </a>
    );
}

function AddrRow({ label, value, link, verified }: { label: string; value: string; link: string; verified?: boolean }) {
    const isPending = value === "PENDING";
    return (
        <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{label}</span>
                {verified && !isPending && (
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: PASS, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 4, padding: "1px 6px" }}>VERIFIED MIT</span>
                )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                {isPending
                    ? <span style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, color: "rgba(255,255,255,0.28)" }}>Deployment in progress</span>
                    : <><CopySpan value={value} display={short(value)} /><ExtLink href={link}>Etherscan</ExtLink></>}
            </div>
        </div>
    );
}

function SectionHead({ text, color = PASS }: { text: string; color?: string }) {
    return (
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 16, paddingTop: 8 }}>
            {text}
        </div>
    );
}

function StatBox({ val, label, color }: { val: string; label: string; color: string }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}28`, borderRadius: 14, padding: "14px 20px", textAlign: "center", minWidth: 110 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color }}>{val}</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 5, lineHeight: 1.3 }}>{label}</div>
        </div>
    );
}

interface TestRowProps { n: number; title: string; desc: string; isMobile: boolean; txHash?: string | null }
function TestRow({ n, title, desc, isMobile, txHash }: TestRowProps) {
    return (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: isMobile ? "14px 0" : "16px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.28)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={PASS} strokeWidth="2.8"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em" }}>{String(n).padStart(2, "0")}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: "#d4d6e2", letterSpacing: "-0.01em" }}>{title}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: PASS, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 4, padding: "2px 6px" }}>PASS</span>
                    {txHash && (
                        <a href={`${ETHERSCAN}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.65)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)"; }}>
                            Etherscan ↗
                        </a>
                    )}
                </div>
                <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.6 }}>{desc}</p>
            </div>
        </div>
    );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function SepoliaVerifiedV2Page() {
    const { t } = useLanguage();
    const sr = (t.sepoliaRecord as typeof translations.en.sepoliaRecord).v2 as SR2;

    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 900 : false);
    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    const pad = isMobile ? "0 18px" : "0 24px";
    const card = (extra?: React.CSSProperties): React.CSSProperties => ({
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        ...extra,
    });

    return (
        <div style={{ minHeight: "100vh", background: "#000000", color: "#d4d6e2" }}>
            <SharedNavBar />

            {/* ═══ HERO ══════════════════════════════════════════════ */}
            <div style={{ position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <img
                        src="/images/v2-hero-bg.jpg"
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", filter: "brightness(0.28) saturate(1.4)" }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(98,126,234,0.08) 0%, rgba(0,0,0,0) 60%)" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 70%, #000 100%)" }} />
                </div>

                <div style={{ position: "relative", zIndex: 1, maxWidth: W, margin: "0 auto", padding: pad }}>
                    <div style={{ padding: isMobile ? "120px 0 72px" : "160px 0 110px" }}>
                        <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 400px", gap: 56, alignItems: "center" }}>
                            <div>
                                {/* Badge */}
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(98,126,234,0.1)", border: "1px solid rgba(98,126,234,0.3)", borderRadius: 20, padding: "4px 14px 4px 9px", marginBottom: 22 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: BLUE }} />
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{sr.heroBadge}</span>
                                </div>

                                <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: isMobile ? 36 : 58, letterSpacing: "-0.03em", lineHeight: 1.04, margin: "0 0 20px", color: "#d4d6e2" }}>
                                    {sr.heroTitle}
                                </h1>

                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: isMobile ? 14 : 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: "0 0 32px", maxWidth: 560 }}>
                                    {sr.heroBody}
                                </p>

                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                    <StatBox val="23 / 23" label={sr.statLabels[0]} color="rgba(255,255,255,0.3)" />
                                    <StatBox val="4" label={sr.statLabels[1]} color="rgba(255,255,255,0.7)" />
                                    <StatBox val="1" label={sr.statLabels[2]} color={ERR} />
                                    <StatBox val="MIT" label={sr.statLabels[3]} color="rgba(255,255,255,0.3)" />
                                </div>
                            </div>

                            {/* Right: hero image */}
                            {!isMobile && (
                                <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(98,126,234,0.18)", boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(98,126,234,0.08)" }}>
                                    <img
                                        src="/images/v2-hero-right.jpg"
                                        alt="V2 nonce-based commit-reveal security visualization"
                                        style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }}
                                        onError={e => {
                                            const el = e.currentTarget as HTMLImageElement;
                                            el.style.display = "none";
                                            const parent = el.parentElement;
                                            if (parent) {
                                                parent.style.background = "rgba(98,126,234,0.06)";
                                                parent.style.minHeight = "300px";
                                                parent.style.display = "flex";
                                                parent.style.alignItems = "center";
                                                parent.style.justifyContent = "center";
                                                const txt = document.createElement("span");
                                                txt.textContent = "Rendering...";
                                                txt.style.color = "rgba(255,255,255,0.2)";
                                                txt.style.fontFamily = "'Inter',sans-serif";
                                                txt.style.fontSize = "13px";
                                                parent.appendChild(txt);
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ BODY ══════════════════════════════════════════════ */}
            <div style={{ maxWidth: W, margin: "0 auto", padding: pad }}>

                {/* ── What V2 Fixed ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20, borderColor: `${PASS}18` }) }}>
                    <SectionHead text={sr.introLabel} color="rgba(255,255,255,0.3)" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 22 : 28, letterSpacing: "-0.02em", margin: "0 0 12px", color: "#d4d6e2" }}>{sr.introHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.48)", lineHeight: 1.7, margin: "0 0 28px", maxWidth: 760 }}>{sr.introBody}</p>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                        {sr.introItems.map((item, i) => (
                            <div key={i} style={{ background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: 14, padding: "20px 22px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PASS} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}>{item.label}</div>
                                </div>
                                <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.65 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── V1 vs V2 Comparison ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <SectionHead text="Version Comparison" color="rgba(255,255,255,0.7)" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 20 : 26, letterSpacing: "-0.02em", margin: "0 0 8px", color: "#d4d6e2" }}>V1 vs V2 side by side</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: "0 0 26px" }}>
                        Every contract change from V1 to V2, documented at the function level.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
                        {/* Header */}
                        <div style={{ background: "rgba(239,68,68,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)", borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.08)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ERR }}>V1 (superseded)</span>
                        </div>
                        <div style={{ background: "rgba(34,197,94,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: PASS }}>V2 (this record)</span>
                        </div>
                        {[
                            { v1: "Pausable: factory can be halted by deployer", v2: "Pausable removed: vault creation cannot be stopped by any account" },
                            { v1: "No nonce on commit(): same hash silently overwrites", v2: "Nonce counter on every commit(): duplicate hash reverts with error" },
                            { v1: "Raw ERC-20 transfer calls: non-compliant tokens can silently fail", v2: "SafeERC20 wrapping: handles USDT-style returns without reverting" },
                            { v1: "Ownable + Pausable: two admin key attack vectors", v2: "Ownable only: single governance function (minShieldAmount), removed in V3" },
                            { v1: "passwordHash bug shared with V2 (fixed V3 only)", v2: "Static passwordHash: no rotation path (ECDSA rotation added in V3)" },
                        ].flatMap((row, i) => [
                            <div key={`v1-${i}`} style={{ background: i % 2 === 0 ? "rgba(0,0,0,0.2)" : "transparent", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none", borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.08)", padding: "14px 20px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ERR} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.55 }}>{row.v1}</span>
                            </div>,
                            <div key={`v2-${i}`} style={{ background: i % 2 === 0 ? "rgba(0,0,0,0.2)" : "transparent", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none", padding: "14px 20px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PASS} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20 6L9 17l-5-5" /></svg>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{row.v2}</span>
                            </div>,
                        ])}
                    </div>
                </div>

                {/* ── Security Improvements ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <SectionHead text="Attack Surface Analysis" color="rgba(255,255,255,0.3)" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 20 : 26, letterSpacing: "-0.02em", margin: "0 0 8px", color: "#d4d6e2" }}>Attack vectors mitigated in V2</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: "0 0 24px" }}>
                        Three concrete exploits that were possible in V1 and are blocked in V2.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                            {
                                threat: "Admin key compromise",
                                v1: "Attacker compromises deployer private key. Calls pause() on factory. All users are blocked from creating new vaults indefinitely.",
                                v2: "Pausable is removed from bytecode. No account holds a pause key. The attack vector does not exist in V2.",
                                color: ERR,
                                tag: "MITIGATED",
                                tagColor: PASS,
                            },
                            {
                                threat: "Commit replay attack",
                                v1: "Attacker monitors mempool for commit() calls. Re-submits the same commitHash. V1 silently overwrites the previous commit with attacker data.",
                                v2: "Every commit() stores and increments a per-vault nonce. A duplicate commitHash reverts with Commit already exists. Replay is impossible.",
                                color: WARN,
                                tag: "MITIGATED",
                                tagColor: PASS,
                            },
                            {
                                threat: "Non-compliant token silent failure",
                                v1: "USDT and similar tokens return no boolean from transfer(). A failed transfer silently proceeds. Vault accounting diverges from real balances.",
                                v2: "SafeERC20 wraps all token calls. Missing return values are handled by checking return data length. Non-compliant tokens are fully supported.",
                                color: "rgba(255,255,255,0.2)",
                                tag: "MITIGATED",
                                tagColor: PASS,
                            },
                            {
                                threat: "Static passwordHash (open in V2, fixed V3)",
                                v1: "N/A in V1 (no passwordHash field at creation)",
                                v2: "V2 stores keccak256(vaultProof) at creation with no rotation. If the proof leaks from calldata, the attacker can drain the vault. Fixed in V3 via changeVaultProof() ECDSA scheme.",
                                color: ERR,
                                tag: "REMAINS (V3 fixes)",
                                tagColor: WARN,
                            },
                        ].map((item, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 14, overflow: "hidden" }}>
                                <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, background: `${item.color}08` }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#d4d6e2", flex: 1 }}>{item.threat}</span>
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: item.tagColor, background: `${item.tagColor}14`, border: `1px solid ${item.tagColor}30`, borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap" }}>{item.tag}</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0 }}>
                                    <div style={{ padding: "14px 20px", borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ERR, marginBottom: 6 }}>V1 behaviour</div>
                                        <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.36)", lineHeight: 1.6 }}>{item.v1}</p>
                                    </div>
                                    <div style={{ padding: "14px 20px" }}>
                                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: PASS, marginBottom: 6 }}>V2 behaviour</div>
                                        <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{item.v2}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Build Details ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <SectionHead text="Build Details" color="rgba(255,255,255,0.3)" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 20 : 24, letterSpacing: "-0.02em", margin: "0 0 8px", color: "#d4d6e2" }}>Compiler and deployment configuration</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: "0 0 24px" }}>
                        Exact build settings used to produce the bytecode verified on Etherscan for both V2 contracts.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                        {[
                            { label: "Solidity version", value: "0.8.34", desc: "Compiler release" },
                            { label: "Optimizer runs", value: "200", desc: "Standard deploy setting" },
                            { label: "viaIR", value: "true", desc: "Yul IR pipeline enabled" },
                            { label: "EVM target", value: "paris", desc: "No PUSH0 opcode" },
                            { label: "License", value: "MIT", desc: "Etherscan verified" },
                            { label: "Proxy pattern", value: "EIP-1167", desc: "Minimal clone factory" },
                        ].map((item, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px" }}>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>{item.label}</div>
                                <div style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{item.value}</div>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.28)" }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                    {/* Hardhat config snippet */}
                    <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px" }}>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>hardhat.config.ts (relevant section)</div>
                        <pre style={{ margin: 0, fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, overflowX: "auto" }}>
{`solidity: {
  version: "0.8.34",
  settings: {
    optimizer: { enabled: true, runs: 200 },
    viaIR: true,
    evmVersion: "paris",
  },
}`}
                        </pre>
                    </div>
                </div>

                {/* ── Known Bug ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20, borderColor: "rgba(239,68,68,0.18)", background: "rgba(239,68,68,0.03)" }) }}>
                    <SectionHead text={sr.bugLabel} color={ERR} />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 20 : 26, letterSpacing: "-0.02em", margin: "0 0 12px", color: "#d4d6e2" }}>{sr.bugHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.48)", lineHeight: 1.7, margin: "0 0 20px" }}>{sr.bugBody}</p>
                    <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(239,68,68,0.5)", marginBottom: 8 }}>Exploit scenario</div>
                        <p style={{ margin: 0, fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, color: "rgba(239,68,68,0.65)", lineHeight: 1.8 }}>{sr.bugExample}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 10, padding: "12px 18px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PASS} strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                            V3 introduces <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>changeVaultProof()</span> with ECDSA meta-signature verification, allowing the vault owner to rotate the passwordHash without knowing the old proof.
                        </span>
                    </div>
                </div>

                {/* ── Commit-Reveal Flow ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <SectionHead text={sr.flowLabel} color="rgba(255,255,255,0.3)" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 20 : 26, letterSpacing: "-0.02em", margin: "0 0 8px", color: "#d4d6e2" }}>{sr.flowHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: "0 0 28px" }}>{sr.flowBody}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {[
                            { step: "01", label: "createVault(passwordHash)", color: "rgba(255,255,255,0.5)", desc: "Factory clones the PersonalQryptSafeV2 implementation via EIP-1167. Stores keccak256(vaultProof) on-chain. One vault per address enforced." },
                            { step: "02", label: "shield(token, amount, vaultProof)", color: "rgba(255,255,255,0.5)", desc: "User approves token spend. Vault transfers ERC-20 in using SafeERC20. ShieldToken minted 1:1. Nonce not used at this stage." },
                            { step: "03", label: "commit(commitHash, nonce)", color: "rgba(255,255,255,0.5)", desc: "User hashes the transfer intent off-chain and submits only the hash. V2 checks nonce uniqueness: same hash from the same nonce reverts immediately." },
                            { step: "04", label: "reveal(token, amount, recipient, vaultProof, nonce)", color: "rgba(255,255,255,0.5)", desc: "After commit is mined, user submits plaintext. Contract verifies keccak256(inputs) matches the stored commitHash, marks commit used, burns qToken, transfers ERC-20 to recipient." },
                            { step: "05", label: "unshield(token, amount, vaultProof)", color: "rgba(255,255,255,0.5)", desc: "Direct exit without commit-reveal. Burns qTokens and returns ERC-20 to vault owner. Vault proof required. No nonce used." },
                        ].map((s, i, arr) => (
                            <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < arr.length - 1 ? 0 : 0 }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${s.color}14`, border: `1px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: s.color }}>{s.step}</span>
                                    </div>
                                    {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: "rgba(255,255,255,0.07)", margin: "6px 0" }} />}
                                </div>
                                <div style={{ flex: 1, paddingBottom: 24 }}>
                                    <div style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 13, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.label}</div>
                                    <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.6 }}>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Sepolia Contracts ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <SectionHead text={sr.addrLabel} color="rgba(255,255,255,0.3)" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 20 : 24, letterSpacing: "-0.02em", margin: "0 0 8px", color: "#d4d6e2" }}>{sr.addrHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: "0 0 20px" }}>
                        Both contracts MIT-verified on Etherscan. Bytecode matches the source published in the Qryptumorg/contracts repository.
                    </p>
                    <AddrRow
                        label={sr.addrLabels.factory}
                        value={FACTORY_V2}
                        link={`${ETHERSCAN}/address/${FACTORY_V2}#code`}
                        verified
                    />
                    <AddrRow
                        label={sr.addrLabels.impl}
                        value={IMPL_V2}
                        link={`${ETHERSCAN}/address/${IMPL_V2}#code`}
                        verified
                    />
                    <div style={{ padding: "14px 0" }}>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.04em" }}>{sr.addrLabels.deployTx}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                            <CopySpan value={TX_DEPLOY} display={short(TX_DEPLOY, 12, 6)} />
                            <ExtLink href={`${ETHERSCAN}/tx/${TX_DEPLOY}`}>Etherscan</ExtLink>
                        </div>
                    </div>
                </div>

                {/* ── Test Results ── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 4 }}>
                        <SectionHead text={sr.testResultsLabel} color="rgba(255,255,255,0.3)" />
                        <a
                            href={GITHUB_TEST}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 12px" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(98,126,234,0.5)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(98,126,234,0.22)"; }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                            {sr.testFileLink}
                        </a>
                    </div>
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 20 : 24, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>{sr.testResultsHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "0 0 8px", lineHeight: 1.6 }}>{sr.testResultsBody}</p>

                    {/* Test summary bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, padding: "12px 18px", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: 10, flexWrap: "wrap" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PASS} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: PASS }}>23 / 23 passing</span>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Live on Sepolia, Wallet A, vault proof: qwe123</span>
                        <div style={{ marginLeft: "auto", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6, padding: "3px 10px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: PASS }}>100%</div>
                    </div>

                    {/* Live TX legend */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, padding: "8px 14px", background: "rgba(34,211,238,0.04)", border: "1px solid rgba(34,211,238,0.12)", borderRadius: 8 }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "2px 7px" }}>TX</span>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>7 state-changing tests have live Etherscan links. Revert tests verified via eth_call static simulation.</span>
                    </div>

                    {sr.tests.map((test, i) => (
                        <TestRow key={i} n={i + 1} title={test.title} desc={test.desc} isMobile={isMobile} txHash={TEST_TX[i] ?? null} />
                    ))}
                </div>

                {/* ── Navigation ── */}
                <div style={{ ...card({ padding: isMobile ? "22px 18px" : "26px 32px", marginBottom: 32, borderColor: "rgba(255,255,255,0.06)" }) }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 14, textAlign: "center" }}>
                        Contract version history
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 22 }}>
                        {[
                            { href: "/sepolia-verified", label: "v0", active: false },
                            { href: "/sepolia-verified-v1", label: "v1", active: false },
                            { href: "/sepolia-verified-v2", label: "v2", active: true },
                            { href: "/sepolia-verified-v3", label: "v3", active: false },
                            { href: "/sepolia-verified-v4", label: "v4", active: false },
                            { href: "/sepolia-verified-v5", label: "v5", active: false },
                            { href: "/sepolia-verified-v6", label: "v6", active: false },
                        ].map(item => (
                            <a key={item.href} href={item.href} style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: item.active ? 800 : 500, color: item.active ? "#fff" : "rgba(255,255,255,0.35)", textDecoration: "none", padding: "7px 16px", borderRadius: 8, background: item.active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)", border: item.active ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)" }}>
                                {item.label}
                            </a>
                        ))}
                    </div>
                    <SepoliaVersionNav
                        prev={{ label: "V1 Record", href: "/sepolia-verified-v1" }}
                        next={{ label: "V3 Record", href: "/sepolia-verified-v3" }}
                    />
                </div>
            </div>
        </div>
    );
}
