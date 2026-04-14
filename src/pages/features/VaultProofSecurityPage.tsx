import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function VaultProofSecurityPage() {
    const { t } = useLanguage();
    const p = t.featurePages.vaultProofSecurity;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#7c3aed"
            secondaryColor="#10b981"
            heroImg="/images/feat-vault-security.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/vault-proof-hashing" },
                { label: p.heroButtons[1].label, href: "/no-server-storage" },
            ]}
            stats={[
                { value: "17.5M", label: p.stats[0].label, note: p.stats[0].note },
                { value: "~$528K", label: p.stats[1].label, note: p.stats[1].note },
                { value: "0", label: p.stats[2].label, note: p.stats[2].note },
                { value: "EVM bytecode", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#7c3aed"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "/images/sec-hash.jpg",
                    color: "#7c3aed",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/vault-proof-hashing" },
                },
                {
                    img: "/images/sec-noserver.jpg",
                    color: "#06b6d4",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "/images/sec-onchain.jpg",
                    color: "#10b981",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "/images/card-sec-brute-force.jpg",
                    color: "#f59e0b",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/vault-proof-hashing" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// Vault proof: 3 lowercase letters (26^3) + 3 digits (10^3)",
                    "combinations = 17,576 * 1,000 = 17,576,000",
                    "",
                    "// Cost per attempt at 0.5 gwei average gas price",
                    "gas_per_attempt  = ~200,000 units",
                    "cost_per_attempt = 200,000 * 0.5 gwei * $3,200/ETH ≈ $0.06",
                    "",
                    "// Expected brute-force cost (50% success point)",
                    "expected_cost = 17,576,000 / 2 * $0.06 ≈ $528,000",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/mev-protection", color: "#7c3aed" },
                { label: p.relatedLinks[1].label, href: "/transfer-engine", color: "#10b981" },
                { label: p.relatedLinks[2].label, href: "/transfer-shield", color: "#06b6d4" },
            ]}
        />
    );
}
