import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function FaqPage() {
    const { t } = useLanguage();
    const p = t.featurePages.faq;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#0EA5E9"
            secondaryColor="#6366F1"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/quick-start-guide", primary: true },
            ]}
            stats={[
                { value: "Non-custodial", label: p.stats[0].label, note: p.stats[0].note },
                { value: "0", label: p.stats[1].label, note: p.stats[1].note },
                { value: "~$1.65", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Ethereum L1", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#0EA5E9"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=800&auto=format",
                    color: "#0EA5E9",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/180-day-inactivity" },
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#6366F1",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/no-admin-keys" },
                },
                {
                    img: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&auto=format",
                    color: "#0284C7",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/commit-reveal-scheme" },
                },
                {
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format",
                    color: "#4338CA",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/supported-tokens" },
                },
            ]}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/quick-start-guide", color: "#0EA5E9" },
                { label: p.relatedLinks[1].label, href: "/supported-tokens", color: "#6366F1" },
                { label: p.relatedLinks[2].label, href: "/getting-shielded", color: "#0284C7" },
            ]}
        />
    );
}
