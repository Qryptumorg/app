export default function PageLoader() {
    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
        }}>
            {/* outer glow ring */}
            <div style={{
                position: "relative",
                width: 140,
                height: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                {/* spinning arc */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(139,92,246,0.15) 75%, rgba(139,92,246,0.6) 88%, #a78bfa 95%, #fff 100%)",
                    animation: "pl-spin 1.1s linear infinite",
                    filter: "blur(0.5px)",
                }} />

                {/* inner mask to make it a ring */}
                <div style={{
                    position: "absolute",
                    inset: 10,
                    borderRadius: "50%",
                    background: "#000",
                }} />

                {/* glow trail */}
                <div style={{
                    position: "absolute",
                    inset: -8,
                    borderRadius: "50%",
                    background: "conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(139,92,246,0.05) 85%, rgba(139,92,246,0.2) 100%)",
                    animation: "pl-spin 1.1s linear infinite",
                    filter: "blur(6px)",
                }} />

                {/* logo center */}
                <img
                    src="/qryptum-logo.png"
                    alt=""
                    width={38}
                    height={38}
                    style={{ position: "relative", zIndex: 1, opacity: 0.9 }}
                />
            </div>

            <style>{`
                @keyframes pl-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
