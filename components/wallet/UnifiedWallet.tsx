import React, { useMemo, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import {
  Wallet as OnchainWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletAdvancedAddressDetails,
  WalletAdvancedTokenHoldings,
  WalletAdvancedTransactionActions,
  WalletAdvancedWalletActions,
  ConnectWallet,
} from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { WalletSelector } from '../WalletSelector';
import { useWalletUiMode } from './WalletUiModeContext';

type UnifiedWalletVariant = 'header' | 'login';

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function WagmiConnectedMenu({
  buttonClassName,
}: {
  buttonClassName?: string;
}) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  if (!address) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          buttonClassName ??
          'bg-white/15 border border-white/25 hover:bg-white/25 text-white rounded-full transition-all px-3 py-2 gap-2 shadow-[0_0_12px_rgba(255,255,255,0.15)] flex items-center'
        }
      >
        <span className="text-sm font-semibold">{truncateAddress(address)}</span>
        <span className="text-xs text-white/70">▼</span>
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+10px)] right-0 w-60 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-2 z-[100]">
          <button
            type="button"
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            className="w-full justify-center px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-slate-300 hover:text-white font-medium cursor-pointer flex items-center gap-2"
          >
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function UnifiedWallet({
  variant = 'header',
  hideCoinbaseInSelector = false,
}: {
  variant?: UnifiedWalletVariant;
  hideCoinbaseInSelector?: boolean;
}) {
  const { walletUiMode } = useWalletUiMode();
  const { isConnected } = useAccount();

  const headerConnectButtonClass = useMemo(
    () =>
      'bg-white/15 border border-white/25 hover:bg-white/25 text-white rounded-full transition-all px-4 py-2 shadow-[0_0_12px_rgba(255,255,255,0.12)] flex items-center gap-2',
    []
  );

  // LOGIN VARIANT
  if (variant === 'login') {
    if (walletUiMode === 'onchainkit') {
      return (
        <OnchainWallet className="w-full">
          <WalletSelector hideCoinbase={hideCoinbaseInSelector} />
          <WalletDropdown>
            <WalletAdvancedWalletActions />
            <WalletAdvancedAddressDetails />
            <WalletAdvancedTransactionActions />
            <WalletAdvancedTokenHoldings />
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </OnchainWallet>
      );
    }

    return <WalletSelector hideCoinbase={hideCoinbaseInSelector} />;
  }

  // HEADER VARIANT
  if (!isConnected) {
    return (
      <WalletSelector
        buttonLabel="Connect Wallet"
        buttonClassName={headerConnectButtonClass}
      />
    );
  }

  if (walletUiMode === 'onchainkit') {
    return (
      <OnchainWallet>
        <ConnectWallet className={headerConnectButtonClass}>
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown className="absolute top-[calc(100%+10px)] right-0 w-60 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-2 z-[100]">
          <WalletDropdownDisconnect className="w-full justify-center px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-slate-300 hover:text-white font-medium cursor-pointer flex items-center gap-2" />
        </WalletDropdown>
      </OnchainWallet>
    );
  }

  return <WagmiConnectedMenu buttonClassName={headerConnectButtonClass} />;
}

