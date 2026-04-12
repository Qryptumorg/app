import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function SupportedTokensPage() {
    const { t } = useLanguage();
    const p = t.featurePages.supportedTokens;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#10B981"
            secondaryColor="#00D4FF"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/shield-tokens", primary: true },
                { label: p.heroButtons[1].label, href: "/shield-erc20-tokens" },
            ]}
            stats={[
                { value: "Any ERC-20", label: p.stats[0].label, note: p.stats[0].note },
                { value: "WETH", label: p.stats[1].label, note: p.stats[1].note },
                { value: "USDT / USDC", label: p.stats[2].label, note: p.stats[2].note },
                { value: "1:1", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#10B981"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format",
                    color: "#10B981",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format",
                    color: "#00D4FF",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format",
                    color: "#059669",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#0099BB",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/network-support" },
                },
            ]}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/shield-erc20-tokens", color: "#10B981" },
                { label: p.relatedLinks[1].label, href: "/shield-tokens", color: "#00D4FF" },
                { label: p.relatedLinks[2].label, href: "/qtoken-system", color: "#059669" },
            ]}
        />
    );
}
