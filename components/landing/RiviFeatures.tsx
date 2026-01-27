import React from 'react';

export const RiviFeatures: React.FC = () => {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-12 h-12 bg-[#FF4F00]/10 rounded-full flex items-center justify-center mb-6 text-[#FF4F00] group-hover:scale-110 transition-transform">
                    <iconify-icon icon="solar:shield-check-linear" width="28"></iconify-icon>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Private by Default</h3>
                <p className="text-lg text-gray-400 leading-relaxed">Your transaction data never leaves your device. Local encryption ensures what's yours stays yours.</p>
            </div>
            {/* Feature 2 */}
            <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-12 h-12 bg-[#FF4F00]/10 rounded-full flex items-center justify-center mb-6 text-[#FF4F00] group-hover:scale-110 transition-transform">
                    <iconify-icon icon="solar:bolt-linear" width="28"></iconify-icon>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Instant Settlement</h3>
                <p className="text-lg text-gray-400 leading-relaxed">Say goodbye to T+2. GigPay settles transactions on-chain in seconds, available globally 24/7.</p>
            </div>
            {/* Feature 3 */}
            <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-12 h-12 bg-[#FF4F00]/10 rounded-full flex items-center justify-center mb-6 text-[#FF4F00] group-hover:scale-110 transition-transform">
                    <iconify-icon icon="solar:wallet-money-linear" width="28"></iconify-icon>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Zero-Fee Transfers</h3>
                <p className="text-lg text-gray-400 leading-relaxed">Send stablecoins to any GigPay user without gas fees. We subsidize the network costs for you.</p>
            </div>
        </div>
    );
};
