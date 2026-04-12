import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function VaultProofHashingPage() {
    const { t } = useLanguage();
    const p = t.featurePages.vaultProofHashing;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#6366F1"
            secondaryColor="#8B5CF6"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/vault-proof-security", primary: false },
                { label: p.heroButtons[1].label, href: "/no-server-storage", primary: false },
            ]}
            stats={[
                { value: "keccak256", label: p.stats[0].label, note: p.stats[0].note },
                { value: "256 bits", label: p.stats[1].label, note: p.stats[1].note },
                { value: "0", label: p.stats[2].label, note: p.stats[2].note },
                { value: "$528K", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#6366F1"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format",
                    color: "#6366F1",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/onchain-verification" },
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#8B5CF6",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format",
                    color: "#4F46E5",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#7C3AED",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// Solidity: hash stored on deployment",
                    "bytes32 public vaultProofHash;",
                    "constructor(bytes32 _hash) { vaultProofHash = _hash; }",
                    "",
                    "// JavaScript: computed client-side",
                    "const hash = ethers.keccak256(ethers.toUtf8Bytes(vaultProof));",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/no-server-storage", color: "#6366F1" },
                { label: p.relatedLinks[1].label, href: "/onchain-verification", color: "#8B5CF6" },
                { label: p.relatedLinks[2].label, href: "/vault-proof-security", color: "#4F46E5" },
            ]}
        />
    );
}
