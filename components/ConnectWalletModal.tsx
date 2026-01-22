import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Button } from './Button';
import { X, Loader2, Wallet, Shield, User } from 'lucide-react';
import { Logo } from './Logo';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (role: UserRole, address: string) => void;
}

const WALLETS = [
  { id: 'metamask', name: 'MetaMask', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg' },
  { id: 'phantom', name: 'Phantom', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Phantom_icon_purple.png' },
  { id: 'walletconnect', name: 'WalletConnect', icon: 'https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png' },
];

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [step, setStep] = useState<'select' | 'connecting' | 'role'>('select');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedWallet(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = (walletId: string) => {
    setSelectedWallet(walletId);
    setStep('connecting');
    setTimeout(() => {
      setStep('role');
    }, 1500);
  };

  const handleRoleSelect = (role: UserRole) => {
    const mockAddress = `0x${Array(4).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}...${Array(4).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    onLogin(role, mockAddress);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card bg-[#0A0A0A] rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl border border-white/10">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-8">
            <Logo className="h-8 w-auto text-white" light />
          </div>

          {step === 'select' && (
            <>
              <h3 className="text-2xl font-bold font-display text-center text-white mb-2">Connect Wallet</h3>
              <p className="text-slate-400 text-center text-sm mb-8">Select your provider to enter the protocol.</p>
              
              <div className="space-y-3">
                {WALLETS.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleConnect(wallet.id)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <span className="font-semibold text-slate-200 group-hover:text-white">{wallet.name}</span>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5">
                       {wallet.id === 'metamask' ? (
                          <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-contain" />
                       ) : (
                          <Wallet className="w-4 h-4 text-black" />
                       )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'connecting' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin relative z-10" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Connecting...</h3>
              <p className="text-slate-500 text-sm">Approve request in your wallet</p>
            </div>
          )}

          {step === 'role' && (
            <div className="animate-in slide-in-from-right-10 duration-300">
              <h3 className="text-2xl font-bold font-display text-center text-white mb-2">Select Profile</h3>
              <p className="text-slate-400 text-center text-sm mb-8">How will you participate?</p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleRoleSelect(UserRole.COMPANY)}
                  className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all group text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield size={24} />
                  </div>
                  <span className="font-bold text-white mb-1">Company</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Treasury Manager</span>
                </button>

                <button
                  onClick={() => handleRoleSelect(UserRole.FREELANCER)}
                  className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all group text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <User size={24} />
                  </div>
                  <span className="font-bold text-white mb-1">Freelancer</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Service Provider</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};