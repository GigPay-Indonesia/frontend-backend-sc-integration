import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import PixelBlast from '../components/PixelBlast';
import BlurText from '../components/BlurText';
import DecryptedText from '../components/DecryptedText';
import { AtSign, Lock, Eye, EyeOff } from 'lucide-react';
import { UnifiedWallet } from '../components/wallet/UnifiedWallet';
import { AccountAbstractionAuth } from '../components/wallet/AccountAbstractionAuth';
import { useAccount } from 'wagmi';

interface LoginProps {
    onConnectWallet: () => void;
}

export const Login: React.FC<LoginProps> = ({ onConnectWallet }) => {
    const navigate = useNavigate();
    const { isConnected, address } = useAccount();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isConnected && address) {
            console.log("Wallet connected:", address);
        }
    }, [isConnected, address]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">

            {/* Unified Background Effect */}
            {/* Unified Background Effect */}
            <div className="fixed inset-0 z-0 bg-[#050505]">
                <PixelBlast color="#3c00ff" />
            </div>

            <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">

                {/* Left Side: Text/Branding (Float over background) */}
                <div className="hidden lg:block space-y-8 text-center lg:text-left">
                    <div className="inline-flex justify-start">
                        <Logo className="h-20 w-auto" />
                    </div>

                    <div className="space-y-4">
                        <BlurText
                            text="Future of Work"
                            className="text-6xl font-bold font-display text-white tracking-tight leading-tight"
                            delay={150}
                            animateBy="words"
                            direction="top"
                        />
                        <div className="text-2xl text-slate-300 font-light h-16">
                            <DecryptedText
                                text="Decentralized. Secure. Limitless."
                                speed={80}
                                maxIterations={15}
                                useOriginalCharsOnly={true}
                                className="font-mono text-blue-400"
                                parentClassName="inline-block"
                                encryptedClassName="text-slate-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form (Transparent) */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-transparent p-0 relative">

                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <Logo className="h-12 w-auto" />
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2 font-display">
                                {isLogin ? 'Welcome back' : 'Create an account'}
                            </h2>
                            <p className="text-slate-400">
                                {isLogin
                                    ? 'Enter your details to access your workspace.'
                                    : 'Create a treasury workspace for your team.'}
                            </p>
                        </div>

                        {/* OnchainKit Connect Wallet */}
                        <div className="space-y-3 mb-8">
                            <AccountAbstractionAuth />

                            <div className="flex items-center w-full gap-4 my-6">
                                <div className="h-px bg-white/10 flex-1" />
                                <span className="text-sm text-slate-500 font-medium">
                                    or connect an existing wallet
                                </span>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            {/* Hide Coinbase connector here to avoid duplicating the AA button above */}
                            <div className="w-full">
                                <UnifiedWallet variant="login" hideCoinbaseInSelector />
                            </div>
                        </div>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-transparent text-slate-500 font-medium">Or continue with email</span>
                            </div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email address"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all hover:bg-black/70"
                                        required
                                    />
                                    <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                        <AtSign className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all hover:bg-black/70"
                                        required
                                    />
                                    <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                    Forgot password?
                                </button>
                            </div>

                            <Button
                                variant="glow"
                                className="w-full py-3"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                            </Button>
                        </form>

                        <p className="text-center text-slate-500 text-sm mt-8">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-white hover:text-blue-400 font-medium transition-colors"
                            >
                                {isLogin ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>
                </div>
            </div >
        </div >
    );
};
