import { useEffect, useState } from "react";
import SharedNavBar from "@/components/SharedNavBar";
import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import SepoliaVersionNav from "@/components/SepoliaVersionNav";
import { translations } from "@/lib/translations";
type SR = typeof translations.en.sepoliaRecord;

/* ── Constants ──────────────────────────────────────────────────── */
const FACTORY_V4   = "0x611Ba6F93fAeC0203eBee1c3e35d72C1e5ba560F";
const IMPL_V4      = "0x8E0c9350CdF384a208F6005A2F632f35FB4e413E";
const DEPLOY_TX_V4 = "0x6d5ccda226bf57e7b0e2c03e676c0de2fc6031a8060840936d909f2ed920cc2a";
const VAULT_A_V4   = "0x575bd006391DC3bF4443e1c3933162025288dbA8";

const FACTORY_V3   = "0x88E8eAFafc99E83e687BCAbD53F783a92e51F75c";
const IMPL_V3      = "0xaf2E91CDc70e81fA74b9aE9C322e8302bb51715e";
const FACTORY_V2   = "0x26BAb8B6e88201ad4824ea1290a7C9c7b9B10fCf";
const IMPL_V2      = "0x675f70646713D4026612c673E644C61ae3aa7725";
const FACTORY_V1   = "0xd05F4fb3f24C7bF0cb482123186CF797E42CF17A";
const IMPL_V1      = "0x5E398e1E0Ba28f9659013B1212f24b8B43d69393";
const WALLET_A     = "0x2459A9B3D481Bb02e6844Cf28314b2c3eaC431e4";
const WALLET_B     = "0xA3F12571e24811CB885cae2a17F8e45C84343829";
const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const ETHERSCAN    = "https://sepolia.etherscan.io";
const DEPLOYER     = "0xBe48d9a898Ba5d9a2c48C55b4A1b9Ea81A640B57";

/* ── Live TX hashes (fill after deployment) ──────────────────────── */
const TX_CREATE_VAULT     = "0x036ebf222afd1038dfab434df2bcde3fcd8e251f2c909a7bb824b8247c879b0c";
const TX_APPROVE          = "0x747c6092511f72f1495814a0245092b44abf936cdd71aac995b499edaaebee3b";
const TX_SHIELD           = "0x9c42a482da4c36192de45484cb7b11c72b32e0a62cd54ce0fe30fe22a45c9642";
const TX_PARTIAL_UNSHIELD = "0x280843d997f147c7d9b7fa375938e8373e5def7ab3b8fff6da533d37f2911e63";
const TX_COMMIT           = "0x0ac1914fb07e05b9ea230424923f2c1f4a72b52089dcf8f76b748f3f62796ae9";
const TX_REVEAL           = "0x98da60a3706a0239c7fa4ff07f65a3e48fba0d2c53f3ba86776074c8dd13cd9b";

const isPending = (v: string) => !v || v === "Pending deployment";
const short = (v: string, h = 8, t = 6) => isPending(v) ? v : `${v.slice(0, h)}...${v.slice(-t)}`;

/* ── Shared components ──────────────────────────────────────────── */
function CopySpan({ value, display }: { value: string; display?: string }) {
    const [ok, setOk] = useState(false);
    if (isPending(value)) return (
        <span style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, color: "rgba(255,255,255,0.28)", fontStyle: "italic" }}>
            {value}
        </span>
    );
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
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: dim ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.42)", letterSpacing: "0.04em" }}>{label}</span>
                {verified && !dim && !isPending(value) && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 4, padding: "1px 6px" }}>{srBase.v4?.verifiedMit ?? "VERIFIED MIT"}</span>}
                {dim && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#EF4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, padding: "1px 6px" }}>{srBase.v4?.supersededBadge ?? "SUPERSEDED"}</span>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <CopySpan value={value} display={short(value)} />
                {!isPending(value) && <ExtLink href={link ?? `${ETHERSCAN}/address/${value}`}>Etherscan</ExtLink>}
            </div>
        </div>
    );
}

function Tag({ text }: { text: string }) {
    return <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 10 }}>{text}</div>;
}

function TxChip({ hash, label }: { hash: string; label: string }) {
    const [ok, setOk] = useState(false);
    if (!hash) return (
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 5 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.26)" }}>{label}:</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>Pending</span>
        </div>
    );
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 5 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.26)" }}>{label}:</span>
            <span onClick={() => { navigator.clipboard.writeText(hash).then(() => { setOk(true); setTimeout(() => setOk(false), 1600); }); }}
                title="Click to copy"
                style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
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
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.18)" }}>call reverted before state change, no TX created</span>
        </div>
    );
}

