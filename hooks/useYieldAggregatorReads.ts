import { useAccount, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import manifest from '../YieldModeABI/manifest.json';
import {
  BaseVaultUpgradeableABI,
  StrategyABI,
  getContractAddress,
  YieldOracleABI,
  getTokenSymbolByAddress,
} from '../lib/abis';
import MockIDRXAbi from '../abis/MockIDRX.abi.json';

const strategiesList = manifest.contracts.Strategies;

export type YieldAggregatorStrategy = {
  id: string;
  name: string;
  protocol: string;
  address: string;
  tokens: string[];
  wantAddress?: `0x${string}`;
  wantSymbol?: string;
  apy: number; // percent
  lastApy?: number; // percent (last reported)
  riskScore: number; // 1..10
  riskLevel: 'Low' | 'Medium' | 'High';
  confidenceBps?: number;

  // Vault-side params
  debt: number; // assets
  debtRatioBps: number;
  cap: number; // assets
  utilization: number; // 0..100
  lastReport?: number; // unix seconds
  totalGain?: number;
  totalLoss?: number;
  performanceFeeBps?: number;

  // Strategy-side
  estimatedTotalAssets: number;
  maxLiquidatable: number;
  withdrawableNow: number; // what the vault can realistically pull right now

  // Vault helpers
  debtOutstanding: number;
  creditAvailable: number;
};

export type YieldAggregatorReads = {
  vaultAddress?: `0x${string}`;
  oracleAddress?: `0x${string}`;
  assetAddress?: `0x${string}`;
  assetSymbol?: string;
  vaultIdleAssets: number; // ERC20 balance of vault (asset)
  userMaxWithdraw: number; // ERC4626 maxWithdraw(user)

  // Vault overview
  totalAssets: number;
  totalSupply: number;
  sharePrice: number;
  depositLimit?: number;
  emergencyShutdown?: boolean;

  // Rebalance controls / visibility
  minRebalanceInterval?: number; // seconds
  lastRebalance?: number; // unix seconds
  rebalanceThresholdBps?: number;
  autoRebalanceEnabled?: boolean;

  // APY
  netApy: number;

  // User position
  userShares: number;
  userAssets: number;

  // Admin role gating
  owner?: `0x${string}`;
  governance?: `0x${string}`;
  management?: `0x${string}`;
  isAdmin: boolean;

  // Ops/admin reads
  withdrawalQueue?: `0x${string}`[];
  shouldRebalance?: { ok: boolean; improvementBps: number };
  optimalAllocation?: { targets: `0x${string}`[]; allocBps: number[] };

  // Strategies
  strategies: YieldAggregatorStrategy[];

  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
};

const toLower = (a?: string) => (a || '').toLowerCase();

const parseTokensFromManifestName = (parsingName: string) => {
  const tokenMatch = parsingName.match(/_([A-Z]+)_([A-Z]+)$/);
  return tokenMatch ? [tokenMatch[1], tokenMatch[2]] : ['IDRX'];
};

const parseProtocolFromManifestName = (parsingName: string) => {
  // MockStrategyAaveV3_IDRX_WETH -> "Aave V3"
  try {
    const base = parsingName.replace('MockStrategy', '').split('_')[0];
    return base.replace(/([A-Z])/g, ' $1').trim();
  } catch {
    return 'Unknown';
  }
};

const riskLevelFromScore = (riskScore: number): 'Low' | 'Medium' | 'High' => {
  if (!Number.isFinite(riskScore) || riskScore <= 0) return 'Medium';
  if (riskScore <= 3) return 'Low';
  if (riskScore <= 6) return 'Medium';
  return 'High';
};

export const useYieldAggregatorReads = (): YieldAggregatorReads => {
  const { address: userAddress } = useAccount();

  const vaultAddress = getContractAddress('CompanyTreasuryVault') as `0x${string}` | undefined;
  const oracleAddress = getContractAddress('YieldOracle') as `0x${string}` | undefined;
  const idrxAddress = getContractAddress('MockIDRX') as `0x${string}` | undefined;

  const zeroAddress = '0x0000000000000000000000000000000000000000';

  const vaultContract = vaultAddress
    ? ({
        address: vaultAddress,
        abi: BaseVaultUpgradeableABI,
      } as const)
    : undefined;

  const oracleContract = oracleAddress
    ? ({
        address: oracleAddress,
        abi: YieldOracleABI,
      } as const)
    : undefined;

  const contracts: any[] = [];

  if (vaultContract) {
    // Vault core
    contracts.push({ ...vaultContract, functionName: 'totalAssets' }); // 0
    contracts.push({ ...vaultContract, functionName: 'totalSupply' }); // 1
    contracts.push({
      ...vaultContract,
      functionName: 'balanceOf',
      args: [userAddress || (zeroAddress as `0x${string}`)],
    }); // 2
    contracts.push({ ...vaultContract, functionName: 'decimals' }); // 3
    contracts.push({ ...vaultContract, functionName: 'asset' }); // 4
    contracts.push({
      ...vaultContract,
      functionName: 'maxWithdraw',
      args: [userAddress || (zeroAddress as `0x${string}`)],
    }); // 5

    if (idrxAddress) {
      contracts.push({
        address: idrxAddress,
        abi: MockIDRXAbi,
        functionName: 'balanceOf',
        args: [vaultAddress],
      }); // 6
    } else {
      // keep index stable
      contracts.push({
        address: zeroAddress as `0x${string}`,
        abi: MockIDRXAbi,
        functionName: 'balanceOf',
        args: [zeroAddress as `0x${string}`],
      }); // 6
    }

    // Vault extras
    contracts.push({ ...vaultContract, functionName: 'depositLimit' }); // 7
    contracts.push({ ...vaultContract, functionName: 'emergencyShutdown' }); // 8
    contracts.push({ ...vaultContract, functionName: 'withdrawalQueue' }); // 9
    contracts.push({ ...vaultContract, functionName: 'shouldRebalance' }); // 10
    contracts.push({ ...vaultContract, functionName: 'calculateOptimalAllocation' }); // 11

    // Role gating
    contracts.push({ ...vaultContract, functionName: 'owner' }); // 12
    contracts.push({ ...vaultContract, functionName: 'governance' }); // 13
    contracts.push({ ...vaultContract, functionName: 'management' }); // 14

    // Rebalance visibility
    contracts.push({ ...vaultContract, functionName: 'minRebalanceInterval' }); // 15
    contracts.push({ ...vaultContract, functionName: 'lastRebalance' }); // 16
    contracts.push({ ...vaultContract, functionName: 'rebalanceThreshold' }); // 17
    contracts.push({ ...vaultContract, functionName: 'autoRebalanceEnabled' }); // 18
  }

  const vaultCallsCount = contracts.length;

  // Strategy calls (per strategy)
  // We read both strategy-side and vault-side params for the strategy.
  strategiesList.forEach((strategy: any) => {
    const stratContract = { address: strategy.address as `0x${string}`, abi: StrategyABI } as const;
    contracts.push({ ...stratContract, functionName: 'strategyName' });
    contracts.push({ ...stratContract, functionName: 'want' });
    contracts.push({ ...stratContract, functionName: 'estimatedApy' });
    contracts.push({ ...stratContract, functionName: 'riskScore' });
    contracts.push({ ...stratContract, functionName: 'estimatedTotalAssets' });
    contracts.push({ ...stratContract, functionName: 'maxLiquidatable' });

    if (vaultContract) {
      contracts.push({ ...vaultContract, functionName: 'strategyParams', args: [strategy.address] });
      contracts.push({ ...vaultContract, functionName: 'debtOutstanding', args: [strategy.address] });
      contracts.push({ ...vaultContract, functionName: 'creditAvailable', args: [strategy.address] });
    }
  });

  const { data, isError, isLoading, refetch } = useReadContracts({
    contracts: contracts as any,
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 10_000,
    },
  });

  // Vault data
  const totalAssetsRaw = data?.[0]?.result as bigint | undefined;
  const totalSupplyRaw = data?.[1]?.result as bigint | undefined;
  const userSharesRaw = data?.[2]?.result as bigint | undefined;
  const vaultDecimals = (data?.[3]?.result as number | undefined) || 18;

  const assetAddress = data?.[4]?.result as `0x${string}` | undefined;
  const assetSymbol = assetAddress ? getTokenSymbolByAddress(assetAddress) : undefined;

  const userMaxWithdrawRaw = data?.[5]?.result as bigint | undefined;
  const vaultIdleRaw = data?.[6]?.result as bigint | undefined;

  const depositLimitRaw = data?.[7]?.result as bigint | undefined;
  const emergencyShutdown = data?.[8]?.result as boolean | undefined;
  const withdrawalQueue = data?.[9]?.result as `0x${string}`[] | undefined;

  const shouldRebalanceRaw = data?.[10]?.result as any;
  const optimalAllocationRaw = data?.[11]?.result as any;

  const owner = data?.[12]?.result as `0x${string}` | undefined;
  const governance = data?.[13]?.result as `0x${string}` | undefined;
  const management = data?.[14]?.result as `0x${string}` | undefined;

  const minRebalanceIntervalRaw = data?.[15]?.result as bigint | undefined;
  const lastRebalanceRaw = data?.[16]?.result as bigint | undefined;
  const rebalanceThresholdRaw = data?.[17]?.result as bigint | undefined;
  const autoRebalanceEnabled = data?.[18]?.result as boolean | undefined;

  // Price per share
  let sharePrice = 1.0;
  if (totalAssetsRaw && totalSupplyRaw && totalSupplyRaw > 0n) {
    const ta = parseFloat(formatUnits(totalAssetsRaw, 18));
    const ts = parseFloat(formatUnits(totalSupplyRaw, vaultDecimals));
    if (ts > 0) {
      sharePrice = ta / ts;
      // Heuristic: some mocks mix 18 vs 6 decimals (10^12 diff)
      if (sharePrice > 1_000_000) sharePrice = sharePrice / 1e12;
    }
  }

  const userAssetsRaw =
    userSharesRaw && totalAssetsRaw && totalSupplyRaw && totalSupplyRaw > 0n
      ? (userSharesRaw * totalAssetsRaw) / totalSupplyRaw
      : userSharesRaw || 0n;

  // Parse shouldRebalance and optimalAllocation safely
  const shouldRebalance =
    shouldRebalanceRaw && typeof shouldRebalanceRaw === 'object'
      ? {
          ok: !!shouldRebalanceRaw[0],
          improvementBps: Number(shouldRebalanceRaw[1] || 0n),
        }
      : undefined;

  const optimalAllocation =
    optimalAllocationRaw && typeof optimalAllocationRaw === 'object'
      ? {
          targets: (optimalAllocationRaw[0] || []) as `0x${string}`[],
          allocBps: ((optimalAllocationRaw[1] || []) as any[]).map((x) => Number(x)),
        }
      : undefined;

  // Strategy parsing
  const perStrategyCalls = vaultContract ? 9 : 6;
  const baseIndex = vaultCallsCount;

  const strategies: YieldAggregatorStrategy[] = strategiesList.map((strategy: any, i: number) => {
    const idx = baseIndex + i * perStrategyCalls;

    const name = (data?.[idx]?.result as string | undefined) || strategy.name;
    const wantAddress = data?.[idx + 1]?.result as `0x${string}` | undefined;
    const apyWad = data?.[idx + 2]?.result as bigint | undefined;
    const riskScoreRaw = data?.[idx + 3]?.result as bigint | undefined;
    const estimatedTotalAssetsRaw = data?.[idx + 4]?.result as bigint | undefined;
    const maxLiquidatableRaw = data?.[idx + 5]?.result as bigint | undefined;

    const strategyParams = vaultContract ? (data?.[idx + 6]?.result as any) : undefined;
    const debtOutstandingRaw = vaultContract ? (data?.[idx + 7]?.result as bigint | undefined) : undefined;
    const creditAvailableRaw = vaultContract ? (data?.[idx + 8]?.result as bigint | undefined) : undefined;

    const parsingName = strategy.name;
    const tokens = parseTokensFromManifestName(parsingName);
    const protocol = parseProtocolFromManifestName(parsingName);

    const apy = apyWad ? parseFloat(formatUnits(apyWad, 18)) * 100 : 0;
    const riskScore = riskScoreRaw ? Number(riskScoreRaw) : 0;
    const wantSymbol = wantAddress ? getTokenSymbolByAddress(wantAddress) : undefined;

    // Vault params tuple parsing (see BaseVaultUpgradeable.abi.json StrategyParams)
    const capRaw = strategyParams?.maxDebtPerHarvest as bigint | undefined;
    const debtRatioRaw = strategyParams?.debtRatio as bigint | undefined;
    const totalDebtRaw = strategyParams?.totalDebt as bigint | undefined;
    const lastReportRaw = strategyParams?.lastReport as bigint | undefined;
    const totalGainRaw = strategyParams?.totalGain as bigint | undefined;
    const totalLossRaw = strategyParams?.totalLoss as bigint | undefined;
    const performanceFeeRaw = strategyParams?.performanceFee as bigint | undefined;
    const lastApyRaw = strategyParams?.lastApy as bigint | undefined;

    const debt = totalDebtRaw ? parseFloat(formatUnits(totalDebtRaw, 18)) : 0;
    const cap = capRaw ? parseFloat(formatUnits(capRaw, 18)) : 0;
    const utilization = cap > 0 ? Math.min(100, Math.max(0, (debt / cap) * 100)) : 0;

    const estimatedTotalAssets = estimatedTotalAssetsRaw ? parseFloat(formatUnits(estimatedTotalAssetsRaw, 18)) : 0;
    const maxLiquidatable = maxLiquidatableRaw ? parseFloat(formatUnits(maxLiquidatableRaw, 18)) : 0;
    const debtOutstanding = debtOutstandingRaw ? parseFloat(formatUnits(debtOutstandingRaw, 18)) : 0;
    const creditAvailable = creditAvailableRaw ? parseFloat(formatUnits(creditAvailableRaw, 18)) : 0;

    // "Available" should represent what the vault can actually pull right now:
    // capped by what the strategy says is liquidatable, what it actually holds, and what it owes the vault.
    const owedOrDebt = debtOutstanding > 0 ? debtOutstanding : debt;
    const withdrawableNow = Math.max(0, Math.min(maxLiquidatable, estimatedTotalAssets, owedOrDebt));

    return {
      id: strategy.address,
      name,
      protocol,
      address: strategy.address,
      tokens,
      wantAddress,
      wantSymbol,
      apy,
      lastApy: lastApyRaw ? parseFloat(formatUnits(lastApyRaw, 18)) * 100 : undefined,
      riskScore,
      riskLevel: riskLevelFromScore(riskScore),
      estimatedTotalAssets,
      maxLiquidatable,
      withdrawableNow,
      debt,
      cap,
      utilization,
      debtRatioBps: debtRatioRaw ? Number(debtRatioRaw) : 0,
      lastReport: lastReportRaw ? Number(lastReportRaw) : undefined,
      totalGain: totalGainRaw ? parseFloat(formatUnits(totalGainRaw, 18)) : undefined,
      totalLoss: totalLossRaw ? parseFloat(formatUnits(totalLossRaw, 18)) : undefined,
      performanceFeeBps: performanceFeeRaw ? Number(performanceFeeRaw) : undefined,
      debtOutstanding,
      creditAvailable,
    };
  });

  // Net APY: debt-weighted across strategies (vault-side totalDebt)
  const totalDebt = strategies.reduce((acc, s) => acc + (s.debt || 0), 0);
  const netApy =
    totalDebt > 0
      ? strategies.reduce((acc, s) => acc + (s.apy || 0) * (s.debt / totalDebt), 0)
      : strategies.length > 0
        ? strategies.reduce((acc, s) => acc + (s.apy || 0), 0) / strategies.length
        : 0;

  const isAdmin =
    !!userAddress &&
    [owner, governance, management].some((a) => toLower(a) !== '' && toLower(a) === toLower(userAddress));

  return {
    vaultAddress,
    oracleAddress,
    assetAddress,
    assetSymbol,
    vaultIdleAssets: vaultIdleRaw ? parseFloat(formatUnits(vaultIdleRaw, 18)) : 0,
    userMaxWithdraw: userMaxWithdrawRaw ? parseFloat(formatUnits(userMaxWithdrawRaw, 18)) : 0,
    totalAssets: totalAssetsRaw ? parseFloat(formatUnits(totalAssetsRaw, 18)) : 0,
    totalSupply: totalSupplyRaw ? parseFloat(formatUnits(totalSupplyRaw, vaultDecimals)) : 0,
    sharePrice,
    depositLimit: depositLimitRaw ? parseFloat(formatUnits(depositLimitRaw, 18)) : undefined,
    emergencyShutdown,
    minRebalanceInterval: minRebalanceIntervalRaw ? Number(minRebalanceIntervalRaw) : undefined,
    lastRebalance: lastRebalanceRaw ? Number(lastRebalanceRaw) : undefined,
    rebalanceThresholdBps: rebalanceThresholdRaw ? Number(rebalanceThresholdRaw) : undefined,
    autoRebalanceEnabled,
    netApy,
    userShares: userSharesRaw ? parseFloat(formatUnits(userSharesRaw, vaultDecimals)) : 0,
    userAssets: userAssetsRaw ? parseFloat(formatUnits(userAssetsRaw, 18)) : 0,
    owner,
    governance,
    management,
    isAdmin,
    withdrawalQueue,
    shouldRebalance,
    optimalAllocation,
    strategies,
    isLoading,
    isError,
    refetch,
  };
};

