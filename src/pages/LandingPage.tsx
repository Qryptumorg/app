import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import FluidShape from "@/components/FluidShape";
import SharedNavBar from "@/components/SharedNavBar";
import HeroCardRow from "@/components/HeroCardRow";
import { useLanguage } from "@/lib/LanguageContext";

export default function LandingPage() {
    const [, navigate] = useLocation();
    const isConnecting = false;

    const handleConnect = () => {
        navigate("/app");
    };

    return (
        <div className="min-h-screen text-white flex flex-col overflow-x-hidden" style={{ background: "#000000" }}>
            <SharedNavBar onConnect={handleConnect} isConnecting={isConnecting} />
            <HeroSection onConnect={handleConnect} isConnecting={isConnecting} />
            <LogosStrip />
            <StatsSplit />
            <UseCases />
            <ProductsBento />
            <HowItWorks />
            <FinalCTA onConnect={handleConnect} isConnecting={isConnecting} />
            <Footer />
        </div>
    );
}

/* ─── ProductsBento ─────────────────────────────────────────────────── */

function ProductsBento() {
    const { t } = useLanguage();
    const L = t.landing;
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 900);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const PRODUCT_TAGS = [
        ["Commit-Reveal", "Non-Custodial", "ERC-20"],
        ["Railgun Pool", "Zero Sender", "MEV-Safe"],
        ["EIP-712", "QR Code", "No Internet"],
    ];
    const PRODUCT_IMGS  = ["/images/prod-qryptsafe.jpg", "/images/prod-qryptshield.jpg", "/images/prod-qryptair.jpg"];
    const PRODUCT_HREFS = ["/create-personal-qrypt-safe", "/qrypt-shield", "/qrypt-air"];
    const PRODUCT_GRID  = [
        { col: "1 / 2", row: "1 / 3" },
        { col: "2 / 3", row: "1 / 2" },
        { col: "2 / 3", row: "2 / 3" },
    ];
    const IMG_HEIGHTS   = [isMobile ? 220 : 340, 190, 190];

    const tag = (label: string, color: string) => (
        <span key={label} style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11, fontWeight: 600,
            color,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            borderRadius: 100,
            padding: "3px 10px",
        }}>{label}</span>
    );

    const card = ({
        img, color, badge, title, desc, tags, href,
        gridColumn, gridRow, imgH, features,
    }: {
        img: string; color: string; badge: string; title: string; desc: string;
        tags: string[]; href: string; gridColumn?: string; gridRow?: string; imgH: number;
        features?: Array<{ label: string; detail: string }>;
    }) => (
        <a href={href} key={href} style={{
            gridColumn: isMobile ? "1" : (gridColumn ?? "auto"),
            gridRow: isMobile ? "auto" : (gridRow ?? "auto"),
            background: "#07070c",
            border: `1px solid ${color}20`,
            borderRadius: 20,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            textDecoration: "none",
            transition: "border-color 0.2s, transform 0.2s",
            cursor: "pointer",
        }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}45`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}20`; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
        >
            {/* Image */}
            <div style={{ position: "relative", flexShrink: 0 }}>
                <img src={img} alt={badge} style={{ width: "100%", height: imgH, objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top, #07070c, transparent)" }} />
            </div>
            {/* Content */}
            <div style={{ padding: isMobile ? "20px 22px 26px" : "22px 28px 30px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color, textTransform: "uppercase" }}>{badge}</span>
                </div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: gridColumn === "1 / 2" ? (isMobile ? 22 : 26) : 19, fontWeight: 800, color: "#d4d6e2", lineHeight: 1.2, margin: "0 0 10px" }}>{title}</h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.52)", lineHeight: 1.65, margin: "0 0 20px" }}>{desc}</p>

                {/* Feature bullet list ,  fills empty space on large cards */}
                {features && features.length > 0 && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0, marginBottom: 24 }}>
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }} />
                        {features.map((f, i) => (
                            <div key={f.label} style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12,
                                padding: "11px 0",
                                borderBottom: i < features.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                            }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                                    <circle cx="8" cy="8" r="7" stroke={color} strokeOpacity="0.35" strokeWidth="1" />
                                    <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div>
                                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#d4d6e2", marginBottom: 2 }}>{f.label}</div>
                                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18, marginTop: features ? 0 : "auto" }}>
                    {tags.map(t => tag(t, color))}
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color }}>
                    {badge} <span style={{ fontSize: 15 }}>→</span>
                </span>
            </div>
        </a>
    );

    return (
        <section style={{
            background: "#030308",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: isMobile ? "72px 20px 80px" : "100px 48px 110px",
        }}>
            {/* Header */}
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 56px" }}>
                <p style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)",
                    textTransform: "uppercase", marginBottom: 16,
                }}>{L.productsBentoLabel}</p>
                <h2 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: isMobile ? 30 : 44, fontWeight: 800,
                    color: "#d4d6e2", lineHeight: 1.1, margin: "0 0 18px",
                }}>{L.productsBentoHeading.split("\n").map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}</h2>
                <p style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 16,
                    color: "rgba(255,255,255,0.48)", lineHeight: 1.65, margin: 0,
                }}>{L.productsBentoSubtitle}</p>
            </div>

            {/* Bento grid */}
            <div style={{
                maxWidth: 1300, margin: "0 auto",
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
                gridTemplateRows: isMobile ? "auto" : "1fr 1fr",
                gap: 14,
            }}>
                {L.products.map((prod, i) => {
                    const color = MODE_COLORS[prod.badge] ?? "#22C55E";
                    const grid  = PRODUCT_GRID[i];
                    return card({
                        img:        PRODUCT_IMGS[i],
                        color,
                        badge:      prod.badge,
                        title:      prod.title,
                        desc:       prod.desc,
                        tags:       PRODUCT_TAGS[i],
                        href:       PRODUCT_HREFS[i],
                        gridColumn: isMobile ? "1" : grid.col,
                        gridRow:    isMobile ? "auto" : grid.row,
                        imgH:       IMG_HEIGHTS[i],
                        features:   prod.features as unknown as { label: string; detail: string }[] | undefined,
                    });
                })}
            </div>
        </section>
    );
}

