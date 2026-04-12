import { useEffect, useState } from "react";
import SharedNavBar from "@/components/SharedNavBar";
import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
type SR = typeof translations.en.sepoliaRecord;

/* ── Constants — pending redeployment from clean wallet ──────────── */
const FACTORY_V3 = "";
const VAULT_IMPL_V3 = "";
const FACTORY_V2 = "";
const VAULT_IMPL_V2 = "";
const QUSDC_V2 = "";
const FACTORY_V1 = "";
const QUSDC_V1 = "";
const VAULT_A = "";
const WALLET_A = "";
const WALLET_B = "";

/* ── TX hashes — pending redeployment from clean wallet ─────── */
const TX_DEPLOY   = "";
const TX_SHIELD   = "";
const TX_COMMIT   = "";
const TX_REVEAL   = "";
const TX_UNSHIELD = "";

const ETHERSCAN = "https://sepolia.etherscan.io";

/* ── Tiny helpers ──────────────────────────────────────────────── */
const short = (v: string, head = 8, tail = 6) => `${v.slice(0, head)}...${v.slice(-tail)}`;

function CopySpan({ value, display }: { value: string; display?: string }) {
    const [ok, setOk] = useState(false);
    return (
        <span onClick={() => { navigator.clipboard.writeText(value).then(() => { setOk(true); setTimeout(() => setOk(false), 1600); }); }}
            title="Click to copy"
            style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 6, padding: "3px 9px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {display ?? value}
            {ok
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
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

function AddrRow({ label, value, verified, dim, link }: { label: string; value: string; verified?: boolean; dim?: boolean; link?: string }) {
    const { t } = useLanguage();
    return (
        <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: dim ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.42)", letterSpacing: "0.04em" }}>{label}</span>
                {verified && !dim && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 4, padding: "1px 6px" }}>{t.common.verifiedBadge}</span>}
                {dim && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#EF4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, padding: "1px 6px" }}>{t.common.supersededBadge}</span>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <CopySpan value={value} display={short(value)} />
                <ExtLink href={link ?? `${ETHERSCAN}/address/${value}`}>Etherscan</ExtLink>
            </div>
        </div>
    );
}

/* ── Protocol flow SVG ─────────────────────────────────────────── */
function FlowDiagram() {
    const steps = [
        { label: "ERC-20 Token", sub: "Wallet holds USDC", color: "#627EEA" },
        { label: "shield()", sub: "vault proof required", color: "#8B5CF6" },
        { label: "Qrypt-Safe", sub: "qToken locked in vault", color: "#06B6D4" },
        { label: "commitTransfer()", sub: "hashed intent on-chain", color: "#F59E0B" },
        { label: "revealTransfer()", sub: "after timelock, unlock", color: "#F97316" },
        { label: "Recipient", sub: "receives raw ERC-20", color: "#22C55E" },
    ];
    const W = 920, H = 130, bw = 120, bh = 62;
    const xOf = (i: number) => 54 + i * ((W - 108) / (steps.length - 1));
    const cy = H / 2;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
                <marker id="a" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                    <polygon points="0 0,7 3.5,0 7" fill="rgba(255,255,255,0.2)" />
                </marker>
            </defs>
            {steps.slice(0, -1).map((_, i) => {
                const x1 = xOf(i) + bw / 2, x2 = xOf(i + 1) - bw / 2;
                return <line key={i} x1={x1} y1={cy} x2={x2 - 4} y2={cy} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#a)" />;
            })}
            {steps.map((s, i) => {
                const cx2 = xOf(i), bx = cx2 - bw / 2, by = cy - bh / 2;
                return (
                    <g key={i}>
                        <rect x={bx} y={by} width={bw} height={bh} rx="9" fill="rgba(10,12,30,0.97)" stroke={s.color} strokeWidth="1.2" strokeOpacity="0.45" />
                        <text x={cx2} y={by + 20} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill={s.color}>{s.label}</text>
                        <text x={cx2} y={by + 36} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9.5" fill="rgba(255,255,255,0.38)">{s.sub}</text>
                        <text x={cx2} y={by + bh + 14} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(255,255,255,0.22)" letterSpacing="0.07em">{`STEP ${i + 1}`}</text>
                    </g>
                );
            })}
        </svg>
    );
}

