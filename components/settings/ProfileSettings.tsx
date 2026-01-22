import React, { useState } from 'react';
import { Camera, Save, User, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileSettings: React.FC = () => {
    const [profileData, setProfileData] = useState({
        displayName: 'Zennz',
        username: 'zennz.base',
        accountName: 'Zennz Freelance',
        bankName: 'BCA',
        accountNumber: '1234567890',
        accountHolder: 'ALEXANDER ZENNZ'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-8">
            {/* Profile Picture Section */}
            <section className="bg-[#111] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-50"></div>
                <div className="relative z-10 flex items-center gap-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden">
                            <img src="/avatars/alex.png" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors shadow-lg border border-[#111]">
                            <Camera size={16} />
                        </button>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Profile Photo</h3>
                        <p className="text-slate-400 text-sm">Update your public profile picture.</p>
                    </div>
                </div>
            </section>

            {/* Personal Information */}
            <section className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="text-blue-500" size={20} />
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                        <input
                            type="text"
                            name="displayName"
                            value={profileData.displayName}
                            onChange={handleChange}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={profileData.username}
                            onChange={handleChange}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Name (Full Legal Name)</label>
                        <input
                            type="text"
                            name="accountName"
                            value={profileData.accountName}
                            onChange={handleChange}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                </div>
            </section>

            {/* Banking Information */}
            <section className="space-y-6 pt-6 border-t border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="text-emerald-500" size={20} />
                    Withdrawal Account
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bank Name</label>
                        <input
                            type="text"
                            name="bankName"
                            value={profileData.bankName}
                            onChange={handleChange}
                            placeholder="e.g. BCA, Mandiri"
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Number</label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={profileData.accountNumber}
                            onChange={handleChange}
                            placeholder="e.g. 1234567890"
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Holder Name</label>
                        <input
                            type="text"
                            name="accountHolder"
                            value={profileData.accountHolder}
                            onChange={handleChange}
                            placeholder="Must match your legal name"
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>
                </div>
            </section>

            <div className="pt-8 flex justify-end">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default ProfileSettings;
