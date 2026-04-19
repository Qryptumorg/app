import { useRef, useEffect } from "react";
import appIcon from "@/assets/icon-app.png";
import logoRailgun from "@/assets/logo-railgun.png";
import logoEthereum from "@/assets/logo-ethereum.png";
import logoMetaMask from "@/assets/logo-metamask.png";
import logoReown from "@/assets/logo-reown.png";
import logoEns from "@/assets/logo-ens.png";
import logoPinata from "@/assets/logo-pinata.png";
import logoEthlimo from "@/assets/logo-ethlimo.png";

const qLogo = import.meta.env.BASE_URL + "qryptum-logo.webp";

// ─── Topographic contour canvas ──────────────────────────────────────────────
function LiquidCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    let animId: number;
    let t = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Blob radial point definition
    type Pt = { amp: number; freq: number; ph: number };

    function makePts(n: number, amp: number, freqBase: number): Pt[] {
      return Array.from({ length: n }, (_, i) => ({
        amp,
        freq: freqBase + (i * 0.13) % 0.35,
        ph:   (i / n) * Math.PI * 2 * 1.618,
      }));
    }

    // Draw one catmull-rom closed spline through pts array
    function spline(pts: { x: number; y: number }[]) {
      const n = pts.length;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % n];
        const p3 = pts[(i + 2) % n];
        if (i === 0) ctx.moveTo(p1.x, p1.y);
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
      ctx.closePath();
    }

    // Compute blob point coords at given scale
    function blobCoords(
      cx: number, cy: number, ptDefs: Pt[], baseR: number, scale: number
    ): { x: number; y: number }[] {
      const n = ptDefs.length;
      return ptDefs.map((p, i) => {
        const angle = (i / n) * Math.PI * 2;
        const r = (baseR + p.amp * Math.sin(t * p.freq + p.ph)) * scale;
        return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
      });
    }

    // Draw topographic contour blob: many concentric stroked rings
    function topoBlob(
      cx: number, cy: number, ptDefs: Pt[], baseR: number, rings: number
    ) {
      for (let i = rings; i >= 1; i--) {
        const scale = i / rings;
        const pts = blobCoords(cx, cy, ptDefs, baseR, scale);
        spline(pts);

        // Color: outer = deep blue, mid = violet/purple, inner = bright pink-magenta
        const ratio = i / rings; // 1 = outermost, 0 = center
        let r: number, g: number, b: number, a: number;
        if (ratio > 0.65) {
          // outer zone: dark navy-blue to blue
          const f = (ratio - 0.65) / 0.35;
          r = Math.round(30  + f * 15);
          g = Math.round(20  + f * 10);
          b = Math.round(180 + f * 30);
          a = 0.35 + (1 - ratio) * 0.5;
        } else if (ratio > 0.30) {
          // mid zone: blue to violet-purple
          const f = (ratio - 0.30) / 0.35;
          r = Math.round(110 + f * (30 - 110));
          g = Math.round(20);
          b = Math.round(200 + f * (180 - 200));
          a = 0.55 + (1 - ratio) * 0.3;
        } else {
          // inner zone: violet to pink-magenta
          const f = ratio / 0.30;
          r = Math.round(200 + f * (110 - 200));
          g = Math.round(20  + f * 0);
          b = Math.round(150 + f * (200 - 150));
          a = 0.70;
        }
        ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
    }

    // Two blobs matching reference composition
    const blob1 = makePts(14, 0, 0.22); // large blob — base radius set at draw time
    const blob2 = makePts(11, 0, 0.28); // smaller blob

    // Give each point its own amplitude
    blob1.forEach((p, i) => { p.amp = (80 + (i * 31) % 60); });
    blob2.forEach((p, i) => { p.amp = (45 + (i * 23) % 35); });

    function draw() {
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#05080f";
      ctx.fillRect(0, 0, W, H);

      const mobile = W < 641;

      if (mobile) {
        // Mobile: big blobs fill most of screen
        topoBlob(W * 0.50, H * 0.36, blob1, H * 0.52, 42);
        topoBlob(W * 0.78, H * 0.78, blob2, H * 0.28, 28);
        // Subtle overlay — keep animation bright and visible
        const mo = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, H * 0.6);
        mo.addColorStop(0,   "rgba(5, 8, 15, 0.35)");
        mo.addColorStop(1,   "rgba(5, 8, 15, 0.62)");
        ctx.fillStyle = mo;
        ctx.fillRect(0, 0, W, H);
      } else {
        // Desktop: blobs oversized so they bleed beyond viewport edges
        topoBlob(W * 0.66, H * 0.44, blob1, H * 0.60, 44);
        topoBlob(W * 0.88, H * 0.80, blob2, H * 0.34, 28);
        // Dark gradient over left column so text stays readable
        const div = ctx.createLinearGradient(0, 0, W * 0.65, 0);
        div.addColorStop(0,    "rgba(5, 8, 15, 1.0)");
        div.addColorStop(0.68, "rgba(5, 8, 15, 0.88)");
        div.addColorStop(1,    "rgba(5, 8, 15, 0)");
        ctx.fillStyle = div;
        ctx.fillRect(0, 0, W * 0.65, H);
      }

      t += 0.005;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }} />;
}

