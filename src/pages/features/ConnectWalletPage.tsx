import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function ConnectWalletPage() {
    const { t } = useLanguage();
    const p = t.featurePages.connectWallet;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#F59E0B"
            secondaryColor="#EF4444"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/app", primary: true },
                { label: p.heroButtons[1].label, href: "/create-qrypt-safe" },
            ]}
            stats={[
                { value: "MetaMask", label: p.stats[0].label, note: p.stats[0].note },
                { value: "WalletConnect", label: p.stats[1].label, note: p.stats[1].note },
                { value: "0", label: p.stats[2].label, note: p.stats[2].note },
                { value: "EIP-1193", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#F59E0B"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format",
                    color: "#F59E0B",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/app" },
                },
                {
                    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format",
                    color: "#EF4444",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format",
                    color: "#D97706",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#B45309",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/network-support" },
                },
            ]}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/create-qrypt-safe", color: "#F59E0B" },
                { label: p.relatedLinks[1].label, href: "/quick-start-guide", color: "#EF4444" },
                { label: p.relatedLinks[2].label, href: "/getting-shielded", color: "#D97706" },
            ]}
        />
    );
}
