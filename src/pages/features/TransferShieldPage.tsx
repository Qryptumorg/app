import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function TransferShieldPage() {
    const { t } = useLanguage();
    const p = t.featurePages.transferShield;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#f59e0b"
            secondaryColor="#7c3aed"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/qtoken-system" },
            ]}
            stats={[
                { value: "Disabled", label: p.stats[0].label, note: p.stats[0].note },
                { value: "Bytecode", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Vault only", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Zero", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#f59e0b"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "/images/shield-erc20-deposit.jpg",
                    color: "#f59e0b",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/qtoken-system" },
                },
                {
                    img: "/images/transfer-shield-gate.jpg",
                    color: "#7c3aed",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "/images/sec-onchain.jpg",
                    color: "#06b6d4",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "/images/card-smart-contract.jpg",
                    color: "#10b981",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/vault-proof-security" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// qToken ERC-20 override",
                    "function transfer(address to, uint256 amount)",
                    "    public override returns (bool) {",
                    "    require(",
                    "        msg.sender == address(vault),",
                    "        'TransferShield: only vault can transfer'",
                    "    );",
                    "    return super.transfer(to, amount);",
                    "}",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/qtoken-system", color: "#f59e0b" },
                { label: p.relatedLinks[1].label, href: "/vault-proof-security", color: "#7c3aed" },
                { label: p.relatedLinks[2].label, href: "/create-personal-qrypt-safe", color: "#06b6d4" },
            ]}
        />
    );
}
