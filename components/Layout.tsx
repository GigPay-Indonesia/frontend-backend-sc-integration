import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Logo } from './Logo';
import { Button } from './Button';
import { WalletSelector } from './WalletSelector';
import { UserRole } from '../types';
import PillNav from './PillNav';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import { Dock, defaultDockItems } from './ui/Dock';
import { MobileProfileNav } from './header/MobileProfileNav';

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
    { label: 'Overview', href: '/overview', onClick: () => navigate('/overview') },
    { label: 'Treasury', href: '/treasury', onClick: () => navigate('/treasury') },
    { label: 'Payments', href: '/payments', onClick: () => navigate('/payments') },
    { label: 'Explore', href: '/explore', onClick: () => navigate('/explore') },
    { label: 'Settings', href: '/settings', onClick: () => navigate('/settings') },
  ];

  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-indigo-500/30 relative">
      <PillNav
        logo={<div className="flex items-center"><Logo className="h-9 w-auto text-white" light /></div>}
        items={navItems}
        baseColor="#1f2937"
        pillColor="#0f172a"
        pillTextColor="#e2e8f0"
        hoveredPillTextColor="#f8fafc"
        rightContent={
          userRole ? (
            <div className="relative z-50 flex items-center gap-2">
              {/* Desktop: Wallet Connect */}
              <div className="hidden md:inline-flex relative items-center">
                <Wallet>
                  {isConnected ? (
                    <ConnectWallet className="bg-white/15 border border-white/25 hover:bg-white/25 text-white rounded-full transition-all px-3 py-2 gap-2 shadow-[0_0_12px_rgba(255,255,255,0.15)] flex items-center">
                      <Avatar className="h-6 w-6" />
                      <Name />
                    </ConnectWallet>
                  ) : (
                    <WalletSelector />
                  )}
                  <WalletDropdown className="absolute top-[calc(100%+10px)] right-0 w-60 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-2 z-[100]">
                    <WalletDropdownDisconnect className="w-full justify-center px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-slate-300 hover:text-white font-medium cursor-pointer flex items-center gap-2" />
                  </WalletDropdown>
                </Wallet>
              </div>

              {/* Mobile: Custom Profile Nav */}
              <div className="md:hidden">
                <MobileProfileNav />
              </div>
            </div>

          ) : (
            <Button
              onClick={() => navigate('/login')}
              variant="glow"
              className="px-6 py-2 rounded-full font-medium"
            >
              Launch App
            </Button>
          )
        }
      />


      <main className="flex-grow pt-0 pb-24 relative">
        {children}
      </main>

      {/* Mobile Dock Navigation */}
      <div className="md:hidden">
        <Dock items={defaultDockItems} />
      </div>

      <footer className="bg-[#050505] text-slate-400 py-12 border-t border-white/5 relative z-10 mb-20 md:mb-0">
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