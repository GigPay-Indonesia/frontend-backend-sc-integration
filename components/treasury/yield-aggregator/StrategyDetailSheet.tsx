'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Activity, ShieldAlert, Sprout } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Badge, Button } from './ui';
import { YieldAggregatorStrategy } from '@/hooks/useYieldAggregatorReads';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  strategy: YieldAggregatorStrategy | null;
  onHarvest: (addr: string) => void;
};

export function StrategyDetailSheet({ isOpen, onClose, strategy, onHarvest }: Props) {
  if (!strategy) return null;

  const chartData = Array.from({ length: 30 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    value: 10 + Math.random() * 0.5 + i * 0.1,
  }));

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-[#000]/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[210] h-full w-full border-l border-white/10 bg-[#0a0a0a] shadow-2xl sm:max-w-md lg:max-w-lg flex flex-col"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between border-b border-white/10 p-8">
              <div className="min-w-0">
                <h2 className="text-xl font-black text-white tracking-tight truncate">{strategy.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="default">Active</Badge>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-md">
                    {strategy.protocol} Protocol
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-blue-500" /> Performance (30D)
                </h3>
                <div className="h-[200px] w-full rounded-2xl border border-white/5 bg-black/40 p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis dataKey="day" hide />
                      <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderColor: '#ffffff10',
                          color: '#fff',
                          borderRadius: '12px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        }}
                        itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Allocated (Vault Debt)</div>
                  <div className="text-lg font-black text-white">{strategy.debt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Est. APY / Hist. APY</div>
                  <div className="text-lg font-black text-emerald-400">{strategy.apy.toFixed(2)}%</div>
                  <div className="text-xs font-mono font-bold text-slate-500 mt-1">
                    Hist: {typeof strategy.lastApy === 'number' ? `${strategy.lastApy.toFixed(2)}%` : '—'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Available (Max Liquidatable)</div>
                  <div className="text-lg font-black text-white">{strategy.maxLiquidatable.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div className="text-xs font-mono font-bold text-slate-500 mt-1">
                    Withdrawable now: {strategy.withdrawableNow.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Asset / Risk</div>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <ShieldAlert size={18} className="text-blue-500" />
                    {strategy.riskScore}/10
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-500 mt-1">
                    Asset: {strategy.wantSymbol || '—'}
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-500 mt-1">
                    Risk: {strategy.riskLevel}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Holdings breakdown</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400">Strategy-held</div>
                    <div className="font-mono font-bold text-slate-200">{strategy.estimatedTotalAssets.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Credit available</div>
                    <div className="font-mono font-bold text-slate-200">{strategy.creditAvailable.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-3">
                  Vault debt ratio: {(strategy.debtRatioBps / 100).toFixed(2)}% • Debt outstanding: {strategy.debtOutstanding.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="relative z-10 border-t border-white/10 p-6 flex gap-4 bg-black/40 backdrop-blur-md">
              <Button onClick={() => onHarvest(strategy.address)} className="flex-1 py-6 bg-gradient-to-r from-emerald-600 to-emerald-500 border-0">
                <Sprout className="mr-2 h-4 w-4" />
                Manual Harvest
              </Button>
              <Button className="flex-1 py-6 border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10" variant="outline">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Emergency Withdraw
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

