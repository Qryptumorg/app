import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function ExitingQryptSafePage() {
    const { t } = useLanguage();
    const p = t.featurePages.exitingQryptSafe;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#10b981"
            secondaryColor="#f59e0b"
            heroImg="/images/feat-guide-docs.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/app", primary: true },
            ]}
            stats={[
                { value: "1 tx", label: p.stats[0].label, note: p.stats[0].note },
                { value: "Instant", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Burned", label: p.stats[2].label, note: p.stats[2].note },
                { value: "180 days", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#10b981"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "/images/exit-burn.jpg",
                    color: "#10b981",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/burn-qtokens" },
                },
                {
                    img: "/images/exit-receive.jpg",
                    color: "#06b6d4",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "/images/card-dual-factor.jpg",
                    color: "#7c3aed",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "/images/exit-recovery.jpg",
                    color: "#f59e0b",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/emergency-recovery" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// Single transaction unshield",
                    "personalVault.unshield(tokenAddress, amount, vaultProof)",
                    "",
                    "// Contract burns qTokens and returns originals atomically",
                    "qToken.burn(msg.sender, amount);",
                    "token.transfer(msg.sender, amount);",
                    "",
                    "// Emergency path (180 days inactivity only)",
                    "personalVault.emergencyWithdraw(tokenAddress)",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/shield-erc20-tokens", color: "#10b981" },
                { label: p.relatedLinks[1].label, href: "/qtoken-system", color: "#06b6d4" },
                { label: p.relatedLinks[2].label, href: "/emergency-recovery", color: "#f59e0b" },
            ]}
        />
    );
}
