import React, { createContext, useContext } from 'react';

export type WalletUiMode = 'onchainkit' | 'wagmi';

export interface WalletUiModeContextValue {
  walletUiMode: WalletUiMode;
  setWalletUiMode: (mode: WalletUiMode) => void;
}

const WalletUiModeContext = createContext<WalletUiModeContextValue | null>(null);

export function WalletUiModeProvider({
  value,
  children,
}: {
  value: WalletUiModeContextValue;
  children: React.ReactNode;
}) {
  return (
    <WalletUiModeContext.Provider value={value}>
      {children}
    </WalletUiModeContext.Provider>
  );
}

export function useWalletUiMode(): WalletUiModeContextValue {
  const ctx = useContext(WalletUiModeContext);
  if (!ctx) {
    throw new Error('useWalletUiMode must be used within WalletUiModeProvider');
  }
  return ctx;
}
