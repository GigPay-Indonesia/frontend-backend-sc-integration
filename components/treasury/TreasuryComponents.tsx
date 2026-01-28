import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

import { getContractAddress, getExplorerBaseUrl } from '../../lib/abis';
// --- Treasury Stats Component ---
interface TreasuryStatsProps {
    treasuryBalance?: string;
    inYield?: string;
}

export const TreasuryStats: React.FC<TreasuryStatsProps> = ({ treasuryBalance = '0.00', inYield = '0.00' }) => {
    // Mock diffs for now
    const balanceDiff = "+12.5%";
    const yieldDiff = "+4.2% APY";
    const liquidityRatio = "82%";

    const [activeIndex, setActiveIndex] = React.useState(0);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const newIndex = Math.round(scrollLeft / clientWidth);
            setActiveIndex(newIndex);
        }
    };

    return (

        <div className="relative mb-12">
            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto pb-6 md:pb-0 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
            >
                {/* 1. Total Treasury Balance */}
                <div className="min-w-[90%] md:min-w-0 snap-center bg-[#0a0a0a]/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/5 relative group overflow-hidden hover:bg-[#0a0a0a]/60 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/20 transition-all duration-500"></div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                            <Wallet size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                            <TrendingUp size={12} /> {balanceDiff}
                        </span>
                    </div>

                    <div className="relative z-10">
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Total Balance</p>
                        <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 font-mono">
                            {treasuryBalance}
                        </h3>
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                            <span>Available Liquidity</span>
                            <span className="text-white">$150,000.00</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[65%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        </div>
                    </div>
                </div>

                {/* 2. Yield Position */}
                <div className="min-w-[90%] md:min-w-0 snap-center bg-[#0a0a0a]/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/5 relative group overflow-hidden hover:bg-[#0a0a0a]/60 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 group-hover:bg-purple-500/20 transition-all duration-500"></div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                            <Activity size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-purple-400 text-xs font-bold bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
                            {yieldDiff}
                        </span>
                    </div>

                    <div className="relative z-10">
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Yield Position</p>
                        <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 font-mono">
                            {inYield}
                        </h3>
                        <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 w-[18%] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        </div>
                    </div>
                </div>

                {/* 3. Operational Liquidity */}
                <div className="min-w-[90%] md:min-w-0 snap-center bg-[#0a0a0a]/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/5 relative group overflow-hidden hover:bg-[#0a0a0a]/60 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/20 transition-all duration-500"></div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <Zap size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-slate-400 text-xs font-bold bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700/50">
                            Stable
                        </span>
                    </div>

                    <div className="relative z-10">
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Liquidity Ratio</p>
                        <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 font-mono">
                            {liquidityRatio}
                        </h3>
                        <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[82%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animated Carousel Indicators (Mobile Only) */}
            <div className="flex justify-center gap-2 md:hidden">
                {[0, 1, 2].map((index) => (
                    <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === index ? 'w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-1.5 bg-slate-800 hover:bg-slate-700'
                            }`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

// --- Treasury Charts Component ---
const dataGrowth = [
    { name: 'Jan', principal: 1000, yield: 5 },
    { name: 'Feb', principal: 1100, yield: 12 },
    { name: 'Mar', principal: 1150, yield: 25 },
    { name: 'Apr', principal: 1300, yield: 45 },
    { name: 'May', principal: 1400, yield: 80 },
    { name: 'Jun', principal: 1500, yield: 120 },
];

interface TreasuryChartsProps {
    allocationData?: { name: string; value: number; color: string }[];
}

export const TreasuryCharts: React.FC<TreasuryChartsProps> = ({ allocationData = [] }) => {
    const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(undefined);
    };

    // Calculate totals for center text
    const totalValue = allocationData.reduce((acc, item) => acc + item.value, 0);

    // Active Item Data (for center text)
    const activeItem = activeIndex !== undefined ? allocationData[activeIndex] : null;
    const activeValue = activeItem ? activeItem.value : allocationData.find(item => item.name === 'Liquid')?.value || 0;
    const activeName = activeItem ? activeItem.name : 'Total Assets';
    const activePercentage = totalValue > 0 ? ((activeItem ? activeItem.value : totalValue) / totalValue * 100).toFixed(1) : '0.0';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Growth Chart */}
            <div className="relative p-8 rounded-[2rem] bg-[#0a0a0a]/40 backdrop-blur-sm group hover:bg-[#0a0a0a]/60 transition-all duration-500 border border-white/5">
                <div className="flex items-center justify-between mb-8">
                    <h4 className="text-white font-black flex items-center gap-4 text-xl">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] group-hover:h-10 transition-all duration-300"></div>
                        Performance
                    </h4>
                    <select className="bg-white/[0.03] hover:bg-white/[0.08] text-xs font-bold text-slate-400 px-4 py-2 rounded-xl outline-none transition-colors cursor-pointer border border-white/5">
                        <option>Last 6 Months</option>
                        <option>YTD</option>
                    </select>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dataGrowth}>
                            <defs>
                                <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={15} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)' }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                cursor={{ stroke: '#ffffff20' }}
                            />
                            <Area type="monotone" dataKey="principal" stackId="1" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPrincipal)" name="Principal" />
                            <Area type="monotone" dataKey="yield" stackId="1" stroke="#22c55e" strokeWidth={3} fill="url(#colorYield)" name="Yield" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Allocation Chart */}
            <div className="relative p-8 rounded-[2rem] bg-[#0a0a0a]/40 backdrop-blur-sm group hover:bg-[#0a0a0a]/60 transition-all duration-500 border border-white/5 flex flex-col">
                <h4 className="text-white font-black mb-4 flex items-center gap-4 text-xl">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)] group-hover:h-10 transition-all duration-300"></div>
                    Allocation
                </h4>

                <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8">
                    {/* Chart Circle */}
                    <div className="h-[280px] w-[280px] relative flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <Pie
                                    data={allocationData.length > 0 ? allocationData : [{ name: 'Empty', value: 1, color: '#334155' }]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={85}
                                    outerRadius={105}
                                    paddingAngle={6}
                                    dataKey="value"
                                    stroke="none"
                                    onMouseEnter={onPieEnter}
                                    onMouseLeave={onPieLeave}
                                    cornerRadius={8}
                                >
                                    {allocationData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            style={{
                                                filter: activeIndex === index ? 'url(#glow)' : 'none',
                                                transition: 'all 0.3s ease',
                                                transformOrigin: 'center center',
                                                transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)'
                                            }}
                                            stroke="none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    cursor={false}
                                    contentStyle={{ display: 'none' }} // Hide default tooltip, using center text
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Dynamic Text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
                            <div className="flex flex-col items-center justify-center">
                                <motion.p
                                    key={activePercentage}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl font-black text-white tracking-tighter drop-shadow-lg"
                                >
                                    {activePercentage}%
                                </motion.p>
                                <motion.p
                                    key={activeName}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 max-w-[100px] truncate"
                                >
                                    {activeIndex === undefined ? 'Total Distribution' : activeName}
                                </motion.p>
                            </div>
                        </div>

                        {/* Ambient Glow behind chart */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-blue-500/5 rounded-full blur-2xl -z-10"></div>
                    </div>

                    {/* Custom Legend */}
                    <div className="flex flex-col gap-3 w-full max-w-[200px]">
                        {allocationData.map((entry, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(undefined)}
                                className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-crosshair border ${activeIndex === index
                                    ? 'bg-white/10 border-white/10 scale-105 shadow-xl'
                                    : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-all duration-300 ${activeIndex === index ? 'scale-125' : ''}`}
                                        style={{ backgroundColor: entry.color, color: entry.color }}
                                    />
                                    <span className={`text-xs font-bold transition-colors ${activeIndex === index ? 'text-white' : 'text-slate-400'}`}>
                                        {entry.name}
                                    </span>
                                </div>
                                <span className="text-xs font-mono font-bold text-slate-500">
                                    {entry.value >= 1000000
                                        ? `${(entry.value / 1000000).toFixed(1)}M`
                                        : `${(entry.value / 1000).toFixed(1)}k`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Treasury Activity Component ---
export interface ActivityItem {
    date: string;
    action: string;
    amount: string;
    hash: string;
    blockNumber: bigint;
}

interface TreasuryActivityProps {
    activities?: ActivityItem[];
    isLoading?: boolean;
}

export const TreasuryActivity: React.FC<TreasuryActivityProps> = ({ activities = [], isLoading = false }) => {
    return (
        <div className="rounded-[2rem] overflow-hidden bg-[#0a0a0a]/40 backdrop-blur-sm transition-all duration-500 hover:bg-[#0a0a0a]/60 group">
            <div className="p-8 border-b border-white/[0.02] flex justify-between items-center">
                <h4 className="text-white font-black flex items-center gap-4 text-xl">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full shadow-[0_0_15px_rgba(148,163,184,0.3)] group-hover:h-10 transition-all duration-300"></div>
                    Recent Activity
                </h4>
                <a
                    href={`${getExplorerBaseUrl()}/address/${getContractAddress('CompanyTreasuryVault')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-white font-bold uppercase tracking-wider transition-all hover:bg-blue-500 px-4 py-2 rounded-xl group/btn overflow-hidden relative flex items-center"
                >
                    <div className="absolute inset-0 bg-blue-400/20 blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                    <span className="relative z-10">View Explorer</span>
                </a>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/[0.01] text-slate-500 uppercase font-bold text-[10px] tracking-widest">
                        <tr>
                            <th className="px-8 py-5">Date</th>
                            <th className="px-8 py-5">Action</th>
                            <th className="px-8 py-5 text-right">Amount (IDRX)</th>
                            <th className="px-8 py-5 text-right">Tx Hash</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-10 text-center text-slate-500 font-bold animate-pulse">
                                    Loading blockchain history...
                                </td>
                            </tr>
                        ) : activities.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-10 text-center text-slate-500 font-bold">
                                    No recent activity found.
                                </td>
                            </tr>
                        ) : (
                            activities.map((item, i) => (
                                <tr key={i} className="hover:bg-white/[0.03] transition-colors group/row">
                                    <td className="px-8 py-5 text-slate-400 font-mono text-xs">{item.date}</td>
                                    <td className="px-8 py-5 text-white font-bold">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${item.action.includes('Harvest') ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] group-hover/row:scale-125' :
                                                item.action.includes('Deposit') ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] group-hover/row:scale-125' :
                                                    'bg-slate-500'
                                                }`}></div>
                                            {item.action}
                                        </div>
                                    </td>
                                    <td className={`px-8 py-5 text-right font-mono font-black tracking-tight ${item.amount.startsWith('+') ? 'text-green-400' : 'text-slate-300'
                                        }`}>
                                        {item.amount}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <a href="#" className="font-mono text-[10px] text-blue-400/70 hover:text-blue-400 transition-colors bg-blue-500/5 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg">{item.hash}</a>
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
