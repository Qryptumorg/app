import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { SHIELD_FACTORY_ADDRESSES, SHIELD_FACTORY_V6_ADDRESSES } from "@/lib/wagmi";
import { SHIELD_FACTORY_ABI, SHIELD_FACTORY_V6_ABI } from "@/lib/abi";
import { fetchVault } from "@/lib/api";

export type VaultVersion = "v5" | "v6" | null;

export function useVault() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();

    const v6FactoryAddress = SHIELD_FACTORY_V6_ADDRESSES[chainId] as `0x${string}` | undefined;
    const v5FactoryAddress = SHIELD_FACTORY_ADDRESSES[chainId] as `0x${string}` | undefined;

    // Query V6 factory
    const { data: hasV6Vault, refetch: refetchV6 } = useReadContract({
        address: v6FactoryAddress,
        abi: SHIELD_FACTORY_V6_ABI,
        functionName: "hasQryptSafe",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!v6FactoryAddress,
            refetchInterval: (query) => {
                const data = query.state.data;
                return data === true ? 30_000 : 3_000;
            },
        },
    });

    const { data: v6VaultAddress, refetch: refetchV6Addr } = useReadContract({
        address: v6FactoryAddress,
        abi: SHIELD_FACTORY_V6_ABI,
        functionName: "getQryptSafe",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!v6FactoryAddress && hasV6Vault === true,
            refetchInterval: 30_000,
        },
    });

    // Query V5 factory in parallel (used as fallback when no V6 vault)
    const { data: hasV5Vault, refetch: refetchV5 } = useReadContract({
        address: v5FactoryAddress,
        abi: SHIELD_FACTORY_ABI,
        functionName: "hasVault",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!v5FactoryAddress,
            refetchInterval: (query) => {
                const data = query.state.data;
                return data === true ? 30_000 : 3_000;
            },
        },
    });

    const { data: v5VaultAddress, refetch: refetchV5Addr } = useReadContract({
        address: v5FactoryAddress,
        abi: SHIELD_FACTORY_ABI,
        functionName: "getVault",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!v5FactoryAddress && hasV5Vault === true && hasV6Vault !== true,
            refetchInterval: 30_000,
        },
    });

    const { data: vaultRecord } = useQuery({
        queryKey: ["vault", address],
        queryFn: () => fetchVault(address!),
        enabled: !!address && isConnected,
    });

    // V6 takes priority: if the user has a V6 vault, use it
    const hasVault = hasV6Vault === true || hasV5Vault === true;
    const vaultAddress = hasV6Vault === true
        ? (v6VaultAddress as `0x${string}` | undefined)
        : (v5VaultAddress as `0x${string}` | undefined);
    const vaultVersion: VaultVersion = hasV6Vault === true ? "v6" : hasV5Vault === true ? "v5" : null;
    const factoryAddress = hasV6Vault === true ? v6FactoryAddress : v5FactoryAddress;

    const refetch = () => {
        refetchV6();
        refetchV6Addr();
        refetchV5();
        refetchV5Addr();
    };

    return {
        hasVault,
        vaultAddress,
        vaultVersion,
        vaultRecord,
        factoryAddress,
        refetch,
    };
}
