import { useEffect, useState } from "react";
import SharedNavBar from "@/components/SharedNavBar";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
type SR = typeof translations.en.sepoliaRecord;

/* ── Constants — pending redeployment from clean wallet ──────────── */
const FACTORY_V5  = "";
const IMPL_V5     = "";
const VAULT_A     = "";
const VAULT_B     = "";
const QUSDC       = "";
const FACTORY_V4  = "";
const FACTORY_V3  = "";
const WALLET_A    = "";
const WALLET_B    = "";
const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const ETHERSCAN   = "https://sepolia.etherscan.io";

/* ── TX hashes — pending redeployment from clean wallet ─────── */
const TX_APPROVE        = "";
const TX_COMMIT         = "";
const TX_REVEAL         = "";
const TX_CHANGE_PROOF   = "";
const TX_SHIELD_PROOF2  = "";
const TX_UNSHIELD       = "";
const TX_REDEEM_AIR     = "";
const TX_UNSHIELD_RAIL  = "";

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
    const sr = t.sepoliaRecord as SR;
    return (
        <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: dim ? "rgba(255,255,255,0.26)": "rgba(255,255,255,0.42)", letterSpacing: "0.04em" }}>{label}</span>
                {verified && !dim && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 4, padding: "1px 6px" }}>{sr.verifiedMit}</span>}
                {dim && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#EF4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, padding: "1px 6px" }}>{sr.supersededBadge}</span>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <CopySpan value={value} display={short(value)} />
                <ExtLink href={link ?? `${ETHERSCAN}/address/${value}`}>Etherscan</ExtLink>
            </div>
        </div>
    );
}

/* ── Flow diagram shared: arrow marker ──────────────────────────── */
function FlowArrow({ id, color }: { id: string; color: string }) {
    return (
        <marker id={id} markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
            <path d="M0,0.5 L7,3.5 L0,6.5 Z" fill={color} />
        </marker>
    );
}

/* ── Flow diagram: QryptSafe ────────────────────────────────────── */
function FlowDiagramSafe() {
    const W = 920, H = 160;
    const nodes = [
        { label: "ERC-20 Token", sub: "Wallet holds USDC", color: "#627EEA", phase: 0 },
        { label: "shield()", sub: "bytes32 proofHash", color: "#22C55E", phase: 0 },
        { label: "PersonalQryptSafe", sub: "qToken minted", color: "#06B6D4", phase: 0 },
        { label: "commitTransfer()", sub: "hash stored on-chain", color: "#F59E0B", phase: 1 },
        { label: "revealTransfer()", sub: "bytes32 + nonce", color: "#F97316", phase: 1 },
        { label: "Recipient", sub: "receives raw ERC-20", color: "#22C55E", phase: 1 },
    ];
    const bw = 130, bh = 52, gap = 24;
    const totalW = nodes.length * bw + (nodes.length - 1) * gap;
    const startX = (W - totalW) / 2;
    const xs = nodes.map((_, i) => startX + i * (bw + gap));
    const by = 52;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
                <FlowArrow id="arr-safe-0" color="rgba(34,197,94,0.7)" />
                <FlowArrow id="arr-safe-1" color="rgba(245,158,11,0.7)" />
            </defs>
            {/* Phase bands */}
            <rect x={xs[0] - 6} y={38} width={xs[2] + bw - xs[0] + 12} height={bh + 4} rx={10}
                fill="none" stroke="rgba(34,197,94,0.18)" strokeWidth="1.2" strokeDasharray="5 3" />
            <text x={(xs[0] + xs[2] + bw) / 2} y={32} textAnchor="middle"
                fontFamily="Inter,sans-serif" fontSize="8" fill="rgba(34,197,94,0.5)" letterSpacing="0.12em">SHIELD PHASE</text>
            <rect x={xs[3] - 6} y={38} width={xs[5] + bw - xs[3] + 12} height={bh + 4} rx={10}
                fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth="1.2" strokeDasharray="5 3" />
            <text x={(xs[3] + xs[5] + bw) / 2} y={32} textAnchor="middle"
                fontFamily="Inter,sans-serif" fontSize="8" fill="rgba(245,158,11,0.5)" letterSpacing="0.12em">COMMIT / REVEAL</text>
            {/* Arrows */}
            {nodes.slice(0, -1).map((_, i) => {
                const x1 = xs[i] + bw + 2, x2 = xs[i + 1] - 4;
                const markerId = i < 2 ? "arr-safe-0" : "arr-safe-1";
                const stroke = i < 2 ? "rgba(34,197,94,0.45)" : i === 2 ? "rgba(255,255,255,0.2)" : "rgba(245,158,11,0.45)";
                return <line key={i} x1={x1} y1={by + bh / 2} x2={x2} y2={by + bh / 2}
                    stroke={stroke} strokeWidth="1.6" markerEnd={`url(#${markerId})`} />;
            })}
            {/* Boxes */}
            {nodes.map((n, i) => (
                <g key={i}>
                    <rect x={xs[i]} y={by} width={bw} height={bh} rx={9}
                        fill="rgba(12,14,36,0.95)" stroke={n.color} strokeWidth="1.4" strokeOpacity="0.55" />
                    <rect x={xs[i]} y={by} width={bw} height={18} rx={9}
                        fill={n.color} fillOpacity="0.12" />
                    <rect x={xs[i]} y={by + 9} width={bw} height={9}
                        fill={n.color} fillOpacity="0.12" />
                    <text x={xs[i] + bw / 2} y={by + 14} textAnchor="middle"
                        fontFamily="Inter,sans-serif" fontSize="10" fontWeight="700" fill={n.color}>{n.label}</text>
                    <text x={xs[i] + bw / 2} y={by + 32} textAnchor="middle"
                        fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(255,255,255,0.45)">{n.sub}</text>
                </g>
            ))}
        </svg>
    );
}

