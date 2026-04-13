import { useEffect, useRef, useState } from "react";

interface SplashScreenProps {
    onDone: () => void;
}

const MIN_MS = 2200;

export default function SplashScreen({ onDone }: SplashScreenProps) {
    const [progress, setProgress] = useState(0);
    const [fading, setFading] = useState(false);
    const rafRef = useRef<number | null>(null);
    const doneRef = useRef(false);

    useEffect(() => {
        if (doneRef.current) return;
        const startTime = performance.now();

        const tick = (now: number) => {
            const elapsed = now - startTime;
            const p = Math.min(98, (elapsed / MIN_MS) * 98);
            setProgress(p);
            if (p < 98) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };
        rafRef.current = requestAnimationFrame(tick);

        const preloads = Promise.allSettled([
            import("../pages/LandingPage").catch(() => null),
            import("../pages/DashboardPage").catch(() => null),
        ]);

        const timer = new Promise<void>(res => setTimeout(res, MIN_MS));

        Promise.all([timer, preloads]).then(async () => {
            if (doneRef.current) return;
            setProgress(100);
            await new Promise(res => setTimeout(res, 150));
            setFading(true);
            await new Promise(res => setTimeout(res, 500));
            doneRef.current = true;
            onDone();
        });

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [onDone]);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                backgroundColor: "#000000",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: fading ? 0 : 1,
                transition: fading ? "opacity 0.5s ease" : "none",
            }}
        >
            <img
                src="/qryptum-logo.png"
                width={80}
                height={80}
                alt="Qryptum"
                className="splash-item-0"
            />

            <p
                className="splash-item-1"
                style={{
                    marginTop: 16,
                    color: "#ffffff",
                    fontWeight: 300,
                    fontSize: 13,
                    letterSpacing: "0.45em",
                }}
            >
                QRYPTUM
            </p>

            <p
                className="splash-item-2"
                style={{
                    marginTop: 40,
                    color: "#ffffff",
                    fontSize: 17,
                    fontWeight: 400,
                    lineHeight: 1.55,
                    maxWidth: 320,
                    textAlign: "center",
                }}
            >
                Deploy your own personal shield and take full control of every transfer.
            </p>

            <p
                className="splash-item-3"
                style={{
                    marginTop: 16,
                    color: "#9ca3af",
                    fontSize: 12,
                    letterSpacing: "0.06em",
                }}
            >
                Secure · Private · No Internet Required.
            </p>

            <div
                className="splash-item-4"
                style={{
                    position: "absolute",
                    bottom: 48,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 200,
                }}
            >
                <div
                    style={{
                        width: "100%",
                        height: 2,
                        borderRadius: 999,
                        backgroundColor: "#1f2937",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            borderRadius: 999,
                            backgroundColor: "#8B5CF6",
                            width: `${progress}%`,
                            transition: progress > 0 ? "width 0.1s linear" : "none",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
