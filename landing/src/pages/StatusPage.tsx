import { useEffect, useState } from "react";

interface CheckItem {
    id: string;
    label: string;
    sublabel?: string;
    url?: string;
    type: "contract" | "api" | "rpc" | "ipfs" | "page" | "railgun";
    status: "checking" | "ok" | "degraded" | "down";
    detail?: string;
    latencyMs?: number;
}

const CHECKS_CONFIG: Omit<CheckItem, "status" | "detail" | "latencyMs">[] = [
    {
        id: "factory-mainnet",
        label: "QryptSafe Factory",
        sublabel: "Ethereum Mainnet (V6)",
        url: "https://eth.llamarpc.com",
        type: "contract",
    },
    {
        id: "factory-sepolia",
        label: "QryptSafe Factory",
        sublabel: "Sepolia Testnet (V6)",
        url: "https://ethereum-sepolia-rpc.publicnode.com",
        type: "contract",
    },
    {
        id: "rpc-mainnet",
        label: "Ethereum Mainnet RPC",
        sublabel: "Primary node endpoint",
        url: "https://eth.llamarpc.com",
        type: "rpc",
    },
    {
        id: "rpc-sepolia",
        label: "Sepolia Testnet RPC",
        sublabel: "Test network endpoint",
        url: "https://ethereum-sepolia-rpc.publicnode.com",
        type: "rpc",
    },
    {
        id: "api-railway",
        label: "Qryptum API",
        sublabel: "Railway cloud server",
        url: "https://qryptum-api.up.railway.app/api/health",
        type: "api",
    },
    {
        id: "railgun-signer",
        label: "Railgun Signer",
        sublabel: "Qryptum Railway instance",
        url: "https://qryptum-api.up.railway.app/api/health",
        type: "railgun",
    },
    {
        id: "app-github",
        label: "ShieldTransfer App",
        sublabel: "GitHub Pages host",
        url: "https://qryptumorg.github.io/app/app/",
        type: "page",
    },
    {
        id: "ipfs-ens",
        label: "ENS / IPFS Gateway",
        sublabel: "qryptum.eth.limo",
        url: "https://qryptum.eth.limo",
        type: "ipfs",
    },
];

const FACTORY_MAINNET = "0xE3583f8cA00Edf89A00d9D8c46AE456487a4C56f";
const FACTORY_SEPOLIA = "0xeaa722e996888b662E71aBf63d08729c6B6802F4";

type StatusColor = "#4ade80" | "#facc15" | "#f87171" | "#6b7280";
function statusColor(s: CheckItem["status"]): StatusColor {
    if (s === "ok") return "#4ade80";
    if (s === "degraded") return "#facc15";
    if (s === "down") return "#f87171";
    return "#6b7280";
}

function statusLabel(s: CheckItem["status"]): string {
    if (s === "ok") return "Operational";
    if (s === "degraded") return "Degraded";
    if (s === "down") return "Down";
    return "Checking...";
}

async function checkRpc(url: string, contractAddr: string): Promise<{ ok: boolean; latencyMs: number; detail?: string }> {
    const start = Date.now();
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", method: "eth_getCode",
                params: [contractAddr, "latest"], id: 1,
            }),
            signal: AbortSignal.timeout(8000),
        });
        const latencyMs = Date.now() - start;
        if (!res.ok) return { ok: false, latencyMs, detail: `HTTP ${res.status}` };
        const json = await res.json();
        const code = json.result as string | undefined;
        if (!code || code === "0x" || code === "0x0") {
            return { ok: false, latencyMs, detail: "Contract not found at address" };
        }
        return { ok: true, latencyMs, detail: `Contract deployed (${code.length / 2 - 1} bytes)` };
    } catch (e: any) {
        return { ok: false, latencyMs: Date.now() - start, detail: e.message ?? "Timeout" };
    }
}

async function checkRpcNode(url: string): Promise<{ ok: boolean; latencyMs: number; detail?: string }> {
    const start = Date.now();
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
            signal: AbortSignal.timeout(7000),
        });
        const latencyMs = Date.now() - start;
        if (!res.ok) return { ok: false, latencyMs, detail: `HTTP ${res.status}` };
        const json = await res.json();
        const blockHex = json.result as string | undefined;
        if (!blockHex) return { ok: false, latencyMs, detail: "No block number returned" };
        const block = parseInt(blockHex, 16);
        return { ok: true, latencyMs, detail: `Latest block: #${block.toLocaleString()}` };
    } catch (e: any) {
        return { ok: false, latencyMs: Date.now() - start, detail: e.message ?? "Timeout" };
    }
}

