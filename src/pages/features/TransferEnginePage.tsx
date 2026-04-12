import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function TransferEnginePage() {
    const { t } = useLanguage();
    const p = t.featurePages.transferEngine;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#10b981"
            secondaryColor="#7c3aed"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/app", primary: true },
                { label: p.heroButtons[1].label, href: "/mev-protection" },
            ]}
            stats={[
                { value: "2-phase", label: p.stats[0].label, note: p.stats[0].note },
                { value: "600s", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Zero", label: p.stats[2].label, note: p.stats[2].note },
                { value: "On-chain", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#10b981"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "/images/transfer-commit.jpg",
                    color: "#10b981",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/mev-protection" },
                },
                {
                    img: "/images/transfer-reveal.jpg",
                    color: "#7c3aed",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "/images/sec-nonce.jpg",
                    color: "#06b6d4",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "/images/sec-timelocked.jpg",
                    color: "#f59e0b",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/mev-protection" },
                },
            ]}
            steps={[
                { n: "01", color: "#10b981", title: p.steps[0].title, desc: p.steps[0].desc, detail: "hash = keccak256(abi.encodePacked(vaultProof, recipient, amount, nonce))" },
                { n: "02", color: "#7c3aed", title: p.steps[1].title, desc: p.steps[1].desc, detail: "personalVault.commitTransfer(bytes32 commitHash)" },
                { n: "03", color: "#06b6d4", title: p.steps[2].title, desc: p.steps[2].desc, detail: "Block confirms. commitTimestamp stored on-chain." },
                { n: "04", color: "#f59e0b", title: p.steps[3].title, desc: p.steps[3].desc, detail: "personalVault.revealTransfer(vaultProof, recipient, amount, nonce)" },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// Commit phase: nothing sensitive exposed",
                    "bytes32 commitHash = keccak256(abi.encodePacked(",
                    "    vaultProof,    // user's secret",
                    "    recipient,     // destination wallet",
                    "    amount,        // token amount",
                    "    nonce          // unique per-commit counter",
                    "));",
                    "personalVault.commitTransfer(commitHash);",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/mev-protection", color: "#10b981" },
                { label: p.relatedLinks[1].label, href: "/making-transfers", color: "#7c3aed" },
                { label: p.relatedLinks[2].label, href: "/vault-proof-security", color: "#06b6d4" },
            ]}
        />
    );
}
