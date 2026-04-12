import FeatureBentoPage from "@/pages/FeatureBentoPage";
import { useLanguage } from "@/lib/LanguageContext";

export default function RestApiReferencePage() {
    const { t } = useLanguage();
    const p = t.featurePages.restApiReference;
    return (
        <FeatureBentoPage
            pageTitle={p.pageTitle}
            badge={p.badge}
            heroTitle={p.heroTitle}
            heroHighlight={p.heroHighlight}
            heroSubtitle={p.heroSubtitle}
            primaryColor="#F59E0B"
            secondaryColor="#EF4444"
            heroButtons={[
                { label: p.heroButtons[0].label, href: "/abi-and-addresses", primary: false },
                { label: p.heroButtons[1].label, href: "/network-support", primary: false },
            ]}
            stats={[
                { value: "REST", label: p.stats[0].label, note: p.stats[0].note },
                { value: "JSON", label: p.stats[1].label, note: p.stats[1].note },
                { value: "No auth", label: p.stats[2].label, note: p.stats[2].note },
                { value: "Websocket", label: p.stats[3].label, note: p.stats[3].note },
            ]}
            sectionBadge={p.sectionBadge}
            sectionColor="#F59E0B"
            sectionHeading={p.sectionHeading}
            sectionBody={p.sectionBody}
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format",
                    color: "#F59E0B",
                    title: p.cards[0].title,
                    body: p.cards[0].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format",
                    color: "#EF4444",
                    title: p.cards[1].title,
                    body: p.cards[1].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#D97706",
                    title: p.cards[2].title,
                    body: p.cards[2].body,
                },
                {
                    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format",
                    color: "#B45309",
                    title: p.cards[3].title,
                    body: p.cards[3].body,
                    link: { text: p.cards[3].linkText!, href: "/no-server-storage" },
                },
            ]}
            techNote={{
                label: p.techNoteLabel!,
                lines: [
                    "// Get Qrypt-Safe for a wallet",
                    "GET /api/vault/0xYourWalletAddress",
                    "",
                    "// Get transaction history",
                    "GET /api/transactions/0xYourVaultAddress?page=1&limit=20",
                    "",
                    "// WebSocket event stream",
                    "WS wss://api.qryptum.io/events?vault=0xYourVaultAddress",
                ],
            }}
            relatedLinks={[
                { label: p.relatedLinks[0].label, href: "/abi-and-addresses", color: "#F59E0B" },
                { label: p.relatedLinks[1].label, href: "/network-support", color: "#EF4444" },
                { label: p.relatedLinks[2].label, href: "/shield-factory", color: "#D97706" },
            ]}
        />
    );
}
