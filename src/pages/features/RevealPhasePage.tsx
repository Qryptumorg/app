import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function RevealPhasePage() {
    const { t } = useLanguage();
    const p = t.featurePages.revealPhase;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#10B981"
            secondaryColor="#0EA5E9"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/commit-phase", primary: false },
                { label: p.heroButtons[1].label, href: "/making-transfers", primary: false },
            ]}
            stats={[
                { value: "10 min", label: p.stats[0].label, note: p.stats[0].note },
                { value: "1 tx", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Hash match", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Atomic", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#10B981"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format",
                    color: "#10B981",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/vault-proof-hashing" },
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#0EA5E9",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&auto=format",
                    color: "#059669",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format",
                    color: "#0891B2",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/time-locked-reveals" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "function revealTransfer(bytes32 vaultProof, address to, uint256 amount, uint256 nonce) external {",
                    "    Commitment memory c = commitments[msg.sender];",
                    "    require(block.timestamp <= c.expiry, 'commitment expired');",
                    "    bytes32 expected = keccak256(abi.encode(vaultProof, to, amount, nonce));",
                    "    require(expected == c.hash, 'hash mismatch');",
                    "    _executeTransfer(to, amount);",
                    "}",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/commit-phase", color: "#10B981" },
                { label: p.relatedLinks[1].label, href: "/making-transfers", color: "#0EA5E9" },
                { label: p.relatedLinks[2].label, href: "/vault-proof-hashing", color: "#059669" },
            ]}
        />
    );
}
