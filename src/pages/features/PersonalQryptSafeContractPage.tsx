import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function PersonalQryptSafeContractPage() {
    const { t } = useLanguage();
    const p = t.featurePages.personalQryptSafeContract;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#7C3AED"
            secondaryColor="#00D4FF"
            heroImg="/images/feat-vault-security.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/shield-factory", primary: false },
                { label: p.heroButtons[1].label, href: "/abi-and-addresses", primary: false },
            ]}
            stats={[
                { value: "3 functions", label: p.stats[0].label, note: p.stats[0].note },
                { value: "Vault proof", label: p.stats[1].label, note: p.stats[1].note },
                { value: "keccak256", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Ethereum L1", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#7C3AED"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&auto=format",
                    color: "#7C3AED",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/shield-tokens" },
                },
                {
                    img: "https://images.unsplash.com/photo-1503551723145-6c040742065b?w=800&auto=format",
                    color: "#00D4FF",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/commit-reveal-scheme" },
                },
                {
                    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format",
                    color: "#5B21B6",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/burn-qtokens" },
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#0099BB",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/180-day-inactivity" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "interface IPersonalQryptSafe {",
                    "    function shield(address token, uint256 amount, bytes32 proof) external;",
                    "    function commitTransfer(bytes32 commitment) external;",
                    "    function revealTransfer(bytes32 proof, address to, uint256 amount, uint256 nonce) external;",
                    "    function unshield(address token, uint256 amount, bytes32 proof) external;",
                    "    function emergencyWithdraw() external;",
                    "}",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/shield-factory", color: "#7C3AED" },
                { label: p.relatedLinks[1].label, href: "/shield-token", color: "#00D4FF" },
                { label: p.relatedLinks[2].label, href: "/abi-and-addresses", color: "#5B21B6" },
            ]}
        />
    );
}
