import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initAppKit } from "./lib/appkit";

// APP_ONLY = true when deployed to GitHub Pages (VITE_DEPLOY_TARGET=app)
const APP_ONLY = import.meta.env.VITE_DEPLOY_TARGET === "app";

// Spinner-only splash in APP_ONLY mode: show briefly (min 1s), dismiss within 7s.
// Full marketing splash in dev/marketing mode: min 3.2s, max 7s.
const MIN_MS = APP_ONLY ? 1000 : 3200;
const MAX_MS = 7000;
const startTime = (window as any).__SPLASH_START__ as number ?? Date.now();
const skipSplash = (window as any).__SPLASH_SKIP__ as boolean ?? false;

async function preloadPages() {
    // Hard cap: never block past MAX_MS - 600ms (fade time)
    const deadline = startTime + MAX_MS - 600;
    const remainingForPreload = Math.max(0, deadline - Date.now());
    const timeout = new Promise<void>(res => setTimeout(res, remainingForPreload));

    // In APP_ONLY mode: only preload DashboardPage + QryptAir.
    // DashboardPage includes @railgun-community/wallet — preloading here means
    // the chunk is FULLY cached before React renders, so no stuck PageLoader.
    if (APP_ONLY) {
        await Promise.race([
            Promise.allSettled([
                import("./pages/DashboardPage"),
                import("./pages/QryptAirPWAPage"),
            ]),
            timeout,
        ]);
        return;
    }

    // Full site mode: preload marketing + docs pages during splash.
    // Also include DashboardPage so it's cached when user clicks "Launch App".
    await Promise.race([
        Promise.allSettled([
            import("./pages/DashboardPage"),
            import("./pages/LandingPage"),
            // Features megamenu
            import("./pages/features/ShieldErc20Page"),
            import("./pages/features/TransferShieldPage"),
            import("./pages/features/QTokenSystemPage"),
            import("./pages/features/TransferEnginePage"),
            import("./pages/features/MevProtectionPage"),
            import("./pages/features/QryptShieldPage"),
            import("./pages/features/QryptAirPage"),
            import("./pages/features/OneToOneBackingPage"),
            import("./pages/features/BurnOnUnshieldPage"),
            import("./pages/features/CommitPhasePage"),
            import("./pages/features/RevealPhasePage"),
            // How It Works megamenu
            import("./pages/features/GettingShieldedPage"),
            import("./pages/features/MakingTransfersPage"),
            import("./pages/features/ConnectWalletPage"),
            import("./pages/features/ShieldTokensPage"),
            import("./pages/features/CommitTransferPage"),
            import("./pages/features/RevealAndExecutePage"),
            import("./pages/features/BurnQtokensPage"),
            import("./pages/features/ReceiveOriginalTokensPage"),
            import("./pages/features/EmergencyRecoveryPage"),
            // Security megamenu
            import("./pages/features/VaultProofSecurityPage"),
            import("./pages/features/VaultProofHashingPage"),
            import("./pages/features/NoServerStoragePage"),
            import("./pages/features/OnchainVerificationPage"),
            import("./pages/features/CommitRevealSchemePage"),
            import("./pages/features/NonceProtectionPage"),
            import("./pages/features/TimeLockedRevealsPage"),
            import("./pages/features/InactivityRulePage"),
            import("./pages/features/NoAdminKeysPage"),
            import("./pages/features/ImmutableContractsPage"),
            // Docs megamenu
            import("./pages/features/QuickStartGuidePage"),
            import("./pages/features/SupportedTokensPage"),
            import("./pages/features/NetworkSupportPage"),
            import("./pages/features/ShieldFactoryPage"),
            import("./pages/features/PersonalQryptSafeContractPage"),
            import("./pages/features/ShieldTokenContractPage"),
            import("./pages/features/RestApiReferencePage"),
            import("./pages/features/AbiAndAddressesPage"),
            import("./pages/features/FaqPage"),
        ]),
        timeout,
    ]);
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
        // Hard cap on the ENTIRE preload+init sequence.
        // preloadPages() has its own internal timeout, but appKitInit does not —
        // if the @reown/appkit chunk hangs on a slow CDN, appKitInit never resolves
        // and the splash stays forever. This outer race guarantees we exit in time.
        const hardCapMs = Math.max(0, startTime + MAX_MS - 600 - Date.now());
        await Promise.race([
            Promise.all([preloadPages(), appKitInit]),
            new Promise<void>(res => setTimeout(res, hardCapMs)),
        ]);

        // Wait until MIN_MS elapsed, but never past hard deadline
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
    } else {
        // Still cap appKitInit — if the chunk hangs, render the app anyway
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