/* ─── HowItWorks ─────────────────────────────────────────────────────── */

const HEX_CHARS = "0123456789abcdef";

function HexRainCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const el: HTMLCanvasElement = canvas;
        const ctx = el.getContext("2d")!;

        const CELL = 28;
        let cols: number, rows: number;
        type Cell = { char: string; opacity: number; target: number; speed: number };
        let grid: Cell[][] = [];

        function resize() {
            el.width = el.offsetWidth;
            el.height = el.offsetHeight;
            cols = Math.ceil(el.width / CELL);
            rows = Math.ceil(el.height / CELL);
            grid = Array.from({ length: rows }, () =>
                Array.from({ length: cols }, () => ({
                    char: HEX_CHARS[Math.floor(Math.random() * 16)],
                    opacity: Math.random() * 0.05,
                    target: Math.random() < 0.15 ? 0.055 : 0,
                    speed: 0.003 + Math.random() * 0.006,
                }))
            );
        }
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(el);

        let frame = 0;
        let raf: number;
        let last = 0;

        function tick(ts: number) {
            raf = requestAnimationFrame(tick);
            if (ts - last < 80) return; // ~12 fps
            last = ts;
            frame++;

            ctx.clearRect(0, 0, el.width, el.height);
            ctx.font = `${CELL - 8}px monospace`;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = grid[r][c];

                    // drift opacity toward target
                    if (cell.opacity < cell.target) {
                        cell.opacity = Math.min(cell.target, cell.opacity + cell.speed);
                    } else if (cell.opacity > cell.target) {
                        cell.opacity = Math.max(cell.target, cell.opacity - cell.speed);
                    } else {
                        // reached target, flip
                        cell.target = cell.opacity > 0.01 ? 0 : (Math.random() < 0.18 ? 0.055 : 0);
                        cell.char = HEX_CHARS[Math.floor(Math.random() * 16)];
                    }

                    if (cell.opacity < 0.005) continue;
                    ctx.fillStyle = `rgba(255,255,255,${cell.opacity.toFixed(3)})`;
                    ctx.fillText(cell.char, c * CELL, r * CELL + CELL - 4);
                }
            }
        }
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                userSelect: "none",
            }}
        />
    );
}

const STEP_NUMS = ["01", "02", "03"];

const MODE_COLORS: Record<string, string> = {
    QryptSafe:   "#22C55E",
    QryptShield: "#8B5CF6",
    QryptAir:    "#F59E0B",
};

type SnipLine = { dim: boolean; text: string };

