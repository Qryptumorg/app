import { useState, useRef, useEffect } from "react";
import type { Language } from "@/lib/translations";
import { useLanguage } from "@/lib/LanguageContext";

/* ─── Nav menu keys and href lookup ─────────────────────────────────── */

const NAV_MENU_KEYS = ["features", "howItWorks", "security", "docs"] as const;
type NavMenuKey = typeof NAV_MENU_KEYS[number];

const NAV_HREFS: Record<NavMenuKey, string[][]> = {
    features: [
        ["/create-personal-qrypt-safe", "/shield-erc20-tokens", "/transfer-shield"],
        ["/qtoken-system", "/one-to-one-backing", "/burn-on-unshield"],
        ["/commit-phase", "/reveal-phase", "/mev-protection"],
        ["/making-transfers", "/qrypt-shield", "/qrypt-air"],
    ],
    howItWorks: [
        ["/connect-wallet", "/create-qrypt-safe", "/shield-tokens"],
        ["/enter-vault-proof", "/commit-transfer", "/reveal-and-execute"],
        ["/burn-qtokens", "/receive-original-tokens", "/emergency-recovery"],
    ],
    security: [
        ["/quantum-design", "/vault-proof-hashing", "/no-server-storage", "/onchain-verification"],
        ["/commit-reveal-scheme", "/nonce-protection", "/time-locked-reveals"],
        ["/180-day-inactivity", "/no-admin-keys", "/immutable-contracts"],
    ],
    docs: [
        ["/quick-start-guide", "/supported-tokens", "/network-support"],
        ["/shield-factory", "/personal-qrypt-safe", "/shield-token"],
        ["/rest-api-reference", "/abi-and-addresses", "/faq"],
    ],
};

const LANGS: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ru", label: "RU" },
    { code: "zh", label: "ZH" },
];

/* ─── SharedNavBar ───────────────────────────────────────────────────── */

interface SharedNavBarProps {
    onConnect?: () => void;
    isConnecting?: boolean;
}

