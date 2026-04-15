import qLogo from "@/assets/qryptum-q.png";
import appIcon from "@/assets/icon-app.png";
import logoRailgun from "@/assets/logo-railgun.png";
import logoEthereum from "@/assets/logo-ethereum.png";
import logoMetaMask from "@/assets/logo-metamask.png";
import logoReown from "@/assets/logo-reown.png";
import logoEns from "@/assets/logo-ens.png";
import logoPinata from "@/assets/logo-pinata.png";
import logoEthlimo from "@/assets/logo-ethlimo.png";

export default function LandingPage() {
  const cards = [
    {
      id: "website",
      label: "Website",
      sub: "qryptum.org",
      href: "https://qryptum.org",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      id: "app",
      label: "App",
      sub: "qryptum.eth.limo/app",
      href: "https://qryptum.eth.limo/app",
      icon: (
        <img
          src={appIcon}
          alt="App"
          width={28}
          height={28}
          style={{
            objectFit: "contain",
            filter: "brightness(0) saturate(100%) invert(78%) sepia(58%) saturate(540%) hue-rotate(168deg) brightness(107%)",
          }}
        />
      ),
    },
    {
      id: "docs",
      label: "Docs",
      sub: "qryptumorg.github.io/docs",
      href: "https://qryptumorg.github.io/docs",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      id: "github",
      label: "GitHub",
      sub: "github.com/Qryptumorg",
      href: "https://github.com/Qryptumorg",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      ),
    },
    {
      id: "x",
      label: "Twitter",
      sub: "@qryptumorg",
      href: "https://x.com/qryptumorg",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      id: "telegram",
      label: "Telegram",
      sub: "t.me/qryptumorg",
      href: "https://t.me/qryptumorg",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.288 14.617l-2.95-.924c-.64-.203-.653-.64.135-.95l11.57-4.461c.535-.194 1.002.13.519.966z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @keyframes wave1 {
          0%,100% { transform: rotate(-22deg) translateY(0px)   scaleX(1);    }
          50%      { transform: rotate(-22deg) translateY(-38px) scaleX(1.03); }
        }
        @keyframes wave2 {
          0%,100% { transform: rotate(-22deg) translateY(0px)  scaleX(1);    }
          50%      { transform: rotate(-22deg) translateY(32px) scaleX(1.04); }
        }
        @keyframes wave3 {
          0%,100% { transform: rotate(-22deg) translateY(0px)   scaleX(1);    }
          50%      { transform: rotate(-22deg) translateY(-22px) scaleX(1.02); }
        }
        @keyframes wave4 {
          0%,100% { transform: rotate(-22deg) translateY(0px)  scaleX(1);   }
          50%      { transform: rotate(-22deg) translateY(18px) scaleX(1.03);}
        }
        @keyframes logo-glow {
          0%, 100% { filter: drop-shadow(0 0 16px #38bdf870) drop-shadow(0 0 36px #0ea5e950); }
          50%       { filter: drop-shadow(0 0 28px #38bdf8aa) drop-shadow(0 0 56px #0ea5e980); }
        }
        .qr-wave { position: absolute; border-radius: 40%; will-change: transform; }
        .qr-grid {
          display: grid;
          grid-template-columns: repeat(3, 200px);
          gap: 14px;
        }
        @media (max-width: 680px) {
          .qr-grid {
            grid-template-columns: repeat(2, 1fr);
            width: 100%;
            max-width: 420px;
          }
        }
        .qr-card {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 20px; text-align: center;
          background: rgba(5, 15, 35, 0.55);
          border: 1px solid rgba(56, 189, 248, 0.12);
          border-radius: 10px;
          text-decoration: none; color: inherit;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .qr-card:hover {
          border-color: rgba(56, 189, 248, 0.38);
          background: rgba(14, 165, 233, 0.09);
          box-shadow: 0 0 22px rgba(56, 189, 248, 0.1);
        }
      `}</style>

      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", background: "#020810" }}>

        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
          <div className="qr-wave" style={{
            top: "-40%", right: "-10%",
            width: "110vw", height: "200vh",
            background: "linear-gradient(160deg, #05131f 0%, #071e2e 50%, transparent 100%)",
            opacity: 0.95,
            animation: "wave4 14s ease-in-out infinite",
          }} />
          <div className="qr-wave" style={{
            top: "-35%", right: "-5%",
            width: "90vw", height: "190vh",
            background: "linear-gradient(160deg, #0a1f40 0%, #0d2147 40%, #06152e 100%)",
            opacity: 0.92,
            animation: "wave3 18s ease-in-out infinite",
          }} />
          <div className="qr-wave" style={{
            top: "-30%", right: "-2%",
            width: "72vw", height: "180vh",
            background: "linear-gradient(160deg, #0c3060 0%, #0a2550 40%, #061840 100%)",
            opacity: 0.88,
            animation: "wave2 22s ease-in-out infinite",
          }} />
          <div className="qr-wave" style={{
            top: "-28%", right: "2%",
            width: "52vw", height: "175vh",
            background: "linear-gradient(160deg, #0a4060 0%, #0c4a72 30%, #0a3558 70%, #06213d 100%)",
            opacity: 0.85,
            animation: "wave1 16s ease-in-out infinite",
          }} />
        </div>

        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to right, rgba(2,8,16,0.92) 0%, rgba(2,8,16,0.65) 45%, rgba(2,8,16,0.1) 100%)",
        }} />

        <div style={{
          position: "relative", zIndex: 2,
          minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          padding: "28px 24px",
        }}>
          <header style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <img
                src={qLogo}
                alt="Qryptum"
                style={{ width: "88px", height: "88px", objectFit: "contain", animation: "logo-glow 4s ease-in-out infinite" }}
              />
              <span style={{
                fontSize: "20px", fontWeight: 700,
                letterSpacing: "0.2em", color: "#e0f2fe", textTransform: "uppercase",
              }}>
                Qryptum
              </span>
            </div>
            <p style={{ fontSize: "17px", fontWeight: 500, color: "#94a3b8", letterSpacing: "0.02em", margin: 0 }}>
              The Security Layer<br />Beyond Your Private Key
            </p>
          </header>

          <p style={{
            maxWidth: "520px",
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#64748b",
            textAlign: "center",
            marginBottom: "16px",
          }}>
            Quantum-resistant vault commitments, zero-knowledge transfer privacy, and offline-capable transfers that require no internet connection, built into a single self-custody protocol on Ethereum.
          </p>

          <div className="qr-grid">
            {cards.map((card) => (
              <a key={card.id} href={card.href} target="_blank" rel="noopener noreferrer" className="qr-card">
                <span style={{ color: "#38bdf8" }}>{card.icon}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#e0f2fe", marginBottom: "3px" }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: "10px", color: "#334155", fontFamily: "monospace", letterSpacing: "0.03em" }}>
                    {card.sub}
                  </div>
                </div>
              </a>
            ))}
          </div>

          <footer style={{ marginTop: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
            <span style={{ fontSize: "9px", letterSpacing: "0.14em", color: "#1e3a5f", textTransform: "uppercase" }}>Built on the Ecosystem</span>
            <div className="qr-marquee-outer">
              {(() => {
                const brands = [
                  { name: "Ethereum", src: logoEthereum, size: 22, rounded: false },
                  { name: "Railgun",  src: logoRailgun,  size: 22, rounded: false },
                  { name: "MetaMask", src: logoMetaMask, size: 22, rounded: false },
                  { name: "Reown",    src: logoReown,    size: 22, rounded: false },
                  { name: "ENS",      src: logoEns,      size: 22, rounded: false },
                  { name: "Pinata",   src: logoPinata,   size: 22, rounded: false },
                  { name: "eth.limo", src: logoEthlimo,  size: 22, rounded: true  },
                ];
                const items = [...brands, ...brands];
                return (
                  <div className="qr-marquee-track">
                    {items.map((b, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                        <img src={b.src} alt={b.name} width={b.size} height={b.size} style={{ objectFit: "contain", opacity: 0.4, borderRadius: b.rounded ? "6px" : "0" }} />
                        <span style={{ fontSize: "8px", letterSpacing: "0.07em", color: "#1a3050", whiteSpace: "nowrap" }}>{b.name}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
