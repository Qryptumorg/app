import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function RevealAndExecutePage() {
    const { t } = useLanguage();
    const p = t.featurePages.revealAndExecute;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#10B981"
            secondaryColor="#3B82F6"
            heroImg="/images/feat-commit-reveal.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/commit-transfer", primary: false },
                { label: p.heroButtons[1].label, href: "/reveal-phase", primary: false },
            ]}
            stats={[
                { value: "1 tx", label: p.stats[0].label, note: p.stats[0].note },
                { value: "Atomic", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Hash match", label: p.stats[2].label, note: p.stats[2].note },
                { value: "~$0.06", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#10B981"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format",
                    color: "#10B981",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/reveal-phase" },
                },
                {
                    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format",
                    color: "#3B82F6",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#059669",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format",
                    color: "#2563EB",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/time-locked-reveals" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "function revealTransfer(bytes32 proof, address to, uint256 amt, uint256 nonce) external {",
                    "    Commitment memory c = commitments[msg.sender];",
                    "    require(block.timestamp <= c.expiry, 'expired');",
                    "    require(keccak256(abi.encode(proof, to, amt, nonce)) == c.hash);",
                    "    delete commitments[msg.sender];",
                    "    qToken.transfer(to, amt);",
                    "}",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/commit-transfer", color: "#10B981" },
                { label: p.relatedLinks[1].label, href: "/making-transfers", color: "#3B82F6" },
                { label: p.relatedLinks[2].label, href: "/mev-protection", color: "#059669" },
            ]}
        />
    );
}
