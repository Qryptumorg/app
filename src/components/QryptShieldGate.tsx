import { useState, lazy, Suspense } from "react";
import QryptShieldApproval from "@/components/QryptShieldApproval";
import QryptShieldLoader from "@/components/QryptShieldLoader";

const QryptShieldPanel = lazy(() =>
    import("@/components/QryptShieldPanel")
);

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
        <Suspense fallback={<QryptShieldLoader chainId={props.chainId} />}>
            <QryptShieldPanel
                vaultAddress={props.vaultAddress}
                walletAddress={props.walletAddress}
                chainId={props.chainId}
                tokensWithBalances={props.tokensWithBalances}
                initialTokenAddress={props.initialTokenAddress}
                vaultVersion={props.vaultVersion ?? "v5"}
                onComplete={props.onComplete}
            />
        </Suspense>
    );
}
