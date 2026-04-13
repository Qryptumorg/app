import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function ShieldTokenContractPage() {
    const { t } = useLanguage();
    const p = t.featurePages.shieldTokenContract;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#EC4899"
            secondaryColor="#8B5CF6"
            heroImg="/images/feat-shield-tokens.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/transfer-shield", primary: false },
                { label: p.heroButtons[1].label, href: "/qtoken-system", primary: false },
            ]}
            stats={[
                { value: "ERC-20", label: p.stats[0].label, note: p.stats[0].note },
                { value: "Disabled", label: p.stats[1].label, note: p.stats[1].note },
                { value: "1:1", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Qrypt-Safe only", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#EC4899"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format",
                    color: "#EC4899",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/transfer-shield" },
                },
                {
                    img: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format",
                    color: "#8B5CF6",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format",
                    color: "#DB2777",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/one-to-one-backing" },
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#6D28D9",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/qtoken-system" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "contract ShieldToken is ERC20 {",
                    "    address public immutable vault;",
                    "    constructor(address _vault) { vault = _vault; }",
                    "",
                    "    function transfer(address, uint256) public override returns (bool) {",
                    "        revert('use Qrypt-Safe to transfer');",
                    "    }",
                    "    // transferFrom also overridden to revert",
                    "}",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/transfer-shield", color: "#EC4899" },
                { label: p.relatedLinks[1].label, href: "/qtoken-system", color: "#8B5CF6" },
                { label: p.relatedLinks[2].label, href: "/one-to-one-backing", color: "#DB2777" },
            ]}
        />
    );
}
