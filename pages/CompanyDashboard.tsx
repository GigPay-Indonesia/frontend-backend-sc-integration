import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Contract, ContractState, TreasuryStats, YieldZone } from '../types';
import {
  Plus, Wallet, ArrowUpRight, TrendingUp, CheckCircle, Clock, AlertCircle,
  Bell, Zap, Copy, Activity, Hourglass, Lock, Droplet, DollarSign, ExternalLink,
  Gavel, LineChart, Building2, ArrowRight, BadgeCheck, Infinity
} from 'lucide-react';

// --- Types ---
type TabType = 'activity' | 'entities';

// --- Mobile Components (Matched to User HTML) ---

const MobileHeader = () => (
  <header className="sticky top-0 z-50 bg-[#02040a]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex justify-between items-center">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
        <Infinity size={20} />
      </div>
      <span className="font-bold text-lg tracking-tight text-white">GigPay ID</span>
    </div>
    <div className="flex items-center gap-3">
      <button className="relative p-2 rounded-full hover:bg-white/10 transition group">
        <Bell size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#02040a]"></span>
      </button>
      <div className="bg-[#0a101f] border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
        <div className="w-5 h-5 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full border border-white/20"></div>
        <span className="text-xs font-mono font-medium text-gray-300">0x6a...0444</span>
      </div>
    </div>
  </header>
);

const FaucetCard = () => (
  <div className="relative overflow-hidden rounded-2xl bg-[#0a101f] border border-blue-900/30 p-4 shadow-lg shadow-black/20 mb-6">
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
    <div className="flex justify-between items-start relative z-10">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Droplet className="text-blue-500" size={20} />
          <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-400">Testnet Faucet</h3>
          <span className="text-[10px] bg-blue-900/50 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded font-bold">BASE SEPOLIA</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed max-w-[90%]">
          Claim free testnet tokens to experiment with GigPay. Requires a small amount of ETH for gas.
        </p>
      </div>
    </div>
    <div className="mt-4 flex gap-2">
      <button className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 text-xs font-medium hover:bg-white/10 flex justify-between px-3 items-center text-gray-300 transition-colors">
        <div className="flex items-center gap-1">
          <DollarSign className="text-blue-400" size={14} />
          USDC
        </div>
        <span className="opacity-50">▼</span>
      </button>
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-blue-500/30 transition-all">
        Claim USDC
        <ExternalLink size={12} />
      </button>
    </div>
  </div>
);

const OverviewCarousel = ({ treasuryBalance }: { treasuryBalance: string }) => (
  <div className="space-y-2 mb-6">
    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Overview</h2>
    <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 hide-scrollbar snap-x">
      {/* Treasury Balance Card */}
      <div className="snap-center min-w-[85%] bg-[#0a101f] border border-white/5 p-5 rounded-2xl shadow-lg shadow-black/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-50">
          <span className="text-[10px] font-bold text-gray-500 tracking-widest hover:text-gray-300 cursor-pointer">HIDE</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
            <Wallet size={18} />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase">Treasury Balance</span>
        </div>
        <div className="text-3xl font-display font-bold text-white mb-2">{treasuryBalance}</div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-gray-400">IDRX</span>
          <span className="text-xs text-emerald-500 font-medium flex items-center bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/10">
            <TrendingUp size={14} className="mr-1" /> +2.4%
          </span>
        </div>
      </div>

      {/* In Escrow Card */}
      <div className="snap-center min-w-[85%] bg-[#0a101f] border border-white/5 p-5 rounded-2xl shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-gray-800 rounded-lg text-gray-400">
            <Lock size={18} />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase">In Escrow</span>
        </div>
        <div className="text-3xl font-display font-bold text-white mb-2">0.00</div>
        <div className="text-xs text-gray-500">Funds locked in active deals</div>
      </div>

      {/* Approvals Card */}
      <div className="snap-center min-w-[85%] bg-[#0a101f] border border-white/5 p-5 rounded-2xl shadow-lg shadow-black/20 relative">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
            <Gavel size={18} />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase">Approvals</span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-display font-bold text-white mb-2">3</div>
          <span className="text-sm text-purple-400 font-medium bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/10">Pending</span>
        </div>
        <div className="text-xs text-gray-500">Requires immediate attention</div>
      </div>
    </div>
  </div>
);

