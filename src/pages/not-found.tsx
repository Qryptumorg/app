import SharedNavBar from "@/components/SharedNavBar";

export default function NotFound() {
    return (
        <div style={{ minHeight: "100vh", background: "#000000", color: "#d4d6e2" }}>
            <SharedNavBar />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", padding: "40px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 96, fontWeight: 800, color: "rgba(255,255,255,0.06)", lineHeight: 1, letterSpacing: "-0.04em", userSelect: "none" }}>
                    404
                </div>
                <div style={{ marginTop: -16, marginBottom: 24 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: "#d4d6e2" }}>
                        Page not found
                    </div>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.4)", margin: "10px 0 0", lineHeight: 1.6, maxWidth: 340 }}>
                        The route you requested does not exist. It may have been moved or the URL is incorrect.
                    </p>
                </div>
                <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#d4d6e2", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 20px", textDecoration: "none", letterSpacing: "-0.01em" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.11)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)"; }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    Back to home
                </a>
                <div style={{ marginTop: 48, fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 11, color: "rgba(255,255,255,0.14)", letterSpacing: "0.06em" }}>
                    QRYPTUM / SEPOLIA
                </div>
            </div>
        </div>
    );
}
