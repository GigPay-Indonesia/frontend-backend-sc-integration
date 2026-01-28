import { useEffect, useMemo, useState } from 'react';

export type TreasuryOpsTimeseriesPoint = {
  t: number; // ms
  idle: number;
  yieldDeployed: number;
  escrowLocked: number;
  total: number;
};

type Params = {
  enabled?: boolean;
  storageKey: string;
  sampleMs?: number;
  current?: {
    idle: number;
    yieldDeployed: number;
    escrowLocked: number;
    total: number;
  } | null;
};

const readStore = (key: string): TreasuryOpsTimeseriesPoint[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((p) => ({
        t: Number(p.t),
        idle: Number(p.idle),
        yieldDeployed: Number(p.yieldDeployed),
        escrowLocked: Number(p.escrowLocked),
        total: Number(p.total),
      }))
      .filter((p) => Number.isFinite(p.t));
  } catch {
    return [];
  }
};

const writeStore = (key: string, points: TreasuryOpsTimeseriesPoint[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(points.slice(-10_000)));
  } catch {
    // ignore quota errors
  }
};

const cutoffForRange = (range: '7d' | '30d' | '90d' | '1y' | 'all') => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (range === '7d') return now - 7 * day;
  if (range === '30d') return now - 30 * day;
  if (range === '90d') return now - 90 * day;
  if (range === '1y') return now - 365 * day;
  return 0;
};

export function useTreasuryOpsTimeseries({
  enabled = true,
  storageKey,
  sampleMs = 60_000,
  current,
}: Params) {
  const [points, setPoints] = useState<TreasuryOpsTimeseriesPoint[]>(() =>
    typeof window === 'undefined' ? [] : readStore(storageKey)
  );

  useEffect(() => {
    if (!enabled) return;
    if (!storageKey) return;
    if (!current) return;

    const tick = () => {
      const next: TreasuryOpsTimeseriesPoint = {
        t: Date.now(),
        idle: current.idle,
        yieldDeployed: current.yieldDeployed,
        escrowLocked: current.escrowLocked,
        total: current.total,
      };

      setPoints((prev) => {
        const merged = [...prev, next].sort((a, b) => a.t - b.t);
        // de-dup by timestamp bucket (1 minute)
        const bucketed: TreasuryOpsTimeseriesPoint[] = [];
        const seen = new Set<number>();
        for (const p of merged) {
          const bucket = Math.floor(p.t / 60_000);
          if (seen.has(bucket)) continue;
          seen.add(bucket);
          bucketed.push(p);
        }
        writeStore(storageKey, bucketed);
        return bucketed;
      });
    };

    // initial sample
    tick();
    const id = window.setInterval(tick, sampleMs);
    return () => window.clearInterval(id);
  }, [enabled, storageKey, sampleMs, current?.idle, current?.yieldDeployed, current?.escrowLocked, current?.total]);

  const getRange = useMemo(() => {
    return (range: '7d' | '30d' | '90d' | '1y' | 'all') => {
      const from = cutoffForRange(range);
      return points.filter((p) => p.t >= from);
    };
  }, [points]);

  return { points, getRange };
}