const PendingActionItem = ({ title, status, id, progress, color }: any) => {
  const isSubmitted = status === 'SUBMITTED';
  const progressWidth = `${progress}%`;

  return (
    <div className="bg-[#0a101f] border border-white/5 p-4 rounded-2xl shadow-lg shadow-black/20">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm text-gray-100">{title}</h3>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${isSubmitted ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' : 'bg-gray-700/50 text-gray-300 border border-white/5'
          }`}>
          {isSubmitted && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_5px_rgba(234,179,8,0.5)]"></span>}
          {status}
        </span>
      </div>
      <div className="flex gap-2 text-[10px] text-gray-400 mb-3 font-mono">
        <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">PAYMENT INTENT</span>
        <span>• {id}</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-medium text-gray-400">
          <span>PROGRESS</span>
          <span className={progress > 0 ? "text-blue-500" : ""}>{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${progress > 0 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-transparent'}`}
            style={{ width: progressWidth }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const ProfileSection = () => (
  <div className="bg-gradient-to-br from-[#111b33] to-[#0a101f] border border-white/5 rounded-2xl p-6 text-center relative overflow-hidden shadow-lg shadow-black/20 mb-8">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
    <div className="relative z-10 flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-[#0a101f] p-1 mb-3 shadow-lg border border-white/10">
          <img alt="Zennz Avatar" className="w-full h-full rounded-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" />
        </div>
        <span className="absolute bottom-3 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-[#0a101f]">
          <CheckCircle size={12} fill="currentColor" />
        </span>
      </div>
      <h3 className="font-bold text-lg text-white flex items-center gap-1">
        Zennz <BadgeCheck className="text-blue-500" size={16} fill="currentColor" color="white" />
      </h3>
      <p className="text-xs text-gray-400 mb-6">@zennz</p>
      <div className="grid grid-cols-3 divide-x divide-white/10 w-full max-w-xs mx-auto">
        <div className="px-2">
          <div className="text-sm font-bold text-white">Lvl 5</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">Rank</div>
        </div>
        <div className="px-2">
          <div className="text-sm font-bold text-white">98%</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">Success</div>
        </div>
        <div className="px-2">
          <div className="text-sm font-bold text-white">4.9</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">Rating</div>
        </div>
      </div>
      <div className="mt-6 w-full max-w-[200px] flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 cursor-pointer transition-colors group">
        <Copy size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
        <span className="text-xs font-mono text-gray-300">0x6a8D...0444</span>
      </div>
    </div>
  </div>
);

const ActivityList = ({ activeTab, setActiveTab }: { activeTab: TabType, setActiveTab: (t: TabType) => void }) => (
  <div className="bg-[#0a101f] rounded-2xl border border-white/5 overflow-hidden shadow-lg shadow-black/20 min-h-[300px] mb-8">
    <div className="flex border-b border-white/5">
      <button
        onClick={() => setActiveTab('activity')}
        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'activity' ? 'text-blue-500 border-blue-500 bg-white/[0.02]' : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/[0.02]'
          }`}
      >
        <LineChart size={16} /> Activity
      </button>
      <button
        onClick={() => setActiveTab('entities')}
        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'entities' ? 'text-blue-500 border-blue-500 bg-white/[0.02]' : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/[0.02]'
          }`}
      >
        <Building2 size={16} /> Entities
      </button>
    </div>

    <div className={activeTab === 'activity' ? 'block' : 'hidden'}>
      <ul className="divide-y divide-white/5">
        <li className="p-4 flex items-center justify-between hover:bg-white/5 transition duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Lock size={14} />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-100">Payment Funded</div>
              <div className="text-[10px] text-gray-500 mt-0.5">2 mins ago</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-medium text-gray-200">- 15.000.000</div>
            <span className="inline-block px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/10 text-[9px] font-bold text-blue-300 rounded uppercase">Funded</span>
          </div>
        </li>
        <li className="p-4 flex items-center justify-between hover:bg-white/5 transition duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Hourglass size={14} />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-100">Payment Submitted</div>
              <div className="text-[10px] text-gray-500 mt-0.5">3 hours ago</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-medium text-gray-500">—</div>
            <span className="inline-block px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/10 text-[9px] font-bold text-yellow-300 rounded uppercase">Submitted</span>
          </div>
        </li>
        <li className="p-4 flex items-center justify-between hover:bg-white/5 transition duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              <CheckCircle size={14} />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-100">Payment Released</div>
              <div className="text-[10px] text-gray-500 mt-0.5">1 day ago</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-medium text-gray-200">- 8.500.000</div>
            <span className="inline-block px-1.5 py-0.5 bg-green-500/10 border border-green-500/10 text-[9px] font-bold text-green-300 rounded uppercase">Released</span>
          </div>
        </li>
      </ul>
    </div>

    <div className={activeTab === 'entities' ? 'block' : 'hidden'}>
      <ul className="divide-y divide-white/5">
        <li className="p-4 flex items-center justify-between hover:bg-white/5 transition duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold border border-white/10 shadow-lg">N</div>
            <div>
              <div className="text-sm font-semibold text-gray-100">Nusa Creative</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Vendor • IDRX</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide text-[9px]">Total Paid</div>
            <div className="text-sm font-mono font-medium text-gray-200">225M</div>
          </div>
        </li>
        <li className="p-4 flex items-center justify-between hover:bg-white/5 transition duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold border border-white/10 shadow-lg">S</div>
            <div>
              <div className="text-sm font-semibold text-gray-100">PT SatuTek</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Supplier • USDC</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide text-[9px]">Total Paid</div>
            <div className="text-sm font-mono font-medium text-gray-200">480M</div>
          </div>
        </li>
        <li className="p-4 flex items-center justify-between hover:bg-white/5 transition duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-yellow-600 flex items-center justify-center text-white text-xs font-bold border border-white/10 shadow-lg">K</div>
            <div>
              <div className="text-sm font-semibold text-gray-100">Karsa Logistics</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Partner • IDRX</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide text-[9px]">Total Paid</div>
            <div className="text-sm font-mono font-medium text-gray-200">95M</div>
          </div>
        </li>
      </ul>
    </div>

    <div className="p-3 text-center border-t border-white/5">
      <button className="text-xs text-gray-500 hover:text-blue-500 transition flex items-center justify-center gap-1 w-full">
        See all history <ArrowRight size={12} />
      </button>
    </div>
  </div>
);

