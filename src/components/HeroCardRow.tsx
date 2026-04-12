import { useState, useRef } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";

export interface NewsCard {
    id: string;
    image?: string;
    decor?: React.ReactNode;
    accentColor: string;
    tag: string;
    title: string;
    body: string;
    link?: { text: string; href: string };
    decommissioned?: boolean;
}

/* ── Inline SVG decorations ─────────────────────────────────────── */
function DecorV6Live() {
    return (
        <svg viewBox="0 0 160 48" style={{ width: "100%", height: "100%", display: "block" }}>
            {Array.from({ length: 49 }, (_, i) => {
                const col = i % 10, row = Math.floor(i / 10);
                const cx = col * 14 + 8, cy = row * 9 + 5;
                const groupColors = ["#22C55E","#22C55E","#8B5CF6","#F59E0B","#8B5CF6","#06B6D4","#22C55E"];
                const groupIdx = i < 3 ? 0 : i < 8 ? 1 : i < 20 ? 2 : i < 28 ? 3 : i < 33 ? 4 : i < 41 ? 5 : 6;
                return <circle key={i} cx={cx} cy={cy} r={3} fill={groupColors[groupIdx]} opacity={0.15 + i * 0.016} />;
            })}
            <circle cx={148} cy={10} r={9} fill="none" stroke="#22C55E" strokeWidth="1.2" strokeOpacity="0.6" />
            <path d="M143 10 L147 14 L154 6" stroke="#22C55E" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
            <line x1={100} y1={36} x2={130} y2={36} stroke="#22C55E" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="2 3" />
            <line x1={130} y1={36} x2={148} y2={26} stroke="#22C55E" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="2 3" />
            <text x={158} y={47} textAnchor="end" fontFamily="Inter,sans-serif" fontSize="7" fill="rgba(34,197,94,0.6)" letterSpacing="0.08em">49/49</text>
        </svg>
    );
}

function DecorV5Verified() {
    return (
        <svg viewBox="0 0 160 48" style={{ width: "100%", height: "100%", display: "block" }}>
            {Array.from({ length: 32 }, (_, i) => {
                const col = i % 8, row = Math.floor(i / 8);
                const cx = col * 17 + 12, cy = row * 11 + 9;
                return <circle key={i} cx={cx} cy={cy} r={3.8} fill="#22C55E" opacity={0.18 + i * 0.026} />;
            })}
            <circle cx={148} cy={12} r={9} fill="none" stroke="#22C55E" strokeWidth="1.2" strokeOpacity="0.5" />
            <path d="M143 12 L147 16 L154 8" stroke="#22C55E" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
            <text x={158} y={47} textAnchor="end" fontFamily="Inter,sans-serif" fontSize="7" fill="rgba(34,197,94,0.5)" letterSpacing="0.08em">32/32</text>
        </svg>
    );
}

function DecorV4Decommissioned() {
    return (
        <svg viewBox="0 0 160 48" style={{ width: "100%", height: "100%", display: "block" }}>
            <line x1={4} y1={14} x2={70} y2={14} stroke="#8B5CF6" strokeWidth="1.6" strokeOpacity="0.42" />
            <line x1={4} y1={26} x2={48} y2={26} stroke="#8B5CF6" strokeWidth="1.6" strokeOpacity="0.32" />
            <line x1={4} y1={38} x2={90} y2={38} stroke="#8B5CF6" strokeWidth="1.6" strokeOpacity="0.28" />
            <line x1={32} y1={14} x2={32} y2={26} stroke="#8B5CF6" strokeWidth="1.6" strokeOpacity="0.38" />
            <line x1={62} y1={26} x2={62} y2={38} stroke="#8B5CF6" strokeWidth="1.6" strokeOpacity="0.32" />
            {([[32,14],[32,26],[62,26],[62,38]] as [number,number][]).map(([vx,vy],i) => (
                <circle key={i} cx={vx} cy={vy} r={3} fill="none" stroke="#8B5CF6" strokeWidth="1.1" strokeOpacity="0.48" />
            ))}
            {([[70,14],[48,26],[90,38]] as [number,number][]).map(([bx,by],i) => (
                <g key={i}>
                    <line x1={bx-4} y1={by-4} x2={bx+4} y2={by+4} stroke="rgba(239,68,68,0.65)" strokeWidth="1.4" strokeLinecap="round" />
                    <line x1={bx+4} y1={by-4} x2={bx-4} y2={by+4} stroke="rgba(239,68,68,0.65)" strokeWidth="1.4" strokeLinecap="round" />
                </g>
            ))}
            <text x={0} y={47} fontFamily="Inter,sans-serif" fontSize="7" fill="rgba(255,255,255,0.18)" letterSpacing="0.06em">DECOMMISSIONED</text>
        </svg>
    );
}

