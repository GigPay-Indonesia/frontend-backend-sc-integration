import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Contract, ContractState, TreasuryStats, YieldZone } from '../types';
import { Plus, Wallet, ArrowUpRight, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const initialContracts: Contract[] = [
  { id: 'GP-101', title: 'Frontend React Development', freelancerName: 'Budi Santoso', amount: 15000000, state: ContractState.SUBMITTED, createdAt: '2023-10-25', isYielding: true },
  { id: 'GP-102', title: 'Logo Design & Brand Kit', freelancerName: 'Siti Aminah', amount: 5000000, state: ContractState.FUNDED, createdAt: '2023-10-27', isYielding: false },
  { id: 'GP-103', title: 'SEO Optimization', freelancerName: 'Pending', amount: 3500000, state: ContractState.CREATED, createdAt: '2023-10-28', isYielding: false },
];

const initialTreasury: TreasuryStats = {
  totalLiquidity: 250000000,
  bufferAmount: 50000000,
  investedAmount: 200000000,
  currency: 'IDRX'
};

export const CompanyDashboard: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [treasury] = useState<TreasuryStats>(initialTreasury);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Treasury Header */}
      <section>
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold font-display text-white">Treasury Vault</h2>
            <p className="text-slate-400">Real-time liquidity & yield visualization.</p>
          </div>
          <div className="glass-card px-6 py-3 rounded-full flex items-center gap-3">
             <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Total Assets</span>
             <span className="text-xl font-mono font-bold text-white">IDR {treasury.totalLiquidity.toLocaleString()}</span>
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
                  <p className="text-4xl font-bold font-display text-white mt-2">IDR {treasury.bufferAmount.toLocaleString()}</p>
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
                <p className="text-4xl font-bold font-display text-white mt-2">IDR {treasury.investedAmount.toLocaleString()}</p>
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
                            <TrendingUp size={12} className="mr-1.5"/> Zone 3 (Yielding)
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
                             <CheckCircle size={14} className="mr-1"/> Paid
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