import React, { useRef, useEffect } from 'react';
import { Plus, X, Link as LinkIcon, Bold, Italic, List } from 'lucide-react';
import { GigData } from '../../pages/CreateGig';

interface Step1Props {
    data: GigData;
    updateFields: (field: keyof GigData, value: any) => void;
}

export const Step1Job: React.FC<Step1Props> = ({ data, updateFields }) => {
    const [newReq, setNewReq] = React.useState('');
    const editorRef = useRef<HTMLDivElement>(null);

    // Sync editor content with state on mount
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== data.description) {
            if (data.description === '') {
                // Initial empty state
            } else {
                editorRef.current.innerHTML = data.description;
            }
        }
    }, []);

    const handleFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            updateFields('description', editorRef.current.innerHTML);
        }
        editorRef.current?.focus();
    };

    const addRequirement = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newReq.trim()) {
            updateFields('requirements', [...data.requirements, newReq.trim()]);
            setNewReq('');
        }
    };

    const removeRequirement = (index: number) => {
        const newReqs = data.requirements.filter((_, i) => i !== index);
        updateFields('requirements', newReqs);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Job Title
                </label>
                <input
                    type="text"
                    value={data.jobTitle}
                    onChange={(e) => updateFields('jobTitle', e.target.value)}
                    placeholder="e.g. Senior Smart Contract Developer for DEX Integration"
                    className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-900 transition-all font-medium"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Detailed Description
                </label>
                <div className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl overflow-hidden focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-900 transition-all">
                    {/* Functional Toolbar */}
                    <div className="flex items-center gap-1 border-b border-slate-700/50 px-2 py-2 bg-slate-900/30">
                        <button
                            onClick={() => handleFormat('bold')}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Bold"
                        >
                            <Bold size={14} />
                        </button>
                        <button
                            onClick={() => handleFormat('italic')}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Italic"
                        >
                            <Italic size={14} />
                        </button>
                        <button
                            onClick={() => handleFormat('insertUnorderedList')}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Bullet List"
                        >
                            <List size={14} />
                        </button>
                        <div className="w-px h-4 bg-slate-700 mx-1"></div>
                    </div>

                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={(e) => updateFields('description', e.currentTarget.innerHTML)}
                        className="w-full bg-transparent p-4 min-h-[150px] text-slate-300 focus:outline-none prose prose-invert prose-sm max-w-none"
                        style={{ minHeight: '150px' }}
                    />

                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Requirements
                </label>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={newReq}
                                onChange={(e) => setNewReq(e.target.value)}
                                onKeyDown={addRequirement}
                                placeholder="Add a specific skill or qualification..."
                                className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (newReq.trim()) {
                                    updateFields('requirements', [...data.requirements, newReq.trim()]);
                                    setNewReq('');
                                }
                            }}
                            className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {data.requirements.map((req, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-lg text-sm text-slate-300 animate-fadeIn">
                                <span>{req}</span>
                                <button onClick={() => removeRequirement(idx)} className="text-slate-500 hover:text-red-400 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    External Links (Portfolio/Brief)
                </label>
                <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={data.externalLink}
                        onChange={(e) => updateFields('externalLink', e.target.value)}
                        placeholder="https://notion.so/project-brief..."
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono text-sm"
                    />
                </div>
            </div>
        </div>
    );
};
