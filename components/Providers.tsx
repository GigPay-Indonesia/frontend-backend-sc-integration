import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains';
import React, { ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { hasOnchainKit, onchainApiKey } from '../lib/onchainkit';
import { config } from '../lib/wagmi';
import {
    WalletUiMode,
    WalletUiModeProvider,
} from './wallet/WalletUiModeContext';
import { OnchainKitErrorBoundary } from './wallet/OnchainKitErrorBoundary';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
    if (!hasOnchainKit) {
        console.warn(
            'VITE_ONCHAINKIT_API_KEY is not set. OnchainKit components are disabled.'
        );
    }

    const initialMode: WalletUiMode = hasOnchainKit ? 'onchainkit' : 'wagmi';
    const [walletUiMode, setWalletUiMode] = useState<WalletUiMode>(initialMode);

    const ctxValue = useMemo(
        () => ({ walletUiMode, setWalletUiMode }),
        [walletUiMode]
    );

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <WalletUiModeProvider value={ctxValue}>
                    {walletUiMode === 'onchainkit' && hasOnchainKit ? (
                        <OnchainKitErrorBoundary
                            onError={() => setWalletUiMode('wagmi')}
                            fallback={children}
                        >
                            <OnchainKitProvider
                                apiKey={onchainApiKey!}
                                chain={baseSepolia}
                            >
                                {children}
                            </OnchainKitProvider>
                        </OnchainKitErrorBoundary>
                    ) : (
                        children
                    )}
                </WalletUiModeProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
