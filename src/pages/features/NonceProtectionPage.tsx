import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function NonceProtectionPage() {
    const { t } = useLanguage();
    const p = t.featurePages.nonceProtection;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#7C3AED"
            secondaryColor="#6366F1"
            heroImg="/images/feat-mev-protection.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/commit-reveal-scheme", primary: false },
                { label: p.heroButtons[1].label, href: "/time-locked-reveals", primary: false },
            ]}
            stats={[
                { value: "1 nonce", label: p.stats[0].label, note: p.stats[0].note },
                { value: "Permanent", label: p.stats[1].label, note: p.stats[1].note },
                { value: "0", label: p.stats[2].label, note: p.stats[2].note },
                { value: "On-chain", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#7C3AED"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format",
                    color: "#7C3AED",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/commit-reveal-scheme" },
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#6366F1",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format",
                    color: "#5B21B6",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format",
                    color: "#4338CA",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "mapping(uint256 => bool) public usedNonces;",
                    "",
                    "function commitTransfer(bytes32 commitment, uint256 nonce) external {",
                    "    require(!usedNonces[nonce], 'nonce already used');",
                    "    usedNonces[nonce] = true;",
                    "    commitments[msg.sender] = commitment;",
                    "}",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/commit-reveal-scheme", color: "#7C3AED" },
                { label: p.relatedLinks[1].label, href: "/time-locked-reveals", color: "#6366F1" },
                { label: p.relatedLinks[2].label, href: "/mev-protection", color: "#5B21B6" },
            ]}
        />
    );
}
