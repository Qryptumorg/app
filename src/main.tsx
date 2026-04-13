import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const MIN_MS = 2000;
const MAX_MS = 5000;
const startTime = (window as any).__SPLASH_START__ as number ?? Date.now();
const skipSplash = (window as any).__SPLASH_SKIP__ as boolean ?? false;

async function preloadPages() {
    const deadline = startTime + MAX_MS - 600;
    const remainingForPreload = Math.max(0, deadline - Date.now());
    const timeout = new Promise<void>(res => setTimeout(res, remainingForPreload));

    await Promise.race([
        Promise.allSettled([
            import("./pages/DashboardPage"),
            import("./pages/CreateQryptSafePage"),
        ]),
        timeout,
    ]);
}

async function boot() {
    if (!skipSplash) {
        await preloadPages();

        const hardDeadline = startTime + MAX_MS - 600;
        const minTarget = startTime + MIN_MS;
        const waitUntil = Math.min(minTarget, hardDeadline);
        const waitMs = Math.max(0, waitUntil - Date.now());
        if (waitMs > 0) {
            await new Promise<void>(res => setTimeout(res, waitMs));
        }

        const splash = document.getElementById("splash-html");
        if (splash) {
            splash.classList.add("fading");
            await new Promise<void>(res => setTimeout(res, 600));
            splash.style.display = "none";
        }

        sessionStorage.setItem("qryptum_splash_done", "1");
    }

    createRoot(document.getElementById("root")!).render(<App />);

    if (skipSplash) {
        const splash = document.getElementById("splash-html");
        if (splash) splash.style.display = "none";
    }
}

boot();
