import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function NetworkSupportPage() {
    const { t } = useLanguage();
    const p = t.featurePages.networkSupport;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#6366F1"
            secondaryColor="#8B5CF6"
            heroImg="/images/feat-network-onchain.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/abi-and-addresses", primary: false },
                { label: p.heroButtons[1].label, href: "/rest-api-reference", primary: false },
            ]}
            stats={[
                { value: "Chain ID 1", label: p.stats[0].label, note: p.stats[0].note },
                { value: "Chain ID 11155111", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Hardhat", label: p.stats[2].label, note: p.stats[2].note },
                { value: "EIP-1559", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#6366F1"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format",
                    color: "#6366F1",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/abi-and-addresses" },
                },
                {
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format",
                    color: "#8B5CF6",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#4F46E5",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/rest-api-reference" },
                },
                {
                    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format",
                    color: "#7C3AED",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                },
            ]}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/abi-and-addresses", color: "#6366F1" },
                { label: p.relatedLinks[1].label, href: "/rest-api-reference", color: "#8B5CF6" },
                { label: p.relatedLinks[2].label, href: "/shield-factory", color: "#4F46E5" },
            ]}
        />
    );
}
