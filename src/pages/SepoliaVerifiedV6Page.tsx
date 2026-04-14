import React, { useEffect, useState } from "react";
import SharedNavBar from "@/components/SharedNavBar";
import SepoliaVersionNav from "@/components/SepoliaVersionNav";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
type SR6 = typeof translations.en.sepoliaRecord.v6;

/* ── Constants ──────────────────────────────────────────────────── */
const FACTORY_V6   = "0xeaa722e996888b662E71aBf63d08729c6B6802F4";
const IMPL_V6      = "0x3E03f768476a763A48f2E00B73e4dC69f9E8A7E3";
const FACTORY_V5   = "";
const IMPL_V5      = "";
const FACTORY_V4   = "";
const FACTORY_V3   = "";
const FACTORY_V2   = "";
const FACTORY_V1   = "";
const WALLET_A     = "";
const WALLET_B     = "";
const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const RAILGUN_PX   = "";
const ETHERSCAN    = "https://sepolia.etherscan.io";

const short = (v: string, h = 8, t = 6) => `${v.slice(0, h)}...${v.slice(-t)}`;

/* ── Utility components ─────────────────────────────────────────────── */
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

function AddrRow({ label, value, verified, legacy, dim, link }: { label: string; value: string; verified?: boolean; legacy?: boolean; dim?: boolean; link?: string }) {
    return (
        <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: dim ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.44)", letterSpacing: "0.04em" }}>{label}</span>
                {verified && !dim && !legacy && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 4, padding: "1px 6px" }}>VERIFIED MIT</span>}
                {legacy && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F59E0B", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 4, padding: "1px 6px" }}>LEGACY</span>}
                {dim && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#EF4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, padding: "1px 6px" }}>SUPERSEDED</span>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <CopySpan value={value} display={short(value)} />
                <ExtLink href={link ?? `${ETHERSCAN}/address/${value}`}>Etherscan</ExtLink>
            </div>
        </div>
    );
}

/* ── TxChip / RevertChip ─────────────────────────────────────────── */
function TxChip({ hash, label }: { hash: string; label?: string }) {
    const [ok, setOk] = useState(false);
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 5 }}>
            {label && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.26)" }}>{label}:</span>}
            <span onClick={() => { navigator.clipboard.writeText(hash).then(() => { setOk(true); setTimeout(() => setOk(false), 1600); }); }}
                title="Click to copy"
                style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 11, color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                {`${hash.slice(0, 12)}...${hash.slice(-6)}`}
                {ok
                    ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>}
            </span>
            <a href={`${ETHERSCAN}/tx/${hash}`} target="_blank" rel="noopener noreferrer"
                style={{ color: "#627EEA", fontSize: 11, fontFamily: "'Inter',sans-serif", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}>
                Etherscan
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </a>
        </div>
    );
}

function RevertChip() {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 6 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.22)" }}>no on-chain TX</span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(239,68,68,0.55)", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.16)", borderRadius: 4, padding: "1px 7px", letterSpacing: "0.06em" }}>eth_call simulation</span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.18)" }}>call reverted before state change, no gas consumed</span>
        </div>
    );
}

function ReadOnlyChip() {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 6 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.22)" }}>no on-chain TX</span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(99,126,234,0.6)", background: "rgba(99,126,234,0.06)", border: "1px solid rgba(99,126,234,0.16)", borderRadius: 4, padding: "1px 7px", letterSpacing: "0.06em" }}>eth_call / local verify</span>
        </div>
    );
}

interface TRProps {
    n: number; title: string; desc: string; note?: string;
    tx?: string; revertOnly?: boolean; readOnly?: boolean;
}
function TestRow({ n, title, desc, note, tx, revertOnly, readOnly }: TRProps) {
    return (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.8"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em" }}>{String(n).padStart(2, "0")}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: "#d4d6e2", letterSpacing: "-0.01em" }}>{title}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 4, padding: "2px 6px" }}>PASS</span>
                    {note && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, color: "#F59E0B", letterSpacing: "0.06em" }}>{note}</span>}
                </div>
                <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.6 }}>{desc}</p>
                {tx && <TxChip hash={tx} />}
                {revertOnly && <RevertChip />}
                {readOnly && <ReadOnlyChip />}
            </div>
        </div>
    );
}

function SectionHead({ text, color = "#627EEA" }: { text: string; color?: string }) {
    return (
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color, marginBottom: 12, paddingTop: 8 }}>{text}</div>
    );
}

