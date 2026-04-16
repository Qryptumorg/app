import { useState, Component, type ReactNode } from "react";
import QryptShieldApproval from "@/components/QryptShieldApproval";
import QryptShieldLoader from "@/components/QryptShieldLoader";
import QryptShieldPanel from "@/components/QryptShieldPanel";

interface ShieldedToken {
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    shieldedBalance: bigint | undefined;
    decimals: number;
    color: string;
}

interface QryptShieldGateProps {
    vaultAddress: `0x${string}`;
    walletAddress: string;
    chainId: number;
    tokensWithBalances: ShieldedToken[];
    initialTokenAddress?: string;
    vaultVersion?: "v5" | "v6";
    onComplete?: () => void;
    onCancel?: () => void;
    onLockChange?: (locked: boolean) => void;
}

interface ErrorBoundaryState { error: Error | null }
class QryptShieldErrorBoundary extends Component<{ children: ReactNode; onCancel?: () => void }, ErrorBoundaryState> {
    constructor(props: { children: ReactNode; onCancel?: () => void }) {
        super(props);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error: Error) { return { error }; }
    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: "32px 16px", textAlign: "center" }}>
                    <p style={{ color: "#f87171", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                        Something went wrong loading QryptShield.
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 20, lineHeight: 1.5 }}>
                        {this.state.error.message}
                    </p>
                    <button
                        onClick={() => this.setState({ error: null })}
                        style={{ fontSize: 13, fontWeight: 600, color: "#8B5CF6", background: "none", border: "none", cursor: "pointer", marginRight: 20 }}
                    >
                        Try again
                    </button>
                    {this.props.onCancel && (
                        <button
                            onClick={this.props.onCancel}
                            style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

type Phase = "approval" | "zk-setup" | "transfer";

export default function QryptShieldGate(props: QryptShieldGateProps) {
    const [phase, setPhase] = useState<Phase>("approval");

    if (phase === "approval") {
        return (
            <QryptShieldApproval
                onApprove={() => setPhase("zk-setup")}
                onCancel={() => props.onCancel?.()}
            />
        );
    }

    if (phase === "zk-setup") {
        return (
            <QryptShieldLoader
                chainId={props.chainId}
                onReady={() => setPhase("transfer")}
                onCancel={() => props.onCancel?.()}
            />
        );
    }

    return (
        <QryptShieldErrorBoundary onCancel={props.onCancel}>
            <QryptShieldPanel
                vaultAddress={props.vaultAddress}
                walletAddress={props.walletAddress}
                chainId={props.chainId}
                tokensWithBalances={props.tokensWithBalances}
                initialTokenAddress={props.initialTokenAddress}
                vaultVersion={props.vaultVersion ?? "v5"}
                onComplete={props.onComplete}
                onLockChange={props.onLockChange}
            />
        </QryptShieldErrorBoundary>
    );
}
