import { useEffect, useMemo, useState } from 'react';
import { useChainId, usePublicClient } from 'wagmi';
import { parseAbiItem, formatUnits } from 'viem';
import { getContractAddress } from '../lib/abis';

export type YieldActivityType =
  | 'Deposit'
  | 'Withdraw'
  | 'Reported'
  | 'RebalanceInitiated'
  | 'RebalanceExecuted'
  | 'WithdrawalQueueUpdated'
  | 'EmergencyShutdownSet'
  | 'FeesMinted'
  | 'Claimed';

export type YieldActivityItem = {
  type: YieldActivityType;
  date: string; // YYYY-MM-DD
  timeAgo: string;
  details: string;
  status: 'Confirmed';
  txHash: `0x${string}`;
  blockNumber: bigint;
};

const toDateString = (tsSeconds: bigint) =>
  new Date(Number(tsSeconds) * 1000).toLocaleDateString('en-CA'); // YYYY-MM-DD

const timeAgo = (tsSeconds: bigint) => {
  const diff = Math.max(0, Date.now() - Number(tsSeconds) * 1000);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

type Params = {
  limit?: number;
  lookbackBlocks?: bigint;
  pollMs?: number;
};

export const useYieldAggregatorActivity = ({
  limit = 50,
  lookbackBlocks = 2_000_000n,
  pollMs = 10_000,
}: Params = {}) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const [items, setItems] = useState<YieldActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const vaultAddress = getContractAddress('CompanyTreasuryVault') as `0x${string}` | undefined;
  const faucetAddress = getContractAddress('GigPayFaucet') as `0x${string}` | undefined;

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
    const depositEvent = parseAbiItem(
      'event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)'
    );
    const withdrawEvent = parseAbiItem(
      'event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)'
    );
    const reportedEvent = parseAbiItem(
      'event Reported(address indexed strategy, uint256 gain, uint256 loss, uint256 debtPayment, uint256 newDebt)'
    );
    const rebalanceInitiatedEvent = parseAbiItem(
      'event RebalanceInitiated(address[] targets, uint256[] allocBps, uint256 improvementBps)'
    );
    const rebalanceExecutedEvent = parseAbiItem('event RebalanceExecuted(address indexed executor)');
    const queueEvent = parseAbiItem('event WithdrawalQueueUpdated(address[] queue)');
    const emergencyEvent = parseAbiItem('event EmergencyShutdownSet(bool active)');
    const feesEvent = parseAbiItem('event FeesMinted(address indexed rewards, uint256 feeShares, uint256 feeAssets)');
    const claimedEvent = parseAbiItem('event Claimed(address indexed user, address indexed token, uint256 amount)');

    return {
      depositEvent,
      withdrawEvent,
      reportedEvent,
      rebalanceInitiatedEvent,
      rebalanceExecutedEvent,
      queueEvent,
      emergencyEvent,
      feesEvent,
      claimedEvent,
    };
  }, []);

  useEffect(() => {
    if (!publicClient || !vaultAddress) {
      // avoid hanging forever in UI
      setIsLoading(false);
      setItems([]);
      return;
    }

    const fetch = async () => {
      setIsLoading(true);
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock > lookbackBlocks ? currentBlock - lookbackBlocks : 0n;
        const toBlock = currentBlock;

        const [
          depositLogs,
          withdrawLogs,
          reportedLogs,
          rebalanceInitiatedLogs,
          rebalanceExecutedLogs,
          queueLogs,
          emergencyLogs,
          feesLogs,
          claimedLogs,
        ] = await Promise.all([
          fetchLogsChunked({ address: vaultAddress, event: events.depositEvent, fromBlock, toBlock, maxLogs: limit * 4 }),
          fetchLogsChunked({ address: vaultAddress, event: events.withdrawEvent, fromBlock, toBlock, maxLogs: limit * 4 }),
          fetchLogsChunked({ address: vaultAddress, event: events.reportedEvent, fromBlock, toBlock, maxLogs: limit * 4 }),
          fetchLogsChunked({
            address: vaultAddress,
            event: events.rebalanceInitiatedEvent,
            fromBlock,
            toBlock,
            maxLogs: limit * 2,
          }),
          fetchLogsChunked({
            address: vaultAddress,
            event: events.rebalanceExecutedEvent,
            fromBlock,
            toBlock,
            maxLogs: limit * 2,
          }),
          fetchLogsChunked({ address: vaultAddress, event: events.queueEvent, fromBlock, toBlock, maxLogs: limit * 2 }),
          fetchLogsChunked({
            address: vaultAddress,
            event: events.emergencyEvent,
            fromBlock,
            toBlock,
            maxLogs: limit * 2,
          }),
          fetchLogsChunked({ address: vaultAddress, event: events.feesEvent, fromBlock, toBlock, maxLogs: limit * 2 }),
          faucetAddress
            ? fetchLogsChunked({ address: faucetAddress, event: events.claimedEvent, fromBlock, toBlock, maxLogs: limit * 2 })
            : Promise.resolve([]),
        ]);

        const allLogs: any[] = [
          ...depositLogs.map((l) => ({ kind: 'Deposit' as const, log: l })),
          ...withdrawLogs.map((l) => ({ kind: 'Withdraw' as const, log: l })),
          ...reportedLogs.map((l) => ({ kind: 'Reported' as const, log: l })),
          ...rebalanceInitiatedLogs.map((l) => ({ kind: 'RebalanceInitiated' as const, log: l })),
          ...rebalanceExecutedLogs.map((l) => ({ kind: 'RebalanceExecuted' as const, log: l })),
          ...queueLogs.map((l) => ({ kind: 'WithdrawalQueueUpdated' as const, log: l })),
          ...emergencyLogs.map((l) => ({ kind: 'EmergencyShutdownSet' as const, log: l })),
          ...feesLogs.map((l) => ({ kind: 'FeesMinted' as const, log: l })),
          ...claimedLogs.map((l) => ({ kind: 'Claimed' as const, log: l })),
        ];

        allLogs.sort((a, b) => Number(b.log.blockNumber - a.log.blockNumber));
        const top = allLogs.slice(0, limit);

        // Batch fetch block timestamps
        const uniqueBlocks = Array.from(new Set(top.map((x) => x.log.blockNumber.toString()))).map((s) => BigInt(s));
        const blocks = await Promise.all(uniqueBlocks.map((bn) => publicClient.getBlock({ blockNumber: bn })));
        const blockTs = new Map<string, bigint>();
        uniqueBlocks.forEach((bn, i) => blockTs.set(bn.toString(), blocks[i].timestamp));

        const fmtAddr = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;

        const nextItems: YieldActivityItem[] = top.map(({ kind, log }) => {
          const ts = blockTs.get(log.blockNumber.toString()) || 0n;
          const date = toDateString(ts);
          const ago = timeAgo(ts);

          let details = '';
          switch (kind as YieldActivityType) {
            case 'Deposit': {
              const assets = (log.args.assets || 0n) as bigint;
              const owner = log.args.owner as `0x${string}`;
              details = `+${formatUnits(assets, 18)} IDRX from ${fmtAddr(owner)}`;
              break;
            }
            case 'Withdraw': {
              const assets = (log.args.assets || 0n) as bigint;
              const receiver = log.args.receiver as `0x${string}`;
              details = `-${formatUnits(assets, 18)} IDRX to ${fmtAddr(receiver)}`;
              break;
            }
            case 'Reported': {
              const strategy = log.args.strategy as `0x${string}`;
              const gain = (log.args.gain || 0n) as bigint;
              const loss = (log.args.loss || 0n) as bigint;
              details = `Strategy ${fmtAddr(strategy)} reported gain ${formatUnits(gain, 18)} IDRX / loss ${formatUnits(
                loss,
                18
              )}`;
              break;
            }
            case 'RebalanceInitiated': {
              const improvementBps = (log.args.improvementBps || 0n) as bigint;
              details = `Rebalance initiated (+${(Number(improvementBps) / 100).toFixed(2)}% improvement)`;
              break;
            }
            case 'RebalanceExecuted': {
              const executor = log.args.executor as `0x${string}`;
              details = `Rebalance executed by ${fmtAddr(executor)}`;
              break;
            }
            case 'WithdrawalQueueUpdated': {
              const queue = (log.args.queue || []) as `0x${string}`[];
              details = `Queue updated (${queue.length} strategies)`;
              break;
            }
            case 'EmergencyShutdownSet': {
              const active = !!log.args.active;
              details = active ? 'Emergency shutdown enabled' : 'Emergency shutdown disabled';
              break;
            }
            case 'FeesMinted': {
              const feeAssets = (log.args.feeAssets || 0n) as bigint;
              details = `Fees minted: ${formatUnits(feeAssets, 18)} IDRX`;
              break;
            }
            case 'Claimed': {
              const user = log.args.user as `0x${string}`;
              const amount = (log.args.amount || 0n) as bigint;
              details = `Faucet claimed ${formatUnits(amount, 18)} IDRX by ${fmtAddr(user)}`;
              break;
            }
          }

          return {
            type: kind,
            date,
            timeAgo: ago,
            details,
            status: 'Confirmed',
            txHash: log.transactionHash as `0x${string}`,
            blockNumber: log.blockNumber,
          };
        });

        setItems(nextItems);
      } catch (e) {
        console.error('[useYieldAggregatorActivity] failed', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
    const id = setInterval(fetch, pollMs);
    return () => clearInterval(id);
  }, [publicClient, vaultAddress, faucetAddress, events, limit, lookbackBlocks, pollMs]);

  return { items, isLoading };
};

