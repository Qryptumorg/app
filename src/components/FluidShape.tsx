import { useEffect, useRef } from "react";

export default function FluidShape({ className = "" }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const tRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        window.addEventListener("resize", resize);

        const W = () => canvas.offsetWidth;
        const H = () => canvas.offsetHeight;

        // ribbon layers: each is a flowing bezier strip
        const layers = [
            { color1: "rgba(98,126,234,0.85)", color2: "rgba(0,212,255,0.0)", speed: 0.0006, amp: 0.28, yOff: 0.42, thick: 0.38 },
            { color1: "rgba(0,212,255,0.65)",  color2: "rgba(98,126,234,0.0)", speed: 0.0008, amp: 0.22, yOff: 0.55, thick: 0.30 },
            { color1: "rgba(98,126,234,0.50)", color2: "rgba(0,212,255,0.0)", speed: 0.0005, amp: 0.18, yOff: 0.35, thick: 0.22 },
            { color1: "rgba(0,180,255,0.40)",  color2: "rgba(98,126,234,0.0)", speed: 0.0007, amp: 0.32, yOff: 0.65, thick: 0.25 },
            { color1: "rgba(98,126,234,0.30)", color2: "rgba(0,212,255,0.0)", speed: 0.0004, amp: 0.14, yOff: 0.28, thick: 0.18 },
        ];

        let lastFrame = 0;
        const draw = (timestamp: number) => {
            if (timestamp - lastFrame < 33) {
                animRef.current = requestAnimationFrame(draw);
                return;
            }
            lastFrame = timestamp;
            const t = timestamp * 0.001;
            tRef.current = t;
            const w = W();
            const h = H();

            ctx.clearRect(0, 0, w, h);

            // Ambient glow: sits on the right half, fades softly to the left
            const glow = ctx.createRadialGradient(w * 0.72, h * 0.48, 0, w * 0.72, h * 0.48, w * 0.62);
            glow.addColorStop(0, "rgba(98,126,234,0.20)");
            glow.addColorStop(0.35, "rgba(0,212,255,0.09)");
            glow.addColorStop(0.7, "rgba(98,126,234,0.03)");
            glow.addColorStop(1, "transparent");
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, w, h);

            layers.forEach((layer, li) => {
                const phase = li * 1.2;
                const y0 = h * layer.yOff;
                const halfThick = h * layer.thick * 0.5;

                // build a flowing ribbon using two bezier paths (top + bottom edge)
                const steps = 120;
                const topPoints: [number, number][] = [];
                const botPoints: [number, number][] = [];

                for (let i = 0; i <= steps; i++) {
                    const px = (i / steps) * w;
                    const wave =
                        Math.sin(i / steps * Math.PI * 2.5 + t * layer.speed * 1000 + phase) * layer.amp * h +
                        Math.sin(i / steps * Math.PI * 1.3 + t * layer.speed * 700 + phase * 0.7) * layer.amp * h * 0.4;
                    topPoints.push([px, y0 - halfThick + wave]);
                    botPoints.push([px, y0 + halfThick + wave]);
                }

                const grad = ctx.createLinearGradient(0, 0, w, 0);
                grad.addColorStop(0, "transparent");
                grad.addColorStop(0.15, "transparent");
                grad.addColorStop(0.42, layer.color1);
                grad.addColorStop(0.72, layer.color1);
                grad.addColorStop(1, layer.color2);

                ctx.beginPath();
                ctx.moveTo(topPoints[0][0], topPoints[0][1]);
                for (let i = 1; i < topPoints.length - 1; i++) {
                    const mx = (topPoints[i][0] + topPoints[i + 1][0]) / 2;
                    const my = (topPoints[i][1] + topPoints[i + 1][1]) / 2;
                    ctx.quadraticCurveTo(topPoints[i][0], topPoints[i][1], mx, my);
                }
                for (let i = botPoints.length - 1; i > 0; i--) {
                    const mx = (botPoints[i][0] + botPoints[i - 1][0]) / 2;
                    const my = (botPoints[i][1] + botPoints[i - 1][1]) / 2;
                    ctx.quadraticCurveTo(botPoints[i][0], botPoints[i][1], mx, my);
                }
                ctx.closePath();
                ctx.fillStyle = grad;
                ctx.fill();
            });

            animRef.current = requestAnimationFrame(draw);
        };

        animRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{ width: "100%", height: "100%", display: "block" }}
        />
    );
}
