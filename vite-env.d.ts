/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ONCHAINKIT_API_KEY: string;
    readonly VITE_GIGPAY_NETWORK?: string;
    readonly VITE_GIGPAY_CHAIN_ID?: string;
    readonly VITE_API_URL?: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
