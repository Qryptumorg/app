import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function QTokenSystemPage() {
    const { t } = useLanguage();
    const p = t.featurePages.qtokenSystem;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#7c3aed"
            secondaryColor="#06b6d4"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/app", primary: true },
            ]}
            stats={[
                { value: "q prefix", label: p.stats[0].label, note: p.stats[0].note },
                { value: "1:1", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Non-transferable", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Auto-burned", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#7c3aed"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "/images/qtoken-backing.jpg",
                    color: "#7c3aed",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/shield-erc20-tokens" },
                },
                {
                    img: "/images/qtoken-tokens.jpg",
                    color: "#06b6d4",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "/images/transfer-shield-block.jpg",
                    color: "#10b981",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "/images/qtoken-burn.jpg",
                    color: "#f59e0b",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/exiting-qrypt-safe" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// Transfer blocked for external callers",
                    "function transfer(address to, uint256 amount) public override returns (bool) {",
                    "    require(msg.sender == vault, 'Only vault can transfer');",
                    "    return super.transfer(to, amount);",
                    "}",
                    "",
                    "// Only Qrypt-Safe can mint or burn",
                    "modifier onlyVault() { require(msg.sender == vault); _; }",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/shield-erc20-tokens", color: "#06b6d4" },
                { label: p.relatedLinks[1].label, href: "/transfer-shield", color: "#7c3aed" },
                { label: p.relatedLinks[2].label, href: "/exiting-qrypt-safe", color: "#10b981" },
            ]}
        />
    );
}
