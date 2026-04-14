import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initAppKit } from "./lib/appkit";

// APP_ONLY = true when deployed to GitHub Pages (VITE_DEPLOY_TARGET=app)
const APP_ONLY = import.meta.env.VITE_DEPLOY_TARGET === "app";

// Splash timing: min 1s in production (APP_ONLY), 500ms locally.
// Hard cap at 4s so AppKit failure never blocks the app.
const MIN_MS = APP_ONLY ? 1000 : 500;
const MAX_APPKIT_MS = 4000;
const startTime = (window as any).__SPLASH_START__ as number ?? Date.now();
const skipSplash = (window as any).__SPLASH_SKIP__ as boolean ?? false;

async function fetchAndInitAppKit(): Promise<void> {
    // VITE_API_BASE = "https://qryptum-api.up.railway.app" (no /api suffix)
    // Railway Express mounts routes at /api, so append it here.
    // In production without VITE_API_BASE set, fall back to the hardcoded Railway URL.
    const rawBase = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "");
    const base = rawBase
        ? `${rawBase}/api`
        : import.meta.env.DEV ? null : "https://qryptum-api.up.railway.app/api";
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
    // CRITICAL: always wait for AppKit to finish BEFORE createRoot().render().
    // This ensures wagmiConfig is the AppKit adapter's config (not _defaultConfig)
    // when WagmiProvider first mounts — prevents the dual-config crash.
    const appKitInit = fetchAndInitAppKit();
    const hardCap = new Promise<void>(res => setTimeout(res, MAX_APPKIT_MS));

    if (!skipSplash) {
        // First visit: wait for BOTH the minimum splash time AND AppKit init,
        // capped at MAX_APPKIT_MS so we never block forever.
        const minTimer = new Promise<void>(res => {
            const wait = Math.max(0, startTime + MIN_MS - Date.now());
            setTimeout(res, wait);
        });
        await Promise.race([
            Promise.all([minTimer, appKitInit]),
            hardCap,
        ]);

        const splash = document.getElementById("splash-html");
        if (splash) {
            splash.classList.add("fading");
            await new Promise<void>(res => setTimeout(res, 600));
            splash.style.display = "none";
        }
        sessionStorage.setItem("qryptum_splash_done", "1");
    } else {
        // Subsequent visits: skip splash animation, just wait for AppKit.
        await Promise.race([appKitInit, hardCap]);
        const splash = document.getElementById("splash-html");
        if (splash) splash.style.display = "none";
    }

    createRoot(document.getElementById("root")!).render(<App />);
}

boot();