function DecorV3Verified() {
    const pts = "0,44 14,44 20,20 28,34 42,12 56,30 72,22 88,36 102,18 116,36 130,24 145,40 160,40";
    return (
        <svg viewBox="0 0 160 48" style={{ width: "100%", height: "100%", display: "block" }}>
            <polygon points={`${pts} 160,48 0,48`} fill="rgba(34,197,94,0.18)" />
            <polyline points={pts} fill="none" stroke="#22C55E" strokeWidth="1.3" strokeOpacity="0.55" strokeLinejoin="round" />
            {([[18,8],[48,4],[78,10],[108,6],[138,3]] as [number,number][]).map(([sx,sy],i) => (
                <circle key={i} cx={sx} cy={sy} r={1.3} fill="rgba(34,197,94,0.65)" />
            ))}
            <text x={0} y={47} fontFamily="Inter,sans-serif" fontSize="7" fill="rgba(255,255,255,0.22)" letterSpacing="0.06em">26/26 PASS</text>
        </svg>
    );
}

function DecorV2Deployed() {
    const d = "M0,28 L18,28 L22,28 L25,9 L29,42 L33,18 L37,34 L55,34 L59,34 L62,14 L66,40 L70,22 L74,34 L160,34";
    return (
        <svg viewBox="0 0 160 48" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d={d} fill="none" stroke="#8B5CF6" strokeWidth="4" strokeOpacity="0.1" strokeLinecap="round" />
            <path d={d} fill="none" stroke="#8B5CF6" strokeWidth="1.6" strokeOpacity="0.52" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={62} cy={14} r={3.5} fill="none" stroke="#8B5CF6" strokeWidth="1.2" strokeOpacity="0.8" />
            <text x={0} y={47} fontFamily="Inter,sans-serif" fontSize="7" fill="rgba(255,255,255,0.22)" letterSpacing="0.06em">DECIMAL FIX</text>
        </svg>
    );
}

function DecorV1Deployed() {
    return (
        <svg viewBox="0 0 160 48" style={{ width: "100%", height: "100%", display: "block" }}>
            {[12, 22, 34, 48, 64, 82].map((r, i) => (
                <circle key={i} cx={8} cy={24} r={r} fill="none"
                    stroke="#EF4444" strokeWidth="1.1"
                    strokeOpacity={0.48 - i * 0.065}
                    strokeDasharray={r > 28 ? "2 4" : ""} />
            ))}
            <circle cx={8} cy={24} r={3.2} fill="#EF4444" opacity={0.65} />
            <text x={0} y={47} fontFamily="Inter,sans-serif" fontSize="7" fill="rgba(255,255,255,0.22)" letterSpacing="0.06em">FIRST DEPLOY</text>
        </svg>
    );
}

