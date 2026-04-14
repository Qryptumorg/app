import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function EnterVaultProofPage() {
    const { t } = useLanguage();
    const p = t.featurePages.enterVaultProof;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#8B5CF6"
            secondaryColor="#EC4899"
            heroImg="/images/feat-vault-security.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/vault-proof-security", primary: false },
                { label: p.heroButtons[1].label, href: "/no-server-storage", primary: false },
            ]}
            stats={[
                { value: "Browser only", label: p.stats[0].label, note: p.stats[0].note },
                { value: "keccak256", label: p.stats[1].label, note: p.stats[1].note },
                { value: "0", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Never stored", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#8B5CF6"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format",
                    color: "#8B5CF6",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/vault-proof-hashing" },
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#EC4899",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format",
                    color: "#7C3AED",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/no-server-storage" },
                },
                {
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format",
                    color: "#DB2777",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/onchain-verification" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// Computed entirely client-side in JavaScript",
                    "import { ethers } from 'ethers';",
                    "const hash = ethers.keccak256(ethers.toUtf8Bytes(vaultProof));",
                    "// Only 'hash' is passed to the contract: plaintext is discarded",
                    "await personalVault.shield(token, amount, hash);",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/vault-proof-hashing", color: "#8B5CF6" },
                { label: p.relatedLinks[1].label, href: "/no-server-storage", color: "#EC4899" },
                { label: p.relatedLinks[2].label, href: "/commit-transfer", color: "#7C3AED" },
            ]}
        />
    );
}
