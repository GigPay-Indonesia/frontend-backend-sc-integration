'use client';

import React, { useMemo, useState } from 'react';
import { Sprout, AlertTriangle } from 'lucide-react';
import { GlassCard } from './ui';
import { cn } from '@/lib/utils';
import { YieldAggregatorStrategy } from '@/hooks/useYieldAggregatorReads';

type Props = {
  strategies: YieldAggregatorStrategy[];
  onSelect: (s: YieldAggregatorStrategy) => void;
  onHarvest: (strategyAddress: string) => void;
};

export function StrategiesTable({ strategies, onSelect, onHarvest }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const rows = useMemo(() => strategies || [], [strategies]);
  const riskBadge = (risk: YieldAggregatorStrategy['riskLevel']) => {
    if (risk === 'Low') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (risk === 'High') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  return (
    <GlassCard className="h-full flex flex-col">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-lg font-black text-white">Strategies</h3>
        <p className="text-xs font-medium text-slate-500 mt-1">Live strategy metrics from the vault + strategy contracts.</p>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-12 px-6 py-3 border-b border-white/5 text-[10px] font-bold uppercase text-slate-500 tracking-widest bg-white/[0.02]">
          <div className="col-span-4">Strategy</div>
          <div className="col-span-2 text-right">Allocated</div>
          <div className="col-span-2 text-right">Holdings</div>
          <div className="col-span-2 text-right">Strategy liquidity</div>
          <div className="col-span-2 text-right">APY</div>
        </div>

        <div className="divide-y divide-white/5">
          {rows.map((s, i) => (
            <div
              key={s.address}
              onClick={() => onSelect(s)}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(undefined)}
              className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/[0.04] transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="col-span-4 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex items-center shrink-0">
                    {(s.tokens || []).slice(0, 2).map((token, ti) => (
                      <img
                        key={token + ti}
                        src={
                          token === 'IDRX'
                            ? '/idrx-logo.png'
                            : `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${
                                token.toLowerCase() === 'eurc' ? 'eur' : token.toLowerCase()
                              }.png`
                        }
                        className={cn(
                          'w-8 h-8 rounded-full border-2 border-[#0a0a0a] shadow-md object-cover',
                          ti > 0 ? '-ml-3' : 'z-10'
                        )}
                        alt={token}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png';
                        }}
                      />
                    ))}
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-white flex items-center gap-2 mb-0.5 text-sm group-hover:text-blue-200 transition-colors truncate">
                      {s.protocol}
                      {s.utilization > 80 ? <AlertTriangle size={14} className="text-amber-500" /> : null}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      Asset {s.wantSymbol || (s.tokens || [])[0] || '—'} • Debt ratio {(s.debtRatioBps / 100).toFixed(2)}% • Credit{' '}
                      {s.creditAvailable.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="mt-1">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest',
                          riskBadge(s.riskLevel)
                        )}
                      >
                        {s.riskLevel.toUpperCase()}
                      </span>
                      <span className="ml-2 text-[10px] font-mono font-bold text-slate-600">({s.riskScore}/10)</span>
                      {s.creditAvailable <= 0 ? (
                        <span className="ml-2 inline-flex items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black tracking-widest text-amber-400">
                          NO CREDIT
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-2 text-right">
                <div className="font-mono text-sm font-bold text-slate-200">
                  {s.debt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] font-bold text-slate-600">Vault debt</div>
              </div>

              <div className="col-span-2 text-right">
                <div className="font-mono text-sm font-bold text-slate-200">
                  {s.estimatedTotalAssets.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] font-bold text-slate-600">Strategy-held</div>
              </div>

              <div className="col-span-2 text-right">
                <div className="font-mono text-sm font-bold text-slate-200">
                  {s.withdrawableNow.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] font-bold text-slate-600">Withdrawable now</div>
              </div>

              <div className="col-span-2 text-right flex items-center justify-end gap-2 text-emerald-400 font-black font-mono text-sm">
                <div className="text-right">
                  <div className="font-black text-emerald-400">{s.apy.toFixed(2)}%</div>
                  <div className="text-[10px] font-bold text-slate-500">
                    Hist {typeof s.lastApy === 'number' ? `${s.lastApy.toFixed(2)}%` : '—'}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onHarvest(s.address);
                  }}
                  className="w-8 h-8 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center transition-colors text-emerald-500 ml-2"
                  title="Harvest Yield"
                >
                  <Sprout size={14} />
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 ? (
            <div className="px-6 py-6 text-sm text-slate-400">No strategies found.</div>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}

