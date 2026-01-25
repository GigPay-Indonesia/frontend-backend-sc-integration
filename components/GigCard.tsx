import React from 'react';
import { BadgeCheck, Clock, Lock, ArrowUpRight } from 'lucide-react';
import { Button } from './Button';

export interface GigCardProps {
    id: string;
    title: string;
    clientBasename: string;
    clientAvatar?: string;
    isVerified?: boolean;
    tags: string[];
    budget: string;
    postedTime: string;
    isFunded?: boolean;
    onApply?: () => void;
}

export const GigCard: React.FC<GigCardProps> = ({
    title,
    clientBasename,
    clientAvatar,
    isVerified,
    tags,
    budget,
    postedTime,
    isFunded,
    onApply
}) => {
    return (
        <div className="group relative bg-[#111] border border-white/10 hover:border-blue-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] hover:-translate-y-1 flex flex-col h-full">

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={clientAvatar || `https://ui-avatars.com/api/?name=${clientBasename}&background=random`}
                            alt={clientBasename}
                            className="w-10 h-10 rounded-full border border-white/10 object-cover"
                        />
                        {isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-200 flex items-center gap-1">
                            {clientBasename}
                        </div>
                        <div className="text-xs text-slate-500">Client</div>
                    </div>
                </div>

                {/* Trust Badge */}
                {isFunded && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Escrow Funded</span>
                    </div>
                )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                {title}
            </h3>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-md text-xs text-slate-400 group-hover:border-white/10 transition-colors">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Divider */}
            <div className="mt-auto border-t border-white/5 pt-5 flex items-end justify-between">

                {/* Budget & Time */}
                <div>
                    <div className="text-2xl font-bold text-white font-mono tracking-tight mb-1">
                        {budget} <span className="text-sm text-slate-500 font-sans font-medium">IDRX</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Posted {postedTime}</span>
                    </div>
                </div>

                {/* Action */}
                <Button
                    onClick={onApply}
                    variant="secondary"
                    className="rounded-xl px-5 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all group-hover:shadow-lg"
                >
                    Apply Now
                </Button>
            </div>
        </div>
    );
};
