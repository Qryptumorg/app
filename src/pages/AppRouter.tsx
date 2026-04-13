import { Suspense, lazy, useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { LanguageProvider } from "@/lib/LanguageContext";
import PageLoader from "@/components/PageLoader";
import LandingPage from "./LandingPage";

const DashboardPage = lazy(() => import("./DashboardPage"));
const CreateQryptSafePage = lazy(() => import("./CreateQryptSafePage"));
const NotFound = lazy(() => import("./not-found"));
const SepoliaVerifiedPage = lazy(() => import("./SepoliaVerifiedPage"));
const SepoliaVerifiedV3Page = lazy(() => import("./SepoliaVerifiedV3Page"));
const SepoliaVerifiedV4Page = lazy(() => import("./SepoliaVerifiedV4Page"));
const SepoliaVerifiedV5Page = lazy(() => import("./SepoliaVerifiedV5Page"));
const SepoliaVerifiedV6Page = lazy(() => import("./SepoliaVerifiedV6Page"));
const SepoliaVerifiedV1Page = lazy(() => import("./SepoliaVerifiedV1Page"));
const SepoliaVerifiedV2Page = lazy(() => import("./SepoliaVerifiedV2Page"));
const PrivacyPage = lazy(() => import("./PrivacyPage"));
const TermsPage = lazy(() => import("./TermsPage"));
const QuantumDesignPage = lazy(() => import("./QuantumDesignPage"));

const ShieldErc20Page = lazy(() => import("./features/ShieldErc20Page"));
const TransferShieldPage = lazy(() => import("./features/TransferShieldPage"));
const QTokenSystemPage = lazy(() => import("./features/QTokenSystemPage"));
const TransferEnginePage = lazy(() => import("./features/TransferEnginePage"));
const GettingShieldedPage = lazy(() => import("./features/GettingShieldedPage"));
const MakingTransfersPage = lazy(() => import("./features/MakingTransfersPage"));
const ExitingQryptSafePage = lazy(() => import("./features/ExitingQryptSafePage"));
const VaultProofSecurityPage = lazy(() => import("./features/VaultProofSecurityPage"));
const MevProtectionPage = lazy(() => import("./features/MevProtectionPage"));
const QryptShieldPage = lazy(() => import("./features/QryptShieldPage"));
const QryptAirPage = lazy(() => import("./features/QryptAirPage"));
const OneToOneBackingPage = lazy(() => import("./features/OneToOneBackingPage"));
const BurnOnUnshieldPage = lazy(() => import("./features/BurnOnUnshieldPage"));
const CommitPhasePage = lazy(() => import("./features/CommitPhasePage"));
const RevealPhasePage = lazy(() => import("./features/RevealPhasePage"));
const ConnectWalletPage = lazy(() => import("./features/ConnectWalletPage"));
const CreateQryptSafeGuidePage = lazy(() => import("./features/CreateQryptSafeGuidePage"));
const ShieldTokensPage = lazy(() => import("./features/ShieldTokensPage"));
const EnterVaultProofPage = lazy(() => import("./features/EnterVaultProofPage"));
const CommitTransferPage = lazy(() => import("./features/CommitTransferPage"));
const RevealAndExecutePage = lazy(() => import("./features/RevealAndExecutePage"));
const BurnQtokensPage = lazy(() => import("./features/BurnQtokensPage"));
const ReceiveOriginalTokensPage = lazy(() => import("./features/ReceiveOriginalTokensPage"));
const EmergencyRecoveryPage = lazy(() => import("./features/EmergencyRecoveryPage"));
const VaultProofHashingPage = lazy(() => import("./features/VaultProofHashingPage"));
const NoServerStoragePage = lazy(() => import("./features/NoServerStoragePage"));
const OnchainVerificationPage = lazy(() => import("./features/OnchainVerificationPage"));
const CommitRevealSchemePage = lazy(() => import("./features/CommitRevealSchemePage"));
const NonceProtectionPage = lazy(() => import("./features/NonceProtectionPage"));
const TimeLockedRevealsPage = lazy(() => import("./features/TimeLockedRevealsPage"));
const InactivityRulePage = lazy(() => import("./features/InactivityRulePage"));
const NoAdminKeysPage = lazy(() => import("./features/NoAdminKeysPage"));
const ImmutableContractsPage = lazy(() => import("./features/ImmutableContractsPage"));
const QuickStartGuidePage = lazy(() => import("./features/QuickStartGuidePage"));
const SupportedTokensPage = lazy(() => import("./features/SupportedTokensPage"));
const NetworkSupportPage = lazy(() => import("./features/NetworkSupportPage"));
const ShieldFactoryPage = lazy(() => import("./features/ShieldFactoryPage"));
const PersonalQryptSafeContractPage = lazy(() => import("./features/PersonalQryptSafeContractPage"));
const ShieldTokenContractPage = lazy(() => import("./features/ShieldTokenContractPage"));
const RestApiReferencePage = lazy(() => import("./features/RestApiReferencePage"));
const AbiAndAddressesPage = lazy(() => import("./features/AbiAndAddressesPage"));
const FaqPage = lazy(() => import("./features/FaqPage"));

// Renders DashboardPage with a hard 7-second cap on the loading spinner.
// After 7s, forces the dashboard to appear regardless of what's still loading.
// Any background processes (railgun, RPC calls) continue after render.
function DashboardRoute() {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [forceShow, setForceShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setForceShow(true), 7000);

        import("./DashboardPage")
            .then(m => {
                clearTimeout(timer);
                setComponent(() => m.default as React.ComponentType);
            })
            .catch(() => {
                clearTimeout(timer);
                setForceShow(true);
            });

        return () => clearTimeout(timer);
    }, []);

    if (Component) return <Component />;
    if (forceShow) {
        // 7s elapsed — render via Suspense without timeout (will show once module arrives)
        return (
            <Suspense fallback={<PageLoader />}>
                <DashboardPage />
            </Suspense>
        );
    }
    return <PageLoader />;
}

