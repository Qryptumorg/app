import { useEffect, useRef } from "react";
import { Link } from "wouter";
import SharedNavBar from "@/components/SharedNavBar";

const CYAN = "#06b6d4";
const PURPLE = "#7c3aed";
const GREEN = "#10b981";

function HeroSection() {
    return (
        <section style={{
            position: "relative",
            minHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            paddingTop: 60,
        }}>
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "url(/images/create-qryptank-hero.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.35,
            }} />
            <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 70%, #000 100%)",
            }} />
            <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px", maxWidth: 900 }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(6,182,212,0.1)",
                    border: "1px solid rgba(6,182,212,0.3)",
                    borderRadius: 20, padding: "4px 14px",
                    marginBottom: 28,
                }}>
                    <ShieldIcon color={CYAN} size={13} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: CYAN, textTransform: "uppercase" }}>Cryptographic Infrastructure</span>
                </div>
                <h1 style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "clamp(36px, 6vw, 72px)",
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1.05,
                    letterSpacing: "-0.03em",
                    marginBottom: 20,
                }}>
                    Create Your Personal<br />
                    <span style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        QRYPTANK
                    </span>
                </h1>
                <p style={{
                    fontSize: "clamp(15px, 2vw, 18px)",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.65,
                    maxWidth: 600,
                    margin: "0 auto 40px",
                }}>
                    One QRYPTANK per wallet. Deployed directly on Ethereum L1 in a single transaction. Your vault, your keys, zero third-party access.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <a href="/app" style={{
                        textDecoration: "none",
                        padding: "13px 32px",
                        background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
                        borderRadius: 10,
                        fontWeight: 700, fontSize: 14,
                        color: "#fff",
                    }}>Deploy Your QRYPTANK</a>
                    <a href="/docs/introduction/how-it-works" style={{
                        textDecoration: "none",
                        padding: "13px 32px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 10,
                        fontWeight: 700, fontSize: 14,
                        color: "#fff",
                    }}>Read the Docs</a>
                </div>
            </div>

            <div style={{
                position: "relative", zIndex: 1,
                display: "flex", gap: 40, marginTop: 64,
                flexWrap: "wrap", justifyContent: "center",
                padding: "0 24px",
            }}>
                {[
                    { label: "Deployment cost", value: "~$1.20", note: "One-time, at 0.5 gwei" },
                    { label: "Transaction", value: "1 tx", note: "Single on-chain call" },
                    { label: "Admin keys", value: "Zero", note: "Fully non-custodial" },
                    { label: "Supported tokens", value: "Any ERC-20", note: "ETH, USDT, USDC..." },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: CYAN, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.note}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function WhatSection() {
    return (
        <section style={{ background: "#050810", padding: "96px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                <SectionLabel color={CYAN} text="Understanding the Architecture" />
                <h2 style={headingStyle}>What Exactly Is a QRYPTANK?</h2>
                <p style={subStyle}>
                    A QRYPTANK is not a wallet. It is a smart contract deployed specifically for you on Ethereum L1, acting as an impenetrable on-chain vault for your ERC-20 tokens.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 52 }}>

                    {/* Wide card: text left, image right */}
                    <div style={{
                        gridColumn: "1 / 3",
                        position: "relative", minHeight: 240,
                        background: "linear-gradient(135deg, #0a0f1e 0%, #060c18 100%)",
                        border: `1px solid rgba(${hexToRgb(CYAN)},0.18)`,
                        borderRadius: 18, overflow: "hidden",
                        display: "flex", alignItems: "stretch",
                    }}>
                        <div style={{ flex: "0 0 52%", padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
                            <div style={{ width: 32, height: 2, background: CYAN, borderRadius: 1, marginBottom: 14 }} />
                            <div style={{ fontWeight: 900, fontSize: 20, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>A Dedicated Smart Contract</div>
                            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 20 }}>
                                Unlike wallets that share bytecode with everyone, your QRYPTANK is a PersonalVault contract deployed exclusively for your address. No one else shares your vault.
                            </div>
                            <a href="/docs/introduction/overview" style={{ textDecoration: "none", fontSize: 12, fontWeight: 700, color: CYAN, display: "flex", alignItems: "center", gap: 5 }}>
                                How vaults work <span style={{ fontSize: 14 }}>→</span>
                            </a>
                        </div>
                        <div style={{ flex: 1, position: "relative" }}>
                            <img src="/images/card-smart-contract.png" alt="Smart Contract" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0a0f1e 0%, transparent 50%)" }} />
                        </div>
                    </div>

                    {/* Square card: image top, text bottom */}
                    <div style={{
                        position: "relative",
                        background: "#080b14",
                        border: `1px solid rgba(${hexToRgb(PURPLE)},0.18)`,
                        borderRadius: 18, overflow: "hidden",
                        display: "flex", flexDirection: "column",
                    }}>
                        <div style={{ position: "relative", flex: 1, minHeight: 150 }}>
                            <img src="/images/card-dual-factor.png" alt="Dual Factor" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to bottom, transparent, #080b14)" }} />
                        </div>
                        <div style={{ padding: "0 22px 24px" }}>
                            <div style={{ width: 24, height: 2, background: PURPLE, borderRadius: 1, marginBottom: 10 }} />
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 8 }}>Dual-Factor Protected</div>
                            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>Both your private key and vault proof must be present. One factor alone is useless.</div>
                        </div>
                    </div>

                    {/* Square card: image top, text bottom */}
                    <div style={{
                        position: "relative",
                        background: "#060c10",
                        border: `1px solid rgba(${hexToRgb(GREEN)},0.18)`,
                        borderRadius: 18, overflow: "hidden",
                        display: "flex", flexDirection: "column",
                    }}>
                        <div style={{ position: "relative", flex: 1, minHeight: 150 }}>
                            <img src="/images/card-on-chain.png" alt="On Chain" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to bottom, transparent, #060c10)" }} />
                        </div>
                        <div style={{ padding: "0 22px 24px" }}>
                            <div style={{ width: 24, height: 2, background: GREEN, borderRadius: 1, marginBottom: 10 }} />
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 8 }}>Fully On-Chain</div>
                            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>No servers, no APIs, no databases. If Ethereum lives, your vault lives.</div>
                        </div>
                    </div>

                    {/* Wide card: image left, text right */}
                    <div style={{
                        gridColumn: "2 / 4",
                        position: "relative", minHeight: 240,
                        background: "linear-gradient(135deg, #100a04 0%, #0c0804 100%)",
                        border: `1px solid rgba(245,158,11,0.18)`,
                        borderRadius: 18, overflow: "hidden",
                        display: "flex", alignItems: "stretch",
                    }}>
                        <div style={{ flex: 1, position: "relative" }}>
                            <img src="/images/card-non-custodial.png" alt="Non-Custodial" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, #100a04 0%, transparent 50%)" }} />
                        </div>
                        <div style={{ flex: "0 0 52%", padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
                            <div style={{ width: 32, height: 2, background: "#f59e0b", borderRadius: 1, marginBottom: 14 }} />
                            <div style={{ fontWeight: 900, fontSize: 20, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>Non-Custodial by Design</div>
                            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 20 }}>
                                Qryptum has zero admin keys and zero upgrade authority. Once deployed, no one, including Qryptum, can access your funds.
                            </div>
                            <a href="/docs/introduction/overview" style={{ textDecoration: "none", fontSize: 12, fontWeight: 700, color: "#f59e0b", display: "flex", alignItems: "center", gap: 5 }}>
                                Verify on Etherscan <span style={{ fontSize: 14 }}>→</span>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function DeploySection() {
    const steps = [
        {
            n: "01",
            color: CYAN,
            title: "Connect Your Wallet",
            desc: "Connect any Ethereum wallet (MetaMask, Coinbase Wallet, WalletConnect). Your wallet address becomes the permanent owner of your QRYPTANK.",
            detail: "The onlyOwner modifier in PersonalVault.sol is bound to msg.sender at deployment. This is immutable.",
        },
        {
            n: "02",
            color: PURPLE,
            title: "Choose Your Vault Proof",
            desc: "Pick a 6-character vault proof (3 lowercase letters + 3 digits, e.g. qry428). This is your second authentication factor. Write it down securely.",
            detail: "Only the keccak256 hash of your vault proof is stored on-chain. The plaintext is never exposed or logged.",
        },
        {
            n: "03",
            color: GREEN,
            title: "ShieldFactory Deploys Your Vault",
            desc: "You call ShieldFactory.deployVault(passwordHash). The factory creates a minimal proxy clone of PersonalVault using EIP-1167 and initializes it with your wallet and password hash.",
            detail: "Gas used: ~150,000 gas (~$0.45 at 0.5 gwei). The vault address is deterministic and unique per wallet.",
        },
        {
            n: "04",
            color: "#f59e0b",
            title: "Your QRYPTANK Is Live",
            desc: "Your personal vault contract is now deployed on Ethereum L1. It is ready to receive any ERC-20 token. Shield your first token and receive qTokens instantly.",
            detail: "The vault address appears in the app dashboard. You can verify the contract on Etherscan anytime.",
        },
    ];

    return (
        <section style={{ background: "#000", padding: "96px 24px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <SectionLabel color={PURPLE} text="Step-by-Step Process" />
                <h2 style={headingStyle}>Deploying Your QRYPTANK</h2>
                <p style={subStyle}>Four steps from zero to a fully operational on-chain vault. The entire process takes under 30 seconds.</p>

                <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 0 }}>
                    {steps.map((s, i) => (
                        <div key={s.n} style={{ display: "flex", gap: 0, position: "relative" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 28, flexShrink: 0 }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: "50%",
                                    background: `linear-gradient(135deg, ${s.color}22, ${s.color}11)`,
                                    border: `2px solid ${s.color}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: "monospace", fontWeight: 900, fontSize: 13, color: s.color,
                                    flexShrink: 0,
                                }}>{s.n}</div>
                                {i < steps.length - 1 && (
                                    <div style={{ width: 1, flex: 1, background: `linear-gradient(to bottom, ${s.color}40, transparent)`, minHeight: 40, margin: "8px 0" }} />
                                )}
                            </div>
                            <div style={{ paddingBottom: 40 }}>
                                <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 8 }}>{s.title}</div>
                                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 12 }}>{s.desc}</div>
                                <div style={{
                                    background: `rgba(${hexToRgb(s.color)}, 0.06)`,
                                    border: `1px solid rgba(${hexToRgb(s.color)}, 0.2)`,
                                    borderRadius: 8, padding: "10px 14px",
                                    fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.6,
                                    fontFamily: "monospace",
                                }}>{s.detail}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TechSection() {
    return (
        <section style={{ background: "#060a12", padding: "96px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                <SectionLabel color={CYAN} text="Smart Contract Details" />
                <h2 style={headingStyle}>Technical Architecture</h2>
                <p style={subStyle}>Under the hood, your QRYPTANK is a PersonalVault contract deployed via EIP-1167 minimal proxy pattern from ShieldFactory.</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginTop: 52 }}>
                    <div style={codeCardStyle}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: CYAN, letterSpacing: "0.08em", marginBottom: 14 }}>SHIELDFACTORY.SOL</div>
                        <pre style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{`// EIP-1167 minimal proxy deploy
function deployVault(
    bytes32 passwordHash
) external returns (address vault) {
    vault = implementation.clone();
    IPersonalVault(vault).initialize(
        msg.sender,
        passwordHash
    );
    vaults[msg.sender] = vault;
    emit VaultDeployed(msg.sender, vault);
}`}</pre>
                    </div>

                    <div style={codeCardStyle}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.08em", marginBottom: 14 }}>PERSONALVAULT.SOL</div>
                        <pre style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{`// Dual-factor authentication
modifier onlyOwner() {
    require(msg.sender == owner, "Not vault owner");
    _;
}

function shield(
    address token,
    uint256 amount,
    string calldata password
) external onlyOwner nonReentrant {
    // Verify vault proof first
    require(
        keccak256(abi.encodePacked(password))
        == passwordHash,
        "Invalid vault proof"
    );
    // ... shield logic
}`}</pre>
                    </div>
                </div>

                <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    {[
                        { label: "Pattern", value: "EIP-1167 Minimal Proxy", color: CYAN },
                        { label: "Reentrancy Guard", value: "OpenZeppelin v5", color: PURPLE },
                        { label: "Vault Proof Hash", value: "keccak256 (SHA-3)", color: GREEN },
                        { label: "Minimum Shield", value: "1,000,000 token units", color: "#f59e0b" },
                        { label: "Commit Expiry", value: "600 seconds (10 min)", color: CYAN },
                        { label: "Test Coverage", value: "83/83 tests passing", color: GREEN },
                    ].map(m => (
                        <div key={m.label} style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 10, padding: "14px 16px",
                        }}>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{m.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ImageCard({ img, accentColor, label, title, body }: { img: string; accentColor: string; label: string; title: string; body: string }) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "58%", background: "#080b12" }}>
                <img src={img} alt={title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to bottom, transparent, rgba(8,11,18,0.97))" }} />
            </div>
            <div style={{ padding: "18px 20px 22px", flex: 1 }}>
                <div style={{ display: "inline-block", width: 28, height: 2, background: accentColor, borderRadius: 1, marginBottom: 10 }} />
                <div style={{ fontSize: 10, fontWeight: 800, color: accentColor, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 8, lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{body}</div>
            </div>
        </div>
    );
}

function SecuritySection() {
    return (
        <section style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(6,182,212,0.03) 100%)",
            borderTop: "1px solid rgba(124,58,237,0.12)",
            borderBottom: "1px solid rgba(6,182,212,0.08)",
            padding: "96px 24px",
        }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                <SectionLabel color={PURPLE} text="Security Model" />
                <h2 style={headingStyle}>What Protects Your QRYPTANK?</h2>
                <p style={subStyle}>
                    Your QRYPTANK uses a dual-factor model. Both factors must be present simultaneously for any token movement. One factor alone is useless.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 0, alignItems: "center", marginTop: 52, maxWidth: 860, margin: "52px auto 0" }}>
                    <ImageCard
                        img="/images/card-sec-private-key.png"
                        accentColor="#f59e0b"
                        label="Factor 1"
                        title="Ethereum Private Key"
                        body="Your wallet signs every transaction. The onlyOwner modifier verifies msg.sender matches the vault owner before any logic runs."
                    />
                    <div style={{ textAlign: "center", fontSize: 28, color: "rgba(255,255,255,0.15)", fontWeight: 200 }}>+</div>
                    <ImageCard
                        img="/images/card-sec-vault-proof.png"
                        accentColor={CYAN}
                        label="Factor 2"
                        title="Vault Proof (keccak256)"
                        body="Your 6-character secret is hashed with keccak256 and verified on-chain. Only the hash is stored. Wrong proof reverts instantly."
                    />
                </div>

                <div style={{ marginTop: 20, maxWidth: 860, margin: "20px auto 0" }}>
                    <div style={{
                        background: "rgba(16,185,129,0.07)",
                        border: "1px solid rgba(16,185,129,0.18)",
                        borderRadius: 14, padding: "20px 24px",
                        display: "flex", gap: 14, alignItems: "flex-start",
                    }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <span style={{ color: GREEN, fontSize: 11, fontWeight: 900 }}>+</span>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: GREEN, marginBottom: 6 }}>Combined Result: Dual-Factor Authorization</div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                                Even if an attacker steals your private key, they cannot move tokens without the vault proof. Even if they guess the vault proof (cost: ~$528,000 expected), they cannot call vault functions without the private key. Both must be compromised simultaneously.
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 48 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>Attack Vectors: All Blocked</div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>

                        {/* Wide: image right, text left */}
                        <div style={{
                            gridColumn: "1 / 3", minHeight: 200,
                            background: "linear-gradient(135deg, #10080a, #080508)",
                            border: "1px solid rgba(245,158,11,0.15)",
                            borderRadius: 16, overflow: "hidden",
                            display: "flex", alignItems: "stretch",
                        }}>
                            <div style={{ flex: "0 0 55%", padding: "28px 28px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                                    <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800, color: GREEN, letterSpacing: "0.08em" }}>BLOCKED</div>
                                </div>
                                <div style={{ width: 28, height: 2, background: "#f59e0b", borderRadius: 1, marginBottom: 12 }} />
                                <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 10 }}>Private Key Stolen Only</div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>Cannot move qTokens. transfer() always reverts without the vault proof present simultaneously.</div>
                            </div>
                            <div style={{ flex: 1, position: "relative" }}>
                                <img src="/images/card-sec-key-stolen.png" alt="Key Stolen" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #10080a 0%, transparent 60%)" }} />
                            </div>
                        </div>

                        {/* Square: image top, text bottom */}
                        <div style={{
                            background: "#080510",
                            border: "1px solid rgba(124,58,237,0.15)",
                            borderRadius: 16, overflow: "hidden",
                            display: "flex", flexDirection: "column",
                        }}>
                            <div style={{ position: "relative", flex: 1, minHeight: 110 }}>
                                <img src="/images/card-sec-brute-force.png" alt="Brute Force" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "65%", background: "linear-gradient(to bottom, transparent, #080510)" }} />
                                <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800, color: GREEN, letterSpacing: "0.08em" }}>BLOCKED</div>
                            </div>
                            <div style={{ padding: "0 18px 20px" }}>
                                <div style={{ width: 20, height: 2, background: PURPLE, borderRadius: 1, marginBottom: 8 }} />
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Vault Proof Brute-Forced</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>onlyOwner blocks without matching wallet. Cost to brute-force: ~$528,000.</div>
                            </div>
                        </div>

                        {/* Square: image top, text bottom */}
                        <div style={{
                            background: "#040c0e",
                            border: "1px solid rgba(6,182,212,0.15)",
                            borderRadius: 16, overflow: "hidden",
                            display: "flex", flexDirection: "column",
                        }}>
                            <div style={{ position: "relative", flex: 1, minHeight: 110 }}>
                                <img src="/images/card-sec-frontrun.png" alt="Front Run" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "65%", background: "linear-gradient(to bottom, transparent, #040c0e)" }} />
                                <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800, color: GREEN, letterSpacing: "0.08em" }}>BLOCKED</div>
                            </div>
                            <div style={{ padding: "0 18px 20px" }}>
                                <div style={{ width: 20, height: 2, background: CYAN, borderRadius: 1, marginBottom: 8 }} />
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Front-Running Mempool</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>Commit-reveal hides all details until block is mined. MEV bots see nothing.</div>
                            </div>
                        </div>

                        {/* Wide: image left, text right */}
                        <div style={{
                            gridColumn: "2 / 4", minHeight: 190,
                            background: "linear-gradient(135deg, #050e08, #040b06)",
                            border: "1px solid rgba(16,185,129,0.15)",
                            borderRadius: 16, overflow: "hidden",
                            display: "flex", alignItems: "stretch",
                        }}>
                            <div style={{ flex: 1, position: "relative" }}>
                                <img src="/images/card-sec-reentrancy.png" alt="Reentrancy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, #050e08 0%, transparent 60%)" }} />
                            </div>
                            <div style={{ flex: "0 0 55%", padding: "28px 28px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                                    <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800, color: GREEN, letterSpacing: "0.08em" }}>BLOCKED</div>
                                </div>
                                <div style={{ width: 28, height: 2, background: GREEN, borderRadius: 1, marginBottom: 12 }} />
                                <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 10 }}>Reentrancy Attack</div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>ReentrancyGuard from OpenZeppelin v5 is active on all state-changing calls in PersonalVault.</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}

function FaqSection() {
    const faqs = [
        {
            q: "Can I deploy more than one QRYPTANK?",
            a: "One QRYPTANK per wallet address. ShieldFactory enforces this at the contract level. If you need multiple vaults, use separate wallet addresses.",
        },
        {
            q: "What if I forget my vault proof?",
            a: "There is a 6-month inactivity recovery mechanism. If no vault activity occurs for 6 months, a recovery path becomes available. Always store your vault proof offline in multiple secure locations.",
        },
        {
            q: "Is the deployment gas cost fixed?",
            a: "The gas units (~150,000) are fixed. The ETH cost depends on the current network gas price. At 0.5 gwei with ETH at $3,000, deployment costs approximately $0.45.",
        },
        {
            q: "Can Qryptum upgrade or pause my vault?",
            a: "No. PersonalVault has no upgrade mechanism and no admin functions controlled by Qryptum. Once deployed, the contract is immutable. ShieldFactory's Pausable applies only to new deployments, not existing vaults.",
        },
        {
            q: "Can I see my QRYPTANK on Etherscan?",
            a: "Yes. Your vault is a deployed contract on Ethereum Sepolia (testnet). You can verify the source code, read all state variables, and see every transaction. Everything is fully transparent.",
        },
        {
            q: "Does my QRYPTANK appear in MetaMask?",
            a: "The vault itself does not appear in MetaMask. However, your qTokens (qETH, qUSDT, etc.) minted to your wallet address do appear as ERC-20 tokens. You can import them using the token contract address.",
        },
    ];

    return (
        <section style={{ background: "#000", padding: "96px 24px" }}>
            <div style={{ maxWidth: 780, margin: "0 auto" }}>
                <SectionLabel color={CYAN} text="Common Questions" />
                <h2 style={headingStyle}>Frequently Asked Questions</h2>

                <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 16 }}>
                    {faqs.map(f => (
                        <div key={f.q} style={{
                            background: "rgba(255,255,255,0.025)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 12,
                            padding: "20px 22px",
                        }}>
                            <div style={{ fontWeight: 700, fontSize: 14.5, color: "#fff", marginBottom: 8 }}>{f.q}</div>
                            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{f.a}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CtaSection() {
    return (
        <section style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(124,58,237,0.08))",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "96px 24px",
            textAlign: "center",
        }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
                <ShieldIcon color={CYAN} size={40} />
                <h2 style={{ ...headingStyle, marginTop: 20, marginBottom: 16 }}>Ready to Deploy Your QRYPTANK?</h2>
                <p style={{ ...subStyle, marginBottom: 36 }}>
                    Connect your wallet, set your vault proof, and your personal cryptographic vault is live on Ethereum L1 in under 30 seconds.
                </p>
                <a href="/app" style={{
                    display: "inline-block",
                    textDecoration: "none",
                    padding: "15px 40px",
                    background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
                    borderRadius: 12,
                    fontWeight: 800, fontSize: 15,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                }}>Deploy QRYPTANK Now</a>
                <div style={{ marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                    Ethereum Sepolia Testnet. No real funds required.
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer style={{
            background: "#000",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "32px 24px",
            textAlign: "center",
        }}>
            <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 0, marginBottom: 12 }}>
                <img src="/qryptum-logo.png" alt="Qryptum" style={{ height: 24, width: 24, objectFit: "contain" }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "-0.01em", marginLeft: -4 }}>QRYPTUM</span>
            </a>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Non-custodial. Open source. Ethereum L1.</div>
        </footer>
    );
}

export default function CreateQryptankPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Create Personal QRYPTANK - Qryptum";
    }, []);

    return (
        <div style={{ background: "#000", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#fff" }}>
            <SharedNavBar />
            <HeroSection />
            <WhatSection />
            <DeploySection />
            <TechSection />
            <SecuritySection />
            <FaqSection />
            <CtaSection />
            <Footer />
        </div>
    );
}

function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

function SectionLabel({ color, text }: { color: string; text: string }) {
    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            marginBottom: 16,
        }}>
            <div style={{ width: 18, height: 2, background: color, borderRadius: 1 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{text}</span>
        </div>
    );
}

const headingStyle: React.CSSProperties = {
    fontFamily: "'Inter',sans-serif",
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.1,
    letterSpacing: "-0.025em",
    marginBottom: 16,
};

const subStyle: React.CSSProperties = {
    fontSize: "clamp(14px, 1.5vw, 16px)",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.75,
    maxWidth: 640,
};

const codeCardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "24px",
};

function ShieldIcon({ color, size }: { color: string; size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M12 3L4 6v5c0 4.97 3.4 9.12 8 10 4.6-.88 8-5.03 8-10V6l-8-3z" fill={`${color}22`} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function LockIcon({ color, size }: { color: string; size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill={color} />
        </svg>
    );
}

function KeyIcon({ color, size }: { color: string; size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="8" r="4" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
            <path d="M12 12l8 8M16 16l2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function ChainIcon({ color, size }: { color: string; size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}
