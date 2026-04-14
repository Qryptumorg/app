import { useState, useEffect, useRef, useCallback } from "react";
import { formatUnits, keccak256, toBytes } from "viem";
import {
    ScanLineIcon, FileJsonIcon, EyeIcon, EyeOffIcon,
    ClockIcon, ShieldCheckIcon, ExternalLinkIcon, CheckCircle2Icon,
    UploadIcon, CameraIcon, XIcon, ImageIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { PERSONAL_VAULT_ABI, PERSONAL_VAULT_V6_ABI, ERC20_ABI } from "@/lib/abi";
import { getTxEtherscanUrl } from "@/lib/utils";
import { recordTransaction } from "@/lib/api";
import jsQR from "jsqr";

interface VoucherData {
    token: string;
    amount: string;
    recipient: string;
    vaultAddress: string;
    deadline: string;
    nonce: string;
    transferCodeHash: string;
    transferCode?: string;
    signature: string;
}

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#d4d6e2", fontFamily: "'Inter', sans-serif", fontSize: 13,
    outline: "none", boxSizing: "border-box",
};

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.04em" }}>{label}</span>
            <span style={{ fontSize: mono ? 11 : 13, color: "#d4d6e2", fontFamily: mono ? "monospace" : "'Inter', sans-serif", fontWeight: 600 }}>{value}</span>
        </div>
    );
}

interface QryptAirRecipientPanelProps {
    walletAddress?: string;
    onComplete?: () => void;
}

