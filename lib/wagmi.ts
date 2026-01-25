import { http, createConfig, createStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';

export const config = createConfig({
    chains: [base, baseSepolia],
    multiInjectedProviderDiscovery: false,
    storage: createStorage({
        storage: window.localStorage,
        key: 'gigpay-v3-fix', // Force new session to clear auto-connect cache
    }),
    connectors: [
        coinbaseWallet({
            appName: 'GigPay Indonesia',
            preference: 'all',
            version: '4',
        }),
        metaMask(),
    ],
    transports: {
        [base.id]: http(),
        [baseSepolia.id]: http(),
    },
});