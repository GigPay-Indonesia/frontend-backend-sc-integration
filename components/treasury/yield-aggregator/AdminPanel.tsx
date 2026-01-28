'use client';

import React, { useMemo, useState } from 'react';
import { GlassCard, Button, Badge } from './ui';
import { useYieldAggregatorAdmin } from '@/hooks/useYieldAggregatorAdmin';
import { cn } from '@/lib/utils';

type Props = {
  isAdmin: boolean;
  emergencyShutdown?: boolean;
  shouldRebalance?: { ok: boolean; improvementBps: number };
  optimalAllocation?: { targets: `0x${string}`[]; allocBps: number[] };
  minRebalanceInterval?: number; // seconds
  lastRebalance?: number; // unix seconds
  rebalanceThresholdBps?: number;
  autoRebalanceEnabled?: boolean;
};

const fmtDuration = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h || d) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
};

export function AdminPanel({
  isAdmin,
  emergencyShutdown,
  shouldRebalance,
  optimalAllocation,
  minRebalanceInterval,
  lastRebalance,
  rebalanceThresholdBps,
  autoRebalanceEnabled,
}: Props) {
  const { executeRebalance, setEmergencyShutdown, tx, isPending, isSuccess, resetTx } = useYieldAggregatorAdmin();

  const [shutdownNext, setShutdownNext] = useState<boolean>(!!emergencyShutdown);

  const nowSec = Math.floor(Date.now() / 1000);
  const nextAllowed = lastRebalance && minRebalanceInterval ? lastRebalance + minRebalanceInterval : undefined;
  const cooldownRemaining = nextAllowed ? Math.max(0, nextAllowed - nowSec) : 0;
  const cooldownActive = !!nextAllowed && cooldownRemaining > 0;

  const statusLabel = useMemo(() => {
    if (!tx.action) return undefined;
    if (isPending) return 'Pending…';
    if (isSuccess) return 'Confirmed';
    if (tx.error) return 'Error';
    return undefined;
  }, [tx.action, isPending, isSuccess, tx.error]);

  if (!isAdmin) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-black text-white">Admin</h3>
        <p className="text-sm text-slate-400 mt-2">
          Connect with an admin wallet (vault `owner` / `governance` / `management`) to access rebalance, shutdown, and queue controls.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-white">Rebalance</h3>
            <p className="text-xs font-medium text-slate-500">Preview and execute vault allocation changes.</p>
          </div>
          {shouldRebalance ? (
            <Badge variant={shouldRebalance.ok ? 'default' : 'secondary'}>
              {shouldRebalance.ok ? `OK (+${(shouldRebalance.improvementBps / 100).toFixed(2)}%)` : 'Not needed'}
            </Badge>
          ) : null}
        </div>

        <div className="rounded-xl border border-white/5 bg-black/30 p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cooldown</div>
              <div className="text-xs font-mono font-bold text-slate-200 mt-1">
                {cooldownActive ? `Available in ${fmtDuration(cooldownRemaining)}` : 'Ready'}
              </div>
              {nextAllowed ? (
                <div className="text-[10px] font-medium text-slate-500 mt-1">
                  Next: {new Date(nextAllowed * 1000).toLocaleString()}
                </div>
              ) : (
                <div className="text-[10px] font-medium text-slate-600 mt-1">—</div>
              )}
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Settings</div>
              <div className="text-[10px] font-mono font-bold text-slate-300 mt-1">
                Threshold: {typeof rebalanceThresholdBps === 'number' ? `${(rebalanceThresholdBps / 100).toFixed(2)}%` : '—'}
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-300 mt-1">
                Auto: {autoRebalanceEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 mb-2">Targets</div>
          <div className="space-y-2">
            {(optimalAllocation?.targets || []).slice(0, 6).map((t, i) => (
              <div key={t + i} className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">
                  {t.slice(0, 6)}…{t.slice(-4)}
                </span>
                <span className="font-mono text-slate-500">{(optimalAllocation?.allocBps?.[i] || 0) / 100}%</span>
              </div>
            ))}
            {(optimalAllocation?.targets?.length || 0) === 0 ? (
              <div className="text-xs text-slate-500">No allocation preview available.</div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Button onClick={() => executeRebalance()} disabled={isPending || cooldownActive}>
            Execute Rebalance
          </Button>
          {statusLabel ? <span className={cn('text-xs', tx.error ? 'text-red-400' : 'text-slate-400')}>{statusLabel}</span> : null}
        </div>
        {cooldownActive ? (
          <div className="text-xs text-amber-400 mt-2">
            Rebalance is rate-limited. Your last attempt reverted with <span className="font-mono">RM_RebalanceTooSoon</span> when called before the cooldown elapsed.
          </div>
        ) : null}
        {shouldRebalance && !shouldRebalance.ok ? (
          <div className="text-xs text-slate-500 mt-2">
            Vault reports rebalance is <span className="font-mono">not needed</span>. Executing may be a no-op (no allocation change).
          </div>
        ) : null}
        {tx.error ? <div className="text-xs text-red-400 mt-2">{tx.error}</div> : null}
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-white">Emergency Controls</h3>
            <p className="text-xs font-medium text-slate-500">Toggle emergency shutdown on the vault.</p>
          </div>
          <Badge variant={emergencyShutdown ? 'destructive' : 'default'}>{emergencyShutdown ? 'Shutdown' : 'Active'}</Badge>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 p-4">
          <div className="text-sm font-bold text-white">Emergency Shutdown</div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={shutdownNext}
              onChange={(e) => setShutdownNext(e.target.checked)}
            />
            <div className="relative w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-red-500/40 transition-colors">
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Button variant="destructive" onClick={() => setEmergencyShutdown(shutdownNext)} disabled={isPending}>
            Save Shutdown Setting
          </Button>
          <Button variant="ghost" className="text-slate-300" onClick={resetTx}>
            Clear Tx
          </Button>
        </div>
        {tx.error ? <div className="text-xs text-red-400 mt-2">{tx.error}</div> : null}
      </GlassCard>
    </div>
  );
}

