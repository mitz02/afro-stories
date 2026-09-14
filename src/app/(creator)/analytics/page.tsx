"use client";

import { useState } from "react";
import {
  Eye,
  Clock,
  Heart,
  Share2,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  BarChart,
  RetentionCurve,
} from "@/components/charts";
import {
  analyticsOverview,
  viewsTrend,
  watchTimeTrend,
  revenueTrend,
  retention,
  topVideos,
  topCountries,
  followerGrowth,
} from "@/lib/data/analytics";
import { CinemaImage } from "@/components/ui/cinema-image";
import { cn, formatNumber, formatNaira } from "@/lib/utils";

const ranges = ["7D", "28D", "90D", "1Y"];

export default function AnalyticsPage() {
  const [range, setRange] = useState("28D");

  const metrics = [
    {
      label: "Views",
      value: formatNumber(analyticsOverview.totalViews),
      change: analyticsOverview.viewsChange,
      icon: Eye,
      positive: true,
    },
    {
      label: "Watch Time",
      value: `${formatNumber(analyticsOverview.watchTimeHours)}h`,
      change: analyticsOverview.watchTimeChange,
      icon: Clock,
      positive: true,
    },
    {
      label: "Likes",
      value: formatNumber(analyticsOverview.likesCount),
      change: 9.2,
      icon: Heart,
      positive: true,
    },
    {
      label: "Shares",
      value: formatNumber(analyticsOverview.sharesCount),
      change: -2.4,
      icon: Share2,
      positive: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-cream">
            Analytics
          </h1>
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
                m.positive ? "text-emerald-300" : "text-crimson"
              )}
            >
              {m.positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {m.change}% vs prior {range}
            </span>
          </div>
        ))}
      </div>

      {/* Trend charts */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-cream">
              Views
            </h3>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Last 8 weeks
            </span>
          </div>
          <LineChart data={viewsTrend} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-4 font-display text-base font-bold text-cream">
              Watch Time (Avg. hours / viewer)
            </h3>
            <LineChart data={watchTimeTrend} />
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-4 font-display text-base font-bold text-cream">
              Revenue (₦)
            </h3>
            <LineChart data={revenueTrend} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-4 font-display text-base font-bold text-cream">
              Audience Retention
            </h3>
            <RetentionCurve data={retention} />
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-4 font-display text-base font-bold text-cream">
              Follower Growth
            </h3>
            <LineChart data={followerGrowth} />
          </div>
        </div>
      </div>

      {/* Top videos */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-cream">
            Top Videos
          </h3>
          <span className="text-xs text-muted-foreground">This period</span>
        </div>
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
              {topVideos.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-white/[0.03] last:border-0"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg">
                        <CinemaImage src={v.thumbnail} alt={v.title} fill sizes="96px" />
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
                    {formatNumber(v.watchTime)}h
                  </td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">
                    {formatNumber(v.likes)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold to-burnt-orange"
                          style={{
                            width: `${Math.min(100, (v.watchTime / v.views) * 60)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {Math.round((v.watchTime / v.views) * 60)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Countries */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h3 className="mb-4 font-display text-base font-bold text-cream">
          Audience by Country
        </h3>
        <div className="space-y-3">
          {topCountries.map((c) => {
            const max = Math.max(...topCountries.map((x) => x.views));
            return (
              <div key={c.code} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-bold text-cream">
                  {c.flag} {c.code}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple to-gold"
                    style={{ width: `${(c.views / max) * 100}%` }}
                  />
                </div>
                <span className="w-20 text-right text-muted-foreground">
                  {formatNumber(c.views)}
                </span>
                <span className="w-10 text-right font-semibold text-gold">
                  {Math.round((c.views / analyticTotal) * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const analyticTotal = 12000000;