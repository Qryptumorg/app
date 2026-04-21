import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

function getApiBase(): string {
    const rawBase = (import.meta.env.VITE_API_BASE as string | undefined)
        ?.replace(/\/api\/?$/, "")
        ?.replace(/\/$/, "");
    if (rawBase) return `${rawBase}/api`;
    if (import.meta.env.DEV) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        return `${origin}/api`;
    }
    return "https://qryptum-api.up.railway.app/api";
}

function rpcUrl(chainId: number): string {
    if (chainId === 1) return `${getApiBase()}/rpc/drpc`;
    return `${getApiBase()}/rpc/${chainId}`;
}

const _defaultConfig = createConfig({
    chains: [sepolia, mainnet],
    connectors: [injected()],
    transports: {
        [sepolia.id]: http(rpcUrl(sepolia.id)),
        [mainnet.id]: http(rpcUrl(mainnet.id)),
    },
});

export let wagmiConfig: ReturnType<typeof createConfig> = _defaultConfig;
export let hasAppKit = false;
export let appKitModal: any = null;

let _initialized = false;

function dedupeReownPreloads(): void {
    if (typeof document === "undefined") return;
    const seen = new Set<string>();
    document.querySelectorAll<HTMLLinkElement>("link[rel='preload'][as='font']").forEach(el => {
        const key = el.href;
        if (seen.has(key)) {
            el.parentNode?.removeChild(el);
        } else {
            seen.add(key);
        }
    });
    new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (
                    node instanceof HTMLLinkElement &&
                    node.rel === "preload" &&
                    node.as === "font"
                ) {
                    if (seen.has(node.href)) {
                        node.parentNode?.removeChild(node);
                    } else {
                        seen.add(node.href);
                    }
                }
            });
        });
    }).observe(document.head, { childList: true });
}

export async function initAppKit(projectId: string): Promise<void> {
    if (_initialized) return;
    _initialized = true;
    try {
        const networks = [sepolia, mainnet] as [any, any];
        const adapter = new WagmiAdapter({
            networks,
            projectId,
            transports: {
                [sepolia.id]: http(rpcUrl(sepolia.id)),
                [mainnet.id]: http(rpcUrl(mainnet.id)),
            },
        });
        const modal = createAppKit({
            adapters: [adapter],
            networks,
            projectId,
            metadata: {
                name: "Qryptum",
                description: "Privacy-first DeFi protocol on Ethereum",
                url: "https://qryptum.eth.limo",
                icons: [`${window.location.origin}${import.meta.env.BASE_URL}qryptum-logo.png`],
            },
            features: { analytics: false },
        });
        wagmiConfig = adapter.wagmiConfig;
        appKitModal = modal;
        hasAppKit = true;
        dedupeReownPreloads();
    } catch (e) {
        console.warn("[AppKit] init failed, falling back to injected only:", e);
        _initialized = false;
    }
}

export const SHIELD_FACTORY_ADDRESSES: Record<number, string> = {
    11155111: "",
    1: "",
};

export const SHIELD_FACTORY_V6_ADDRESSES: Record<number, string> = {
    11155111: "0xeaa722e996888b662E71aBf63d08729c6B6802F4",
    1:        "0xE3583f8cA00Edf89A00d9D8c46AE456487a4C56f",
};

export const SUPPORTED_CHAIN_IDS = [11155111, 1];
