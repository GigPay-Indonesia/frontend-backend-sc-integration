import { useMemo } from 'react';
import { useChainId } from 'wagmi';
import { getContractAbi, getContractAddress } from '../abis';
import { useRegistryModules } from '@/hooks/useRegistryModules';

export const useGigPayContract = (name: string) => {
    const chainId = useChainId();
    const { modules } = useRegistryModules();

    return useMemo(() => {
        let address = getContractAddress(name, chainId);

        // Fallback to Base Sepolia if not found on current chain (e.g. user on Mainnet)
        // This ensures Read hooks still work by pointing to the correct deployment
        if (!address) {
            address = getContractAddress(name, 84532); // BASE_SEPOLIA_CHAIN_ID
        }

        // Registry-resolved overrides (authoritative)
        if (name === 'TokenRegistry' && modules.tokenRegistry) address = modules.tokenRegistry;
        if (name === 'SwapRouteRegistry' && modules.routeRegistry) address = modules.routeRegistry;
        if (name === 'CompositeSwapManager' && modules.swapManager) address = modules.swapManager;
        if (name === 'YieldManagerV2' && modules.yieldManager) address = modules.yieldManager;

        const abi = getContractAbi(name);
        return {
            chainId,
            address: address as `0x${string}` | undefined,
            abi,
        };
    }, [chainId, name, modules.tokenRegistry, modules.routeRegistry, modules.swapManager, modules.yieldManager]);
};
