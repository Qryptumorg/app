import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initAppKit } from "./lib/appkit";

async function fetchAndInitAppKit(): Promise<void> {
    const base = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "");
    if (base) {
        try {
            const res = await fetch(`${base}/config`, { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
                const data = await res.json();
                if (data?.wcProjectId) { initAppKit(data.wcProjectId); return; }
            }
        } catch {}
    }
    const envId = import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined;
    if (envId) initAppKit(envId);
}

async function boot() {
    fetchAndInitAppKit();

    createRoot(document.getElementById("root")!).render(<App />);

    const splash = document.getElementById("splash-html");
    if (splash) {
        splash.classList.add("fading");
        setTimeout(() => { splash.style.display = "none"; }, 500);
    }

    sessionStorage.setItem("qryptum_splash_done", "1");
}

boot();
