import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function CommitPhasePage() {
    const { t } = useLanguage();
    const p = t.featurePages.commitPhase;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#0EA5E9"
            secondaryColor="#6366F1"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/reveal-phase", primary: true },
                { label: p.heroButtons[1].label, href: "/mev-protection" },
            ]}
            stats={[
                { value: "1 tx", label: p.stats[0].label, note: p.stats[0].note },
                { value: "keccak256", label: p.stats[1].label, note: p.stats[1].note },
                { value: "0", label: p.stats[2].label, note: p.stats[2].note },
                { value: "~$0.06", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#0EA5E9"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format",
                    color: "#0EA5E9",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                    link: { text: p.cards[0].linkText!, href: "/vault-proof-hashing" },
                },
                {
                    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format",
                    color: "#6366F1",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format",
                    color: "#3B82F6",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                    link: { text: p.cards[2].linkText!, href: "/nonce-protection" },
                },
                {
                    img: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&auto=format",
                    color: "#2563EB",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/time-locked-reveals" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "function commitTransfer(bytes32 commitment) external {",
                    "    require(!usedNonces[nonce], 'nonce already used');",
                    "    commitments[msg.sender] = Commitment({",
                    "        hash: commitment,",
                    "        expiry: block.timestamp + 600",
                    "    });",
                    "}",
                    "// commitment = keccak256(vaultProof, recipient, amount, nonce)",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/reveal-phase", color: "#0EA5E9" },
                { label: p.relatedLinks[1].label, href: "/mev-protection", color: "#6366F1" },
                { label: p.relatedLinks[2].label, href: "/nonce-protection", color: "#3B82F6" },
            ]}
        />
    );
}
