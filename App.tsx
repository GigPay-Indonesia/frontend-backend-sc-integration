import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/PageTransition';
import { Toaster } from 'sonner';
import { useAccount } from 'wagmi';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { UserRole } from './types';
import { Login } from './pages/Login';
import { CreateGig } from './pages/CreateGig';
import { GigCreatedSuccess } from './pages/GigCreatedSuccess';
import { Jobs } from './pages/Jobs';
import { Treasury } from './pages/Treasury';
import { Settings } from './pages/Settings';
import { Providers } from './components/Providers';

const AppContent: React.FC = () => {
  const { isConnected, address } = useAccount();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const navigate = useNavigate();

  // Sync Wagmi state with App state
  useEffect(() => {
    if (isConnected && address && !userRole) {
      // Auto-login as Freelancer for now (or fetch actual role)
      handleLogin(UserRole.FREELANCER, address);
    } else if (!isConnected && userRole) {
      handleLogout();
    }
  }, [isConnected, address, userRole]);

  const handleLogin = (role: UserRole, address: string) => {
    setUserRole(role);
    setWalletAddress(address);
    setIsWalletModalOpen(false);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
    setWalletAddress(null);
    // Disconnect wagmi if needed, but for now just clear local state
    navigate('/');
  };

  const openModal = () => setIsWalletModalOpen(true);
  const closeModal = () => setIsWalletModalOpen(false);

  const location = useLocation();

  return (
    <>
      <Layout
        userRole={userRole}
        walletAddress={walletAddress}
        onLogout={handleLogout}
        onConnect={openModal}
      >
        <AnimatePresence mode="wait">
          {/* @ts-ignore */}
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Landing onConnect={openModal} /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login onConnectWallet={openModal} /></PageTransition>} />
            <Route path="/dashboard" element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            } />
            <Route path="/treasury" element={
              <PageTransition>
                <Treasury />
              </PageTransition>
            } />
            <Route path="/create-gig" element={<PageTransition><CreateGig /></PageTransition>} />
            <Route path="/gig-created-success" element={<PageTransition><GigCreatedSuccess /></PageTransition>} />
            <Route path="/jobs" element={<PageTransition><Jobs /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>

      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        onClose={closeModal}
        onLogin={handleLogin}
      />
    </>
  );
};

function App() {
  return (
    <Providers>
      <HashRouter>
        <AppContent />
      </HashRouter>
      <Toaster position="bottom-right" theme="dark" />
    </Providers>
  );
}

export default App;