// ─── Small lock SVG (closed) ─────────────────────────────────────────────────
function LockSmall({ s }: { s: number }) {
  return (
    <svg width={s} height={s * 1.2} viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 11V7.5C5 4.46 7.24 2 10 2C12.76 2 15 4.46 15 7.5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="2" y="11" width="16" height="12" rx="3" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="10" cy="17" r="2.2" fill="currentColor"/>
    </svg>
  );
}

// ─── Small lock SVG (open/unlocked) ──────────────────────────────────────────
function LockOpen({ s }: { s: number }) {
  return (
    <svg width={s} height={s * 1.2} viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 11V7.5C5 4.46 7.24 2 10 2C12.76 2 15 4.46 15 7.5V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="2" y="11" width="16" height="12" rx="3" fill="currentColor" opacity="0.20" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="10" cy="17" r="2.2" fill="currentColor"/>
    </svg>
  );
}

// ─── Small key SVG ────────────────────────────────────────────────────────────
function KeySmall({ s }: { s: number }) {
  return (
    <svg width={s * 1.6} height={s} viewBox="0 0 28 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5.5" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15"/>
      <line x1="10" y1="8" x2="27" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="23" y1="8" x2="23" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="27" y1="8" x2="27" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Scattered locks & keys across the right panel ───────────────────────────
const SCATTER = [
  { t: 'c', x:  8, y: 10, s: 15, a: 0.28, fa: 'float-a', fd: '5.8s', dl: '0.0s' },
  { t: 'k', x: 78, y:  8, s: 13, a: 0.22, fa: 'float-b', fd: '7.2s', dl: '0.8s' },
  { t: 'o', x: 62, y: 16, s: 17, a: 0.30, fa: 'float-c', fd: '4.9s', dl: '1.5s' },
  { t: 'c', x: 88, y: 26, s: 12, a: 0.18, fa: 'float-a', fd: '6.3s', dl: '2.1s' },
  { t: 'k', x: 18, y: 34, s: 15, a: 0.24, fa: 'float-b', fd: '5.5s', dl: '0.4s' },
  { t: 'o', x: 47, y: 28, s: 19, a: 0.33, fa: 'float-c', fd: '6.8s', dl: '1.8s' },
  { t: 'c', x: 72, y: 40, s: 13, a: 0.20, fa: 'float-a', fd: '7.5s', dl: '0.9s' },
  { t: 'k', x: 33, y: 52, s: 16, a: 0.28, fa: 'float-b', fd: '5.2s', dl: '2.5s' },
  { t: 'o', x: 83, y: 58, s: 14, a: 0.22, fa: 'float-c', fd: '6.1s', dl: '0.2s' },
  { t: 'c', x: 55, y: 62, s: 21, a: 0.36, fa: 'float-a', fd: '4.8s', dl: '1.2s' },
  { t: 'k', x: 10, y: 68, s: 12, a: 0.18, fa: 'float-b', fd: '7.0s', dl: '3.0s' },
  { t: 'o', x: 92, y: 70, s: 15, a: 0.26, fa: 'float-c', fd: '5.7s', dl: '0.7s' },
  { t: 'c', x: 38, y: 76, s: 13, a: 0.20, fa: 'float-a', fd: '6.6s', dl: '2.8s' },
  { t: 'k', x: 68, y: 80, s: 16, a: 0.24, fa: 'float-b', fd: '5.0s', dl: '1.6s' },
  { t: 'o', x: 22, y: 86, s: 14, a: 0.20, fa: 'float-c', fd: '7.4s', dl: '0.3s' },
  { t: 'c', x: 80, y: 88, s: 12, a: 0.16, fa: 'float-a', fd: '6.0s', dl: '2.2s' },
  { t: 'k', x: 50, y: 91, s: 15, a: 0.22, fa: 'float-b', fd: '5.4s', dl: '1.0s' },
  { t: 'c', x: 95, y: 44, s: 11, a: 0.16, fa: 'float-c', fd: '8.0s', dl: '3.5s' },
  { t: 'k', x: 42, y: 12, s: 14, a: 0.22, fa: 'float-a', fd: '6.4s', dl: '1.3s' },
  { t: 'o', x: 25, y: 48, s: 13, a: 0.24, fa: 'float-b', fd: '5.9s', dl: '2.0s' },
] as const;

function ScatteredIcons() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 1, pointerEvents: "none" }}>
      {SCATTER.map((item, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${item.x}%`, top: `${item.y}%`,
          color: "#5a9ee8",
          opacity: item.a,
          animation: `${item.fa} ${item.fd} ease-in-out infinite ${item.dl}`,
        }}>
          {item.t === 'c' && <LockSmall s={item.s} />}
          {item.t === 'o' && <LockOpen  s={item.s} />}
          {item.t === 'k' && <KeySmall  s={item.s} />}
        </div>
      ))}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const cards = [
    { id: "website", label: "Site",     sub: "qryptum.eth.limo/site", href: "https://qryptum.eth.limo/site",   newTab: false,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
    { id: "app",     label: "App",      sub: "qryptum.eth.limo/app",  href: "https://qryptum.eth.limo/app",    newTab: false,
      icon: <img src={appIcon} alt="App" width={20} height={20} style={{ objectFit:"contain", filter:"brightness(0) saturate(100%) invert(62%) sepia(20%) saturate(500%) hue-rotate(185deg) brightness(95%)" }}/> },
    { id: "docs",    label: "Docs",     sub: "qryptum.eth.limo/docs", href: "https://qryptum.eth.limo/docs",   newTab: false,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { id: "github",  label: "GitHub",   sub: "github.com/Qryptumorg", href: "https://github.com/Qryptumorg",  newTab: true,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> },
    { id: "x",       label: "Twitter",  sub: "@qryptumorg",           href: "https://x.com/qryptumorg",       newTab: true,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { id: "telegram",label: "Telegram", sub: "t.me/qryptumorg",       href: "https://t.me/qryptumorg",        newTab: true,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.288 14.617l-2.95-.924c-.64-.203-.653-.64.135-.95l11.57-4.461c.535-.194 1.002.13.519.966z"/></svg> },
  ];

  const brands = [
    { name: "Ethereum", src: logoEthereum, rounded: false },
    { name: "Railgun",  src: logoRailgun,  rounded: false },
    { name: "MetaMask", src: logoMetaMask, rounded: false },
    { name: "Reown",    src: logoReown,    rounded: false },
    { name: "ENS",      src: logoEns,      rounded: false },
    { name: "Pinata",   src: logoPinata,   rounded: false },
    { name: "eth.limo", src: logoEthlimo,  rounded: true  },
  ];

  return (
    <>
      <style>{`
        @keyframes logo-glow {
          0%,100% { filter: drop-shadow(0 0 10px rgba(80,130,200,0.4)); }
          50%      { filter: drop-shadow(0 0 22px rgba(80,130,200,0.75)); }
        }
        @keyframes float-a {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%     { transform: translateY(-14px) rotate(6deg); }
        }
        @keyframes float-b {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%     { transform: translateY(-10px) rotate(-5deg); }
        }
        @keyframes float-c {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-18px) rotate(4deg); }
        }
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes glitch-text {
          0%, 55%, 100% {
            text-shadow: none;
            transform: translate(0);
            opacity: 1;
          }
          56% {
            text-shadow: -3px 0 rgba(0,255,255,0.7), 3px 0 rgba(255,0,200,0.7);
            transform: translate(-2px, 0) skewX(-2deg);
          }
          58% {
            text-shadow: 3px 0 rgba(0,255,255,0.7), -3px 0 rgba(255,0,200,0.7);
            transform: translate(2px, 0);
          }
          60% {
            text-shadow: -2px 0 rgba(0,255,255,0.5), 2px 0 rgba(255,0,200,0.5);
            transform: translate(0) skewX(1deg);
            opacity: 0.85;
          }
          62% {
            text-shadow: none;
            transform: translate(0);
            opacity: 1;
          }
          75% {
            text-shadow: 2px 0 rgba(0,220,255,0.6), -2px 0 rgba(220,0,255,0.6);
            transform: translate(-1px, 1px);
          }
          77% { text-shadow: none; transform: translate(0); }
        }
        @keyframes glitch-scan {
          0%, 55%, 100% { opacity: 0; }
          56% { opacity: 0.08; transform: translateY(-20px); }
          59% { opacity: 0.05; transform: translateY(40px); }
          61% { opacity: 0; }
        }
        @property --hack-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes hack-spin {
          to { --hack-angle: 360deg; }
        }
        .lp-hack-border {
          position: absolute;
          top: 44px;
          left: 60%;
          right: 20px;
          z-index: 10;
          padding: 1.5px;
          background: conic-gradient(from var(--hack-angle), rgba(160,210,255,0.04), rgba(200,230,255,0.75) 8%, rgba(160,210,255,0.04) 16%);
          animation: hack-spin 3s linear infinite;
        }
        .lp-hack-card {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          background: rgba(4, 8, 18, 0.88);
          padding: 9px 14px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          overflow: hidden;
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .lp-hack-border {
            top: auto;
            bottom: 18px;
            left: 16px;
            right: 16px;
          }
        }
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; padding: 0; overflow: hidden; }

        .lp-root {
          position: relative;
          width: 100vw; height: 100vh;
          overflow: hidden;
          background: #060a12;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #c8d8ea;
        }
        .lp-layout {
          position: relative; z-index: 2;
          width: 100%; height: 100%;
          display: flex;
        }
        /* LEFT COLUMN */
        .lp-left {
          width: 60%;
          display: flex; flex-direction: column;
          justify-content: center;
          padding: 48px 52px 40px 80px;
        }
        .lp-brand {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 32px;
        }
        .lp-brand img { width: 50px; height: 50px; object-fit: contain; animation: logo-glow 4s ease-in-out infinite; }
        .lp-brand-text { display: flex; flex-direction: column; gap: 3px; }
        .lp-brand-name { font-size: 20px; font-weight: 700; letter-spacing: 0.22em; color: #c8d8ea; text-transform: uppercase; }
        .lp-headline { font-size: 11px; color: #3a5878; letter-spacing: 0.08em; text-transform: uppercase; }
        .lp-title { font-size: 54px; font-weight: 700; color: #d0e2f5; line-height: 1.12; margin-bottom: 16px; }
        .lp-desc { font-size: 14px; color: #3a5272; line-height: 1.78; max-width: 100%; margin-bottom: 28px; }
        .lp-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          max-width: 100%;
          margin-bottom: 22px;
        }
        .lp-card {
          display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
          padding: 14px 14px;
          background: rgba(8, 14, 28, 0.75);
          border: 1px solid rgba(42, 68, 110, 0.28);
          border-radius: 10px;
          text-decoration: none; color: inherit;
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          transition: border-color 0.2s, background 0.2s;
          cursor: pointer;
        }
        .lp-card:hover {
          border-color: rgba(70, 110, 175, 0.50);
          background: rgba(12, 22, 44, 0.85);
        }
        .lp-card-icon { color: #5a88c0; display: flex; align-items: center; }
        .lp-card-label { font-size: 12px; font-weight: 600; color: #a8c0d8; }
        .lp-card-sub { font-size: 9px; color: #253a54; font-family: monospace; }
        .lp-status {
          display: inline-flex; align-items: center; gap: 7px;
          text-decoration: none; margin-bottom: 16px;
        }
        .lp-eco-label { font-size: 9px; letter-spacing: 0.14em; color: #162438; text-transform: uppercase; margin-bottom: 6px; }
        .lp-marquee-outer {
          overflow: hidden; max-width: 380px;
          mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
        }
        .lp-marquee-track {
          display: flex; gap: 28px; align-items: center;
          width: max-content;
          animation: marquee-scroll 20s linear infinite;
        }

        /* RIGHT COLUMN */
        .lp-right {
          width: 40%;
          position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-lock-wrap {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          padding-top: 30px;
        }
        .lp-lock-label {
          font-size: 20px; font-weight: 700; letter-spacing: 0.15em;
          color: rgba(180, 210, 240, 0.9);
          text-transform: uppercase;
          font-family: 'Courier New', ui-monospace, monospace;
          background: rgba(60, 100, 170, 0.28);
          border: 1px solid rgba(80, 130, 200, 0.22);
          border-radius: 0;
          padding: 4px 10px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: glitch-text 2.5s steps(1) infinite;
          position: relative;
        }
        .lp-right-scan {
          position: absolute; inset: 0; z-index: 3; pointer-events: none;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,180,255,0.04) 50%);
          background-size: 100% 4px;
          animation: glitch-scan 2.5s steps(1) infinite;
        }

        /* MOBILE — 3 blok, space-between hanya 2 gap */
        @media (max-width: 640px) {
          html, body, #root { overflow: hidden; height: 100%; }
          .lp-root { height: 100svh; height: 100vh; }
          .lp-layout { flex-direction: column; }
          .lp-right { display: none; }
          .lp-left {
            width: 100%; height: 100%;
            padding: 44px 12.5% 34vh;
            justify-content: flex-start;
            gap: 0;
          }
          /* TOP BLOCK */
          .lp-m-top {
            display: flex; flex-direction: column; gap: 0;
            margin-bottom: 18px;
          }
          .lp-brand { margin-bottom: 22px; }
          .lp-brand img { width: 36px; height: 36px; }
          .lp-brand-text { gap: 2px; }
          .lp-brand-name { font-size: 15px; letter-spacing: 0.18em; }
          .lp-headline { font-size: 9px; }
          .lp-title {
            font-size: 24px; line-height: 1.22;
            margin-bottom: 8px;
          }
          .lp-desc {
            display: block;
            font-size: 12px; line-height: 1.6;
            color: #3a5272;
            margin-bottom: 0; max-width: 100%;
          }
          /* TOP BLOCK pushed to top, cards+status cluster at bottom */
          .lp-m-top { margin-bottom: auto; }
          /* CARDS BLOCK — 2 kolom × 3 baris */
          .lp-cards {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px; max-width: 100%; margin-bottom: 12px;
            margin-top: 20px;
          }
          .lp-card {
            padding: 16px 10px; gap: 6px;
            border-radius: 10px;
            align-items: center; flex-direction: column;
          }
          .lp-card-icon { color: #5a88c0; display: flex; align-items: center; justify-content: center; }
          .lp-card-icon svg { width: 22px !important; height: 22px !important; }
          .lp-card-label { font-size: 11px; font-weight: 600; text-align: center; line-height: 1.3; }
          .lp-card-sub { display: block; font-size: 8.5px; color: #253a54; font-family: monospace; text-align: center; }
          /* BOTTOM BLOCK — langsung setelah cards */
          .lp-m-bottom {
            display: flex; flex-direction: column; gap: 0;
            margin-top: 0;
          }
          .lp-status { margin-bottom: 8px; }
          .lp-eco-label { font-size: 8px; margin-bottom: 5px; display: block; }
          .lp-marquee-outer { max-width: 100%; display: block; }
        }
      `}</style>

      <div className="lp-root">
        <LiquidCanvas />

        <div className="lp-layout">
          {/* ── LEFT ── */}
          <div className="lp-left">
            {/* TOP BLOCK */}
            <div className="lp-m-top">
              <div className="lp-brand">
                <img src={qLogo} alt="Qryptum" />
                <div className="lp-brand-text">
                  <span className="lp-brand-name">Qryptum</span>
                  <span className="lp-headline">Blockchain Security Protocol</span>
                </div>
              </div>
              <div className="lp-title">The Security Layer<br />Beyond Your Private Key</div>
              <p className="lp-desc">
                Qryptum is a decentralized security protocol on Ethereum that protects ERC-20 assets through user-owned vaults and cryptographic proofs. It enables private, trustless transfers using zero-knowledge and offline signing, without relying on custodians or centralized infrastructure.
              </p>
            </div>

            {/* CARDS BLOCK */}
            <div className="lp-cards">
              {cards.map((card) => (
                <a key={card.id} href={card.href}
                  {...(card.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="lp-card">
                  <span className="lp-card-icon">{card.icon}</span>
                  <div>
                    <div className="lp-card-label">{card.label}</div>
                    <div className="lp-card-sub">{card.sub}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* BOTTOM BLOCK */}
            <div className="lp-m-bottom">
              <a href="#/status" className="lp-status">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <circle cx="4" cy="4" r="4" fill="#22c55e" opacity="0.15"/>
                  <circle cx="4" cy="4" r="2.2" fill="#3d8f5c"/>
                </svg>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#3d8f5c", letterSpacing: "0.06em" }}>
                  All Systems Operational
                </span>
              </a>
              <div className="lp-eco-label">Built on the Ecosystem</div>
              <div className="lp-marquee-outer">
                <div className="lp-marquee-track">
                  {[...brands, ...brands].map((b, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
                      <img src={b.src} alt={b.name} width={18} height={18}
                        style={{ objectFit: "contain", opacity: 0.30, borderRadius: b.rounded ? "5px" : "0" }}/>
                      <span style={{ fontSize: "7px", color: "#162438", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="lp-right">
            <div className="lp-right-scan" />
            <ScatteredIcons />
            <div className="lp-lock-wrap">
              <div className="lp-lock-label">One-Time Proof Security</div>
            </div>

          </div>
        </div>

        {/* ── Hack Contest Bar (desktop top-right, mobile bottom) ── */}
        <div className="lp-hack-border">
          <a href="https://qryptumorg.github.io/hack" target="_self" className="lp-hack-card">
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              flexShrink: 0,
            }}>
              <span style={{
                display: "inline-block", width: 5, height: 5,
                background: "#22C55E", borderRadius: "50%",
                boxShadow: "0 0 5px #22C55E", flexShrink: 0,
              }} />
              <span style={{
                fontSize: 8, fontWeight: 700, color: "rgba(180,210,255,0.55)",
                letterSpacing: "0.14em", textTransform: "uppercase",
                fontFamily: "'Courier New', monospace",
              }}>LIVE</span>
            </span>
            <span style={{
              color: "rgba(180,210,255,0.2)", fontSize: 10, flexShrink: 0,
            }}>|</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#fff",
              letterSpacing: "0.04em", flexShrink: 0,
            }}>Hack Contest</span>
            <span style={{
              fontSize: 11, color: "rgba(255,255,255,0.35)",
              overflow: "hidden", textOverflow: "ellipsis",
            }}>— drain vault, win 100 USDC</span>
            <span style={{ flex: 1 }} />
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 10, fontWeight: 700,
              color: "rgba(180,215,255,0.75)",
              letterSpacing: "0.08em", textTransform: "uppercase",
              fontFamily: "'Courier New', monospace",
              flexShrink: 0,
            }}>
              Enter <span style={{ fontSize: 13 }}>&#8594;</span>
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
