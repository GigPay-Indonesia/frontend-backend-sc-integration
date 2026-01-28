'use client';

import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    ChevronRight, Activity, ShieldAlert, Sprout, AlertTriangle, X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// --- MOCK DATA ---
const STRATEGIES = [
    {
        id: 's1',
        name: 'Aave USDC Lender',
        protocol: 'Aave V3',
        debtMethod: 'Linear',
        debt: 4500000,
        cap: 10000000,
        apy: 4.2,
        utilization: 45,
        risk: 'Low',
        harvested: 12500,
        status: 'Active',
        performance: [
            { day: '1', value: 100 }, { day: '5', value: 102 }, { day: '10', value: 104 },
            { day: '15', value: 105 }, { day: '20', value: 108 }, { day: '25', value: 110 }, { day: '30', value: 112 }
        ]
    },
    {
        id: 's2',
        name: 'Compound SAI Strategy',
        protocol: 'Compound',
        debtMethod: 'Exponential',
        debt: 3200000,
        cap: 5000000,
        apy: 5.8,
        utilization: 64,
        risk: 'Medium',
        harvested: 8900,
        status: 'Active',
        performance: [
            { day: '1', value: 100 }, { day: '5', value: 101 }, { day: '10', value: 106 },
            { day: '15', value: 108 }, { day: '20', value: 112 }, { day: '25', value: 115 }, { day: '30', value: 120 }
        ]
    },
    {
        id: 's3',
        name: 'Idle Yield Aggregator',
        protocol: 'Idle',
        debtMethod: 'Optimized',
        debt: 2100000,
        cap: 3000000,
        apy: 3.5,
        utilization: 70,
        risk: 'Low',
        harvested: 4500,
        status: 'Warning',
        performance: [
            { day: '1', value: 100 }, { day: '5', value: 100.5 }, { day: '10', value: 101 },
            { day: '15', value: 101.5 }, { day: '20', value: 102 }, { day: '25', value: 102.5 }, { day: '30', value: 103 }
        ]
    },
    {
        id: 's4',
        name: 'Morpho Blue Supply',
        protocol: 'Morpho',
        debtMethod: 'Adaptive',
        debt: 1500000,
        cap: 2000000,
        apy: 8.1,
        utilization: 75,
        risk: 'High',
        harvested: 12000,
        status: 'Active',
        performance: [
            { day: '1', value: 100 }, { day: '5', value: 105 }, { day: '10', value: 108 },
            { day: '15', value: 115 }, { day: '20', value: 112 }, { day: '25', value: 120 }, { day: '30', value: 125 }
        ]
    }
];

// --- UI HELPERS ---
const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("rounded-[2rem] border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-sm text-white shadow-sm overflow-hidden", className)} {...props}>
        {children}
    </div>
);

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' }>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "bg-blue-600 text-white hover:bg-blue-500",
            destructive: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
            outline: "border border-white/10 bg-transparent hover:bg-white/5 text-white",
            secondary: "bg-white/10 text-white hover:bg-white/20",
            ghost: "hover:bg-white/5 text-white",
            link: "text-blue-400 underline-offset-4 hover:underline",
        };
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

const Badge = ({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "destructive" | "outline" }) => {
    const variants = {
        default: "border-transparent bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        secondary: "border-transparent bg-white/10 text-slate-300",
        destructive: "border-transparent bg-amber-500/10 text-amber-400 border border-amber-500/20",
        outline: "text-white",
    };
    return (
        <div className={cn("inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold transition-colors", variants[variant], className)} {...props} />
    );
};

const Progress = ({ value, className, indicatorColor }: { value: number, className?: string, indicatorColor?: string }) => (
    <div className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-white/10", className)}>
        <div
            className={cn("h-full w-full flex-1 transition-all bg-blue-500", indicatorColor)}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </div>
);

