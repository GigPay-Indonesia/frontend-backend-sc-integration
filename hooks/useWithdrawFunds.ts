import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { getTokenAddress, BaseVaultUpgradeableABI } from '../lib/abis';
import { getContractAddress } from '../lib/abis';
import { useYieldData } from './useYieldData';

export const useWithdrawFunds = () => {
    const { address: userAddress } = useAccount();
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('IDRX'); // Default to IDRX
    const [isModalOpen, setIsModalOpen] = useState(false);

    const vaultAddress = getContractAddress('CompanyTreasuryVault');
    const tokenAddress = getTokenAddress('IDRX');

    // Use shared hook to get Real Asset Balance (User's Share Value in IDRX)
    const { userAssets: availableAssets, userShares, isLoading: isDataLoading } = useYieldData();

    // We use 'availableAssets' (approx IDRX value) as the "Useable Balance".
    // This allows the user to think in "IDRX" rather than "Shares".

    const decimals = 18; // IDRX (Mock is 18 decimals)

    const handleWithdraw = async () => {
        if (!amount || !vaultAddress) return;

        try {
            // @ts-ignore
            writeContract({
                address: vaultAddress as `0x${string}`,
                abi: BaseVaultUpgradeableABI as any,
                functionName: 'withdraw',
                args: [parseUnits(amount, decimals), userAddress, userAddress],
                account: userAddress
            });
        } catch (error) {
            console.error("Withdraw Failed:", error);
        }
    };

    const handleMax = () => {
        // Set amount to the estimated Asset Value of their shares
        if (availableAssets) {
            setAmount(availableAssets.toFixed(decimals)); // Ensure we don't exceed decimals
        }
    };

    const reset = () => {
        setAmount('');
        setIsModalOpen(false);
    };

    return {
        amount,
        setAmount,
        selectedToken,
        setSelectedToken,
        availableTokens: ['IDRX', 'USDC', 'USDT', 'DAI', 'EURC'],
        isModalOpen,
        setIsModalOpen,
        handleWithdraw,
        handleMax,
        formattedBalance: availableAssets ? availableAssets.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0.00',
        isLoading: isWritePending || isConfirming || isDataLoading,
        isSuccess: isConfirmed,
        hash,
        error: writeError,
        reset,
        isSupported: selectedToken === 'IDRX'
    };
};
