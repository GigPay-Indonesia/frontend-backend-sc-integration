import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from './Button';
import { UserRole } from '../types';
import PillNav from './PillNav';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownBasename,
  WalletDropdownFundLink,
  WalletDropdownLink,
  WalletAdvancedAddressDetails,
  WalletAdvancedTokenHoldings,
  WalletAdvancedTransactionActions,
  WalletAdvancedWalletActions,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  EthBalance,
} from '@coinbase/onchainkit/identity';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole | null;
  walletAddress: string | null;
  onLogout: () => void;
  onConnect: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, userRole, walletAddress, onLogout, onConnect }) => {
  // Mobile menu is now handled by PillNav
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const showLandingNav = location.pathname === '/' || location.pathname === '/login';

  const navItems = showLandingNav ? [
    { label: 'Home', href: '/#home', onClick: (e: React.MouseEvent) => scrollToSection('home', e) },
    { label: 'About', href: '/#about', onClick: (e: React.MouseEvent) => scrollToSection('about', e) },
    { label: 'How it works', href: '/#how-it-works', onClick: (e: React.MouseEvent) => scrollToSection('how-it-works', e) },
  ] : [
    { label: 'Dashboard', href: '/dashboard', onClick: () => navigate('/dashboard') },
    { label: 'Treasury', href: '/treasury', onClick: () => navigate('/treasury') },
    { label: 'Create Gig', href: '/create-gig', onClick: () => navigate('/create-gig') },
    { label: 'Explore', href: '/jobs', onClick: () => navigate('/jobs') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-white selection:bg-indigo-500/30">
      <PillNav
        logo={<div className="flex items-center"><Logo className="h-9 w-auto text-white" light /></div>}
        items={navItems}
        baseColor="#111"
        pillColor="transparent"
        pillTextColor="#cbd5e1"
        hoveredPillTextColor="#fff"
        rightContent={
          userRole ? (
            <div className="relative z-50">
              <Wallet>
                <ConnectWallet className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full px-4 py-2 transition-all">
                  <Avatar className="h-6 w-6" />
                  <Name className="text-white font-medium ml-2" />
                </ConnectWallet>
                <WalletDropdown>
                  <WalletAdvancedWalletActions />
                  <WalletAdvancedAddressDetails />
                  <WalletAdvancedTransactionActions />
                  <WalletAdvancedTokenHoldings />
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              className="bg-white text-black hover:bg-blue-600 hover:text-white px-6 py-2 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
            >
              Launch App
            </Button>
          )
        }
      />


      <main className="flex-grow pt-16 relative">
        {children}
      </main>

      <footer className="bg-[#050505] text-slate-400 py-12 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <Logo className="h-6 w-auto text-slate-600" light />
              <span className="ml-3 text-lg font-bold font-display text-slate-200">GigPay ID</span>
            </div>
            <div className="text-sm flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-slate-600">
            &copy; 2024 GigPay Indonesia. Decentralized Treasury Architecture.
          </div>
        </div>
      </footer>
    </div >
  );
};