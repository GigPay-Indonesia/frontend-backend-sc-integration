import { useMemo } from 'react';
import { useChainId, useReadContracts, useWatchContractEvent } from 'wagmi';
import { getContractAddress, GigPayRegistryABI } from '@/lib/abis';

export type RegistryModules = {
  tokenRegistry?: `0x${string}`;
  routeRegistry?: `0x${string}`;
  swapManager?: `0x${string}`;
  yieldManager?: `0x${string}`;
};

const ZERO = '0x0000000000000000000000000000000000000000';

const asAddr = (v: unknown) => {
  const s = typeof v === 'string' ? v : undefined;
  if (!s || s === ZERO) return undefined;
  return s as `0x${string}`;
};

export function useRegistryModules() {
  const chainId = useChainId();
  const registryAddress =
    (getContractAddress('GigPayRegistry', chainId) || getContractAddress('GigPayRegistry', 84532)) as
      | `0x${string}`
      | undefined;

  const registry = useMemo(() => {
    if (!registryAddress) return undefined;
    return {
      address: registryAddress,
      abi: GigPayRegistryABI,
    } as const;
  }, [registryAddress]);

  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: registry
      ? ([
          { ...registry, functionName: 'tokenRegistry' },
          { ...registry, functionName: 'routeRegistry' },
          { ...registry, functionName: 'swapManager' },
          { ...registry, functionName: 'yieldManager' },
        ] as const)
      : [],
    query: { enabled: !!registryAddress, refetchInterval: 30_000 },
  });

  // Refresh modules on ModuleSet updates
  useWatchContractEvent({
    address: registryAddress,
    abi: GigPayRegistryABI,
    eventName: 'ModuleSet',
    enabled: !!registryAddress,
    onLogs: () => {
      refetch?.();
    },
  });

  const modules: RegistryModules = useMemo(
    () => ({
      tokenRegistry: asAddr(data?.[0]?.result),
      routeRegistry: asAddr(data?.[1]?.result),
      swapManager: asAddr(data?.[2]?.result),
      yieldManager: asAddr(data?.[3]?.result),
    }),
    [data]
  );

  return { registryAddress, modules, isLoading, isError, refetch };
}

