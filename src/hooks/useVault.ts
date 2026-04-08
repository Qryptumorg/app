import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { SHIELD_FACTORY_ADDRESSES } from "@/lib/wagmi";
import { SHIELD_FACTORY_ABI } from "@/lib/abi";
import { fetchVault } from "@/lib/api";

export function useVault() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const factoryAddress = SHIELD_FACTORY_ADDRESSES[chainId] as `0x${string}` | undefined;

    const { data: hasVaultOnChain, refetch: refetchOnChain } = useReadContract({
        address: factoryAddress,
        abi: SHIELD_FACTORY_ABI,
        functionName: "hasVault",
        args: address ? [address] : undefined,
        query: { enabled: !!address && !!factoryAddress },
    });

    const { data: vaultAddress, refetch: refetchVaultAddress } = useReadContract({
        address: factoryAddress,
        abi: SHIELD_FACTORY_ABI,
        functionName: "getVault",
        args: address ? [address] : undefined,
        query: { enabled: !!address && !!factoryAddress && hasVaultOnChain === true },
    });

    const { data: vaultRecord } = useQuery({
        queryKey: ["vault", address],
        queryFn: () => fetchVault(address!),
        enabled: !!address && isConnected,
    });

    const refetch = () => {
        refetchOnChain();
        refetchVaultAddress();
    };

    return {
        hasVault: hasVaultOnChain === true,
        vaultAddress: vaultAddress as `0x${string}` | undefined,
        vaultRecord,
        factoryAddress,
        refetch,
    };
}
