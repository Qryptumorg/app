import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTxEtherscanUrl(txHash: string, chainId?: number): string {
    const base = chainId === 1
        ? "https://etherscan.io/tx/"
        : "https://sepolia.etherscan.io/tx/";
    return base + txHash;
}

export function getAddressEtherscanUrl(address: string, chainId?: number): string {
    const base = chainId === 1
        ? "https://etherscan.io/address/"
        : "https://sepolia.etherscan.io/address/";
    return base + address;
}
