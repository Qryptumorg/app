import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

async function fetchAndInitAppKit(): Promise<void> {
    try {
        const { initAppKit } = await import("./lib/appkit");
        const base = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "");
        let projectId: string | undefined;
        if (base) {
            try {
                const res = await fetch(`${base}/config`, { signal: AbortSignal.timeout(3000) });
                if (res.ok) {
                    const data = await res.json();
                    projectId = data?.wcProjectId;
                }
            } catch {}
        }
        if (!projectId) {
            projectId = import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined;
        }
        if (projectId) await initAppKit(projectId);
    } catch (e) {
        console.warn("[boot] AppKit init skipped:", e);
    }
}

function hideSplash() {
    const splash = document.getElementById("splash-html");
    if (!splash) return;
    splash.classList.add("fading");
    setTimeout(() => { splash.style.display = "none"; }, 500);
}

async function boot() {
    // Mount React immediately — no blocking on AppKit
    createRoot(document.getElementById("root")!).render(<App />);
    hideSplash();
    sessionStorage.setItem("qryptum_splash_done", "1");
    // Load AppKit in background after page is interactive
    fetchAndInitAppKit();
}

boot();
