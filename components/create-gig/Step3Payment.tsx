import React, { useState } from 'react';
import { BadgeCheck, Clock, Calendar } from 'lucide-react';
import { GigData } from '../../pages/CreateGig';

interface Step3Props {
    payment: GigData['payment'];
    updatePayment: (payment: GigData['payment']) => void;
}

export const Step3Payment: React.FC<Step3Props> = ({ payment, updatePayment }) => {
    const [isCustomDate, setIsCustomDate] = useState(false);

    const handleChange = (field: keyof GigData['payment'], value: string) => {
        updatePayment({ ...payment, [field]: value });
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
        // Format with thousand separators
        const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        handleChange('amount', formatted);
    };

    const handleWindowSelect = (days: string) => {
        setIsCustomDate(false);
        handleChange('acceptanceWindow', `${days} Days`);
    };

    // Derived values for breakdown (simple 95/3/2 split)
    const amount = parseInt(payment.amount.replace(/\./g, '')) || 0;
    const freelancerPayout = Math.floor(amount * 0.95).toLocaleString('id-ID');
    const platformFee = Math.floor(amount * 0.03).toLocaleString('id-ID');
    const tax = Math.floor(amount * 0.02).toLocaleString('id-ID');

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <span className="text-cyan-400">❖</span> Payment Configuration
            </h2>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Recipient Wallet Address
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={payment.walletAddress}
                        onChange={(e) => handleChange('walletAddress', e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-4 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400">
                        <BadgeCheck size={20} fill="currentColor" className="text-black" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Amount (IDR)
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={payment.amount}
                            onChange={handleAmountChange}
                            placeholder="0"
                            className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-4 text-white text-lg font-bold focus:outline-none focus:border-cyan-500/50"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold bg-[#1e293b] px-2 py-1 rounded text-xs">IDRX</span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Acceptance Window
                    </label>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            {['3', '7', '14'].map((day) => (
                                <button
                                    key={day}
                                    onClick={() => handleWindowSelect(day)}
                                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${payment.acceptanceWindow === `${day} Days` && !isCustomDate
                                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                            : 'bg-[#0a0a0a] border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    {day} Days
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    setIsCustomDate(true);
                                    handleChange('acceptanceWindow', '');
                                }}
                                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${isCustomDate
                                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                        : 'bg-[#0a0a0a] border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                Custom
                            </button>
                        </div>

                        {isCustomDate && (
                            <div className="relative animate-fadeIn">
                                <input
                                    type="number"
                                    value={payment.acceptanceWindow.replace(' Days', '')}
                                    onChange={(e) => handleChange('acceptanceWindow', `${e.target.value} Days`)}
                                    placeholder="Enter days"
                                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Days</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-6">Split Policy Breakdown</h4>

                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center text-slate-300">
                        <span>Freelancer Payout (95%)</span>
                        <span className="font-mono text-white">{freelancerPayout} IDRX</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                        <span>Platform Fee (3%)</span>
                        <span className="font-mono text-white">{platformFee} IDRX</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                        <span>Service Tax (2%)</span>
                        <span className="font-mono text-white">{tax} IDRX</span>
                    </div>
                    <div className="h-px bg-slate-800 my-4"></div>
                    <div className="flex justify-between items-center text-white font-bold text-lg">
                        <span>TOTAL INTENT AMOUNT</span>
                        <span className="text-cyan-400">{payment.amount || '0'} <span className="text-sm font-normal">IDRX</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
