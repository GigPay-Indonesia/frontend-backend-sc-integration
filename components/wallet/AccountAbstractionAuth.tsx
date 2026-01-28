import React from 'react';
import { useConnect } from 'wagmi';

export function AccountAbstractionAuth({
  className = '',
  buttonText = 'Continue with Google (Smart Wallet)',
}: {
  className?: string;
  buttonText?: string;
}) {
  const { connectors, connect, isPending } = useConnect();
  const coinbaseConnector = connectors.find((c) => c.id === 'coinbaseWalletSDK');

  return (
    <div className={className}>
      <div className="text-xs text-slate-500 mb-2">Account Abstraction</div>
      <button
        type="button"
        disabled={!coinbaseConnector || isPending}
        onClick={() => {
          if (!coinbaseConnector) return;
          connect({ connector: coinbaseConnector });
        }}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-bold text-md transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          className="w-5 h-5"
          alt="Google"
        />
        {isPending ? 'Opening...' : buttonText}
      </button>
      <p className="mt-2 text-[11px] text-slate-500 leading-snug">
        This creates/uses a Coinbase Smart Wallet (AA). You can also connect an
        existing wallet below.
      </p>
    </div>
  );
}

