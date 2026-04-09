import FeatureBentoPage from "@/pages/FeatureBentoPage";

export default function AbiAndAddressesPage() {
    return (
        <FeatureBentoPage
            pageTitle="ABI and Addresses"
            badge="INTEGRATION GUIDE"
            heroTitle="Contract ABIs"
            heroHighlight="and Deployed Addresses"
            heroSubtitle="ShieldFactory and PersonalQrypt-Safe ABIs plus official deployed contract addresses for Ethereum Mainnet and Sepolia testnet. All contracts verified on Etherscan."
            primaryColor="#78909C"
            secondaryColor="#42A5F5"
            heroButtons={[
                { label: "REST API Reference", href: "/rest-api-reference", primary: false },
                { label: "Network Support", href: "/network-support", primary: false },
            ]}
            stats={[
                { value: "2 contracts", label: "Core contracts", note: "ShieldFactory + Qrypt-Safe" },
                { value: "Mainnet", label: "Production address", note: "Ethereum Chain ID 1" },
                { value: "Sepolia", label: "Testnet address", note: "Chain ID 11155111" },
                { value: "Verified", label: "On Etherscan", note: "Source code published" },
            ]}
            sectionBadge="CONTRACT REFERENCES"
            sectionHeading="Contracts, ABIs, and Where to Find Them"
            sectionBody="The ShieldFactory ABI covers deployVault() and the vaults mapping. The PersonalQrypt-Safe ABI covers shield(), commitTransfer(), revealTransfer(), unshield(), and emergencyWithdraw(). Both are published on Etherscan and in the open-source repository."
            sectionColor="#78909C"
            cards={[
                {
                    img: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format",
                    color: "#78909C",
                    title: "ShieldFactory ABI",
                    body: "deployVault(bytes32 vaultProofHash), vaults(address) view returns (address), implementation() view returns (address). Full ABI available on Etherscan and GitHub.",
                    link: { text: "ShieldFactory contract", href: "/shield-factory" },
                },
                {
                    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format",
                    color: "#42A5F5",
                    title: "PersonalQrypt-Safe ABI",
                    body: "shield, commitTransfer, revealTransfer, unshield, emergencyWithdraw, vaultProofHash, lastActivity. Full ABI published on Etherscan and GitHub.",
                    link: { text: "PersonalQrypt-Safe contract", href: "/personal-qrypt-safe" },
                },
                {
                    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format",
                    color: "#546E7A",
                    title: "Mainnet Deployment",
                    body: "ShieldFactory is deployed at a fixed address on Ethereum Mainnet. PersonalQrypt-Safe clones are at addresses returned by ShieldFactory.vaults(wallet).",
                },
                {
                    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format",
                    color: "#1E88E5",
                    title: "Etherscan Verification",
                    body: "All contracts are verified on Etherscan for Mainnet and Sepolia. You can read the source code, ABI, and call read functions directly from the Etherscan UI.",
                },
            ]}
            techNote={{
                label: "Contract addresses (Mainnet and Sepolia)",
                lines: [
                    "// Ethereum Mainnet (Chain ID 1)",
                    "ShieldFactory: pending deployment",
                    "",
                    "// Sepolia Testnet (Chain ID 11155111)",
                    "// v2 -- active (qToken decimal precision fix)",
                    "ShieldFactory: 0x0c060e880A405B1231Ce1263c6a52a272cC1cE05",
                    "// v1 -- superseded (ShieldToken defaulted to 18 decimals)",
                    "// ShieldFactory: 0x9a66500886344cbcce882137f263CB0c61aa99b1",
                    "",
                    "// PersonalQrypt-Safe addresses vary per wallet",
                    "const vault = await shieldFactory.getVault(walletAddress);",
                ],
            }}
            relatedLinks={[
                { label: "REST API Reference", href: "/rest-api-reference", color: "#78909C" },
                { label: "ShieldFactory", href: "/shield-factory", color: "#42A5F5" },
                { label: "Network Support", href: "/network-support", color: "#546E7A" },
            ]}
        />
    );
}