/* ── Flow diagram: QryptAir ─────────────────────────────────────── */
function FlowDiagramAir() {
    const W = 920, H = 160;
    const nodes = [
        { label: "Vault Owner", sub: "Wallet A signs", color: "#F59E0B" },
        { label: "Sign EIP-712", sub: "Voucher offline", color: "#F59E0B" },
        { label: "Voucher", sub: "code + sig", color: "#06B6D4" },
        { label: "Anyone", sub: "relays tx", color: "#8B5CF6" },
        { label: "QryptSafe", sub: "verify ECDSA + nonce", color: "#06B6D4" },
        { label: "Recipient", sub: "receives ERC-20", color: "#22C55E" },
    ];
    const bw = 130, bh = 52, gap = 24;
    const totalW = nodes.length * bw + (nodes.length - 1) * gap;
    const startX = (W - totalW) / 2;
    const xs = nodes.map((_, i) => startX + i * (bw + gap));
    const by = 52;
    const divX = (xs[2] + bw + xs[3]) / 2;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
                <FlowArrow id="arr-air-0" color="rgba(245,158,11,0.7)" />
                <FlowArrow id="arr-air-1" color="rgba(139,92,246,0.7)" />
            </defs>
            {/* Zone fills */}
            <rect x={xs[0] - 8} y={34} width={divX - xs[0] + 4} height={bh + 8} rx={10}
                fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.15)" strokeWidth="1" strokeDasharray="4 3" />
            <text x={(xs[0] + divX) / 2 - 4} y={29} textAnchor="middle"
                fontFamily="Inter,sans-serif" fontSize="8" fill="rgba(245,158,11,0.5)" letterSpacing="0.12em">OFFLINE</text>
            <rect x={divX + 4} y={34} width={xs[5] + bw - divX - 4} height={bh + 8} rx={10}
                fill="rgba(139,92,246,0.05)" stroke="rgba(139,92,246,0.15)" strokeWidth="1" strokeDasharray="4 3" />
            <text x={(divX + xs[5] + bw) / 2 + 4} y={29} textAnchor="middle"
                fontFamily="Inter,sans-serif" fontSize="8" fill="rgba(139,92,246,0.5)" letterSpacing="0.12em">ON-CHAIN</text>
            {/* Divider */}
            <line x1={divX} y1={28} x2={divX} y2={H - 12}
                stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 3" />
            {/* Arrows */}
            {nodes.slice(0, -1).map((_, i) => {
                const x1 = xs[i] + bw + 2, x2 = xs[i + 1] - 4;
                const isOffline = i < 2;
                const isCross = i === 2;
                return <line key={i} x1={x1} y1={by + bh / 2} x2={x2} y2={by + bh / 2}
                    stroke={isOffline ? "rgba(245,158,11,0.45)" : isCross ? "rgba(255,255,255,0.2)" : "rgba(139,92,246,0.45)"}
                    strokeWidth="1.6"
                    strokeDasharray={isCross ? "4 3" : ""}
                    markerEnd={`url(#${isOffline ? "arr-air-0" : "arr-air-1"})`} />;
            })}
            {/* Boxes */}
            {nodes.map((n, i) => (
                <g key={i}>
                    <rect x={xs[i]} y={by} width={bw} height={bh} rx={9}
                        fill="rgba(12,14,36,0.95)" stroke={n.color} strokeWidth="1.4" strokeOpacity="0.55" />
                    <rect x={xs[i]} y={by} width={bw} height={18} rx={9}
                        fill={n.color} fillOpacity="0.12" />
                    <rect x={xs[i]} y={by + 9} width={bw} height={9}
                        fill={n.color} fillOpacity="0.12" />
                    <text x={xs[i] + bw / 2} y={by + 14} textAnchor="middle"
                        fontFamily="Inter,sans-serif" fontSize="10" fontWeight="700" fill={n.color}>{n.label}</text>
                    <text x={xs[i] + bw / 2} y={by + 32} textAnchor="middle"
                        fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(255,255,255,0.45)">{n.sub}</text>
                </g>
            ))}
        </svg>
    );
}

