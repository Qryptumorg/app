import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function TimeLockedRevealsPage() {
    const { t } = useLanguage();
    const p = t.featurePages.timeLockedReveals;
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
                { label: p.heroButtons[0].label, href: "/commit-phase", primary: false },
                { label: p.heroButtons[1].label, href: "/nonce-protection", primary: false },
            ]}
            stats={[
                { value: "10 min", label: p.stats[0].label, note: p.stats[0].note },
                { value: "~600", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Void", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Nonce consumed", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#F59E0B"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format",
                    color: "#F59E0B",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#EF4444",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/nonce-protection" },
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#D97706",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format",
                    color: "#B45309",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/making-transfers" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "struct Commitment { bytes32 hash; uint256 expiry; }",
                    "mapping(address => Commitment) public commitments;",
                    "",
                    "// On commit: set expiry to 10 minutes from now",
                    "commitments[msg.sender] = Commitment(hash, block.timestamp + 600);",
                    "",
                    "// On reveal: check expiry",
                    "require(block.timestamp <= commitments[msg.sender].expiry, 'expired');",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/nonce-protection", color: "#F59E0B" },
                { label: p.relatedLinks[1].label, href: "/commit-phase", color: "#EF4444" },
                { label: p.relatedLinks[2].label, href: "/mev-protection", color: "#D97706" },
            ]}
        />
    );
}
