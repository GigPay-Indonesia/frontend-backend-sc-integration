import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract, useBalance } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { BaseVaultUpgradeableABI, MockUSDCABI } from '../lib/abis';
import { getContractAddress, getTokenAddress } from '../lib/abis';

// Mock Dead Address for "Burning" during Zap
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';

export const useAddFunds = () => {
    const { address: userAddress } = useAccount();
    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('IDRX'); // Default to IDRX
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Status for Zap Flow: 'idle' | 'burning' | 'minting' | 'approving' | 'depositing' | 'success'
    const [zapStatus, setZapStatus] = useState('idle');

    const vaultAddress = getContractAddress('CompanyTreasuryVault');
    const idrxAddress = getTokenAddress('IDRX');
    const tokenAddress = getTokenAddress(selectedToken);

    // 1. Read Balance of Selected Token
    const { data: balanceData, refetch: refetchBalance } = useBalance({
        address: userAddress,
        token: tokenAddress as `0x${string}`,
        query: {
            enabled: !!userAddress && !!tokenAddress,
            refetchInterval: 2000, // Poll every 2s for real-time updates
        }
    });


    // 2. Read Allowance (Selected Token -> Vault) -- Not used for Zap, we transfer directly? 
    // Actually for Zap: 
    // Step 1: Transfer Token -> Dead (Burn)
    // Step 2: Mint IDRX -> User
    // Step 3: Approve IDRX -> Vault
    // Step 4: Deposit IDRX -> Vault

    // Check IDRX Allowance for Vault (Step 3 check)
    const { data: idrxAllowance, refetch: refetchIdrxAllowance } = useReadContract({
        address: idrxAddress as `0x${string}`,
        abi: MockUSDCABI, // ERC20 Standard
        functionName: 'allowance',
        args: [userAddress, vaultAddress],
        query: { enabled: !!userAddress && !!vaultAddress && !!idrxAddress }
    });

    // Force 18 decimals for IDRX, otherwise use contract decimals
    const decimals = selectedToken === 'IDRX' ? 18 : (balanceData?.decimals || 18);

    console.log('[useAddFunds] Debug:', {
        selectedToken,
        balanceRaw: balanceData?.value,
        balanceFormatted: balanceData?.value ? formatUnits(balanceData.value, decimals) : undefined,
        decimals
    });

    const parsedAmount = amount ? parseUnits(amount, decimals) : BigInt(0);

    // Standard IDRX Flow Checks
    const hasIdrxAllowance = idrxAllowance ? (idrxAllowance as bigint) >= parsedAmount : false;

    // Write Contract
    const { writeContractAsync, isPending: isWritePending, reset: resetWrite } = useWriteContract();

    // Reset status when modal closes or token changes
    useEffect(() => {
        setZapStatus('idle');
    }, [isModalOpen, selectedToken]);

    const handleAddFunds = async () => {
        if (!amount || !vaultAddress || !tokenAddress || !userAddress || !idrxAddress) return;

        try {
            if (selectedToken === 'IDRX') {
                // --- STANDARD IDRX FLOW ---
                if (!hasIdrxAllowance) {
                    setZapStatus('approving');
                    // @ts-ignore
                    await writeContractAsync({
                        address: idrxAddress as `0x${string}`,
                        abi: MockUSDCABI as any,
                        functionName: 'approve',
                        args: [vaultAddress as `0x${string}`, parsedAmount],
                        account: userAddress
                    });
                    await refetchIdrxAllowance();
                    await refetchBalance();
                    setZapStatus('idle'); // Back to idle to let user click "Deposit"
                } else {
                    setZapStatus('depositing');
                    // @ts-ignore
                    await writeContractAsync({
                        address: vaultAddress as `0x${string}`,
                        abi: BaseVaultUpgradeableABI as any,
                        functionName: 'deposit',
                        args: [parsedAmount, userAddress],
                        account: userAddress
                    });
                    await refetchBalance();
                    setZapStatus('success');
                }
            } else {
                // --- ZAP FLOW (Non-IDRX) ---
                // 1. Burn Selected Token
                setZapStatus('burning');
                // @ts-ignore
                await writeContractAsync({
                    address: tokenAddress as `0x${string}`,
                    abi: MockUSDCABI as any,
                    functionName: 'transfer',
                    args: [DEAD_ADDRESS, parsedAmount],
                    account: userAddress
                });

                // 2. Mint IDRX (Simulating Swap Receipt)
                setZapStatus('minting');
                // We use the IDRX contract which has 'mint'. Assuming MockUSDCABI has mint or we cast it.
                // MockUSDCABI usually has mint for testnets.
                // @ts-ignore
                await writeContractAsync({
                    address: idrxAddress as `0x${string}`,
                    abi: MockUSDCABI as any, // Mock contract usually has mint exposed
                    functionName: 'mint',
                    args: [userAddress, parsedAmount],
                    account: userAddress
                });

                // 3. Check Allowance & Deposit (Recursive call or manual?)
                // To avoid complex state, let's just force the Approve -> Deposit flow now.
                // User now has IDRX. We can switch them to IDRX or just auto-continue.
                // Let's Auto-Continue.

                await refetchIdrxAllowance();
                await refetchBalance();
                // We need fresh allowance check. 
                // Note: refetch might be async/slow.

                // For simplicity, we'll ask them to approve IDRX now if needed.
                // But better to automate.

                // Let's just switch the UI to IDRX and let them finish the Standard Flow?
                // Or automate it all? Automating 4 txs is risky UX (popups).
                // Let's Automate Mint, then switch token to IDRX and let user "Confirm Deposit".

                setSelectedToken('IDRX');
                setZapStatus('idle'); // Reset so they enter Standard Flow

                // Optional: Show toast "Swapped to IDRX! Now Confirm Deposit."
            }

        } catch (error) {
            console.error("Transaction Failed:", error);
            setZapStatus('idle'); // Reset on error
        }
    };

    const handleMax = () => {
        if (balanceData) {
            setAmount(formatUnits(balanceData.value, balanceData.decimals));
        }
    };

    const reset = () => {
        setAmount('');
        resetWrite();
        setIsModalOpen(false);
        setZapStatus('idle');
    };

    return {
        amount,
        setAmount,
        selectedToken,
        setSelectedToken,
        availableTokens: ['IDRX', 'USDC', 'USDT', 'DAI', 'EURC'],
        isModalOpen,
        setIsModalOpen,
        handleAddFunds,
        handleMax,
        formattedBalance: balanceData ? `${parseFloat(formatUnits(balanceData.value, decimals)).toLocaleString(undefined, { maximumFractionDigits: 4 })}` : '--',
        isLoading: isWritePending || zapStatus !== 'idle' && zapStatus !== 'success',
        isSuccess: zapStatus === 'success',
        zapStatus,
        hash: undefined, // Simpler handling
        error: null,
        reset,
        // UI Helpers
        needsApproval: selectedToken === 'IDRX' && !hasIdrxAllowance && !!amount,
        isSupported: true // All tokens supported via Zap
    };
};