/* ── Flow diagram: QryptShield ──────────────────────────────────── */
function FlowDiagramShield() {
    const W = 920, H = 160;
    const nodes = [
        { label: "PersonalQryptSafe", sub: "qToken balance", color: "#8B5CF6" },
        { label: "unshieldToRailgun()", sub: "bytes32 proofHash", color: "#8B5CF6" },
        { label: "Burn qToken", sub: "CEI: checks first", color: "#EF4444" },
        { label: "Approve + Call", sub: "Railgun proxy", color: "#06B6D4" },
        { label: "Revoke Approval", sub: "zero allowance", color: "#06B6D4" },
        { label: "Railgun ZK Pool", sub: "private shielded note", color: "#22C55E" },
    ];
    const bw = 130, bh = 52, gap = 24;
    const totalW = nodes.length * bw + (nodes.length - 1) * gap;
    const startX = (W - totalW) / 2;
    const xs = nodes.map((_, i) => startX + i * (bw + gap));
    const by = 52;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
                <FlowArrow id="arr-sh-0" color="rgba(139,92,246,0.7)" />
                <FlowArrow id="arr-sh-1" color="rgba(6,182,212,0.7)" />
                <FlowArrow id="arr-sh-2" color="rgba(34,197,94,0.7)" />
            </defs>
            {/* Atomic bracket */}
            <rect x={xs[2] - 6} y={34} width={xs[4] + bw - xs[2] + 12} height={bh + 8} rx={10}
                fill="rgba(6,182,212,0.04)" stroke="rgba(6,182,212,0.2)" strokeWidth="1" strokeDasharray="4 3" />
            <text x={(xs[2] + xs[4] + bw) / 2} y={29} textAnchor="middle"
                fontFamily="Inter,sans-serif" fontSize="8" fill="rgba(6,182,212,0.55)" letterSpacing="0.12em">ATOMIC SEQUENCE</text>
            {/* Arrows */}
            {nodes.slice(0, -1).map((_, i) => {
                const x1 = xs[i] + bw + 2, x2 = xs[i + 1] - 4;
                const markerId = i <= 1 ? "arr-sh-0" : i <= 3 ? "arr-sh-1" : "arr-sh-2";
                const stroke = i <= 1 ? "rgba(139,92,246,0.4)" : i <= 3 ? "rgba(6,182,212,0.5)" : "rgba(34,197,94,0.4)";
                return <line key={i} x1={x1} y1={by + bh / 2} x2={x2} y2={by + bh / 2}
                    stroke={stroke} strokeWidth="1.6" markerEnd={`url(#${markerId})`} />;
            })}
            {/* Boxes */}
            {nodes.map((n, i) => (
                <g key={i}>
                    <rect x={xs[i]} y={by} width={bw} height={bh} rx={9}
                        fill="rgba(12,14,36,0.95)" stroke={n.color} strokeWidth="1.4" strokeOpacity="0.55" />
                    <rect x={xs[i]} y={by} width={bw} height={18} rx={9}
                        fill={n.color} fillOpacity="0.12" />
                    <rect x={xs[i]} y={by + 9} width={bw} height={9}
                        fill={n.color} fillOpacity="0.12" />
                    <text x={xs[i] + bw / 2} y={by + 14} textAnchor="middle"
                        fontFamily="Inter,sans-serif" fontSize="10" fontWeight="700" fill={n.color}>{n.label}</text>
                    <text x={xs[i] + bw / 2} y={by + 32} textAnchor="middle"
                        fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(255,255,255,0.45)">{n.sub}</text>
                </g>
            ))}
        </svg>
    );
}