async function checkHttp(url: string): Promise<{ ok: boolean; latencyMs: number; detail?: string }> {
    const start = Date.now();
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        const latencyMs = Date.now() - start;
        return { ok: res.ok, latencyMs, detail: `HTTP ${res.status}` };
    } catch (e: any) {
        return { ok: false, latencyMs: Date.now() - start, detail: "Unreachable" };
    }
}

async function checkNoCorsFetch(url: string): Promise<{ ok: boolean; latencyMs: number; detail?: string }> {
    const start = Date.now();
    try {
        await fetch(url, { signal: AbortSignal.timeout(9000), mode: "no-cors" });
        const latencyMs = Date.now() - start;
        return { ok: true, latencyMs, detail: "Reachable" };
    } catch (e: any) {
        return { ok: false, latencyMs: Date.now() - start, detail: "Unreachable" };
    }
}

function CheckRow({ check }: { check: CheckItem }) {
    const col = statusColor(check.status);
    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "13px 16px", gap: 10,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: col,
                    boxShadow: check.status === "ok" ? `0 0 6px ${col}60` : undefined,
                    animation: check.status === "checking" ? "pulse 1.2s ease-in-out infinite" : undefined,
                }} />
                <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#d4d6e2" }}>{check.label}</p>
                    {check.sublabel && (
                        <p style={{ margin: "1px 0 0", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{check.sublabel}</p>
                    )}
                    {check.detail && check.status !== "checking" && (
                        <p style={{ margin: "2px 0 0", fontSize: 10, color: check.status === "down" ? "rgba(248,113,113,0.7)" : "rgba(255,255,255,0.22)", wordBreak: "break-all" }}>
                            {check.detail}
                        </p>
                    )}
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {check.latencyMs !== undefined && check.status !== "checking" && (
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{check.latencyMs}ms</span>
                )}
                <span style={{
                    fontSize: 10, fontWeight: 600, color: col,
                    padding: "2px 7px", borderRadius: 5,
                    background: `${col}14`,
                }}>
                    {statusLabel(check.status)}
                </span>
            </div>
        </div>
    );
}

