import React from 'react';
import { CheckCircle2, FileText, Layers, Wallet, ShieldCheck } from 'lucide-react';
import { PaymentData } from '../../pages/CreatePayment';
import { ENTITY_OPTIONS } from './entityConfig';

interface Step5Props {
    data: PaymentData;
}

export const Step5Review: React.FC<Step5Props> = ({ data }) => {
    const entityLabel = ENTITY_OPTIONS.find(option => option.id === data.recipient.identity.entityType)?.label || data.recipient.identity.entityType;

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <span className="text-primary">❖</span> Review & Confirm
            </h2>

            <div className="space-y-6">
                {/* Recipient Summary */}
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-xl p-6">
                    <div className="bg-[#0a0a0a] rounded-xl p-4 border border-slate-800 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Recipient</h4>
                            <p className="text-lg font-bold text-white mb-2 underline decoration-cyan-500/30 underline-offset-4 decoration-2">
                                {data.recipient.identity.displayName || 'Unnamed Entity'}
                            </p>
                            <p className="text-slate-400 text-sm mb-2">{entityLabel} • {data.recipient.identity.email}</p>
                            <p className="text-slate-500 text-xs font-mono break-all">{data.recipient.payout.payoutAddress}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-800 rounded-lg text-cyan-400">
                            <FileText size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Payout Preferences</h4>
                            <div className="space-y-2 text-sm text-slate-300">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Preferred Asset</span>
                                    <span>{data.recipient.payout.preferredAsset}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Payout Method</span>
                                    <span>{data.recipient.payout.payoutMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Settlement Preference</span>
                                    <span>{data.recipient.payout.settlementPreference}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-800 rounded-lg text-amber-400">
                            <FileText size={20} />
                        </div>
                        <div className="flex-1 space-y-2 text-sm text-slate-300">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Profile & Policy</h4>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Risk Tier</span>
                                <span>{data.recipient.policy.riskTier}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Approval Policy</span>
                                <span>{data.recipient.policy.approvalPolicy}</span>
                            </div>
                            {data.recipient.accounting.counterpartyCode && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Counterparty Code</span>
                                    <span>{data.recipient.accounting.counterpartyCode}</span>
                                </div>
                            )}
                            {data.recipient.accounting.costCenter && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Cost Center</span>
                                    <span>{data.recipient.accounting.costCenter}</span>
                                </div>
                            )}
                            {data.recipient.profile.type === 'VENDOR' && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Vendor Category</span>
                                        <span>{data.recipient.profile.vendorCategory}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Payment Terms</span>
                                        <span>{data.recipient.profile.paymentTerms.replace('_', ' ')}</span>
                                    </div>
                                </>
                            )}
                            {data.recipient.profile.type === 'PARTNER' && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Partner Model</span>
                                        <span>{data.recipient.profile.partnerModel.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Settlement Cycle</span>
                                        <span>{data.recipient.profile.settlementCycle.replace('_', ' ')}</span>
                                    </div>
                                </>
                            )}
                            {data.recipient.profile.type === 'AGENCY' && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Payout Mode</span>
                                        <span>{data.recipient.profile.payoutMode.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Requires Milestones</span>
                                        <span>{data.recipient.profile.requiresMilestones ? 'Yes' : 'No'}</span>
                                    </div>
                                </>
                            )}
                            {data.recipient.profile.type === 'CONTRACTOR' && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Engagement Type</span>
                                        <span>{data.recipient.profile.engagementType.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">KYC Level</span>
                                        <span>{data.recipient.profile.kycLevel}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Timing Summary */}
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-800 rounded-lg text-purple-400">
                            <Layers size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Timing & Conditions</h4>
                            <div className="space-y-2 text-sm text-slate-300">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Release Condition</span>
                                    <span>{data.timing.releaseCondition.replace('ON_', '').replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Release Deadline</span>
                                    <span>{data.timing.deadline}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Yield Enabled</span>
                                    <span>{data.timing.enableYield ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Protection Enabled</span>
                                    <span>{data.timing.enableProtection ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-800 rounded-lg text-green-400">
                            <Wallet size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Summary</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-slate-300">Total Amount</span>
                                <p className="text-2xl font-bold text-white mt-1">{data.amount.value} <span className="text-primary text-lg">{data.amount.fundingAsset}</span></p>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-sm">
                                <span className="text-slate-500">Funding Asset</span>
                                <span className="text-white">{data.amount.fundingAsset}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-sm">
                                <span className="text-slate-500">Payout Asset</span>
                                <span className="text-white">{data.amount.payoutAsset}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-sm">
                                <span className="text-slate-500">Split Recipients</span>
                                <span className="text-white">{data.split.recipients.length}</span>
                            </div>
                            {data.milestones.items.length > 0 && (
                                <div className="flex justify-between items-center mt-1 text-sm">
                                    <span className="text-slate-500">Milestones</span>
                                    <span className="text-white">{data.milestones.items.length}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex gap-3 items-center">
                <CheckCircle2 className="text-cyan-400 shrink-0" size={24} />
                <div>
                    <h4 className="text-sm font-bold text-white">Ready to Create</h4>
                    <p className="text-xs text-slate-400">
                        Clicking "Confirm" will create the payment intent with these parameters.
                    </p>
                </div>
            </div>
        </div>
    );
};
