import { useState, useEffect, useRef } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useBlockNumber } from "wagmi";
import { parseUnits } from "viem";
import { SendIcon, EyeIcon, EyeOffIcon, UserIcon, Loader2Icon, AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PERSONAL_VAULT_ABI, PERSONAL_VAULT_V6_ABI, ERC20_ABI, SHIELD_FACTORY_ABI, SHIELD_FACTORY_V6_ABI } from "@/lib/abi";
import { SHIELD_FACTORY_ADDRESSES, SHIELD_FACTORY_V6_ADDRESSES } from "@/lib/wagmi";
import {
    validatePasswordFormat, buildCommitHash, hashPassword,
    buildCommitHashV6, peekNextProof, consumeProofAtPosition, getChainPosition,
} from "@/lib/password";
import type { VaultVersion } from "@/hooks/useVault";
import { recordTransaction } from "@/lib/api";
import { getTxEtherscanUrl } from "@/lib/utils";
import { useTxStatus } from "@/lib/txStatusContext";

interface TransferPanelProps {
    vaultAddress: `0x${string}`;
    walletAddress: string;
    chainId: number;
    vaultVersion?: VaultVersion;
    initialTokenAddress?: string;
}

type TransferStep = "input" | "deriving" | "committing" | "commit_confirmed" | "revealing" | "done";

function freshNonce() {
    return BigInt(Math.floor(Math.random() * 1e15));
}

