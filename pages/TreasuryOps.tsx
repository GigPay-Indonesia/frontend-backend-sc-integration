import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GlassCard, Button } from '../components/treasury/yield-aggregator/ui';
import { getPaymentIntents, getTreasuryActivity, getTreasuryHistory, getTreasuryOverview } from '../lib/api';
import { useTreasuryOpsFallback } from '../hooks/useTreasuryOpsFallback';
import { useTreasuryOpsActivityFallback } from '../hooks/useTreasuryOpsActivityFallback';
import { useTreasuryOpsTimeseries } from '../hooks/useTreasuryOpsTimeseries';
import { useTreasuryOpsPaymentsFallback } from '../hooks/useTreasuryOpsPaymentsFallback';
import { useChainId } from 'wagmi';
import { useTreasuryVaultContract } from '../lib/hooks/useGigPayContracts';

type TreasuryOverview = Awaited<ReturnType<typeof getTreasuryOverview>>;
type TreasuryHistory = Awaited<ReturnType<typeof getTreasuryHistory>>;

const toNum = (v: unknown) => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : 0;
  return Number.isFinite(n) ? n : 0;
};

const shortHash = (hash?: string | null) => {
  if (!hash) return '';
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
};

const fmt = (v: unknown) => {
  const n = toNum(v);
  if (n === 0) return '0';
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(4);
};

