"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Clock,
  Users,
  ThumbsUp,
  Coins,
  TrendingUp,
  TrendingDown,
  Upload,
  Clapperboard,
  Play,
  ArrowRight,
  Star,
  Layers,
  MessageCircle,
} from "lucide-react";
import { LineChart } from "@/components/charts";
import {
  analyticsOverview,
  viewsTrend,
  topVideos,
  topCountries,
} from "@/lib/data/analytics";
import { CinemaImage } from "@/components/ui/cinema-image";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { createClient } from "@/lib/supabase/client";
import { mapDbVideo, type DbVideoRow } from "@/lib/supabase/videos";
import { cn, formatDuration, formatNumber, formatNaira } from "@/lib/utils";
import type { Video } from "@/types";

export default function DashboardPage() {
  const { user } = useSessionProfile();
  const [dbRows, setDbRows] = useState<Video[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const fetchedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user || fetchedFor.current === user.id) return;
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("id, display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (!profile) return;
      const p = profile as { id: string; display_name: string | null };
      if (p.display_name) setDisplayName(p.display_name);
      const { data: rows } = await supabase
        .from("videos")
        .select("*")
        .eq("creator_id", p.id)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setDbRows((rows ?? []).map((r) => mapDbVideo(r as unknown as DbVideoRow)));
      fetchedFor.current = user.id;
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  type DashVideo = { id: string; title: string; thumbnail: string; views: number };
  const topList: DashVideo[] = dbRows.length > 0 ? dbRows : topVideos;
  const stats = [
    {
      label: "Total Views",
      value: formatNumber(analyticsOverview.totalViews),
      change: analyticsOverview.viewsChange,
      icon: Eye,
      color: "from-gold/20 to-transparent",
      iconColor: "text-gold",
      positive: true,
    },
    {
      label: "Watch Time",
      value: `${formatNumber(analyticsOverview.watchTimeHours)}h`,
      change: analyticsOverview.watchTimeChange,
      icon: Clock,
      color: "from-purple/20 to-transparent",
      iconColor: "text-purple",
      positive: true,
    },
    {
      label: "Followers",
      value: formatNumber(analyticsOverview.followersCount),
      change: analyticsOverview.followersChange,
      icon: Users,
      color: "from-sky-500/20 to-transparent",
      iconColor: "text-sky-300",
      positive: true,
    },
    {
      label: "Revenue",
      value: formatNaira(analyticsOverview.revenue),
      change: analyticsOverview.revenueChange,
      icon: Coins,
      color: "from-emerald-500/20 to-transparent",
      iconColor: "text-emerald-300",
      positive: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-2xl font-black text-cream">
          Welcome back, {displayName ? displayName.split(" ")[0] : "Uwa"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your stories today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br p-4",
              stat.color
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  stat.positive
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-crimson/10 text-crimson"
                )}
              >
                {stat.positive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stat.change}%
              </span>
            </div>
            <p className="mt-4 font-display text-xl font-bold text-cream sm:text-2xl">
              {stat.value}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Chart + top videos */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-cream">
              Views — Last 8 Weeks
            </h3>
            <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
              +18.4% vs prior
            </span>
          </div>
          <LineChart data={viewsTrend} />
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-cream">
              Top Videos
            </h3>
            <Link href="/analytics" className="text-xs text-gold hover:text-gold-dim">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {topList.slice(0, 4).map((video, idx) => (
              <Link
                key={video.id}
                href={dbRows.length > 0 ? `/watch/${video.id}` : "/analytics"}
                className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/[0.04]"
              >
                <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-lg">
                  <CinemaImage src={video.thumbnail} alt={video.title} fill sizes="80px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-cream">
                    {video.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatNumber(video.views)} views
                  </p>
                </div>
                <span className="text-xs font-display font-bold text-muted-foreground">
                  #{idx + 1}
                </span>
              </Link>
            ))}
            {dbRows.length === 0 && (
              <p className="px-1.5 py-2 text-[11px] text-muted-foreground">
                No uploads yet — your stories will appear here.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick upload */}
      <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/[0.08] via-purple/[0.04] to-transparent p-6 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-black">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-cream">
                Create your next hit
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your audience is waiting. Upload a new story in minutes.
              </p>
            </div>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim"
          >
            <Upload className="h-4 w-4" />
            Upload Video
          </Link>
        </div>
      </div>

      {/* Top countries + rating */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="mb-4 font-display text-base font-bold text-cream">
            Top Countries
          </h3>
          <div className="space-y-3">
            {topCountries.map((c) => {
              const max = Math.max(...topCountries.map((x) => x.views));
              const pct = (c.views / max) * 100;
              return (
                <div key={c.code}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {c.flag} {c.name}
                    </span>
                    <span className="text-muted-foreground">
                      {formatNumber(c.views)} views
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold to-burnt-orange"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="mb-4 font-display text-base font-bold text-cream">
            Audience Rating
          </h3>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <p className="font-display text-6xl font-black text-gradient-gold">
                4.8
              </p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= 4
                        ? "fill-gold text-gold"
                        : "fill-gold/50 text-gold/50"
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                2,340 ratings
              </p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const bars: Record<number, number> = {
                  5: 78,
                  4: 15,
                  3: 5,
                  2: 1,
                  1: 1,
                };
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-muted-foreground">{star}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${bars[star]}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[10px] text-muted-foreground">
                      {bars[star]}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-cream">
            Latest Unlocks
          </h3>
          <Link
            href="/earnings"
            className="flex items-center gap-1 text-xs text-gold hover:text-gold-dim"
          >
            View earnings <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          {[
            {
              title: "The Ascension",
              points: 100,
              time: "2 hours ago",
              person: "Viewer unlocked",
              thumbnail: "https://images.unsplash.com/photo-1519802157191-8e14a5d39d2c?w=200&q=80",
            },
            {
              title: "The Forbidden Forest",
              points: 50,
              time: "6 hours ago",
              person: "Viewer unlocked",
              thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=80",
            },
            {
              title: "The Warrior",
              points: 50,
              time: "Yesterday",
              person: "Viewer unlocked",
              thumbnail: "https://images.unsplash.com/photo-1470784869199-0bf6c4c1b2b1?w=200&q=80",
            },
            {
              title: "The Return",
              points: 75,
              time: "2 days ago",
              person: "Viewer unlocked",
              thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=80",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                idx !== 0 && "border-t border-white/[0.04]"
              )}
            >
              <div className="relative aspect-video w-16 shrink-0 overflow-hidden rounded-lg">
                <CinemaImage src={item.thumbnail} alt={item.title} fill sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-cream">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {item.person} · {item.time}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
                +{item.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "My Videos", value: dbRows.length ? dbRows.length.toString() : "0", icon: Clapperboard, href: "/videos" },
          { label: "My Series", value: "8", icon: Layers, href: "/my-series" },
          { label: "Episodes", value: "68", icon: Play, href: "/episodes" },
          { label: "Comments", value: "3,240", icon: MessageCircle, href: "/comments" },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-gold/30"
          >
            <div className="flex items-center justify-between">
              <card.icon className="h-4 w-4 text-gold" />
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="mt-3 font-display text-lg font-bold text-cream">
              {card.value}
            </p>
            <p className="text-[11px] text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}