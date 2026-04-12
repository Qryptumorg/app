import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function OnchainVerificationPage() {
    const { t } = useLanguage();
    const p = t.featurePages.onchainVerification;
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
                { label: p.heroButtons[0].label, href: "/vault-proof-hashing", primary: false },
                { label: p.heroButtons[1].label, href: "/immutable-contracts", primary: false },
            ]}
            stats={[
                { value: "100%", label: p.stats[0].label, note: p.stats[0].note },
                { value: "0", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Deterministic", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Immutable", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#F59E0B"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=800&auto=format",
                    color: "#F59E0B",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/vault-proof-hashing" },
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#EF4444",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#D97706",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/immutable-contracts" },
                },
                {
                    img: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&auto=format",
                    color: "#B45309",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/immutable-contracts" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// All verification happens inside the contract: no oracle, no API",
                    "function shield(address token, uint256 amount, bytes32 proof) external {",
                    "    require(keccak256(abi.encode(proof)) == vaultProofHash, 'fail');",
                    "    _doShield(token, amount);",
                    "}",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/vault-proof-hashing", color: "#F59E0B" },
                { label: p.relatedLinks[1].label, href: "/no-server-storage", color: "#EF4444" },
                { label: p.relatedLinks[2].label, href: "/immutable-contracts", color: "#D97706" },
            ]}
        />
    );
}
