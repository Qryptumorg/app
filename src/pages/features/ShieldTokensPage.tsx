import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function ShieldTokensPage() {
    const { t } = useLanguage();
    const p = t.featurePages.shieldTokens;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#00C896"
            secondaryColor="#00D4FF"
            heroImg="/images/feat-shield-tokens.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/app", primary: true },
                { label: p.heroButtons[1].label, href: "/supported-tokens" },
            ]}
            stats={[
                { value: "Any ERC-20", label: p.stats[0].label, note: p.stats[0].note },
                { value: "1:1", label: p.stats[1].label, note: p.stats[1].note },
                { value: "~$0.45", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Instant", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#00C896"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&auto=format",
                    color: "#00C896",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/shield-erc20-tokens" },
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#00D4FF",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/enter-vault-proof" },
                },
                {
                    img: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&auto=format",
                    color: "#00A876",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1503551723145-6c040742065b?w=800&auto=format",
                    color: "#0099BB",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/qtoken-system" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "function shield(address token, uint256 amount, bytes32 vaultProof) external {",
                    "    require(keccak256(vaultProof) == vaultProofHash, 'invalid proof');",
                    "    IERC20(token).transferFrom(msg.sender, address(this), amount);",
                    "    IShieldToken(qTokenOf[token]).mint(msg.sender, amount);",
                    "}",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/shield-erc20-tokens", color: "#00C896" },
                { label: p.relatedLinks[1].label, href: "/one-to-one-backing", color: "#00D4FF" },
                { label: p.relatedLinks[2].label, href: "/create-qrypt-safe", color: "#00A876" },
            ]}
        />
    );
}
