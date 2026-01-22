import React from 'react';
import { motion } from 'framer-motion';

interface FreelancerCardProps {
    name: string;
    role: string;
    yield_amount: string;
    image: string;
    delay?: number;
}

export const FreelancerCard: React.FC<FreelancerCardProps> = ({ name, role, yield_amount, image, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative group w-64 flex-shrink-0"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative bg-[#111111] border border-white/10 p-4 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
                <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-slate-800 relative">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + name;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="space-y-1">
                    <h3 className="font-bold text-white tracking-wide">{name}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{role}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs text-slate-500">Yield Generated</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">{yield_amount}</span>
                </div>
            </div>
        </motion.div>
    );
};