// --- Main Component ---

import { useYieldData } from '../hooks/useYieldData';

// ... (keep Type Definitions imports) ...

// ... (keep MobileHeader, FaucetCard, OverviewCarousel, ProfileSection, ActivityList) ...

// --- Main Component ---

const initialContracts: Contract[] = [
  { id: 'GP-101', title: 'Frontend React Development', freelancerName: 'Budi Santoso', amount: 15000000, state: ContractState.SUBMITTED, createdAt: '2023-10-25', isYielding: true },
  { id: 'GP-102', title: 'Logo Design & Brand Kit', freelancerName: 'Siti Aminah', amount: 5000000, state: ContractState.FUNDED, createdAt: '2023-10-27', isYielding: false },
  { id: 'GP-103', title: 'SEO Optimization', freelancerName: 'Pending', amount: 3500000, state: ContractState.CREATED, createdAt: '2023-10-28', isYielding: false },
];

export const CompanyDashboard: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('activity');

  // Fetch Real Yield Data
  const { totalAssets, strategies } = useYieldData();

  // Calculate Real Treasury Stats
  // Aggregating real debt from strategies for "Invested"
  const realInvested = (strategies || []).reduce((acc: number, s: any) => acc + (s.debt || 0), 0);
  // Buffer is Total - Invested (or just Liquid if we had that explicitly, here we assume diff)
  // Logic: Total Assets (from Vault) - Strategies Debt = Liquid Buffer in Vault
  // But useYieldData returns totalAssets which is Vault Balance (Liquid + Idle). 
  // Wait, totalAssets in useYieldData is Vault.totalAssets() which includes Strategy Balances?
  // Let's check useYieldData logic. totalAssets = vault.totalAssets().
  // Usually Vault Total Assets = Liquid + Strategy Allocations.
  // So Liquid = Total - Invested.

  const treasury: TreasuryStats = {
    totalLiquidity: totalAssets,
    bufferAmount: Math.max(0, totalAssets - realInvested),
    investedAmount: realInvested,
    currency: 'IDRX'
  };

  const getZone = (contract: Contract): YieldZone => {
    if (contract.state === ContractState.CREATED) return YieldZone.ZONE_1;
    if (contract.state === ContractState.RELEASED) return YieldZone.ZONE_4;
    return contract.isYielding ? YieldZone.ZONE_3 : YieldZone.ZONE_2;
  };

  const handleCreateContract = () => {
    const newContract: Contract = {
      id: `GP-${Math.floor(Math.random() * 1000)}`,
      title: 'New Project Contract',
      freelancerName: 'Pending',
      amount: 10000000,
      state: ContractState.CREATED,
      createdAt: new Date().toISOString(),
      isYielding: false
    };
    setContracts([newContract, ...contracts]);
    setShowCreateModal(false);
  };

  const handleFund = (id: string) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, state: ContractState.FUNDED } : c));
  };

  const handleRelease = (id: string) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, state: ContractState.RELEASED } : c));
  };

  return (
    <>
      {/* --- MOBILE LAYOUT (Refined to Pixel Precision) --- */}
      <div className="md:hidden min-h-[max(884px,100dvh)] bg-[#02040a] text-gray-100 font-sans pb-20">
        <MobileHeader />

        <main className="container mx-auto max-w-md p-4 space-y-6">
          <FaucetCard />

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition transform active:scale-[0.98]"
          >
            <Zap size={24} />
            Create Payment
          </button>

          <OverviewCarousel treasuryBalance={treasury.totalLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Actions</h2>
              <a className="text-xs text-blue-500 font-bold hover:text-blue-400 transition-colors" href="#">VIEW ALL</a>
            </div>

            <PendingActionItem
              title="Marketing Agency Retainer"
              status="SUBMITTED"
              id="PI-3921"
              progress={67}
            />
            <PendingActionItem
              title="Vendor Equipment Purchase"
              status="CREATED"
              id="PI-3922"
              progress={0}
            />
          </div>

          <ProfileSection />

          <ActivityList activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="text-center pb-8 pt-4">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Infinity className="text-blue-500 text-sm" size={16} />
              <span className="font-bold text-gray-500 text-sm">GigPay ID</span>
            </div>
            <p className="text-[10px] text-gray-600">© 2024 GigPay Indonesia. Decentralized Treasury.</p>
          </div>
        </main>
      </div>

      {/* --- DESKTOP LAYOUT (Unchanged) --- */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Treasury Header */}
        <section>
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold font-display text-white">Treasury Vault</h2>
              <p className="text-slate-400">Real-time liquidity & yield visualization.</p>
            </div>
            <div className="glass-card px-6 py-3 rounded-full flex items-center gap-3">
              <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Total Assets</span>
              <span className="text-xl font-mono font-bold text-white">IDR {treasury.totalLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Liquid Buffer Widget */}
            <div className="glass-card p-8 rounded-3xl relative overflow-hidden group hover:bg-white/5 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                    <h3 className="font-semibold text-slate-300 uppercase tracking-wide text-xs">Liquid Buffer (Zone 1)</h3>
                  </div>
                  <p className="text-4xl font-bold font-display text-white mt-2">IDR {treasury.bufferAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center text-blue-400 border border-white/10">
                  <Wallet size={24} />
                </div>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="h-full w-[20%] bg-blue-500"></div>
              </div>
              <p className="text-xs text-slate-500 mt-3">20% of total allocation available for instant withdrawal.</p>
            </div>

            {/* Strategy Yield Widget */}
            <div className="glass-card p-8 rounded-3xl relative overflow-hidden group border-emerald-500/20 hover:bg-white/5 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <h3 className="font-semibold text-slate-300 uppercase tracking-wide text-xs">Strategy Yield (Invested)</h3>
                  </div>
                  <p className="text-4xl font-bold font-display text-white mt-2">IDR {treasury.investedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <TrendingUp size={24} />
                </div>
              </div>
              <p className="text-sm text-emerald-400 font-medium flex items-center gap-2 bg-emerald-500/10 inline-flex px-3 py-1 rounded-full border border-emerald-500/20">
                <ArrowUpRight size={14} /> Generating ~4.5% APY
              </p>
            </div>
          </div>
        </section>

        {/* Contracts Table */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-display text-white">Active Contracts</h2>
            <Button onClick={() => setShowCreateModal(true)} variant="glow" size="sm">
              <Plus size={16} className="mr-2" />
              New Contract
            </Button>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-5 font-semibold">Contract</th>
                    <th className="px-6 py-5 font-semibold">Amount</th>
                    <th className="px-6 py-5 font-semibold">Yield Zone</th>
                    <th className="px-6 py-5 font-semibold">Status</th>
                    <th className="px-6 py-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {contracts.map((contract) => {
                    const zone = getZone(contract);
                    return (
                      <tr key={contract.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="font-bold text-white mb-1">{contract.title}</div>
                          <div className="text-sm text-slate-500">{contract.freelancerName} <span className="mx-2">•</span> <span className="font-mono text-xs opacity-50">{contract.id}</span></div>
                        </td>
                        <td className="px-6 py-5 font-mono text-slate-300">
                          {contract.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-5">
                          {/* Zone Badges */}
                          {zone === YieldZone.ZONE_1 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Zone 1 (Treasury)</span>
                          )}
                          {zone === YieldZone.ZONE_2 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Zone 2 (Liquid)</span>
                          )}
                          {zone === YieldZone.ZONE_3 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <TrendingUp size={12} className="mr-1.5" /> Zone 3 (Yielding)
                            </span>
                          )}
                          {zone === YieldZone.ZONE_4 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">Zone 4 (Released)</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge state={contract.state} />
                        </td>
                        <td className="px-6 py-5 text-right space-x-2">
                          {contract.state === ContractState.CREATED && (
                            <Button size="sm" variant="outline" onClick={() => handleFund(contract.id)}>Fund Escrow</Button>
                          )}
                          {contract.state === ContractState.SUBMITTED && (
                            <Button size="sm" variant="glow" onClick={() => handleRelease(contract.id)}>Release Funds</Button>
                          )}
                          {contract.state === ContractState.FUNDED && (
                            <span className="text-xs text-slate-500 italic">Processing work...</span>
                          )}
                          {contract.state === ContractState.RELEASED && (
                            <span className="text-xs text-emerald-500 font-bold flex items-center justify-end">
                              <CheckCircle size={14} className="mr-1" /> Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card bg-[#0A0A0A] rounded-2xl max-w-md w-full p-8 border border-white/10 animate-in fade-in zoom-in duration-200">
              <h3 className="text-2xl font-bold font-display text-white mb-6">Create Contract</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Project Title</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Mobile App Design" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Amount (IDR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-500 text-sm">IDR</span>
                    <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="10,000,000" />
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-xl text-sm text-blue-300 border border-blue-500/20 flex gap-3 items-start">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1 text-blue-200">Zone 1 Efficiency</p>
                    Funds remain in Treasury (earning yield) until you manually trigger the escrow funding.
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <Button className="flex-1 w-full" onClick={handleCreateContract} variant="glow">Create Intent</Button>
                  <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="w-1/3">Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const StatusBadge = ({ state }: { state: ContractState }) => {
  const styles = {
    [ContractState.CREATED]: "bg-slate-800 text-slate-400 border-slate-700",
    [ContractState.FUNDED]: "bg-blue-900/30 text-blue-400 border-blue-500/30",
    [ContractState.SUBMITTED]: "bg-yellow-900/30 text-yellow-400 border-yellow-500/30",
    [ContractState.DISPUTED]: "bg-red-900/30 text-red-400 border-red-500/30",
    [ContractState.RELEASED]: "bg-emerald-900/30 text-emerald-400 border-emerald-500/30",
  };

  const labels = {
    [ContractState.CREATED]: "Draft",
    [ContractState.FUNDED]: "In Progress",
    [ContractState.SUBMITTED]: "Reviewing",
    [ContractState.DISPUTED]: "Dispute",
    [ContractState.RELEASED]: "Completed",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[state]}`}>
      {labels[state]}
    </span>
  );
};