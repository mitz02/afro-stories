"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Clock,
  Heart,
  Share2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Loader2,
  Inbox,
} from "lucide-react";
import { LineChart, RetentionCurve } from "@/components/charts";
import { CinemaImage } from "@/components/ui/cinema-image";
import { cn, formatNumber } from "@/lib/utils";
import type { TrendPoint } from "@/types";

const ranges = ["7D", "28D", "90D", "1Y"] as const;
type Range = (typeof ranges)[number];

const RANGE_DAYS: Record<Range, number> = { "7D": 7, "28D": 28, "90D": 90, "1Y": 365 };

interface WatchEvent {
  videoId: string;
  watchedAt: string;
  watchTime: number;
  progress: number;
  country: string;
}

interface TopVideo {
  id: string;
  title: string;
  thumbnail: string | null;
  status: string;
  views: number;
  likes: number;
  watchSeconds: number;
  completionRate: number;
  events: number;
  createdAt: string;
}

interface TopCountry {
  code: string;
  name: string;
  flag: string;
  views: number;
}

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    watchTimeSeconds: number;
    uniqueViewers: number;
    followers: number;
  };
  watchEvents: WatchEvent[];
  followerCreatedAt: string[];
  topVideos: TopVideo[];
  topCountries: TopCountry[];
}

function bucketSeries(
  timestamps: number[],
  weights: number[],
  rangeDays: number,
  points: number
): TrendPoint[] {
  const now = Date.now();
  const start = now - rangeDays * 24 * 60 * 60 * 1000;
  const buckets = Array(points).fill(0) as number[];
  const labels: string[] = [];
  const d = new Date(start);
  const inc = (rangeDays / points) * 24 * 60 * 60 * 1000;
  for (let i = 0; i < points; i++) {
    const labelDate = new Date(d.getTime() + inc * i);
    labels.push(
      points >= 12
        ? labelDate.toLocaleDateString(undefined, { month: "short" })
        : labelDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    );
  }
  for (let i = 0; i < timestamps.length; i++) {
    const t = timestamps[i];
    if (t < start) continue;
    const idx = Math.min(
      points - 1,
      Math.floor(((t - start) / (rangeDays * 24 * 60 * 60 * 1000)) * points)
    );
    buckets[idx] += weights[i];
  }
  return labels.map((label, i) => ({ label, value: buckets[i] }));
}

