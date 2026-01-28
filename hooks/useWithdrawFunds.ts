import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { getTokenAddress, BaseVaultUpgradeableABI } from '../lib/abis';
import { getContractAddress } from '../lib/abis';
import { useYieldData } from './useYieldData';

export const useWithdrawFunds = () => {
    const { address: userAddress } = useAccount();
    const { writeContractAsync, isPending: isWritePending, error: writeError, reset: resetWrite } = useWriteContract();
    const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
        query: { enabled: !!hash },
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
            const txHash = await writeContractAsync({
                address: vaultAddress as `0x${string}`,
                abi: BaseVaultUpgradeableABI as any,
                functionName: 'withdraw',
                args: [parseUnits(amount, decimals), userAddress, userAddress],
                account: userAddress
            });
            setHash(txHash as `0x${string}`);
        } catch (error) {
            console.error("Withdraw Failed:", error);
        }
    };

    const handleMax = () => {
        // Set amount to the estimated Asset Value of their shares
        if (availableAssets) {
            // Keep this user-friendly; contract parsing happens at 18 decimals anyway.
            setAmount(availableAssets.toFixed(4));
        }
    };

    const reset = () => {
        setAmount('');
        setHash(undefined);
        resetWrite();
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
