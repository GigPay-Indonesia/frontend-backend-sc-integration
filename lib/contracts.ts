// Deployed Contract Addresses for GigPay Testnet

// Faucet Contract
export const FAUCET_CONTRACT_ADDRESS = '0x31d563850441a218F742237aF505fb7Fc4198bc7';

// Token Contracts
export const TOKENS = {
    IDRX: '0x20Abd5644f1f77155c63A8818C75540F770ae223',
    USDC: '0x44E7c97Ee6EC2B25145Acf350DBBf636615e198d',
    USDT: '0xDbb4DEfa899F25Fd1727D55cfb66F6EB0C378893',
    DAI: '0x029a0241F596B9728c201a58CD9aa9Db5d3ac533',
    EURC: '0xE9b7236DF6610C1A694955fFe13ca65970183961',
} as const;

export type TokenType = keyof typeof TOKENS;
