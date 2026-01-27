import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ChromaGrid from '../components/ChromaGrid';
import { IconTreasury, IconEscrow, IconIncentives, IconTrustless } from '../components/AboutIcons';

interface LandingProps {
  onConnect: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onConnect }) => {
  const navigate = useNavigate();
  const lifecycleRef = useRef<HTMLElement | null>(null);
  const lifecycleHeaderRef = useRef<HTMLDivElement | null>(null);
  const lifecycleLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = lifecycleRef.current;
    const header = lifecycleHeaderRef.current;
    const line = lifecycleLineRef.current;
    if (!section || !header || !line) return;

    const steps = section.querySelectorAll<HTMLDivElement>('.lifecycle-step');

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;
      const travelDistance = rect.height - viewH;
      const scrolled = -rect.top;
      let progress = scrolled / travelDistance;
      progress = Math.max(0, Math.min(1, progress));

      header.style.opacity = progress > 0.02 ? '1' : '0';
      line.style.height = `${progress * 100}%`;

      steps.forEach((step) => {
        const threshold = Number(step.dataset.threshold || 0);
        if (progress >= threshold) {
          if (progress < threshold + 0.18) {
            step.classList.add('active');
            step.classList.remove('opacity-30', 'opacity-50');
            step.classList.add('opacity-100');
            step.style.transform = 'scale(1.02)';
          } else {
            step.classList.add('active');
            step.classList.remove('opacity-30', 'opacity-100');
            step.classList.add('opacity-50');
            step.style.transform = 'scale(1)';
          }
        } else {
          step.classList.remove('active');
          step.classList.remove('opacity-100', 'opacity-50');
          step.classList.add('opacity-30');
          step.style.transform = 'scale(1)';
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
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
      `}</style>

      <div className="fixed inset-0 z-0 technical-grid pointer-events-none"></div>
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_top,#1f1f1f,transparent_55%)]"></div>

      <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 md:px-12 flex justify-between items-center bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white text-black flex items-center justify-center rounded-sm text-[10px] font-bold">
            GP
          </div>
          <span className="font-display text-sm font-semibold tracking-tight text-white">GigPay</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="hidden md:inline-flex text-xs font-medium text-gray-400 hover:text-white transition-colors"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            How it Works
          </button>
          <button
            className="group relative isolate overflow-hidden bg-white text-black text-xs font-semibold px-5 py-2 rounded shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            onClick={() => navigate('/login')}
          >
            <span className="relative z-20">Launch App</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-col w-full">
        {/* HERO SECTION */}
        <section id="home" className="relative min-h-[90vh] flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 lg:px-20 pt-32 pb-20 gap-16">
          <div className="max-w-2xl space-y-10">
            <div className="space-y-6">
              <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tighter text-white leading-[0.95] glow-text">
                Run your treasury
                <br />
                <span className="text-gray-500">like software.</span>
              </h1>
              <p className="max-w-md font-sans text-base text-gray-400 leading-relaxed font-light">
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
              <button
                className="px-8 py-3 bg-transparent text-gray-300 border border-white/10 text-sm font-medium rounded transition-all duration-300 hover:bg-white/5 hover:text-white hover:border-white/20"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                How it Works
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-lg aspect-square lg:aspect-[4/3] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-purple-500/10 blur-[100px] opacity-40"></div>
            <div className="glass-panel w-full h-full p-6 relative overflow-hidden rounded-xl">
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
                    <path d="M50,140 C110,140 110,80 170,80" fill="none" stroke="#333" strokeWidth="1" className="node-line"></path>
                    <path d="M50,140 C110,140 110,200 170,200" fill="none" stroke="#333" strokeWidth="1" className="node-line"></path>
                    <path d="M170,80 C230,80 230,120 290,120" fill="none" stroke="#333" strokeWidth="1" className="node-line"></path>
                    <path d="M170,200 C230,200 230,170 290,170" fill="none" stroke="#333" strokeWidth="1" className="node-line"></path>
                    <path d="M290,120 L360,145" fill="none" stroke="#333" strokeWidth="1" className="node-line"></path>
                    <path d="M290,170 L360,145" fill="none" stroke="#333" strokeWidth="1" className="node-line"></path>

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
              <div className="md:col-span-8 group relative bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all duration-500">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="max-w-md">
                      <div className="w-10 h-10 bg-white/5 border border-white/5 rounded flex items-center justify-center mb-6 text-white">
                        <IconTreasury className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Programmable Treasury</h3>
                      <p className="text-gray-400 leading-relaxed text-sm">
                        Your treasury is no longer a static balance. Funds automatically route between liquidity, payments,
                        and low-risk strategies based on real operational needs — while maintaining a liquid buffer for
                        instant settlement.
                      </p>
                    </div>
                    <div className="hidden lg:block">
                      <div className="px-3 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-gray-400 uppercase tracking-wider">
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
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeDasharray="600"
                        strokeDashoffset="600"
                        className="transition-all duration-[1500ms] ease-in-out group-hover:stroke-dashoffset-0"
                      ></path>
                      <g className="transition-all duration-500 delay-0 opacity-100 group-hover:scale-110 origin-center">
                        <circle cx="20" cy="50" r="4" fill="#fff"></circle>
                      </g>
                      <g className="transition-all duration-500 delay-[400ms] opacity-50 scale-75 group-hover:opacity-100 group-hover:scale-100 origin-center">
                        <circle cx="200" cy="20" r="4" fill="#050505" stroke="#fff" strokeWidth="1.5"></circle>
                      </g>
                      <g className="transition-all duration-500 delay-[800ms] opacity-50 scale-75 group-hover:opacity-100 group-hover:scale-100 origin-center">
                        <circle cx="380" cy="80" r="4" fill="#050505" stroke="#fff" strokeWidth="1.5"></circle>
                      </g>
                      <g className="transition-all duration-500 delay-[1200ms] opacity-50 scale-75 group-hover:opacity-100 group-hover:scale-100 origin-center">
                        <circle cx="560" cy="50" r="4" fill="#fff"></circle>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 group relative bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all duration-500 flex flex-col">
                <div className="p-10 relative z-10 flex flex-col h-full">
                  <div className="w-10 h-10 bg-white/5 border border-white/5 rounded flex items-center justify-center mb-6 text-white">
                    <IconEscrow className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Payment Intents</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-8">
                    Every payout is a programmable intent with a verifiable lifecycle: Created → Funded → Submitted →
                    Released or Refunded. Long approvals can activate “Yield Mode” to keep capital productive during waiting
                    periods.
                  </p>
                  <div className="mt-auto relative w-full h-28 flex flex-col justify-end items-center">
                    <div className="absolute w-[85%] h-10 bg-white/5 border border-white/5 rounded-t-md top-6 scale-90 opacity-40"></div>
                    <div className="relative w-full h-14 bg-[#171717] border border-white/10 rounded shadow-sm flex items-center px-4 gap-4 z-10">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-semibold text-white uppercase tracking-wide">Workflow Status</span>
                          <span className="text-[10px] font-mono text-gray-500">In Review</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded overflow-hidden">
                          <div className="h-full w-2/3 bg-white/40"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-6 group relative bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all duration-500">
                <div className="p-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1 max-w-lg">
                    <div className="w-10 h-10 bg-white/5 border border-white/5 rounded flex items-center justify-center mb-6 text-white">
                      <IconIncentives className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">Aligned Incentives</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      Delays and long approvals no longer waste capital. Funds can stay productive while stakeholders
                      resolve reviews and disputes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-6 group relative bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all duration-500">
                <div className="p-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1 max-w-lg">
                    <div className="w-10 h-10 bg-blue-600/10 border border-blue-600/20 rounded flex items-center justify-center mb-6 text-blue-400">
                      <IconTrustless className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">Auditable by Design</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      Every action emits an onchain event. Every payment has a verifiable timeline — built for compliance,
                      reconciliation, and reporting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CAPITAL FLOW TIMELINE */}
        <section
          id="how-it-works"
          ref={lifecycleRef}
          className="relative w-full bg-[#050505] border-y border-white/5"
          style={{ height: '260vh' }}
        >
          <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
            <div className="max-w-4xl w-full px-6 md:px-12 relative z-10 flex flex-col items-center h-full py-20">
              <div
                ref={lifecycleHeaderRef}
                className="text-center mb-12 shrink-0 transition-opacity duration-700 opacity-0"
              >
                <h2 className="font-display text-2xl md:text-3xl font-medium text-white tracking-tight mb-3">
                  The Capital Flow Engine
                </h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Funds move through clearly defined states to maximize control, safety, and efficiency — without breaking
                  UX.
                </p>
              </div>

              <div className="relative w-full max-w-2xl flex-1 flex flex-col justify-center my-auto">
                <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white/5 -translate-x-1/2"></div>
                <div
                  ref={lifecycleLineRef}
                  className="absolute left-1/2 top-4 w-px bg-white -translate-x-1/2 transition-all duration-75 ease-linear h-0 max-h-[calc(100%-2rem)] shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                ></div>

                <div className="space-y-16 py-8 relative">
                  <div className="lifecycle-step group flex items-center justify-between w-full opacity-30 transition-all duration-500" data-threshold="0.1">
                    <div className="w-[42%] text-right pr-8">
                      <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider block mb-1">01 Treasury</span>
                      <h3 className="font-sans text-base font-medium text-white">Treasury Zone</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Entity funds live here. Liquid by default, or earning yield until a payment intent needs funding.
                      </p>
                    </div>
                    <div className="relative shrink-0 z-10">
                      <div className="w-3 h-3 rounded-full border border-white/20 bg-[#050505] group-[.active]:border-white group-[.active]:bg-white group-[.active]:shadow-[0_0_15px_white] transition-all duration-300"></div>
                    </div>
                    <div className="w-[42%] pl-8">
                      <div className="bg-white/5 border border-white/10 p-3 rounded shadow-lg inline-block backdrop-blur-sm">
                        <span className="text-xs font-medium text-gray-200">Fund once, allocate when needed.</span>
                      </div>
                    </div>
                  </div>

                  <div className="lifecycle-step group flex items-center justify-between w-full opacity-30 transition-all duration-500" data-threshold="0.4">
                    <div className="w-[42%] text-right pr-8">
                      <div className="bg-white/5 border border-white/10 p-3 rounded shadow-lg inline-block text-left backdrop-blur-sm">
                        <span className="text-[10px] text-gray-500 block mb-1">Payment</span>
                        <span className="text-xs font-medium text-gray-200">
                          Funds are reserved for a specific intent.
                        </span>
                      </div>
                    </div>
                    <div className="relative shrink-0 z-10">
                      <div className="w-3 h-3 rounded-full border border-white/20 bg-[#050505] group-[.active]:border-white group-[.active]:bg-white group-[.active]:shadow-[0_0_15px_white] transition-all duration-300"></div>
                    </div>
                    <div className="w-[42%] pl-8">
                      <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider block mb-1">02 Escrow</span>
                      <h3 className="font-sans text-base font-medium text-white">Payment Escrow</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Funds are reserved for a specific intent. Kept liquid for instant settlement and predictable payouts.
                      </p>
                    </div>
                  </div>

                  <div className="lifecycle-step group flex items-center justify-between w-full opacity-30 transition-all duration-500" data-threshold="0.7">
                    <div className="w-[42%] text-right pr-8">
                      <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                        03 Optimization
                      </span>
                      <h3 className="font-sans text-base font-medium text-white">Yield Escrow</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Activates for long reviews, disputes, or acceptance windows — keeping capital productive while
                        workflows resolve.
                      </p>
                    </div>
                    <div className="relative shrink-0 z-10">
                      <div className="w-3 h-3 rounded-full border border-white/20 bg-[#050505] group-[.active]:border-white group-[.active]:bg-white group-[.active]:shadow-[0_0_15px_white] transition-all duration-300"></div>
                    </div>
                    <div className="w-[42%] pl-8">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-black text-xs font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        Yield Mode Active
                      </span>
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
