import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { http, createConfig } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { hardhat } from "wagmi/chains";
import type { Config } from "wagmi";

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined;

export const hasAppKit = !!projectId;

let _wagmiConfig: Config;
let _appKitModal: ReturnType<typeof createAppKit> | null = null;

if (projectId) {
    const wagmiAdapter = new WagmiAdapter({
        projectId,
        networks: [sepolia, mainnet],
        transports: {
            [sepolia.id]: http(),
            [mainnet.id]: http(),
        },
    });

    _appKitModal = createAppKit({
        adapters: [wagmiAdapter],
        projectId,
        networks: [sepolia, mainnet],
        defaultNetwork: sepolia,
        metadata: {
            name: "Qryptum",
            description: "Privacy-first DeFi protocol on Ethereum",
            url: window.location.origin,
            icons: ["https://qryptum.app/icon.png"],
        },
        features: {
            analytics: false,
            email: false,
            socials: false,
        },
        themeMode: "dark",
        themeVariables: {
            "--w3m-accent": "#22C55E",
            "--w3m-border-radius-master": "3px",
        },
    });

    _wagmiConfig = wagmiAdapter.wagmiConfig as unknown as Config;
} else {
    _wagmiConfig = createConfig({
        chains: [sepolia, mainnet, hardhat],
        connectors: [injected({ target: "metaMask" }), metaMask(), injected()],
        transports: {
            [sepolia.id]: http(),
            [mainnet.id]: http(),
            [hardhat.id]: http("http://127.0.0.1:8545"),
        },
    });
}

export const wagmiConfig = _wagmiConfig;
export const appKitModal = _appKitModal;

/** V5 factory addresses — kept for backward compat with existing vaults */
export const SHIELD_FACTORY_ADDRESSES: Record<number, string> = {
    11155111: "0x291295B88fC35dcA3208f7cCC3DFc1a2921167E8",
    1: import.meta.env.VITE_SHIELD_FACTORY_MAINNET || "",
    31337: import.meta.env.VITE_SHIELD_FACTORY_LOCAL || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
};

/** V6 factory addresses — OTP chain + airBudget isolation */
export const SHIELD_FACTORY_V6_ADDRESSES: Record<number, string> = {
    11155111: "0x04E4d410646a6c5268E003121023111e6328DA59",
    1: import.meta.env.VITE_SHIELD_FACTORY_V6_MAINNET || "",
    31337: import.meta.env.VITE_SHIELD_FACTORY_V6_LOCAL || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
};

export const SUPPORTED_CHAIN_IDS = [11155111, 1, 31337];
