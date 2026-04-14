import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function InactivityRulePage() {
    const { t } = useLanguage();
    const p = t.featurePages.inactivityRule;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#EF4444"
            secondaryColor="#F97316"
            heroImg="/images/feat-time-lock.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/emergency-recovery", primary: false },
                { label: p.heroButtons[1].label, href: "/no-admin-keys", primary: false },
            ]}
            stats={[
                { value: "180 days", label: p.stats[0].label, note: p.stats[0].note },
                { value: "0", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Block timestamp", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Full balance", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#EF4444"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format",
                    color: "#EF4444",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format",
                    color: "#F97316",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/emergency-recovery" },
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#DC2626",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/no-admin-keys" },
                },
                {
                    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format",
                    color: "#B45309",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "uint256 public lastActivity;",
                    "uint256 public constant INACTIVITY_PERIOD = 180 days;",
                    "",
                    "function emergencyWithdraw() external onlyOwner {",
                    "    require(block.timestamp >= lastActivity + INACTIVITY_PERIOD, 'not yet');",
                    "    _withdrawAll();",
                    "}",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/emergency-recovery", color: "#EF4444" },
                { label: p.relatedLinks[1].label, href: "/no-admin-keys", color: "#F97316" },
                { label: p.relatedLinks[2].label, href: "/immutable-contracts", color: "#DC2626" },
            ]}
        />
    );
}
