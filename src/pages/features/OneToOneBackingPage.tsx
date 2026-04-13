import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function OneToOneBackingPage() {
    const { t } = useLanguage();
    const p = t.featurePages.oneToOneBacking;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#7C3AED"
            secondaryColor="#4F46E5"
            heroImg="/images/feat-token-economics.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/qtoken-system", primary: true },
                { label: p.heroButtons[1].label, href: "/shield-erc20-tokens" },
            ]}
            stats={[
                { value: "1:1", label: p.stats[0].label, note: p.stats[0].note },
                { value: "100%", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Atomic", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Verified", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#7C3AED"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format",
                    color: "#7C3AED",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/shield-tokens" },
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#4F46E5",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&auto=format",
                    color: "#8B5CF6",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#6D28D9",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/burn-on-unshield" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// shield() atomically shields and mints",
                    "function shield(address token, uint256 amount) external {",
                    "    IERC20(token).transferFrom(msg.sender, address(this), amount);",
                    "    IShieldToken(qTokenOf[token]).mint(msg.sender, amount);",
                    "}",
                    "// 1:1 enforced: amount shielded == amount minted",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/qtoken-system", color: "#7C3AED" },
                { label: p.relatedLinks[1].label, href: "/burn-on-unshield", color: "#4F46E5" },
                { label: p.relatedLinks[2].label, href: "/shield-erc20-tokens", color: "#8B5CF6" },
            ]}
        />
    );
}
