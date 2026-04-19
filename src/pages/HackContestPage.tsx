import { useState, useEffect, useRef } from "react";

const API = "https://qryptum-api.up.railway.app/api";
const VAULT_CLASSIC = "0xDe6654d53FCC9e65f526D14e178F5D75be80308e";
const VAULT_EXPERIMENT_ENV = (import.meta.env.VITE_CONTEST_VAULT_ADDRESS as string | undefined) ?? "";
const SHARED_PK = "33d8e7df2259bb9ea60bfaf7e014e5d754b6528e90db67635b49e7d854f854f7";
const SHARED_PK_EXPERIMENT = "b0ecae0016decfdcd702d2c049b6c64cf73d0258f681ac042db836970364084f";
const VAULT_CLASSIC_OWNER = "0xD6875c44A2324098C664AB29B887613c8EAF64Dc";

// ─── Topo Blob Canvas ──────────────────────────────────────────────────────────
function TopoCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let t = 0;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    type Pt = { amp: number; freq: number; ph: number };
    function makePts(n: number, freqBase: number): Pt[] {
      return Array.from({ length: n }, (_, i) => ({ amp: 0, freq: freqBase + (i * 0.13) % 0.35, ph: (i / n) * Math.PI * 2 * 1.618 }));
    }
    function spline(pts: { x: number; y: number }[]) {
      const n = pts.length;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
        if (i === 0) ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6, p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6, p2.x, p2.y);
      }
      ctx.closePath();
    }
    function blobCoords(cx: number, cy: number, ptDefs: Pt[], baseR: number, scale: number) {
      const n = ptDefs.length;
      return ptDefs.map((p, i) => {
        const angle = (i / n) * Math.PI * 2;
        const r = (baseR + p.amp * Math.sin(t * p.freq + p.ph)) * scale;
        return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
      });
    }
    function topoBlob(cx: number, cy: number, ptDefs: Pt[], baseR: number, rings: number) {
      for (let i = rings; i >= 1; i--) {
        const scale = i / rings;
        spline(blobCoords(cx, cy, ptDefs, baseR, scale));
        const ratio = i / rings;
        let r: number, g: number, b: number, a: number;
        if (ratio > 0.65) { const f = (ratio - 0.65) / 0.35; r = Math.round(30 + f * 15); g = Math.round(20 + f * 10); b = Math.round(180 + f * 30); a = 0.35 + (1 - ratio) * 0.5; }
        else if (ratio > 0.30) { const f = (ratio - 0.30) / 0.35; r = Math.round(110 + f * (30 - 110)); g = 20; b = Math.round(200 + f * (180 - 200)); a = 0.55 + (1 - ratio) * 0.3; }
        else { const f = ratio / 0.30; r = Math.round(200 + f * (110 - 200)); g = 20; b = Math.round(150 + f * (200 - 150)); a = 0.70; }
        ctx.strokeStyle = `rgba(${r},${g},${b},${a})`; ctx.lineWidth = 0.9; ctx.stroke();
      }
    }
    const blob1 = makePts(14, 0.22); blob1.forEach((p, i) => { p.amp = 80 + (i * 31) % 60; });
    const blob2 = makePts(11, 0.28); blob2.forEach((p, i) => { p.amp = 45 + (i * 23) % 35; });
    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#05080f"; ctx.fillRect(0, 0, W, H);
      topoBlob(W * 0.30, H * 0.44, blob1, H * 0.55, 44);
      topoBlob(W * 0.75, H * 0.52, blob2, H * 0.42, 36);
      const ov = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, H * 0.9);
      ov.addColorStop(0, "rgba(5,8,15,0.50)"); ov.addColorStop(1, "rgba(5,8,15,0.82)");
      ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H);
      t += 0.005;
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 }} />;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function short(addr: string) { return addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "—"; }

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: `${color}18`, border: `1px solid ${color}44`, color, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
      {label}
    </span>
  );
}

function SecurityRing({ pct, color }: { pct: number; color: string }) {
  const r = 30, stroke = 4, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <svg width={74} height={74} viewBox="0 0 74 74" style={{ flexShrink: 0 }}>
      <circle cx={37} cy={37} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={37} cy={37} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 37 37)" style={{ transition: "stroke-dasharray 1.2s ease" }} />
      <text x={37} y={41} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={800} fontFamily="Inter,sans-serif">{pct}%</text>
    </svg>
  );
}

function InfoRow({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: 11, color: color ?? "rgba(255,255,255,0.58)", fontFamily: mono ? "monospace" : "inherit", fontWeight: 600, textAlign: "right" as const, maxWidth: "55%" }}>{value}</span>
    </div>
  );
}
function HDivider() { return <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "5px 0" }} />; }