const withTimeout = async <T,>(promise: Promise<T>, ms = 6_000): Promise<T> => {
  let id: number | undefined;
  const timeout = new Promise<T>((_resolve, reject) => {
    id = window.setTimeout(() => reject(new Error('Backend request timed out')), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (id != null) window.clearTimeout(id);
  }
};

export const TreasuryOps: React.FC = () => {
  const navigate = useNavigate();
  const chainId = useChainId();
  const treasuryVault = useTreasuryVaultContract();
  const [mode, setMode] = useState<'backend' | 'fallback'>('backend');
  const [overview, setOverview] = useState<TreasuryOverview | null>(null);
  const [history, setHistory] = useState<TreasuryHistory | null>(null);
  const [activity, setActivity] = useState<any[] | null>(null);
  const [paymentIntents, setPaymentIntents] = useState<any[] | null>(null);
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fallbackTotals = useTreasuryOpsFallback({ enabled: mode === 'fallback' });
  const fallbackActivity = useTreasuryOpsActivityFallback({ enabled: mode === 'fallback', limit: 100 });
  const fallbackPayments = useTreasuryOpsPaymentsFallback({ enabled: mode === 'fallback', maxItems: 20 });
  const tsKey = useMemo(() => {
    const addr = treasuryVault.address || 'unknown';
    return `gigpay:ops_ts:${chainId}:${addr}`;
  }, [chainId, treasuryVault.address]);

  const fallbackTimeseries = useTreasuryOpsTimeseries({
    enabled: mode === 'fallback',
    storageKey: tsKey,
    sampleMs: 60_000,
    current:
      mode === 'fallback'
        ? {
            idle: toNum(fallbackTotals.totals.idle),
            yieldDeployed: toNum(fallbackTotals.totals.yieldDeployed),
            escrowLocked: toNum(fallbackTotals.totals.escrowLocked),
            total: toNum(fallbackTotals.totals.total),
          }
        : null,
  });

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const [ov, hist, act, payments] = await Promise.all([
          withTimeout(getTreasuryOverview(), 6_000),
          withTimeout(getTreasuryHistory(range), 6_000),
          withTimeout(getTreasuryActivity({ limit: 100 }), 6_000),
          withTimeout(getPaymentIntents(), 6_000),
        ]);
        if (!mounted) return;
        setMode('backend');
        setOverview(ov);
        setHistory(hist);
        setActivity(act.rows || []);
        setPaymentIntents(payments.intents || []);
      } catch (e: any) {
        if (!mounted) return;
        setMode('fallback');
        setError(e?.message || 'Backend unavailable — showing on-chain fallback data.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [range]);

  const allocationData = useMemo(() => {
    const t = mode === 'backend' ? overview?.totals : fallbackTotals.totals;
    if (!t) return [];
    return [
      { name: 'Idle', value: toNum(t.idle) },
      { name: 'Yield', value: toNum(t.yieldDeployed) },
      { name: 'Escrow', value: toNum(t.escrowLocked) },
    ].filter((x) => x.value > 0);
  }, [mode, overview, fallbackTotals.totals]);

  const pieColors = ['#60a5fa', '#34d399', '#f59e0b'];

  const historyRows = useMemo(() => {
    if (mode === 'backend') {
      const rows = history?.rows || [];
      // Combined snapshots have assetSymbol null.
      return rows
        .filter((r: any) => r.assetSymbol == null)
        .map((r: any) => ({
          t: new Date(r.timestamp).toLocaleDateString(),
          total: toNum(r.total),
          idle: toNum(r.idle),
          yield: toNum(r.yieldDeployed),
          escrow: toNum(r.escrowLocked),
        }));
    }

    return fallbackTimeseries.getRange(range).map((p) => ({
      t: new Date(p.t).toLocaleDateString(),
      total: p.total,
      idle: p.idle,
      yield: p.yieldDeployed,
      escrow: p.escrowLocked,
    }));
  }, [mode, history, fallbackTimeseries, range]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Treasury Ops</h1>
          <p className="text-slate-400 mt-2">
            Allocation (idle / yield / escrow), history snapshots, and backend-indexed activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', '1y', 'all'] as const).map((r) => (
            <Button
              key={r}
              variant={r === range ? 'default' : 'outline'}
              className="h-9 px-3"
              onClick={() => setRange(r)}
              disabled={loading}
            >
              {r.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <GlassCard className="p-5">
          <div className="text-sm text-slate-400 font-bold">Totals</div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total</span>
              <span className="font-bold">{fmt(mode === 'backend' ? overview?.totals?.total : fallbackTotals.totals.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Idle</span>
              <span className="font-bold">{fmt(mode === 'backend' ? overview?.totals?.idle : fallbackTotals.totals.idle)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Yield</span>
              <span className="font-bold">{fmt(mode === 'backend' ? overview?.totals?.yieldDeployed : fallbackTotals.totals.yieldDeployed)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Escrow</span>
              <span className="font-bold">{fmt(mode === 'backend' ? overview?.totals?.escrowLocked : fallbackTotals.totals.escrowLocked)}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-1">
          <div className="text-sm text-slate-400 font-bold">Allocation</div>
          <div className="h-56 mt-3">
            {allocationData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80}>
                    {allocationData.map((_, idx) => (
                      <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => fmt(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                {loading ? 'Loading…' : 'No allocation data yet.'}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-1">
          <div className="text-sm text-slate-400 font-bold">Per-asset</div>
          <div className="mt-4 space-y-2">
            {((mode === 'backend' ? overview?.perAsset : fallbackTotals.perAsset) || []).map((a: any) => (
              <div key={a.symbol} className="flex items-center justify-between text-sm">
                <div className="text-slate-300 font-bold">{a.symbol}</div>
                <div className="text-slate-400">idle {fmt(a.idle)} · yield {fmt(a.yieldDeployed)} · escrow {fmt(a.escrowLocked)}</div>
              </div>
            ))}
            {!(mode === 'backend' ? overview?.perAsset?.length : fallbackTotals.perAsset?.length) && (
              <div className="text-slate-500 text-sm">{loading ? 'Loading…' : 'No assets found.'}</div>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400 font-bold">History (combined)</div>
          </div>
          <div className="h-80 mt-4">
            {historyRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="t" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => fmt(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#e2e8f0" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="idle" stroke="#60a5fa" dot={false} />
                  <Line type="monotone" dataKey="yield" stroke="#34d399" dot={false} />
                  <Line type="monotone" dataKey="escrow" stroke="#f59e0b" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                {loading ? 'Loading…' : 'No snapshots yet (snapshot loop writes periodically).'}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="text-sm text-slate-400 font-bold">Activity</div>
          <div className="mt-4 space-y-3 max-h-[22rem] overflow-auto pr-1">
            {((mode === 'backend' ? activity : fallbackActivity.rows) || []).map((e: any) => (
              <div key={e.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-slate-200 text-sm">
                    {e.source} · {e.eventName}
                  </div>
                  <div className="text-xs text-slate-500">{shortHash(e.txHash)}</div>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  block {String(e.blockNumber)} · log {String(e.logIndex)}
                  {e.onchainIntentId != null ? ` · intent ${String(e.onchainIntentId)}` : ''}
                </div>
              </div>
            ))}
            {!((mode === 'backend' ? activity?.length : fallbackActivity.rows?.length) || 0) && (
              <div className="text-slate-500 text-sm">
                {loading || (mode === 'fallback' && fallbackActivity.isLoading) ? 'Loading…' : 'No activity found.'}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-400 font-bold">Payments</div>
              <div className="text-xs text-slate-500 mt-1">
                {mode === 'backend'
                  ? 'Resume incomplete intents or jump to on-chain payment details.'
                  : 'Backend drafts unavailable in fallback. Showing recent on-chain intents.'}
              </div>
            </div>
            <Link to="/payments/new" className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider">
              New payment
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-500 uppercase font-bold text-[10px] tracking-widest border-b border-white/5">
                <tr>
                  <th className="py-3 pr-4">Payment</th>
                  <th className="py-3 pr-4">Recipient</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Asset</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {((mode === 'backend' ? paymentIntents : null) || []).slice(0, 20).map((p: any) => {
                  const hasOnchain = p.onchainIntentId != null;
                  const label = hasOnchain ? `PI-${String(p.onchainIntentId)}` : `Draft-${String(p.id).slice(0, 8)}`;
                  const amount = p.amount ?? '—';
                  const asset = p.fundingAsset ?? '—';
                  const recipient = p.recipient?.displayName ?? '—';
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 font-bold text-slate-200">{label}</td>
                      <td className="py-3 pr-4 text-slate-300">{recipient}</td>
                      <td className="py-3 pr-4 font-mono text-slate-200">{String(amount)}</td>
                      <td className="py-3 pr-4 text-slate-300">{asset}</td>
                      <td className="py-3 pr-4 text-slate-300">{String(p.status || '—')}</td>
                      <td className="py-3 text-right">
                        {hasOnchain ? (
                          <Link
                            to={`/payments/${String(p.onchainIntentId)}`}
                            className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider"
                          >
                            Continue
                          </Link>
                        ) : (
                          <button
                            className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider"
                            onClick={() => navigate('/payments/new', { state: { resumeEscrowIntent: p } })}
                          >
                            Continue
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {mode === 'fallback' &&
                  fallbackPayments.rows.map((p) => (
                    <tr key={p.key} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 font-bold text-slate-200">{p.label}</td>
                      <td className="py-3 pr-4 text-slate-300">{p.recipient}</td>
                      <td className="py-3 pr-4 font-mono text-slate-200">{p.amount}</td>
                      <td className="py-3 pr-4 text-slate-300">{p.asset}</td>
                      <td className="py-3 pr-4 text-slate-300">{p.status}</td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/payments/${p.onchainIntentId}`}
                          className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider"
                        >
                          Continue
                        </Link>
                      </td>
                    </tr>
                  ))}

                {mode === 'backend' && !paymentIntents?.length && (
                  <tr>
                    <td className="py-4 text-slate-500 text-sm" colSpan={6}>
                      {loading ? 'Loading…' : 'No payment intents yet.'}
                    </td>
                  </tr>
                )}

                {mode === 'fallback' && !fallbackPayments.rows.length && (
                  <tr>
                    <td className="py-4 text-slate-500 text-sm" colSpan={6}>
                      {loading || fallbackPayments.isLoading ? 'Loading…' : 'No on-chain intents found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

