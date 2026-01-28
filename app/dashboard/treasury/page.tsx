'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    ArrowUpRight, Timer, Wallet, ChevronRight,
    Activity, ShieldAlert, Sprout, AlertTriangle, X, RefreshCw, TrendingUp, Loader2, CheckCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';



// --- PREMIUM UI COMPONENTS ---

// --- PREMIUM UI COMPONENTS ---

const GlassCard = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("relative rounded-2xl border border-white/5 bg-[#0a101f] shadow-lg shadow-black/20 overflow-hidden", className)} {...props}>
        {/* Subtle inner gradient shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
        <div className="relative z-10">
            {children}
        </div>
    </div>
);

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' }>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",
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
                    "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:-translate-y-0.5 active:translate-y-0",
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
        default: "border-transparent bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
        secondary: "border-transparent bg-white/10 text-slate-300",
        destructive: "border-transparent bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
        outline: "text-white",
    };
    return (
        <div className={cn("inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold transition-colors", variants[variant], className)} {...props} />
    );
};

const Progress = ({ value, className, indicatorColor }: { value: number, className?: string, indicatorColor?: string }) => (
    <div className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-white/10", className)}>
        <div
            className={cn("h-full w-full flex-1 transition-all bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]", indicatorColor)}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </div>
);

import { useAddFunds } from '@/hooks/useAddFunds';
import { useWithdrawFunds } from '@/hooks/useWithdrawFunds';
import { useYieldData } from '@/hooks/useYieldData'; // Import useYieldData
import { getExplorerBaseUrl } from '@/lib/abis';

// --- MAIN PAGE COMPONENT ---

// --- PAGE COMPONENTS ---

export default function TreasuryPage() {
    // State
    const [selectedStrategy, setSelectedStrategy] = useState<any | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

    // Real Yield Data
    const { totalAssets: realTotalAssets, sharePrice, userShares, userAssets, strategies, harvestStrategy, isLoading: isYieldLoading, refetch: refetchYieldData } = useYieldData();



    // Handler for Refresh
    const handleRefresh = async () => {
        await refetchYieldData();
    };

    const showRealData = !isYieldLoading;

    // Calculate Mock Total for initial render or loading
    const mockTotal = (strategies || []).reduce((acc: any, s: any) => acc + s.debt, 0) + 2905920;

    const activeTotal = showRealData ? realTotalAssets : mockTotal;

    // Scale Chart Data
    // If Real Data is 0, chart is empty.
    // If Real Data > 0, we currently distribute it according to Mock STRATEGIES proportions 
    // because we don't have real strategy breakdown yet.
    // This is a temporary visual approximation: Real TVL distributed by Mock Weights.
    const scaleFactor = (activeTotal > 0 && mockTotal > 0) ? (activeTotal / mockTotal) : 0;

    // Fallback: If Real Data is empty (< 1 IDRX), show Mock/Target Allocation for visual purposes
    const showMockChart = activeTotal < 1.0;

    // Check if strategies are empty (no deployed funds yet)
    // If user has deposited but funds are all Liquid, visually distribute them 
    const isStrategiesEmpty = (strategies || []).every((s: any) => s.debt < 1.0);
    const useProportionalVisuals = !showMockChart && isStrategiesEmpty;

    // Mock Weights for distribution
    const mockWeights = [
        { name: 'Aave V3', weight: 0.30, color: '#8B5CF6' },
        { name: 'Compound', weight: 0.25, color: '#10B981' },
        { name: 'Idle', weight: 0.20, color: '#F59E0B' },
        { name: 'Morpho', weight: 0.15, color: '#3B82F6' },
        { name: 'Liquid', weight: 0.10, color: '#64748B' }
    ];

    let chartAllocationData;

    if (showMockChart) {
        // Mock Data for Zero Balance
        chartAllocationData = mockWeights.map(w => ({
            name: w.name,
            value: w.weight * 100, // Value as 0-100
            color: w.color
        }));
    } else if (useProportionalVisuals) {
        // Real Total Distributed Visually
        chartAllocationData = mockWeights.map(w => ({
            name: w.name,
            value: activeTotal * w.weight, // Real Total distributed
            color: w.color
        }));
    } else {
        // Real Data from Strategies
        chartAllocationData = [
            ...(strategies || []).map((s: any, i: number) => ({
                name: s.protocol,
                value: s.debt * scaleFactor,
                color: [
                    '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'
                ][i % 4]
            })),
            { name: 'Liquid', value: 2905920 * scaleFactor, color: '#64748B' }
        ];
    }

    const totalAssets = activeTotal; // Use this for display

    // Total for Chart Percentages (100 if Mock, otherwise Real Total)
    const chartTotal = showMockChart ? 100 : activeTotal;

    const {
        amount, setAmount, selectedToken, setSelectedToken, availableTokens, isModalOpen, setIsModalOpen, handleAddFunds,
        isLoading: isFunding, isSuccess: isFunded, hash: fundHash, reset,
        formattedBalance, handleMax, needsApproval, isSupported, zapStatus // Destructure zapStatus
    } = useAddFunds();

    const {
        amount: withdrawAmount, setAmount: setWithdrawAmount, selectedToken: selectedWithdrawToken, setSelectedToken: setSelectedWithdrawToken, availableTokens: availableWithdrawTokens, isModalOpen: isWithdrawModalOpen, setIsModalOpen: setIsWithdrawModalOpen, handleWithdraw,
        isLoading: isWithdrawing, isSuccess: isWithdrawn, hash: withdrawHash, reset: resetWithdraw,
        formattedBalance: formattedWithdrawBalance, handleMax: handleMaxWithdraw, isSupported: isWithdrawSupported
    } = useWithdrawFunds();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">

            {/* Background Ambient Effects - Matching Dashboard.tsx */}
            <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-purple-500/10 blur-[140px]" />

            {/* Add Funds Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0a101f] border border-white/10 rounded-[2rem] p-8 max-w-md w-full relative shadow-2xl overflow-visible group">
                        {/* Background Gradients */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                        <button onClick={reset} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full">
                            <X size={20} />
                        </button>

                        {!isFunded ? (
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Add Funds</h3>
                                <p className="text-slate-400 text-sm mb-8 font-medium">Deposit assets into the Company Treasury.</p>

                                <div className="space-y-6">
                                    {/* Amount Input & Token Select */}
                                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-slate-500">Balance: {formattedBalance}</span>
                                                <button onClick={handleMax} className="text-xs font-bold text-blue-400 cursor-pointer hover:text-blue-300 uppercase">Max</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-transparent text-3xl font-black text-white placeholder:text-slate-700 outline-none"
                                            />
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-xl transition-all border border-white/5 whitespace-nowrap min-w-[120px] justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {selectedToken === 'IDRX' ? (
                                                            <img src="/idrx-logo.png" className="w-5 h-5 rounded-full object-cover" alt="IDRX" />
                                                        ) : (
                                                            <img
                                                                src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${selectedToken.toLowerCase() === 'eurc' ? 'eur' : selectedToken.toLowerCase()}.png`}
                                                                className="w-5 h-5 rounded-full"
                                                                alt={selectedToken}
                                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png' }}
                                                            />
                                                        )}
                                                        {selectedToken}
                                                    </div>
                                                    {/* Chevron */}
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>

                                                {/* Dropdown Content */}
                                                {isDropdownOpen && (
                                                    <div className="absolute right-0 top-full mt-2 w-40 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                                                        {availableTokens.map(token => (
                                                            <button
                                                                key={token}
                                                                onClick={() => { setSelectedToken(token); setIsDropdownOpen(false); }}
                                                                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                                                            >
                                                                {token === 'IDRX' ? (
                                                                    <img src="/idrx-logo.png" className="w-5 h-5 rounded-full object-cover" alt="IDRX" />
                                                                ) : (
                                                                    <img
                                                                        src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${token.toLowerCase() === 'eurc' ? 'eur' : token.toLowerCase()}.png`}
                                                                        className="w-5 h-5 rounded-full"
                                                                        alt={token}
                                                                    />
                                                                )}
                                                                {token}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Backdrop to close dropdown */}
                                                {isDropdownOpen && (
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info details */}
                                    <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10">
                                        <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                                            <span>Exchange Rate</span>
                                            <span className="text-slate-300">1 {selectedToken} = 1 {selectedToken}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium text-slate-400">
                                            <span>Network Fee</span>
                                            <span className="text-slate-300">~0.0001 ETH</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddFunds}
                                        disabled={isFunding || !amount || !isSupported}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                    >
                                        {isFunding ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                <span>
                                                    {zapStatus === 'burning' ? 'Zapping (Burning)...' :
                                                        zapStatus === 'minting' ? 'Zapping (Minting IDRX)...' :
                                                            zapStatus === 'approving' ? 'Approving IDRX...' :
                                                                zapStatus === 'depositing' ? 'Depositing...' : 'Processing...'}
                                                </span>
                                            </>
                                        ) : selectedToken !== 'IDRX' ? 'Zap & Deposit' :
                                            needsApproval ? 'Approve IDRX' : 'Confirm Deposit'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Success Receipt UI
                            <div className="relative z-10 text-center py-6">
                                <div className="mb-8 relative flex items-center justify-center">
                                    {/* Animated Background Glow */}
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="w-24 h-24 bg-[#0a0a0a] rounded-full flex items-center justify-center relative z-10 border-4 border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.5)] animate-in zoom-in-50 duration-500">
                                        {/* Token Logo */}
                                        {selectedToken === 'IDRX' ? (
                                            <img src="/idrx-logo.png" className="w-14 h-14 object-cover rounded-full drop-shadow-2xl" alt="IDRX" />
                                        ) : (
                                            <img
                                                src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${selectedToken.toLowerCase() === 'eurc' ? 'eur' : selectedToken.toLowerCase()}.png`}
                                                className="w-14 h-14 rounded-full drop-shadow-2xl"
                                                alt={selectedToken}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png' }}
                                            />
                                        )}
                                        {/* Success Badge Overlay */}
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-[#0f172a] shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                                            <CheckCircle size={16} strokeWidth={4} />
                                        </div>
                                    </div>
                                </div>
                                <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">Deposit Successful!</h4>
                                <p className="text-slate-400 text-sm mb-8">Your assets have been secured in the vault.</p>

                                {/* Receipt Ticket */}
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>

                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Amount</span>
                                        <span className="text-white font-black text-xl tracking-tight">{amount} <span className="text-base text-slate-400">{selectedToken}</span></span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Transaction Hash</span>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`${getExplorerBaseUrl()}/tx/${fundHash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-400 font-mono text-xs bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors flex items-center gap-2"
                                            >
                                                {fundHash?.substring(0, 6)}...{fundHash?.substring(fundHash?.length - 4)}
                                                <ArrowUpRight size={10} />
                                            </a>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(fundHash || '');
                                                }}
                                                className="text-slate-500 hover:text-white transition-colors"
                                                title="Copy Hash"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={reset} className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors">
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0a101f] border border-white/10 rounded-[2rem] p-8 max-w-md w-full relative shadow-2xl overflow-visible group">
                        {/* Background Gradients (Red/Orange used for Withdraw) */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                        <button onClick={resetWithdraw} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full">
                            <X size={20} />
                        </button>

                        {!isWithdrawn ? (
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Withdraw Funds</h3>
                                <p className="text-slate-400 text-sm mb-8 font-medium">Pull assets from Company Treasury to wallet.</p>

                                <div className="space-y-6">
                                    {/* Amount Input & Token Select */}
                                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 focus-within:border-red-500/50 transition-colors">
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-slate-500">Available: {formattedWithdrawBalance}</span>
                                                <button onClick={handleMaxWithdraw} className="text-xs font-bold text-red-400 cursor-pointer hover:text-red-300 uppercase">Max</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-transparent text-3xl font-black text-white placeholder:text-slate-700 outline-none"
                                            />
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Reusing same dropdown state might be buggy if both modals open, but they shouldn't be
                                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-xl transition-all border border-white/5 whitespace-nowrap min-w-[120px] justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {selectedWithdrawToken === 'IDRX' ? (
                                                            <img src="/idrx-logo.png" className="w-5 h-5 rounded-full object-cover" alt="IDRX" />
                                                        ) : (
                                                            <img
                                                                src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${selectedWithdrawToken.toLowerCase() === 'eurc' ? 'eur' : selectedWithdrawToken.toLowerCase()}.png`}
                                                                className="w-5 h-5 rounded-full"
                                                                alt={selectedWithdrawToken}
                                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png' }}
                                                            />
                                                        )}
                                                        {selectedWithdrawToken}
                                                    </div>
                                                    {/* Chevron */}
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>

                                                {/* Dropdown Content */}
                                                {isDropdownOpen && (
                                                    <div className="absolute right-0 top-full mt-2 w-40 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                                                        {availableWithdrawTokens.map(token => (
                                                            <button
                                                                key={token}
                                                                onClick={() => { setSelectedWithdrawToken(token); setIsDropdownOpen(false); }}
                                                                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                                                            >
                                                                {token === 'IDRX' ? (
                                                                    <img src="/idrx-logo.png" className="w-5 h-5 rounded-full object-cover" alt="IDRX" />
                                                                ) : (
                                                                    <img
                                                                        src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${token.toLowerCase() === 'eurc' ? 'eur' : token.toLowerCase()}.png`}
                                                                        className="w-5 h-5 rounded-full"
                                                                        alt={token}
                                                                    />
                                                                )}
                                                                {token}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Backdrop to close dropdown */}
                                                {isDropdownOpen && (
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleWithdraw}
                                        disabled={isWithdrawing || !withdrawAmount || !isWithdrawSupported}
                                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                    >
                                        {isWithdrawing ? <Loader2 className="animate-spin" size={20} /> : !isWithdrawSupported ? 'Token Not Supported' : 'Confirm Withdrawal'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Success Receipt UI
                            <div className="relative z-10 text-center py-6">
                                <div className="mb-8 relative flex items-center justify-center">
                                    {/* Animated Background Glow */}
                                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="w-24 h-24 bg-[#0a0a0a] rounded-full flex items-center justify-center relative z-10 border-4 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-in zoom-in-50 duration-500">
                                        {/* Token Logo */}
                                        {selectedWithdrawToken === 'IDRX' ? (
                                            <img src="/idrx-logo.png" className="w-14 h-14 object-cover rounded-full drop-shadow-2xl" alt="IDRX" />
                                        ) : (
                                            <img
                                                src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${selectedWithdrawToken.toLowerCase() === 'eurc' ? 'eur' : selectedWithdrawToken.toLowerCase()}.png`}
                                                className="w-14 h-14 rounded-full drop-shadow-2xl"
                                                alt={selectedWithdrawToken}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png' }}
                                            />
                                        )}
                                        {/* Success Badge Overlay */}
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-[#0f172a] shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                                            <CheckCircle size={16} strokeWidth={4} />
                                        </div>
                                    </div>
                                </div>
                                <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-2">Withdrawal Complete!</h4>
                                <p className="text-slate-400 text-sm mb-8">Assets have been sent to your wallet.</p>

                                {/* Receipt Ticket */}
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0"></div>

                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Amount</span>
                                        <span className="text-white font-black text-xl tracking-tight">{withdrawAmount} <span className="text-base text-slate-400">{selectedWithdrawToken}</span></span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Transaction Hash</span>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`${getExplorerBaseUrl()}/tx/${withdrawHash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-400 font-mono text-xs bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors flex items-center gap-2"
                                            >
                                                {withdrawHash?.substring(0, 6)}...{withdrawHash?.substring(withdrawHash?.length - 4)}
                                                <ArrowUpRight size={10} />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={resetWithdraw} className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors">
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto relative z-10">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-1">
                            Treasury
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 max-w-xl">
                            Real-time monitoring of deployed capital and yield strategies.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="gap-2 px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            Add Funds
                        </Button>
                        <Button
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="gap-2 px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] bg-red-600/10 text-red-500 hover:bg-red-600/20 border border-red-500/20"
                        >
                            <ArrowUpRight size={18} />
                            Withdraw
                        </Button>
                        <Button
                            onClick={handleRefresh}
                            className="gap-2 px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95"
                            variant="outline"
                            disabled={isYieldLoading}
                        >
                            <RefreshCw size={18} className={cn("transition-all", isYieldLoading ? "animate-spin" : "")} />
                            {isYieldLoading ? "Refreshing..." : "Refresh Data"}
                        </Button>
                    </div>
                </div>

                {/* 2. Key Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <GlassCard className="p-6 group hover:bg-[#0a0a0a]/60 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Assets</h3>
                            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
                                <Wallet size={16} />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-white">{totalAssets.toLocaleString()}</span>
                            <span className="text-sm font-bold text-slate-500 mb-1.5">IDRX</span>
                        </div>
                        <p className="text-xs font-medium text-emerald-400 mt-2 flex items-center gap-1">
                            <TrendingUp size={12} /> +2.5% from last month
                        </p>
                    </GlassCard>

                    <GlassCard className="p-6 group hover:bg-[#0a0a0a]/60 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Share Price (NAV)</h3>
                            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                                <ArrowUpRight size={16} />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-white">{sharePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className="text-sm font-bold text-slate-500 mb-1.5">IDRX/Share</span>
                        </div>
                        <p className="text-xs font-medium text-emerald-400 mt-2 flex items-center gap-1">
                            All time high
                        </p>
                    </GlassCard>

                    <GlassCard className="p-6 group hover:bg-[#0a0a0a]/60 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Next Rebalance</h3>
                            <div className="p-2 rounded-full bg-purple-500/10 text-purple-400">
                                <Timer size={16} />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-white">4h 12m</span>
                        </div>
                        <p className="text-xs font-medium text-slate-400 mt-2">
                            Scheduled automated maintenance
                        </p>
                    </GlassCard>
                </div>

                {/* 3. Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left: Allocation Strategy (Donut) */}
                    <div className="lg:col-span-4 h-full">
                        <GlassCard className="h-full p-8 flex flex-col overflow-visible">
                            <div className="mb-6">
                                <h3 className="text-lg font-black text-white flex items-center gap-3">
                                    <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full" />
                                    Allocation
                                </h3>
                            </div>

                            <div className="flex-1 min-h-[300px] relative flex flex-col items-center justify-center">
                                {/* Chart Area */}
                                <div className="h-[280px] w-[280px] relative z-10">
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
                                                data={chartAllocationData}
                                                innerRadius={85}
                                                outerRadius={105}
                                                paddingAngle={6}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={8}
                                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                                onMouseLeave={() => setActiveIndex(undefined)}
                                            >
                                                {chartAllocationData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                        stroke="none"
                                                        style={{
                                                            filter: activeIndex === index ? 'url(#glow)' : 'none',
                                                            transition: 'all 0.3s ease',
                                                            transformOrigin: 'center center',
                                                            transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                                                            outline: 'none'
                                                        }}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                cursor={false}
                                                contentStyle={{ display: 'none' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>



                                    {/* Center Dynamic Text */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
                                        <div className="flex flex-col items-center justify-center">
                                            <motion.p
                                                key={activeIndex !== undefined ? chartAllocationData[activeIndex].value : totalAssets}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-3xl font-black text-white tracking-tighter drop-shadow-lg"
                                            >
                                                {activeIndex !== undefined
                                                    ? (chartTotal > 0 ? ((chartAllocationData[activeIndex].value / chartTotal) * 100).toFixed(1) : '0')
                                                    : '100'}%
                                            </motion.p>
                                            <motion.p
                                                key={activeIndex !== undefined ? chartAllocationData[activeIndex].name : 'Total'}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 max-w-[100px] truncate"
                                            >
                                                {activeIndex !== undefined ? chartAllocationData[activeIndex].name : 'Total Assets'}
                                            </motion.p>
                                        </div>
                                    </div>

                                    {/* Ambient Background Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-full blur-2xl -z-10 pointer-events-none"></div>
                                </div>

                                {/* Custom Legend */}
                                <div className="grid grid-cols-2 gap-3 mt-8 w-full">
                                    {chartAllocationData.map((item, index) => (
                                        <div
                                            key={item.name}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onMouseLeave={() => setActiveIndex(undefined)}
                                            className={`flex items-center justify-between text-xs p-2 rounded-lg border transition-all cursor-pointer ${activeIndex === index
                                                ? 'bg-white/10 border-white/10 scale-105 shadow-lg'
                                                : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-2 h-2 rounded-full transition-all ${activeIndex === index ? 'scale-125' : ''}`}
                                                    style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}40` }}
                                                ></div>
                                                <span className={`font-medium transition-colors ${activeIndex === index ? 'text-white' : 'text-slate-300'}`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className="font-mono font-bold text-slate-500">
                                                {chartTotal > 0 ? ((item.value / chartTotal) * 100).toFixed(0) : '0'}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right: Strategy Portfolio (Interactive List) */}
                    <div className="lg:col-span-8 h-full">
                        <GlassCard className="h-full flex flex-col">
                            <div className="p-8 border-b border-white/5">
                                <h3 className="text-lg font-black text-white flex items-center gap-3">
                                    <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
                                    Strategy Portfolio
                                </h3>
                            </div>

                            <div className="w-full">
                                {/* Header Row */}
                                <div className="grid grid-cols-12 px-8 py-4 border-b border-white/5 text-[10px] font-bold uppercase text-slate-500 tracking-widest bg-white/[0.02]">
                                    <div className="col-span-4">Strategy</div>
                                    <div className="col-span-3 text-right">Debt / Cap</div>
                                    <div className="col-span-3 pl-4">Utilization</div>
                                    <div className="col-span-2 text-right">APY</div>
                                </div>

                                {/* Rows */}
                                <div className="divide-y divide-white/5">
                                    {(strategies || []).map((strategy: any) => (
                                        <div
                                            key={strategy.id}
                                            onClick={() => setSelectedStrategy(strategy)}
                                            className="grid grid-cols-12 px-8 py-5 items-center hover:bg-white/[0.04] transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="col-span-4">
                                                <div className="flex items-center gap-3">
                                                    {/* Logo Section */}
                                                    <div className="relative flex items-center">
                                                        {strategy.tokens && strategy.tokens.length > 0 ? (
                                                            strategy.tokens.map((token: string, i: number) => (
                                                                <img
                                                                    key={i}
                                                                    src={token === 'IDRX' ? '/idrx-logo.png' : `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${token.toLowerCase() === 'eurc' ? 'eur' : token.toLowerCase()}.png`}
                                                                    className={cn(
                                                                        "w-8 h-8 rounded-full border-2 border-[#0a0a0a] shadow-md object-cover",
                                                                        i > 0 ? "-ml-3" : "z-10"
                                                                    )}
                                                                    alt={token}
                                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png' }}
                                                                />
                                                            ))
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                                <Activity size={16} className="text-blue-400" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <div className="font-bold text-white flex items-center gap-2 mb-0.5 text-sm group-hover:text-blue-200 transition-colors">
                                                            {strategy.protocol}
                                                            {strategy.status === 'Warning' && <AlertTriangle size={14} className="text-amber-500" />}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                            {strategy.tokens ? strategy.tokens.join(' / ') : strategy.name} • {strategy.debtMethod}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-3 text-right">
                                                <div className="font-mono text-sm font-bold text-slate-200">{(strategy.debt / 1000000).toFixed(1)}M <span className="text-slate-600 text-[10px]">IDRX</span></div>
                                                <div className="text-[10px] font-bold text-slate-600">/ {(strategy.cap / 1000000).toFixed(1)}M Cap</div>
                                            </div>
                                            <div className="col-span-3 pl-4 pr-2">
                                                <div className="flex items-center gap-3">
                                                    <Progress value={strategy.utilization} className="h-1.5" indicatorColor={strategy.utilization > 70 ? 'bg-amber-500 shadow-amber-500/20' : 'bg-blue-500'} />
                                                    <span className="text-xs font-mono font-bold text-slate-400 w-8 text-right">{strategy.utilization}%</span>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-right flex items-center justify-end gap-2 text-emerald-400 font-black font-mono text-sm shadow-emerald-500/10">
                                                {strategy.apy.toFixed(2)}%
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        harvestStrategy(strategy.address);
                                                    }}
                                                    className="w-8 h-8 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center transition-colors text-emerald-500 ml-2"
                                                    title="Harvest Yield"
                                                >
                                                    <Sprout size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* 4. Detail View: Custom Sheet / Drawer Implementation */}
                <StrategyDetailSheet
                    isOpen={!!selectedStrategy}
                    onClose={() => setSelectedStrategy(null)}
                    strategy={selectedStrategy}
                    onHarvest={harvestStrategy}
                />

            </div>
        </div>
    );
}

// --- SHEET COMPONENT (Dark Theme) ---

import { createPortal } from 'react-dom';

function StrategyDetailSheet({ isOpen, onClose, strategy, onHarvest }: { isOpen: boolean, onClose: () => void, strategy: any | null, onHarvest: (addr: string) => void }) {
    if (!strategy) return null;

    // Generate Mock Performance Data if real data is empty
    const getPerformanceData = () => {
        if (strategy.performance && strategy.performance.length > 0) {
            return strategy.performance;
        }
        // Mock 30 Days of positive yield
        return Array.from({ length: 30 }).map((_, i) => ({
            day: `Day ${i + 1}`,
            value: 10 + (Math.random() * 0.5) + (i * 0.1) // Simulating slight growth from 10.0
        }));
    };

    const chartData = getPerformanceData();

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[200] bg-[#000]/80 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 z-[210] h-full w-full border-l border-white/10 bg-[#0a0a0a] shadow-2xl sm:max-w-md lg:max-w-lg flex flex-col"
                    >
                        {/* Ambient Glows inside Sheet */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none" />

                        {/* Sheet Header */}
                        <div className="relative z-10 flex items-center justify-between border-b border-white/10 p-8">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">{strategy.name}</h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge variant={strategy.status === 'Active' ? 'default' : 'destructive'}>
                                        {strategy.status}
                                    </Badge>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-md">{strategy.protocol} Protocol</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="relative z-10 flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

                            {/* Chart Section */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Activity size={14} className="text-blue-500" /> Performance (30D)
                                </h3>
                                <div className="h-[200px] w-full rounded-2xl border border-white/5 bg-black/40 p-4 relative overflow-hidden">
                                    {/* Chart Grid Background */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                            <XAxis dataKey="day" hide />
                                            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#ffffff10', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                                itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
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
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Harvested</div>
                                        <div className="text-lg font-black text-white flex items-center gap-2">
                                            <Sprout size={18} className="text-emerald-500" />
                                            {strategy.harvested.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Current APY</div>
                                        <div className="text-lg font-black text-emerald-400 drop-shadow-sm">{strategy.apy}%</div>
                                    </div>
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Debt Ceiling</div>
                                        <div className="text-lg font-black text-white">{(strategy.cap / 1000000).toFixed(1)}M</div>
                                    </div>
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Risk Score</div>
                                        <div className="text-lg font-black text-white flex items-center gap-2">
                                            <ShieldAlert size={18} className={strategy.risk === 'Low' ? 'text-blue-500' : strategy.risk === 'Medium' ? 'text-amber-500' : 'text-red-500'} />
                                            {strategy.risk}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-sm">
                                <h4 className="flex items-center gap-2 text-sm font-black text-amber-500 mb-2">
                                    <AlertTriangle size={16} /> Strategy Note
                                </h4>
                                <p className="text-xs font-medium text-amber-200/60 leading-relaxed">
                                    Utilization is nearing 80%. Consider rebalancing or increasing the debt ceiling to maintain optimal yield generation efficiency.
                                </p>
                            </div>

                        </div>

                        {/* Footer Actions */}
                        <div className="relative z-10 border-t border-white/10 p-6 flex gap-4 bg-black/40 backdrop-blur-md">
                            <Button
                                onClick={() => onHarvest(strategy.address)}
                                className="flex-1 py-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] border-0"
                                variant="default"
                            >
                                <Sprout className="mr-2 h-4 w-4" />
                                Manual Harvest
                            </Button>
                            <Button className="flex-1 py-6 border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10" variant="outline">
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Emergency Withdraw
                            </Button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