// ─── Shared styles ────────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  flex: 1, minWidth: 0,
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20, padding: "22px 20px",
  display: "flex", flexDirection: "column", gap: 0,
  backdropFilter: "blur(14px)",
};
const descStyle: React.CSSProperties = { fontSize: 12, color: "rgba(255,255,255,0.32)", lineHeight: 1.75, margin: "0 0 14px" };
const infoBoxStyle: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "11px 13px", marginBottom: 14 };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.28)", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 12, fontFamily: "monospace", outline: "none", boxSizing: "border-box" as const, marginBottom: 10 };
const ghostBtnStyle: React.CSSProperties = { padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600, cursor: "pointer" };
const footNoteStyle: React.CSSProperties = { marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.13)", textAlign: "center" as const };


// ─── Classic Card ─────────────────────────────────────────────────────────────
function ClassicCard() {
  const [copied, setCopied] = useState(false);
  function copy() { navigator.clipboard.writeText(SHARED_PK); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 8 }}>
            <Tag label="QryptSafe Classic" color="#7c3aed" />
            <Tag label="Live" color="#4ade80" />
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.3px" }}>Classic Challenge</h2>
        </div>
        <SecurityRing pct={97} color="#7c3aed" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)", marginBottom: 16 }}>
        <div style={{ textAlign: "center" as const, flex: 1, borderRight: "1px solid rgba(255,255,255,0.07)", paddingRight: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#a78bfa" }}>60</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>USDC Locked</div>
        </div>
        <div style={{ flex: 2, paddingLeft: 4 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
            Grows from trading fees. Always funded.
          </div>
        </div>
      </div>

      <p style={descStyle}>
        Private key is public. Two independent auth factors protect every transfer: wallet ownership AND a one-time vault proof. You need your own ETH for gas.
      </p>

      <div style={infoBoxStyle}>
        <a href={`https://etherscan.io/address/${VAULT_CLASSIC}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "block" }}>
          <InfoRow label="Vault" value={short(VAULT_CLASSIC)} mono />
        </a>
        <HDivider />
        <InfoRow label="Auth factors" value="msg.sender + OTP proof" />
        <HDivider />
        <InfoRow label="Proof format" value="6-char (3 letters + 3 digits)" />
        <HDivider />
        <InfoRow label="Gas fees" value="Participant pays" color="rgba(255,255,255,0.35)" />
        <HDivider />
        <InfoRow label="Contract" value="QryptSafe v6 (production)" />
      </div>

      <div style={{ marginBottom: 14 }}>
        <span style={labelStyle}>Shared private key (import into any wallet)</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px" }}>
          <span style={{ flex: 1, fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.45)", wordBreak: "break-all" as const }}>
            {SHARED_PK.slice(0, 22)}...{SHARED_PK.slice(-8)}
          </span>
          <button onClick={copy} style={ghostBtnStyle}>{copied ? "Copied!" : "Copy full PK"}</button>
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 10, color: "rgba(255,255,255,0.15)", lineHeight: 1.6 }}>
          This PK is the Classic vault owner (msg.sender). You need it to sign any vault TX. Import it into MetaMask, Trust Wallet, or any EVM wallet.
        </p>
      </div>

      <a href="/app/" style={{ display: "block", width: "100%", padding: "13px", borderRadius: 12, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.30)", color: "#a78bfa", fontSize: 14, fontWeight: 700, textAlign: "center" as const, textDecoration: "none", boxSizing: "border-box" as const }}>
        Try in App
      </a>
      <p style={footNoteStyle}>Import the private key, connect in-app, enter vault address + your proof guess.</p>
    </div>
  );
}

// ─── Experiment Card ──────────────────────────────────────────────────────────
function ExperimentCard() {
  const [proof, setProof] = useState("");
  const [recipient, setRecipient] = useState("");
  const [stage, setStage] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState<number | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [vaultAddr, setVaultAddr] = useState(VAULT_EXPERIMENT_ENV);
  const [balance, setBalance] = useState<string | null>(null);
  const [copiedPK, setCopiedPK] = useState(false);

  useEffect(() => {
    fetch(`${API}/contest/status`).then(r => r.json()).then(d => {
      setClaimed(!d.active);
      if (d.vaultAddress) setVaultAddr(d.vaultAddress);
      if (d.balanceFormatted) setBalance(d.balanceFormatted);
    }).catch(() => {});
    fetch(`${API}/contest/attempts`).then(r => r.json()).then(d => {
      if (typeof d.totalFailedAttempts === "number") setTotalAttempts(d.totalFailedAttempts);
    }).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!proof.trim() || !recipient.trim()) return;
    setStage("loading"); setErrorMsg("");
    try {
      const res = await fetch(`${API}/contest/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaultProof: proof.trim(), recipient: recipient.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Claim failed");
      setTxHash(data.txHash); setClaimed(true); setStage("success");
    } catch (err: unknown) {
      setAttempts(a => a + 1);
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStage("error");
    }
  }

  const displayBalance = balance ? `${balance} USDC` : "40 USDC";

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 8 }}>
            <Tag label="QryptSafe Experiment" color="#06b6d4" />
            <Tag label={claimed ? "Claimed" : "Live"} color={claimed ? "#f87171" : "#4ade80"} />
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.3px" }}>Broadcaster Challenge</h2>
        </div>
        <SecurityRing pct={88} color="#06b6d4" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.18)", marginBottom: 16 }}>
        <div style={{ textAlign: "center" as const, flex: 1, borderRight: "1px solid rgba(255,255,255,0.07)", paddingRight: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#22d3ee" }}>{displayBalance.split(" ")[0]}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>USDC Locked</div>
        </div>
        <div style={{ flex: 2, paddingLeft: 4 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
            Grows from trading fees. Always funded.
          </div>
        </div>
      </div>

      <p style={descStyle}>
        No wallet needed, no ETH needed. Enter the vault proof and your recipient address. QryptumSigner broadcasts the TX for free via Flashbots. Wrong guesses cost $0 and are rejected by the contract.
      </p>

      <div style={infoBoxStyle}>
        {vaultAddr ? (
          <a href={`https://etherscan.io/address/${vaultAddr}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "block" }}>
            <InfoRow label="Vault" value={short(vaultAddr)} mono />
          </a>
        ) : (
          <InfoRow label="Vault" value="Deploying soon" mono />
        )}
        <HDivider />
        <InfoRow label="Auth factors" value="OTP proof only (no wallet check)" />
        <HDivider />
        <InfoRow label="Proof format" value="6-char (3 letters + 3 digits)" />
        <HDivider />
        <InfoRow label="Gas fees" value="QryptumSigner pays" color="#a78bfa" />
        <HDivider />
        <InfoRow label="Attempts this session" value={String(attempts)} />
        <HDivider />
        <InfoRow label="Total failed attempts" value={totalAttempts !== null ? String(totalAttempts) : "..."} color="#f87171" />
        <HDivider />
        <InfoRow label="Contract" value="QryptSafeExperiment (v7)" />
      </div>

      <div style={{ marginBottom: 14 }}>
        <span style={labelStyle}>Shared private key (owner — still needs vault proof)</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px" }}>
          <span style={{ flex: 1, fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.45)", wordBreak: "break-all" as const }}>
            {SHARED_PK_EXPERIMENT.slice(0, 22)}...{SHARED_PK_EXPERIMENT.slice(-8)}
          </span>
          <button onClick={() => { navigator.clipboard.writeText(SHARED_PK_EXPERIMENT); setCopiedPK(true); setTimeout(() => setCopiedPK(false), 2000); }} style={ghostBtnStyle}>{copiedPK ? "Copied!" : "Copy full PK"}</button>
        </div>
      </div>

      {stage === "success" ? (
        <div style={{ padding: "20px", borderRadius: 12, background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.2)", textAlign: "center" as const }}>
          <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 900, color: "#4ade80" }}>You cracked it.</p>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>USDC sent to your wallet. Gas paid by QryptumSigner.</p>
          <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#7c3aed", fontWeight: 700 }}>View TX ↗</a>
        </div>
      ) : (
        <form onSubmit={submit}>
          <span style={labelStyle}>Vault proof (your guess)</span>
          <input
            style={{ ...inputStyle, letterSpacing: "0.12em" }}
            type="text"
            placeholder="6 chars: 3 letters + 3 digits (e.g. abc123)"
            value={proof}
            onChange={e => setProof(e.target.value)}
            disabled={stage === "loading" || claimed}
            autoComplete="off"
            spellCheck={false}
            maxLength={6}
          />
          <span style={labelStyle}>Your wallet address (receives USDC)</span>
          <input
            style={inputStyle}
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            disabled={stage === "loading" || claimed}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={stage === "loading" || claimed || !proof.trim() || !recipient.trim()}
            style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: claimed ? "rgba(255,255,255,0.05)" : stage === "loading" ? "rgba(6,182,212,0.25)" : "rgba(6,182,212,0.9)", color: claimed ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 14, fontWeight: 700, cursor: claimed || stage === "loading" || !proof.trim() || !recipient.trim() ? "not-allowed" : "pointer", transition: "background 0.2s" }}
          >
            {claimed ? "Contest Over" : stage === "loading" ? "Broadcasting via QryptumSigner..." : "Submit Proof, Claim USDC"}
          </button>
        </form>
      )}

      {stage === "error" && (
        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)" }}>
          <p style={{ margin: 0, fontSize: 12, color: "#f87171", fontWeight: 600 }}>
            {errorMsg.toLowerCase().includes("wrong") || errorMsg.toLowerCase().includes("invalid") ? "Wrong vault proof. Try again." : errorMsg}
          </p>
        </div>
      )}
      <p style={footNoteStyle}>You need 0 ETH. Wrong guesses cost nothing and don't move the chain.</p>
    </div>
  );
}

// ─── Detail Section ───────────────────────────────────────────────────────────
const CODE_SNIPPET = `import { ethers } from "ethers";
import { pbkdf2 } from "crypto";
import { promisify } from "util";

const pbkdf2Async = promisify(pbkdf2);
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Classic vault — needs the shared private key (msg.sender check)
const signer = new ethers.Wallet(SHARED_PRIVATE_KEY, provider);

// Derive OTP proof via QryptumSigner API
const h0Res = await fetch("https://qryptum-api.up.railway.app/api/generate-h0", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ vaultProof: "your_6char_guess", vaultAddress: VAULT_ADDRESS }),
});
const { h0 } = await h0Res.json();

// H100 = keccak256 x100 of H0 (stored in contract as initial head)
// H99 = first valid proof: keccak256(H99) = H100
let h = h0;
for (let i = 0; i < 99; i++) h = ethers.keccak256(h);
const proof = h; // H99

// Call Qrypt with the OTP proof
const vaultAbi = ["function Qrypt(address token, uint256 amount, bytes32 proof) external"];
const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);
const tx = await vault.Qrypt(TOKEN_ADDRESS, 0n, proof);
console.log("TX:", tx.hash);`;

function DetailSection() {
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const tableRows = [
    { label: "Auth mechanism",               classic: "msg.sender + OTP proof",            exp: "OTP proof only" },
    { label: "Who pays gas",                  classic: "Participant (own ETH)",              exp: "QryptumSigner (free)" },
    { label: "External attacker can drain?",  classic: "No",                                exp: "No" },
    { label: "Can broadcaster redirect?",     classic: "N/A",                               exp: "No, proof commits recipient" },
    { label: "Front-run risk?",               classic: "None",                              exp: "None (Flashbots private pool)" },
    { label: "Without vault proof?",          classic: "Impossible",                        exp: "Impossible" },
    { label: "No ETH needed?",                classic: "No, participant pays gas",          exp: "Yes, QryptumSigner pays all" },
    { label: "Vault funded by",               classic: "Trading fees (always growing)",     exp: "Trading fees (always growing)" },
  ];

  type Method = { icon: string; title: string; color: string; steps: string[]; hasCode?: boolean; link?: { label: string; href: string } };
  const methods: Method[] = [
    {
      icon: "🦊",
      title: "Any Wallet (Classic)",
      color: "#f6851b",
      steps: [
        "Import the shared private key into MetaMask, Trust Wallet, or any EVM wallet.",
        "Visit qryptum.eth.limo or open the app.",
        "Connect your wallet, go to QryptSafe, enter vault address.",
        "Enter your 6-char vault proof guess (3 letters + 3 digits).",
        "If correct, the vault proof unlocks the OTP chain and funds transfer.",
      ],
    },
    {
      icon: "💻",
      title: "By Script (Classic)",
      color: "#7c3aed",
      steps: [
        "Get the vault ABI from the open-source contract repo on GitHub.",
        "Import the shared PK into ethers.js as a signer.",
        "Derive the OTP proof via /api/generate-h0 (server-side PBKDF2).",
        "Compute H99 = keccak256^99(H0) — your first valid proof.",
        "Call Qrypt(token, 0, proof) with the correct OTP proof.",
      ],
      hasCode: true,
    },
    {
      icon: "🌐",
      title: "Via Form (Experiment)",
      color: "#06b6d4",
      steps: [
        "No wallet or ETH needed. Just fill in the form above.",
        "Enter your 6-char guess and your recipient address.",
        "QryptumSigner broadcasts the TX for free via Flashbots.",
        "Wrong guesses are rejected by the contract and cost $0.",
        "Correct guess sends all USDC to your recipient address.",
      ],
    },
    {
      icon: "🔐",
      title: "Fully Open Source",
      color: "#4ade80",
      steps: [
        "All vault contracts are verified on Etherscan — zero hidden logic.",
        "OTP chain: PBKDF2(password + salt) = H0, keccak256^n(H0) = Hn.",
        "Frontend: github.com/Qryptumorg/app",
        "Contracts: github.com/Qryptumorg/contracts-mainnet",
        "Security through math and cryptography, not through obscurity.",
      ],
    },
  ];

  return (
    <div style={{ maxWidth: 1300, margin: "48px auto 0", padding: "0 20px 80px" }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.22)", textTransform: "uppercase" as const, letterSpacing: "0.12em", margin: "0 0 18px" }}>
        Ways to Attempt
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 40 }}>
        {methods.map((m, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px 16px", backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{m.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: m.color, lineHeight: 1.3 }}>{m.title}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {m.steps.map((s, j) => (
                <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: `${m.color}1a`, border: `1px solid ${m.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: m.color, marginTop: 1 }}>{j + 1}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, flex: 1 }}>{s}</span>
                </div>
              ))}
            </div>
            {m.link && (
              <a href={m.link.href} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 12, fontSize: 11, color: m.color, fontWeight: 700, textDecoration: "none" }}>
                {m.link.label}
              </a>
            )}
            {m.hasCode && (
              <div style={{ marginTop: 12 }}>
                <button onClick={() => setCodeOpen(v => !v)} style={{ ...ghostBtnStyle, fontSize: 11, padding: "5px 12px" }}>
                  {codeOpen ? "Hide code" : "Show ethers.js snippet"}
                </button>
                {codeOpen && (
                  <div style={{ position: "relative" as const, marginTop: 10 }}>
                    <pre style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px", fontSize: 10, color: "rgba(255,255,255,0.55)", overflowX: "auto" as const, margin: 0, lineHeight: 1.65, whiteSpace: "pre" as const }}>{CODE_SNIPPET}</pre>
                    <button onClick={() => { navigator.clipboard.writeText(CODE_SNIPPET); setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000); }} style={{ ...ghostBtnStyle, position: "absolute" as const, top: 8, right: 8, fontSize: 10 }}>
                      {codeCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase" as const, letterSpacing: "0.1em", margin: "0 0 14px" }}>
        Full Security Breakdown
      </h3>
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", background: "rgba(255,255,255,0.04)", padding: "10px 20px" }}>
          {["Property", "Classic (97%)", "Experiment (88%)"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.22)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{h}</span>
          ))}
        </div>
        {tableRows.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", padding: "11px 20px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.30)", fontWeight: 500 }}>{row.label}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{row.classic}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{row.exp}</span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.12)", textAlign: "center" as const, lineHeight: 1.8 }}>
        Both systems are 100% secure against any attacker who does not have the vault proof. The percentages reflect attack surface model, not exploitability. Vault balances grow continuously from QryptumSigner trading fees.
      </p>
    </div>
  );
}

