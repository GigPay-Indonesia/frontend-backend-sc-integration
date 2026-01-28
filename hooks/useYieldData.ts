import { useWriteContract } from 'wagmi';
import { StrategyABI } from '../lib/abis';
import { useYieldAggregatorReads } from './useYieldAggregatorReads';

// Backward-compatible wrapper used throughout the Treasury UI.
// This now returns a superset of the old fields.
export const useYieldData = () => {
    const reads = useYieldAggregatorReads();

    // Harvest Logic (permissionless per strategy)
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
        vaultAddress: reads.vaultAddress,
        oracleAddress: reads.oracleAddress,
        vaultIdleAssets: reads.vaultIdleAssets,
        userMaxWithdraw: reads.userMaxWithdraw,
        // legacy fields
        totalAssets: reads.totalAssets,
        totalSupply: reads.totalSupply,
        sharePrice: reads.sharePrice,
        userShares: reads.userShares,
        userAssets: reads.userAssets,
        strategies: reads.strategies,

        // new fields
        netApy: reads.netApy,
        depositLimit: reads.depositLimit,
        emergencyShutdown: reads.emergencyShutdown,
        minRebalanceInterval: reads.minRebalanceInterval,
        lastRebalance: reads.lastRebalance,
        rebalanceThresholdBps: reads.rebalanceThresholdBps,
        autoRebalanceEnabled: reads.autoRebalanceEnabled,
        withdrawalQueue: reads.withdrawalQueue,
        shouldRebalance: reads.shouldRebalance,
        optimalAllocation: reads.optimalAllocation,
        isAdmin: reads.isAdmin,
        owner: reads.owner,
        governance: reads.governance,
        management: reads.management,

        // actions
        harvestStrategy,

        // status
        isLoading: reads.isLoading,
        isError: reads.isError,
        refetch: reads.refetch,
    };
};
