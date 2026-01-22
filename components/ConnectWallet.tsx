import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownDisconnect,
    WalletDropdownBasename,
    WalletDropdownFundLink,
    WalletDropdownLink
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance
} from '@coinbase/onchainkit/identity';

interface WalletComponentProps {
    className?: string; // Additional classes
    withGlow?: boolean; // Use the "glow" variant
}

export function WalletComponent({ className = "", withGlow = false }: WalletComponentProps) {
    // Styles from Button.tsx
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050505] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const glowStyles = "bg-blue-600 text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.7)] hover:bg-blue-500 border border-blue-400/20";
    const defaultStyles = "bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white"; // Matching the glass/dark theme better than pure secondary

    // If passing 'rounded-full' in className, it applies. Defaults to rounded-xl if not handled carefully, 
    // but let's just use the classes passed or default to rounded-xl if nothing.
    // Actually, Button.tsx uses rounded-xl. Landing.tsx uses rounded-full.

    return (
        <div className="flex justify-end">
            <Wallet>
                <ConnectWallet className={`${baseStyles} ${withGlow ? glowStyles : defaultStyles} ${className}`}>
                    <Avatar className="h-6 w-6" />
                    <Name />
                </ConnectWallet>
                <WalletDropdown>
                    <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                        <Avatar />
                        <Name />
                        <Address />
                        <EthBalance />
                    </Identity>
                    <WalletDropdownBasename />
                    <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
                        Wallet
                    </WalletDropdownLink>
                    <WalletDropdownFundLink />
                    <WalletDropdownDisconnect />
                </WalletDropdown>
            </Wallet>
        </div>
    );
}