function changePct(thisPeriod: number, prior: number): number | null {
  if (thisPeriod === 0 && prior === 0) return 0;
  if (prior === 0) return null; // brand new, no prior baseline
  return Math.round(((thisPeriod - prior) / prior) * 100);
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("28D");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/creator/analytics");
        const json = (await res.json()) as AnalyticsData & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error ?? "Failed to load analytics.");
          setLoading(false);
          return;
        }
        setData(json);
      } catch {
        if (!cancelled) setError("Failed to load analytics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const derived = useMemo(() => {
    const rangeDays = RANGE_DAYS[range];
    const points = range === "7D" ? 7 : range === "28D" ? 4 : range === "90D" ? 13 : 12;
    const events = data?.watchEvents ?? [];
    const follows = data?.followerCreatedAt ?? [];

    const evNow = events.map((e) => ({ t: new Date(e.watchedAt).getTime(), w: e.watchTime }));
    const evPrior = evNow.map((e) => ({ t: e.t - rangeDays * 86400000, w: e.w }));
    const foNow = follows.map((f) => new Date(f).getTime());
    const foPrior = foNow.map((f) => f - rangeDays * 86400000);

    const viewsSeries = bucketSeries(
      evNow.map((e) => e.t),
      evNow.map(() => 1),
      rangeDays,
      points
    );
    const watchSeries = bucketSeries(
      evNow.map((e) => e.t),
      evNow.map((e) => e.w / 60),
      rangeDays,
      points
    );
    const priorViews = bucketSeries(
      evPrior.map((e) => e.t),
      evPrior.map(() => 1),
      rangeDays,
      points
    ).reduce((a, b) => a + b.value, 0);
    const priorWatch = bucketSeries(
      evPrior.map((e) => e.t),
      evPrior.map((e) => e.w / 60),
      rangeDays,
      points
    ).reduce((a, b) => a + b.value, 0);
    const followerSeries = bucketSeries(
      foNow,
      foNow.map(() => 1),
      rangeDays,
      points
    );
    const priorFollowers = bucketSeries(
      foPrior,
      foPrior.map(() => 1),
      rangeDays,
      points
    ).reduce((a, b) => a + b.value, 0);

    const thisViews = viewsSeries.reduce((a, b) => a + b.value, 0);
    const thisWatch = watchSeries.reduce((a, b) => a + b.value, 0);
    const thisFollowers = followerSeries.reduce((a, b) => a + b.value, 0);

    const b0 = { label: "0–25%", value: 0 };
    const b1 = { label: "25–50%", value: 0 };
    const b2 = { label: "50–75%", value: 0 };
    const b3 = { label: "75–100%", value: 0 };
    const totalEvents = events.length || 1;
    for (const e of events) {
      if (e.progress < 25) b0.value++;
      else if (e.progress < 50) b1.value++;
      else if (e.progress < 75) b2.value++;
      else b3.value++;
    }
    const retention = [
      { label: b0.label, value: Math.round((b0.value / totalEvents) * 100) },
      { label: b1.label, value: Math.round((b1.value / totalEvents) * 100) },
      { label: b2.label, value: Math.round((b2.value / totalEvents) * 100) },
      { label: b3.label, value: Math.round((b3.value / totalEvents) * 100) },
    ];

    return {
      viewsSeries,
      watchSeries,
      followerSeries,
      retention,
      thisViews,
      thisWatch,
      thisFollowers,
      priorViews,
      priorWatch,
      priorFollowers,
    };
  }, [data, range]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="mt-4 text-sm text-muted-foreground">Crunching your numbers…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] text-center">
        <Inbox className="h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 font-display text-sm font-bold text-cream">Something went wrong</p>
        <p className="mt-1 text-xs text-muted-foreground">{error ?? "No data."}</p>
      </div>
    );
  }

  const { overview } = data;
  const { thisViews, thisWatch, thisFollowers, priorViews, priorWatch, priorFollowers } =
    derived;

  const viewChange = changePct(thisViews, priorViews);
  const watchChange = changePct(Math.round(thisWatch), Math.round(priorWatch));
  const followerChange = changePct(thisFollowers, priorFollowers);

  const metrics = [
    {
      label: "Views",
      value: formatNumber(overview.totalViews),
      change: viewChange,
      suffix: " vs prior",
      icon: Eye,
      positive: (viewChange ?? 0) >= 0,
    },
    {
      label: "Watch Time",
      value: `${formatNumber(Math.floor(overview.watchTimeSeconds / 60))}m`,
      change: watchChange,
      suffix: " vs prior",
      icon: Clock,
      positive: (watchChange ?? 0) >= 0,
    },
    {
      label: "Likes",
      value: formatNumber(overview.totalLikes),
      change: null,
      suffix: " all time",
      icon: Heart,
      positive: true,
    },
    {
      label: "Followers",
      value: formatNumber(overview.followers),
      change: followerChange,
      suffix: " vs prior",
      icon: Share2,
      positive: (followerChange ?? 0) >= 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-cream">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Deep dive into how your stories perform.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/[0.1] p-1">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                range === r
                  ? "bg-gold text-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <m.icon className="h-4 w-4" />
              <span className="text-xs">{m.label}</span>
            </div>
            <p className="mt-2 font-display text-xl font-bold text-cream sm:text-2xl">
              {m.value}
            </p>
            <span
              className={cn(
                "mt-1 inline-flex items-center gap-1 text-[11px] font-bold",
                m.change === null
                  ? "text-muted-foreground/70"
                  : m.change >= 0
                  ? "text-emerald-300"
                  : "text-crimson"
              )}
            >
              {m.change === null ? (
                <TrendingUp className="h-3 w-3" />
              ) : m.change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {m.change === null
                ? "—"
                : `${m.change > 0 ? "+" : ""}${m.change}%`}
              {m.suffix} {range}
            </span>
          </div>
        ))}
      </div>

      {/* Trend charts */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-cream">Views</h3>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Watches tracked in real time
            </span>
          </div>
          <LineChart data={derived.viewsSeries} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-4 font-display text-base font-bold text-cream">
              Watch Time (minutes)
            </h3>
            <LineChart data={derived.watchSeries} />
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-4 font-display text-base font-bold text-cream">
              Follower Growth
            </h3>
            <LineChart data={derived.followerSeries} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-4 font-display text-base font-bold text-cream">
              Audience Retention
            </h3>
            <RetentionCurve data={derived.retention} />
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-4 font-display text-base font-bold text-cream">
              Audience by Country
            </h3>
            {overview.uniqueViewers === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <Users className="h-7 w-7 text-muted-foreground/40" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Breakdown appears once viewers watch your videos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.topCountries.map((c) => {
                  const max = Math.max(...data.topCountries.map((x) => x.views));
                  return (
                    <div key={c.code} className="flex items-center gap-3 text-xs">
                      <span className="w-10 font-bold text-cream">
                        {c.flag} {c.code}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple to-gold"
                          style={{ width: `${(c.views / max) * 100}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-muted-foreground">
                        {formatNumber(c.views)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top videos */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-cream">Top Videos</h3>
          <span className="text-xs text-muted-foreground">All time</span>
        </div>
        {data.topVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-7 w-7 text-muted-foreground/40" />
            <p className="mt-3 text-xs font-semibold text-cream">No videos yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Upload your first story to see performance stats here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Video</th>
                  <th className="pb-3 pr-4 font-medium">Views</th>
                  <th className="pb-3 pr-4 font-medium">Watch Time</th>
                  <th className="pb-3 pr-4 font-medium">Likes</th>
                  <th className="pb-3 font-medium">Completion</th>
                </tr>
              </thead>
              <tbody>
                {data.topVideos.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-white/[0.03] last:border-0"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg">
                          {v.thumbnail ? (
                            <CinemaImage src={v.thumbnail} alt={v.title} fill sizes="96px" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-white/[0.04] text-lg">
                              🎬
                            </div>
                          )}
                        </div>
                        <span className="max-w-[220px] truncate text-xs font-semibold text-cream">
                          {v.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm font-bold text-cream">
                      {formatNumber(v.views)}
                    </td>
                    <td className="py-3 pr-4 text-sm text-muted-foreground">
                      {v.watchSeconds > 0
                        ? `${formatNumber(Math.round(v.watchSeconds / 60))}m`
                        : "—"}
                    </td>
                    <td className="py-3 pr-4 text-sm text-muted-foreground">
                      {formatNumber(v.likes)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-gold to-burnt-orange"
                            style={{ width: `${v.completionRate}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {v.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}