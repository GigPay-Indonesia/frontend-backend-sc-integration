'use client';

import React, { useMemo, useState } from 'react';
import manifest from '@/YieldModeABI/manifest.json';
import { GlassCard, Button, Badge } from './ui';
import { useYieldAggregatorAdmin } from '@/hooks/useYieldAggregatorAdmin';
import { cn } from '@/lib/utils';

type Props = {
  isAdmin: boolean;
  withdrawalQueue?: `0x${string}`[];
};

const strategies = manifest.contracts.Strategies as { address: `0x${string}`; name: string }[];

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function QueueManager({ isAdmin, withdrawalQueue }: Props) {
  const { setWithdrawalQueue, tx, isPending, isSuccess } = useYieldAggregatorAdmin();

  const defaultQueue = useMemo(() => strategies.map((s) => s.address), []);

  const initial = useMemo(() => {
    const q = (withdrawalQueue && withdrawalQueue.length > 0 ? withdrawalQueue : defaultQueue) as `0x${string}`[];
    // ensure only known strategies + preserve order
    const known = new Set(defaultQueue.map((a) => a.toLowerCase()));
    const cleaned = q.filter((a) => known.has(a.toLowerCase()));
    // append any missing
    const missing = defaultQueue.filter((a) => !cleaned.some((x) => x.toLowerCase() === a.toLowerCase()));
    return [...cleaned, ...missing];
  }, [withdrawalQueue, defaultQueue]);

  const [queue, setQueue] = useState<`0x${string}`[]>(initial);

  const move = (idx: number, dir: -1 | 1) => {
    setQueue((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      const tmp = next[idx];
      next[idx] = next[j];
      next[j] = tmp;
      return next;
    });
  };

  const reset = () => setQueue(defaultQueue);

  const save = async () => {
    await setWithdrawalQueue(queue);
  };

  if (!isAdmin) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-black text-white">Queue Manager</h3>
        <p className="text-sm text-slate-400 mt-2">Admin-only. This controls how withdrawals liquidate strategies when vault idle is low.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-black text-white">Withdrawal Queue</h3>
          <p className="text-xs font-medium text-slate-500">Order strategies for liquidation during withdrawals.</p>
        </div>
        <Badge variant="secondary">{queue.length} strategies</Badge>
      </div>

      <div className="divide-y divide-white/5 rounded-xl border border-white/5 overflow-hidden">
        {queue.map((addr, idx) => {
          const meta = strategies.find((s) => s.address.toLowerCase() === addr.toLowerCase());
          return (
            <div key={addr} className="flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-slate-300">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{meta?.name || 'Strategy'}</div>
                  <div className="text-xs font-mono text-slate-500">{short(addr)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => move(idx, -1)} disabled={idx === 0}>
                  Up
                </Button>
                <Button
                  variant="outline"
                  className="h-9 px-3 text-xs"
                  onClick={() => move(idx, 1)}
                  disabled={idx === queue.length - 1}
                >
                  Down
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Button onClick={save} disabled={isPending}>
          Save Queue Order
        </Button>
        <Button variant="outline" onClick={reset} disabled={isPending}>
          Reset to Default
        </Button>
        {tx.error ? <span className="text-xs text-red-400">{tx.error}</span> : null}
        {isSuccess ? <span className={cn('text-xs text-emerald-400')}>Saved</span> : null}
      </div>
    </GlassCard>
  );
}

