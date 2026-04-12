import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function NoServerStoragePage() {
    const { t } = useLanguage();
    const p = t.featurePages.noServerStorage;
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
                { label: p.heroButtons[0].label, href: "/vault-proof-hashing", primary: false },
                { label: p.heroButtons[1].label, href: "/onchain-verification", primary: false },
            ]}
            stats={[
                { value: "0", label: p.stats[0].label, note: p.stats[0].note },
                { value: "0", label: p.stats[1].label, note: p.stats[1].note },
                { value: "100%", label: p.stats[2].label, note: p.stats[2].note },
                { value: "L1 only", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#0EA5E9"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format",
                    color: "#0EA5E9",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format",
                    color: "#6366F1",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/vault-proof-hashing" },
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#0284C7",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/connect-wallet" },
                },
                {
                    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format",
                    color: "#4338CA",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/onchain-verification" },
                },
            ]}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/vault-proof-hashing", color: "#0EA5E9" },
                { label: p.relatedLinks[1].label, href: "/onchain-verification", color: "#6366F1" },
                { label: p.relatedLinks[2].label, href: "/vault-proof-security", color: "#0284C7" },
            ]}
        />
    );
}
