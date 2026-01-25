import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { PaymentData } from '../../pages/CreatePayment';
import { TokenDropdown } from '../ui/TokenDropdown';

interface Step2Props {
    data: PaymentData;
    updateFields: (field: keyof PaymentData, value: any) => void;
}

export const Step2Amount: React.FC<Step2Props> = ({ data, updateFields }) => {
    const { amount } = data;
    const payout = data.recipient.payout;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        updateFields('amount', { ...amount, value: formatted });
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <span className="text-primary">❖</span> Amount & Assets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <TokenDropdown
                        label="Preferred Payout Asset"
                        options={['IDRX', 'USDC', 'USDT', 'DAI', 'EURC']}
                        selected={payout.preferredAsset}
                        onChange={(asset) => {
                            updateFields('recipient', {
                                ...data.recipient,
                                payout: { ...payout, preferredAsset: asset },
                            });
                            updateFields('amount', { ...amount, payoutAsset: asset });
                        }}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Payout Method
                    </label>
                    <select
                        value={payout.payoutMethod}
                        onChange={(e) => updateFields('recipient', {
                            ...data.recipient,
                            payout: { ...payout, payoutMethod: e.target.value as PaymentData['recipient']['payout']['payoutMethod'] },
                        })}
                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                    >
                        <option value="ONCHAIN">Onchain</option>
                        <option value="BANK">Bank</option>
                        <option value="HYBRID">Hybrid</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Payout Address
                    </label>
                    <input
                        type="text"
                        value={payout.payoutAddress}
                        onChange={(e) => updateFields('recipient', {
                            ...data.recipient,
                            payout: { ...payout, payoutAddress: e.target.value },
                        })}
                        placeholder="0x..."
                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Bank Account Reference
                    </label>
                    <input
                        type="text"
                        value={payout.bankAccountRef}
                        onChange={(e) => updateFields('recipient', {
                            ...data.recipient,
                            payout: { ...payout, bankAccountRef: e.target.value },
                        })}
                        placeholder="Optional for bank or hybrid payout"
                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Settlement Preference
                </label>
                <select
                    value={payout.settlementPreference}
                    onChange={(e) => updateFields('recipient', {
                        ...data.recipient,
                        payout: { ...payout, settlementPreference: e.target.value as PaymentData['recipient']['payout']['settlementPreference'] },
                    })}
                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                >
                    <option value="INSTANT">Instant</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Amount
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={amount.value}
                        onChange={handleAmountChange}
                        placeholder="0"
                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-4 text-white text-lg font-bold focus:outline-none focus:border-primary/50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold bg-[#1e293b] px-2 py-1 rounded text-xs">{amount.fundingAsset}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <TokenDropdown
                        label="Funding Asset"
                        options={['IDRX', 'USDC', 'USDT', 'DAI', 'EURC']}
                        selected={amount.fundingAsset}
                        onChange={(asset) => updateFields('amount', { ...amount, fundingAsset: asset })}
                    />
                </div>
                <div>
                    <TokenDropdown
                        label="Payout Asset"
                        options={['IDRX', 'USDC', 'USDT', 'DAI', 'EURC']}
                        selected={amount.payoutAsset}
                        onChange={(asset) => {
                            updateFields('amount', { ...amount, payoutAsset: asset });
                            updateFields('recipient', {
                                ...data.recipient,
                                payout: { ...payout, preferredAsset: asset },
                            });
                        }}
                    />
                </div>
            </div>

            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6 flex gap-3 items-center">
                <BadgeCheck className="text-primary shrink-0" size={20} />
                <p className="text-xs text-slate-400 leading-relaxed">
                    The payout asset determines what the recipient receives. Funding is reserved from the treasury when the payment is created.
                </p>
            </div>
        </div>
    );
};
