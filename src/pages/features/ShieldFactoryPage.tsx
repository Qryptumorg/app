import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function ShieldFactoryPage() {
    const { t } = useLanguage();
    const p = t.featurePages.shieldFactory;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#00D4FF"
            secondaryColor="#6366F1"
            heroImg="/images/feat-shield-tokens.jpg"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/personal-qrypt-safe", primary: false },
                { label: p.heroButtons[1].label, href: "/abi-and-addresses", primary: false },
            ]}
            stats={[
                { value: "EIP-1167", label: p.stats[0].label, note: p.stats[0].note },
                { value: "1 per wallet", label: p.stats[1].label, note: p.stats[1].note },
                { value: "~$1.20", label: p.stats[2].label, note: p.stats[2].note },
                { value: "On-chain map", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#00D4FF"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=800&auto=format",
                    color: "#00D4FF",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/personal-qrypt-safe" },
                },
                {
                    img: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&auto=format",
                    color: "#6366F1",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format",
                    color: "#0099BB",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#4338CA",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/vault-proof-hashing" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "address public implementation;",
                    "mapping(address => address) public vaults;",
                    "",
                    "function deployVault(bytes32 vaultProofHash) external returns (address vault) {",
                    "    require(vaults[msg.sender] == address(0), 'already deployed');",
                    "    vault = Clones.clone(implementation);",
                    "    IPersonalQryptSafe(vault).initialize(msg.sender, vaultProofHash);",
                    "    vaults[msg.sender] = vault;",
                    "}",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/personal-qrypt-safe", color: "#00D4FF" },
                { label: p.relatedLinks[1].label, href: "/abi-and-addresses", color: "#6366F1" },
                { label: p.relatedLinks[2].label, href: "/create-qrypt-safe", color: "#0099BB" },
            ]}
        />
    );
}
