import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Milestone {
    id: number;
    title: string;
    deliverables: string;
}

interface Step2Props {
    milestones: Milestone[];
    updateMilestones: (milestones: Milestone[]) => void;
}

export const Step2Scope: React.FC<Step2Props> = ({ milestones, updateMilestones }) => {

    const addMilestone = () => {
        updateMilestones([
            ...milestones,
            { id: milestones.length + 1, title: '', deliverables: '' }
        ]);
    };

    const removeMilestone = (id: number) => {
        if (milestones.length > 1) {
            updateMilestones(milestones.filter(m => m.id !== id));
        }
    };

    const updateMilestone = (id: number, field: keyof Milestone, value: string) => {
        updateMilestones(milestones.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        ));
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">❖</span> Project Milestones
                </h2>
                <button
                    onClick={addMilestone}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-cyan-400 text-sm font-bold border border-slate-700 hover:border-cyan-500/50 rounded-lg transition-all"
                >
                    <Plus size={16} /> ADD MILESTONE
                </button>
            </div>

            <div className="space-y-6">
                {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="bg-[#0f172a]/30 border border-slate-700/50 rounded-2xl p-6 relative group hover:border-slate-600 transition-colors">
                        <div className="absolute -left-3 -top-3 w-8 h-8 bg-[#1e293b] border border-slate-700 rounded-full flex items-center justify-center text-slate-400 font-bold text-sm shadow-xl">
                            {index + 1}
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 mr-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Milestone Title
                                </label>
                                <input
                                    type="text"
                                    value={milestone.title}
                                    onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                                    placeholder={index === 0 ? "UI/UX Research & High-Fidelity Mockups" : "Frontend Development (MVP)"}
                                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                                />
                            </div>
                            {milestones.length > 1 && (
                                <button
                                    onClick={() => removeMilestone(milestone.id)}
                                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-6"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Expected Deliverables
                            </label>
                            <textarea
                                value={milestone.deliverables}
                                onChange={(e) => updateMilestone(milestone.id, 'deliverables', e.target.value)}
                                placeholder="- User persona documentation&#10;- Interactive Figma prototype&#10;- Design system documentation"
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-4 py-3 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all min-h-[120px] font-mono text-sm leading-relaxed"
                            ></textarea>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addMilestone}
                className="w-full py-4 border-2 border-dashed border-slate-800 hover:border-cyan-500/30 hover:bg-cyan-500/5 rounded-2xl text-slate-500 hover:text-cyan-400 font-bold transition-all flex flex-col items-center justify-center gap-2 group"
            >
                <div className="bg-slate-800 group-hover:bg-cyan-500/20 p-2 rounded-full transition-colors">
                    <Plus size={20} />
                </div>
                ADD ANOTHER MILESTONE
            </button>
        </div>
    );
};
