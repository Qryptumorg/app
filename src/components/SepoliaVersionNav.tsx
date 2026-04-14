import { Link } from "wouter";

interface VersionNavProps {
    prev?: { label: string; href: string };
    next?: { label: string; href: string };
}

export default function SepoliaVersionNav({ prev, next }: VersionNavProps) {
    const base: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "'Inter',sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: "rgba(255,255,255,0.55)",
        textDecoration: "none",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 12,
        padding: "12px 20px",
        transition: "border-color 0.15s, color 0.15s",
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 32,
            marginTop: 8,
            marginBottom: 60,
        }}>
            {prev ? (
                <Link href={prev.href}
                    style={base}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.2)";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.09)";
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    {prev.label}
                </Link>
            ) : <div />}

            {next ? (
                <Link href={next.href}
                    style={{ ...base, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.18)", color: "rgba(255,255,255,0.65)" }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(34,197,94,0.35)";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.65)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(34,197,94,0.18)";
                    }}>
                    {next.label}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
            ) : <div />}
        </div>
    );
}
