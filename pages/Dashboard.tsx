import React, { useState } from 'react';
import { StatsGrid, PendingActionsList, ProfileActions, QuickActionsCard } from '../components/dashboard/DashboardComponents';
import { ShieldCheck, LineChart, Building2, ArrowRight, Lock, Hourglass, CheckCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { FaucetWidget } from '../components/dashboard/FaucetWidget';
import { useTreasuryData } from '../hooks/useTreasuryData';
import { useYieldData } from '../hooks/useYieldData';

// --- Tabbed Component Implementation ---
type TabType = 'activity' | 'entities';

const ActivityEntitiesTabs = () => {
    const [activeTab, setActiveTab] = useState<TabType>('activity');

    return (
        <div className="bg-[#0a101f] rounded-2xl border border-white/5 overflow-hidden shadow-lg shadow-black/20 min-h-[300px]">
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
};

export const Overview: React.FC = () => {
    const { address } = useAccount();

    const { totalAssets, strategies } = useYieldData();

    // Calculate Real Yield (Invested)
    const realYield = (strategies || []).reduce((acc: number, s: any) => acc + (s.debt || 0), 0);

    const formatIDRX = (val: number) => `IDRX ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const dashboardData = {
        treasuryBalance: totalAssets ? formatIDRX(totalAssets) : 'IDRX 0.00',
        inEscrow: '0.00',
        inYield: realYield ? formatIDRX(realYield) : 'IDRX 0.00',
        pendingActions: 3
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-purple-500/10 blur-[140px]" />
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Overview
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Treasury status and approvals in one view.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-mono text-slate-400 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-green-400" />
                            <span className="hidden sm:inline">Network Healthy</span>
                        </span>
                    </div>
                </div>

                <FaucetWidget />

                <div className="mt-4 mb-6 flex justify-end">
                    <QuickActionsCard />
                </div>

                <StatsGrid {...dashboardData} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2">
                        <PendingActionsList />
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <ProfileActions walletAddress={address} />
                    </div>
                </div>

                {/* Modified Bottom Section: Replaced grid with unified Tabbed Component */}
                <div className="w-full">
                    <ActivityEntitiesTabs />
                </div>

            </div>
        </div>
    );
};
