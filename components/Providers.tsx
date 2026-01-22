import { OnchainKitProvider } from '@coinbase/onchainkit';
import { defineChain } from 'viem';
import { base, baseSepolia } from 'wagmi/chains';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
    chains: [base, baseSepolia],
    transports: {
        [base.id]: http(),
        [baseSepolia.id]: http(),
    },
});

export function Providers({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <OnchainKitProvider
                    apiKey={import.meta.env.VITE_ONCHAINKIT_API_KEY}
                    chain={baseSepolia}
                >
                    {children}
                </OnchainKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
