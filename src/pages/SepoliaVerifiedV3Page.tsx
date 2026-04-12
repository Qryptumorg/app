import { useEffect, useState } from "react";
import SharedNavBar from "@/components/SharedNavBar";
import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
type SR = typeof translations.en.sepoliaRecord;

/* ── Constants — pending redeployment from clean wallet ──────────── */
const FACTORY_V3    = "";
const IMPL_V3       = "";
const VAULT_A_V3    = "";
const QUSDC_V3      = "";
const FACTORY_V2    = "";
const FACTORY_V1    = "";
const WALLET_A      = "";
const WALLET_B      = "";
const USDC_SEPOLIA  = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const ETHERSCAN     = "https://sepolia.etherscan.io";

/* ── TX hashes — pending redeployment from clean wallet ─────── */
const TX_CREATE_VAULT     = "";
const TX_APPROVE          = "";
const TX_SHIELD           = "";
const TX_COMMIT           = "";
const TX_REVEAL           = "";
const TX_CHANGE_PROOF     = "";
const TX_UNSHIELD         = "";

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
    const srBase = t.sepoliaRecord as SR;
    return (
        <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: dim ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.42)", letterSpacing: "0.04em" }}>{label}</span>
                {verified && !dim && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 4, padding: "1px 6px" }}>{srBase.verifiedMit}</span>}
                {dim && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#EF4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, padding: "1px 6px" }}>{srBase.supersededBadge}</span>}
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
                <marker id="av3" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                    <polygon points="0 0,7 3.5,0 7" fill="rgba(255,255,255,0.2)" />
                </marker>
            </defs>
            {steps.slice(0, -1).map((_, i) => {
                const x1 = xOf(i) + bw / 2, x2 = xOf(i + 1) - bw / 2;
                return <line key={i} x1={x1} y1={cy} x2={x2 - 4} y2={cy} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#av3)" />;
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

/* ── EIP-1167 clone diagram ────────────────────────────────────── */
function CloneDiagram() {
    const clones = [
        { label: "Wallet A Qrypt-Safe", x: 540, y: 40 },
        { label: "Wallet B Qrypt-Safe", x: 700, y: 100 },
        { label: "Wallet C Qrypt-Safe", x: 540, y: 160 },
        { label: "Wallet N Qrypt-Safe", x: 700, y: 220 },
    ];
    return (
        <svg viewBox="0 0 820 280" style={{ width: "100%", height: "auto", display: "block" }}>
            {/* impl box */}
            <rect x={20} y={100} width={170} height={68} rx="10" fill="rgba(98,126,234,0.1)" stroke="rgba(98,126,234,0.5)" strokeWidth="1.4" />
            <text x={105} y={127} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="#627EEA">PersonalQryptSafe</text>
            <text x={105} y={145} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9.5" fill="rgba(255,255,255,0.35)">Implementation (logic)</text>
            <text x={105} y={159} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(98,126,234,0.6)">0xe9D3...D8AC9</text>

            {/* factory box */}
            <rect x={240} y={100} width={150} height={68} rx="10" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.45)" strokeWidth="1.4" />
            <text x={315} y={127} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="#22C55E">QryptSafe</text>
            <text x={315} y={145} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9.5" fill="rgba(255,255,255,0.35)">Factory (EIP-1167)</text>
            <text x={315} y={159} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(34,197,94,0.6)">0xD778...F6364</text>

            {/* arrows factory to clones */}
            {clones.map((c, i) => (
                <g key={i}>
                    <line x1={390} y1={134} x2={c.x - 2} y2={c.y + 18} stroke="rgba(34,197,94,0.25)" strokeWidth="1.2" strokeDasharray="5 3" />
                    <rect x={c.x} y={c.y} width={160} height={36} rx="7" fill="rgba(6,182,212,0.07)" stroke="rgba(6,182,212,0.3)" strokeWidth="1" />
                    <text x={c.x + 80} y={c.y + 14} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="10" fontWeight="600" fill="#06B6D4">{c.label}</text>
                    <text x={c.x + 80} y={c.y + 28} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="8" fill="rgba(255,255,255,0.25)">45-byte EIP-1167 proxy</text>
                </g>
            ))}
            {/* impl to factory arrow */}
            <line x1={190} y1={134} x2={238} y2={134} stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" markerEnd="none" />
            <polygon points="236,130 244,134 236,138" fill="rgba(255,255,255,0.2)" />

            <text x={20} y={265} fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(255,255,255,0.2)" letterSpacing="0.05em">Each clone delegates all calls to the implementation. Logic is shared, storage is isolated per vault.</text>
        </svg>
    );
}

/* ── Test row ──────────────────────────────────────────────────── */
interface TRProps {
    pass: boolean; n: number; title: string; desc: string; note?: string;
    tx?: string; txLabel?: string;
    tx2?: string; txLabel2?: string;
    tx3?: string; txLabel3?: string;
    revertOnly?: boolean;
}
function TxChip({ hash, label }: { hash: string; label: string }) {
    const [ok, setOk] = useState(false);
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 5 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.26)" }}>{label}:</span>
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
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.22)", letterSpacing: "0.02em" }}>
                no on-chain TX
            </span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(239,68,68,0.55)", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.16)", borderRadius: 4, padding: "1px 7px", letterSpacing: "0.06em" }}>
                eth_call simulation
            </span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.18)" }}>
                -- call reverted before state change, no gas consumed, no TX created
            </span>
        </div>
    );
}
function TestRow({ pass, n, title, desc, note, tx, txLabel, tx2, txLabel2, tx3, txLabel3, revertOnly }: TRProps) {
    return (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: pass ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${pass ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                {pass
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.8"><path d="M20 6L9 17l-5-5" /></svg>
                    : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em" }}>{String(n).padStart(2, "0")}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{title}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: pass ? "#22C55E" : "#EF4444", background: pass ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${pass ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)"}`, borderRadius: 4, padding: "2px 6px" }}>{pass ? "PASS" : "FAIL"}</span>
                    {note && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, color: "#F59E0B", letterSpacing: "0.06em" }}>{note}</span>}
                </div>
                <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.6 }}>{desc}</p>
                {tx && <TxChip hash={tx} label={txLabel ?? "TX"} />}
                {tx2 && <TxChip hash={tx2} label={txLabel2 ?? "TX2"} />}
                {tx3 && <TxChip hash={tx3} label={txLabel3 ?? "TX3"} />}
                {revertOnly && <RevertChip />}
            </div>
        </div>
    );
}

