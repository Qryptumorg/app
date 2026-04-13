import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function CommitTransferPage() {
    const { t } = useLanguage();
    const p = t.featurePages.commitTransfer;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#3B82F6"
            secondaryColor="#0EA5E9"
            heroImg="/images/feat-commit-reveal.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/reveal-and-execute", primary: true },
                { label: p.heroButtons[1].label, href: "/commit-phase" },
            ]}
            stats={[
                { value: "1 tx", label: p.stats[0].label, note: p.stats[0].note },
                { value: "10 min", label: p.stats[1].label, note: p.stats[1].note },
                { value: "~$0.06", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Hash only", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#3B82F6"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format",
                    color: "#3B82F6",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/commit-phase" },
                },
                {
                    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format",
                    color: "#0EA5E9",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/time-locked-reveals" },
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#2563EB",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/nonce-protection" },
                },
                {
                    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format",
                    color: "#1D4ED8",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/mev-protection" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// Step 1: submit commitment hash",
                    "bytes32 commitment = keccak256(abi.encode(vaultProof, recipient, amount, nonce));",
                    "await personalVault.commitTransfer(commitment);",
                    "// Step 2: reveal within 10 minutes",
                    "await personalVault.revealTransfer(vaultProof, recipient, amount, nonce);",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/reveal-and-execute", color: "#3B82F6" },
                { label: p.relatedLinks[1].label, href: "/mev-protection", color: "#0EA5E9" },
                { label: p.relatedLinks[2].label, href: "/making-transfers", color: "#2563EB" },
            ]}
        />
    );
}