/* ── Test row chips ─────────────────────────────────────────────── */
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

interface TRProps {
    n: number; title: string; desc: string; note?: string;
    tx?: string; revertOnly?: boolean;
}
function TestRow({ n, title, desc, note, tx, revertOnly }: TRProps) {
    return (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.8"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em" }}>{String(n).padStart(2, "0")}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{title}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 4, padding: "2px 6px" }}>PASS</span>
                    {note && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, color: "#F59E0B", letterSpacing: "0.06em" }}>{note}</span>}
                </div>
                <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.6 }}>{desc}</p>
                {tx && <TxChip hash={tx} />}
                {revertOnly && <RevertChip />}
            </div>
        </div>
    );
}

function SectionHead({ text, color = "#627EEA" }: { text: string; color?: string }) {
    return (
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color, marginBottom: 12, paddingTop: 8 }}>{text}</div>
    );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function SepoliaVerifiedV5Page() {
    const { t } = useLanguage();
    const sr = (t.sepoliaRecord as SR).v5;
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 900: false);
    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    const W = 1200;
    const pad = isMobile ? "0 18px": "0 40px";
    const card = (extra?: React.CSSProperties): React.CSSProperties => ({
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        ...extra,
    });

    return (
        <div style={{ minHeight: "100vh", background: "#000000", color: "#fff" }}>
            <SharedNavBar />

            {/* ═══ HERO ═══════════════════════════════════════════ */}
            <div style={{ position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <img src="/sepolia-vault-hero.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", filter: "brightness(0.18) saturate(1.2)" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 70%, #000000 100%)" }} />
                </div>

                <div style={{ position: "relative", zIndex: 1, maxWidth: W, margin: "0 auto", padding: pad }}>
                    <div style={{ padding: isMobile ? "100px 0 40px": "110px 0 56px" }}>
                        <div style={{ display: isMobile ? "block": "grid", gridTemplateColumns: "1fr 400px", gap: 60, alignItems: "center" }}>
                            <div>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 20, padding: "4px 14px 4px 9px", marginBottom: 22 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px rgba(34,197,94,0.7)" }} />
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#22C55E", textTransform: "uppercase" }}>{sr.heroBadge}</span>
                                </div>
                                <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 36: 56, letterSpacing: "-0.03em", lineHeight: 1.04, margin: "0 0 20px", color: "#fff" }}>
                                    {sr.heroTitle}
                                </h1>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.5)", margin: "0 0 36px", maxWidth: 520 }}>
                                    {sr.heroBody}
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                    {[
                                        { val: "32/32", label: sr.statLabels[0], color: "#22C55E" },
                                        { val: "bytes32", label: sr.statLabels[1], color: "#8B5CF6" },
                                        { val: "3", label: sr.statLabels[2], color: "#F59E0B" },
                                        { val: "MIT", label: sr.statLabels[3], color: "#06B6D4" },
                                    ].map(s => (
                                        <div key={s.val} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${s.color}28`, borderRadius: 12, padding: "12px 18px", textAlign: "center", minWidth: 110 }}>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: s.color }}>{s.val}</div>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {!isMobile && (
                                <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>
                                    <img src="/sepolia-vault-hero.png" alt="Vault visualization" style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ CONTENT ════════════════════════════════════════ */}
            <div style={{ maxWidth: W, margin: "0 auto", padding: pad }}>

                {/* ── v4 to v5 changes ────── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px": "36px 40px", marginBottom: 20, borderColor: "rgba(34,197,94,0.18)" }) }}>
                    <SectionHead text={sr.v4ToV5Label} color="#22C55E" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.v4ToV5Heading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 28px", lineHeight: 1.6 }}>
                        {sr.v4ToV5Body}
                    </p>
                    <div style={{ display: isMobile ? "block": "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {[
                            { ...sr.changes[0], color: "#22C55E" },
                            { ...sr.changes[1], color: "#22C55E" },
                            { ...sr.changes[2], color: "#8B5CF6" },
                            { ...sr.changes[3], color: "#F59E0B" },
                            { ...sr.changes[4], color: "#627EEA" },
                            { ...sr.changes[5], color: "#06B6D4" },
                        ].map((item, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${item.color}18`, borderRadius: 14, padding: "18px 20px" }}>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 8, letterSpacing: "-0.01em" }}>{item.label}</div>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Contract addresses ────── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px": "36px 40px", marginBottom: 20 }) }}>
                    <SectionHead text={sr.addrLabel} color="#22C55E" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 24px", color: "#fff" }}>{sr.addrHeading}</h2>
                    <AddrRow label={sr.addrLabels.factory} value={FACTORY_V5} verified link={`${ETHERSCAN}/address/${FACTORY_V5}#code`} />
                    <AddrRow label={sr.addrLabels.impl} value={IMPL_V5} verified link={`${ETHERSCAN}/address/${IMPL_V5}#code`} />
                    <AddrRow label={sr.addrLabels.vaultA} value={VAULT_A} link={`${ETHERSCAN}/address/${VAULT_A}`} />
                    <AddrRow label={sr.addrLabels.vaultB} value={VAULT_B} link={`${ETHERSCAN}/address/${VAULT_B}`} />
                    <AddrRow label={sr.addrLabels.qusdc} value={QUSDC} link={`${ETHERSCAN}/address/${QUSDC}`} />
                    <div style={{ paddingTop: 12 }}>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.26)" }}>
                            USDC Sepolia: <CopySpan value={USDC_SEPOLIA} display={short(USDC_SEPOLIA)} />
                            <span style={{ marginLeft: 10 }}><ExtLink href={`${ETHERSCAN}/address/${USDC_SEPOLIA}`}>Etherscan</ExtLink></span>
                        </div>
                    </div>
                </div>

                {/* ── Flow diagrams ────── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px": "36px 40px", marginBottom: 20 }) }}>
                    <SectionHead text={sr.flowsLabel} color="#627EEA" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.flowsHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "0 0 28px", lineHeight: 1.6 }}>{sr.flowsBody}</p>

                    <div style={{ marginBottom: 28 }}>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: "#22C55E", letterSpacing: "0.08em", marginBottom: 10 }}>{sr.flowSafeLabel}</div>
                        <FlowDiagramSafe />
                    </div>
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: "#F59E0B", letterSpacing: "0.08em", marginBottom: 10 }}>{sr.flowAirLabel}</div>
                        <FlowDiagramAir />
                    </div>
                    <div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: "#8B5CF6", letterSpacing: "0.08em", marginBottom: 10 }}>{sr.flowShieldLabel}</div>
                        <FlowDiagramShield />
                    </div>
                </div>

                {/* ── Test results bento ────── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px": "36px 40px", marginBottom: 20 }) }}>
                    <SectionHead text={sr.testResultsLabel} color="#22C55E" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>{sr.testResultsHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "0 0 8px", lineHeight: 1.6 }}>{sr.testResultsBody}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                        {["Wallet A: " + short(WALLET_A), "Wallet B: " + short(WALLET_B)].map(v => (
                            <span key={v} style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "3px 10px" }}>{v}</span>
                        ))}
                    </div>

                    {/* helpers */}
                    {(() => {
                        const chartCol = "220px";
                        const bentoRow = (chartLeft: boolean, chart: React.ReactNode, tests: React.ReactNode, accentBorder: string) => (
                            <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: chartLeft ? `${chartCol} 1fr` : `1fr ${chartCol}`, gap: 0, marginBottom: 10, borderRadius: 14, border: `1px solid ${accentBorder}`, overflow: "hidden" }}>
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

                        const imgStyle: React.CSSProperties = { width: "100%", height: "100%", minHeight: 180, objectFit: "cover", display: "block" };
                        const g1chart = <img src="/images/bento-infra.jpg" alt="Infrastructure" style={imgStyle} />;
                        const g2chart = <img src="/images/bento-setup.jpg" alt="Setup" style={imgStyle} />;
                        const g3chart = <img src="/images/bento-safe.jpg" alt="QryptSafe" style={imgStyle} />;
                        const g4chart = <img src="/images/bento-air.jpg" alt="QryptAir" style={imgStyle} />;
                        const g5chart = <img src="/images/bento-shield.jpg" alt="QryptShield" style={imgStyle} />;
                        const g6chart = <img src="/images/bento-security.jpg" alt="Security" style={imgStyle} />;

                        return (
                            <>
                                {bentoRow(true, g1chart,
                                    <><SectionHead text={sr.groupLabels[0]} color="rgba(255,255,255,0.4)" />
                                    <TestRow n={1} title="Factory v5 has on-chain bytecode" desc={`QryptSafe Factory at ${FACTORY_V5}: bytecode confirmed on Sepolia.`} />
                                    <TestRow n={2} title="Impl v5 has on-chain bytecode" desc={`PersonalQryptSafe Implementation at ${IMPL_V5}: bytecode confirmed on Sepolia.`} /></>,
                                    "rgba(255,255,255,0.07)"
                                )}
                                {bentoRow(false, g2chart,
                                    <><SectionHead text={sr.groupLabels[1]} color="rgba(255,255,255,0.4)" />
                                    <TestRow n={3} title="Create Vault A via factory" desc={`Factory deployed EIP-1167 clone for Wallet A. Vault A: ${VAULT_A}.`} note="REUSED" />
                                    <TestRow n={4} title="Create Vault B via factory" desc={`Factory deployed separate EIP-1167 clone for Wallet B. Vault B: ${VAULT_B}. Storage isolated from Vault A.`} note="REUSED" />
                                    <TestRow n={5} title="Approve USDC for Vault A (15 USDC)" desc="Wallet A called ERC-20 approve(vaultA, 15e6). Required before any shield operation." tx={TX_APPROVE} /></>,
                                    "rgba(255,255,255,0.07)"
                                )}
                                {bentoRow(true, g3chart,
                                    <><SectionHead text={sr.groupLabels[2]} color="#22C55E" />
                                    <TestRow n={6} title="shield() 10 USDC: correct bytes32 proofHash" desc={`10 USDC shielded. 10 qUSDC minted. proofHash = keccak256(password). qUSDC: ${QUSDC}.`} note="REUSED" />
                                    <TestRow n={7} title="shield() with wrong proofHash: revert expected" desc="shield() with incorrect bytes32 hash reverts 'Invalid vault proof'. Password protection verified." revertOnly />
                                    <TestRow n={8} title="shield() from non-owner Wallet B: revert expected" desc="Wallet B cannot call Vault A. Reverts 'Not vault owner'. onlyOwner strictly enforced." revertOnly />
                                    <TestRow n={9} title="shield() amount below 1e6 minimum: revert expected" desc="Amounts below MINIMUM_SHIELD_AMOUNT (1e6) revert 'Amount below minimum'. Dust attack prevention confirmed." revertOnly />
                                    <TestRow n={10} title="commitTransfer(): hashed intent to send 5 USDC to Wallet B" desc="commitHash = keccak256(abi.encodePacked(proofHash, nonce, token, to, amount)). Two-layer hash: password never in calldata." tx={TX_COMMIT} />
                                    <TestRow n={11} title="revealTransfer() with non-existent commit: revert expected" desc="Reveal with no matching commit reverts 'Commit not found'. Prevents replay-without-commit attacks." revertOnly />
                                    <TestRow n={12} title="revealTransfer() with wrong proofHash: revert expected" desc="Wrong proofHash in revealTransfer reverts 'Invalid vault proof'. Password protection at reveal phase." revertOnly />
                                    <TestRow n={13} title="revealTransfer() success: 5 USDC from Vault A to Wallet B" desc="Wallet A reveals commit. 5 USDC transferred to Wallet B. Event TransferExecuted emitted. Nonce marked used." tx={TX_REVEAL} />
                                    <TestRow n={14} title="Replay used commitHash: revert expected" desc="Re-using a consumed nonce reverts 'Commit already used'. One-time nonce replay protection confirmed." revertOnly />
                                    <TestRow n={15} title="changeVaultProof(): rotate bytes32 proof" desc="Vault proof rotated PROOF1 to PROOF2. Both params bytes32 hashes. Event VaultProofChanged. Raw passwords never on-chain." tx={TX_CHANGE_PROOF} />
                                    <TestRow n={16} title="shield() with OLD proof after rotation: revert expected" desc="Old PROOF1 rejected after rotation. Reverts 'Invalid vault proof'. Key rotation enforcement confirmed." revertOnly />
                                    <TestRow n={17} title="shield() 3 USDC with NEW proof: success" desc="New PROOF2 accepted after rotation. 3 USDC shielded. Vault proof change is atomic and immediate." tx={TX_SHIELD_PROOF2} />
                                    <TestRow n={18} title="unshield() 2 USDC back to Wallet A: success" desc="Vault burns 2 qUSDC, transfers 2 USDC to Wallet A. Event TokenUnshielded emitted." tx={TX_UNSHIELD} />
                                    <TestRow n={19} title="unshield() over shielded balance: revert expected" desc="Requesting more than balance reverts 'Insufficient shielded balance'. Over-withdrawal protected." revertOnly /></>,
                                    "rgba(34,197,94,0.1)"
                                )}
                                {bentoRow(false, g4chart,
                                    <><SectionHead text={sr.groupLabels[3]} color="#F59E0B" />
                                    <TestRow n={20} title="Create EIP-712 QryptAir voucher: offline signature" desc="Wallet A signs Voucher struct off-chain. Domain: {name:'QryptAir', version:'1', chainId:11155111}. transferCodeHash = keccak256(transferCode). Local ECDSA verify confirmed." />
                                    <TestRow n={21} title="redeemAirVoucher(): Wallet B redeems 2 USDC voucher" desc="Wallet B calls redeemAirVoucher. 2 USDC delivered. Anyone with valid signature can redeem. Event AirVoucherRedeemed emitted." tx={TX_REDEEM_AIR} />
                                    <TestRow n={22} title="redeemAirVoucher() replay same nonce: revert expected" desc="Re-using a redeemed voucher nonce reverts 'Voucher already redeemed'. One-time-use nonce enforcement confirmed." revertOnly />
                                    <TestRow n={23} title="redeemAirVoucher() expired deadline: revert expected" desc="Deadline in the past reverts 'Voucher expired'. Time-bound protection confirmed." revertOnly />
                                    <TestRow n={24} title="redeemAirVoucher() signature over wrong transferCodeHash: revert expected" desc="Sig signed over wrong hash: ECDSA.recover returns wrong address. Reverts 'Sig not from vault owner'. Voucher integrity confirmed." revertOnly />
                                    <TestRow n={25} title="redeemAirVoucher() signed by non-vault-owner: revert expected" desc="Sig from Wallet B (not Vault A owner) reverts 'Sig not from vault owner'. ECDSA checks vault.owner." revertOnly /></>,
                                    "rgba(245,158,11,0.1)"
                                )}
                                {bentoRow(true, g5chart,
                                    <><SectionHead text={sr.groupLabels[4]} color="#8B5CF6" />
                                    <TestRow n={26} title="unshieldToRailgun() with wrong proof: revert expected" desc="Wrong proofHash reverts 'Invalid vault proof'. Password protection on atomic bridge function." revertOnly />
                                    <TestRow n={27} title="unshieldToRailgun() with zero railgunProxy: revert expected" desc="Zero address as Railgun proxy reverts 'Invalid Railgun proxy'. Prevents accidental token burn." revertOnly />
                                    <TestRow n={28} title="unshieldToRailgun() amount over balance: revert expected" desc="Over-balance amount reverts 'Insufficient shielded balance'. CEI pattern: checks before effects." revertOnly />
                                    <TestRow n={29} title="unshieldToRailgun() contract logic: mock Railgun proxy" desc="1 qUSDC burned, USDC approve granted and revoked atomically, Railgun proxy (mock EOA) called. Contract logic verified. Full ZK privacy requires Railgun SDK." tx={TX_UNSHIELD_RAIL} note="MOCK PROXY" /></>,
                                    "rgba(139,92,246,0.1)"
                                )}
                                {bentoRow(false, g6chart,
                                    <><SectionHead text={sr.groupLabels[5]} color="rgba(255,255,255,0.4)" />
                                    <TestRow n={30} title="Re-initialize already-initialized vault: revert expected" desc="initialize() on an existing vault reverts 'Already initialized'. notInitialized modifier working." revertOnly />
                                    <TestRow n={31} title="emergencyWithdraw() before 1,296,000-block timelock: revert expected" desc="Emergency withdraw reverts before the 180-day timelock (approx 1,296,000 blocks) has elapsed. Timelock active and enforced." revertOnly />
                                    <TestRow n={32} title="Any vault function from non-owner: revert expected" desc="Wallet B cannot call Vault A's onlyOwner functions. Reverts 'Not vault owner'. Access control confirmed on all protected functions." revertOnly /></>,
                                    "rgba(255,255,255,0.07)"
                                )}
                            </>
                        );
                    })()}
                </div>

                {/* ── Superseded section ────── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px": "36px 40px", marginBottom: 20, borderColor: "rgba(239,68,68,0.12)" }) }}>
                    <SectionHead text={sr.supersededLabel} color="#EF4444" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#fff" }}>Previous deployments</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "0 0 20px", lineHeight: 1.6 }}>
                        {sr.supersededBody}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {[
                            { label: "v4 Factory (decommissioned: superseded by v5 bytes32 upgrade)", value: FACTORY_V4, note: "v4: string passwords, QryptAir, QryptShield" },
                            { label: "v3 Factory (decommissioned: superseded by v4/v5)", value: FACTORY_V3, note: "v3: 26/26 E2E, commit-reveal only" },
                            { label: "v2 ShieldFactory (decommissioned: decimal fix)", value: "", note: "v2: qToken decimal fix" },
                            { label: "v1 ShieldFactory (decommissioned: original deploy)", value: "", note: "v1: hardcoded 18 decimals" },
                        ].map((c, i) => (
                            <div key={i} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 10 }}>
                                <div style={{ flex: 1, minWidth: 220 }}>
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.32)", marginBottom: 6 }}>{c.label}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <CopySpan value={c.value} display={short(c.value)} />
                                        <ExtLink href={`${ETHERSCAN}/address/${c.value}`}>Etherscan</ExtLink>
                                    </div>
                                </div>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "#EF4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 4, padding: "2px 7px", alignSelf: "flex-start", marginTop: 2 }}>{sr.supersededLabel}</span>
                            </div>
                        ))}
                    </div>
                </div>


            </div>
        </div>
    );
}