const PRODUCT_SNIPPETS: SnipLine[][][] = [
    [
        [
            { dim: true,  text: "// lock USDC with vault proof" },
            { dim: false, text: "vault.shield({" },
            { dim: false, text: '  token:  "USDC",' },
            { dim: false, text: "  amount: 1000," },
            { dim: false, text: "  proof:  vaultProof(***)" },
            { dim: false, text: "})" },
            { dim: true,  text: "" },
            { dim: true,  text: "vault_id: 0x7f3a2b...d91a" },
        ],
        [
            { dim: true,  text: "// attacker has privkey, no proof" },
            { dim: true,  text: "vault.transfer('0x7f3a...', to)" },
            { dim: true,  text: "  revert: InvalidVaultProof" },
            { dim: true,  text: "" },
            { dim: true,  text: "// owner: key + vault proof" },
            { dim: false, text: "vault.transfer({" },
            { dim: false, text: "  vault_id: '0x7f3a...'," },
            { dim: false, text: "  to:       '0xB4c2...'," },
            { dim: false, text: "  proof:    vaultProof(***)" },
            { dim: false, text: "})" },
        ],
        [
            { dim: true,  text: "// on-chain verification" },
            { dim: false, text: "require(" },
            { dim: false, text: "  verifyVaultProof(proof)" },
            { dim: false, text: "  == vault.anchor," },
            { dim: false, text: "  'InvalidVaultProof'" },
            { dim: false, text: ")" },
            { dim: true,  text: "" },
            { dim: true,  text: "tokens released to 0xB4c2... ✓" },
        ],
    ],
    [
        [
            { dim: true,  text: "// shield into Railgun pool" },
            { dim: false, text: "railgun.shield({" },
            { dim: false, text: '  token:   "USDC",' },
            { dim: false, text: "  amount:  500," },
            { dim: false, text: "  zkProof: generateProof(***)" },
            { dim: false, text: "})" },
            { dim: true,  text: "" },
            { dim: true,  text: "// shielded balance: 500 USDC" },
        ],
        [
            { dim: true,  text: "// on-chain record" },
            { dim: false, text: "txHistory: [" },
            { dim: false, text: "  wallet -> railgunPool" },
            { dim: false, text: "]" },
            { dim: true,  text: "" },
            { dim: true,  text: "// sender addr:  [PRIVATE]" },
            { dim: true,  text: "// amount:       [PRIVATE]" },
            { dim: true,  text: "// recipient:    [PRIVATE]" },
        ],
        [
            { dim: true,  text: "// unshield to any address" },
            { dim: false, text: "railgun.unshield({" },
            { dim: false, text: '  token:   "USDC",' },
            { dim: false, text: "  to:      '0xB4c2...'," },
            { dim: false, text: "  zkProof: generateProof(***)" },
            { dim: false, text: "})" },
            { dim: true,  text: "" },
            { dim: true,  text: "// no on-chain link to origin ✓" },
        ],
    ],
    [
        [
            { dim: true,  text: "// sign offline, no connection" },
            { dim: false, text: "voucher = EIP712.sign({" },
            { dim: false, text: "  to:       '0xB4c2...'," },
            { dim: false, text: "  amount:   1000," },
            { dim: false, text: '  token:    "USDC",' },
            { dim: false, text: "  deadline: 1735689600," },
            { dim: false, text: "})" },
            { dim: true,  text: "// ✓ signed, no broadcast yet" },
        ],
        [
            { dim: true,  text: "// encode as QR code" },
            { dim: false, text: "qrCode = encodeVoucher({" },
            { dim: false, text: "  sig:  voucher.sig," },
            { dim: false, text: "  to:   voucher.to," },
            { dim: false, text: "  data: voucher.payload" },
            { dim: false, text: "})" },
            { dim: true,  text: "" },
            { dim: true,  text: "// share via photo / print" },
        ],
        [
            { dim: true,  text: "// recipient broadcasts" },
            { dim: false, text: "contract.redeemVoucher({" },
            { dim: false, text: "  voucher:      qr.data," },
            { dim: false, text: "  transferCode: code," },
            { dim: false, text: "  sig:          qr.sig" },
            { dim: false, text: "})" },
            { dim: true,  text: "" },
            { dim: true,  text: "// EIP-712 verified on-chain ✓" },
        ],
    ],
];

