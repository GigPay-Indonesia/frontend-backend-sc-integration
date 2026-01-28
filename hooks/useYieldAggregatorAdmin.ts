import { useMemo, useState } from 'react';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { decodeErrorResult } from 'viem';
import { BaseVaultUpgradeableABI, getContractAddress } from '../lib/abis';

type TxState = {
  action?: 'rebalance' | 'shutdown' | 'queue';
  hash?: `0x${string}`;
  error?: string;
};

const extractErrorData = (e: any): string | undefined => {
  const candidates = [e?.data, e?.cause?.data, e?.cause?.cause?.data, e?.error?.data];
  for (const c of candidates) {
    if (typeof c === 'string' && c.startsWith('0x')) return c;
  }
  return undefined;
};

const decodeVaultError = (e: any): string | undefined => {
  const data = extractErrorData(e);
  if (!data) return undefined;

  try {
    const decoded = decodeErrorResult({ abi: BaseVaultUpgradeableABI as any, data: data as `0x${string}` });
    const name = decoded?.errorName;
    if (!name) return undefined;

    // Friendly hints for common ops errors
    if (name === 'RM_RebalanceTooSoon') return 'RM_RebalanceTooSoon: rebalance cooldown is active.';
    if (name === 'RM_NoValidCandidates') return 'RM_NoValidCandidates: oracle did not return valid strategies.';
    if (name === 'NotAllocatable') return 'NotAllocatable: vault cannot allocate funds to strategies under current params.';
    if (name === 'RM_NotAuthorized' || name === 'Vault_NotAuthorized') return `${name}: admin permissions required.`;

    return name;
  } catch {
    return undefined;
  }
};

export const useYieldAggregatorAdmin = () => {
  const { address: userAddress } = useAccount();
  const vaultAddress = getContractAddress('CompanyTreasuryVault') as `0x${string}` | undefined;

  const [tx, setTx] = useState<TxState>({});
  const { writeContractAsync } = useWriteContract();

  const wait = useWaitForTransactionReceipt({
    hash: tx.hash,
    query: { enabled: !!tx.hash },
  });

  const contract = useMemo(() => {
    if (!vaultAddress) return undefined;
    return { address: vaultAddress, abi: BaseVaultUpgradeableABI } as const;
  }, [vaultAddress]);

  const executeRebalance = async () => {
    if (!contract || !userAddress) throw new Error('Wallet not connected');
    setTx({ action: 'rebalance' });
    try {
      const hash = await writeContractAsync({
        ...contract,
        functionName: 'executeRebalance',
        args: [],
        account: userAddress,
      } as any);
      setTx({ action: 'rebalance', hash: hash as `0x${string}` });
      return hash;
    } catch (e: any) {
      const decoded = decodeVaultError(e);
      setTx({ action: 'rebalance', error: decoded || e?.shortMessage || e?.message || 'Rebalance failed' });
      throw e;
    }
  };

  const setEmergencyShutdown = async (active: boolean) => {
    if (!contract || !userAddress) throw new Error('Wallet not connected');
    setTx({ action: 'shutdown' });
    try {
      const hash = await writeContractAsync({
        ...contract,
        functionName: 'setEmergencyShutdown',
        args: [active],
        account: userAddress,
      } as any);
      setTx({ action: 'shutdown', hash: hash as `0x${string}` });
      return hash;
    } catch (e: any) {
      const decoded = decodeVaultError(e);
      setTx({ action: 'shutdown', error: decoded || e?.shortMessage || e?.message || 'Shutdown update failed' });
      throw e;
    }
  };

  const setWithdrawalQueue = async (queue: `0x${string}`[]) => {
    if (!contract || !userAddress) throw new Error('Wallet not connected');
    setTx({ action: 'queue' });
    try {
      const hash = await writeContractAsync({
        ...contract,
        functionName: 'setWithdrawalQueue',
        args: [queue],
        account: userAddress,
      } as any);
      setTx({ action: 'queue', hash: hash as `0x${string}` });
      return hash;
    } catch (e: any) {
      const decoded = decodeVaultError(e);
      setTx({ action: 'queue', error: decoded || e?.shortMessage || e?.message || 'Queue update failed' });
      throw e;
    }
  };

  const resetTx = () => setTx({});

  return {
    vaultAddress,
    tx,
    resetTx,
    executeRebalance,
    setEmergencyShutdown,
    setWithdrawalQueue,
    isPending: wait.isLoading,
    isSuccess: wait.isSuccess,
    receipt: wait.data,
  };
};

