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
        if (!projectId) projectId = import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined;
        if (projectId) await initAppKit(projectId);
    } catch (e) {
        console.warn("[boot] AppKit skipped:", e);
    }
}

async function boot() {
    // CRITICAL: await AppKit sebelum render
    // wagmiConfig live binding di wagmi.ts hanya berguna kalau App baca config
    // SETELAH initAppKit selesai set wagmiConfig = adapter.wagmiConfig
    await Promise.race([
        fetchAndInitAppKit(),
        new Promise<void>(res => setTimeout(res, 5000)), // max 5s
    ]);

    createRoot(document.getElementById("root")!).render(<App />);

    const splash = document.getElementById("splash-html");
    if (splash) {
        splash.classList.add("fading");
        setTimeout(() => { splash.style.display = "none"; }, 400);
    }
    sessionStorage.setItem("qryptum_splash_done", "1");
}

boot();