/* ── Test row ──────────────────────────────────────────────────── */
interface TRProps { pass: boolean; n: number; title: string; desc: string; txLabel?: string; txHash?: string; txLabel2?: string; txHash2?: string; }
function TestRow({ pass, n, title, desc, txLabel, txHash, txLabel2, txHash2 }: TRProps) {
    return (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "16px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: pass ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${pass ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                {pass ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.8"><path d="M20 6L9 17l-5-5" /></svg>
                      : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em" }}>{String(n).padStart(2, "0")}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{title}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: pass ? "#22C55E" : "#EF4444", background: pass ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${pass ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)"}`, borderRadius: 4, padding: "2px 6px" }}>{pass ? "PASS" : "SKIP"}</span>
                </div>
                <p style={{ margin: "0 0 6px", fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.6 }}>{desc}</p>
                {txHash && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 4 }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.26)" }}>{txLabel ?? "TX"}:</span>
                    <CopySpan value={txHash} display={short(txHash, 12)} />
                    <ExtLink href={`${ETHERSCAN}/tx/${txHash}`}>Etherscan</ExtLink>
                </div>}
                {txHash2 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 5 }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.26)" }}>{txLabel2 ?? "TX"}:</span>
                    <CopySpan value={txHash2} display={short(txHash2, 12)} />
                    <ExtLink href={`${ETHERSCAN}/tx/${txHash2}`}>Etherscan</ExtLink>
                </div>}
            </div>
        </div>
    );
}

