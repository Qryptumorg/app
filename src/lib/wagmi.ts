import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
export { SHIELD_FACTORY_ADDRESSES, SHIELD_FACTORY_V6_ADDRESSES, SUPPORTED_CHAIN_IDS } from "./appkit";

export const config = createConfig({
    chains: [sepolia, mainnet],
    connectors: [injected()],
    transports: {
        [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
        [mainnet.id]: http("https://ethereum-rpc.publicnode.com"),
    },
});
