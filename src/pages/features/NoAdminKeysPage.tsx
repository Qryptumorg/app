import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function NoAdminKeysPage() {
    const { t } = useLanguage();
    const p = t.featurePages.noAdminKeys;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#22C55E"
            secondaryColor="#10B981"
            heroImg="/images/feat-vault-security.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/immutable-contracts", primary: false },
                { label: p.heroButtons[1].label, href: "/vault-proof-security", primary: false },
            ]}
            stats={[
                { value: "0", label: p.stats[0].label, note: p.stats[0].note },
                { value: "0", label: p.stats[1].label, note: p.stats[1].note },
                { value: "0", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Bytecode", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#22C55E"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=800&auto=format",
                    color: "#22C55E",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/immutable-contracts" },
                },
                {
                    img: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&auto=format",
                    color: "#10B981",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/immutable-contracts" },
                },
                {
                    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format",
                    color: "#16A34A",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#059669",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/abi-and-addresses" },
                },
            ]}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/immutable-contracts", color: "#22C55E" },
                { label: p.relatedLinks[1].label, href: "/vault-proof-security", color: "#10B981" },
                { label: p.relatedLinks[2].label, href: "/no-server-storage", color: "#16A34A" },
            ]}
        />
    );
}
