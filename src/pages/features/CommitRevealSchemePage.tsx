import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function CommitRevealSchemePage() {
    const { t } = useLanguage();
    const p = t.featurePages.commitRevealScheme;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#EC4899"
            secondaryColor="#8B5CF6"
            heroImg="/images/feat-commit-reveal.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/commit-phase", primary: false },
                { label: p.heroButtons[1].label, href: "/reveal-phase", primary: false },
            ]}
            stats={[
                { value: "2 phases", label: p.stats[0].label, note: p.stats[0].note },
                { value: "0", label: p.stats[1].label, note: p.stats[1].note },
                { value: "10 min", label: p.stats[2].label, note: p.stats[2].note },
                { value: "keccak256", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#EC4899"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&auto=format",
                    color: "#EC4899",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/commit-phase" },
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#8B5CF6",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/reveal-phase" },
                },
                {
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format",
                    color: "#DB2777",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/mev-protection" },
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#6D28D9",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/nonce-protection" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// Phase 1: submit hash, reveal nothing",
                    "commitments[msg.sender] = keccak256(abi.encode(proof, to, amt, nonce));",
                    "",
                    "// Phase 2: reveal details, contract verifies commitment",
                    "require(keccak256(abi.encode(proof, to, amt, nonce)) == commitments[msg.sender]);",
                    "_executeTransfer(to, amt);",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/commit-phase", color: "#EC4899" },
                { label: p.relatedLinks[1].label, href: "/reveal-phase", color: "#8B5CF6" },
                { label: p.relatedLinks[2].label, href: "/mev-protection", color: "#DB2777" },
            ]}
        />
    );
}