function GroupCard({ label, ids, checks }: { label: string; ids: string[]; checks: CheckItem[] }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.3)", marginBottom: 4, textTransform: "uppercase",
            }}>{label}</p>
            <div style={{
                borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)",
                overflow: "hidden", background: "rgba(255,255,255,0.015)",
                flex: 1,
            }}>
                {ids.map((id, idx) => {
                    const check = checks.find(c => c.id === id)!;
                    const isLast = idx === ids.length - 1;
                    return (
                        <div key={id} style={{ borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                            <CheckRow check={check} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function StatusPage() {
    const [checks, setChecks] = useState<CheckItem[]>(
        CHECKS_CONFIG.map(c => ({ ...c, status: "checking" }))
    );
    const [lastChecked, setLastChecked] = useState<Date | null>(null);
    const [running, setRunning] = useState(false);
    const [isDesktop, setIsDesktop] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth >= 900 : true
    );

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= 900);
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    function updateCheck(id: string, patch: Partial<CheckItem>) {
        setChecks(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    }

    async function runAllChecks() {
        setRunning(true);
        setChecks(CHECKS_CONFIG.map(c => ({ ...c, status: "checking" })));

        const run = async (id: string, fn: () => Promise<{ ok: boolean; latencyMs: number; detail?: string }>) => {
            const result = await fn();
            updateCheck(id, {
                status: result.ok ? "ok" : "down",
                latencyMs: result.latencyMs,
                detail: result.detail,
            });
        };

        await Promise.all([
            run("factory-mainnet", () => checkRpc("https://eth.llamarpc.com", FACTORY_MAINNET)),
            run("factory-sepolia", () => checkRpc("https://ethereum-sepolia-rpc.publicnode.com", FACTORY_SEPOLIA)),
            run("rpc-mainnet", () => checkRpcNode("https://eth.llamarpc.com")),
            run("rpc-sepolia", () => checkRpcNode("https://ethereum-sepolia-rpc.publicnode.com")),
            run("api-railway", () => checkHttp("https://qryptum-api.up.railway.app/api/health")),
            run("railgun-signer", () => checkHttp("https://qryptum-api.up.railway.app/api/health")),
            run("app-github", () => checkNoCorsFetch("https://qryptumorg.github.io/app/app/")),
            run("ipfs-ens", () => checkNoCorsFetch("https://qryptum.eth.limo")),
        ]);

        setLastChecked(new Date());
        setRunning(false);
    }

    useEffect(() => { runAllChecks(); }, []);

    const allOk = checks.every(c => c.status === "ok");
    const anyDown = checks.some(c => c.status === "down");
    const overallStatus = checks.some(c => c.status === "checking")
        ? "checking"
        : allOk ? "ok" : anyDown ? "down" : "degraded";

    const groups: { label: string; ids: string[] }[] = [
        { label: "Smart Contracts", ids: ["factory-mainnet", "factory-sepolia"] },
        { label: "RPC Nodes", ids: ["rpc-mainnet", "rpc-sepolia"] },
        { label: "API & Railgun", ids: ["api-railway", "railgun-signer", "app-github", "ipfs-ens"] },
    ];

    const overallBg = overallStatus === "ok"
        ? "rgba(74,222,128,0.06)"
        : overallStatus === "down"
            ? "rgba(248,113,113,0.06)"
            : overallStatus === "checking"
                ? "rgba(255,255,255,0.03)"
                : "rgba(250,204,21,0.06)";

    const overallBorder = overallStatus === "ok"
        ? "rgba(74,222,128,0.2)"
        : overallStatus === "down"
            ? "rgba(248,113,113,0.2)"
            : overallStatus === "checking"
                ? "rgba(255,255,255,0.08)"
                : "rgba(250,204,21,0.2)";

    return (
        <div style={{
            minHeight: "100vh", background: "#000", color: "#d4d6e2",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            display: "flex", flexDirection: "column",
        }}>
            {/* Header */}
            <header style={{
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                padding: "0 28px", height: 58,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                position: "sticky", top: 0, background: "rgba(0,0,0,0.97)", zIndex: 20,
            }}>
                <a href="#/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "#d4d6e2", letterSpacing: "0.04em" }}>QRYPTUM</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500, marginLeft: 10 }}>/ STATUS</span>
                </a>
                <button
                    onClick={runAllChecks}
                    disabled={running}
                    style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: running ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)", color: running ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.75)",
                        cursor: running ? "not-allowed" : "pointer",
                    }}
                >
                    {running ? "Checking..." : "Refresh"}
                </button>
            </header>

            <main style={{
                maxWidth: 1300, margin: "0 auto",
                padding: isDesktop ? "40px 40px" : "28px 16px",
                width: "100%", boxSizing: "border-box",
            }}>

                {/* Overall status banner */}
                <div style={{
                    padding: "18px 22px", borderRadius: 14,
                    background: overallBg,
                    border: `1px solid ${overallBorder}`,
                    display: "flex", alignItems: "center", gap: 14, marginBottom: 32,
                }}>
                    <div style={{
                        width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                        background: statusColor(overallStatus as CheckItem["status"]),
                        boxShadow: `0 0 10px ${statusColor(overallStatus as CheckItem["status"])}80`,
                    }} />
                    <div>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e8e9f0" }}>
                            {overallStatus === "checking" ? "Running diagnostics..."
                                : allOk ? "All Systems Operational"
                                    : anyDown ? "Partial Outage Detected"
                                        : "Service Degraded"}
                        </p>
                        {lastChecked && (
                            <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                                Last checked: {lastChecked.toLocaleTimeString()} - checks run live in your browser via decentralized endpoints
                            </p>
                        )}
                    </div>
                </div>

                {/* 3-column grid on desktop, stacked on mobile */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr",
                    gap: isDesktop ? 20 : 20,
                    alignItems: "start",
                }}>
                    {groups.map(group => (
                        <GroupCard
                            key={group.label}
                            label={group.label}
                            ids={group.ids}
                            checks={checks}
                        />
                    ))}
                </div>

                {/* Contract addresses */}
                <div style={{ marginTop: 32, padding: "16px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Contract Addresses</p>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr",
                        gap: isDesktop ? "0 24px" : 0,
                    }}>
                        {[
                            { label: "Factory (Mainnet)", addr: "0xE3583f8cA00Edf89A00d9D8c46AE456487a4C56f", href: "https://etherscan.io/address/0xE3583f8cA00Edf89A00d9D8c46AE456487a4C56f" },
                            { label: "Impl (Mainnet)", addr: "0x9E73602079fCbB918D22A7a8b57C2d99F5D701b4", href: "https://etherscan.io/address/0x9E73602079fCbB918D22A7a8b57C2d99F5D701b4" },
                            { label: "Factory (Sepolia V6)", addr: "0xeaa722e996888b662E71aBf63d08729c6B6802F4", href: "https://sepolia.etherscan.io/address/0xeaa722e996888b662E71aBf63d08729c6B6802F4" },
                        ].map(item => (
                            <div key={item.addr} style={{ display: "flex", flexDirection: "column", padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.04)", gap: 3 }}>
                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{item.label}</span>
                                <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "monospace", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {item.addr}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ marginTop: 20, fontSize: 10, color: "rgba(255,255,255,0.18)", textAlign: "center", lineHeight: 1.6 }}>
                    All checks run directly from your browser. RPC checks verify contract deployment on-chain.
                </p>
            </main>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                * { box-sizing: border-box; margin: 0; padding: 0; }
            `}</style>
        </div>
    );
}
