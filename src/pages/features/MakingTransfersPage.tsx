import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function MakingTransfersPage() {
    const { t } = useLanguage();
    const p = t.featurePages.makingTransfers;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#7c3aed"
            secondaryColor="#06b6d4"
            heroImg="/images/feat-transfer-wallet.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/app", primary: true },
                { label: p.heroButtons[1].label, href: "/transfer-engine" },
            ]}
            stats={[
                { value: "2 tx", label: p.stats[0].label, note: p.stats[0].note },
                { value: "~$0.12", label: p.stats[1].label, note: p.stats[1].note },
                { value: "0", label: p.stats[2].label, note: p.stats[2].note },
                { value: "10 min", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#7c3aed"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "/images/transfer-commit.jpg",
                    color: "#7c3aed",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/vault-proof-security" },
                },
                {
                    img: "/images/transfer-reveal.jpg",
                    color: "#06b6d4",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "/images/making-reveal.jpg",
                    color: "#10b981",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "/images/exit-receive.jpg",
                    color: "#f59e0b",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/receive-original-tokens" },
                },
            ]}
            steps={[
                { n: "01", color: "#7c3aed", title: p.steps[0].title, desc: p.steps[0].desc, detail: "All inputs processed locally. Nothing sent to servers." },
                { n: "02", color: "#06b6d4", title: p.steps[1].title, desc: p.steps[1].desc, detail: "hash = keccak256(abi.encodePacked(vaultProof, recipient, amount, nonce))" },
                { n: "03", color: "#10b981", title: p.steps[2].title, desc: p.steps[2].desc, detail: "personalVault.commitTransfer(bytes32 commitHash)" },
                { n: "04", color: "#f59e0b", title: p.steps[3].title, desc: p.steps[3].desc, detail: "personalVault.revealTransfer(vaultProof, recipient, amount, nonce)" },
            ]}
            cta={{
                title: p.cta!.title,
                body: p.cta!.body,
                button: p.cta!.button,
                href: "/app",
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/transfer-engine", color: "#7c3aed" },
                { label: p.relatedLinks[1].label, href: "/mev-protection", color: "#06b6d4" },
                { label: p.relatedLinks[2].label, href: "/vault-proof-security", color: "#10b981" },
            ]}
        />
    );
}
