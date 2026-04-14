import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function GettingShieldedPage() {
    const { t } = useLanguage();
    const p = t.featurePages.gettingShielded;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#06b6d4"
            secondaryColor="#10b981"
            heroImg="/images/feat-shield-tokens.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/app", primary: true },
                { label: p.heroButtons[1].label, href: "/quick-start-guide" },
            ]}
            stats={[
                { value: "3", label: p.stats[0].label, note: p.stats[0].note },
                { value: "5 min", label: p.stats[1].label, note: p.stats[1].note },
                { value: "~$1.65", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Forever", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#06b6d4"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "/images/getting-connect.jpg",
                    color: "#06b6d4",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/connect-wallet" },
                },
                {
                    img: "/images/getting-deploy.jpg",
                    color: "#7c3aed",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "/images/getting-shield.jpg",
                    color: "#10b981",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "/images/card-smart-contract.jpg",
                    color: "#f59e0b",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/making-transfers" },
                },
            ]}
            steps={[
                { n: "01", color: "#06b6d4", title: p.steps[0].title, desc: p.steps[0].desc, detail: "No signature required at this step. Just a connection authorization." },
                { n: "02", color: "#7c3aed", title: p.steps[1].title, desc: p.steps[1].desc, detail: "ShieldFactory.deployVault(vaultProofHash): gas ~150,000 units." },
                { n: "03", color: "#10b981", title: p.steps[2].title, desc: p.steps[2].desc, detail: "token.approve(vaultAddress, amount): standard ERC-20 approval." },
                { n: "04", color: "#f59e0b", title: p.steps[3].title, desc: p.steps[3].desc, detail: "personalVault.shield(tokenAddress, amount, vaultProof)" },
            ]}
            cta={{
                title: p.cta!.title,
                body: p.cta!.body,
                button: p.cta!.button,
                href: "/app",
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/shield-erc20-tokens", color: "#06b6d4" },
                { label: p.relatedLinks[1].label, href: "/making-transfers", color: "#7c3aed" },
                { label: p.relatedLinks[2].label, href: "/vault-proof-security", color: "#10b981" },
            ]}
        />
    );
}