export const NEWS_CARDS: NewsCard[] = [
    {
        id: "sepolia-v6-record",
        decor: <DecorV6Live />,
        accentColor: "#22C55E",
        tag: "v6 Active",
        title: "QryptSafe v6 Live",
        body: "49/49 E2E tests. OTP chain proofs, air bags isolation, pre-image resistant chain. Factory + Impl MIT-verified on Etherscan.",
        link: { text: "View full record", href: "/sepolia-verified-v6" },
    },
    {
        id: "sepolia-v5-record",
        decor: <DecorV5Verified />,
        accentColor: "#22C55E",
        tag: "v5 Legacy",
        title: "Sepolia Verified v5",
        body: "32/32 E2E tests. bytes32 proofHash, unshieldToRailgun, QryptAir EIP-712. Superseded by v6 (OTP chain + air bags upgrade).",
        link: { text: "View full record", href: "/sepolia-verified-v5" },
        decommissioned: true,
    },
    {
        id: "factory-v4",
        decor: <DecorV4Decommissioned />,
        accentColor: "#8B5CF6",
        tag: "v4 Decommissioned",
        title: "QryptSafe v4 Deployed",
        body: "v4 added QryptAir EIP-712 vouchers and QryptShield Railgun integration. Superseded by v5 (bytes32 proofHash upgrade).",
        link: { text: "Pending redeployment", href: "/sepolia-verified-v6" },
        decommissioned: true,
    },
    {
        id: "sepolia-v3-record",
        decor: <DecorV3Verified />,
        accentColor: "#22C55E",
        tag: "v3 Superseded",
        title: "Sepolia Verified v3",
        body: "26/26 E2E tests. QryptSafe EIP-1167, zero admin keys, MIT license. Superseded by v5 (string to bytes32 upgrade).",
        link: { text: "View record", href: "/sepolia-verified-v3" },
        decommissioned: true,
    },
    {
        id: "factory-v3",
        image: "/factory-v2-deploy.png",
        accentColor: "#22C55E",
        tag: "Deployment",
        title: "QryptSafe v3 Deployed",
        body: "QryptSafe and PersonalQryptSafe v3 live on Sepolia. No admin keys, no pause function. Both verified on Etherscan.",
        link: { text: "Pending redeployment", href: "/sepolia-verified-v3" },
        decommissioned: true,
    },
    {
        id: "sepolia-verified",
        image: "/sepolia-testnet-servers.png",
        accentColor: "#627EEA",
        tag: "v2 Shield",
        title: "v2 Shield Record",
        body: "8/8 on-chain scenarios. ShieldFactory v2 with decimal fix, 84 unit tests. Decommissioned: superseded by v3.",
        link: { text: "View record", href: "/sepolia-verified" },
        decommissioned: true,
    },
    {
        id: "shield-v2-deployed",
        decor: <DecorV2Deployed />,
        accentColor: "#8B5CF6",
        tag: "v2 Deployment",
        title: "Shield v2 Deployed",
        body: "ShieldFactory v2 with qToken decimal precision fix. Reads decimals() from the underlying ERC-20 at deploy time.",
        link: { text: "Pending redeployment", href: "/sepolia-verified" },
        decommissioned: true,
    },
    {
        id: "shield-v1-deployed",
        decor: <DecorV1Deployed />,
        accentColor: "#EF4444",
        tag: "v1 Superseded",
        title: "Shield v1 Deployed",
        body: "First deployment on Sepolia. ShieldToken hardcoded 18 decimals causing USDC display error. Superseded by v2.",
        link: { text: "Pending redeployment", href: "/sepolia-verified" },
        decommissioned: true,
    },
];

/* ── Shared card shell ──────────────────────────────────────────── */
const CARD_STYLE: React.CSSProperties = {
    background: "linear-gradient(160deg, rgba(18,14,40,0.97) 0%, rgba(8,10,28,0.98) 100%)",
    borderRadius: 20,
    border: "1px solid rgba(98,126,234,0.18)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
};

