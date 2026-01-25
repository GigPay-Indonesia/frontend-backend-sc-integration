import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base, baseSepolia } from 'wagmi/chains';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
<<<<<<< HEAD
import { WagmiProvider, createConfig, http } from 'wagmi';
import { hasOnchainKit, onchainApiKey } from '../lib/onchainkit';
=======
import { WagmiProvider } from 'wagmi';
import { config } from '../lib/wagmi';
>>>>>>> 9f2465fa84f17edac88643b34da04acfe17b3583

const queryClient = new QueryClient();

// DEBUG: Verify config is loaded
console.log("Wagmi Config Loaded (Canonical):", config);

export function Providers({ children }: { children: ReactNode }) {
    if (!hasOnchainKit) {
        console.warn(
            'VITE_ONCHAINKIT_API_KEY is not set. OnchainKit components are disabled.'
        );
    }

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {hasOnchainKit ? (
                    <OnchainKitProvider apiKey={onchainApiKey!} chain={baseSepolia}>
                        {children}
                    </OnchainKitProvider>
                ) : (
                    children
                )}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
