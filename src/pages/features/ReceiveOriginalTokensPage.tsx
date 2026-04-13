import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function ReceiveOriginalTokensPage() {
    const { t } = useLanguage();
    const p = t.featurePages.receiveOriginalTokens;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#22C55E"
            secondaryColor="#10B981"
            heroImg="/images/feat-token-economics.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/burn-qtokens", primary: false },
                { label: p.heroButtons[1].label, href: "/exiting-qrypt-safe", primary: false },
            ]}
            stats={[
                { value: "Same tx", label: p.stats[0].label, note: p.stats[0].note },
                { value: "No delay", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Original asset", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Wallet direct", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#22C55E"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&auto=format",
                    color: "#22C55E",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/burn-on-unshield" },
                },
                {
                    img: "https://images.unsplash.com/photo-1503551723145-6c040742065b?w=800&auto=format",
                    color: "#10B981",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format",
                    color: "#16A34A",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/one-to-one-backing" },
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#059669",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                },
            ]}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/burn-qtokens", color: "#22C55E" },
                { label: p.relatedLinks[1].label, href: "/exiting-qrypt-safe", color: "#10B981" },
                { label: p.relatedLinks[2].label, href: "/one-to-one-backing", color: "#16A34A" },
            ]}
        />
    );
}
