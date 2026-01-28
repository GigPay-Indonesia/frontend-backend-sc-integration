import { useCallback, useEffect, useMemo, useState } from 'react';
import { useChainId } from 'wagmi';

export type YieldChartMetric = 'APY' | 'TVL' | 'PRICE';
export type YieldChartRange = '1W' | '1M' | '1Y' | 'ALL';

export type YieldTimeseriesPoint = {
  t: number; // unix ms
  apy: number; // percent
  tvl: number; // assets
  pps: number; // price per share
};

type Params = {
  vaultAddress?: string;
  enabled?: boolean;
  sampleIntervalMs?: number;
  maxPoints?: number;

  // current snapshot
  apy: number;
  tvl: number;
  pps: number;
};

const clampFinite = (n: number, fallback = 0) => (Number.isFinite(n) ? n : fallback);

const rangeToCutoffMs = (range: YieldChartRange) => {
  const day = 24 * 60 * 60 * 1000;
  switch (range) {
    case '1W':
      return Date.now() - 7 * day;
    case '1M':
      return Date.now() - 30 * day;
    case '1Y':
      return Date.now() - 365 * day;
    case 'ALL':
    default:
      return 0;
  }
};

const formatLabel = (t: number, range: YieldChartRange) => {
  const d = new Date(t);
  if (range === '1W' || range === '1M') {
    return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
  }
  if (range === '1Y') {
    return d.toLocaleDateString(undefined, { month: 'short' });
  }
  return d.toLocaleDateString(undefined, { year: '2-digit', month: 'short' });
};

export const useYieldAggregatorTimeseries = ({
  vaultAddress,
  enabled = true,
  sampleIntervalMs = 60_000,
  maxPoints = 2_000,
  apy,
  tvl,
  pps,
}: Params) => {
  const chainId = useChainId();
  const storageKey = useMemo(() => {
    const addr = (vaultAddress || 'unknown').toLowerCase();
    return `gigpay:yield:timeseries:${chainId}:${addr}`;
  }, [chainId, vaultAddress]);

  const [points, setPoints] = useState<YieldTimeseriesPoint[]>([]);

  // Load initial points
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setPoints([]);
        return;
      }
      const parsed = JSON.parse(raw) as YieldTimeseriesPoint[];
      if (!Array.isArray(parsed)) {
        setPoints([]);
        return;
      }
      const cleaned = parsed
        .filter((p) => p && typeof p.t === 'number')
        .map((p) => ({
          t: p.t,
          apy: clampFinite(p.apy),
          tvl: clampFinite(p.tvl),
          pps: clampFinite(p.pps, 1),
        }))
        .slice(-maxPoints);
      setPoints(cleaned);
    } catch {
      setPoints([]);
    }
  }, [storageKey, maxPoints]);

  const persist = useCallback(
    (next: YieldTimeseriesPoint[]) => {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
    },
    [storageKey]
  );

  // Sampling loop (client-side only)
  useEffect(() => {
    if (!enabled) return;
    if (!vaultAddress) return;
    if (typeof window === 'undefined') return;

    const tick = () => {
      const now = Date.now();
      setPoints((prev) => {
        const last = prev[prev.length - 1];
        if (last && now - last.t < sampleIntervalMs) return prev;

        const nextPoint: YieldTimeseriesPoint = {
          t: now,
          apy: clampFinite(apy),
          tvl: clampFinite(tvl),
          pps: clampFinite(pps, 1),
        };

        const next = [...prev, nextPoint].slice(-maxPoints);
        persist(next);
        return next;
      });
    };

    // sample immediately and then interval
    tick();
    const id = window.setInterval(tick, sampleIntervalMs);
    return () => window.clearInterval(id);
  }, [enabled, vaultAddress, sampleIntervalMs, maxPoints, apy, tvl, pps, persist]);

  const getRangePoints = useCallback(
    (range: YieldChartRange) => {
      const cutoff = rangeToCutoffMs(range);
      if (!cutoff) return points;
      return points.filter((p) => p.t >= cutoff);
    },
    [points]
  );

  const getChartData = useCallback(
    (range: YieldChartRange, metric: YieldChartMetric) => {
      const filtered = getRangePoints(range);
      return filtered.map((p) => {
        const value =
          metric === 'APY' ? p.apy : metric === 'TVL' ? p.tvl : p.pps;
        return {
          t: p.t,
          label: formatLabel(p.t, range),
          value,
        };
      });
    },
    [getRangePoints]
  );

  const clear = useCallback(() => {
    setPoints([]);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return {
    points,
    getRangePoints,
    getChartData,
    clear,
  };
};