export default function SharedNavBar({ onConnect, isConnecting = false }: SharedNavBarProps) {
    const { lang, setLang, t } = useLanguage();

    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<number>(0);
    const [langOpen, setLangOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );
    const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        if (!isMobile) setMobileOpen(false);
    }, [isMobile]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const openMenu = (i: number) => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => {
            setActiveMenu(i);
            setActiveCategory(0);
        }, 220);
    };

    const closeAll = () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => {
            setActiveMenu(null);
            setActiveCategory(0);
        }, 180);
    };

    const cancelClose = () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };

    const handleLaunch = () => {
        if (onConnect) onConnect();
    };

    return (
        <header
            style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}
            onMouseLeave={!isMobile ? closeAll : undefined}
        >
            {/* Main bar */}
            <div style={{
                background: "rgba(0,0,0,0.88)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}>
                <div style={{
                    padding: isMobile ? "0 20px" : "0 48px",
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                }}>
                    {/* Logo */}
                    <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 0, marginRight: 32 }}>
                        <img src="/qryptum-logo.png" alt="Qryptum" style={{ height: 38, width: 38, objectFit: "contain", display: "block" }} />
                        <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.12em", color: "#d4d6e2", marginLeft: -4 }}>
                            QRYPTUM
                        </span>
                    </a>

                    {isMobile ? (
                        <>
                            <div style={{ flex: 1 }} />
                            <button
                                onClick={() => setMobileOpen((v) => !v)}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5, alignItems: "center", justifyContent: "center" }}
                                aria-label="Open menu"
                            >
                                <span style={{ display: "block", width: 22, height: 2, background: "#fff", borderRadius: 2, transition: "all 0.25s", transform: mobileOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
                                <span style={{ display: "block", width: 22, height: 2, background: "#fff", borderRadius: 2, transition: "opacity 0.2s", opacity: mobileOpen ? 0 : 1 }} />
                                <span style={{ display: "block", width: 22, height: 2, background: "#fff", borderRadius: 2, transition: "all 0.25s", transform: mobileOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
                            </button>
                        </>
                    ) : (
                        <>
                            <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                                {NAV_MENU_KEYS.map((key, i) => (
                                    <button
                                        key={key}
                                        onMouseEnter={() => openMenu(i)}
                                        onClick={() => { cancelClose(); setActiveMenu(activeMenu === i ? null : i); setActiveCategory(0); }}
                                        style={{
                                            fontFamily: "'Inter',sans-serif", fontWeight: 500, fontSize: 14,
                                            color: activeMenu === i ? "#fff" : "rgba(255,255,255,0.68)",
                                            background: activeMenu === i ? "rgba(255,255,255,0.07)" : "transparent",
                                            border: "none", borderRadius: 8, padding: "7px 14px",
                                            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                                            transition: "color 0.15s, background 0.15s",
                                        }}
                                    >
                                        {t.navMenus[key].label}
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                            style={{ transform: activeMenu === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </button>
                                ))}
                            </nav>

                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ position: "relative" }}>
                                    <button
                                        onClick={() => setLangOpen((v) => !v)}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 6,
                                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
                                            borderRadius: 8, padding: "6px 12px", color: "rgba(255,255,255,0.72)",
                                            fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif",
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        </svg>
                                        {lang.toUpperCase()}
                                    </button>
                                    {langOpen && (
                                        <div style={{
                                            position: "absolute", top: "calc(100% + 8px)", right: 0,
                                            background: "#111", border: "1px solid rgba(255,255,255,0.12)",
                                            borderRadius: 10, overflow: "hidden", minWidth: 80,
                                            boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 300,
                                        }}>
                                            {LANGS.map((l) => (
                                                <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                                                    style={{
                                                        display: "block", width: "100%", padding: "9px 16px", textAlign: "left",
                                                        background: lang === l.code ? "rgba(98,126,234,0.15)" : "transparent",
                                                        color: lang === l.code ? "#627EEA" : "rgba(255,255,255,0.7)",
                                                        fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none",
                                                        fontFamily: "'Inter',sans-serif",
                                                    }}
                                                >{l.label}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {onConnect ? (
                                    <button onClick={handleLaunch} disabled={isConnecting}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 8,
                                            background: "#fff", color: "#000", border: "none", borderRadius: 10,
                                            padding: "8px 18px", fontFamily: "'Inter',sans-serif",
                                            fontWeight: 600, fontSize: 13,
                                            cursor: isConnecting ? "not-allowed" : "pointer",
                                            opacity: isConnecting ? 0.6 : 1, whiteSpace: "nowrap",
                                        }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#ddd"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
                                    >
                                        {isConnecting ? "Connecting..." : t.nav.launchApp}
                                        {!isConnecting && (
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </button>
                                ) : (
                                    <a href="/app" style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        background: "#fff", color: "#000", textDecoration: "none",
                                        borderRadius: 10, padding: "8px 18px",
                                        fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13,
                                        whiteSpace: "nowrap",
                                    }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#ddd"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#fff"; }}
                                    >
                                        {t.nav.launchApp}
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile fullscreen overlay */}
            {isMobile && mobileOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "#000000", zIndex: 999,
                    display: "flex", flexDirection: "column",
                    overflowY: "auto", overflowX: "hidden",
                }}>
                    <div style={{
                        display: "flex", alignItems: "center",
                        padding: "0 20px", height: 64, flexShrink: 0,
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                    }}>
                        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
                            <img src="/qryptum-logo.png" alt="Qryptum" style={{ height: 36, width: 36, objectFit: "contain" }} />
                            <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.12em", color: "#d4d6e2", marginLeft: -4 }}>QRYPTUM</span>
                        </a>
                        <button onClick={() => setMobileOpen(false)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "#d4d6e2" }}
                            aria-label="Close menu">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div style={{ flex: 1 }}>
                        {NAV_MENU_KEYS.map((key, i) => (
                            <div key={key}>
                                <button
                                    onClick={() => setMobileExpanded(mobileExpanded === i ? null : i)}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center",
                                        justifyContent: "space-between", padding: "18px 24px",
                                        background: "none", border: "none", cursor: "pointer",
                                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                                    }}
                                >
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 17, color: "#d4d6e2" }}>{t.navMenus[key].label}</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="rgba(255,255,255,0.45)" strokeWidth="2"
                                        style={{ transform: mobileExpanded === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>

                                {mobileExpanded === i && (
                                    <div style={{ background: "rgba(255,255,255,0.02)", paddingBottom: 8 }}>
                                        {t.navMenus[key].categories.map((cat, ci) => (
                                            <div key={ci} style={{ padding: "12px 24px 8px 32px" }}>
                                                <p style={{
                                                    margin: "0 0 8px", fontFamily: "'Inter',sans-serif",
                                                    fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                                                    color: "#627EEA", textTransform: "uppercase",
                                                }}>{cat.title}</p>
                                                {cat.items.map((item, ii) => (
                                                    <a key={ii} href={NAV_HREFS[key][ci][ii]}
                                                        style={{ display: "block", textDecoration: "none", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                                        <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.95)" }}>
                                                            {item.title}
                                                        </p>
                                                        <p style={{ margin: "2px 0 0", fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
                                                            {item.desc}
                                                        </p>
                                                    </a>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div style={{ padding: "20px 24px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", gap: 8 }}>
                                {LANGS.map((l) => (
                                    <button key={l.code}
                                        onClick={() => setLang(l.code)}
                                        style={{
                                            flex: 1, padding: "10px 0",
                                            background: lang === l.code ? "rgba(98,126,234,0.15)" : "rgba(255,255,255,0.05)",
                                            border: lang === l.code ? "1px solid rgba(98,126,234,0.4)" : "1px solid rgba(255,255,255,0.08)",
                                            borderRadius: 10, cursor: "pointer",
                                            fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600,
                                            color: lang === l.code ? "#627EEA" : "rgba(255,255,255,0.55)",
                                        }}
                                    >{l.label}</button>
                                ))}
                            </div>
                            {onConnect ? (
                                <button onClick={() => { handleLaunch(); setMobileOpen(false); }} disabled={isConnecting}
                                    style={{
                                        width: "100%", padding: "15px", textAlign: "center",
                                        background: "#fff", color: "#000", border: "none",
                                        borderRadius: 14, fontFamily: "'Inter',sans-serif",
                                        fontWeight: 700, fontSize: 15,
                                        cursor: isConnecting ? "not-allowed" : "pointer",
                                        opacity: isConnecting ? 0.6 : 1,
                                    }}
                                >{isConnecting ? "Connecting..." : t.nav.launchApp}</button>
                            ) : (
                                <a href="/app" style={{
                                    display: "block", width: "100%", padding: "15px", textAlign: "center",
                                    background: "#fff", color: "#000", textDecoration: "none",
                                    borderRadius: 14, fontFamily: "'Inter',sans-serif",
                                    fontWeight: 700, fontSize: 15, boxSizing: "border-box",
                                }}>{t.nav.launchApp}</a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mega menu panel: desktop */}
            {!isMobile && activeMenu !== null && (
                <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={closeAll}
                    style={{
                        background: "#0a0a0a",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
                    }}>
                    <div style={{ padding: "0 48px", display: "flex", minHeight: 320 }}>
                        <div style={{
                            width: 280, borderRight: "1px solid rgba(255,255,255,0.07)",
                            padding: "24px 0", flexShrink: 0,
                        }}>
                            {t.navMenus[NAV_MENU_KEYS[activeMenu]].categories.map((cat, ci) => (
                                <button
                                    key={ci}
                                    onMouseEnter={() => setActiveCategory(ci)}
                                    style={{
                                        display: "block", width: "100%", textAlign: "left",
                                        padding: "14px 24px 14px 20px",
                                        background: activeCategory === ci ? "rgba(98,126,234,0.10)" : "transparent",
                                        borderLeft: activeCategory === ci ? "3px solid #627EEA" : "3px solid transparent",
                                        border: "none", cursor: "pointer", transition: "background 0.15s",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div>
                                            <p style={{
                                                margin: 0, fontFamily: "'Inter',sans-serif",
                                                fontWeight: 600, fontSize: 14,
                                                color: activeCategory === ci ? "#fff" : "rgba(255,255,255,0.75)",
                                            }}>{cat.title}</p>
                                            <p style={{
                                                margin: "3px 0 0", fontFamily: "'Inter',sans-serif",
                                                fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.4,
                                            }}>{cat.desc}</p>
                                        </div>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            stroke={activeCategory === ci ? "#627EEA" : "rgba(255,255,255,0.3)"}
                                            strokeWidth="2" style={{ flexShrink: 0, marginLeft: 8 }}>
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div style={{ flex: 1, padding: "28px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 40px", alignContent: "start" }}>
                                {t.navMenus[NAV_MENU_KEYS[activeMenu]].categories[activeCategory].items.map((item, ii) => (
                                    <a
                                        key={ii}
                                        href={NAV_HREFS[NAV_MENU_KEYS[activeMenu]][activeCategory][ii]}
                                        style={{ textDecoration: "none", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "rgba(98,126,234,0.3)"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "rgba(255,255,255,0.05)"; }}
                                    >
                                        <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, color: "#d4d6e2" }}>{item.title}</p>
                                        <p style={{ margin: "4px 0 0", fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{item.desc}</p>
                                    </a>
                                ))}
                            </div>
                            {NAV_MENU_KEYS[activeMenu] === "docs" && (
                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                                    <a
                                        href="/docs"
                                        style={{
                                            display: "inline-flex", alignItems: "center", gap: 8,
                                            padding: "11px 18px",
                                            border: "1px solid rgba(98,126,234,0.35)",
                                            borderRadius: 10, textDecoration: "none",
                                            background: "rgba(98,126,234,0.07)",
                                            fontFamily: "'Inter',sans-serif", fontWeight: 600,
                                            fontSize: 13, color: "#627EEA",
                                            transition: "background 0.15s, border-color 0.15s",
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(98,126,234,0.15)";
                                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(98,126,234,0.6)";
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(98,126,234,0.07)";
                                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(98,126,234,0.35)";
                                        }}
                                    >
                                        Documentation
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M7 17L17 7M17 7H7M17 7v10" />
                                        </svg>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