function HowItWorks() {
    const { t } = useLanguage();
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );
    const [activeTab, setActiveTab] = useState(0);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const flows   = t.landing.productFlows;
    const flow    = flows[activeTab];
    const color   = MODE_COLORS[flow.badge] ?? "#22C55E";
    const snippets = PRODUCT_SNIPPETS[activeTab];

    return (
        <section style={{
            position: "relative",
            background: "#000",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: isMobile ? "80px 28px 88px" : "100px 48px 108px",
            overflow: "hidden",
        }}>
            <HexRainCanvas />

            {/* content above canvas */}
            <div style={{ position: "relative", zIndex: 1 }}>
                {/* Header */}
                <div style={{ marginBottom: isMobile ? 32 : 44 }}>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        color: "rgba(255,255,255,0.28)",
                        textTransform: "uppercase",
                        marginBottom: 16,
                    }}>{t.landing.howItWorksLabel}</p>
                    <h2 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: isMobile ? 30 : 46,
                        fontWeight: 800,
                        lineHeight: 1.1,
                        color: "#d4d6e2",
                        letterSpacing: "-0.02em",
                        marginBottom: 28,
                    }}>
                        {flow.heading}
                    </h2>

                    {/* Product tab switcher */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                        {flows.map((prod, i) => {
                            const tabColor = MODE_COLORS[prod.badge] ?? "#22C55E";
                            return (
                                <button
                                    key={prod.badge}
                                    onClick={() => setActiveTab(i)}
                                    style={{
                                        padding: isMobile ? "7px 14px" : "8px 18px",
                                        borderRadius: 100,
                                        border: `1px solid ${activeTab === i ? tabColor + "80" : "rgba(255,255,255,0.12)"}`,
                                        background: activeTab === i ? tabColor + "18" : "transparent",
                                        color: activeTab === i ? tabColor : "rgba(255,255,255,0.45)",
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.18s",
                                        letterSpacing: "-0.01em",
                                    }}
                                >
                                    {prod.badge}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Step cards */}
                <div style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 16,
                    position: "relative",
                }}>
                    {/* connector line desktop */}
                    {!isMobile && (
                        <div style={{
                            position: "absolute",
                            top: 44,
                            left: "calc(16.5% + 16px)",
                            right: "calc(16.5% + 16px)",
                            height: 1,
                            background: "rgba(255,255,255,0.08)",
                            zIndex: 0,
                        }}>
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                background: `linear-gradient(90deg, transparent 0%, ${color}55 50%, transparent 100%)`,
                                animation: "connectorSlide 3s linear infinite",
                            }} />
                        </div>
                    )}

                    {flow.steps.map((step, i) => (
                        <div
                            key={`${activeTab}-${i}`}
                            style={{
                                flex: 1,
                                background: "rgba(255,255,255,0.025)",
                                border: `1px solid ${color}22`,
                                borderRadius: 16,
                                padding: isMobile ? "28px 24px" : "32px 28px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 20,
                                position: "relative",
                                zIndex: 1,
                                backdropFilter: "blur(4px)",
                            }}
                        >
                            {/* Step number + title */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    border: `1px solid ${color}40`,
                                    background: color + "10",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <span style={{
                                        fontFamily: "'Inter', monospace",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color,
                                        letterSpacing: "0.05em",
                                    }}>{STEP_NUMS[i]}</span>
                                </div>
                                <span style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: 18,
                                    fontWeight: 800,
                                    color: "rgba(255,255,255,0.90)",
                                    letterSpacing: "-0.01em",
                                }}>{step.title}</span>
                            </div>

                            {/* Description */}
                            <p style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 14,
                                lineHeight: 1.7,
                                color: "rgba(255,255,255,0.50)",
                            }}>{step.desc}</p>

                            {/* Terminal snippet */}
                            <div style={{
                                background: "rgba(0,0,0,0.55)",
                                border: "1px solid rgba(255,255,255,0.09)",
                                borderRadius: 10,
                                padding: "16px 18px",
                                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                                fontSize: 12,
                                lineHeight: 1.75,
                            }}>
                                {/* terminal top bar */}
                                <div style={{ display: "flex", gap: 6, marginBottom: 12, opacity: 0.55 }}>
                                    {["rgba(255,95,87,1)", "rgba(255,188,46,1)", "rgba(40,200,64,1)"].map((c, j) => (
                                        <div key={j} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                                    ))}
                                </div>
                                {snippets[i].map((line, j) => (
                                    <div key={j} style={{
                                        color: line.dim ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.62)",
                                        whiteSpace: "pre",
                                    }}>{line.text || "\u00a0"}</div>
                                ))}
                                {/* blinking cursor */}
                                <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
                                    <span style={{ color: "rgba(255,255,255,0.25)", fontFamily: "inherit" }}>{">"}</span>
                                    <span style={{
                                        display: "inline-block",
                                        width: 7,
                                        height: 14,
                                        background: color + "90",
                                        marginLeft: 6,
                                        animation: "blink 1.1s step-end infinite",
                                    }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── FinalCTA ───────────────────────────────────────────────────────── */

function FinalCTA({ onConnect, isConnecting }: { onConnect: () => void; isConnecting: boolean }) {
    const { t } = useLanguage();
    const L = t.landing;
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return (
        <section style={{
            background: "#04040a",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: isMobile ? "100px 28px" : "140px 48px",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
        }}>
            {/* Dot grid */}
            <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
                pointerEvents: "none",
            }} />

            {/* Fade out dot grid at edges */}
            <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, #04040a 100%)",
                pointerEvents: "none",
            }} />

            {/* Main center glow */}
            <div style={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: isMobile ? 480 : 900,
                height: isMobile ? 480 : 900,
                background: "radial-gradient(ellipse, rgba(80,100,240,0.32) 0%, rgba(120,60,200,0.14) 45%, transparent 70%)",
                pointerEvents: "none",
                filter: "blur(48px)",
            }} />

            {/* Bottom-left accent blob */}
            <div style={{
                position: "absolute",
                bottom: -80,
                left: -60,
                width: 380,
                height: 380,
                background: "radial-gradient(circle, rgba(40,140,255,0.14) 0%, transparent 70%)",
                pointerEvents: "none",
                filter: "blur(36px)",
            }} />

            {/* Top-right accent blob */}
            <div style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 320,
                height: 320,
                background: "radial-gradient(circle, rgba(160,80,240,0.13) 0%, transparent 70%)",
                pointerEvents: "none",
                filter: "blur(32px)",
            }} />

            <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.28)",
                textTransform: "uppercase",
                marginBottom: 20,
            }}>{L.ctaLabel}</p>

            <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: isMobile ? 34 : 62,
                fontWeight: 800,
                lineHeight: 1.08,
                color: "#d4d6e2",
                letterSpacing: "-0.03em",
                marginBottom: 20,
                maxWidth: 700,
            }}>
                {L.ctaTitle}
            </h2>

            <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: isMobile ? 15 : 18,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.45)",
                maxWidth: 480,
                marginBottom: 44,
            }}>
                {L.ctaBody}
            </p>

            <div style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: 12,
                width: isMobile ? "100%" : "auto",
            }}>
                <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 15,
                        fontWeight: 700,
                        background: "#fff",
                        color: "#000",
                        border: "none",
                        borderRadius: 10,
                        padding: "14px 32px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        letterSpacing: "-0.01em",
                        width: isMobile ? "100%" : "auto",
                        transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                    {isConnecting ? "Connecting..." : L.ctaBtn}
                    {!isConnecting && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    )}
                </button>

                <a
                    href="https://etherscan.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 15,
                        fontWeight: 600,
                        background: "transparent",
                        color: "rgba(255,255,255,0.7)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 10,
                        padding: "14px 28px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        textDecoration: "none",
                        width: isMobile ? "100%" : "auto",
                        transition: "border-color 0.15s, color 0.15s",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                        e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    }}
                >
                    {L.ctaEtherscanBtn}
                </a>
            </div>
        </section>
    );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */

