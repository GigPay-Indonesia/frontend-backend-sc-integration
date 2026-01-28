import { useReadContracts, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import { BaseVaultUpgradeableABI, StrategyABI, getContractAddress } from '../lib/abis';
import manifest from '../YieldModeABI/manifest.json';

const strategiesList = manifest.contracts.Strategies;

export const useYieldData = () => {
    const { address: userAddress } = useAccount();
    const vaultAddress = getContractAddress('CompanyTreasuryVault');

    const vaultContract = {
        address: vaultAddress as `0x${string}`,
        abi: BaseVaultUpgradeableABI,
    } as const;

    // Build calls for Vault + All Strategies
    const contracts: any[] = [
        // Vault Data (Index 0-3)
        { ...vaultContract, functionName: 'totalAssets' },
        { ...vaultContract, functionName: 'totalSupply' },
        { ...vaultContract, functionName: 'balanceOf', args: [userAddress || '0x0000000000000000000000000000000000000000'] },
        { ...vaultContract, functionName: 'decimals' },
    ];

    // Append Strategy Calls (Index 3+)
    // For each strategy: Name, Assets, APY
    strategiesList.forEach(strategy => {
        const contract = { address: strategy.address as `0x${string}`, abi: StrategyABI } as const;
        contracts.push({ ...contract, functionName: 'strategyName' });
        contracts.push({ ...contract, functionName: 'estimatedTotalAssets' });
        contracts.push({ ...contract, functionName: 'estimatedApy' });
    });

    const { data, isError, isLoading, refetch } = useReadContracts({
        contracts: contracts as any,
        query: {
            enabled: !!vaultAddress,
            refetchInterval: 10000,
        }
    });

    // Parse Vault Data
    const totalAssets = data?.[0]?.result as bigint | undefined;
    const totalSupply = data?.[1]?.result as bigint | undefined;
    const userShares = data?.[2]?.result as bigint | undefined;
    const vaultDecimals = data?.[3]?.result as number | undefined;

    console.log('[useYieldData] Raw Vault Data:', {
        totalAssets: totalAssets?.toString(),
        totalSupply: totalSupply?.toString(),
        userShares: userShares?.toString(),
        vaultDecimals,
    });

    // Parse Strategy Data
    const strategiesData = strategiesList.map((strategy, index) => {
        const baseIndex = 4 + (index * 3); // Shifted by 1 due to decimals call
        const name = data?.[baseIndex]?.result as string;
        const assets = data?.[baseIndex + 1]?.result as bigint;
        const apy = data?.[baseIndex + 2]?.result as bigint;

        // Use Manifest Name for parsing metadata (Protocol, Tokens) to ensure consistency
        // Contract name might be just "MockStrategy" or "Strategy" which breaks parsing
        const parsingName = strategy.name;

        // Parse tokens from name (e.g., MockStrategyAaveV3_IDRX_WETH -> [IDRX, WETH])
        const tokenMatch = parsingName.match(/_([A-Z]+)_([A-Z]+)$/);
        const tokens = tokenMatch ? [tokenMatch[1], tokenMatch[2]] : ['IDRX']; // Default to IDRX if no pair found

        return {
            id: strategy.address,
            name: name || parsingName, // Use contract name if active, else manifest
            protocol: parsingName ? parsingName.replace('MockStrategy', '').split('_')[0].replace(/([A-Z])/g, ' $1').trim() : 'Unknown', // e.g. "Aave V3"
            address: strategy.address,
            tokens, // New field for UI
            debt: assets ? parseFloat(formatUnits(assets, 18)) : 0,
            apy: apy ? parseFloat(formatUnits(apy, 18)) * 100 : 0,
            risk: 'Low',
            status: 'Active',
            debtMethod: 'Linear',
            cap: 0,
            utilization: 0,
            harvested: 0,
            performance: []
        };
    });

    // Share Price & User Assets Logic matches previous
    let sharePrice = 1.0;
    // Default to 18 if decimals not fetched yet, but ideally use vaultDecimals
    const vDecimals = vaultDecimals || 18;

    if (totalAssets && totalSupply && totalSupply > 0n) {
        const ta = parseFloat(formatUnits(totalAssets, 18)); // Assets are IDRX (18)
        const ts = parseFloat(formatUnits(totalSupply, vDecimals)); // Shares use local decimals
        if (ts > 0) {
            sharePrice = ta / ts;
            // Heuristic Fix for 18 vs 6 Decimal Mismatch in Mock Contract
            // If Price is > 1M, it likely used 6 decimals for supply but 18 for assets (10^12 diff)
            if (sharePrice > 1_000_000) {
                sharePrice = sharePrice / 1e12;
            }
        }
    }

    const userAssetsVal = userShares && totalAssets && totalSupply && totalSupply > 0n
        ? (userShares * totalAssets) / totalSupply
        : (userShares || 0n);

    // Harvest Logic
    const { writeContractAsync } = useWriteContract();

    const harvestStrategy = async (strategyAddress: string) => {
        try {
            const tx = await writeContractAsync({
                address: strategyAddress as `0x${string}`,
                abi: StrategyABI,
                functionName: 'harvest',
                args: [],
            } as any);
            return tx;
        } catch (err) {
            console.error("Harvest Failed:", err);
            throw err;
        }
    };

    return {
        totalAssets: totalAssets ? parseFloat(formatUnits(totalAssets, 18)) : 0,
        totalSupply: totalSupply ? parseFloat(formatUnits(totalSupply, vDecimals)) : 0,
        sharePrice,
        userShares: userShares ? parseFloat(formatUnits(userShares, vDecimals)) : 0,
        userAssets: userAssetsVal ? parseFloat(formatUnits(userAssetsVal, 18)) : 0,
        strategies: strategiesData,
        harvestStrategy,
        isLoading,
        isError,
        refetch
    };
};