export default function QryptAirRecipientPanel({ walletAddress, onComplete }: QryptAirRecipientPanelProps = {}) {
    const chainId = useChainId();

    const [tab, setTab]               = useState<"paste" | "scan">("paste");
    const [rawJson, setRawJson]       = useState("");
    const [voucher, setVoucher]       = useState<VoucherData | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState("");
    const [showCode, setShowCode]     = useState(false);
    const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);

    // Scan tab state
    const [scanError, setScanError]       = useState<string | null>(null);
    const [scanStatus, setScanStatus]     = useState<"idle" | "processing" | "camera">("idle");
    const [isDragging, setIsDragging]     = useState(false);
    const fileInputRef  = useRef<HTMLInputElement>(null);
    const videoRef      = useRef<HTMLVideoElement>(null);
    const canvasRef     = useRef<HTMLCanvasElement>(null);
    const streamRef     = useRef<MediaStream | null>(null);
    const rafRef        = useRef<number | null>(null);
    const lastScanRef   = useRef<number>(0);

    const stopCamera = useCallback(() => {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        setScanStatus("idle");
    }, []);

    useEffect(() => () => stopCamera(), [stopCamera]);

    // ── Parse logic ─────────────────────────────────────────────────────────────
    const parseVoucherFromString = useCallback((str: string) => {
        setParseError(null);
        try {
            const trimmed = str.trim();
            let parsed: Record<string, unknown>;
            if (trimmed.startsWith("{")) {
                parsed = JSON.parse(trimmed);
            } else {
                const b64 = trimmed.replace(/-/g, "+").replace(/_/g, "/");
                const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
                const binary = atob(padded);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                parsed = JSON.parse(new TextDecoder().decode(bytes));
            }
            const required = ["token", "amount", "recipient", "deadline", "nonce", "transferCodeHash", "vaultAddress", "signature"];
            for (const k of required) {
                if (!parsed[k]) throw new Error(`Missing field: ${k}`);
            }
            setVoucher(parsed as unknown as VoucherData);
        } catch (e: unknown) {
            setParseError(e instanceof Error ? e.message : "Invalid voucher code");
        }
    }, []);

    const parseVoucher = () => parseVoucherFromString(rawJson);

    // ── QR decode from ImageData ─────────────────────────────────────────────────
    const decodeImageData = useCallback((imageData: ImageData): string | null => {
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
        return code?.data ?? null;
    }, []);

    // ── File / image upload ──────────────────────────────────────────────────────
    const handleImageFile = useCallback(async (file: File) => {
        if (!file.type.startsWith("image/")) { setScanError("Please select an image file."); return; }
        setScanError(null);
        setScanStatus("processing");
        try {
            const img = await createImageBitmap(file);
            const canvas = document.createElement("canvas");
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = decodeImageData(imageData);
            if (data) {
                stopCamera();
                setRawJson(data);
                setTab("paste");
                parseVoucherFromString(data);
            } else {
                setScanError("No QR code found. Try a clearer image or higher contrast.");
            }
        } catch {
            setScanError("Could not read image. Try a different file.");
        } finally {
            setScanStatus("idle");
        }
    }, [decodeImageData, parseVoucherFromString, stopCamera]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageFile(file);
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageFile(file);
    };

    // ── Camera scan ──────────────────────────────────────────────────────────────
    const scanFrame = useCallback(() => {
        const video = videoRef.current; const canvas = canvasRef.current;
        if (!video || !canvas || !streamRef.current) return;
        if (video.readyState >= video.HAVE_ENOUGH_DATA) {
            const now = Date.now();
            if (now - lastScanRef.current > 120) {
                lastScanRef.current = now;
                canvas.width = video.videoWidth; canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(video, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = decodeImageData(imageData);
                if (data) {
                    stopCamera();
                    setRawJson(data);
                    setTab("paste");
                    parseVoucherFromString(data);
                    return;
                }
            }
        }
        rafRef.current = requestAnimationFrame(scanFrame);
    }, [decodeImageData, parseVoucherFromString, stopCamera]);

    const startCamera = useCallback(async () => {
        setScanError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 640 } }
            });
            streamRef.current = stream;
            setScanStatus("camera");
            // wait for video to mount
            requestAnimationFrame(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().then(() => { rafRef.current = requestAnimationFrame(scanFrame); });
                }
            });
        } catch {
            setScanError("Camera access denied. Use file upload instead.");
        }
    }, [scanFrame]);

    // ── Wagmi ────────────────────────────────────────────────────────────────────
    const senderVaultAddress = voucher?.vaultAddress as `0x${string}` | undefined;

    const { data: tokenDecimals } = useReadContract({
        address: voucher?.token as `0x${string}`,
        abi: ERC20_ABI, functionName: "decimals",
        query: { enabled: !!voucher?.token },
    });
    const { data: tokenSymbol } = useReadContract({
        address: voucher?.token as `0x${string}`,
        abi: ERC20_ABI, functionName: "symbol",
        query: { enabled: !!voucher?.token },
    });
    const { data: alreadyRedeemed } = useReadContract({
        address: senderVaultAddress as `0x${string}`,
        abi: PERSONAL_VAULT_ABI, functionName: "usedVoucherNonces",
        args: [voucher?.nonce as `0x${string}`],
        query: { enabled: !!senderVaultAddress && !!voucher?.nonce },
    });

    const { writeContract, data: txHash, isPending: isSending, error: writeError, reset: resetWrite } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isConfirmed && txHash) {
            setConfirmedTxHash(txHash);
            if (voucher && walletAddress) {
                const decimals = typeof tokenDecimals === "number" ? tokenDecimals : 6;
                recordTransaction({
                    walletAddress, txHash, type: "air-receive",
                    tokenAddress: voucher.token,
                    tokenSymbol: (tokenSymbol as string) ?? voucher.token.slice(0, 6),
                    tokenName:   (tokenSymbol as string) ?? voucher.token.slice(0, 6),
                    amount: formatUnits(BigInt(voucher.amount), decimals),
                    fromAddress: voucher.vaultAddress, toAddress: walletAddress, networkId: chainId,
                }).catch(() => {});
            }
            onComplete?.();
        }
    }, [isConfirmed, txHash]);

    const handleRedeem = () => {
        if (!voucher) return;
        const activeCode = voucher.transferCode ?? manualCode;
        if (!activeCode) return;
        if (!senderVaultAddress || senderVaultAddress === "0x0000000000000000000000000000000000000000") return;
        writeContract({
            address: senderVaultAddress as `0x${string}`,
            abi: PERSONAL_VAULT_V6_ABI, functionName: "claimAirVoucher",
            args: [
                voucher.token      as `0x${string}`,
                BigInt(voucher.amount),
                voucher.recipient  as `0x${string}`,
                BigInt(voucher.deadline),
                voucher.nonce      as `0x${string}`,
                keccak256(toBytes(activeCode)) as `0x${string}`,
                voucher.signature  as `0x${string}`,
            ],
        });
    };

    const expiry     = voucher ? new Date(parseInt(voucher.deadline) * 1000) : null;
    const isExpired  = expiry ? expiry < new Date() : false;
    const vaultMissing = !senderVaultAddress || senderVaultAddress === "0x0000000000000000000000000000000000000000";
    const hasCode    = !!(voucher?.transferCode ?? manualCode);
    const canRedeem  = !!voucher && !isExpired && hasCode && !alreadyRedeemed && !isSending && !isConfirming && !confirmedTxHash && !vaultMissing;
    const decimals   = 6;

    const tabBtn = (id: "paste" | "scan", icon: React.ReactNode, label: React.ReactNode) => (
        <button
            onClick={() => { setTab(id); setScanError(null); if (id !== "scan") stopCamera(); }}
            style={{
                flex: 1, padding: "9px", borderRadius: 10, border: "1px solid",
                borderColor: tab === id ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.08)",
                background: tab === id ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                color: tab === id ? "#F59E0B" : "rgba(255,255,255,0.45)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                fontFamily: "'Inter', sans-serif",
            }}
        >
            {icon} {label}
        </button>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* ── Tabs ── */}
            <div style={{ display: "flex", gap: 6 }}>
                {tabBtn("paste", <FileJsonIcon size={13} />, "Paste offToken Code")}
                {tabBtn("scan",  <ScanLineIcon size={13} />, "Scan QR")}
            </div>

            {/* ── Paste tab ── */}
            {tab === "paste" && !voucher && (
                <>
                    <textarea
                        value={rawJson}
                        onChange={e => setRawJson(e.target.value)}
                        placeholder={"Paste offToken code here...\n\nAccepts the compact byte code from QryptAir\nor raw JSON for older offTokens."}
                        style={{ ...inputStyle, minHeight: 140, resize: "vertical", lineHeight: 1.5, fontFamily: "monospace", fontSize: 12 }}
                    />
                    {parseError && <p style={{ fontSize: 12, color: "#f87171", margin: 0 }}>{parseError}</p>}
                    <button
                        onClick={parseVoucher}
                        disabled={!rawJson.trim()}
                        style={{
                            width: "100%", padding: "11px", borderRadius: 12, border: "1px solid rgba(245,158,11,0.4)",
                            background: "rgba(245,158,11,0.1)", color: "#F59E0B",
                            fontSize: 13, fontWeight: 700, cursor: rawJson.trim() ? "pointer" : "not-allowed",
                            fontFamily: "'Inter', sans-serif", opacity: rawJson.trim() ? 1 : 0.5,
                        }}
                    >
                        Parse offToken
                    </button>
                </>
            )}

            {/* ── Scan tab ── */}
            {tab === "scan" && !voucher && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                    {/* Hidden file input — accept image, no capture attr so both camera+gallery show on mobile */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileInput}
                    />

                    {/* Upload zone */}
                    <div
                        onClick={() => scanStatus !== "processing" && fileInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        style={{
                            border: `2px dashed ${isDragging ? "rgba(245,158,11,0.6)" : "rgba(255,255,255,0.12)"}`,
                            borderRadius: 14,
                            background: isDragging ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.02)",
                            padding: "28px 20px",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                            cursor: scanStatus === "processing" ? "wait" : "pointer",
                            transition: "all 0.15s",
                            userSelect: "none",
                        }}
                    >
                        {scanStatus === "processing" ? (
                            <>
                                <div style={{
                                    width: 36, height: 36, borderRadius: "50%",
                                    border: "3px solid rgba(245,158,11,0.2)",
                                    borderTop: "3px solid #F59E0B",
                                    animation: "spin 0.8s linear infinite",
                                }} />
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Decoding QR…</span>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <UploadIcon size={20} color="#F59E0B" />
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                                        Upload QR image
                                    </p>
                                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                                        PNG · JPG · WebP — or drag &amp; drop
                                    </p>
                                </div>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "5px 12px", borderRadius: 20,
                                    background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)",
                                }}>
                                    <ImageIcon size={11} color="#F59E0B" />
                                    <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600 }}>
                                        Choose file or take photo
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Camera divider + button */}
                    {scanStatus !== "camera" && (
                        <>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>OR</span>
                                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                            </div>
                            <button
                                onClick={startCamera}
                                style={{
                                    width: "100%", padding: "10px", borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    background: "rgba(255,255,255,0.03)",
                                    color: "rgba(255,255,255,0.55)",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                <CameraIcon size={14} /> Use Camera
                            </button>
                        </>
                    )}

                    {/* Camera view */}
                    {scanStatus === "camera" && (
                        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#000" }}>
                            <video
                                ref={videoRef}
                                playsInline
                                muted
                                style={{ width: "100%", display: "block", maxHeight: 280, objectFit: "cover" }}
                            />
                            {/* Scan overlay */}
                            <div style={{
                                position: "absolute", inset: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                pointerEvents: "none",
                            }}>
                                <div style={{
                                    width: 160, height: 160, borderRadius: 12,
                                    border: "2px solid rgba(245,158,11,0.8)",
                                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                                }} />
                            </div>
                            <button
                                onClick={stopCamera}
                                style={{
                                    position: "absolute", top: 8, right: 8,
                                    background: "rgba(0,0,0,0.6)", border: "none",
                                    borderRadius: "50%", width: 28, height: 28,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: "#fff",
                                }}
                            >
                                <XIcon size={14} />
                            </button>
                            <p style={{
                                position: "absolute", bottom: 8, left: 0, right: 0,
                                textAlign: "center", margin: 0,
                                fontSize: 11, color: "rgba(255,255,255,0.6)",
                            }}>
                                Point at QR code
                            </p>
                            <canvas ref={canvasRef} style={{ display: "none" }} />
                        </div>
                    )}

                    {scanError && (
                        <p style={{ fontSize: 12, color: "#f87171", margin: 0, textAlign: "center" }}>{scanError}</p>
                    )}
                </div>
            )}

            {/* ── Voucher details ── */}
            {voucher && !confirmedTxHash && (
                <>
                    <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <ShieldCheckIcon size={15} color="#F59E0B" />
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>offToken Detected</span>
                            </div>
                            {isExpired ? (
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 20, padding: "2px 8px" }}>EXPIRED</span>
                            ) : alreadyRedeemed ? (
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 20, padding: "2px 8px" }}>CLAIMED</span>
                            ) : (
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 20, padding: "2px 8px" }}>VALID</span>
                            )}
                        </div>
                        <Row label="TOKEN"     value={(tokenSymbol as string) ?? voucher.token.slice(0, 10) + "..."} />
                        <Row label="AMOUNT"    value={`${formatUnits(BigInt(voucher.amount), decimals)} ${(tokenSymbol as string) ?? ""}`} />
                        <Row label="RECIPIENT" value={`${voucher.recipient.slice(0, 8)}...${voucher.recipient.slice(-6)}`} mono />
                        <Row label="EXPIRES"   value={expiry ? `${expiry.toLocaleDateString()} · ${formatDistanceToNow(expiry, { addSuffix: true })}` : "Unknown"} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 9 }}>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.04em" }}>TOKEN ID</span>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{voucher.nonce.slice(0, 12)}...</span>
                        </div>
                    </div>

                    {vaultMissing && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.25)" }}>
                            <span style={{ fontSize: 12, color: "#f87171" }}>Vault address not found on this network. Ensure you are on the correct chain.</span>
                        </div>
                    )}

                    {voucher.transferCode ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
                            <ShieldCheckIcon size={13} color="#4ade80" />
                            <div>
                                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#4ade80" }}>Self-contained offToken</p>
                                <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                                    No transfer code needed. Anyone can broadcast — funds go to the locked recipient only.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}>TRANSFER CODE</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    style={inputStyle} type={showCode ? "text" : "password"}
                                    placeholder="Enter transfer code from sender"
                                    autoComplete="off"
                                    value={manualCode} onChange={e => setManualCode(e.target.value)}
                                />
                                <button onClick={() => setShowCode(v => !v)} style={{
                                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)",
                                    display: "flex", alignItems: "center",
                                }}>
                                    {showCode ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                                </button>
                            </div>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>This is an older offToken. Ask the sender for the transfer code.</p>
                        </div>
                    )}

                    {writeError && (
                        <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.22)" }}>
                            <p style={{ fontSize: 12, color: "#f87171", margin: 0 }}>
                                {writeError.message?.includes("Invalid vault proof") || writeError.message?.includes("ECDSA")
                                    ? "Wrong transfer code or signature mismatch."
                                    : writeError.message?.includes("already redeemed")
                                    ? "This offToken has already been claimed."
                                    : writeError.message?.includes("expired")
                                    ? "This offToken has expired."
                                    : writeError.message?.includes("Insufficient")
                                    ? "Sender has insufficient shielded balance."
                                    : writeError.message?.slice(0, 120)}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleRedeem}
                        disabled={!canRedeem}
                        style={{
                            width: "100%", padding: "13px", borderRadius: 12, border: "none",
                            background: canRedeem ? "#F59E0B" : "rgba(245,158,11,0.15)",
                            color: canRedeem ? "#000" : "rgba(245,158,11,0.5)",
                            fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
                            cursor: canRedeem ? "pointer" : "not-allowed", transition: "all 0.15s",
                        }}
                    >
                        {isSending ? "Confirm in wallet..." : isConfirming ? "Confirming on-chain..." : alreadyRedeemed ? "Already Claimed" : isExpired ? "offToken Expired" : "Claim offToken"}
                    </button>

                    {(isSending || isConfirming) && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <ClockIcon size={11} color="rgba(255,255,255,0.25)" />
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>
                                {isSending ? "Waiting for wallet confirmation..." : "Transaction submitted, waiting for block confirmation..."}
                            </p>
                        </div>
                    )}

                    {txHash && !isConfirmed && (
                        <a href={getTxEtherscanUrl(txHash, chainId)} target="_blank" rel="noopener noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#F59E0B", textDecoration: "none" }}>
                            <ExternalLinkIcon size={12} /> View transaction
                        </a>
                    )}

                    <button onClick={() => { setVoucher(null); setRawJson(""); setManualCode(""); resetWrite(); }} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(255,255,255,0.3)", fontSize: 12,
                        fontFamily: "'Inter', sans-serif", textDecoration: "underline",
                    }}>
                        Clear and paste a different offToken
                    </button>
                </>
            )}

            {/* ── Success ── */}
            {voucher && confirmedTxHash && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", padding: "20px 0" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckCircle2Icon size={24} color="#F59E0B" />
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#d4d6e2", margin: 0 }}>offToken Claimed</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0, textAlign: "center" }}>
                        {formatUnits(BigInt(voucher.amount), decimals)} {(tokenSymbol as string) ?? ""} has been sent to your wallet.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", width: "100%", boxSizing: "border-box" }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", fontWeight: 600 }}>TRANSACTION HASH</span>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.6)", wordBreak: "break-all", textAlign: "center" }}>{confirmedTxHash}</span>
                    </div>
                    <a href={getTxEtherscanUrl(confirmedTxHash as `0x${string}`, chainId)} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                        <ExternalLinkIcon size={12} /> View on Etherscan
                    </a>
                    <button onClick={() => { setVoucher(null); setRawJson(""); setManualCode(""); setConfirmedTxHash(null); resetWrite(); }} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(255,255,255,0.3)", fontSize: 12,
                        fontFamily: "'Inter', sans-serif", textDecoration: "underline",
                    }}>
                        Claim another offToken
                    </button>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