function Footer() {
    const { t } = useLanguage();
    const L = t.landing;
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const cols: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] = [
        {
            heading: L.footerColProduct,
            links: [
                { label: L.footerLinkLaunchApp, href: "/app" },
                { label: L.footerLinkTestnet, href: "/docs/developer/join-testnet" },
                { label: L.footerLinkMainnet, href: "https://etherscan.io", external: true },
            ],
        },
        {
            heading: L.footerColDevelopers,
            links: [
                { label: L.footerLinkDocumentation, href: "/docs", external: true },
                { label: L.footerLinkGitHub, href: "https://github.com/Qryptumorg", external: true },
            ],
        },
        {
            heading: L.footerColCommunity,
            links: [
                { label: L.footerLinkTwitter, href: "https://x.com/qryptumorg", external: true },
                { label: L.footerLinkTelegram, href: "https://t.me/qryptumorg", external: true },
            ],
        },
    ];

    const linkStyle: React.CSSProperties = {
        fontFamily: "'Inter', sans-serif",
        fontSize: 14,
        color: "rgba(255,255,255,0.38)",
        textDecoration: "none",
        lineHeight: "2",
        display: "block",
        transition: "color 0.15s",
        cursor: "pointer",
    };

    return (
        <footer style={{
            background: "#04040a",
            position: "relative",
            padding: isMobile ? "56px 28px 32px" : "72px 48px 36px",
        }}>
            {/* Glowing top border */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: "linear-gradient(90deg, transparent 0%, rgba(98,126,234,0.5) 30%, rgba(160,80,240,0.5) 70%, transparent 100%)",
                pointerEvents: "none",
            }} />
            {/* Top row */}
            <div style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 48 : 0,
                marginBottom: 56,
            }}>
                {/* Brand */}
                <div style={{ flex: 1.4, paddingRight: isMobile ? 0 : 48 }}>
                    <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 0, marginBottom: 16 }}>
                        <img src="/qryptum-logo.png" alt="Qryptum" style={{ height: 36, width: 36, objectFit: "contain", display: "block" }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 800, color: "#d4d6e2", letterSpacing: "-0.01em", marginLeft: -4 }}>QRYPTUM</span>
                    </a>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.35)", maxWidth: 260 }}>
                        {L.footerTagline}
                    </p>
                </div>

                {/* Link columns */}
                <div style={{
                    display: "flex",
                    gap: isMobile ? 32 : 64,
                    flex: 2,
                    flexWrap: isMobile ? "wrap" : "nowrap",
                }}>
                    {cols.map((col) => (
                        <div key={col.heading}>
                            <p style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.10em",
                                color: "rgba(255,255,255,0.25)",
                                textTransform: "uppercase",
                                marginBottom: 12,
                            }}>{col.heading}</p>
                            {col.links.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    style={linkStyle}
                                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
                                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: 24,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "space-between",
                gap: 16,
            }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.22)" }}>
                    {L.footerCopy}
                </p>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                    {[{ label: L.footerPrivacy, href: "/privacy" }, { label: L.footerTerms, href: "/terms" }].map(item => (
                        <a
                            key={item.label}
                            href={item.href}
                            style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.22)", textDecoration: "none", transition: "color 0.15s" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}
                        >
                            {item.label}
                        </a>
                    ))}
                    {/* X/Twitter */}
                    <a href="https://x.com/qryptumorg" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.22)", transition: "color 0.15s", display: "flex" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.27 2.25H8.08l4.253 5.622L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                        </svg>
                    </a>
                    {/* GitHub */}
                    <a href="https://github.com/Qryptumorg" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.22)", transition: "color 0.15s", display: "flex" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" clipRule="evenodd" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
}

/* ─── UseCases ───────────────────────────────────────────────────────── */

