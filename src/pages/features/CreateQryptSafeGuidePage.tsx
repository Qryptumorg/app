import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function CreateQryptSafeGuidePage() {
    const { t } = useLanguage();
    const p = t.featurePages.createQryptSafeGuide;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#00D4FF"
            secondaryColor="#7C3AED"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/app", primary: true },
                { label: p.heroButtons[1].label, href: "/shield-factory" },
            ]}
            stats={[
                { value: "1 tx", label: p.stats[0].label, note: p.stats[0].note },
                { value: "~$1.20", label: p.stats[1].label, note: p.stats[1].note },
                { value: "Permanent", label: p.stats[2].label, note: p.stats[2].note },
                { value: "1 per wallet", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#00D4FF"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format",
                    color: "#00D4FF",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/shield-factory" },
                },
                {
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format",
                    color: "#7C3AED",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#0099BB",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/vault-proof-hashing" },
                },
                {
                    img: "https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=800&auto=format",
                    color: "#5B21B6",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "function deployVault(bytes32 vaultProofHash) external returns (address vault) {",
                    "    require(vaults[msg.sender] == address(0), 'already deployed');",
                    "    vault = Clones.clone(implementation);",
                    "    PersonalQryptSafe(vault).initialize(msg.sender, vaultProofHash);",
                    "    vaults[msg.sender] = vault;",
                    "}",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/connect-wallet", color: "#00D4FF" },
                { label: p.relatedLinks[1].label, href: "/shield-tokens", color: "#7C3AED" },
                { label: p.relatedLinks[2].label, href: "/create-personal-qrypt-safe", color: "#0099BB" },
            ]}
        />
    );
}