export default function TransferPanel({ vaultAddress, walletAddress, chainId, vaultVersion = "v6", initialTokenAddress }: TransferPanelProps) {
    const [tokenAddress, setTokenAddress] = useState(initialTokenAddress ?? "");
    const [recipientAddress, setRecipientAddress] = useState("");
    const { pushTx } = useTxStatus();
    const publicClient = usePublicClient();
    const [amount, setAmount] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [transferStep, setTransferStep] = useState<TransferStep>("input");
    const [nonce, setNonce] = useState(freshNonce);
    // pendingProof stores the V6 OTP proof between commit and reveal
    const [pendingProof, setPendingProof] = useState<`0x${string}` | null>(null);
    const [pendingProofPos, setPendingProofPos] = useState<number | null>(null);
    const [simulateError, setSimulateError] = useState<string | null>(null);
    // Block-delay tracking: V6 requires reveal to happen at least 1 block after commit
    const [commitBlock, setCommitBlock] = useState<bigint | null>(null);
    const commitLockRef = useRef(false);
    const revealLockRef = useRef(false);

    const isV6 = vaultVersion === "v6";
    const isValidToken = tokenAddress.startsWith("0x") && tokenAddress.length === 42;
    const isValidRecipient = recipientAddress.startsWith("0x") && recipientAddress.length === 42;

    const v5FactoryAddress = SHIELD_FACTORY_ADDRESSES[chainId] as `0x${string}`;
    const v6FactoryAddress = SHIELD_FACTORY_V6_ADDRESSES[chainId] as `0x${string}`;
    const factoryAddress = isV6 ? v6FactoryAddress : v5FactoryAddress;
    const factoryAbi = isV6 ? SHIELD_FACTORY_V6_ABI : SHIELD_FACTORY_ABI;
    const vaultAbi = isV6 ? PERSONAL_VAULT_V6_ABI : PERSONAL_VAULT_ABI;

    const { data: tokenSymbol } = useReadContract({
        address: isValidToken ? tokenAddress as `0x${string}` : undefined,
        abi: ERC20_ABI,
        functionName: "symbol",
        query: { enabled: isValidToken },
    });

    const { data: tokenName } = useReadContract({
        address: isValidToken ? tokenAddress as `0x${string}` : undefined,
        abi: ERC20_ABI,
        functionName: "name",
        query: { enabled: isValidToken },
    });

    const { data: tokenDecimals } = useReadContract({
        address: isValidToken ? tokenAddress as `0x${string}` : undefined,
        abi: ERC20_ABI,
        functionName: "decimals",
        query: { enabled: isValidToken },
    });

    const { data: shieldedBalance } = useReadContract({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: (isV6 ? "getQryptedBalance" : "getShieldedBalance") as "getQryptedBalance",
        args: isValidToken ? [tokenAddress as `0x${string}`] : undefined,
        query: { enabled: isValidToken },
    });

    const { data: recipientHasVault } = useReadContract({
        address: factoryAddress,
        abi: factoryAbi,
        functionName: (isV6 ? "hasQryptSafe" : "hasVault") as "hasQryptSafe",
        args: isValidRecipient ? [recipientAddress as `0x${string}`] : undefined,
        query: { enabled: isValidRecipient && !!factoryAddress },
    });

    const decimals = tokenDecimals ?? 18;
    const parsedAmount = amount && !isNaN(parseFloat(amount)) ? parseUnits(amount, decimals) : 0n;
    const passwordValid = validatePasswordFormat(password);
    const exceedsBalance = shieldedBalance !== undefined && parsedAmount > shieldedBalance;
    const isSelfTransfer = isValidRecipient && recipientAddress.toLowerCase() === walletAddress.toLowerCase();
    const canTransfer = isValidToken && isValidRecipient && parsedAmount > 0n && passwordValid && !exceedsBalance && !isSelfTransfer;

    // V6 chain state
    const chainPos = isV6 ? getChainPosition(walletAddress) : 99;
    const chainExhausted = isV6 && chainPos === 0;
    const chainUnknown = isV6 && chainPos === null;

    const { writeContract: writeCommit, data: commitTxHash, isPending: isPendingCommit } = useWriteContract();
    const { isSuccess: commitSuccess, data: commitReceipt } = useWaitForTransactionReceipt({ hash: commitTxHash });

    const { writeContract: writeReveal, data: revealTxHash, isPending: isPendingReveal } = useWriteContract();
    const { isSuccess: revealSuccess } = useWaitForTransactionReceipt({ hash: revealTxHash });

    // Watch current block number while waiting for the 1-block delay after commit
    const { data: currentBlock } = useBlockNumber({
        watch: transferStep === "commit_confirmed",
    });

    // V6 contract requires at least 1 block after commit before reveal
    const waitingNextBlock = isV6 && commitBlock !== null && currentBlock !== undefined && currentBlock <= commitBlock;

    useEffect(() => {
        if (commitSuccess && transferStep === "committing") {
            if (commitReceipt?.blockNumber !== undefined) {
                setCommitBlock(commitReceipt.blockNumber);
            }
            setTransferStep("commit_confirmed");
        }
    }, [commitSuccess, transferStep, commitReceipt]);

    useEffect(() => {
        if (revealSuccess && pendingProofPos !== null) {
            consumeProofAtPosition(walletAddress, pendingProofPos);
        }
    }, [revealSuccess, pendingProofPos, walletAddress]);

    const isBusy = transferStep === "deriving" || transferStep === "committing" || transferStep === "revealing";

    const resetTransfer = () => {
        setTransferStep("input");
        setNonce(freshNonce());
        setPendingProof(null);
        setPendingProofPos(null);
        setSimulateError(null);
        setCommitBlock(null);
    };

    const handleCommit = async () => {
        if (!canTransfer || isBusy || commitLockRef.current) return;
        commitLockRef.current = true;

        if (isV6) {
            setTransferStep("deriving");
            try {
                const { proof, position } = await peekNextProof(password, walletAddress,
                    publicClient ? { vaultAddress, publicClient } : undefined
                );
                const commitHash = buildCommitHashV6(proof, nonce, tokenAddress, recipientAddress, parsedAmount);

                writeCommit({
                    address: vaultAddress,
                    abi: PERSONAL_VAULT_V6_ABI,
                    functionName: "veilTransfer",
                    args: [commitHash],
                }, {
                    onSuccess: (hash) => {
                        pushTx(hash, "Initiating transfer");
                        setPendingProof(proof);
                        setPendingProofPos(position);
                        commitLockRef.current = false;
                        setTransferStep("committing");
                    },
                    onError: (_err) => {
                        commitLockRef.current = false;
                        setTransferStep("input");
                    },
                });
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Unknown error";
                alert(message);
                commitLockRef.current = false;
                setTransferStep("input");
            }
        } else {
            const commitHash = buildCommitHash(hashPassword(password), nonce, tokenAddress, recipientAddress, parsedAmount);
            writeCommit({
                address: vaultAddress,
                abi: PERSONAL_VAULT_ABI,
                functionName: "commitTransfer",
                args: [commitHash],
            }, {
                onSuccess: (hash) => {
                    pushTx(hash, "Committing transfer");
                    commitLockRef.current = false;
                    setTransferStep("committing");
                },
                onError: (_err) => {
                    commitLockRef.current = false;
                    setTransferStep("input");
                },
            });
        }
    };

    const handleReveal = async () => {
        if (isBusy || revealLockRef.current) return;
        revealLockRef.current = true;
        setSimulateError(null);

        if (isV6) {
            if (!pendingProof) {
                revealLockRef.current = false;
                return;
            }
            // Simulate first to surface exact revert reason before opening MetaMask
            if (publicClient) {
                try {
                    await publicClient.simulateContract({
                        address: vaultAddress,
                        abi: PERSONAL_VAULT_V6_ABI,
                        functionName: "unveilTransfer",
                        args: [
                            tokenAddress as `0x${string}`,
                            recipientAddress as `0x${string}`,
                            parsedAmount,
                            pendingProof,
                            nonce,
                        ],
                        account: walletAddress as `0x${string}`,
                    });
                } catch (simErr: unknown) {
                    revealLockRef.current = false;
                    const raw = simErr instanceof Error ? simErr.message : String(simErr);
                    // Extract short reason — strip long hex data
                    const reason = raw.replace(/0x[0-9a-fA-F]{64,}/g, "").trim().slice(0, 300);
                    setSimulateError(reason || "Simulation failed: check vault proof and try again.");
                    return;
                }
            }
            writeReveal({
                address: vaultAddress,
                abi: PERSONAL_VAULT_V6_ABI,
                functionName: "unveilTransfer",
                args: [
                    tokenAddress as `0x${string}`,
                    recipientAddress as `0x${string}`,
                    parsedAmount,
                    pendingProof,
                    nonce,
                ],
            }, {
                onSuccess: async (hash) => {
                    revealLockRef.current = false;
                    pushTx(hash, `Finalizing transfer of ${amount} ${tokenSymbol || "tokens"}`);
                    setTransferStep("revealing");
                    try {
                        await recordTransaction({
                            walletAddress,
                            txHash: hash,
                            type: "transfer",
                            tokenAddress,
                            tokenSymbol: tokenSymbol || "???",
                            tokenName: tokenName || "Unknown Token",
                            amount,
                            fromAddress: walletAddress,
                            toAddress: recipientAddress,
                            networkId: chainId,
                        });
                    } catch {}
                },
                onError: (_err) => {
                    revealLockRef.current = false;
                    resetTransfer();
                },
            });
        } else {
            writeReveal({
                address: vaultAddress,
                abi: PERSONAL_VAULT_ABI,
                functionName: "revealTransfer",
                args: [
                    tokenAddress as `0x${string}`,
                    recipientAddress as `0x${string}`,
                    parsedAmount,
                    hashPassword(password),
                    nonce,
                ],
            }, {
                onSuccess: async (hash) => {
                    revealLockRef.current = false;
                    pushTx(hash, `Finalizing transfer of ${amount} ${tokenSymbol || "tokens"}`);
                    setTransferStep("revealing");
                    try {
                        await recordTransaction({
                            walletAddress,
                            txHash: hash,
                            type: "transfer",
                            tokenAddress,
                            tokenSymbol: tokenSymbol || "???",
                            tokenName: tokenName || "Unknown Token",
                            amount,
                            fromAddress: walletAddress,
                            toAddress: recipientAddress,
                            networkId: chainId,
                        });
                    } catch {}
                },
                onError: (_err) => {
                    revealLockRef.current = false;
                    resetTransfer();
                },
            });
        }
    };

    if (revealSuccess) {
        return (
            <div className="space-y-6">
                <SectionHeader icon={<SendIcon className="w-6 h-6 text-primary" />} title="Transfer" />
                <div className="glass rounded-2xl p-8 text-center">
                    <SendIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Transfer Complete</h3>
                    <p className="text-muted-foreground mb-2">
                        {amount} {tokenSymbol} sent to {recipientAddress.slice(0, 8)}...
                    </p>
                    <p className="text-muted-foreground text-sm mb-4">
                        Recipient received the original {tokenSymbol} directly to their wallet.
                    </p>
                    <Button onClick={() => { setAmount(""); setPassword(""); resetTransfer(); }} className="mb-4">
                        New Transfer
                    </Button>
                    {revealTxHash && (
                        <div>
                            <a href={getTxEtherscanUrl(revealTxHash, chainId)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:underline">
                                View on explorer ↗
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const inputsLocked = transferStep !== "input";

    return (
        <div className="space-y-6">
            <SectionHeader icon={<SendIcon className="w-6 h-6 text-primary" />} title="Transfer" />
            <p className="text-muted-foreground text-sm">
                Transfer shielded tokens securely using the init-finalize scheme.
                Your vault proof is never exposed on-chain.
            </p>

            {chainExhausted && (
                <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
                    <AlertTriangleIcon size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: "#fbbf24", margin: 0, lineHeight: 1.5 }}>
                        OTP chain exhausted. Recharge your vault proof chain before transferring.
                    </p>
                </div>
            )}

            {chainUnknown && (
                <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <AlertTriangleIcon size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: "#f87171", margin: 0, lineHeight: 1.5 }}>
                        OTP chain not initialized on this device. Please sync your chain state in Settings.
                    </p>
                </div>
            )}

            {transferStep === "commit_confirmed" && (
                <div className={`border rounded-xl p-4 text-sm ${waitingNextBlock ? "bg-amber-950/20 border-amber-500/30 text-amber-300" : "bg-primary/10 border-primary/30 text-primary"}`}>
                    {waitingNextBlock
                        ? "Init confirmed. Waiting for the next block before finalize is allowed..."
                        : "Init confirmed on-chain. Click Finalize Transfer to complete the send."}
                </div>
            )}

            <div className="glass rounded-2xl p-6 space-y-5">
                {!initialTokenAddress ? (
                    <div className="space-y-2">
                        <Label className="text-foreground font-medium">Token Contract Address</Label>
                        <Input
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            placeholder="0x..."
                            className="font-mono text-sm"
                            disabled={inputsLocked}
                        />
                        {tokenSymbol && <p className="text-green-400 text-xs">{tokenSymbol} detected</p>}
                    </div>
                ) : tokenName && tokenSymbol ? (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 13, color: "#4ade80", fontWeight: 600 }}>
                        {tokenName} ({tokenSymbol})
                    </div>
                ) : null}

                {shieldedBalance !== undefined && decimals !== undefined && (
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            Shielded balance: {(Number(shieldedBalance) / 10 ** decimals).toFixed(6)} q{tokenSymbol || ""}
                        </p>
                        <button
                            className="text-xs text-primary hover:underline"
                            onClick={() => setAmount((Number(shieldedBalance) / 10 ** decimals).toString())}
                            disabled={inputsLocked}
                        >
                            Max
                        </button>
                    </div>
                )}
                {exceedsBalance && (
                    <p className="text-xs text-red-400">Amount exceeds shielded balance.</p>
                )}

                <div className="space-y-2">
                    <Label className="text-foreground font-medium">Recipient Address</Label>
                    <Input
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="0x..."
                        className="font-mono text-sm"
                        disabled={inputsLocked}
                    />
                    {isValidRecipient && isSelfTransfer && (
                        <p className="text-xs" style={{ color: "#f87171", marginTop: 4 }}>
                            Cannot transfer to your own wallet address.
                        </p>
                    )}
                    {isValidRecipient && !isSelfTransfer && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                            <div className="flex items-center gap-2 text-xs" style={{ color: "#4ade80" }}>
                                <UserIcon className="w-3 h-3" style={{ flexShrink: 0 }} />
                                <span>
                                    Recipient gets <strong>{tokenSymbol || "the original token"}</strong> directly to their wallet. No Qrypt-Safe required.
                                </span>
                            </div>
                            {recipientHasVault !== undefined && (
                                <p className="text-xs text-muted-foreground" style={{ paddingLeft: 16 }}>
                                    {recipientHasVault ? "They also have a Qrypt-Safe." : "They do not have a Qrypt-Safe."}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-foreground font-medium">Amount</Label>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        disabled={inputsLocked}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-foreground font-medium">Vault Proof</Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your vault proof (e.g. abc123)"
                            maxLength={6}
                            autoComplete="new-password"
                            className="pr-10 font-mono tracking-widest text-center text-lg"
                            disabled={inputsLocked}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {transferStep === "input" && (
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCommit}
                        disabled={!canTransfer || isPendingCommit || chainExhausted || chainUnknown}
                        style={{ pointerEvents: (!canTransfer || isPendingCommit) ? "none" : undefined }}
                    >
                        {isPendingCommit ? (
                            <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Confirm in wallet...</>
                        ) : "Step 1: Init Transfer"}
                    </Button>
                )}

                {transferStep === "deriving" && (
                    <Button className="w-full" size="lg" disabled style={{ pointerEvents: "none", opacity: 0.7 }}>
                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                        Deriving proof...
                    </Button>
                )}

                {transferStep === "committing" && (
                    <>
                        <Button className="w-full" size="lg" disabled style={{ pointerEvents: "none", opacity: 0.7 }}>
                            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                            Waiting for init confirmation...
                        </Button>
                        {commitTxHash && (
                            <div style={{ textAlign: "center", marginTop: 8 }}>
                                <a href={getTxEtherscanUrl(commitTxHash, chainId)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#60a5fa" }}>
                                    View init on explorer ↗
                                </a>
                            </div>
                        )}
                    </>
                )}

                {transferStep === "commit_confirmed" && (
                    <>
                        {simulateError && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                    <AlertTriangleIcon size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <p style={{ fontSize: 12, color: "#f87171", margin: 0, lineHeight: 1.5, fontWeight: 600 }}>Finalize simulation failed</p>
                                </div>
                                <p style={{ fontSize: 11, color: "#fca5a5", margin: 0, lineHeight: 1.5, fontFamily: "monospace", wordBreak: "break-all" }}>{simulateError}</p>
                                <button
                                    style={{ alignSelf: "flex-start", fontSize: 11, color: "#60a5fa", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 2 }}
                                    onClick={resetTransfer}
                                >
                                    Reset and try again
                                </button>
                            </div>
                        )}
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleReveal}
                            disabled={isPendingReveal || waitingNextBlock}
                            style={{ pointerEvents: (isPendingReveal || waitingNextBlock) ? "none" : undefined, opacity: waitingNextBlock ? 0.6 : 1 }}
                        >
                            {isPendingReveal ? (
                                <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Confirm in wallet...</>
                            ) : waitingNextBlock ? (
                                <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Waiting for next block...</>
                            ) : "Step 2: Finalize Transfer"}
                        </Button>
                        {commitTxHash && (
                            <div style={{ textAlign: "center", marginTop: 8 }}>
                                <a href={getTxEtherscanUrl(commitTxHash, chainId)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#60a5fa" }}>
                                    View init on explorer ↗
                                </a>
                            </div>
                        )}
                    </>
                )}

                {transferStep === "revealing" && (
                    <>
                        <Button className="w-full" size="lg" disabled style={{ pointerEvents: "none", opacity: 0.7 }}>
                            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                            Broadcasting transfer...
                        </Button>
                        {revealTxHash && (
                            <div style={{ textAlign: "center", marginTop: 8 }}>
                                <a href={getTxEtherscanUrl(revealTxHash, chainId)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#60a5fa" }}>
                                    View finalize on explorer ↗
                                </a>
                            </div>
                        )}
                    </>
                )}

                <p className="text-xs text-muted-foreground text-center">
                    Two-step process: init step protects your vault proof from mempool exposure.
                </p>

            </div>
        </div>
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
    );
}
