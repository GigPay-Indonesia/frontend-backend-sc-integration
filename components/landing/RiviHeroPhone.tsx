import React from 'react';

export const RiviHeroPhone: React.FC = () => {
    return (
        <div className="relative flex justify-center perspective-1000 animate-float">
            <div className="relative bg-black rounded-[3.5rem] p-3 shadow-2xl border-[6px] border-[#1a1a1a] ring-1 ring-white/10 transform transition-transform duration-700 hover:rotate-1 w-full max-w-[360px]">
                <div className="bg-[#0A0A0A] rounded-[3rem] overflow-hidden aspect-[9/19] relative flex flex-col text-white">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black h-7 w-24 rounded-full z-20"></div>
                    <div className="pt-14 px-6 pb-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center border border-white/10">
                                <span className="font-bold text-xs">JD</span>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400">Total Balance</div>
                                <div className="text-sm font-semibold tracking-tight">$84,230.50</div>
                            </div>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                            <iconify-icon icon="solar:bell-linear" width="20"></iconify-icon>
                        </button>
                    </div>

                    <div className="px-0 relative h-48 w-full mb-4">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#FF4F00]/10 to-transparent opacity-50"></div>
                        <svg viewBox="0 0 360 150" className="w-full h-full text-[#FF4F00] stroke-current fill-none" preserveAspectRatio="none">
                            <path d="M0,120 C40,110 80,130 120,90 C160,50 200,80 240,40 C280,0 320,20 360,10" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                            <path d="M0,120 C40,110 80,130 120,90 C160,50 200,80 240,40 C280,0 320,20 360,10 V150 H0 Z" className="fill-[#FF4F00]/10 stroke-none"></path>
                        </svg>
                        <div className="absolute top-[20%] right-[30%] w-3 h-3 bg-[#FF4F00] rounded-full shadow-[0_0_10px_#FF4F00] ring-4 ring-black"></div>
                        <div className="absolute top-[8%] right-[30%] bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                            <span className="text-xs font-bold text-[#FF4F00]">+12.4%</span>
                        </div>
                    </div>

                    <div className="px-6 flex gap-4 mb-8">
                        <button className="flex-1 h-14 bg-[#FF4F00] rounded-2xl flex items-center justify-center text-black font-semibold gap-2 shadow-lg shadow-[#FF4F00]/20">
                            <iconify-icon icon="solar:arrow-up-linear" width="20"></iconify-icon>
                            Send
                        </button>
                        <button className="flex-1 h-14 bg-[#1F1F1F] rounded-2xl flex items-center justify-center text-white font-semibold gap-2 border border-white/5">
                            <iconify-icon icon="solar:arrow-down-linear" width="20"></iconify-icon>
                            Receive
                        </button>
                    </div>

                    <div className="flex-1 bg-[#111] rounded-t-[2.5rem] p-6 border-t border-white/5 relative">
                        <div className="w-12 h-1 bg-gray-800 rounded-full mx-auto mb-6"></div>
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-lg font-semibold text-white">Activity</h3>
                            <a href="#" className="text-xs text-[#FF4F00]">View all</a>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-[#FF4F00] group-hover:text-black transition-colors">
                                        <iconify-icon icon="solar:cart-large-linear" width="20"></iconify-icon>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Gumroad Inc.</div>
                                        <div className="text-xs text-gray-500">Software</div>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-white">-$49.00</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-[#FF4F00] group-hover:text-black transition-colors">
                                        <iconify-icon icon="solar:user-circle-linear" width="20"></iconify-icon>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Sarah Jenkins</div>
                                        <div className="text-xs text-gray-500">Transfer</div>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-[#FF4F00]">+ $1,250.00</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-30"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#FF4F00] blur-[100px] opacity-20 -z-10 animate-pulse"></div>
        </div>
    );
};