// --- MAIN COMPONENT ---
export default function StrategyPortfolio() {
    const [selectedStrategy, setSelectedStrategy] = useState<typeof STRATEGIES[0] | null>(null);

    return (
        <>
            <div className="mb-8">
                <Card className="h-full group hover:bg-[#0a0a0a]/60 transition-all duration-500 border border-white/5">
                    <div className="p-8 border-b border-white/5">
                        <h4 className="text-white font-black flex items-center gap-4 text-xl">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.6)] group-hover:h-10 transition-all duration-300"></div>
                            Strategy Portfolio
                        </h4>
                    </div>
                    <div>
                        <div className="w-full">
                            {/* Header Row */}
                            <div className="grid grid-cols-12 px-8 py-4 border-b border-white/5 text-xs font-bold uppercase text-slate-500 tracking-widest bg-white/[0.01]">
                                <div className="col-span-4">Strategy</div>
                                <div className="col-span-3 text-right">Debt / Cap</div>
                                <div className="col-span-3 pl-4">Utilization</div>
                                <div className="col-span-2 text-right">APY</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-white/5">
                                {STRATEGIES.map((strategy) => (
                                    <div
                                        key={strategy.id}
                                        onClick={() => setSelectedStrategy(strategy)}
                                        className="grid grid-cols-12 px-8 py-5 items-center hover:bg-white/[0.03] transition-colors cursor-pointer group/row"
                                    >
                                        <div className="col-span-4">
                                            <div className="font-bold text-white flex items-center gap-2 mb-1">
                                                {strategy.name}
                                                {strategy.status === 'Warning' && <AlertTriangle size={14} className="text-amber-500" />}
                                            </div>
                                            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{strategy.protocol} • {strategy.debtMethod}</div>
                                        </div>
                                        <div className="col-span-3 text-right">
                                            <div className="font-mono text-sm text-slate-300">{(strategy.debt / 1000000).toFixed(1)}M</div>
                                            <div className="text-[10px] font-bold text-slate-600">/ {(strategy.cap / 1000000).toFixed(1)}M</div>
                                        </div>
                                        <div className="col-span-3 pl-4 pr-2">
                                            <div className="flex items-center gap-3">
                                                <Progress value={strategy.utilization} className="h-1.5" indicatorColor={strategy.utilization > 70 ? 'bg-amber-500' : 'bg-blue-500'} />
                                                <span className="text-xs font-mono font-bold text-slate-400 w-8 text-right">{strategy.utilization}%</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-right flex items-center justify-end gap-2 text-emerald-400 font-black font-mono">
                                            {strategy.apy}%
                                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                <ChevronRight size={14} className="text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <StrategySheet
                isOpen={!!selectedStrategy}
                onClose={() => setSelectedStrategy(null)}
                strategy={selectedStrategy}
            />
        </>
    );
}

// --- SHEET COMPONENT ---
function StrategySheet({ isOpen, onClose, strategy }: { isOpen: boolean, onClose: () => void, strategy: typeof STRATEGIES[0] | null }) {
    if (!strategy) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 z-50 h-full w-full border-l border-white/10 bg-[#0f172a] shadow-2xl sm:max-w-md lg:max-w-lg flex flex-col"
                    >
                        {/* Sheet Header */}
                        <div className="flex items-center justify-between border-b border-white/10 p-8 pb-6">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">{strategy.name}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={strategy.status === 'Active' ? 'default' : 'destructive'}>
                                        {strategy.status}
                                    </Badge>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{strategy.protocol} Protocol</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

                            {/* Chart Section */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Activity size={14} className="text-blue-500" /> Performance (30D)
                                </h3>
                                <div className="h-[200px] w-full rounded-2xl border border-white/5 bg-black/20 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={strategy.performance}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                            <XAxis dataKey="day" hide />
                                            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#ffffff10', color: '#fff', borderRadius: '12px' }}
                                                itemStyle={{ color: '#10B981' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#10B981"
                                                strokeWidth={3}
                                                dot={false}
                                                activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Strategy Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Harvested</div>
                                        <div className="text-lg font-black text-white flex items-center gap-1">
                                            <Sprout size={16} className="text-emerald-500" />
                                            {strategy.harvested.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Current APY</div>
                                        <div className="text-lg font-black text-emerald-400">{strategy.apy}%</div>
                                    </div>
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Debt Ceiling</div>
                                        <div className="text-lg font-black text-white">{(strategy.cap / 1000000).toFixed(1)}M</div>
                                    </div>
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Risk Score</div>
                                        <div className="text-lg font-black text-white flex items-center gap-1">
                                            <ShieldAlert size={16} className={strategy.risk === 'Low' ? 'text-blue-500' : strategy.risk === 'Medium' ? 'text-amber-500' : 'text-red-500'} />
                                            {strategy.risk}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
                                <h4 className="flex items-center gap-2 text-sm font-black text-amber-500 mb-2">
                                    <AlertTriangle size={16} /> Strategy Note
                                </h4>
                                <p className="text-xs font-medium text-amber-200/60 leading-relaxed">
                                    Utilization is nearing 80%. Consider rebalancing or increasing the debt ceiling to maintain optimal yield generation efficiency. This strategy is currently under 24h review.
                                </p>
                            </div>

                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-white/10 p-6 flex gap-4 bg-black/20">
                            <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 py-6" variant="default">
                                <Sprout className="mr-2 h-4 w-4" />
                                Manual Harvest
                            </Button>
                            <Button className="flex-1 border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 py-6" variant="outline">
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Emergency Withdraw
                            </Button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
