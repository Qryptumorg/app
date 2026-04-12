import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function EmergencyRecoveryPage() {
    const { t } = useLanguage();
    const p = t.featurePages.emergencyRecovery;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#EF4444"
            secondaryColor="#F97316"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/180-day-inactivity", primary: false },
                { label: p.heroButtons[1].label, href: "/no-admin-keys", primary: false },
            ]}
            stats={[
                { value: "180 days", label: p.stats[0].label, note: p.stats[0].note },
                { value: "On-chain", label: p.stats[1].label, note: p.stats[1].note },
                { value: "0 Admin", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Full balance", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#EF4444"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format",
                    color: "#EF4444",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/180-day-inactivity" },
                },
                {
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format",
                    color: "#F97316",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#DC2626",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/no-admin-keys" },
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#B45309",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                },
            ]}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/180-day-inactivity", color: "#EF4444" },
                { label: p.relatedLinks[1].label, href: "/no-admin-keys", color: "#F97316" },
                { label: p.relatedLinks[2].label, href: "/exiting-qrypt-safe", color: "#DC2626" },
            ]}
        />
    );
}