function UseCases() {
    const { t } = useLanguage();
    const L = t.landing;
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const cardMeta = [
        { img: "/usecase-shield.jpg",      bg: "rgba(20,24,60,0.9)",  border: "rgba(98,126,234,0.15)", href: "/vault-proof-security"  },
        { img: "/usecase-inheritance.jpg", bg: "rgba(35,18,55,0.9)",  border: "rgba(150,80,220,0.15)", href: "/making-transfers"       },
        { img: "/usecase-coldwallet.jpg",  bg: "rgba(12,32,24,0.9)",  border: "rgba(30,180,100,0.15)", href: "/app"                   },
    ];
    const cards = L.useCasesCards.map((c, i) => ({ ...cardMeta[i], ...c }));

    return (
        <section id="use-cases" style={{
            background: "#000",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: isMobile ? "72px 28px" : "100px 48px",
        }}>
            {/* Header */}
            <div style={{ marginBottom: isMobile ? 40 : 56 }}>
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: "rgba(255,255,255,0.28)",
                    textTransform: "uppercase",
                    marginBottom: 16,
                }}>{L.useCasesLabel}</p>
                <h2 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: isMobile ? 32 : 46,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    color: "#d4d6e2",
                    letterSpacing: "-0.02em",
                    maxWidth: 520,
                    whiteSpace: "pre-line",
                }}>
                    {L.useCasesHeading}
                </h2>
            </div>

            {/* Bento grid */}
            {isMobile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Quantum Design card - mobile first */}
                    <a href="/quantum-design" style={{ textDecoration: "none", display: "block", position: "relative", borderRadius: 20, overflow: "hidden", minHeight: 220, border: "1px solid rgba(79,70,229,0.25)" }}>
                        <img src="/images/quantum-design-hero.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(79,70,229,0.55) 0%, rgba(0,0,0,0.75) 100%)" }} />
                        <div style={{ position: "relative", padding: "32px 28px" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(79,70,229,0.18)", border: "1px solid rgba(79,70,229,0.35)", borderRadius: 14, padding: "3px 12px", marginBottom: 16 }}>
                                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.22)" }} />
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Post-Quantum</span>
                            </div>
                            <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, color: "#d4d6e2", marginBottom: 10, letterSpacing: "-0.015em", lineHeight: 1.15 }}>{L.useCasesQuantumTitle}</h3>
                            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", marginBottom: 20 }}>{L.useCasesQuantumDesc}</p>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.52)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                                {L.useCasesQuantumCta}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </span>
                        </div>
                    </a>
                    {cards.map((card, i) => (
                        <div key={i} style={{
                            background: card.bg,
                            border: `1px solid ${card.border}`,
                            borderRadius: 20,
                            overflow: "hidden",
                        }}>
                            <img src={card.img} alt={card.title} style={{ width: "100%", height: 200, objectFit: "cover", objectPosition: "center top" }} />
                            <div style={{ padding: "24px 24px 28px" }}>
                                <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: "#d4d6e2", marginBottom: 10, letterSpacing: "-0.01em" }}>{card.title}</h3>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.48)", marginBottom: 20 }}>{card.desc}</p>
                                <a href={card.href} style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 2 }}>
                                    {card.cta}
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Row 1: Quantum Design - full width featured card */}
                    <a href="/quantum-design" style={{
                        textDecoration: "none", display: "block", position: "relative",
                        borderRadius: 20, overflow: "hidden", minHeight: 280,
                        border: "1px solid rgba(79,70,229,0.22)",
                    }}>
                        <img src="/images/quantum-design-hero.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(79,70,229,0.5) 0%, rgba(124,58,237,0.25) 50%, rgba(0,0,0,0.7) 100%)" }} />
                        <div style={{ position: "relative", padding: "52px 56px", display: "flex", alignItems: "center", gap: 60 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.28)", borderRadius: 16, padding: "4px 14px", marginBottom: 20 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.22)",  }} />
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Post-Quantum Security</span>
                                </div>
                                <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 32, fontWeight: 900, color: "#d4d6e2", marginBottom: 16, letterSpacing: "-0.025em", lineHeight: 1.1 }}>{L.useCasesQuantumTitle}</h3>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.52)", maxWidth: 480, marginBottom: 28 }}>{L.useCasesQuantumDesc}</p>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.52)", display: "inline-flex", alignItems: "center", gap: 7 }}>
                                    {L.useCasesQuantumCta}
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
                                {["256-bit keccak256", "2\u00B9\u00B2\u2078 collision resistance", "0 elliptic curve deps"].map(stat => (
                                    <div key={stat} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 18px", fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,0.65)", letterSpacing: "-0.01em" }}>
                                        {stat}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </a>

                    {/* Row 2: LEFT = card[0] (SIM swap, tall), RIGHT = card[1] + card[2] stacked */}
                    <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
                        {/* LEFT: SIM swap - text-heavy, full height */}
                        <div style={{
                            flex: "0 0 46%",
                            background: cards[0].bg,
                            border: `1px solid ${cards[0].border}`,
                            borderRadius: 20,
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "row",
                        }}>
                            <div style={{ flex: 1, padding: "42px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, color: "#d4d6e2", marginBottom: 14, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{cards[0].title}</h3>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.48)", marginBottom: 28, flex: 1 }}>{cards[0].desc}</p>
                                <a href={cards[0].href} style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 2, alignSelf: "flex-start" }}>
                                    {cards[0].cta}
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </a>
                            </div>
                            <div style={{ width: 180, flexShrink: 0, overflow: "hidden" }}>
                                <img src={cards[0].img} alt={cards[0].title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
                            </div>
                        </div>

                        {/* RIGHT: card[1] + card[2] stacked */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                            {cards.slice(1).map((card, i) => (
                                <div key={i} style={{
                                    flex: 1,
                                    background: card.bg,
                                    border: `1px solid ${card.border}`,
                                    borderRadius: 20,
                                    overflow: "hidden",
                                    display: "flex",
                                    flexDirection: "row",
                                }}>
                                    <div style={{ flex: 1, padding: "28px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                        <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 19, fontWeight: 800, color: "#d4d6e2", marginBottom: 10, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{card.title}</h3>
                                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13.5, lineHeight: 1.65, color: "rgba(255,255,255,0.46)", marginBottom: 18, flex: 1 }}>{card.desc}</p>
                                        <a href={card.href} style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 2, alignSelf: "flex-start" }}>
                                            {card.cta}
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        </a>
                                    </div>
                                    <div style={{ width: 160, flexShrink: 0, overflow: "hidden" }}>
                                        <img src={card.img} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

/* ─── StatsSplit ─────────────────────────────────────────────────────── */

function StatsSplit() {
    const { t } = useLanguage();
    const L = t.landing;
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return (
        <section style={{
            background: "#060608",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: isMobile ? "64px 28px 0" : "80px 48px 0",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Glow light beams */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220, zIndex: 0, pointerEvents: "none" }}>
                <div style={{ position: "absolute", bottom: -40, left: "5%",  width: "55%", height: 60,  background: "rgba(0,220,100,0.22)",  filter: "blur(28px)",  borderRadius: 999 }} />
                <div style={{ position: "absolute", bottom: -20, left: "20%", width: "40%", height: 30,  background: "rgba(0,200,80,0.15)",   filter: "blur(18px)",  borderRadius: 999 }} />
                <div style={{ position: "absolute", bottom: 30,  left: "35%", width: "60%", height: 22,  background: "rgba(10,180,80,0.12)",  filter: "blur(16px)",  borderRadius: 999 }} />
                <div style={{ position: "absolute", bottom: 60,  left: "50%", width: "45%", height: 18,  background: "rgba(120,60,220,0.18)", filter: "blur(20px)",  borderRadius: 999 }} />
                <div style={{ position: "absolute", bottom: 10,  left: "55%", width: "50%", height: 28,  background: "rgba(80,40,200,0.14)",  filter: "blur(24px)",  borderRadius: 999 }} />
                <div style={{ position: "absolute", bottom: 80,  left: "60%", width: "38%", height: 16,  background: "rgba(60,180,240,0.10)", filter: "blur(20px)",  borderRadius: 999 }} />
                <div style={{ position: "absolute", bottom: -10, left: "70%", width: "32%", height: 24,  background: "rgba(100,60,220,0.16)", filter: "blur(22px)",  borderRadius: 999 }} />
            </div>

            {/* Content */}
            <div style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "flex-start",
                gap: isMobile ? 48 : 0,
                paddingBottom: isMobile ? 200 : 220,
            }}>
                {/* Left: 3/4 */}
                <div style={{ flex: 3, paddingRight: isMobile ? 0 : 80 }}>
                    <h2 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: isMobile ? 32 : 48,
                        fontWeight: 800,
                        lineHeight: 1.15,
                        color: "#d4d6e2",
                        letterSpacing: "-0.02em",
                        marginBottom: isMobile ? 16 : 24,
                    }}>
                        {isMobile ? L.statsHeadingMobile : L.statsHeading}
                    </h2>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: isMobile ? 14 : 17,
                        lineHeight: 1.7,
                        color: "rgba(255,255,255,0.5)",
                        maxWidth: isMobile ? "100%" : 560,
                    }}>
                        {L.statsBody}
                    </p>
                </div>

                {/* Divider vertical */}
                {!isMobile && (
                    <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
                )}

                {/* Right: How it works card */}
                <div style={{
                    flex: 1,
                    paddingLeft: isMobile ? 0 : 64,
                    width: isMobile ? "100%" : undefined,
                    minWidth: isMobile ? undefined : 220,
                }}>
                    <div style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 16,
                        padding: "28px 24px",
                    }}>
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            color: "rgba(255,255,255,0.28)",
                            textTransform: "uppercase",
                            marginBottom: 24,
                        }}>{L.statsCardTitle}</p>

                        {[
                            {
                                icon: (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                ),
                                step: L.statsCardSteps[0].step,
                                desc: L.statsCardSteps[0].desc,
                            },
                            {
                                icon: (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                ),
                                step: L.statsCardSteps[1].step,
                                desc: L.statsCardSteps[1].desc,
                            },
                            {
                                icon: (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                ),
                                step: L.statsCardSteps[2].step,
                                desc: L.statsCardSteps[2].desc,
                            },
                        ].map((item, i, arr) => (
                            <div key={i}>
                                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                    {/* Step indicator */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            background: "rgba(98,126,234,0.15)",
                                            border: "1px solid rgba(98,126,234,0.3)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#627EEA",
                                            flexShrink: 0,
                                        }}>
                                            {item.icon}
                                        </div>
                                        {i < arr.length - 1 && (
                                            <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.07)", margin: "4px 0" }} />
                                        )}
                                    </div>
                                    {/* Text */}
                                    <div style={{ paddingBottom: i < arr.length - 1 ? 0 : 0 }}>
                                        <p style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "#d4d6e2",
                                            marginBottom: 4,
                                            lineHeight: 1,
                                            paddingTop: 7,
                                        }}>{item.step}</p>
                                        <p style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: 12,
                                            color: "rgba(255,255,255,0.38)",
                                            lineHeight: 1.5,
                                            marginBottom: i < arr.length - 1 ? 4 : 0,
                                        }}>{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─── LogosStrip ─────────────────────────────────────────────────────── */

const TOKENS = [
    { name: "Ethereum",  sym: "eth",  img: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/eth.png" },
    { name: "Tether",    sym: "usdt", img: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/usdt.png" },
    { name: "USDC",      sym: "usdc", img: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/usdc.png" },
    { name: "WBTC",      sym: "wbtc", img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png" },
    { name: "Chainlink", sym: "link", img: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/link.png" },
    { name: "Uniswap",   sym: "uni",  img: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/uni.png" },
    { name: "Aave",      sym: "aave", img: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/aave.png" },
    { name: "DAI",       sym: "dai",  img: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/dai.png" },
    { name: "Dogecoin",  sym: "doge", img: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/doge.png" },
    { name: "Polygon",   sym: "matic",img: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/matic.png" },
];

function LogosStrip() {
    const { t } = useLanguage();
    const L = t.landing;
    const doubled = [...TOKENS, ...TOKENS];
    return (
        <section style={{
            background: "#000",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: "52px 0",
            overflow: "hidden",
        }}>
            <p style={{
                textAlign: "center",
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.28)",
                textTransform: "uppercase",
                marginBottom: 36,
            }}>
                {L.logosLabel}
            </p>

            <div style={{ overflow: "hidden", width: "100%", position: "relative" }}>
                {/* Fade left */}
                <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
                    background: "linear-gradient(to right, #000 0%, transparent 100%)",
                    pointerEvents: "none",
                }} />
                {/* Fade right */}
                <div style={{
                    position: "absolute", right: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
                    background: "linear-gradient(to left, #000 0%, transparent 100%)",
                    pointerEvents: "none",
                }} />
                <div className="logos-track">
                    {doubled.map((token, i) => (
                        <div key={i} style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 10,
                            padding: "0 36px",
                            flexShrink: 0,
                        }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                            }}>
                                <img
                                    src={token.img}
                                    alt={token.name}
                                    width={58}
                                    height={58}
                                    style={{ objectFit: "contain" }}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            </div>
                            <span style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 12,
                                fontWeight: 500,
                                color: "rgba(255,255,255,0.38)",
                                letterSpacing: "0.02em",
                            }}>
                                {token.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── Hero ───────────────────────────────────────────────────────────── */

const FULL_PRIVKEY = "0xac09b3b2c7d8e5f14a236d908bf041c53e7d2a1b9f4c82e05d6713a8b0ef7e3";

function HeroSection({ onConnect, isConnecting }: { onConnect: () => void; isConnecting: boolean }) {
    const { t } = useLanguage();
    const L = t.landing;
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );
    const [privkeyCopied, setPrivkeyCopied] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    return (
        <section
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "flex-end",
                position: "relative",
                overflowX: "hidden",
                paddingTop: isMobile ? 100 : 64,
                paddingBottom: isMobile ? 48 : 0,
            }}
        >
            {/* Fluid shape: right side, no hard mask seam */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: "100%",
                    zIndex: 0,
                }}
            >
                <FluidShape className="w-full h-full" />
            </div>

            {/* Mobile blur layer: sits between animation and content */}
            {isMobile && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    background: "rgba(0,0,0,0.55)",
                }} />
            )}

            {/* Content */}
            <div
                style={{
                    maxWidth: "100%",
                    padding: isMobile ? "0 28px" : "0 48px",
                    width: "100%",
                    position: "relative",
                    zIndex: 2,
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 20 : 28, maxWidth: 860 }}>

                    <div style={{ display: "contents" }}>

                    {/* Headline */}
                    <h1 
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 800,
                            fontSize: "clamp(42px, 4.2vw, 62px)",
                            lineHeight: 1.05,
                            letterSpacing: "-0.03em",
                            color: "#ffffff",
                            margin: 0,
                        }}
                    >
                        {isMobile ? (
                            <span dangerouslySetInnerHTML={{ __html: L.heroHeadlineMobile.replace(/\n/g, "<br />") }} />
                        ) : (
                            <span dangerouslySetInnerHTML={{ __html: L.heroHeadline.replace(/\n/g, "<br />") }} />
                        )}
                    </h1>

                    {/* Body */}
                    <p
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 17,
                            lineHeight: 1.65,
                            color: "rgba(255,255,255,0.82)",
                            margin: 0,
                            maxWidth: 700,
                        }}
                    >
                        {L.heroBody}
                    </p>

                    {/* Product CTA Pills */}
                    <div style={{ position: "relative", display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, flexWrap: "wrap" as const, maxWidth: 680, overflow: "hidden", borderRadius: 18 }}>
                        <div className="pill-scan-top" />
                        <div className="pill-scan-bottom" />
                        {[
                            { href: "/create-personal-qrypt-safe", color: "#22C55E", name: "QryptSafe",   tag: L.heroProductPillTags[0] },
                            { href: "/qrypt-shield",               color: "#8B5CF6", name: "QryptShield", tag: L.heroProductPillTags[1] },
                            { href: "/qrypt-air",                  color: "#F59E0B", name: "QryptAir",    tag: L.heroProductPillTags[2] },
                        ].map((pill) => (
                            <a
                                key={pill.href}
                                href={pill.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 20,
                                    flex: isMobile ? "1 1 100%" : "1 1 0",
                                    maxWidth: isMobile ? "100%" : 220,
                                    border: `2px solid ${pill.color}90`,
                                    borderRadius: 14,
                                    padding: "13px 16px",
                                    fontFamily: "'Inter', sans-serif",
                                    textDecoration: "none",
                                    background: "#0d0d10",
                                    transition: "border-color 0.15s, background 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLAnchorElement;
                                    el.style.borderColor = `${pill.color}ee`;
                                    el.style.background = "#161620";
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLAnchorElement;
                                    el.style.borderColor = `${pill.color}90`;
                                    el.style.background = "#0d0d10";
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 15, color: "#d4d6e2", marginBottom: 2, letterSpacing: "-0.01em" }}>{pill.name}</div>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{pill.tag}</div>
                                </div>
                                <span style={{ fontSize: 14, color: pill.color, fontWeight: 400, flexShrink: 0 }}>→</span>
                            </a>
                        ))}
                    </div>

                    </div>{/* end display:contents */}

                </div>{/* end maxWidth:860 */}

                {/* Cards row: full-width, outside the 860px text constraint */}
                <div style={{ width: "100%", marginTop: isMobile ? 16 : 40 }}>
                    <HeroCardRow isMobile={isMobile} />
                </div>

            </div>
        </section>
    );
}
