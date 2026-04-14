import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initAppKit } from "./lib/appkit";

// APP_ONLY = true when deployed to GitHub Pages (VITE_DEPLOY_TARGET=app)
const APP_ONLY = import.meta.env.VITE_DEPLOY_TARGET === "app";

// Spinner-only splash in APP_ONLY mode: show briefly (min 1s), dismiss within 7s.
// Full marketing splash in dev/marketing mode: min 3.2s, max 7s.
const MIN_MS = APP_ONLY ? 1000 : 500;
const MAX_MS = 7000;
const startTime = (window as any).__SPLASH_START__ as number ?? Date.now();
const skipSplash = (window as any).__SPLASH_SKIP__ as boolean ?? false;

async function preloadPages() {
    // This repo is APP_ONLY — DashboardPage lazy-loads via Suspense after React renders.
    // No marketing or docs pages to preload here.
}

async function fetchAndInitAppKit(): Promise<void> {
    const base = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "");
    if (base) {
        try {
            const res = await fetch(`${base}/config`, { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
                const data = await res.json();
                if (data?.wcProjectId) { await initAppKit(data.wcProjectId); return; }
            }
        } catch {}
    }
    const envId = import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined;
    if (envId) await initAppKit(envId);
}

async function boot() {
    const appKitInit = fetchAndInitAppKit();

    if (!skipSplash) {
        // Dismiss splash after MIN_MS (1s in production, 500ms locally).
        // appKitInit runs in the background — React renders with the fallback
        // wagmi injected config. AppKit modal becomes available asynchronously.
        const minWait = Math.max(0, startTime + MIN_MS - Date.now());
        if (minWait > 0) await new Promise<void>(res => setTimeout(res, minWait));

        const splash = document.getElementById("splash-html");
        if (splash) {
            splash.classList.add("fading");
            await new Promise<void>(res => setTimeout(res, 600));
            splash.style.display = "none";
        }

        sessionStorage.setItem("qryptum_splash_done", "1");
    } else {
        // Skip splash path: still cap appKitInit so we never block forever
        await Promise.race([
            appKitInit,
            new Promise<void>(res => setTimeout(res, 5000)),
        ]);
    }

    createRoot(document.getElementById("root")!).render(<App />);

    if (skipSplash) {
        const splash = document.getElementById("splash-html");
        if (splash) splash.style.display = "none";
    }
}

boot();
