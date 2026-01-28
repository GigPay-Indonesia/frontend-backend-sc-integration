import { useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { getTokenSymbolByAddress } from '@/lib/abis';
import { useEscrowCoreContract } from '@/lib/hooks/useGigPayContracts';

export type OpsPaymentRow = {
  key: string;
  label: string;
  recipient: string;
  amount: string;
  asset: string;
  status: string;
  onchainIntentId: string;
};

const statusLabels = ['Created', 'Funded', 'Submitted', 'Released', 'Refunded', 'In Dispute'];

type Params = {
  enabled?: boolean;
  maxItems?: number;
};

export function useTreasuryOpsPaymentsFallback({ enabled = true, maxItems = 20 }: Params = {}) {
  const escrowCore = useEscrowCoreContract();

  const nextIntentId = useReadContract({
    address: escrowCore.address,
    abi: escrowCore.abi as any,
    functionName: 'nextIntentId',
    query: { enabled: enabled && Boolean(escrowCore.address && escrowCore.abi) },
  });

  const latestIntentId = Number(nextIntentId.data || 0);
  const intentIds = useMemo(() => {
    if (!latestIntentId || latestIntentId <= 1) return [];
    const start = Math.max(1, latestIntentId - maxItems);
    return Array.from({ length: latestIntentId - start }, (_, idx) => BigInt(latestIntentId - 1 - idx));
  }, [latestIntentId, maxItems]);

  const intentsRead = useReadContracts({
    contracts:
      enabled && escrowCore.address && escrowCore.abi && intentIds.length
        ? (intentIds.map((intentId) => ({
            address: escrowCore.address,
            abi: escrowCore.abi as any,
            functionName: 'intents',
            args: [intentId],
          })) as const)
        : [],
    query: { enabled: enabled && Boolean(escrowCore.address && escrowCore.abi && intentIds.length) },
  });

  const rows: OpsPaymentRow[] = useMemo(() => {
    return intentIds.map((intentId, idx) => {
      const result = intentsRead.data?.[idx]?.result as any;
      const status = typeof result?.status === 'number' ? statusLabels[result.status] || 'Unknown' : 'Unknown';
      const assetSymbol = getTokenSymbolByAddress(result?.asset);
      const to = result?.treasury ? `${result.treasury.slice(0, 6)}...${result.treasury.slice(-4)}` : '—';
      const amount = result?.amount ? result.amount.toString() : '—';
      const idStr = intentId.toString();
      return {
        key: idStr,
        label: `PI-${idStr}`,
        recipient: to,
        amount,
        asset: assetSymbol,
        status,
        onchainIntentId: idStr,
      };
    });
  }, [intentIds, intentsRead.data]);

  return {
    rows,
    isLoading: nextIntentId.isLoading || intentsRead.isLoading,
    error: (nextIntentId.error as any) || (intentsRead.error as any),
  };
}

