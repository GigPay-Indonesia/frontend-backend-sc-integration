import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ChromaGrid from '../components/ChromaGrid';
import { IconTreasury, IconEscrow, IconIncentives, IconTrustless } from '../components/AboutIcons';

import PixelBlast from '../components/PixelBlast';
import HeroPhone from '../components/landing/HeroPhone';

interface LandingProps {
  onConnect: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onConnect }) => {
  const navigate = useNavigate();


  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#050505] text-[#EDEDED]">
      <style>{`
        body {
          background-color: #050505;
          color: #EDEDED;
          -webkit-font-smoothing: antialiased;
        }
        .technical-grid {
          background-size: 40px 40px;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
        }
        .glass-panel {
          background: rgba(10, 10, 10, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .glow-text {
          text-shadow: 0 0 40px rgba(139, 92, 246, 0.4), 0 0 80px rgba(56, 189, 248, 0.3);
        }
        .tech-texture {
          background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(circle at 50% 0%, black 40%, transparent 80%);
        }
        .node-line { stroke-dasharray: 4; animation: dash 30s linear infinite; }
        @keyframes dash { to { stroke-dashoffset: -100; } }
        @keyframes signal-flow {
          0% { stroke-dashoffset: 60; opacity: 0; }
          5% { opacity: 1; }
          90% { stroke-dashoffset: -360; opacity: 1; }
          95% { opacity: 0; }
          100% { stroke-dashoffset: -360; opacity: 0; }
        }
        .signal-path { stroke-dasharray: 60 400; stroke-dashoffset: 60; animation: signal-flow 6s linear infinite; }
        .node-box { fill: #171717; stroke: #333; }
        .node-text { fill: #ccc; font-size: 9px; font-weight: 500; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.8; } 50% { opacity: 0.4; } }
        .animate-pulse-slow { animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes blurReveal {
          0% { opacity: 0; transform: translateY(20px); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient { animation: gradient 6s ease infinite; }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes load-bar {
          0% { width: 0%; }
          100% { width: 66%; }
        }
        .animate-scan { animation: scan 3s linear infinite; }
        .animate-load { animation: load-bar 2s ease-out forwards; }
        .hover-card-bg { transition: opacity 0.5s ease; opacity: 0; }
        .group:hover .hover-card-bg { opacity: 1; }
        .animate-reveal { animation: blurReveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .animate-reveal-delay { animation: blurReveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s forwards; opacity: 0; }
        .animate-fade-in-delay { animation: fadeIn 1s ease-out 0.5s forwards; opacity: 0; }
      `}</style>

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
        <PixelBlast color="#6366f1" />
      </div>

      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_top,#1e1b4b,transparent_70%)]"></div>
      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none tech-texture"></div>



      <main className="relative z-10 flex flex-col w-full">
        {/* HERO SECTION */}
        <section id="home" className="relative min-h-[90vh] flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 lg:px-20 pt-20 pb-20 gap-16">
          <div className="max-w-3xl space-y-10">
            <div className="space-y-6">
              <h1 className="font-display text-6xl md:text-8xl font-black tracking-tight text-white leading-[0.9] glow-text select-none">
                <span className="block animate-reveal">Run your treasury</span>
                <span className="block animate-reveal-delay bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-[length:200%_auto] animate-gradient">like software.</span>
              </h1>
              <p className="max-w-md font-sans text-base text-gray-400 leading-relaxed font-light animate-fade-in-delay">
                A programmable Treasury + Payments OS for businesses, platforms, and global teams. Fund once, pay many,
                automate settlement, and keep idle capital productive.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                className="group relative isolate overflow-hidden bg-white text-black text-sm font-semibold px-8 py-3 rounded hover:bg-gray-100 transition-all duration-300 hover:scale-[1.02] flex items-center gap-2"
                onClick={() => navigate('/login')}
              >
                <span>Launch App</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-[400px] flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/40 via-blue-400/20 to-cyan-400/30 blur-[60px] opacity-100"></div>
            <HeroPhone />
          </div>
        </section>



        {/* ENTITY SHOWCASE */}
        <section className="border-y border-white/5 py-16 bg-[#050505]/50">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="h-[560px] w-full relative">
              <ChromaGrid
                items={[
                  {
                    image: '/avatars/alex.png',
                    title: 'Nusa Creative Studio',
                    subtitle: 'Entity: Agency',
                    handle: 'Treasury • Active',
                    borderColor: '#3B82F6',
                    gradient: 'linear-gradient(145deg, #3B82F6, #000)'
                  },
                  {
                    image: '/avatars/sarah.png',
                    title: 'PT SatuTek',
                    subtitle: 'Entity: Vendor',
                    handle: '12 Payments • Active',
                    borderColor: '#EC4899',
                    gradient: 'linear-gradient(145deg, #EC4899, #000)'
                  },
                  {
                    image: '/avatars/mike.png',
                    title: 'Karsa Logistics',
                    subtitle: 'Entity: Partner',
                    handle: 'Receiving via USDC',
                    borderColor: '#F59E0B',
                    gradient: 'linear-gradient(145deg, #F59E0B, #000)'
                  },
                  {
                    image: '/avatars/elena.png',
                    title: 'Vista Media',
                    subtitle: 'Entity: Creator Network',
                    handle: 'Approvals • In Review',
                    borderColor: '#10B981',
                    gradient: 'linear-gradient(145deg, #10B981, #000)'
                  },
                  {
                    image: '/avatars/david.png',
                    title: 'Ritma Finance',
                    subtitle: 'Entity: Finance Ops',
                    handle: 'Settlement • Running',
                    borderColor: '#8B5CF6',
                    gradient: 'linear-gradient(145deg, #8B5CF6, #000)'
                  }
                ]}
              />
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="about" className="py-24 px-6 md:px-12 lg:px-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Card 1: Programmable Treasury */}
              <div className="md:col-span-8 group relative bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="max-w-md">
                      <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <IconTreasury className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-blue-100 transition-colors">Programmable Treasury</h3>
                      <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300 transition-colors">
                        Your treasury is no longer a static balance. Funds automatically route between liquidity, payments,
                        and low-risk strategies based on real operational needs.
                      </p>
                    </div>
                    <div className="hidden lg:block">
                      <div className="px-3 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-gray-400 uppercase tracking-wider group-hover:bg-blue-500/10 group-hover:text-blue-300 transition-colors">
                        Treasury
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 h-24 w-full relative flex items-center border-t border-white/5 pt-6 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 600 100" preserveAspectRatio="xMidYMid meet">
                      <path
                        d="M20,50 C100,50 120,20 200,20 C280,20 300,80 380,80 C460,80 480,50 560,50"
                        fill="none"
                        stroke="#222"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      ></path>
                      <path
                        d="M20,50 C100,50 120,20 200,20 C280,20 300,80 380,80 C460,80 480,50 560,50"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="600"
                        strokeDashoffset="600"
                        className="transition-all duration-[2000ms] ease-in-out group-hover:stroke-dashoffset-0 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                      ></path>
                      <g className="transition-all duration-500 delay-0 opacity-100 group-hover:scale-125 origin-center">
                        <circle cx="20" cy="50" r="4" fill="#60a5fa"></circle>
                      </g>
                      <g className="transition-all duration-500 delay-[400ms] opacity-50 scale-75 group-hover:opacity-100 group-hover:scale-125 origin-center">
                        <circle cx="200" cy="20" r="4" fill="#050505" stroke="#60a5fa" strokeWidth="2"></circle>
                      </g>
                      <g className="transition-all duration-500 delay-[800ms] opacity-50 scale-75 group-hover:opacity-100 group-hover:scale-125 origin-center">
                        <circle cx="380" cy="80" r="4" fill="#050505" stroke="#60a5fa" strokeWidth="2"></circle>
                      </g>
                      <g className="transition-all duration-500 delay-[1200ms] opacity-50 scale-75 group-hover:opacity-100 group-hover:scale-125 origin-center">
                        <circle cx="560" cy="50" r="4" fill="#60a5fa"></circle>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 2: Payment Intents (Animated Loading) */}
              <div className="md:col-span-4 group relative bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] flex flex-col">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <div className="p-10 relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <IconEscrow className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-emerald-100 transition-colors">Payment Intents</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-8 group-hover:text-gray-300">
                    Active “Yield Mode” keeps capital productive during waiting periods. Verifiable lifecycle: Created → Funded → Released.
                  </p>
                  <div className="mt-auto relative w-full h-28 flex flex-col justify-end items-center">
                    <div className="absolute w-[85%] h-10 bg-white/5 border border-white/5 rounded-t-md top-6 scale-90 opacity-40"></div>
                    <div className="relative w-full h-14 bg-[#171717] border border-white/10 rounded shadow-sm flex items-center px-4 gap-4 z-10 group-hover:border-emerald-500/30 transition-colors">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-semibold text-white uppercase tracking-wide">Status</span>
                          <span className="text-[10px] font-mono text-emerald-400">Processing...</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded animate-load w-0"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Incentives (Hover Pulse) */}
              <div className="md:col-span-6 group relative bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                <div className="p-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1 max-w-lg">
                    <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center mb-6 text-pink-400 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                      <IconIncentives className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-pink-100">Aligned Incentives</h3>
                    <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300">
                      Delays and long approvals no longer waste capital. Funds can stay productive while stakeholders
                      resolve reviews and disputes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Auditable (Scanning effect) */}
              <div className="md:col-span-6 group relative bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                {/* Scanning Bar */}
                <div className="absolute w-full h-full pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute w-full h-[2px] bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,1)] animate-scan"></div>
                </div>

                <div className="p-10 flex flex-col md:flex-row items-center gap-10 relative z-10">
                  <div className="flex-1 max-w-lg">
                    <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      <IconTrustless className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-indigo-100">Auditable by Design</h3>
                    <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300">
                      Every action emits an onchain event. Every payment has a verifiable timeline — built for compliance,
                      reconciliation, and reporting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>




        {/* CAPITAL FLOW SECTION */}
        <section id="how-it-works" className="py-24 px-6 md:px-12 lg:px-20 relative z-10 border-y border-white/5 bg-[#050505]/50">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <span className="text-blue-400 font-mono text-xs uppercase tracking-wider">The Engine</span>
              <h2 className="text-3xl md:text-4xl font-display font-medium text-white">Capital Flow Engine</h2>
              <p className="text-gray-400 leading-relaxed">
                Visualize and control how funds move through your organization. Programmable intents ensure
                capital is always in the right state—whether liquid, in escrow, or earning yield—automatically.
              </p>
            </div>
            <div className="relative w-full max-w-lg aspect-square lg:aspect-[4/3] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/40 via-blue-400/20 to-cyan-400/30 blur-[60px] opacity-100"></div>
              <div className="w-full h-full p-6 relative overflow-hidden rounded-xl border border-white/10 bg-black">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                <div className="h-full w-full flex flex-col">
                  <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Capital Flow</span>
                    <div className="flex gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/50"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
                    </div>
                  </div>

                  <div className="flex-1 relative">
                    <svg className="w-full h-full" viewBox="0 0 420 280">
                      <path d="M50,140 C110,140 110,80 170,80" fill="none" stroke="#60a5fa" strokeWidth="1" className="node-line"></path>
                      <path d="M50,140 C110,140 110,200 170,200" fill="none" stroke="#818cf8" strokeWidth="1" className="node-line"></path>
                      <path d="M170,80 C230,80 230,120 290,120" fill="none" stroke="#60a5fa" strokeWidth="1" className="node-line"></path>
                      <path d="M170,200 C230,200 230,170 290,170" fill="none" stroke="#818cf8" strokeWidth="1" className="node-line"></path>
                      <path d="M290,120 L360,145" fill="none" stroke="#60a5fa" strokeWidth="1" className="node-line"></path>
                      <path d="M290,170 L360,145" fill="none" stroke="#818cf8" strokeWidth="1" className="node-line"></path>

                      <path
                        d="M50,140 C110,140 110,80 170,80 C230,80 230,120 290,120 L360,145"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        className="signal-path"
                      ></path>

                      <circle cx="50" cy="140" r="4" fill="#fff"></circle>
                      <text x="50" y="160" textAnchor="middle" className="node-text">
                        Treasury
                      </text>

                      <rect x="155" y="68" width="90" height="24" rx="5" className="node-box"></rect>
                      <text x="200" y="84" textAnchor="middle" className="node-text">
                        Payment Intent
                      </text>

                      <rect x="155" y="188" width="90" height="24" rx="5" className="node-box"></rect>
                      <text x="200" y="204" textAnchor="middle" className="node-text">
                        Yield Mode
                      </text>

                      <rect x="270" y="108" width="80" height="24" rx="5" className="node-box"></rect>
                      <text x="310" y="124" textAnchor="middle" className="node-text">
                        Escrow
                      </text>

                      <circle cx="360" cy="145" r="11" fill="#fff"></circle>
                      <path d="M357 145l2 2 5-5" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"></path>
                      <text x="360" y="170" textAnchor="middle" className="node-text">
                        Release
                      </text>
                    </svg>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-medium px-3 py-1.5 rounded-full shadow-2xl animate-pulse-slow">
                      Settlement Ready
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 md:px-12 lg:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-[100px] opacity-20"></div>
              <h2 className="text-4xl md:text-5xl font-semibold font-display mb-8 relative z-10">
                Ready to run your <br /> treasury like software?
              </h2>
              <button
                className="relative z-10 px-10 py-4 text-sm font-semibold rounded-full bg-white text-black hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                onClick={() => navigate('/login')}
              >
                Launch App
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
