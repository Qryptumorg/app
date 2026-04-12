import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function AbiAndAddressesPage() {
    const { t } = useLanguage();
    const p = t.featurePages.abiAndAddresses;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#78909C"
            secondaryColor="#42A5F5"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/rest-api-reference", primary: false },
                { label: p.heroButtons[1].label, href: "/network-support", primary: false },
            ]}
            stats={[
                { value: "2 contracts", label: p.stats[0].label, note: p.stats[0].note },
                { value: "Mainnet", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Sepolia", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Verified", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#78909C"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format",
                    color: "#78909C",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/shield-factory" },
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#42A5F5",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/personal-qrypt-safe" },
                },
                {
                    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format",
                    color: "#546E7A",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format",
                    color: "#1E88E5",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// Ethereum Mainnet (Chain ID 1)",
                    "QryptSafe: pending deployment",
                    "",
                    "// Sepolia Testnet (Chain ID 11155111)",
                    "// v6 -- active (OTP chain, airBudget isolation)",
                    "QryptSafe v6: pending deployment (see Deployed Addresses)",
                    "// v5–v1 -- historical, pending redeployment from clean wallet",
                    "",
                    "// PersonalQrypt-Safe addresses vary per wallet",
                    "const vault = await qryptSafe.getVault(walletAddress);",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/rest-api-reference", color: "#78909C" },
                { label: p.relatedLinks[1].label, href: "/shield-factory", color: "#42A5F5" },
                { label: p.relatedLinks[2].label, href: "/network-support", color: "#546E7A" },
            ]}
        />
    );
}
