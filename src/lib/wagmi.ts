import { http, createConfig } from "wagmi";
import { sepolia, mainnet, hardhat } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
    chains: [sepolia, mainnet, hardhat],
    connectors: [
        metaMask(),
        injected(),
    ],
    transports: {
        [sepolia.id]: http(),
        [mainnet.id]: http(),
        [hardhat.id]: http("http://127.0.0.1:8545"),
    },
});

export const SHIELD_FACTORY_ADDRESSES: Record<number, string> = {
    11155111: "0x0c060e880A405B1231Ce1263c6a52a272cC1cE05",
    1: import.meta.env.VITE_SHIELD_FACTORY_MAINNET || "",
    31337: import.meta.env.VITE_SHIELD_FACTORY_LOCAL || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
};

export const SUPPORTED_CHAIN_IDS = [11155111, 1, 31337];