/* ── Section tag ───────────────────────────────────────────────── */
function Tag({ text, color = "#627EEA" }: { text: string; color?: string }) {
    return <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color, marginBottom: 10 }}>{text}</div>;
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function SepoliaVerifiedV3Page() {
    const { t } = useLanguage();
    const sr = (t.sepoliaRecord as SR).v3;
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
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <img src="/sepolia-v3-hero.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", filter: "brightness(0.22) saturate(1.4)" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,7,16,0.1) 0%, rgba(5,7,16,0.65) 70%, #050710 100%)" }} />
                </div>

                <div style={{ position: "relative", zIndex: 1, maxWidth: W, margin: "0 auto", padding: pad }}>
                    <div style={{ padding: isMobile ? "100px 0 40px" : "110px 0 56px" }}>
                        <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 400px", gap: 60, alignItems: "center" }}>
                            {/* left */}
                            <div>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 20, padding: "4px 14px 4px 9px", marginBottom: 22 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px rgba(34,197,94,0.7)" }} />
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#22C55E", textTransform: "uppercase" }}>{sr.heroBadge}</span>
                                </div>
                                <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 36 : 56, letterSpacing: "-0.03em", lineHeight: 1.04, margin: "0 0 20px", color: "#fff" }}>
                                    {sr.heroTitle}
                                </h1>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.5)", margin: "0 0 36px", maxWidth: 520 }}>
                                    {sr.heroBody}
                                </p>
                                {/* stat pills */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                    {[
                                        { val: "84/84", label: sr.statLabels[0], color: "#22C55E" },
                                        { val: "26/26", label: sr.statLabels[1], color: "#627EEA" },
                                        { val: "v3", label: sr.statLabels[2], color: "#22C55E" },
                                        { val: "MIT", label: sr.statLabels[3], color: "#06B6D4" },
                                    ].map(s => (
                                        <div key={s.val} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${s.color}28`, borderRadius: 12, padding: "12px 18px", textAlign: "center", minWidth: 100 }}>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: s.color }}>{s.val}</div>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* right */}
                            {!isMobile && (
                                <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>
                                    <img src="/sepolia-v3-hero.png" alt="Vault visualization" style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ CONTENT ════════════════════════════════════════ */}
            <div style={{ maxWidth: W, margin: "0 auto", padding: pad }}>

                {/* ── What changed v2 to v3 ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20, borderColor: "rgba(34,197,94,0.18)" }) }}>
                    <Tag text={sr.v2ToV3Label} color="#22C55E" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.v2ToV3Heading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 28px", lineHeight: 1.6 }}>
                        {sr.v2ToV3Body}
                    </p>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {[
                            { ...sr.changes[0], color: "#22C55E" },
                            { ...sr.changes[1], color: "#22C55E" },
                            { ...sr.changes[2], color: "#EF4444" },
                            { ...sr.changes[3], color: "#EF4444" },
                            { ...sr.changes[4], color: "#627EEA" },
                            { ...sr.changes[5], color: "#627EEA" },
                            { ...sr.changes[6], color: "#06B6D4" },
                            { ...sr.changes[7], color: "#F59E0B" },
                        ].map(r => (
                            <div key={r.label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                <div style={{ flexShrink: 0, width: 20, height: 20, marginTop: 2, borderRadius: "50%", background: `${r.color}18`, border: `1px solid ${r.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="2.8"><path d="M20 6L9 17l-5-5" /></svg>
                                </div>
                                <div>
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{r.label}</div>
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.55 }}>{r.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Protocol Flow ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <Tag text={sr.flowLabel} />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.flowHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 28px", lineHeight: 1.6 }}>{sr.flowBody}</p>
                    <FlowDiagram />
                </div>

                {/* ── Active Contracts v3 ─── */}
                <div style={{ ...card({ marginBottom: 20, overflow: "hidden", borderColor: "rgba(34,197,94,0.18)" }) }}>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 380px" }}>
                        <div style={{ padding: isMobile ? "28px 18px" : "36px 40px" }}>
                            <Tag text={sr.activeContractsLabel} color="#22C55E" />
                            <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.activeContractsHeading}</h2>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 20px", lineHeight: 1.65 }}>
                                {sr.activeContractsBody}
                            </p>
                            <AddrRow label="QryptSafe factory (v3)" value={FACTORY_V3} verified link={`${ETHERSCAN}/address/${FACTORY_V3}#code`} />
                            <AddrRow label="PersonalQryptSafe implementation (v3)" value={IMPL_V3} verified link={`${ETHERSCAN}/address/${IMPL_V3}#code`} />
                            <AddrRow label="Wallet A Qrypt-Safe (vault clone)" value={VAULT_A_V3} link={`${ETHERSCAN}/address/${VAULT_A_V3}`} />
                            <AddrRow label="qUSDC ShieldToken (v3, 6 decimals)" value={QUSDC_V3} link={`${ETHERSCAN}/address/${QUSDC_V3}`} />
                            <AddrRow label="Sepolia USDC (Circle)" value={USDC_SEPOLIA} link={`${ETHERSCAN}/address/${USDC_SEPOLIA}`} />
                        </div>
                        {!isMobile && (
                            <div style={{ position: "relative", minHeight: 280 }}>
                                <img src="/sepolia-v3-contracts.png" alt="Contract architecture" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75) saturate(1.2)" }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,7,16,0.6) 0%, transparent 50%)" }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── EIP-1167 architecture ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <Tag text={sr.eipLabel} color="#627EEA" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.eipHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 24px", lineHeight: 1.6 }}>
                        {sr.eipBody} Used in production since 2018 by Uniswap v2 and Gnosis Safe.
                    </p>
                    <CloneDiagram />
                </div>

                {/* ── Previous versions ─── */}
                <div style={{ ...card({ marginBottom: 20, borderColor: "rgba(239,68,68,0.12)", padding: isMobile ? "28px 18px" : "36px 40px" }) }}>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "flex-start" }}>
                        <div>
                            <Tag text={sr.prevVersionLabel} color="#EF4444" />
                            <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.prevVersionHeading}</h2>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 20px", lineHeight: 1.65 }}>
                                {sr.prevVersionBody}
                            </p>
                            <AddrRow label="ShieldFactory v2" value={FACTORY_V2} dim link={`${ETHERSCAN}/address/${FACTORY_V2}#code`} />
                            <div style={{ marginTop: 12 }}>
                                <Link href="/sepolia-verified" style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(239,68,68,0.6)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    {sr.viewRecordLink}
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                                </Link>
                            </div>
                        </div>
                        <div>
                            <Tag text={sr.supersededLabel} color="#EF4444" />
                            <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.supersededHeading}</h2>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 20px", lineHeight: 1.65 }}>
                                {sr.supersededBody}
                            </p>
                            <AddrRow label="ShieldFactory v1" value={FACTORY_V1} dim link={`${ETHERSCAN}/address/${FACTORY_V1}#code`} />
                        </div>
                    </div>
                </div>

                {/* ── Unit Tests ─── */}
                <div style={{ ...card({ marginBottom: 20, overflow: "hidden" }) }}>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "340px 1fr" }}>
                        {!isMobile && (
                            <div style={{ position: "relative", minHeight: 320 }}>
                                <img src="/sepolia-v3-tests.png" alt="Test results" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7) saturate(1.3)" }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, rgba(5,7,16,0.1) 0%, transparent 50%)" }} />
                            </div>
                        )}
                        <div style={{ padding: isMobile ? "28px 18px" : "36px 40px" }}>
                            <Tag text={sr.unitTestsLabel} color="#22C55E" />
                            <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.unitTestsHeading}</h2>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 22px", lineHeight: 1.65 }}>
                                {sr.unitTestsBody}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {[
                                    { file: "QToken.test.js", n: 12, total: 12, topics: "Mint, burn, non-transferability, decimal precision" },
                                    { file: "ShieldFactory.test.js", n: 15, total: 15, topics: "Vault creation, no-admin, deployment safety" },
                                    { file: "PersonalVault.test.js", n: 44, total: 44, topics: "All operations, security invariants, edge cases" },
                                    { file: "integration.test.js", n: 12, total: 12, topics: "Full shield / transfer / unshield lifecycle" },
                                    { file: "extra.test.js", n: 1, total: 1, topics: "Miscellaneous coverage" },
                                ].map(s => (
                                    <div key={s.file} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                                            <span style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, color: "rgba(255,255,255,0.62)" }}>{s.file}</span>
                                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#22C55E" }}>{s.n}/{s.total}</span>
                                        </div>
                                        <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, marginBottom: 7, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg,#22C55E,#16A34A)", borderRadius: 2 }} />
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

                {/* ── Test wallets ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <Tag text={sr.testWalletsLabel} color="#8B5CF6" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 20px", color: "#fff" }}>{sr.testWalletsHeading}</h2>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                        {[
                            { label: "Wallet A", sub: "vault owner, initiator", value: WALLET_A, color: "#627EEA" },
                            { label: "Wallet B", sub: "transfer recipient", value: WALLET_B, color: "#8B5CF6" },
                            { label: "Vault A (v3)", sub: "Wallet A Qrypt-Safe clone", value: VAULT_A_V3, color: "#06B6D4" },
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
                    <p style={{ margin: "18px 0 0", fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.28)", lineHeight: 1.6 }}>
                        {sr.testWalletsBody}
                    </p>
                    <div style={{ marginTop: 8 }}>
                        <ExtLink href={`${ETHERSCAN}/address/${WALLET_A}`}>View all Wallet A transactions on Etherscan</ExtLink>
                    </div>
                </div>

                {/* ── Live E2E tests ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 60 }) }}>
                    <Tag text={sr.e2eTestsLabel} color="#F59E0B" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.e2eTestsHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 6px", lineHeight: 1.6 }}>
                        {sr.e2eTestsBody}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, margin: "0 0 20px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap", marginTop: 1 }}>T1-T5</span>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>Broadcast TX -- state changes permanently on-chain. Each has a real TX hash verifiable on Sepolia Etherscan.</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#EF4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap", marginTop: 1 }}>H + T revert</span>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>eth_call simulation -- call is simulated locally against the live contract. The EVM reverts before any state change. No gas consumed, no TX created, nothing appears on Etherscan. This is the correct way to verify revert behavior.</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22C55E" }}>T -- Functional Tests</span>
                    </div>
                    <TestRow pass n={1} title="Create Qrypt-Safe"
                        desc="Wallet A called createVault() on QryptSafe factory. A 45-byte EIP-1167 minimal proxy clone deployed at Vault A address. Factory confirmed: hasVault(walletA) returns true."
                        tx={TX_CREATE_VAULT} txLabel="createVault" />
                    <TestRow pass n={2} title="Shield USDC"
                        desc="Wallet A approved Vault A to spend USDC, then called shield(). qUSDC ShieldToken deployed and minted to Vault A. Shielded balance confirmed: 2.0 qUSDC with correct 6-decimal precision."
                        tx={TX_APPROVE} txLabel="approve USDC"
                        tx2={TX_SHIELD} txLabel2="shield" />
                    <TestRow pass n={3} title="Commit-Reveal Transfer"
                        desc="Two-step transfer from Vault A to Wallet B. Step 1: commitTransfer() stores a keccak256 commitment on-chain. Step 2: revealTransfer() after 1 block validates the commitment, burns qUSDC, sends raw USDC directly to Wallet B. Wallet B received 1.0 USDC as ERC-20, not qUSDC."
                        tx={TX_COMMIT} txLabel="commitTransfer"
                        tx2={TX_REVEAL} txLabel2="revealTransfer" />
                    <TestRow pass n={4} title="Change Vault Proof"
                        desc="Wallet A changed the vault proof via changeVaultProof(). Contract validates the new proof format (3 lowercase letters + 3 digits). The old proof no longer unlocks the vault. On-chain passwordHash updated."
                        tx={TX_CHANGE_PROOF} txLabel="changeVaultProof" />
                    <TestRow pass n={5} title="Unshield with Updated Vault Proof"
                        desc="Wallet A unshielded USDC using the new vault proof. The old proof was rejected first (correctly), confirming the change took effect. qUSDC burned, raw USDC returned to Wallet A."
                        tx={TX_UNSHIELD} txLabel="unshield" />

                    <div style={{ margin: "20px 0 8px" }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#EF4444" }}>H -- Security Invariants (all must revert)</span>
                    </div>
                    <TestRow pass n={6} title="H1: qToken direct transfer reverts" note="must revert" revertOnly
                        desc="Attempted to call transfer() directly on qUSDC. Reverted with 'qToken: transfers disabled, use Qryptum app'. No ERC-20 wallet can move qTokens regardless of private key." />
                    <TestRow pass n={7} title="H2: Wrong vault proof reverts" note="must revert" revertOnly
                        desc="Called shield() with an incorrect vault proof. Reverted with 'Wrong vault proof'. Vault funds untouched. Brute-force is blocked at the gas level." />
                    <TestRow pass n={8} title="H3: Cross-wallet vault access reverts" note="must revert" revertOnly
                        desc="Wallet B attempted to call unshield() on Wallet A vault. Reverted with 'Not vault owner'. The onlyOwner modifier enforces msg.sender == owner at the vault contract level." />
                    <TestRow pass n={9} title="H4: Double-vault creation reverts" note="must revert" revertOnly
                        desc="Wallet A attempted a second createVault() call. Reverted with 'Qrypt-Safe already exists for this wallet'. Factory enforces one vault per address." />
                    <TestRow pass n={10} title="H5: Shield below minimum amount reverts" note="must revert" revertOnly
                        desc="Attempted shield() with an amount below MINIMUM_SHIELD_AMOUNT (1,000,000 units). Reverted with 'Below minimum shield amount'." />
                    <TestRow pass n={11} title="H6: Self-transfer reverts" note="must revert" revertOnly
                        desc="Wallet A attempted revealTransfer() to its own wallet address. Reverted with 'Cannot transfer to yourself'. Prevents vault balance from being vacated via circular transfer." />
                    <TestRow pass n={12} title="H7: Replay commit reverts" note="must revert" revertOnly
                        desc="Re-submitted the same commitHash after revealTransfer() completed. Reverted. Used commitments cannot be reused." />
                    <TestRow pass n={13} title="H8: Expired reveal reverts" note="must revert" revertOnly
                        desc="Attempted revealTransfer() after COMMIT_EXPIRY_SECONDS (600 seconds) elapsed since commitTransfer(). Reverted with 'Commit expired'. Time-locks are enforced on-chain." />
                    <TestRow pass n={14} title="H9: Wrong vault proof in reveal reverts" note="must revert" revertOnly
                        desc="Submitted commitTransfer() with a valid commitment hash, then called revealTransfer() with an incorrect vault proof. Reverted. Two-step scheme does not weaken the vault proof requirement." />
                    <TestRow pass n={15} title="T6: Shield zero amount reverts" note="must revert" revertOnly
                        desc="Attempted shield() with amount 0. Reverted. Zero-amount shield is blocked before any ERC-20 interaction." />
                    <TestRow pass n={16} title="T7: Unshield more than balance reverts" note="must revert" revertOnly
                        desc="Attempted unshield() for an amount exceeding the shielded balance. Reverted by ERC-20 burn underflow check." />
                    <TestRow pass n={17} title="T8: emergencyWithdraw before delay reverts" note="must revert" revertOnly
                        desc="Called emergencyWithdraw() before EMERGENCY_DELAY_BLOCKS (1,296,000 blocks) of inactivity. Reverted with 'Vault not inactive long enough'." />
                    <TestRow pass n={18} title="T9: changeVaultProof wrong format reverts" note="must revert" revertOnly
                        desc="Attempted changeVaultProof() with a new proof that does not match the 3-letter + 3-digit format. Reverted with 'Invalid proof format'." />
                    <TestRow pass n={19} title="T10: Shield without approve reverts" note="must revert" revertOnly
                        desc="Attempted shield() without first calling ERC-20 approve() on the vault address. Reverted by the ERC-20 transferFrom() allowance check." />
                    <TestRow pass n={20} title="T11: Unshield with zero amount reverts" note="must revert" revertOnly
                        desc="Attempted unshield() with amount 0. Reverted. Mirrors shield zero-amount protection." />
                    <TestRow pass n={21} title="T12: commitTransfer with zero amount reverts" note="must revert" revertOnly
                        desc="Committed a transfer for 0 tokens. revealTransfer() reverted: zero-value transfers are blocked." />
                    <TestRow pass n={22} title="T13: Shield 18-decimal token, correct display" note="decimal precision"
                        desc="Shielded a mock 18-decimal ERC-20. qToken deployed with 18 decimals matching the underlying. Etherscan and app display the correct value." />
                    <TestRow pass n={23} title="T14: getShieldedBalance returns correct value" note="view call"
                        desc="After shield and partial unshield, getShieldedBalance() returns the precise remaining qToken balance. Decimal conversion confirmed correct. Read-only eth_call against live contract state, no TX created." />
                    <TestRow pass n={24} title="T15: getQTokenAddress is stable" note="view call"
                        desc="Called getQTokenAddress() for a token before and after shielding. Returns the deployed qToken address consistently. Read-only eth_call, no TX created." />
                    <TestRow pass n={25} title="T16: VaultCreated event emitted correctly"
                        desc="Checked VaultCreated event logs from the createVault() call. Event fields: owner, vault, passwordHash all match expected values. Same TX as T1."
                        tx={TX_CREATE_VAULT} txLabel="createVault (event source)" />
                    <TestRow pass n={26} title="T17: TokenShielded event emitted correctly"
                        desc="Checked TokenShielded event logs from the shield() call. Fields: token, qToken, amount, owner all correct. Same TX as T2. Event is on-chain auditable for every shield operation."
                        tx={TX_SHIELD} txLabel="shield (event source)" />
                </div>

            </div>
        </div>
    );
}
