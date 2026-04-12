import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function BurnOnUnshieldPage() {
    const { t } = useLanguage();
    const p = t.featurePages.burnOnUnshield;
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
                { label: p.heroButtons[0].label, href: "/exiting-qrypt-safe", primary: true },
                { label: p.heroButtons[1].label, href: "/one-to-one-backing" },
            ]}
            stats={[
                { value: "1 tx", label: p.stats[0].label, note: p.stats[0].note },
                { value: "Atomic", label: p.stats[1].label, note: p.stats[1].note },
                { value: "0", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Same block", label: p.stats[3].label, note: p.stats[3].note },
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
                    link: { text: p.cards[0].linkText!, href: "/vault-proof-security" },
                },
                {
                    img: "https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=800&auto=format",
                    color: "#F97316",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#DC2626",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#B91C1C",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/vault-proof-security" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "function unshield(address token, uint256 amount, bytes32 proof) external {",
                    "    require(keccak256(proof) == vaultProofHash, 'invalid proof');",
                    "    IShieldToken(qTokenOf[token]).burnFrom(msg.sender, amount);",
                    "    IERC20(token).transfer(msg.sender, amount);",
                    "}",
                    "// burn before transfer: revert on failure restores both",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/exiting-qrypt-safe", color: "#EF4444" },
                { label: p.relatedLinks[1].label, href: "/receive-original-tokens", color: "#F97316" },
                { label: p.relatedLinks[2].label, href: "/one-to-one-backing", color: "#DC2626" },
            ]}
        />
    );
}