/* ── Challenge card content ─────────────────────────────────────── */
function ChallengeCardContent() {
    const { t } = useLanguage();
    const ch = t.heroCards.challenge;
    return (
        <div style={{ ...CARD_STYLE, position: "relative", padding: "16px 90px 16px 20px" }}>
            <div style={{ position: "absolute", top: 10, right: 12, zIndex: 2, width: 68, height: 68, filter: "drop-shadow(0 6px 24px rgba(98,126,234,0.6))" }}>
                <img src="/hacker-challenge-small.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.22)", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.36)", textTransform: "uppercase" }}>{ch.comingSoon}</span>
            </div>
            <h3 style={{ margin: "0 0 7px", fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 19, color: "rgba(255,255,255,0.42)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                {ch.title}
            </h3>
            <p style={{ margin: "0 0 14px", fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.26)", lineHeight: 1.5, flex: 1 }}>
                {ch.body}
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.2)", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, padding: "8px 16px", borderRadius: 9, cursor: "not-allowed", userSelect: "none" }}>
                {ch.mainnetOnly}
            </div>
        </div>
    );
}

/* ── News card content ──────────────────────────────────────────── */
function NewsCardContent({ card }: { card: NewsCard }) {
    const { t } = useLanguage();
    const cardIndex = NEWS_CARDS.findIndex(c => c.id === card.id);
    const tr = cardIndex >= 0 ? t.heroCards.cards[cardIndex] : null;
    const tag = tr?.tag ?? card.tag;
    const title = tr?.title ?? card.title;
    const body = tr?.body ?? card.body;
    const linkText = tr?.linkText ?? card.link?.text ?? "";

    return (
        <div style={{ ...CARD_STYLE, border: `1px solid ${card.accentColor}22` }}>
            {/* top visual: image or inline SVG decor */}
            {card.image ? (
                <div style={{ height: 78, flexShrink: 0, overflow: "hidden", position: "relative" }}>
                    <img src={card.image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: card.decommissioned ? "brightness(0.35) saturate(0.5)" : "brightness(0.65)", display: "block" }} />
                    {card.decommissioned && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#EF4444", background: "rgba(0,0,0,0.75)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 4, padding: "2px 8px" }}>Decommissioned</span>
                        </div>
                    )}
                </div>
            ) : card.decor ? (
                <div style={{ height: 78, flexShrink: 0, overflow: "hidden", background: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, ${card.accentColor}08 100%)`, padding: "14px 14px 8px", borderBottom: `1px solid ${card.accentColor}18` }}>
                    {card.decor}
                </div>
            ) : null}

            <div style={{ padding: "12px 16px 14px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                <div style={{ width: 22, height: 3, borderRadius: 2, background: card.decommissioned ? "rgba(239,68,68,0.4)" : card.accentColor, flexShrink: 0 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: card.decommissioned ? "rgba(239,68,68,0.7)" : card.accentColor }}>{tag}</div>
                    {card.decommissioned && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#EF4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 3, padding: "1px 5px" }}>OFF</span>}
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: card.decommissioned ? "rgba(255,255,255,0.5)" : "#fff", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{title}</div>
                <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.42)", lineHeight: 1.5, flex: 1, overflow: "hidden" }}>{body}</p>
                {card.link && (
                    card.link.href.startsWith("http")
                        ? <a href={card.link.href} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11.5, color: card.decommissioned ? "rgba(239,68,68,0.6)" : card.accentColor, textDecoration: "none", marginTop: 2 }}>
                            {linkText}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                          </a>
                        : <Link href={card.link.href} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11.5, color: card.decommissioned ? "rgba(239,68,68,0.6)" : card.accentColor, textDecoration: "none", marginTop: 2 }}>
                            {linkText}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                          </Link>
                )}
            </div>
        </div>
    );
}

/* ── Arrow button ───────────────────────────────────────────────── */
function ArrowBtn({ dir, onClick, disabled }: { dir: "left" | "right"; onClick: () => void; disabled: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{ flexShrink: 0, width: 38, height: 38, borderRadius: "50%", background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.2 : 1, padding: 0, alignSelf: "center", transition: "background 0.15s, opacity 0.15s" }}
            onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.10)"; }}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5">
                {dir === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
            </svg>
        </button>
    );
}

/* ── Desktop: unified scrolling carousel ──────────────────────── */
const ALL_DESKTOP_CARDS: Array<{ type: "challenge" } | { type: "news"; card: NewsCard }> = [
    { type: "challenge" },
    ...NEWS_CARDS.map(c => ({ type: "news" as const, card: c })),
];
const DESKTOP_VISIBLE = 3;

function renderDesktopCard(item: (typeof ALL_DESKTOP_CARDS)[number], key: string) {
    return (
        <div key={key} style={{ flex: 1, minWidth: 0 }}>
            {item.type === "challenge"
                ? <ChallengeCardContent />
                : <NewsCardContent card={(item as { type: "news"; card: NewsCard }).card} />}
        </div>
    );
}

function DesktopRow() {
    const total = ALL_DESKTOP_CARDS.length;
    const [offset, setOffset] = useState(0);
    const canPrev = offset > 0;
    const canNext = offset + DESKTOP_VISIBLE < total;
    const visible = ALL_DESKTOP_CARDS.slice(offset, offset + DESKTOP_VISIBLE);

    return (
        <div style={{ display: "flex", alignItems: "stretch", gap: 10, width: "100%", height: 230 }}>
            <ArrowBtn dir="left" onClick={() => setOffset(o => Math.max(0, o - DESKTOP_VISIBLE))} disabled={!canPrev} />
            {visible.map((item) =>
                renderDesktopCard(item, item.type === "challenge" ? "challenge" : (item as { type: "news"; card: NewsCard }).card.id)
            )}
            <ArrowBtn dir="right" onClick={() => setOffset(o => Math.min(total - DESKTOP_VISIBLE, o + DESKTOP_VISIBLE))} disabled={!canNext} />
        </div>
    );
}

/* ── Mobile: stacked swipeable deck ─────────────────────────────── */
const ALL_MOBILE_CARDS = [{ type: "challenge" as const }, ...NEWS_CARDS.map(c => ({ type: "news" as const, card: c }))];

function MobileStack() {
    const [current, setCurrent] = useState(0);
    const [flyDir, setFlyDir] = useState<"left" | "right" | null>(null);
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const total = ALL_MOBILE_CARDS.length;

    const goNext = () => {
        if (current >= total - 1 || flyDir) return;
        setFlyDir("left");
        setTimeout(() => { setCurrent(c => c + 1); setFlyDir(null); }, 300);
    };
    const goPrev = () => {
        if (current <= 0 || flyDir) return;
        setFlyDir("right");
        setTimeout(() => { setCurrent(c => c - 1); setFlyDir(null); }, 300);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
            if (dx < 0) goNext();
            else goPrev();
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    const stackRotations = [
        { rotate: 0, scale: 1, tx: 0, ty: 0, z: 10 },
        { rotate: -2.8, scale: 0.955, tx: 7, ty: 9, z: 9 },
        { rotate: 1.6, scale: 0.91, tx: -5, ty: 16, z: 8 },
    ];

    const cardIndices = [current, current + 1, current + 2].filter(i => i < total);

    function renderCard(item: (typeof ALL_MOBILE_CARDS)[number]) {
        if (item.type === "challenge") return <ChallengeCardContent />;
        return <NewsCardContent card={(item as { type: "news"; card: NewsCard }).card} />;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
                style={{ position: "relative", height: 240, touchAction: "pan-y", userSelect: "none" }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {[...cardIndices].reverse().map((idx) => {
                    const stackPos = cardIndices.indexOf(idx);
                    const t = stackRotations[stackPos] ?? stackRotations[2];
                    const isFront = stackPos === 0;

                    let flyStyle: React.CSSProperties = {};
                    if (isFront && flyDir === "left") {
                        flyStyle = { transform: `rotate(${t.rotate - 4}deg) scale(${t.scale}) translate(-130%, ${t.ty}px)`, opacity: 0, transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s" };
                    } else if (isFront && flyDir === "right") {
                        flyStyle = { transform: `rotate(${t.rotate + 4}deg) scale(${t.scale}) translate(130%, ${t.ty}px)`, opacity: 0, transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s" };
                    }

                    return (
                        <div
                            key={ALL_MOBILE_CARDS[idx].type === "challenge" ? "challenge" : (ALL_MOBILE_CARDS[idx] as { type: "news"; card: NewsCard }).card.id}
                            style={{
                                position: "absolute",
                                inset: 0,
                                zIndex: t.z,
                                transform: `rotate(${t.rotate}deg) scale(${t.scale}) translate(${t.tx}px, ${t.ty}px)`,
                                transformOrigin: "bottom center",
                                transition: isFront && !flyDir ? "none" : "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                                ...(Object.keys(flyStyle).length ? flyStyle : {}),
                            }}
                        >
                            {renderCard(ALL_MOBILE_CARDS[idx])}
                        </div>
                    );
                })}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 2 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.22)" }}>Swipe to navigate</span>
                <div style={{ display: "flex", gap: 5 }}>
                    {Array.from({ length: total }).map((_, i) => (
                        <div key={i} style={{ width: i === current ? 18 : 6, height: 6, borderRadius: 3, background: i === current ? "#627EEA" : "rgba(255,255,255,0.15)", transition: "width 0.2s, background 0.2s" }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function HeroCardRow({ isMobile }: { isMobile: boolean }) {
    return isMobile ? <MobileStack /> : <DesktopRow />;
}
