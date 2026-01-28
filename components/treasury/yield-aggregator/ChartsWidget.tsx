'use client';

import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';
import { GlassCard, Button } from './ui';
import { useYieldAggregatorTimeseries, YieldChartMetric, YieldChartRange } from '@/hooks/useYieldAggregatorTimeseries';

type Props = {
  vaultAddress?: string;
  netApy: number;
  totalAssets: number;
  sharePrice: number;
};

export function ChartsWidget({ vaultAddress, netApy, totalAssets, sharePrice }: Props) {
  const [metric, setMetric] = useState<YieldChartMetric>('APY');
  const [range, setRange] = useState<YieldChartRange>('1M');

  const { getChartData, clear } = useYieldAggregatorTimeseries({
    vaultAddress,
    apy: netApy,
    tvl: totalAssets,
    pps: sharePrice,
    enabled: true,
    sampleIntervalMs: 60_000,
  });

  const data = useMemo(() => getChartData(range, metric), [getChartData, range, metric]);

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-black text-white">Performance</h3>
          <p className="text-xs font-medium text-slate-500">Session-sampled on-chain metrics (local only).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            {(['APY', 'TVL', 'PRICE'] as YieldChartMetric[]).map((m) => (
              <Button
                key={m}
                variant={metric === m ? 'default' : 'outline'}
                className={cn('h-9 px-3 text-xs', metric === m ? '' : 'bg-transparent')}
                onClick={() => setMetric(m)}
              >
                {m}
              </Button>
            ))}
          </div>
          <div className="w-px h-6 bg-white/10 hidden md:block" />
          <div className="flex items-center gap-2">
            {(['1W', '1M', '1Y', 'ALL'] as YieldChartRange[]).map((r) => (
              <Button
                key={r}
                variant={range === r ? 'secondary' : 'outline'}
                className={cn('h-9 px-3 text-xs', range === r ? '' : 'bg-transparent')}
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
          <Button variant="ghost" className="h-9 px-3 text-xs text-slate-300" onClick={clear}>
            Clear
          </Button>
        </div>
      </div>

      <div className="h-[260px] w-full rounded-2xl border border-white/5 bg-black/40 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={40}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: '#ffffff10',
                color: '#fff',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
              itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={metric === 'APY' ? '#0df2f2' : metric === 'TVL' ? '#60a5fa' : '#10b981'}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: '#ffffff', stroke: '#0df2f2', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

