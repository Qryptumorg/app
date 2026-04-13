import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function ImmutableContractsPage() {
    const { t } = useLanguage();
    const p = t.featurePages.immutableContracts;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#8B5CF6"
            secondaryColor="#EC4899"
            heroImg="/images/feat-vault-security.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/no-admin-keys", primary: false },
                { label: p.heroButtons[1].label, href: "/onchain-verification", primary: false },
            ]}
            stats={[
                { value: "0", label: p.stats[0].label, note: p.stats[0].note },
                { value: "0", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Bytecode final", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Ethereum L1", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#8B5CF6"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&auto=format",
                    color: "#8B5CF6",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/shield-factory" },
                },
                {
                    img: "https://images.unsplash.com/photo-1503551723145-6c040742065b?w=800&auto=format",
                    color: "#EC4899",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/no-admin-keys" },
                },
                {
                    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format",
                    color: "#7C3AED",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/abi-and-addresses" },
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#DB2777",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/vault-proof-security" },
                },
            ]}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/no-admin-keys", color: "#8B5CF6" },
                { label: p.relatedLinks[1].label, href: "/onchain-verification", color: "#EC4899" },
                { label: p.relatedLinks[2].label, href: "/vault-proof-security", color: "#7C3AED" },
            ]}
        />
    );
}
