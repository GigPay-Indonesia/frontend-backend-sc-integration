import { useEffect, useMemo, useState } from 'react';
import { useChainId, usePublicClient, useReadContracts } from 'wagmi';
import { formatUnits, parseAbiItem } from 'viem';
import { getTokenAddress } from '@/lib/abis';
import { useEscrowCoreContract, useThetanutsStrategyContract, useTokenRegistryContract, useTreasuryVaultContract } from '@/lib/hooks/useGigPayContracts';

const ERC20_BALANCE_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

type TokenRow = {
  symbol: string;
  tokenAddress: `0x${string}`;
  decimals: number;
};

export type TreasuryOpsFallbackTotals = {
  idle: string;
  yieldDeployed: string;
  escrowLocked: string;
  total: string;
};

export type TreasuryOpsFallbackPerAssetRow = {
  symbol: string;
  tokenAddress: string;
  idle: string;
  yieldDeployed: string;
  escrowLocked: string;
  total: string;
};

type Params = {
  enabled?: boolean;
  lookbackBlocks?: bigint;
  pollMs?: number;
  tokenSymbols?: string[];
};

const sumBigints = (xs: bigint[]) => xs.reduce((a, b) => a + b, 0n);

export function useTreasuryOpsFallback({
  enabled = true,
  lookbackBlocks = 400_000n,
  pollMs = 20_000,
  tokenSymbols = ['IDRX', 'USDC', 'USDT', 'DAI', 'EURC'],
}: Params = {}) {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const treasuryVault = useTreasuryVaultContract();
  const escrowCore = useEscrowCoreContract();
  const tokenRegistry = useTokenRegistryContract();
  const strategy = useThetanutsStrategyContract();

  const [yieldAssetsByToken, setYieldAssetsByToken] = useState<Record<string, bigint>>({});
  const [escrowLockedByToken, setEscrowLockedByToken] = useState<Record<string, bigint>>({});
  const [isLoadingExtra, setIsLoadingExtra] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tokens = useMemo((): TokenRow[] => {
    return tokenSymbols
      .map((symbol) => {
        const tokenAddress = getTokenAddress(symbol, chainId) as `0x${string}` | undefined;
        if (!tokenAddress) return null;
        return { symbol, tokenAddress, decimals: 18 };
      })
      .filter(Boolean) as TokenRow[];
  }, [tokenSymbols, chainId]);

  const tokenConfigReads = useReadContracts({
    contracts:
      enabled && tokenRegistry.address && tokenRegistry.abi
        ? (tokens.map((t) => ({
            address: tokenRegistry.address,
            abi: tokenRegistry.abi as any,
            functionName: 'tokenConfig',
            args: [t.tokenAddress],
          })) as const)
        : [],
    query: { enabled: enabled && !!tokenRegistry.address && !!tokenRegistry.abi && tokens.length > 0 },
  });

  const tokensWithDecimals = useMemo(() => {
    const out: TokenRow[] = [];
    tokens.forEach((t, idx) => {
      const cfg: any = tokenConfigReads.data?.[idx]?.result;
      const dec = typeof cfg?.decimals === 'number' ? cfg.decimals : 18;
      out.push({ ...t, decimals: dec });
    });
    return out;
  }, [tokens, tokenConfigReads.data]);

  const idleReads = useReadContracts({
    contracts:
      enabled && treasuryVault.address
        ? (tokensWithDecimals.map((t) => ({
            address: t.tokenAddress,
            abi: ERC20_BALANCE_ABI,
            functionName: 'balanceOf',
            args: [treasuryVault.address],
          })) as const)
        : [],
    query: { enabled: enabled && !!treasuryVault.address && tokensWithDecimals.length > 0, refetchInterval: pollMs },
  });

  const yieldSharesReads = useReadContracts({
    contracts:
      enabled && treasuryVault.address && treasuryVault.abi
        ? (tokensWithDecimals.map((t) => ({
            address: treasuryVault.address,
            abi: treasuryVault.abi as any,
            functionName: 'yieldShares',
            args: [t.tokenAddress],
          })) as const)
        : [],
    query: { enabled: enabled && !!treasuryVault.address && !!treasuryVault.abi && tokensWithDecimals.length > 0, refetchInterval: pollMs },
  });

  const fetchLogsChunked = async (params: {
    address: `0x${string}`;
    event: any;
    fromBlock: bigint;
    toBlock: bigint;
    chunkSize?: bigint;
    maxLogs?: number;
  }) => {
    const { address, event, fromBlock, toBlock, chunkSize = 50_000n, maxLogs = 4_000 } = params;
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

  useEffect(() => {
    if (!enabled) {
      setYieldAssetsByToken({});
      setEscrowLockedByToken({});
      setIsLoadingExtra(false);
      setError(null);
      return;
    }
    if (!publicClient || !strategy.address || !strategy.abi || !treasuryVault.address) {
      setIsLoadingExtra(false);
      return;
    }
    if (!escrowCore.address) {
      setIsLoadingExtra(false);
      return;
    }

    let mounted = true;

    const run = async () => {
      setIsLoadingExtra(true);
      setError(null);
      try {
        // Yield assets conversion (best-effort): simulate redeem(shares) for each asset.
        const shares = tokensWithDecimals.map((t, idx) => ({
          token: t,
          shares: (yieldSharesReads.data?.[idx]?.result as bigint | undefined) || 0n,
        }));

        const yieldPairs = await Promise.all(
          shares.map(async ({ token, shares }) => {
            if (shares === 0n) return [token.symbol, 0n] as const;
            try {
              const sim = await publicClient.simulateContract({
                address: strategy.address,
                abi: strategy.abi as any,
                functionName: 'redeem',
                args: [token.tokenAddress, shares],
                account: treasuryVault.address,
              });
              const assetsOut = (sim.result as any) as bigint;
              return [token.symbol, typeof assetsOut === 'bigint' ? assetsOut : 0n] as const;
            } catch {
              try {
                const value = await publicClient.readContract({
                  address: strategy.address,
                  abi: strategy.abi as any,
                  functionName: 'totalValue',
                  args: [token.tokenAddress],
                });
                return [token.symbol, (value as bigint) || 0n] as const;
              } catch {
                return [token.symbol, 0n] as const;
              }
            }
          })
        );

        // Escrow locked approximation from recent logs
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock > lookbackBlocks ? currentBlock - lookbackBlocks : 0n;
        const toBlock = currentBlock;

        const intentCreated = parseAbiItem(
          'event IntentCreated(uint256 indexed intentId, address indexed treasury, address indexed asset, uint256 amount)'
        );
        const funded = parseAbiItem('event Funded(uint256 indexed intentId, address indexed treasury, uint256 amount)');
        const released = parseAbiItem(
          'event Released(uint256 indexed intentId, uint256 principalPaid, uint256 yieldPaid, uint256 protectionExtra)'
        );
        const refunded = parseAbiItem(
          'event Refunded(uint256 indexed intentId, uint256 principalReturned, uint256 yieldReturned, uint256 protectionExtraReturned)'
        );

        const [createdLogs, fundedLogs, releasedLogs, refundedLogs] = await Promise.all([
          fetchLogsChunked({ address: escrowCore.address, event: intentCreated, fromBlock, toBlock, maxLogs: 4_000 }),
          fetchLogsChunked({ address: escrowCore.address, event: funded, fromBlock, toBlock, maxLogs: 4_000 }),
          fetchLogsChunked({ address: escrowCore.address, event: released, fromBlock, toBlock, maxLogs: 4_000 }),
          fetchLogsChunked({ address: escrowCore.address, event: refunded, fromBlock, toBlock, maxLogs: 4_000 }),
        ]);

        const byId = new Map<string, { treasury?: string; asset?: `0x${string}`; createdAmount?: bigint; fundedAmount?: bigint }>();
        for (const log of createdLogs) {
          const id = (log.args?.intentId as bigint | undefined)?.toString();
          if (!id) continue;
          byId.set(id, {
            treasury: log.args?.treasury as string | undefined,
            asset: log.args?.asset as `0x${string}` | undefined,
            createdAmount: (log.args?.amount as bigint | undefined) || 0n,
          });
        }
        for (const log of fundedLogs) {
          const id = (log.args?.intentId as bigint | undefined)?.toString();
          if (!id) continue;
          const prev = byId.get(id) || {};
          byId.set(id, { ...prev, treasury: (log.args?.treasury as string | undefined) || prev.treasury, fundedAmount: (log.args?.amount as bigint | undefined) || 0n });
        }
        const closed = new Set<string>();
        for (const log of releasedLogs) {
          const id = (log.args?.intentId as bigint | undefined)?.toString();
          if (id) closed.add(id);
        }
        for (const log of refundedLogs) {
          const id = (log.args?.intentId as bigint | undefined)?.toString();
          if (id) closed.add(id);
        }

        const lockedByAsset = new Map<string, bigint>();
        for (const [id, row] of byId.entries()) {
          if (closed.has(id)) continue;
          if (!row.treasury || row.treasury.toLowerCase() !== treasuryVault.address.toLowerCase()) continue;
          if (!row.asset) continue;
          const fundedAmt = row.fundedAmount ?? 0n;
          if (fundedAmt === 0n) continue; // not funded yet
          const key = row.asset.toLowerCase();
          lockedByAsset.set(key, (lockedByAsset.get(key) || 0n) + fundedAmt);
        }

        const escrowPairs = tokensWithDecimals.map((t) => {
          const key = t.tokenAddress.toLowerCase();
          return [t.symbol, lockedByAsset.get(key) || 0n] as const;
        });

        if (!mounted) return;
        setYieldAssetsByToken(Object.fromEntries(yieldPairs));
        setEscrowLockedByToken(Object.fromEntries(escrowPairs));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to compute on-chain fallback totals.');
        setYieldAssetsByToken({});
        setEscrowLockedByToken({});
      } finally {
        if (!mounted) return;
        setIsLoadingExtra(false);
      }
    };

    run();
    const id = window.setInterval(run, pollMs);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    publicClient,
    strategy.address,
    strategy.abi,
    treasuryVault.address,
    escrowCore.address,
    lookbackBlocks,
    pollMs,
    tokensWithDecimals.map((t) => t.tokenAddress).join(','),
    yieldSharesReads.data,
  ]);

  const perAsset: TreasuryOpsFallbackPerAssetRow[] = useMemo(() => {
    return tokensWithDecimals.map((t, idx) => {
      const idleRaw = (idleReads.data?.[idx]?.result as bigint | undefined) || 0n;
      const yieldRaw = yieldAssetsByToken[t.symbol] || 0n;
      const escrowRaw = escrowLockedByToken[t.symbol] || 0n;
      const totalRaw = idleRaw + yieldRaw + escrowRaw;

      return {
        symbol: t.symbol,
        tokenAddress: t.tokenAddress,
        idle: formatUnits(idleRaw, t.decimals),
        yieldDeployed: formatUnits(yieldRaw, t.decimals),
        escrowLocked: formatUnits(escrowRaw, t.decimals),
        total: formatUnits(totalRaw, t.decimals),
      };
    });
  }, [tokensWithDecimals, idleReads.data, yieldAssetsByToken, escrowLockedByToken]);

  const totals: TreasuryOpsFallbackTotals = useMemo(() => {
    const idle = sumBigints(tokensWithDecimals.map((t, idx) => (idleReads.data?.[idx]?.result as bigint | undefined) || 0n));
    const yieldDeployed = sumBigints(tokensWithDecimals.map((t) => yieldAssetsByToken[t.symbol] || 0n));
    const escrowLocked = sumBigints(tokensWithDecimals.map((t) => escrowLockedByToken[t.symbol] || 0n));
    const total = idle + yieldDeployed + escrowLocked;

    // For combined totals we stick to 18 decimals (Ops UI uses coarse numeric formatting).
    return {
      idle: formatUnits(idle, 18),
      yieldDeployed: formatUnits(yieldDeployed, 18),
      escrowLocked: formatUnits(escrowLocked, 18),
      total: formatUnits(total, 18),
    };
  }, [tokensWithDecimals, idleReads.data, yieldAssetsByToken, escrowLockedByToken]);

  const isLoading =
    enabled &&
    (tokenConfigReads.isLoading || idleReads.isLoading || yieldSharesReads.isLoading || isLoadingExtra);

  const combinedError =
    (tokenConfigReads.error as any)?.message ||
    (idleReads.error as any)?.message ||
    (yieldSharesReads.error as any)?.message ||
    error;

  return { totals, perAsset, isLoading, error: combinedError || null };
}

