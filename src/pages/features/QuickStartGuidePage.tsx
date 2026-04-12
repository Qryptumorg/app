import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function QuickStartGuidePage() {
    const { t } = useLanguage();
    const p = t.featurePages.quickStartGuide;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#00D4FF"
            secondaryColor="#00C896"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/app", primary: true },
                { label: p.heroButtons[1].label, href: "/supported-tokens" },
            ]}
            stats={[
                { value: "3 steps", label: p.stats[0].label, note: p.stats[0].note },
                { value: "5 min", label: p.stats[1].label, note: p.stats[1].note },
                { value: "~$1.65", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Forever", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#00D4FF"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#00D4FF",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/connect-wallet" },
                },
                {
                    img: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format",
                    color: "#00C896",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                    link: { text: p.cards[1].linkText!, href: "/create-qrypt-safe" },
                },
                {
                    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format",
                    color: "#00AACC",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/shield-tokens" },
                },
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#00B080",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/qtoken-system" },
                },
            ]}
            steps={[
                { n: "01", color: "#00D4FF", title: p.steps[0].title, desc: p.steps[0].desc, detail: "eth_requestAccounts: standard EIP-1193 request" },
                { n: "02", color: "#00C896", title: p.steps[1].title, desc: p.steps[1].desc, detail: "ShieldFactory.deployVault(keccak256(vaultProof))" },
                { n: "03", color: "#00D4FF", title: p.steps[2].title, desc: p.steps[2].desc, detail: "IERC20.approve(qryptSafe, amount)" },
            ]}
            cta={{
                title: p.cta!.title,
                body: p.cta!.body,
                button: p.cta!.button,
                href: "/app",
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/supported-tokens", color: "#00D4FF" },
                { label: p.relatedLinks[1].label, href: "/connect-wallet", color: "#00C896" },
                { label: p.relatedLinks[2].label, href: "/getting-shielded", color: "#00AACC" },
            ]}
        />
    );
}