export default function AppRouter() {
    return (
        <LanguageProvider>
        <Suspense fallback={null}>
        <Switch>
            {/* Core */}
            <Route path="/" component={LandingPage} />
            <Route path="/app" component={DashboardRoute} />
            <Route path="/sepolia-verified" component={SepoliaVerifiedPage} />
            <Route path="/sepolia-verified-v1" component={SepoliaVerifiedV1Page} />
            <Route path="/sepolia-verified-v2" component={SepoliaVerifiedV2Page} />
            <Route path="/sepolia-verified-v3" component={SepoliaVerifiedV3Page} />
            <Route path="/sepolia-verified-v4" component={SepoliaVerifiedV4Page} />
            <Route path="/sepolia-verified-v5" component={SepoliaVerifiedV5Page} />
            <Route path="/sepolia-verified-v6" component={SepoliaVerifiedV6Page} />
            <Route path="/privacy" component={PrivacyPage} />
            <Route path="/terms" component={TermsPage} />

            {/* Features: Shield Protocol */}
            <Route path="/create-personal-qrypt-safe" component={CreateQryptSafePage} />
            <Route path="/shield-erc20-tokens" component={ShieldErc20Page} />
            <Route path="/transfer-shield" component={TransferShieldPage} />

            {/* Features: qToken System */}
            <Route path="/qtoken-system" component={QTokenSystemPage} />
            <Route path="/one-to-one-backing" component={OneToOneBackingPage} />
            <Route path="/burn-on-unshield" component={BurnOnUnshieldPage} />

            {/* Features: Transfer Engine */}
            <Route path="/transfer-engine" component={TransferEnginePage} />
            <Route path="/commit-phase" component={CommitPhasePage} />
            <Route path="/reveal-phase" component={RevealPhasePage} />
            <Route path="/mev-protection" component={MevProtectionPage} />
            <Route path="/qrypt-shield" component={QryptShieldPage} />
            <Route path="/qrypt-air" component={QryptAirPage} />

            {/* How It Works: Getting Shielded */}
            <Route path="/getting-shielded" component={GettingShieldedPage} />
            <Route path="/connect-wallet" component={ConnectWalletPage} />
            <Route path="/create-qrypt-safe" component={CreateQryptSafeGuidePage} />
            <Route path="/shield-tokens" component={ShieldTokensPage} />

            {/* How It Works: Making Transfers */}
            <Route path="/making-transfers" component={MakingTransfersPage} />
            <Route path="/enter-vault-proof" component={EnterVaultProofPage} />
            <Route path="/commit-transfer" component={CommitTransferPage} />
            <Route path="/reveal-and-execute" component={RevealAndExecutePage} />

            {/* How It Works: Exiting */}
            <Route path="/exiting-qrypt-safe" component={ExitingQryptSafePage} />
            <Route path="/burn-qtokens" component={BurnQtokensPage} />
            <Route path="/receive-original-tokens" component={ReceiveOriginalTokensPage} />
            <Route path="/emergency-recovery" component={EmergencyRecoveryPage} />

            {/* Quantum Design */}
            <Route path="/quantum-design" component={QuantumDesignPage} />

            {/* Security: Cryptographic Design */}
            <Route path="/vault-proof-security" component={VaultProofSecurityPage} />
            <Route path="/vault-proof-hashing" component={VaultProofHashingPage} />
            <Route path="/no-server-storage" component={NoServerStoragePage} />
            <Route path="/onchain-verification" component={OnchainVerificationPage} />

            {/* Security: Protocol Architecture */}
            <Route path="/commit-reveal-scheme" component={CommitRevealSchemePage} />
            <Route path="/nonce-protection" component={NonceProtectionPage} />
            <Route path="/time-locked-reveals" component={TimeLockedRevealsPage} />

            {/* Security: Emergency Recovery */}
            <Route path="/180-day-inactivity" component={InactivityRulePage} />
            <Route path="/no-admin-keys" component={NoAdminKeysPage} />
            <Route path="/immutable-contracts" component={ImmutableContractsPage} />

            {/* Docs: Getting Started */}
            <Route path="/quick-start-guide" component={QuickStartGuidePage} />
            <Route path="/supported-tokens" component={SupportedTokensPage} />
            <Route path="/network-support" component={NetworkSupportPage} />

            {/* Docs: Smart Contracts */}
            <Route path="/shield-factory" component={ShieldFactoryPage} />
            <Route path="/personal-qrypt-safe" component={PersonalQryptSafeContractPage} />
            <Route path="/shield-token" component={ShieldTokenContractPage} />

            {/* Docs: Integration Guide */}
            <Route path="/rest-api-reference" component={RestApiReferencePage} />
            <Route path="/abi-and-addresses" component={AbiAndAddressesPage} />
            <Route path="/faq" component={FaqPage} />

            <Route component={NotFound} />
        </Switch>
        </Suspense>
        </LanguageProvider>
    );
}