// ─── Mobile Tab Bar ───────────────────────────────────────────────────────────
function MobileTabView() {
  const [tab, setTab] = useState<"classic" | "experiment">("classic");
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4, border: "1px solid rgba(255,255,255,0.07)" }}>
        {([["classic", "Classic 97%", "#7c3aed"], ["experiment", "Experiment 88%", "#06b6d4"]] as const).map(([id, label, color]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", background: tab === id ? `${color}22` : "transparent", color: tab === id ? color : "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: tab === id ? `inset 0 0 0 1px ${color}44` : "none" }}>
            {label}
          </button>
        ))}
      </div>
      {tab === "classic" ? <ClassicCard /> : <ExperimentCard />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HackContestPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      <TopoCanvas />

      <div style={{ position: "relative", zIndex: 1, padding: "56px 20px 0", maxWidth: 1300, margin: "0 auto" }}>

        <div style={{ textAlign: "center" as const, marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 14px", borderRadius: 99, background: "rgba(124,58,237,0.11)", border: "1px solid rgba(124,58,237,0.24)", marginBottom: 18 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Qryptum / Security Challenge</span>
          </div>
          <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: "-1px" }}>
            QryptSafe Hack Contest
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.30)", margin: 0, lineHeight: 1.75 }}>
            Two vaults. Two security models. 60 + 40 USDC locked inside.<br />
            Private keys are public. The vault proof is the only secret. Vaults grow from trading fees.
          </p>
        </div>

        {isMobile ? (
          <MobileTabView />
        ) : (
          <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
            <ClassicCard />
            <ExperimentCard />
          </div>
        )}

        <DetailSection />
      </div>
    </div>
  );
}
