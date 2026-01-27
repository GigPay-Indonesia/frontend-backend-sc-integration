import React from 'react';

export const RiviWorkflow: React.FC = () => {
    return (
        <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group relative">
                <div className="glass-panel h-72 rounded-3xl mb-8 relative overflow-hidden flex items-center justify-center bg-[#030303] hover:border-[#FF4F00]/30 transition-colors duration-500">
                    {/* Animation: Connect */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Background circles */}
                        <div className="absolute w-[200%] h-[200%] border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
                        <div className="absolute w-[140%] h-[140%] border border-white/5 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div>

                        {/* Central Wallet */}
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center relative shadow-2xl">
                                <iconify-icon icon="solar:wallet-linear" width="32" class="text-white"></iconify-icon>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF4F00] rounded-full animate-ping"></div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF4F00] rounded-full"></div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-[#FF4F00]/10 text-[#FF4F00] text-xs font-mono font-medium border border-[#FF4F00]/20">
                                Connecting...
                            </div>
                        </div>

                        {/* Particles */}
                        <div className="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full animate-[spin_4s_linear_infinite] opacity-50">
                            <div className="w-2 h-2 bg-[#FF4F00] rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_10px_#FF4F00]"></div>
                        </div>
                    </div>
                </div>
                <div className="px-4">
                    <div className="inline-block text-[#FF4F00] font-mono text-xs mb-3 px-2 py-1 bg-[#FF4F00]/10 rounded border border-[#FF4F00]/20">01</div>
                    <h3 className="text-xl font-semibold text-white mb-3">Connect Wallet</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">Link your preferred wallet securely. We support MetaMask, Phantom, and Ledger hardware wallets with zero setup.</p>
                </div>
            </div>

            {/* Step 2 */}
            <div className="group relative">
                <div className="glass-panel h-72 rounded-3xl mb-8 relative overflow-hidden flex flex-col items-center justify-center bg-[#030303] hover:border-[#FF4F00]/30 transition-colors duration-500">
                    {/* Animation: Transfer UI */}
                    <div className="w-[220px] bg-[#0A0A0A] rounded-2xl border border-white/10 p-5 space-y-4 relative shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                        {/* Input Field */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                <span>Recipient</span>
                            </div>
                            <div className="h-8 w-full bg-[#151515] rounded border border-white/5 flex items-center px-3 gap-2">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></div>
                                <div className="text-xs text-white overflow-hidden whitespace-nowrap animate-typing w-0 border-r border-[#FF4F00] pr-1">alex.eth</div>
                            </div>
                        </div>

                        {/* Amount Field */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                <span>Amount</span>
                            </div>
                            <div className="h-10 w-full bg-[#151515] rounded border border-white/5 flex items-center px-3 relative overflow-hidden">
                                {/* Progress Bar */}
                                <div className="absolute top-0 left-0 h-full bg-[#FF4F00]/10 animate-progress"></div>
                                <span className="text-white font-mono text-sm z-10">$450.00</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-4">
                    <div className="inline-block text-[#FF4F00] font-mono text-xs mb-3 px-2 py-1 bg-[#FF4F00]/10 rounded border border-[#FF4F00]/20">02</div>
                    <h3 className="text-xl font-semibold text-white mb-3">Input Details</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">Enter an ENS, wallet address, or select a contact. GigPay automatically validates the chain and calculates gas fees.</p>
                </div>
            </div>

            {/* Step 3 */}
            <div className="group relative">
                <div className="glass-panel h-72 rounded-3xl mb-8 relative overflow-hidden flex items-center justify-center bg-[#030303] hover:border-[#FF4F00]/30 transition-colors duration-500">
                    {/* Animation: Success */}
                    <div className="relative flex flex-col items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background Circle */}
                            <circle cx="50" cy="50" r="40" className="stroke-[#222] fill-none stroke-[2]"></circle>
                            {/* Animated Circle */}
                            <circle cx="50" cy="50" r="40" className="stroke-[#FF4F00] fill-none stroke-[2] animate-circle-draw" strokeDasharray="251" strokeLinecap="round"></circle>
                        </svg>
                        {/* Checkmark */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FF4F00]">
                            <svg className="w-12 h-12" viewBox="0 0 50 50">
                                <path d="M15 25 L22 32 L35 18" className="stroke-current fill-none stroke-[3] animate-check-draw" strokeDasharray="50" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                        </div>
                        <div className="absolute -bottom-8 text-xs font-mono text-[#FF4F00] tracking-widest uppercase animate-pulse">Confirmed</div>
                    </div>
                </div>
                <div className="px-4">
                    <div className="inline-block text-[#FF4F00] font-mono text-xs mb-3 px-2 py-1 bg-[#FF4F00]/10 rounded border border-[#FF4F00]/20">03</div>
                    <h3 className="text-xl font-semibold text-white mb-3">Instant Settlement</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">Sign once with FaceID. Funds arrive in seconds on L2s. Receive a tax-ready receipt immediately.</p>
                </div>
            </div>
        </div>
    );
};
