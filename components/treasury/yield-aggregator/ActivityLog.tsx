'use client';

import React, { useMemo, useState } from 'react';
import { GlassCard, Button, Badge } from './ui';
import { useYieldAggregatorActivity, YieldActivityItem, YieldActivityType } from '@/hooks/useYieldAggregatorActivity';
import { getExplorerBaseUrl } from '@/lib/abis';

const FILTERS: { id: string; label: string; types: YieldActivityType[] }[] = [
  {
    id: 'all',
    label: 'All',
    types: [
      'Deposit',
      'Withdraw',
      'Reported',
      'Claimed',
      'RebalanceInitiated',
      'RebalanceExecuted',
      'WithdrawalQueueUpdated',
      'FeesMinted',
      'EmergencyShutdownSet',
    ],
  },
  { id: 'deposits', label: 'Deposits', types: ['Deposit'] },
  { id: 'withdrawals', label: 'Withdrawals', types: ['Withdraw'] },
  { id: 'harvests', label: 'Harvests', types: ['Reported', 'Claimed'] },
  { id: 'rebalances', label: 'Rebalances', types: ['RebalanceInitiated', 'RebalanceExecuted'] },
  { id: 'admin', label: 'Admin', types: ['RebalanceInitiated', 'RebalanceExecuted', 'WithdrawalQueueUpdated', 'FeesMinted', 'EmergencyShutdownSet'] },
];

export function ActivityLog() {
  const { items, isLoading } = useYieldAggregatorActivity({ limit: 60 });
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);

  const filtered = useMemo(() => items.filter((i) => activeFilter.types.includes(i.type)), [items, activeFilter]);

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-black text-white">Activity</h3>
          <p className="text-xs font-medium text-slate-500">On-chain events from the vault + faucet.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              variant={activeFilter.id === f.id ? 'secondary' : 'outline'}
              className="h-9 px-3 text-xs"
              onClick={() => setActiveFilter(f)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="min-w-full text-sm">
          <thead className="bg-white/[0.03] text-slate-400 text-[10px] uppercase tracking-widest">
            <tr>
              <th className="text-left px-4 py-3">Event</th>
              <th className="text-left px-4 py-3">Details</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Time</th>
              <th className="text-left px-4 py-3">Tx</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={5}>
                  Loading activity…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={5}>
                  No events found in the lookback window.
                </td>
              </tr>
            ) : (
              filtered.map((row) => <ActivityRow key={`${row.txHash}-${row.type}-${row.blockNumber.toString()}`} row={row} />)
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function ActivityRow({ row }: { row: YieldActivityItem }) {
  const explorer = getExplorerBaseUrl();
  return (
    <tr className="hover:bg-white/[0.03] transition-colors">
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-bold text-white">{row.type}</span>
          <span className="text-xs text-slate-500">{row.date}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-300">{row.details}</td>
      <td className="px-4 py-3">
        <Badge variant="secondary">{row.status}</Badge>
      </td>
      <td className="px-4 py-3 text-slate-400">{row.timeAgo}</td>
      <td className="px-4 py-3">
        <a
          className="text-blue-400 font-mono text-xs hover:underline"
          href={`${explorer}/tx/${row.txHash}`}
          target="_blank"
          rel="noreferrer"
        >
          {row.txHash.slice(0, 6)}…{row.txHash.slice(-4)}
        </a>
      </td>
    </tr>
  );
}

