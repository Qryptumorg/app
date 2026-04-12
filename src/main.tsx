import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const MIN_MS = 3200;
const MAX_MS = 7000;
const startTime = (window as any).__SPLASH_START__ as number ?? Date.now();
const skipSplash = (window as any).__SPLASH_SKIP__ as boolean ?? false;

async function preloadPages() {
    // Deadline = MAX_MS from page-open minus 600ms fade — hard cap total splash time
    const deadline = startTime + MAX_MS - 600;
    const remainingForPreload = Math.max(0, deadline - Date.now());
    const timeout = new Promise<void>(res => setTimeout(res, remainingForPreload));

    await Promise.race([
        Promise.allSettled([
            // Core pages
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

async function boot() {
    if (!skipSplash) {
        await preloadPages();

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
    }

    createRoot(document.getElementById("root")!).render(<App />);

    if (skipSplash) {
        const splash = document.getElementById("splash-html");
        if (splash) splash.style.display = "none";
    }
}

boot();
