import React, { useState } from 'react';
import { Bell, Eye, EyeOff, Mail } from 'lucide-react';

const SettingsPreferences: React.FC = () => {
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        showBalance: true,
        marketingEmails: false
    });

    const toggle = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-black text-white mb-1">Preferences</h2>
                <p className="text-slate-400 text-sm">Customize your dashboard experience.</p>
            </div>

            <div className="space-y-4">
                {/* Notification Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded-2xl group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Bell className="text-purple-400" size={20} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm">Gig Notifications</h4>
                            <p className="text-slate-500 text-xs">Receive email alerts for new gig opportunities.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => toggle('emailNotifications')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${preferences.emailNotifications ? 'bg-purple-600' : 'bg-slate-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${preferences.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Balance Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded-2xl group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            {preferences.showBalance ? <Eye className="text-emerald-400" size={20} /> : <EyeOff className="text-slate-400" size={20} />}
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm">Show Balance</h4>
                            <p className="text-slate-500 text-xs">Display your wallet balance on the main dashboard.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => toggle('showBalance')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${preferences.showBalance ? 'bg-emerald-600' : 'bg-slate-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${preferences.showBalance ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Marketing Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded-2xl group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Mail className="text-blue-400" size={20} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm">Product Updates</h4>
                            <p className="text-slate-500 text-xs">Receive news about new GigPay features.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => toggle('marketingEmails')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${preferences.marketingEmails ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${preferences.marketingEmails ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPreferences;