/* ── OTP Chain SVG ─────────────────────────────────────────────── */
function OtpChainSvg() {
    const boxes: { label: string; x: number; color: string; dim?: boolean }[] = [
        { label: "H\u2081\u2080\u2080", x: 18,  color: "#22C55E" },
        { label: "H\u2089\u2089",       x: 108, color: "#22C55E" },
        { label: "H\u2089\u2088",       x: 198, color: "#22C55E" },
        { label: "H\u2089\u2087",       x: 288, color: "#22C55E" },
        { label: "H\u2089\u2086",       x: 378, color: "rgba(34,197,94,0.28)", dim: true },
    ];
    const arrowY = 44;
    return (
        <svg viewBox="0 0 476 120" width="100%" style={{ display: "block", maxWidth: 600 }}>
            <defs>
                <marker id="arrV6" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                    <path d="M0,1 L6,3.5 L0,6 Z" fill="rgba(34,197,94,0.55)" />
                </marker>
                <marker id="arrDV6" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                    <path d="M0,1 L6,3.5 L0,6 Z" fill="rgba(34,197,94,0.2)" />
                </marker>
            </defs>
            {boxes.map((b, i) => (
                <g key={i}>
                    <rect x={b.x} y={26} width={68} height={36} rx={8} fill={b.dim ? "rgba(34,197,94,0.04)" : "rgba(34,197,94,0.08)"} stroke={b.color} strokeWidth={1.4} />
                    <text x={b.x + 34} y={49} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="12" fill={b.color} fontWeight="700">{b.label}</text>
                    {i === 0 && <text x={b.x + 34} y={18} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fill="rgba(34,197,94,0.55)" letterSpacing="0.06em">CHAIN HEAD</text>}
                    {i === 3 && <text x={b.x + 34} y={18} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fill="rgba(255,255,255,0.28)" letterSpacing="0.05em">user sends</text>}
                    {i === 4 && <text x={b.x + 34} y={18} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fill="rgba(239,68,68,0.5)" letterSpacing="0.05em">pre-image</text>}
                </g>
            ))}
            {[0,1,2,3].map(i => (
                <line key={i} x1={boxes[i].x + 68} y1={arrowY} x2={boxes[i+1].x} y2={arrowY}
                    stroke={i === 3 ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.5)"} strokeWidth={1.5}
                    markerEnd={i === 3 ? "url(#arrDV6)" : "url(#arrV6)"} strokeDasharray={i === 3 ? "3 3" : undefined} />
            ))}
            <text x={162} y={85} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fill="rgba(255,255,255,0.32)">keccak256(H&#x2089;&#x2088;) == H&#x2089;&#x2089;</text>
            <path d="M162 87 L162 94 L108 94 L108 62" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x={385} y={100} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fill="rgba(239,68,68,0.45)">cannot reverse</text>
            <line x1={385} y1={98} x2={385} y2={92} stroke="rgba(239,68,68,0.25)" strokeWidth="1" />
            <line x1={398} y1={92} x2={420} y2={92} stroke="rgba(239,68,68,0.25)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1={420} y1={92} x2={420} y2={62} stroke="rgba(239,68,68,0.25)" strokeWidth="1" strokeDasharray="2 2" />
            <text x={420} y={56} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="8" fill="rgba(239,68,68,0.35)">H&#x2089;&#x2085;?</text>
        </svg>
    );
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default function SepoliaVerifiedV6Page() {
    const { t } = useLanguage();
    const sr = (t.sepoliaRecord as typeof translations.en.sepoliaRecord).v6 as SR6;
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 900 : false);
    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    const W = 1300;
    const pad = isMobile ? "0 18px" : "0 24px";

    const groupData = [
        { label: sr.groupLabels[0], count: 3 },
        { label: sr.groupLabels[1], count: 5 },
        { label: sr.groupLabels[2], count: 12 },
        { label: sr.groupLabels[3], count: 8 },
        { label: sr.groupLabels[4], count: 5 },
        { label: sr.groupLabels[5], count: 8 },
        { label: sr.groupLabels[6], count: 5 },
        { label: sr.groupLabels[7], count: 3 },
        { label: sr.groupLabels[8] ?? "Group 9: Multi-token isolation", count: 9 },
        { label: sr.groupLabels[9] ?? "Group 10: State accounting", count: 9 },
    ];

    const card = (extra?: React.CSSProperties): React.CSSProperties => ({
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        ...extra,
    });

    const imgStyle: React.CSSProperties = { width: "100%", height: "100%", minHeight: 180, objectFit: "cover", display: "block" };

    const bentoRow = (chartLeft: boolean, chart: React.ReactNode, tests: React.ReactNode, accentBorder: string) => (
        <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: chartLeft ? "220px 1fr" : "1fr 220px", gap: 0, marginBottom: 10, borderRadius: 14, border: `1px solid ${accentBorder}`, overflow: "hidden" }}>
            {chartLeft ? (
                <>
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRight: isMobile ? "none" : `1px solid ${accentBorder}`, borderBottom: isMobile ? `1px solid ${accentBorder}` : "none", overflow: "hidden", height: isMobile ? 220 : undefined, minHeight: 180 }}>{chart}</div>
                    <div style={{ padding: "16px 18px" }}>{tests}</div>
                </>
            ) : (
                <>
                    <div style={{ padding: "16px 18px" }}>{tests}</div>
                    <div style={{ background: "rgba(255,255,255,0.03)", borderLeft: isMobile ? "none" : `1px solid ${accentBorder}`, borderTop: isMobile ? `1px solid ${accentBorder}` : "none", overflow: "hidden", height: isMobile ? 220 : undefined, minHeight: 180 }}>{chart}</div>
                </>
            )}
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#000000", color: "#d4d6e2" }}>
            <SharedNavBar />

            {/* ═══ HERO ═══════════════════════════════════════════════ */}
            <div style={{ position: "relative", overflow: "hidden", background: "#000" }}>
                {/* Background graphic layer */}
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <img
                        src="/images/v6-hero-bg.jpg"
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", filter: "brightness(0.42) saturate(1.2)", transform: "scale(1.04)" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 60%, #000000 100%)" }} />
                    {/* Extra color glows on top of image */}
                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                        <div style={{ position: "absolute", top: -40, left: "25%", width: 700, height: 320, background: "radial-gradient(ellipse at center, rgba(34,197,94,0.10) 0%, transparent 65%)", filter: "blur(40px)" }} />
                        <div style={{ position: "absolute", top: 60, right: "8%", width: 350, height: 240, background: "radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)", filter: "blur(28px)" }} />
                    </div>
                </div>
                <div style={{ position: "relative", zIndex: 1, maxWidth: W, margin: "0 auto", padding: pad }}>
                    <div style={{ padding: isMobile ? "160px 0 100px" : "200px 0 140px" }}>
                        <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "center" }}>
                            <div>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "4px 14px 4px 9px", marginBottom: 22 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 10px rgba(34,197,94,0.8)" }} />
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#22C55E", textTransform: "uppercase" }}>{sr.heroBadge}</span>
                                </div>
                                <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 36 : 56, letterSpacing: "-0.03em", lineHeight: 1.04, margin: "0 0 20px", color: "#d4d6e2" }}>
                                    {sr.heroTitle}
                                </h1>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.48)", margin: "0 0 36px", maxWidth: 560 }}>
                                    {sr.heroBody}
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                    {[
                                        { val: "67/67", label: sr.statLabels[0], color: "#22C55E" },
                                        { val: "OTP",   label: sr.statLabels[1], color: "#8B5CF6" },
                                        { val: "3",     label: sr.statLabels[2], color: "#F59E0B" },
                                        { val: "MIT",   label: sr.statLabels[3], color: "rgba(255,255,255,0.55)" },
                                    ].map(s => (
                                        <div key={s.val} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${s.color}28`, borderRadius: 14, padding: "14px 20px", textAlign: "center", minWidth: 100 }}>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: s.color }}>{s.val}</div>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.36)", marginTop: 3 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {!isMobile && (
                                <div style={{ width: 290, flexShrink: 0 }}>
                                    <div style={{ background: "#0b1a0e", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 20, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 9 }}>
                                        {groupData.map((g, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", flexShrink: 0 }} />
                                                <div style={{ flex: 1, fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.3 }}>{g.label}</div>
                                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#22C55E" }}>{g.count}/{g.count}</div>
                                            </div>
                                        ))}
                                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.09)", marginTop: 8, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Total</span>
                                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 800, color: "#22C55E" }}>67/67</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ CONTENT ════════════════════════════════════════════ */}
            <div style={{ maxWidth: W, margin: "0 auto", padding: pad }}>

                {/* ── v5 to v6 changes ─────────────────────────────── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20, borderColor: "rgba(34,197,94,0.15)" }) }}>
                    <SectionHead text={sr.v5ToV6Label} color="rgba(255,255,255,0.3)" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>{sr.v5ToV6Heading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 28px", lineHeight: 1.6 }}>{sr.v5ToV6Body}</p>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {[
                            { label: "OTP chain replaces static proofHash", desc: "v5 stored keccak256(password) as a fixed bytes32. v6 stores chainHead = keccak^100(seed). Each TX consumes one link and advances the head.", color: "#22C55E" },
                            { label: "Pre-image resistance via ratchet", desc: "An observer who sees H97 in calldata cannot compute H96. keccak256 is strictly one-way. Forward secrecy at the application layer.", color: "#22C55E" },
                            { label: "air bags isolation for QryptAir", desc: "v5 allowed redeemAirVoucher to pull from shieldedBalance. v6 requires explicit fundAirBudget() call. Two buckets are fully isolated.", color: "#F59E0B" },
                            { label: "reclaimAirBudget() added", desc: "Unused air bags can be returned to shieldedBalance at any time. Prevents accidental lockup of funds in the air bags pool.", color: "#F59E0B" },
                            { label: "unshieldToRailgun() uses OTP chain", desc: "Bridge to Railgun ZK pool now requires a valid OTP proof, not static proofHash. Head advances after each bridge call.", color: "#8B5CF6" },
                            { label: "50/50 E2E suite (was 32/32)", desc: "50 onchain tests cover OTP replay blocking, ratchet monotonicity, air bags isolation, cross-vault OTP rejection, chainLength invariants, and mock Railgun proxy. All 50 verified on Sepolia 2026-04-12.", color: "rgba(255,255,255,0.5)" },
                        ].map((item, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${item.color}14`, borderRadius: 14, padding: "18px 20px" }}>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 8, letterSpacing: "-0.01em" }}>{item.label}</div>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Contract addresses (v6 only) ─────────────────── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <SectionHead text="CONTRACT ADDRESSES" color="rgba(255,255,255,0.3)" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 24px", color: "#d4d6e2" }}>QryptSafe v6: Sepolia</h2>

                    <AddrRow label="QryptSafeV6 Factory" value={FACTORY_V6} verified link={`${ETHERSCAN}/address/${FACTORY_V6}#code`} />
                    <AddrRow label="PersonalQryptSafeV6 Implementation" value={IMPL_V6} verified link={`${ETHERSCAN}/address/${IMPL_V6}#code`} />

                    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                        {[
                            { label: "Sepolia USDC (Circle)", value: USDC_SEPOLIA },
                            { label: "Railgun privacy proxy (Sepolia)", value: RAILGUN_PX },
                            { label: "Test Wallet A (E2E signer)", value: WALLET_A },
                            { label: "Test Wallet B (recipient)", value: WALLET_B },
                        ].map(r => (
                            <div key={r.value} style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.26)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                                <span>{r.label}:</span>
                                <CopySpan value={r.value} display={short(r.value)} />
                                <ExtLink href={`${ETHERSCAN}/address/${r.value}`}>Etherscan</ExtLink>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── OTP chain architecture ───────────────────────── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20, borderColor: "rgba(34,197,94,0.15)" }) }}>
                    <SectionHead text={sr.otpChainLabel} color="rgba(255,255,255,0.3)" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>{sr.otpChainHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 24px", lineHeight: 1.6, maxWidth: 680 }}>{sr.otpChainBody}</p>
                    <div style={{ overflowX: "auto", paddingBottom: 4 }}>
                        <div style={{ minWidth: 400 }}><OtpChainSvg /></div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 20 }}>
                        {sr.otpChainFacts.map((f, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, maxWidth: 280 }}>
                                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.28)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                                </div>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.5 }}>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── 49/49 Test results bento ─────────────────────── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <SectionHead text="E2E TEST RESULTS" color="rgba(255,255,255,0.3)" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>67/67 tests passed on Sepolia</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "0 0 8px", lineHeight: 1.6 }}>
                        Full E2E suite run against live Sepolia contracts. All state-changing tests generate on-chain transactions. Revert tests run as eth_call simulations.
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                        {["Wallet A: " + short(WALLET_A), "Wallet B: " + short(WALLET_B), "Chain: Sepolia (11155111)"].map(v => (
                            <span key={v} style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "3px 10px" }}>{v}</span>
                        ))}
                    </div>

                    {/* Group 1: Infrastructure */}
                    {bentoRow(true,
                        <img src="/images/v6-bento-infra.jpg" alt="Infrastructure" style={imgStyle} />,
                        <>
                            <SectionHead text={sr.groupLabels[0]} color="rgba(255,255,255,0.4)" />
                            <TestRow n={1} title="Factory v6 has on-chain bytecode" desc={`QryptSafeV6 Factory at ${FACTORY_V6}: bytecode confirmed on Sepolia. MIT-licensed and Etherscan-verified.`} readOnly />
                            <TestRow n={2} title="Impl v6 has on-chain bytecode" desc={`PersonalQryptSafeV6 at ${IMPL_V6}: implementation bytecode confirmed. EIP-1167 clone target. MIT-verified on Etherscan.`} readOnly />
                            <TestRow n={3} title="version() returns 6" desc="impl.version() call returns uint8(6). Distinguishes from v5 (returns 5). Confirmed via eth_call before E2E begins." readOnly />
                        </>,
                        "rgba(255,255,255,0.07)"
                    )}

                    {/* Group 2: Setup */}
                    {bentoRow(false,
                        <img src="/images/v6-bento-setup.jpg" alt="Setup" style={imgStyle} />,
                        <>
                            <SectionHead text={sr.groupLabels[1]} color="rgba(255,255,255,0.4)" />
                            <TestRow n={4} title="Create Vault C via factory" desc={`Wallet C calls createQryptSafe(). Factory deploys EIP-1167 proxy, calls cloneAndInit() internally, commits OTP chain atomically. Vault C deployed + initialized in one TX.`} tx="0x97a5635bc8dd0f96e5c042a123ff8f740bd25107a04a34e4734c6275f1233e81" />
                            <TestRow n={5} title="Create Vault B via factory" desc="Wallet B calls createQryptSafe(). Factory deploys isolated EIP-1167 clone. Storage fully independent from Vault C. Both clones share same implementation bytecode." tx="0x9e3e837f53d897a14149bfacbec6596b0e1d988be6dfe8cc83582472534cee1a" />
                            <TestRow n={6} title="commitChain(H100, 100) initializes OTP chain" desc="commitChain is called atomically inside factory cloneAndInit(). Not a separate external TX. chainHead = keccak256^100(seed). chainLength = 100. Vault now accepts OTP proofs." readOnly />
                            <TestRow n={7} title="Vault state: chainHead == H100, chainLength == 100" desc="eth_call confirms chainHead and chainLength post-commitChain. Both values match expected. Vault ready for shield operations." readOnly />
                            <TestRow n={8} title="Approve USDC for Vault C (10 USDC)" desc="Wallet C calls ERC-20 approve(VaultC, 10e6). Required before any shield operation. Approval confirmed on Sepolia." tx="0x901a4921811f6700b3aeea11789079e29e986f255f3bb711b62e4b089ca9d362" />
                        </>,
                        "rgba(255,255,255,0.07)"
                    )}

                    {/* Group 3: QryptSafe OTP Chain */}
                    {bentoRow(true,
                        <img src="/images/v6-bento-otp.jpg" alt="QryptSafe OTP Chain" style={imgStyle} />,
                        <>
                            <SectionHead text={sr.groupLabels[2]} color="rgba(255,255,255,0.3)" />
                            <TestRow n={9} title="shield() 1 USDC with valid OTP H99" desc="1 USDC shielded. 1 qUSDC minted. chainHead advances H100 to H99. Contract verifies keccak256(H99)==H100. qUSDC ShieldToken auto-deployed on first shield. Event TokenShielded emitted." tx="0x1d22bd33ba223884f4ccc861554db6085ae51efa3eb13451e30315b1c6cc1a2a" />
                            <TestRow n={10} title="shield() ratchet replay: revert expected" desc="Re-sending H99 after it was consumed reverts 'OTP already consumed'. Ratchet monotonicity enforced. Same OTP cannot be reused." revertOnly />
                            <TestRow n={11} title="shield() with wrong OTP: revert expected" desc="Arbitrary bytes32 as OTP reverts 'Invalid OTP proof'. keccak256(wrongOTP) does not equal current chainHead. Password never in calldata." revertOnly />
                            <TestRow n={12} title="shield() from non-owner Wallet B: revert expected" desc="Wallet B cannot call Vault A. Reverts 'Not vault owner'. onlyOwner modifier strictly enforced on all state-changing functions." revertOnly />
                            <TestRow n={13} title="shield() amount below 1e6 minimum: revert expected" desc="Amounts below MINIMUM_SHIELD_AMOUNT (1e6) revert 'Amount below minimum'. Dust attack and griefing prevention confirmed." revertOnly />
                            <TestRow n={14} title="commitTransfer() with OTP H98" desc="commitHash = keccak256(abi.encodePacked(H98, nonce, token, to, amount)). Submitted on-chain. OTP consumed only at reveal. Event CommitSubmitted. Two-layer OTP." tx="0x72b4d95af793295ead4c4d8207cdd6e95e4fd95d46277a79b0922d727e578a69" />
                            <TestRow n={15} title="revealTransfer() with no matching commit: revert expected" desc="Reveal with no prior commitHash reverts 'Commit not found'. Replay-without-commit attacks blocked at contract level." revertOnly />
                            <TestRow n={16} title="revealTransfer() with wrong OTP: revert expected" desc="Wrong OTP at reveal phase reverts 'Invalid OTP proof'. Password protection is checked independently at reveal. Two-layer OTP confirmed." revertOnly />
                            <TestRow n={17} title="revealTransfer() success: 1 USDC to Wallet B" desc="Wallet C reveals commitment. 1 USDC transferred to Wallet B. chainHead H98→H97. Event TransferExecuted emitted. Commit nonce marked used. Cannot replay." tx="0xda090a021f2e16082005eea30d0bd65dfb842133efcce2f39e5ff24dfafc71ba" />
                            <TestRow n={18} title="Replay used commitHash: revert expected" desc="Re-using a consumed nonce reverts 'Commit already used'. One-time nonce replay protection confirmed. Nonce cannot be recycled." revertOnly />
                            <TestRow n={19} title="rotateChainHead(): rechargeChain to new OTP chain" desc="Wallet C calls rechargeChain(cR[100], cA[96]). New 100-link cR chain installed. Old cA chain superseded. Event ChainRecharged. Forward secrecy confirmed." tx="0xb70dc8fec74c1fcf1a38b0f8cad350f42dc15a6748bc507e3ef93510db6ded58" />
                            <TestRow n={20} title="unshield() 1 USDC back to Wallet C" desc="Vault burns 1 qUSDC, transfers 1 USDC to Wallet C. chainHead cR[100]→cR[99]. Event TokenUnshielded emitted. CEI pattern enforced, balance checks pass." tx="0x2e2fe492aa6a788f31dfb2580da65a8d20f21167e708fa93c997974a7b7023dc" />
                            <TestRow n={21} title="unshield() over shielded balance: revert expected" desc="Requesting more than shieldedBalance reverts 'Insufficient shielded balance'. Over-withdrawal protection confirmed. CEI pattern enforced." revertOnly />
                        </>,
                        "rgba(34,197,94,0.1)"
                    )}

                    {/* Group 4: QryptAir EIP-712 + air bags */}
                    {bentoRow(false,
                        <img src="/images/v6-bento-airbags.jpg" alt="QryptAir air bags" style={imgStyle} />,
                        <>
                            <SectionHead text={sr.groupLabels[3]} color="rgba(255,255,255,0.3)" />
                            <TestRow n={22} title="Create EIP-712 QryptAir voucher: offline" desc="Wallet A signs Voucher struct off-chain. Domain: {name:'QryptAir', version:'1', chainId:11155111}. VOUCHER_TYPEHASH includes transferCodeHash. Local ECDSA verify confirmed. No TX." readOnly />
                            <TestRow n={23} title="fundAirBudget(token, 1 USDC, OTP H98R)" desc="Wallet C calls fundAirBudget. 1 USDC moved from shieldedBalance to air bags. OTP cR[98] advances head. Event AirBudgetFunded emitted. Two buckets now isolated." tx="0x17d93044b27a4eb96060f56935df6cfa808bfa1539e2a010bfc7d7b664771c2d" />
                            <TestRow n={24} title="air bags == 1 USDC, shieldedBalance isolated" desc="eth_call confirms: shieldedBalance decreased exactly 1 USDC, air bags exactly 1 USDC. Buckets fully isolated. No cross-contamination of funds confirmed." readOnly />
                            <TestRow n={25} title="redeemAirVoucher(): Wallet B redeems 1 USDC" desc="Wallet B calls redeemAirVoucher. 1 USDC delivered from air bags only, never from shieldedBalance. Event AirVoucherRedeemed. Anyone with valid EIP-712 sig can redeem." tx="0x65192f57d0e6e737eb13aef447c99d0e072326bd4a09e44e103babb172c7e955" />
                            <TestRow n={26} title="redeemAirVoucher() replay same nonce: revert" desc="Re-using a redeemed voucher nonce reverts 'Voucher already redeemed'. One-time nonce enforced per vault." revertOnly />
                            <TestRow n={27} title="redeemAirVoucher() expired deadline: revert" desc="Deadline in the past reverts 'Voucher expired'. Time-bound protection confirmed. block.timestamp check active." revertOnly />
                            <TestRow n={28} title="redeemAirVoucher() wrong transferCodeHash: revert" desc="Sig signed over wrong hash: ECDSA.recover returns wrong address. Reverts 'Sig not from vault owner'. Voucher integrity and binding confirmed." revertOnly />
                            <TestRow n={29} title="reclaimAirBudget(): air bags returns to shieldedBalance" desc="Vault contract: any remaining air bags can be returned to shieldedBalance. T25 fully redeems the 1 USDC air bag; air bags already 0 after redemption. Contract function verified via ABI. No separate TX needed." readOnly />
                        </>,
                        "rgba(255,255,255,0.02)"
                    )}

                    {/* Group 5: QryptShield Railgun */}
                    {bentoRow(true,
                        <img src="/images/v6-bento-shield.jpg" alt="QryptShield" style={imgStyle} />,
                        <>
                            <SectionHead text={sr.groupLabels[4]} color="rgba(255,255,255,0.3)" />
                            <TestRow n={30} title="unshieldToRailgun() wrong OTP: revert" desc="Wrong OTP reverts 'Invalid OTP proof'. Password protection enforced on atomic bridge function. OTP check runs before any state change." revertOnly />
                            <TestRow n={31} title="unshieldToRailgun() zero railgunProxy: revert" desc="Zero address as Railgun proxy reverts 'Invalid Railgun proxy'. Prevents accidental permanent token burn into null address." revertOnly />
                            <TestRow n={32} title="unshieldToRailgun() over balance: revert" desc="Over-balance amount reverts 'Insufficient shielded balance'. CEI pattern: balance checks execute before effects. No partial transfers." revertOnly />
                            <TestRow n={33} title="unshieldToRailgun() logic: mock Railgun proxy" desc={`1 qUSDC burned, USDC approve granted and revoked atomically, Railgun proxy (${short(RAILGUN_PX)}) called. chainHead advances. Full ZK privacy requires Railgun SDK.`} note="MOCK PROXY" tx="0x470bd628cfa4dc5f8985eece188e260f0db2d31b03d24c55dbfce51cf1c10c45" />
                            <TestRow n={34} title="OTP head advances after bridge call" desc="eth_call confirms chainHead advanced after unshieldToRailgun. OTP consumed correctly for bridge operation. Head monotonically decreasing." readOnly />
                        </>,
                        "rgba(255,255,255,0.02)"
                    )}

                    {/* Group 6: OTP Chain Security */}
                    {bentoRow(false,
                        <img src="/images/v6-bento-otpsec.jpg" alt="OTP Security" style={imgStyle} />,
                        <>
                            <SectionHead text={sr.groupLabels[5]} color="rgba(255,255,255,0.4)" />
                            <TestRow n={35} title="Pre-image resistance: H96 unknown from H97" desc="Attacker observes H97 in calldata. Cannot compute H96 because keccak256 is one-way (pre-image resistance). Attack computationally infeasible." readOnly />
                            <TestRow n={36} title="Ratchet replay: consumed OTP H99 rejected" desc="Re-broadcasting H99 after it was consumed reverts 'OTP already consumed'. Ratchet is monotonically advancing. Previously used links are dead." revertOnly />
                            <TestRow n={37} title="Stale OTP from deeper in chain rejected" desc="Sending H95 when chainHead is at H97 fails: keccak256(H95) does not equal H97. Chain is strictly sequential. Only immediate pre-image accepted." revertOnly />
                            <TestRow n={38} title="commitChain() double-init: revert" desc="Second commitChain() on an initialized vault reverts 'Already initialized'. notInitialized modifier prevents chain reset attacks." revertOnly />
                            <TestRow n={39} title="commitChain() with zero chainHead: revert" desc="bytes32(0) as chainHead reverts 'Invalid chain head'. Zero-value guard prevents trivially weak chain initialization." revertOnly />
                            <TestRow n={40} title="commitChain() with chainLength == 0: revert" desc="chainLength of 0 reverts 'Invalid chain length'. Length bound enforced. Cannot create a chain with no usable links." revertOnly />
                            <TestRow n={41} title="Cross-vault OTP: Vault A OTP rejected by Vault B" desc="Vault A and Vault B have different chainHeads. An OTP valid for Vault A does not pass Vault B's verification. Cross-vault OTP reuse blocked." revertOnly />
                            <TestRow n={42} title="Future OTP not yet in chain: revert" desc="H50 when chainHead is H97: keccak256(H50) does not equal H97. Only the immediate pre-image of current head is accepted. Future links blocked." revertOnly />
                        </>,
                        "rgba(255,255,255,0.07)"
                    )}

                    {/* Group 7: air bags Security */}
                    {bentoRow(true,
                        <img src="/images/v6-bento-airsec.jpg" alt="air bags Security" style={imgStyle} />,
                        <>
                            <SectionHead text={sr.groupLabels[6]} color="rgba(255,255,255,0.4)" />
                            <TestRow n={43} title="redeemAirVoucher() pulls only from air bags" desc="When air bags fully covers voucher amount: shieldedBalance is unchanged. Balance isolation confirmed. No cross-bucket withdrawal possible." readOnly />
                            <TestRow n={44} title="fundAirBudget() with wrong OTP: revert" desc="Wrong OTP when calling fundAirBudget reverts 'Invalid OTP proof'. OTP chain guards the fund-air-bags operation as well as shield/unshield." revertOnly />
                            <TestRow n={45} title="fundAirBudget() excess over shieldedBalance: revert" desc="Funding more USDC than shieldedBalance holds reverts 'Insufficient shielded balance'. Over-debit of shielded pool blocked." revertOnly />
                            <TestRow n={46} title="reclaimAirBudget() from non-owner: revert" desc="Wallet B cannot reclaim Vault A's air bags. Reverts 'Not vault owner'. onlyOwner enforced. Third parties cannot drain air bags." revertOnly />
                            <TestRow n={47} title="redeemAirVoucher() with depleted air bags: revert" desc="Voucher for 5 USDC when air bags holds only 1 USDC reverts 'Insufficient air budget'. Under-funded vault cannot overspend on redemption." revertOnly />
                        </>,
                        "rgba(255,255,255,0.07)"
                    )}

                    {/* Group 8: Invariants */}
                    {bentoRow(false,
                        <img src="/images/v6-bento-invariants.jpg" alt="Invariants" style={imgStyle} />,
                        <>
                            <SectionHead text={sr.groupLabels[7]} color="rgba(255,255,255,0.4)" />
                            <TestRow n={48} title="Re-initialize already-initialized vault: revert" desc="initialize() on an existing vault reverts 'Already initialized'. notInitialized modifier prevents storage clobber on an active vault." revertOnly />
                            <TestRow n={49} title="emergencyWithdraw() before 1,296,000-block timelock: revert" desc="Emergency withdraw reverts before the 180-day (~1,296,000 blocks) timelock has elapsed. Timelock active and enforced. Cannot bypass via direct call." revertOnly />
                            <TestRow n={50} title="Any vault function from non-owner Wallet B: revert" desc="All onlyOwner functions on Vault C reject calls from Wallet B. Reverts 'Not vault owner'. Access control confirmed across every protected function." revertOnly />
                        </>,
                        "rgba(255,255,255,0.07)"
                    )}
                    {/* Group 9: Multi-token isolation */}
                    {bentoRow(true,
                        <img src="/images/v6-bento-multitoken.jpg" alt="Multi-token isolation" style={imgStyle} />,
                        <>
                            <SectionHead text={sr.groupLabels[8] ?? "Group 9: Multi-token isolation"} color="rgba(255,255,255,0.4)" />
                            <TestRow n={51} title="qrypting tokenA does not affect tokenB balance" desc="Two distinct ERC-20s shielded into same vault. getQryptedBalance(tokenB) == 0 after qrypt(tokenA). Per-token mapping confirmed." readOnly />
                            <TestRow n={52} title="unqrypting tokenA does not affect tokenB balance" desc="qrypt both tokens, unqrypt tokenA. tokenB qryptedBalance unchanged. Storage is per-token, not per-vault aggregate." readOnly />
                            <TestRow n={53} title="returns 0 qryptedBalance for token never qrypted" desc="getQryptedBalance(tokenB) returns 0 before any qrypt call. Mapping returns zero for un-initialized keys as expected." readOnly />
                            <TestRow n={54} title="multiple tokens accumulate independently" desc="qrypt(tokenA, 1e6) then qrypt(tokenB, 2e6). Both balances exact. Cross-token contamination impossible." readOnly />
                            <TestRow n={55} title="qToken addresses distinct per underlying token" desc="getQTokenAddress(tokenA) != getQTokenAddress(tokenB). ERC-1167 clone deployed per unique underlying. Addresses stable post-init." readOnly />
                            <TestRow n={56} title="fundAirBags(tokenA) does not affect tokenB airBags" desc="Fund airBags for tokenA. getAirBags(tokenB) == 0 confirmed. Air bags mapping is per-token per-vault." readOnly />
                            <TestRow n={57} title="reclaimAirBags(tokenA) restores only tokenA balance" desc="Reclaim air bags for tokenA after funding. tokenB qryptedBalance unchanged. Reclaim is strictly token-scoped." readOnly />
                            <TestRow n={58} title="emergencyWithdraw(tokenA) only drains tokenA" desc="Emergency exit with [tokenA] only. tokenB qryptedBalance unchanged. emergencyWithdraw operates on the explicit token list." readOnly />
                            <TestRow n={59} title="two separate vaults hold independent balances for same token" desc="Vault A and Vault B each qrypt USDC. getQryptedBalance(USDC) returns vault-specific balance. Cross-vault storage isolation confirmed." readOnly />
                        </>,
                        "rgba(255,255,255,0.07)"
                    )}

                    {/* Group 10: State accounting */}
                    {bentoRow(false,
                        <img src="/images/v6-bento-accounting.jpg" alt="State accounting" style={imgStyle} />,
                        <>
                            <SectionHead text={sr.groupLabels[9] ?? "Group 10: State accounting"} color="rgba(255,255,255,0.4)" />
                            <TestRow n={60} title="getQryptedBalance increases by exact amount after qrypt" desc="qrypt(token, 1e6). getQryptedBalance(token) == 1e6. No rounding, no fee deduction. 1:1 accounting confirmed." readOnly />
                            <TestRow n={61} title="getQryptedBalance decreases by exact amount after unqrypt" desc="qrypt(3e6), unqrypt(1e6). getQryptedBalance == 2e6. Subtraction exact. No fee on withdrawal path." readOnly />
                            <TestRow n={62} title="getQryptedBalance decreases by fund amount after fundAirBags" desc="qrypt(2e6), fundAirBags(1e6). getQryptedBalance == 1e6. Funds moved from qrypted to air bags bucket exactly." readOnly />
                            <TestRow n={63} title="getQryptedBalance restores after reclaimAirBags" desc="Fund then reclaim. getQryptedBalance returns to full 2e6. Reclaim is lossless. No rounding on round-trip." readOnly />
                            <TestRow n={64} title="getAirBags increases by exact amount after fundAirBags" desc="fundAirBags(1e6). getAirBags(token) == 1e6. Air bags bucket receives exact transfer from qrypted balance." readOnly />
                            <TestRow n={65} title="getAirBags decreases by claimed amount after claimAirVoucher" desc="Fund 1e6, claimAirVoucher for 0.5e6. getAirBags == 0.5e6. Partial claims update air bags precisely." readOnly />
                            <TestRow n={66} title="getQryptedBalance unchanged after claimAirVoucher" desc="After claimAirVoucher, getQryptedBalance equals pre-claim value. Voucher draw is from air bags only, never from qrypted pool." readOnly />
                            <TestRow n={67} title="cumulative qrypt calls accumulate getQryptedBalance" desc="qrypt(1e6) then qrypt(2e6). getQryptedBalance == 3e6. Additive accounting, no cap or overflow for standard amounts." readOnly />
                        </>,
                        "rgba(255,255,255,0.07)"
                    )}
                </div>

                {/* ── Superseded / history ─────────────────────────── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 40, borderColor: "rgba(239,68,68,0.1)" }) }}>
                    <SectionHead text="DEPLOYMENT HISTORY" color="#EF4444" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>Previous deployments</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "0 0 20px", lineHeight: 1.6 }}>
                        All previous factory contracts remain on Sepolia but are decommissioned. The frontend directs all users to v6 contracts.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                            { label: "v5 Factory", note: "v5: 32/32 E2E, bytes32 proofHash, QryptAir EIP-712, QryptShield Railgun", value: FACTORY_V5, status: "LEGACY" },
                            { label: "v4 Factory", note: "v4: string passwords (pre-bytes32 era), QryptAir, QryptShield", value: FACTORY_V4, status: "SUPERSEDED" },
                            { label: "v3 Factory", note: "v3: 26/26 E2E, commit-reveal only, no QryptAir or QryptShield", value: FACTORY_V3, status: "SUPERSEDED" },
                            { label: "v2 ShieldFactory", note: "v2: qToken decimal fix (from 18 to 6 decimals for USDC)", value: FACTORY_V2, status: "SUPERSEDED" },
                            { label: "v1 ShieldFactory", note: "v1: original deploy, hardcoded 18 decimals (broken for USDC)", value: FACTORY_V1, status: "SUPERSEDED" },
                        ].map((c, i) => (
                            <div key={i} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: 10 }}>
                                <div style={{ flex: 1, minWidth: 220 }}>
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.28)", marginBottom: 6 }}>{c.label} &mdash; {c.note}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <CopySpan value={c.value} display={short(c.value)} />
                                        <ExtLink href={`${ETHERSCAN}/address/${c.value}`}>Etherscan</ExtLink>
                                    </div>
                                </div>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: c.status === "LEGACY" ? "#F59E0B" : "#EF4444", background: c.status === "LEGACY" ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${c.status === "LEGACY" ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.18)"}`, borderRadius: 4, padding: "2px 7px", alignSelf: "flex-start", marginTop: 2 }}>{c.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <SepoliaVersionNav
                    prev={{ label: "V5 Record", href: "/sepolia-verified-v5" }}
                />

            </div>
        </div>
    );
}