interface TRProps {
    pass: boolean; n: number; title: string; desc: string; note?: string;
    tx?: string; txLabel?: string;
    tx2?: string; txLabel2?: string;
    revertOnly?: boolean;
    group?: string;
}
function TestRow({ pass, n, title, desc, note, tx, txLabel, tx2, txLabel2, revertOnly, group }: TRProps) {
    return (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "15px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: pass ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${pass ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                {pass
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.8"><path d="M20 6L9 17l-5-5" /></svg>
                    : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>{String(n).padStart(2, "0")}</span>
                    {group && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: "0.04em" }}>{group}</span>}
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: "#d4d6e2", letterSpacing: "-0.01em" }}>{title}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: pass ? "#22C55E" : "#EF4444", background: pass ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${pass ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 4, padding: "2px 6px" }}>{pass ? "PASS" : "FAIL"}</span>
                    {note && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>{note}</span>}
                </div>
                <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65 }}>{desc}</p>
                {tx && <TxChip hash={tx} label={txLabel ?? "TX"} />}
                {tx2 && <TxChip hash={tx2} label={txLabel2 ?? "TX2"} />}
                {revertOnly && <RevertChip />}
            </div>
        </div>
    );
}

function GroupDivider({ label }: { label: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "28px 0 10px" }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{label}</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>
    );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function SepoliaVerifiedV4Page() {
    const { t } = useLanguage();
    const sr = (t.sepoliaRecord as SR).v4;
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 900 : false);
    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    const W = 1300;
    const pad = isMobile ? "0 18px" : "0 24px";
    const card = (extra?: React.CSSProperties): React.CSSProperties => ({
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        ...extra,
    });

    return (
        <div style={{ minHeight: "100vh", background: "#050710", color: "#d4d6e2" }}>
            <SharedNavBar />

            {/* ═══ HERO ═══════════════════════════════════════════ */}
            <div style={{ position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <img src="/images/sepolia-v4-hero.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%", filter: "brightness(0.20) saturate(1.3)" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,7,16,0.1) 0%, rgba(5,7,16,0.65) 70%, #050710 100%)" }} />
                </div>
                <div style={{ position: "relative", zIndex: 1, maxWidth: W, margin: "0 auto", padding: pad }}>
                    <div style={{ padding: isMobile ? "160px 0 100px" : "200px 0 140px" }}>
                        <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 380px", gap: 60, alignItems: "center" }}>
                            <div>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 20, padding: "4px 14px 4px 9px", marginBottom: 22 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>{sr.heroBadge}</span>
                                </div>
                                <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: isMobile ? 36 : 56, letterSpacing: "-0.03em", lineHeight: 1.04, margin: "0 0 20px", color: "#d4d6e2" }}>
                                    {sr.heroTitle}
                                </h1>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.48)", margin: "0 0 36px", maxWidth: 520 }}>
                                    {sr.heroBody}
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                    {[
                                        { val: "47/47", label: sr.statLabels[0], green: true },
                                        { val: "EIP-1167", label: sr.statLabels[1], green: false },
                                        { val: "Custom Errors", label: sr.statLabels[2], green: false },
                                        { val: "MIT", label: sr.statLabels[3], green: false },
                                    ].map(s => (
                                        <div key={s.val} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${s.green ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "12px 18px", textAlign: "center", minWidth: 90 }}>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", color: s.green ? "#22C55E" : "#fff" }}>{s.val}</div>
                                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {!isMobile && (
                                <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>
                                    <img src="/images/sepolia-v4-right.jpg" alt="Analytics crystal dashboard" style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ CONTENT ════════════════════════════════════════ */}
            <div style={{ maxWidth: W, margin: "0 auto", padding: pad }}>
                <SepoliaVersionNav
                    prev={{ label: "V3 Record", href: "/sepolia-verified-v3" }}
                    next={{ label: "V5 Record", href: "/sepolia-verified-v5" }}
                />

                {/* ── V3 to V4 Changes ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <Tag text={sr.v3ToV4Label} />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>{sr.v3ToV4Heading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 28px", lineHeight: 1.65 }}>{sr.v3ToV4Body}</p>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {sr.changes.map((r, i) => (
                            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "18px 16px" }}>
                                <div style={{ flexShrink: 0, width: 22, height: 22, marginTop: 1, borderRadius: "50%", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.8"><path d="M20 6L9 17l-5-5" /></svg>
                                </div>
                                <div>
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#d4d6e2", marginBottom: 4 }}>{r.label}</div>
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>{r.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── V4 Contracts ─── */}
                <div style={{ ...card({ marginBottom: 20, overflow: "hidden" }) }}>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 320px" }}>
                        <div style={{ padding: isMobile ? "28px 18px" : "36px 40px" }}>
                            <Tag text={sr.activeContractsLabel} />
                            <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>{sr.activeContractsHeading}</h2>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 20px", lineHeight: 1.65 }}>{sr.activeContractsBody}</p>
                            <AddrRow label="QryptSafeV4 (factory)" value={FACTORY_V4} verified link={`${ETHERSCAN}/address/${FACTORY_V4}#code`} />
                            <AddrRow label="PersonalQryptSafeV4 (impl)" value={IMPL_V4} verified link={`${ETHERSCAN}/address/${IMPL_V4}#code`} />
                            <AddrRow label="Deploy TX" value={DEPLOY_TX_V4} link={`${ETHERSCAN}/tx/${DEPLOY_TX_V4}`} />
                            <AddrRow label="Wallet A Qrypt-Safe (clone)" value={VAULT_A_V4} link={`${ETHERSCAN}/address/${VAULT_A_V4}`} />
                            <AddrRow label="Deployer" value={DEPLOYER} link={`${ETHERSCAN}/address/${DEPLOYER}`} />
                            <AddrRow label="Sepolia USDC (Circle)" value={USDC_SEPOLIA} link={`${ETHERSCAN}/address/${USDC_SEPOLIA}`} />
                        </div>
                        {!isMobile && (
                            <div style={{ position: "relative", minHeight: 260 }}>
                                <img src="/images/sepolia-v4-hero.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55) saturate(1.2)" }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,7,16,0.7) 0%, transparent 60%)" }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Custom Errors Deep-Dive (NEW section, not in V3) ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <Tag text={sr.customErrorsLabel} />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>{sr.customErrorsHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 24px", lineHeight: 1.65 }}>{sr.customErrorsBody}</p>

                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {sr.customErrors.map((e, i) => (
                            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 14px" }}>
                                <div style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.25)", marginTop: 6 }} />
                                <div>
                                    <code style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, color: "#d4d6e2", display: "block", marginBottom: 4 }}>{e.name}</code>
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.36)", lineHeight: 1.55 }}>{e.when}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "16px 18px" }}>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 10 }}>GAS COMPARISON</div>
                        <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>V3: require string</div>
                                <pre style={{ margin: 0, padding: "10px 12px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, fontSize: 11, color: "rgba(239,68,68,0.7)", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "pre-wrap" }}>{`require(vaults[msg.sender] == address(0),
  "Vault already exists");
// ~800 gas on revert`}</pre>
                            </div>
                            <div>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>V4: custom error</div>
                                <pre style={{ margin: 0, padding: "10px 12px", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 8, fontSize: 11, color: "rgba(34,197,94,0.7)", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "pre-wrap" }}>{`if (vaults[msg.sender] != address(0))
  revert VaultAlreadyExists();
// ~200 gas on revert`}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Vault Metadata (NEW section) ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <Tag text={sr.metadataLabel} />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>{sr.metadataHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 24px", lineHeight: 1.65 }}>{sr.metadataBody}</p>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter',sans-serif", fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                    {["Storage field", "Solidity type", "Description"].map(h => (
                                        <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sr.metadataRows.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <td style={{ padding: "12px 14px" }}><code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#d4d6e2" }}>{row.field}</code></td>
                                        <td style={{ padding: "12px 14px" }}><code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{row.type}</code></td>
                                        <td style={{ padding: "12px 14px", color: "rgba(255,255,255,0.42)", lineHeight: 1.55 }}>{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <pre style={{ marginTop: 20, padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "pre-wrap", overflowX: "auto" }}>{`// Read vault metadata without events or subgraph
const vault = PersonalQryptSafeV4__factory.connect(vaultAddress, provider);
const [createdAt, lastActivity, count] = await Promise.all([
    vault.createdAtBlock(),        // block vault was deployed
    vault.lastActivityBlock(),     // block of last state change
    vault.activityCount(),         // total operations performed
]);`}</pre>
                </div>

                {/* ── Partial Unshield (NEW section) ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <Tag text={sr.partialLabel} />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>{sr.partialHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 20px", lineHeight: 1.65 }}>{sr.partialBody}</p>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em", marginBottom: 6 }}>V3: ALL OR NOTHING</div>
                            <pre style={{ margin: 0, padding: "14px 16px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.14)", borderRadius: 10, fontSize: 12, color: "rgba(239,68,68,0.65)", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "pre-wrap" }}>{`// V3: burns entire balance
function unshield(
    address tokenAddress,
    bytes32 proof
) external onlyOwner {
    uint256 fullBalance =
        ShieldToken(qToken).balanceOf(owner);
    ShieldToken(qToken).burn(owner, fullBalance);
    IERC20(token).safeTransfer(owner, fullBalance);
}`}</pre>
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em", marginBottom: 6 }}>V4: PARTIAL AMOUNT</div>
                            <pre style={{ margin: 0, padding: "14px 16px", background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.14)", borderRadius: 10, fontSize: 12, color: "rgba(34,197,94,0.65)", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "pre-wrap" }}>{`// V4: any amount up to full balance
function unshield(
    address tokenAddress,
    uint256 amount,     // explicit amount
    bytes32 proof
) external onlyOwner {
    if (balance < amount) revert InsufficientBalance();
    ShieldToken(qToken).burn(owner, amount);
    IERC20(token).safeTransfer(owner, amount);
}`}</pre>
                        </div>
                    </div>
                </div>

                {/* ── Previous versions ─── */}
                <div style={{ ...card({ marginBottom: 20, padding: isMobile ? "28px 18px" : "36px 40px", borderColor: "rgba(239,68,68,0.1)" }) }}>
                    <Tag text={sr.prevVersionLabel} />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>{sr.prevVersionHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 24px", lineHeight: 1.65 }}>{sr.prevVersionBody}</p>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                        {[
                            { label: "V3 (QryptSafe)", factory: FACTORY_V3, impl: IMPL_V3, link: "/sepolia-verified-v3", linkLabel: sr.viewV3RecordLink, features: "No-Admin, ECDSA meta, changeVaultProof, 36 tests" },
                            { label: "V2 (QryptSafe)", factory: FACTORY_V2, impl: IMPL_V2, link: "/sepolia-verified-v2", linkLabel: sr.viewV2RecordLink, features: "No-Pausable, nonce commit, SafeERC20, 23 tests" },
                            { label: "V1 (ShieldFactory)", factory: FACTORY_V1, impl: IMPL_V1, link: "/sepolia-verified-v1", linkLabel: sr.viewV1RecordLink, features: "EIP-1167 genesis, 18-dec bug, 12 tests" },
                        ].map(v => (
                            <div key={v.label} style={{ background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: 14, padding: "20px 18px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>{v.label}</span>
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#EF4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, padding: "1px 6px" }}>{sr.supersededBadge}</span>
                                </div>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.28)", lineHeight: 1.55, marginBottom: 12 }}>{v.features}</div>
                                <AddrRow label="factory" value={v.factory} dim link={`${ETHERSCAN}/address/${v.factory}#code`} />
                                <AddrRow label="impl" value={v.impl} dim link={`${ETHERSCAN}/address/${v.impl}#code`} />
                                <div style={{ marginTop: 10 }}>
                                    <Link href={v.link} style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)"; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)"; }}>
                                        {v.linkLabel}
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Known Issue ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20, borderColor: "rgba(239,68,68,0.18)", background: "rgba(239,68,68,0.02)" }) }}>
                    <Tag text={sr.bugLabel} />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>{sr.bugHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 20px", lineHeight: 1.7 }}>{sr.bugBody}</p>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        {[
                            { issue: "No Railgun ZK privacy", fix: "V5: unshieldToRailgun sends tokens to Railgun pool via zero-knowledge proof." },
                            { issue: "No QryptAir EIP-712 voucher", fix: "V5: createVoucher + redeemVoucher offline transfer via signed EIP-712 message." },
                            { issue: "Static passwordHash", fix: "V6: OTP chain (proofChainHead) rotates after each use. Hash cannot be reused." },
                        ].map((item, i) => (
                            <div key={i} style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.14)", borderRadius: 12, padding: "16px 16px" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{item.issue}</span>
                                </div>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, paddingLeft: 22 }}>{item.fix}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Unit Tests ─── */}
                <div style={{ ...card({ marginBottom: 20, padding: isMobile ? "28px 18px" : "40px 44px" }) }}>
                    {/* Header */}
                    <Tag text={sr.unitTestsLabel} />
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 36 }}>
                        <div>
                            <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>47 / 47 Passing</h2>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: 0, lineHeight: 1.65 }}>{sr.unitTestsBody}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, flexWrap: "wrap" }}>
                            <div style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 8, padding: "6px 14px" }}>
                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>QryptSafeV4.test.js</span>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: "#22C55E", marginLeft: 10 }}>47/47</span>
                            </div>
                            <ExtLink href="https://github.com/Qryptumorg/contracts/tree/main/test">View on GitHub</ExtLink>
                        </div>
                    </div>

                    {/* ═══ GROUP 1: Factory & Vault — image TOP full-width banner ═══ */}
                    <div style={{ paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <GroupDivider label="Factory & Vault" />
                        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 24 }}>
                            <img src="/images/v4-test-factory.jpg" alt="Permissionless factory architecture" style={{ width: "100%", display: "block", height: 240, objectFit: "cover", objectPosition: "center" }} />
                        </div>
                        <TestRow pass n={1} title="factory has no owner or pause" desc="QryptSafeV4.owner is undefined in the ABI. No Ownable inherited, no pause function, no privileged factory control. Vault creation is permissionless from block zero." />
                        <TestRow pass n={2} title="factory stores createdAt block" desc="After createVault(), factory.vaultCreatedAt(owner) returns the block number of deployment. Stored in a mapping(address => uint256) at factory level. Readable without events." />
                        <TestRow pass n={3} title="creates vault" desc="factory.hasVault(owner) returns true after createVault(). The clone address is stored in vaults[owner] and retrievable via getVault(owner)." />
                        <TestRow pass n={4} title="duplicate vault reverts with custom error" note="revert VaultAlreadyExists()" desc="Second createVault() call for same owner reverts with VaultAlreadyExists custom error. No string message, 4-byte selector only. Gas cost: ~200 vs ~800 for require string." revertOnly />
                        <TestRow pass n={5} title="vault stores createdAtBlock" desc="PersonalQryptSafeV4.createdAtBlock() returns the block number set during initialize(). Value is set once in the initializer and never modified by any subsequent call." />
                        <TestRow pass n={6} title="activityCount increments on shield" desc="activityCount starts at 0 after initialize. After shield(), activityCount is 1. Monotonic, cannot decrease. Readable without transaction history." />
                        <TestRow pass n={7} title="activityCount starts at zero before any action" desc="A freshly initialized vault has activityCount() == 0. The counter is set in initialize() and only incremented by state-changing functions." />
                    </div>

                    {/* ═══ GROUP 2: Shield & Unshield — image LEFT large ═══ */}
                    <div style={{ paddingTop: 28, marginTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <GroupDivider label="Shield & Unshield" />
                        <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "32% 1fr", gap: 32, alignItems: "stretch" }}>
                            {!isMobile && (
                                <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", minHeight: 300 }}>
                                    <img src="/images/v4-test-shield.jpg" alt="Token shielding and unshielding" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
                                </div>
                            )}
                            <div>
                                <TestRow pass n={8} title="shields tokens" desc="shield(token, amount, proof) transfers ERC-20 from owner into vault, deploys a ShieldToken (qToken) if first shield of that token, and mints qToken to owner. getShieldedBalance() returns the minted amount." />
                                <TestRow pass n={9} title="shield emits TokenShielded" desc="shield() emits TokenShielded(token, amount, qTokenAddress). All three values are indexed or logged. Event verifiable on Etherscan without calling contract state." />
                                <TestRow pass n={10} title="rejects shield below minimum" note="revert InvalidAmount()" desc="shield() with amount < 1,000,000 units (1 USDC for 6-decimal tokens) reverts with InvalidAmount custom error. Minimum enforced as a Solidity constant, not a settable parameter." revertOnly />
                                <TestRow pass n={11} title="rejects shield wrong proof" note="revert InvalidProof()" desc="shield() with incorrect vault proof reverts with InvalidProof custom error. The modifier checks keccak256(abi.encodePacked(proof)) against stored passwordHash before any ERC-20 transfer." revertOnly />
                                <TestRow pass n={12} title="rejects shield from non-owner" note="revert NotOwner()" desc="shield() called by any address other than vault.owner() reverts with NotOwner custom error. The onlyOwner modifier is checked first, before proof validation." revertOnly />
                                <TestRow pass n={13} title="unshields full balance" desc="unshield(token, fullAmount, proof) burns all qToken, transfers full ERC-20 amount to owner. getShieldedBalance() returns 0 after. Token is retained in qTokens mapping even after full unshield." />
                                <TestRow pass n={14} title="unshields partial balance" desc="Shield 100 USDC, then unshield 40 USDC. getShieldedBalance() returns 60 USDC. The remaining 60 qUSDC stays in vault. This is the key V4 improvement: any amount up to balance is withdrawable." />
                                <TestRow pass n={15} title="rejects unshield exceeding balance" note="revert InsufficientBalance()" desc="unshield() with amount > shielded balance reverts with InsufficientBalance custom error. The check is against ShieldToken.balanceOf(owner), which is the actual shielded amount." revertOnly />
                                <TestRow pass n={16} title="rejects unshield wrong proof" note="revert InvalidProof()" desc="unshield() with wrong proof reverts with InvalidProof before any token movement. Vault funds are never at risk from failed proof attempts." revertOnly />
                                <TestRow pass n={17} title="activityCount increments on unshield" desc="activityCount increases after unshield(). Both the full and partial unshield paths increment the counter. lastActivityBlock is also updated to the current block number." />
                            </div>
                            {isMobile && (
                                <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginTop: 20 }}>
                                    <img src="/images/v4-test-shield.jpg" alt="Token shielding and unshielding" style={{ width: "100%", display: "block", aspectRatio: "1/1", objectFit: "cover" }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══ GROUP 3: Proof & Commit-Reveal — image RIGHT large ═══ */}
                    <div style={{ paddingTop: 28, marginTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <GroupDivider label="Proof & Commit-Reveal" />
                        <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 32%", gap: 32, alignItems: "stretch" }}>
                            <div>
                                <TestRow pass n={18} title="changes vault proof" desc="changeVaultProof(oldProof, newHash) validates the old proof first, then replaces passwordHash atomically. The new hash takes effect immediately. Emits VaultProofChanged event." />
                                <TestRow pass n={19} title="rejects wrong old proof" note="revert InvalidProof()" desc="changeVaultProof() with an incorrect oldProof reverts with InvalidProof. The new hash is rejected without being stored. passwordHash remains unchanged." revertOnly />
                                <TestRow pass n={20} title="rejects zero new hash" note="revert InvalidNewProof()" desc="changeVaultProof() with bytes32(0) as the new hash reverts with InvalidNewProof. Zero hash would make the vault permanently inaccessible." revertOnly />
                                <TestRow pass n={21} title="old proof invalid after change" desc="After changeVaultProof(), calling shield() with the old proof reverts with InvalidProof. The new proof works. The rotation is atomic and immediate." />
                                <TestRow pass n={22} title="activityCount increments on changeVaultProof" desc="changeVaultProof() counts as an activity. activityCount increments by 1 and lastActivityBlock updates. Both values reflect the proof rotation transaction." />
                                <TestRow pass n={23} title="commit-reveal works end-to-end" desc="Shield funds, commit a keccak256 hash, then reveal with the correct proof and commitHash within 600 seconds. qToken burned, raw ERC-20 transferred to recipient. Recipient receives actual USDC, not qUSDC." />
                                <TestRow pass n={24} title="duplicate commit reverts" note="revert CommitExists()" desc="commit() with a commitHash already stored on-chain reverts with CommitExists. Each commit must use a unique hash. The existing commit is preserved unchanged." revertOnly />
                                <TestRow pass n={25} title="reveal used commit reverts" note="revert CommitUsed()" desc="After a successful reveal(), the CommitData.used flag is set to true. A second reveal attempt with the same commitHash reverts with CommitUsed. No replay possible." revertOnly />
                                <TestRow pass n={26} title="reveal unknown commit reverts" note="revert CommitNotFound()" desc="reveal() with a commitHash that was never committed reverts with CommitNotFound. commits[hash].blockNumber is 0 for unrecognized hashes." revertOnly />
                                <TestRow pass n={27} title="activityCount increments on reveal" desc="reveal() increments activityCount and updates lastActivityBlock. The commit step does not count as a separate activity in this test; only the reveal is measured." />
                            </div>
                            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginTop: isMobile ? 20 : 0, minHeight: 300 }}>
                                <img src="/images/v4-test-commitreveal.jpg" alt="Proof rotation and commit-reveal" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
                            </div>
                        </div>
                    </div>

                    {/* ═══ GROUP 4: metaTransfer & Multi-token — image TOP full-width banner ═══ */}
                    <div style={{ paddingTop: 28, marginTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <GroupDivider label="metaTransfer, Multi-token & qToken" />
                        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 24 }}>
                            <img src="/images/v4-test-metatransfer.jpg" alt="ECDSA meta-transfer and multi-token" style={{ width: "100%", display: "block", height: 240, objectFit: "cover", objectPosition: "center" }} />
                        </div>
                        <TestRow pass n={28} title="metaTransfer with valid signature" desc="Owner signs a hash of (token, to, amount, deadline, sigNonce) off-chain. A third-party relayer submits the signature. qToken burned, ERC-20 sent to recipient. Relayer pays gas, owner signs only." />
                        <TestRow pass n={29} title="metaTransfer expired deadline" note="revert SignatureExpired()" desc="block.timestamp > deadline reverts with SignatureExpired before any signature validation. Deadline check is first to avoid unnecessary ECDSA computation." revertOnly />
                        <TestRow pass n={30} title="metaTransfer wrong signer" note="revert InvalidSignature()" desc="Signature from a non-owner address reverts with InvalidSignature. ECDSA.recover() returns the attacker's address, which does not match vault.owner()." revertOnly />
                        <TestRow pass n={31} title="metaTransfer replay attack" note="revert SignatureUsed()" desc="After a successful metaTransfer, the sigHash is stored in usedSignatureHashes. A second call with the same signature reverts with SignatureUsed. Replay is impossible." revertOnly />
                        <TestRow pass n={32} title="metaTransfer increments activityCount" desc="metaTransfer() increments activityCount and updates lastActivityBlock. The on-chain state records that a meta-transfer occurred, even though the gas was paid by a relayer." />
                        <TestRow pass n={33} title="shields two tokens independently" desc="Shield USDC and USDT into the same vault. getShieldedBalance(USDC) and getShieldedBalance(USDT) return their independent balances. qToken addresses are different per token." />
                        <TestRow pass n={34} title="unshields two tokens independently" desc="After shielding both USDC and USDT, unshield USDC fully. USDT balance is unaffected. Each qToken is independent; burning one does not affect any other." />
                        <TestRow pass n={35} title="shields accumulate across two tokens" desc="Shielding USDC does not affect USDT state and vice versa. Both can be shielded in separate transactions and both balances are correct independently." />
                        <TestRow pass n={36} title="qToken non-transferable" note="revert" desc="Calling transfer() directly on a ShieldToken (qUSDC) reverts. qTokens represent vault credit only. They cannot leave the vault owner's address via standard ERC-20 transfer()." revertOnly />
                    </div>

                    {/* ═══ GROUP 5: Emergency & Edge Cases — image LEFT large ═══ */}
                    <div style={{ paddingTop: 28, marginTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <GroupDivider label="Emergency & Edge Cases" />
                        <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "32% 1fr", gap: 32, alignItems: "stretch" }}>
                            {!isMobile && (
                                <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", minHeight: 300 }}>
                                    <img src="/images/v4-test-emergency.jpg" alt="Emergency and edge cases" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
                                </div>
                            )}
                            <div>
                                <TestRow pass n={37} title="emergency withdraw enforces delay" note="revert EmergencyDelayNotMet()" desc="emergencyWithdraw() before 1,296,000 blocks (~180 days on Ethereum mainnet) have elapsed since lastActivityBlock reverts with EmergencyDelayNotMet. Enforced delay prevents rushed withdrawals." revertOnly />
                                <TestRow pass n={38} title="emergency block number is future" desc="getEmergencyWithdrawAvailableBlock() returns lastActivityBlock + 1,296,000. At deployment time this is always greater than the current block number. The delay is guaranteed on-chain." />
                                <TestRow pass n={39} title="shielded balance zero for unshielded token" desc="getShieldedBalance() for a token that has never been shielded returns 0. No qToken is deployed for that token. The return is from a mapping lookup returning the zero address, then balance of zero." />
                                <TestRow pass n={40} title="getQTokenAddress returns zero before first shield" desc="qTokens[tokenAddress] is 0 before the first shield of that token. getQTokenAddress() returns address(0). No qToken is deployed until the first shield call." />
                                <TestRow pass n={41} title="getQTokenAddress returns zero for never-shielded token" desc="A freshly deployed mock ERC-20 that has never been shielded returns address(0) from getQTokenAddress(). Confirmed with a distinct third token not used in other tests." />
                                <TestRow pass n={42} title="second vault for different user is independent" desc="Two different signers create two different vaults via the same factory. Each vault is a distinct EIP-1167 clone with isolated storage. hasVault() and getVault() return independent values for each owner." />
                                <TestRow pass n={43} title="hasVault returns false for address with no vault" desc="A fresh address that has never called createVault() returns false from hasVault(). The vaults mapping returns address(0), which evaluates to false in the boolean check." />
                                <TestRow pass n={44} title="factory vaultCreatedAt returns positive block number" desc="vaultCreatedAt(owner) after createVault() returns a uint256 greater than 0. Confirms the block number is stored correctly at factory level. Value is the deployment block of the proxy clone." />
                                <TestRow pass n={45} title="createdAtBlock is at or before current block" desc="vault.createdAtBlock() is less than or equal to ethers.provider.getBlockNumber(). The vault was created in a past block. The value never exceeds the current tip." />
                                <TestRow pass n={46} title="TokenUnshielded event emitted on unshield" desc="unshield() emits TokenUnshielded(token, amount) event. Both the partial and full unshield paths emit the event. The amount logged matches the actual amount withdrawn." />
                                <TestRow pass n={47} title="factory emits VaultCreated event" desc="createVault() emits VaultCreated(owner, vault, createdAt). Three parameters: indexed owner address, indexed vault address, and the block number. Verifiable on Etherscan without reading factory state." />
                            </div>
                            {isMobile && (
                                <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginTop: 20 }}>
                                    <img src="/images/v4-test-emergency.jpg" alt="Emergency and edge cases" style={{ width: "100%", display: "block", aspectRatio: "1/1", objectFit: "cover" }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Test wallets ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 20 }) }}>
                    <Tag text="Test Wallets" />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 20px", color: "#d4d6e2" }}>On-Chain Test Accounts</h2>
                    <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                        {[
                            { label: "Wallet A", sub: "vault owner, initiator", value: WALLET_A },
                            { label: "Wallet B", sub: "transfer recipient (metaTransfer, reveal)", value: WALLET_B },
                            { label: "Vault A (V4)", sub: "Wallet A Qrypt-Safe clone", value: VAULT_A_V4 },
                        ].map(w => (
                            <div key={w.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 16px" }}>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>{w.label}</div>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.32)", marginBottom: 12 }}>{w.sub}</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    <CopySpan value={w.value} display={short(w.value)} />
                                    {!isPending(w.value) && <ExtLink href={`${ETHERSCAN}/address/${w.value}`}>Etherscan</ExtLink>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Live E2E Tests ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "36px 40px", marginBottom: 60 }) }}>
                    <Tag text={sr.e2eTestsLabel} />
                    <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px", color: "#d4d6e2" }}>{sr.e2eTestsHeading}</h2>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 16px", lineHeight: 1.6 }}>{sr.e2eTestsBody}</p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap", marginTop: 1 }}>T1-T5</span>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>Broadcast TX: state changes permanently on-chain. Each has a real TX hash verifiable on Sepolia Etherscan.</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap", marginTop: 1 }}>H revert</span>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>eth_call simulation: EVM reverts before state change. No gas consumed, no TX. Correct way to verify revert behavior against live contracts.</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22C55E" }}>T: Functional Tests</span>
                    </div>

                    <TestRow pass n={1} title="Create Qrypt-Safe"
                        desc="Wallet A called createVault(keccak256('mno345')) on QryptSafeV4 factory. A 45-byte EIP-1167 minimal proxy clone deployed at Vault A. Factory confirmed: hasVault(walletA) = true. vaultCreatedAt(walletA) stores the deployment block number."
                        tx={TX_CREATE_VAULT} txLabel="createVault" />

                    <TestRow pass n={2} title="Shield USDC"
                        desc="Wallet A approved Vault A for USDC spending, then called shield(USDC, 100e6, proof). qUSDC ShieldToken deployed and minted: 100 qUSDC to Wallet A. Shielded balance confirmed at 100.0. activityCount incremented to 1."
                        tx={TX_APPROVE} txLabel="approve USDC"
                        tx2={TX_SHIELD} txLabel2="shield" />

                    <TestRow pass n={3} title="Partial Unshield USDC"
                        desc="Wallet A called unshield(USDC, 40e6, proof): withdrew exactly 40 USDC. Remaining shielded balance: 60 qUSDC. No all-or-nothing constraint. The remaining 60 qUSDC stays locked. This is the key V4 live demonstration."
                        tx={TX_PARTIAL_UNSHIELD} txLabel="partialUnshield" />

                    <TestRow pass n={4} title="Commit-Reveal Transfer"
                        desc="Two-step transfer from Vault A to Wallet B. Step 1: commit() stores keccak256 commitment on-chain. Step 2: reveal() within 600 seconds validates commitment, burns qUSDC, sends USDC to Wallet B. Wallet B received raw USDC ERC-20."
                        tx={TX_COMMIT} txLabel="commit"
                        tx2={TX_REVEAL} txLabel2="reveal" />

                    <TestRow pass n={5} title="Metadata Verified"
                        desc="After T1-T4, Vault A's on-chain metadata is confirmed: createdAtBlock set at T1, lastActivityBlock updated at T4, activityCount reflects all state-changing calls. All three values readable directly from the contract without events."
                    />

                    <div style={{ margin: "20px 0 6px" }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>H: Security Invariants (all must revert)</span>
                    </div>
                    <TestRow pass n={6} title="H1: wrong vault proof reverts" note="revert InvalidProof()" revertOnly
                        desc="shield() with a wrong vault proof reverts with InvalidProof custom error. No token movement occurs. The check happens before any ERC-20 call." />
                    <TestRow pass n={7} title="H2: non-owner shield reverts" note="revert NotOwner()" revertOnly
                        desc="shield() from any address other than vault.owner() reverts with NotOwner. The onlyOwner modifier is applied before proof validation." />
                    <TestRow pass n={8} title="H3: duplicate vault reverts" note="revert VaultAlreadyExists()" revertOnly
                        desc="createVault() for an owner who already has a vault reverts with VaultAlreadyExists. The factory state is unchanged. No new clone is deployed." />
                    <TestRow pass n={9} title="H4: qToken direct transfer reverts" note="revert" revertOnly
                        desc="Calling transfer() on qUSDC directly reverts. ShieldToken overrides ERC-20 transfer to block all transfers. qTokens can only be minted by shield() and burned by unshield() or reveal()." />
                    <TestRow pass n={10} title="H5: reveal expired commit reverts" note="revert CommitExpired()" revertOnly
                        desc="reveal() after COMMIT_EXPIRY_SECONDS (600s) reverts with CommitExpired. The timestamp check uses block.timestamp vs commit.timestamp + 600. The commit is not deleted, but cannot be consumed." />
                </div>

                {/* ── Footer nav: V3 ← | → V5 ─── */}
                <div style={{ ...card({ padding: isMobile ? "28px 18px" : "40px 44px", marginBottom: 60 }) }}>
                    <div style={{ display: isMobile ? "flex" : "grid", gridTemplateColumns: "1fr auto 1fr", flexDirection: isMobile ? "column" : undefined, gap: isMobile ? 24 : 0, alignItems: "center" }}>

                        {/* Left — V3 CTA */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "flex-start", gap: 10 }}>
                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>Previous version</div>
                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 800, color: "#d4d6e2", letterSpacing: "-0.02em" }}>QryptSafe V3</div>
                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.55, maxWidth: 280 }}>No-Admin factory, ECDSA meta-transfer, changeVaultProof, commit-reveal. 36 tests.</div>
                            <Link href="/sepolia-verified-v3"
                                style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 20px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, marginTop: 4 }}
                                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.22)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.1)"; }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                                View V3 Record
                            </Link>
                        </div>

                        {/* Divider */}
                        {!isMobile && (
                            <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.07)", margin: "0 40px" }} />
                        )}

                        {/* Right — V5 CTA */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "flex-end", gap: 10 }}>
                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>Next version</div>
                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 800, color: "#d4d6e2", letterSpacing: "-0.02em" }}>QryptSafe V5</div>
                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.55, maxWidth: 280, textAlign: isMobile ? "left" : "right" }}>Railgun ZK privacy (unshieldToRailgun) + QryptAir EIP-712 offline voucher + commit-reveal v2. 51 tests.</div>
                            <Link href="/sepolia-verified-v5"
                                style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#d4d6e2", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: "11px 20px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, marginTop: 4 }}
                                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.13)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)"; }}>
                                View V5 Record
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                            </Link>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
