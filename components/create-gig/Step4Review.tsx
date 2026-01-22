import React from 'react';
import { CheckCircle2, FileText, Layers, Wallet } from 'lucide-react';
import { GigData } from '../../pages/CreateGig';

interface Step4Props {
    data: GigData;
}

export const Step4Review: React.FC<Step4Props> = ({ data }) => {
    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <span className="text-cyan-400">❖</span> Review & Deploy
            </h2>

            <div className="space-y-6">
                {/* Job Summary */}
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-800 rounded-lg text-cyan-400">
                            <FileText size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Job Details</h4>
                            <p className="text-lg font-bold text-white mb-2 underline decoration-cyan-500/30 underline-offset-4 decoration-2">
                                {data.jobTitle || 'Untitled Gig'}
                            </p>
                            <div
                                className="text-slate-400 text-sm line-clamp-3 prose prose-invert prose-sm max-w-none mb-4 opacity-80"
                                dangerouslySetInnerHTML={{ __html: data.description || 'No description provided.' }}
                            />
                            <div className="flex flex-wrap gap-2">
                                {data.requirements.map((req, i) => (
                                    <span key={i} className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">
                                        {req}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scope Summary */}
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-800 rounded-lg text-purple-400">
                            <Layers size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Scope & Milestones</h4>
                            <div className="space-y-3">
                                {data.milestones.map((m, index) => (
                                    <div key={m.id} className="flex justify-between items-center bg-[#0a0a0a] p-3 rounded-lg border border-slate-800">
                                        <div className="flex flex-col">
                                            <span className="text-slate-300 font-medium text-sm">
                                                {index + 1}. {m.title || 'Untitled Milestone'}
                                            </span>
                                            {m.deliverables && <span className="text-xs text-slate-500 mt-1 pl-4 border-l-2 border-slate-800">{m.deliverables}</span>}
                                        </div>
                                        <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400 ml-2 whitespace-nowrap">Pending</span>
                                    </div>
                                ))}
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
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Escrow Configuration</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-slate-300">Total Deposit</span>
                                <span className="text-xl font-bold text-white">{data.payment.amount} <span className="text-sm text-slate-500">IDRX</span></span>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-sm">
                                <span className="text-slate-500">Recipient</span>
                                <span className="font-mono text-cyan-400 break-all ml-4 text-right">{data.payment.walletAddress}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-sm">
                                <span className="text-slate-500">Acceptance Window</span>
                                <span className="text-white">{data.payment.acceptanceWindow}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex gap-3 items-center">
                <CheckCircle2 className="text-cyan-400 shrink-0" size={24} />
                <div>
                    <h4 className="text-sm font-bold text-white">Ready to Deploy</h4>
                    <p className="text-xs text-slate-400">
                        Clicking "Confirm & Deploy" will initiate the wallet signature to deploy the smart contract with these parameters.
                    </p>
                </div>
            </div>
        </div>
    );
};
