'use client';

import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard, Button, Badge } from './ui';
import { ChartsWidget } from './ChartsWidget';
import { StrategiesTable } from './StrategiesTable';
import { StrategyDetailSheet } from './StrategyDetailSheet';
import { ActivityLog } from './ActivityLog';
import { AdminPanel } from './AdminPanel';
import { QueueManager } from './QueueManager';
import { useYieldData } from '@/hooks/useYieldData';

type TabId = 'strategies' | 'details' | 'activity' | 'admin' | 'queue';

const TABS: { id: TabId; label: string; adminOnly?: boolean }[] = [
  { id: 'strategies', label: 'Strategies' },
  { id: 'details', label: 'Details' },
  { id: 'activity', label: 'Activity' },
  { id: 'admin', label: 'Admin', adminOnly: true },
  { id: 'queue', label: 'Queue', adminOnly: true },
];

export function YieldAggregatorTabs() {
  const [tab, setTab] = useState<TabId>('strategies');
  const [selectedStrategy, setSelectedStrategy] = useState<any | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const {
    vaultAddress,
    totalAssets,
    sharePrice,
    netApy,
    strategies,
    isLoading,
    refetch,
    harvestStrategy,
    isAdmin,
    emergencyShutdown,
    minRebalanceInterval,
    lastRebalance,
    rebalanceThresholdBps,
    autoRebalanceEnabled,
    shouldRebalance,
    optimalAllocation,
    withdrawalQueue,
    owner,
    governance,
    management,
    vaultIdleAssets,
    userMaxWithdraw,
  } = useYieldData() as any;

  const handleRefresh = async () => {
    await refetch();
  };

  const chartAllocationData = useMemo(() => {
    const strat = (strategies || []).map((s: any, i: number) => ({
      name: s.protocol,
      value: s.debt,
      color: ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#06b6d4', '#ec4899'][i % 6],
    }));
    const sum = strat.reduce((a: number, b: any) => a + (b.value || 0), 0);
    const liquid = Math.max(0, (totalAssets || 0) - sum);
    return [...strat, { name: 'Liquid', value: liquid, color: '#64748B' }];
  }, [strategies, totalAssets]);

  const chartTotal = useMemo(
    () => chartAllocationData.reduce((acc: number, s: any) => acc + (s.value || 0), 0) || 1,
    [chartAllocationData]
  );

  const totalCreditAvailable = useMemo(
    () => (strategies || []).reduce((acc: number, s: any) => acc + (s.creditAvailable || 0), 0),
    [strategies]
  );

  const visibleTabs = useMemo(() => TABS.filter((t) => !t.adminOnly || isAdmin), [isAdmin]);

  return (
    <div className="space-y-6">
      {/* Vault header */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">IDRX Stable Vault</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 font-mono tracking-wider border border-white/10">
                VAULT
              </span>
              {emergencyShutdown ? <Badge variant="destructive">Shutdown</Badge> : <Badge variant="default">Active</Badge>}
            </div>
            <p className="text-slate-400 text-xs flex items-center gap-2">
              <span className="font-mono">{(owner || governance || management || '').slice(0, 6)}…</span>
              <span className="text-slate-600">(admin roles loaded)</span>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end px-4 border-r border-white/10">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Net APY</span>
              <span className="text-2xl font-black text-[#0df2f2]">{netApy?.toFixed?.(2) ?? '0.00'}%</span>
            </div>
            <div className="hidden md:flex flex-col items-end px-4 border-r border-white/10">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">TVL</span>
              <span className="text-2xl font-bold text-white">{(totalAssets || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="hidden md:flex flex-col items-end pl-4">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Share Price</span>
              <span className="text-2xl font-bold text-white">{(sharePrice || 0).toFixed(4)}</span>
            </div>

            <Button variant="outline" className="gap-2" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw size={16} className={cn(isLoading ? 'animate-spin' : '')} />
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {visibleTabs.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? 'secondary' : 'outline'}
            className="h-9 px-4 text-xs"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* Details tab: Allocation + Charts */}
      {tab === 'details' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-white">Allocation</h3>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="h-[260px] w-[260px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartAllocationData}
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={8}
                        onMouseEnter={(_, idx) => setActiveIndex(idx)}
                        onMouseLeave={() => setActiveIndex(undefined)}
                      >
                        {chartAllocationData.map((entry: any, idx: number) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip cursor={false} contentStyle={{ display: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-3xl font-black text-white">
                      {activeIndex !== undefined
                        ? (((chartAllocationData[activeIndex].value || 0) / chartTotal) * 100).toFixed(1)
                        : '100'}
                      %
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 max-w-[120px] truncate">
                      {activeIndex !== undefined ? chartAllocationData[activeIndex].name : 'Total Assets'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                  {chartAllocationData.map((item: any, idx: number) => (
                    <div key={item.name} className="flex items-center justify-between text-xs p-2 rounded-lg border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300 truncate">{item.name}</span>
                      </div>
                      <span className="text-right">
                        <div className="font-mono font-bold text-slate-200">
                          {(item.value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                        <div className="font-mono font-bold text-slate-500 text-[10px]">
                          {(((item.value || 0) / chartTotal) * 100).toFixed(0)}%
                        </div>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-white/5 bg-black/30 p-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">How deposits flow</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Deposits enter the <span className="text-slate-200 font-bold">Vault</span> as <span className="text-slate-200 font-bold">idle</span> balance (Liquid).
                    When an admin executes <span className="text-slate-200 font-bold">Rebalance</span>, the vault allocates capital to strategies.
                    Yield is simulated when anyone clicks <span className="text-slate-200 font-bold">Harvest</span> on a strategy, which claims faucet rewards and reports gains back to the vault.
                  </p>
                  <div className="mt-3 text-[10px] font-mono font-bold text-slate-500">
                    Total strategy credit available:{' '}
                    <span className={totalCreditAvailable > 0 ? 'text-slate-200' : 'text-amber-400'}>
                      {totalCreditAvailable.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    {totalCreditAvailable <= 0 ? ' (deposits will remain Liquid until credit opens or params change)' : ''}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
          <div className="lg:col-span-8">
            <ChartsWidget
              vaultAddress={vaultAddress}
              netApy={netApy || 0}
              totalAssets={totalAssets || 0}
              sharePrice={sharePrice || 0}
            />
          </div>
        </div>
      ) : null}

      {/* Strategies tab */}
      {tab === 'strategies' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard className="p-5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Vault idle (Liquid)</div>
              <div className="text-2xl font-black text-white">{(vaultIdleAssets || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
              <div className="text-xs text-slate-500 mt-1">This is instantly withdrawable without liquidating strategies.</div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Your max withdraw (Vault)</div>
              <div className="text-2xl font-black text-white">{(userMaxWithdraw || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
              <div className="text-xs text-slate-500 mt-1">From ERC-4626 `maxWithdraw(user)`.</div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total strategy liquidity</div>
              <div className="text-2xl font-black text-white">
                {(strategies || []).reduce((acc: number, s: any) => acc + (s.withdrawableNow || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </div>
              <div className="text-xs text-slate-500 mt-1">Sum of per-strategy “withdrawable now”.</div>
            </GlassCard>
          </div>
          <StrategiesTable strategies={strategies || []} onSelect={setSelectedStrategy} onHarvest={harvestStrategy} />
          <StrategyDetailSheet
            isOpen={!!selectedStrategy}
            onClose={() => setSelectedStrategy(null)}
            strategy={selectedStrategy}
            onHarvest={harvestStrategy}
          />
        </>
      ) : null}

      {/* Activity tab */}
      {tab === 'activity' ? <ActivityLog /> : null}

      {/* Admin tab */}
      {tab === 'admin' ? (
        <AdminPanel
          isAdmin={!!isAdmin}
          emergencyShutdown={emergencyShutdown}
          shouldRebalance={shouldRebalance}
          optimalAllocation={optimalAllocation}
          minRebalanceInterval={minRebalanceInterval}
          lastRebalance={lastRebalance}
          rebalanceThresholdBps={rebalanceThresholdBps}
          autoRebalanceEnabled={autoRebalanceEnabled}
        />
      ) : null}

      {/* Queue tab */}
      {tab === 'queue' ? <QueueManager isAdmin={!!isAdmin} withdrawalQueue={withdrawalQueue} /> : null}
    </div>
  );
}

