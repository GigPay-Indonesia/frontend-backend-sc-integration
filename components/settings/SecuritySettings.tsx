import React, { useState } from 'react';
import { Lock, Mail, Phone, Shield, Save } from 'lucide-react';

const SecuritySettings: React.FC = () => {
    const [securityData, setSecurityData] = useState({
        email: 'zennz@example.com',
        phone: '+62 812 3456 7890',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSecurityData({ ...securityData, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-8">
            {/* Intro Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                    <Shield className="text-amber-500" size={24} />
                </div>
                <div>
                    <h3 className="text-amber-500 font-bold text-lg mb-1">Account Security</h3>
                    <p className="text-amber-200/60 text-sm leading-relaxed">
                        Protect your account by keeping your contact information up to date and using a strong password.
                        We recommend enabling 2FA for maximum security.
                    </p>
                </div>
            </div>

            {/* Contact Info */}
            <section className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Mail className="text-slate-400" size={20} />
                    Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-slate-500" size={16} />
                            <input
                                type="email"
                                name="email"
                                value={securityData.email}
                                onChange={handleChange}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 text-slate-500" size={16} />
                            <input
                                type="tel"
                                name="phone"
                                value={securityData.phone}
                                onChange={handleChange}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Password Change */}
            <section className="space-y-6 pt-6 border-t border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="text-slate-400" size={20} />
                    Change Password
                </h3>
                <div className="space-y-4 max-w-2xl">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={securityData.currentPassword}
                            onChange={handleChange}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={securityData.newPassword}
                                onChange={handleChange}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={securityData.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="pt-8 flex justify-end">
                <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-amber-500/25">
                    <Save size={18} />
                    Update Security
                </button>
            </div>
        </div>
    );
};

export default SecuritySettings;
