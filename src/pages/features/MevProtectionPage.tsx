import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function MevProtectionPage() {
    const { t } = useLanguage();
    const p = t.featurePages.mevProtection;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#06b6d4"
            secondaryColor="#7c3aed"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/transfer-engine" },
            ]}
            stats={[
                { value: "Zero", label: p.stats[0].label, note: p.stats[0].note },
                { value: "Unique", label: p.stats[1].label, note: p.stats[1].note },
                { value: "600s", label: p.stats[2].label, note: p.stats[2].note },
                { value: "On-chain", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#06b6d4"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "/images/transfer-commit.jpg",
                    color: "#06b6d4",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/transfer-engine" },
                },
                {
                    img: "/images/sec-nonce.jpg",
                    color: "#7c3aed",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "/images/sec-timelocked.jpg",
                    color: "#10b981",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "/images/transfer-mev.jpg",
                    color: "#f59e0b",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/vault-proof-security" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// Attacker sees only this in mempool:",
                    "commitHash = 0x3f7a91b2c4d8e5f1...",
                    "",
                    "// They cannot recover any of these without brute-forcing:",
                    "// - vaultProof    (6-char secret)",
                    "// - recipient     (destination address)",
                    "// - amount        (token amount)",
                    "// - nonce         (unique per commit)",
                    "",
                    "// By reveal time, commit is already mined. Too late to front-run.",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/transfer-engine", color: "#06b6d4" },
                { label: p.relatedLinks[1].label, href: "/commit-reveal-scheme", color: "#7c3aed" },
                { label: p.relatedLinks[2].label, href: "/nonce-protection", color: "#10b981" },
            ]}
        />
    );
}
