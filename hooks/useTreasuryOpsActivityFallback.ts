import { useEffect, useMemo, useState } from 'react';
import { useChainId, usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
import { useEscrowCoreContract, useTreasuryVaultContract } from '@/lib/hooks/useGigPayContracts';

export type TreasuryOpsFallbackActivityItem = {
  id: string;
  source: 'TREASURY' | 'ESCROW';
  eventName: string;
  txHash: `0x${string}`;
  blockNumber: bigint;
  logIndex: number;
  onchainIntentId?: string;
  asset?: `0x${string}`;
  amount?: string;
  timestamp?: string;
};

type Params = {
  enabled?: boolean;
  limit?: number;
  lookbackBlocks?: bigint;
  pollMs?: number;
};

export function useTreasuryOpsActivityFallback({
  enabled = true,
  limit = 100,
  lookbackBlocks = 400_000n,
  pollMs = 15_000,
}: Params = {}) {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const escrowCore = useEscrowCoreContract();
  const treasuryVault = useTreasuryVaultContract();

  const [rows, setRows] = useState<TreasuryOpsFallbackActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogsChunked = async (params: {
    address: `0x${string}`;
    event: any;
    fromBlock: bigint;
    toBlock: bigint;
    chunkSize?: bigint;
    maxLogs?: number;
  }) => {
    const { address, event, fromBlock, toBlock, chunkSize = 50_000n, maxLogs = 2_000 } = params;
    const logs: any[] = [];
    let start = fromBlock;
    while (start <= toBlock) {
      const end = start + chunkSize - 1n > toBlock ? toBlock : start + chunkSize - 1n;
      // eslint-disable-next-line no-await-in-loop
      const chunk = await publicClient!.getLogs({ address, event, fromBlock: start, toBlock: end });
      logs.push(...chunk);
      if (logs.length >= maxLogs) break;
      start = end + 1n;
    }
    return logs;
  };

  const events = useMemo(() => {
    // Treasury vault
    const escrowFunded = parseAbiItem(
      'event EscrowFunded(address indexed escrow, uint256 indexed intentId, address indexed asset, uint256 amount)'
    );
    const refundReceived = parseAbiItem(
      'event RefundReceived(address indexed escrow, uint256 indexed intentId, address indexed asset, uint256 amount)'
    );
    const treasuryYieldDeposited = parseAbiItem(
      'event TreasuryYieldDeposited(address indexed asset, uint32 strategyId, uint256 amount, uint256 shares)'
    );
    const treasuryYieldWithdrawn = parseAbiItem(
      'event TreasuryYieldWithdrawn(address indexed asset, uint32 strategyId, uint256 shares, uint256 assetsOut)'
    );

    // Escrow core
    const intentCreated = parseAbiItem(
      'event IntentCreated(uint256 indexed intentId, address indexed treasury, address indexed asset, uint256 amount)'
    );
    const funded = parseAbiItem('event Funded(uint256 indexed intentId, address indexed treasury, uint256 amount)');
    const submitted = parseAbiItem('event Submitted(uint256 indexed intentId, bytes32 evidenceHash)');
    const released = parseAbiItem(
      'event Released(uint256 indexed intentId, uint256 principalPaid, uint256 yieldPaid, uint256 protectionExtra)'
    );
    const refunded = parseAbiItem(
      'event Refunded(uint256 indexed intentId, uint256 principalReturned, uint256 yieldReturned, uint256 protectionExtraReturned)'
    );
    const escrowYieldOn = parseAbiItem('event EscrowYieldOn(uint256 indexed intentId, uint32 strategyId, uint256 shares)');

    return {
      escrowFunded,
      refundReceived,
      treasuryYieldDeposited,
      treasuryYieldWithdrawn,
      intentCreated,
      funded,
      submitted,
      released,
      refunded,
      escrowYieldOn,
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      setRows([]);
      setError(null);
      return;
    }
    if (!publicClient || !treasuryVault.address || !escrowCore.address) {
      setIsLoading(false);
      setRows([]);
      setError(null);
      return;
    }

    let mounted = true;

    const fetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock > lookbackBlocks ? currentBlock - lookbackBlocks : 0n;
        const toBlock = currentBlock;

        const [treasuryEscrowFunded, treasuryRefund, treasuryYieldDep, treasuryYieldWdr] = await Promise.all([
          fetchLogsChunked({
            address: treasuryVault.address,
            event: events.escrowFunded,
            fromBlock,
            toBlock,
            maxLogs: limit * 4,
          }),
          fetchLogsChunked({
            address: treasuryVault.address,
            event: events.refundReceived,
            fromBlock,
            toBlock,
            maxLogs: limit * 4,
          }),
          fetchLogsChunked({
            address: treasuryVault.address,
            event: events.treasuryYieldDeposited,
            fromBlock,
            toBlock,
            maxLogs: limit * 4,
          }),
          fetchLogsChunked({
            address: treasuryVault.address,
            event: events.treasuryYieldWithdrawn,
            fromBlock,
            toBlock,
            maxLogs: limit * 4,
          }),
        ]);

        const escrowLogs = await Promise.all([
          fetchLogsChunked({
            address: escrowCore.address,
            event: events.intentCreated,
            fromBlock,
            toBlock,
            maxLogs: limit * 4,
          }),
          fetchLogsChunked({
            address: escrowCore.address,
            event: events.funded,
            fromBlock,
            toBlock,
            maxLogs: limit * 4,
          }),
          fetchLogsChunked({
            address: escrowCore.address,
            event: events.submitted,
            fromBlock,
            toBlock,
            maxLogs: limit * 4,
          }),
          fetchLogsChunked({
            address: escrowCore.address,
            event: events.released,
            fromBlock,
            toBlock,
            maxLogs: limit * 4,
          }),
          fetchLogsChunked({
            address: escrowCore.address,
            event: events.refunded,
            fromBlock,
            toBlock,
            maxLogs: limit * 4,
          }),
          fetchLogsChunked({
            address: escrowCore.address,
            event: events.escrowYieldOn,
            fromBlock,
            toBlock,
            maxLogs: limit * 4,
          }),
        ]);

        const [
          intentCreatedLogs,
          fundedLogs,
          submittedLogs,
          releasedLogs,
          refundedLogs,
          escrowYieldOnLogs,
        ] = escrowLogs;

        const all: Array<{ source: 'TREASURY' | 'ESCROW'; eventName: string; log: any }> = [
          ...treasuryEscrowFunded.map((log) => ({ source: 'TREASURY' as const, eventName: 'EscrowFunded', log })),
          ...treasuryRefund.map((log) => ({ source: 'TREASURY' as const, eventName: 'RefundReceived', log })),
          ...treasuryYieldDep.map((log) => ({ source: 'TREASURY' as const, eventName: 'TreasuryYieldDeposited', log })),
          ...treasuryYieldWdr.map((log) => ({ source: 'TREASURY' as const, eventName: 'TreasuryYieldWithdrawn', log })),
          ...intentCreatedLogs.map((log) => ({ source: 'ESCROW' as const, eventName: 'IntentCreated', log })),
          ...fundedLogs.map((log) => ({ source: 'ESCROW' as const, eventName: 'Funded', log })),
          ...submittedLogs.map((log) => ({ source: 'ESCROW' as const, eventName: 'Submitted', log })),
          ...releasedLogs.map((log) => ({ source: 'ESCROW' as const, eventName: 'Released', log })),
          ...refundedLogs.map((log) => ({ source: 'ESCROW' as const, eventName: 'Refunded', log })),
          ...escrowYieldOnLogs.map((log) => ({ source: 'ESCROW' as const, eventName: 'EscrowYieldOn', log })),
        ];

        all.sort((a, b) => Number(b.log.blockNumber - a.log.blockNumber));
        const top = all.slice(0, limit);

        // timestamps for visible rows only
        const uniq = Array.from(new Set(top.map((x) => x.log.blockNumber.toString()))).map((s) => BigInt(s));
        const blocks = await Promise.all(uniq.map((bn) => publicClient.getBlock({ blockNumber: bn })));
        const tsMap = new Map<string, string>();
        uniq.forEach((bn, i) => tsMap.set(bn.toString(), new Date(Number(blocks[i].timestamp) * 1000).toISOString()));

        const nextRows: TreasuryOpsFallbackActivityItem[] = top.map(({ source, eventName, log }) => {
          const txHash = log.transactionHash as `0x${string}`;
          const logIndex = Number(log.logIndex || 0);
          const id = `${source}-${txHash}-${logIndex}`;
          const intentId = (log.args?.intentId ?? log.args?.intentId) as bigint | undefined;
          const asset = (log.args?.asset ?? log.args?.asset) as `0x${string}` | undefined;
          const amount = (log.args?.amount ?? log.args?.assetsOut) as bigint | undefined;
          const ts = tsMap.get(log.blockNumber.toString());

          return {
            id,
            source,
            eventName,
            txHash,
            blockNumber: log.blockNumber as bigint,
            logIndex,
            onchainIntentId: typeof intentId === 'bigint' ? intentId.toString() : undefined,
            asset,
            amount: typeof amount === 'bigint' ? amount.toString() : undefined,
            timestamp: ts,
          };
        });

        if (!mounted) return;
        setRows(nextRows);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load on-chain activity.');
        setRows([]);
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    fetch();
    const id = window.setInterval(fetch, pollMs);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [
    enabled,
    publicClient,
    treasuryVault.address,
    escrowCore.address,
    events,
    limit,
    lookbackBlocks,
    pollMs,
  ]);

  return { rows, isLoading, error };
}

