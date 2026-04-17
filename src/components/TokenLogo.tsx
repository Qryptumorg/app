import { useState, useEffect, useRef } from "react";
import { ShieldIcon } from "lucide-react";
import { getAddress } from "viem";

const SYMBOL_TO_MAINNET: Record<string, string> = {
    USDC:  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT:  "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    DAI:   "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    WETH:  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    ETH:   "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    LINK:  "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    EURC:  "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c",
    WBTC:  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    UNI:   "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    AAVE:  "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    MATIC: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    SHIB:  "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    PEPE:  "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    ARB:   "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1",
    OP:    "0x4200000000000000000000000000000000000042",
};

function twUrl(address: string): string {
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
}

function resolveAddress(tokenAddress: string, tokenSymbol: string): string | null {
    const sym = (tokenSymbol ?? "").toUpperCase();
    if (SYMBOL_TO_MAINNET[sym]) return SYMBOL_TO_MAINNET[sym];
    try { return getAddress(tokenAddress); } catch { return null; }
}

interface TokenLogoProps {
    tokenAddress: string;
    tokenSymbol: string;
    color: string;
    size?: number;
}

export default function TokenLogo({ tokenAddress, tokenSymbol, color, size = 32 }: TokenLogoProps) {
    const [src, setSrc] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);
    const fetchingRef = useRef<string | null>(null);

    useEffect(() => {
        const resolved = resolveAddress(tokenAddress, tokenSymbol);
        setSrc(resolved ? twUrl(resolved) : null);
        setFailed(false);
        fetchingRef.current = null;
    }, [tokenAddress, tokenSymbol]);

    // Called when img fails to load — walk through fallback chain
    const handleError = () => {
        const key = `${tokenAddress}:${tokenSymbol}`;
        if (fetchingRef.current === key) return;
        fetchingRef.current = key;

        (async () => {
            // 1. CoinGecko by contract address
            try {
                const res = await fetch(
                    `https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenAddress}`,
                    { headers: { Accept: "application/json" } }
                );
                if (res.ok) {
                    const data = await res.json();
                    const url = data?.image?.large || data?.image?.small || data?.image?.thumb;
                    if (url) { setSrc(url); return; }
                }
            } catch {}

            // 2. DexScreener
            try {
                const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
                if (res.ok) {
                    const data = await res.json();
                    const url = data?.pairs?.[0]?.info?.imageUrl;
                    if (url) { setSrc(url); return; }
                }
            } catch {}

            setFailed(true);
        })();
    };

    const r = Math.round(size / 2);

    if (failed || !src) {
        return (
            <div style={{
                width: size, height: size,
                borderRadius: r,
                background: `${color}20`,
                border: `1px solid ${color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
            }}>
                <ShieldIcon size={Math.round(size * 0.44)} color={color} />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={tokenSymbol}
            width={size}
            height={size}
            style={{ borderRadius: r, objectFit: "cover", flexShrink: 0 }}
            onError={handleError}
        />
    );
}
