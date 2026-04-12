import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function BurnQtokensPage() {
    const { t } = useLanguage();
    const p = t.featurePages.burnQtokens;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#F97316"
            secondaryColor="#EF4444"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/app", primary: true },
            ]}
            stats={[
                { value: "1 tx", label: p.stats[0].label, note: p.stats[0].note },
                { value: "Atomic", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Instant", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Vault proof", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#F97316"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=800&auto=format",
                    color: "#F97316",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/vault-proof-security" },
                },
                {
                    img: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&auto=format",
                    color: "#EF4444",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/burn-on-unshield" },
                },
                {
                    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format",
                    color: "#DC2626",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#B45309",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/exiting-qrypt-safe" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "function unshield(address token, uint256 amount, bytes32 vaultProof) external {",
                    "    require(keccak256(vaultProof) == vaultProofHash, 'invalid proof');",
                    "    IShieldToken(qTokenOf[token]).burnFrom(msg.sender, amount);",
                    "    IERC20(token).transfer(msg.sender, amount);",
                    "}",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/exiting-qrypt-safe", color: "#F97316" },
                { label: p.relatedLinks[1].label, href: "/receive-original-tokens", color: "#EF4444" },
                { label: p.relatedLinks[2].label, href: "/burn-on-unshield", color: "#DC2626" },
            ]}
        />
    );
}