/* ── Section tag ───────────────────────────────────────────────── */
function Tag({ text, color = "#627EEA" }: { text: string; color?: string }) {
    return <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color, marginBottom: 10 }}>{text}</div>;
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function SepoliaVerifiedPage() {
    const { t } = useLanguage();
    const sr = (t.sepoliaRecord as SR).v2;
    const srV3 = (t.sepoliaRecord as SR).v3;
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 900 : false);
    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    const W = 1200;
    const pad = isMobile ? "0 18px" : "0 40px";

    const card = (extra?: React.CSSProperties): React.CSSProperties => ({
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        ...extra,
    });

    return (
        <div style={{ minHeight: "100vh", background: "#050710", color: "#fff" }}>
            <SharedNavBar />

            {/* ═══ HERO ═══════════════════════════════════════════ */}
            <div style={{ position: "relative", overflow: "hidden" }}>
                {/* generated image as background strip */}
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <img src="/sepolia-v2-hero.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", filter: "brightness(0.22) saturate(1.4)" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,7,16,0.1) 0%, rgba(5,7,16,0.65) 70%, #050710 100%)" }} />
                </div>

                <div style={{ position: "relative", zIndex: 1, maxWidth: W, margin: "0 auto", padding: pad }}>
                    <div style={{ padding: isMobile ? "100px 0 40px" : "110px 0 56px" }}>

                        <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 400px", gap: 60, alignItems: "center" }}>
                            {/* left */}
                            <div>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 20, padding: "4px 14px 4px 9px", marginBottom: 22 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", boxShadow: "0 0 8px rgba(239,68,68,0.5)" }} />
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#EF4444", textTransform: "uppercase" }}>{sr.heroBadge}</span>
                                </div>
                                <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 36 : 56, letterSpacing: "-0.03em", lineHeight: 1.04, margin: "0 0 20px", color: "#fff" }}>
                                    {sr.heroTitle}
                                </h1>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.5)", margin: "0 0 20px", maxWidth: 520 }}>
                                    {sr.heroBody}
                                </p>
                                <Link href="/sepolia-verified-v3" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 10, padding: "8px 16px", marginBottom: 28, textDecoration: "none" }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px rgba(34,197,94,0.7)" }} />
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: "#22C55E" }}>{sr.activeDeployLink}</span>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                                </Link>
                                {/* stat pills */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                    {[
                                        { val: "84/84", label: sr.statLabels[0], color: "#22C55E" },
                                        { val: "8/8", label: sr.statLabels[1], color: "#627EEA" },
                                        { val: "v2", label: sr.statLabels[2], color: "#EF4444" },
                                        { val: "3/3", label: sr.statLabels[3], color: "#06B6D4" },
                                    ].map(s => (
                                        <div key={s.val} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${s.color}28`, borderRadius: 12, padding: "12px 18px", textAlign: "center", minWidth: 100 }}>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: s.color }}>{s.val}</div>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* right: hero image panel */}
                            {!isMobile && (
                                <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>
                                    <img src="/sepolia-v2-hero.png" alt="Vault visualization" style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ CONTENT ════════════════════════════════════════ */}
            <div style={{ maxWidth: W, margin: "0 auto", padding: pad }}>

                {/* ── Protocol Flow (full width) ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <Tag text={sr.flowLabel} />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.flowHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 28px", lineHeight: 1.6 }}>{sr.flowBody}</p>
                    <FlowDiagram />
                </div>

                {/* ── Contract Architecture v3: active ─── */}
                <div style={{ ...card({ marginBottom: 20, overflow: "hidden" }) }}>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 380px" }}>
                        <div style={{ padding: isMobile ? "28px 18px" : "36px 40px" }}>
                            <Tag text={sr.activeContractsLabel} color="#22C55E" />
                            <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.activeContractsHeading}</h2>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 20px", lineHeight: 1.65 }}>
                                {sr.activeContractsBody}
                            </p>
                            <AddrRow label="QryptSafe v3 (factory)" value={FACTORY_V3} verified link={`${ETHERSCAN}/address/${FACTORY_V3}#code`} />
                            <AddrRow label="PersonalQryptSafe Implementation v3" value={VAULT_IMPL_V3} verified link={`${ETHERSCAN}/address/${VAULT_IMPL_V3}#code`} />
                        </div>
                        {!isMobile && (
                            <div style={{ position: "relative", minHeight: 280 }}>
                                <img src="/sepolia-v2-contracts.png" alt="Contract architecture" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75) saturate(1.2)" }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(255,255,255,0.03) 0%, transparent 40%)" }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Contract Architecture v2: previous ─── */}
                <div style={{ ...card({ marginBottom: 20, overflow: "hidden", borderColor: "rgba(98,126,234,0.14)" }) }}>
                    <div style={{ padding: isMobile ? "28px 18px" : "36px 40px" }}>
                        <Tag text={sr.prevVersionLabel} color="#627EEA" />
                        <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.prevVersionHeading}</h2>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 20px", lineHeight: 1.65 }}>
                            {sr.prevVersionBody}
                        </p>
                        <AddrRow label="ShieldFactory v2" value={FACTORY_V2} dim link={`${ETHERSCAN}/address/${FACTORY_V2}#code`} />
                        <AddrRow label="PersonalVault Implementation v2" value={VAULT_IMPL_V2} dim link={`${ETHERSCAN}/address/${VAULT_IMPL_V2}#code`} />
                        <AddrRow label="qUSDC ShieldToken v2 (6 decimals)" value={QUSDC_V2} dim />
                    </div>
                </div>

                {/* ── Superseded v1 (full width, red tint) ─── */}
                <div style={{ ...card({ marginBottom: 20, borderColor: "rgba(239,68,68,0.14)", padding: isMobile ? "28px 18px" : "36px 40px" }) }}>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "flex-start" }}>
                        <div>
                            <Tag text={sr.supersededLabel} color="#EF4444" />
                            <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.supersededHeading}</h2>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 20px", lineHeight: 1.65 }}>
                                {sr.supersededBody}
                            </p>
                            <AddrRow label="ShieldFactory v1" value={FACTORY_V1} verified dim link={`${ETHERSCAN}/address/${FACTORY_V1}#code`} />
                            <AddrRow label="qUSDC v1 (18 decimals bug)" value={QUSDC_V1} verified dim />
                        </div>
                        <div>
                            <Tag text={sr.fixLabel} color="#22C55E" />
                            <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.fixHeading}</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
                                {[
                                    sr.fixes[0],
                                    sr.fixes[1],
                                    sr.fixes[2],
                                ].map(r => (
                                    <div key={r.label} style={{ display: "flex", gap: 12 }}>
                                        <div style={{ flexShrink: 0, width: 20, height: 20, marginTop: 2, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.8"><path d="M20 6L9 17l-5-5" /></svg>
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{r.label}</div>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}>{r.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Unit tests: image LEFT, content RIGHT ─── */}
                <div style={{ ...card({ marginBottom: 20, overflow: "hidden" }) }}>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "340px 1fr" }}>
                        {!isMobile && (
                            <div style={{ position: "relative", minHeight: 320 }}>
                                <img src="/sepolia-v2-tests.png" alt="Test results" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7) saturate(1.3)" }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, rgba(5,7,16,0.1) 0%, transparent 50%)" }} />
                            </div>
                        )}
                        <div style={{ padding: isMobile ? "28px 18px" : "36px 40px" }}>
                            <Tag text={srV3.unitTestsLabel} color="#22C55E" />
                            <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{srV3.unitTestsHeading}</h2>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 22px", lineHeight: 1.65 }}>
                                {srV3.unitTestsBody}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {[
                                    { file: "QToken.test.js", n: 13, total: 13, topics: "Mint, burn, non-transferability, decimal precision" },
                                    { file: "ShieldFactory.test.js", n: 15, total: 15, topics: "Vault creation, pause/unpause, ownership" },
                                    { file: "PersonalVault.test.js", n: 45, total: 45, topics: "All operations, edge cases, security invariants" },
                                    { file: "integration.test.js", n: 11, total: 11, topics: "Full shield / transfer / unshield lifecycle" },
                                ].map(s => (
                                    <div key={s.file} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                                            <span style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, color: "rgba(255,255,255,0.62)" }}>{s.file}</span>
                                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#22C55E" }}>{s.n}/{s.total}</span>
                                        </div>
                                        <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, marginBottom: 7, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${(s.n / s.total) * 100}%`, background: "linear-gradient(90deg,#22C55E,#16A34A)", borderRadius: 2 }} />
                                        </div>
                                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.32)" }}>{s.topics}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 18 }}>
                                <ExtLink href="https://github.com/Qryptumorg/contracts/tree/main/test">View test source on GitHub</ExtLink>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Test wallets (3-col grid) ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <Tag text={srV3.testWalletsLabel} color="#8B5CF6" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 20px", color: "#fff" }}>{srV3.testWalletsHeading}</h2>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                        {[
                            { label: "Wallet A", sub: "vault owner", value: WALLET_A, color: "#627EEA" },
                            { label: "Wallet B", sub: "recipient", value: WALLET_B, color: "#8B5CF6" },
                            { label: "Vault A", sub: "Wallet A Qrypt-Safe", value: VAULT_A, color: "#06B6D4" },
                        ].map(w => (
                            <div key={w.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${w.color}22`, borderRadius: 14, padding: "18px 16px" }}>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: w.color, marginBottom: 2 }}>{w.label}</div>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>{w.sub}</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    <CopySpan value={w.value} display={short(w.value)} />
                                    <ExtLink href={`${ETHERSCAN}/address/${w.value}`}>Etherscan</ExtLink>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Live on-chain tests (full width) ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 60 }) }}>
                    <Tag text={sr.testResultsLabel} color="#F59E0B" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.testResultsHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 4px", lineHeight: 1.6 }}>
                        {sr.testResultsBody}
                    </p>
                    <TestRow pass n={1} title="Deploy Qrypt-Safe"
                        desc="Wallet A created a personal vault via ShieldFactory v2. Vault clone deployed at the address above."
                        txLabel="TX" txHash={TX_DEPLOY} />
                    <TestRow pass n={2} title="Shield USDC"
                        desc="Wallet A shielded 2 USDC. qToken deployed at qUSDC v2. Shielded balance confirmed: 2.0 qUSDC. Decimal fix verified, Etherscan displays correct amount."
                        txLabel="TX" txHash={TX_SHIELD} />
                    <TestRow pass n={3} title="Security: qToken direct transfer reverts"
                        desc="Attempted to transfer qUSDC directly via ERC-20 transfer(). Reverted at the contract level with 'qToken: transfers disabled, use Qryptum app'. No gas amount or contract call bypasses this." />
                    <TestRow pass n={4} title="Security: Wrong vault proof reverts"
                        desc="Attempted shield() with an incorrect vault proof. Reverted immediately. Vault funds untouched." />
                    <TestRow pass n={5} title="Security: Cross-wallet vault access reverts"
                        desc="Wallet B attempted to call unshield() on Wallet A's vault. Reverted with 'Not vault owner'. The onlyOwner modifier enforces that only msg.sender == owner can operate a vault." />
                    <TestRow pass n={6} title="Commit-Reveal Transfer"
                        desc="Two-step commit-reveal transfer of 0.5 USDC from Wallet A vault to Wallet B. Wallet B received 0.5 USDC as raw ERC-20, not qTokens."
                        txLabel="commitTransfer" txHash={TX_COMMIT}
                        txLabel2="revealTransfer" txHash2={TX_REVEAL} />
                    <TestRow pass n={7} title="Unshield"
                        desc="Wallet A unshielded 0.5 USDC from own vault back to Wallet A address. qUSDC balance burned. USDC returned to wallet."
                        txLabel="TX" txHash={TX_UNSHIELD} />
                    <TestRow pass n={8} title="Decimal precision end-to-end"
                        desc="Shielded 9.5 USDC via qUSDC v2. Etherscan and app both show 9.5 qUSDC. v1 would have shown 0.0000000000095. Fix confirmed on-chain." />
                </div>
            </div>
        </div>
    );
}
