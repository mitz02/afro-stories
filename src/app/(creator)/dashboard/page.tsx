"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import {
  Eye,
  Users,
  ThumbsUp,
  Clapperboard,
  Upload,
  ArrowRight,
  Layers,
  MessageCircle,
  Play,
  Film,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { CinemaImage } from "@/components/ui/cinema-image";
import { AIBadge } from "@/components/ui/badges";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { createClient } from "@/lib/supabase/client";
import { mapDbVideo, type DbVideoRow } from "@/lib/supabase/videos";
import { cn, formatNumber } from "@/lib/utils";
import type { Video } from "@/types";

interface SeriesRow {
  id: string;
  title: string;
  status: string;
  total_views: number;
  total_likes: number;
  created_at: string;
  updated_at: string | null;
}

type Stat = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

export default function DashboardPage() {
  const { user } = useSessionProfile();
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [series, setSeries] = React.useState<SeriesRow[]>([]);
  const [displayName, setDisplayName] = React.useState<string | null>(null);
  const [followers, setFollowers] = React.useState(0);
  const [episodesCount, setEpisodesCount] = React.useState(0);
  const [commentsCount, setCommentsCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const fetchedFor = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!user || fetchedFor.current === user.id) return;
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("id, display_name, followers_count")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (!profile) {
        setLoading(false);
        return;
      }
      const p = profile as {
        id: string;
        display_name: string | null;
        followers_count: number;
      };

      const [videosRes, seriesRes] = await Promise.all([
        supabase
          .from("videos")
          .select("*")
          .eq("creator_id", p.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("series")
          .select("id, title, status, total_views, total_likes, created_at, updated_at")
          .eq("creator_id", p.id)
          .order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;

      const rows = (videosRes.data ?? []) as unknown as DbVideoRow[];
      const seriesRows = (seriesRes.data ?? []) as unknown as SeriesRow[];

      let epCount = 0;
      if (seriesRows.length > 0) {
        const ids = seriesRows.map((s) => s.id);
        const { data: eps } = await supabase
          .from("episodes")
          .select("id")
          .in("series_id", ids);
        if (!cancelled) epCount = eps?.length ?? 0;
      }

      let cmtCount = 0;
      if (rows.length > 0) {
        const ids = rows.map((r) => r.id);
        const { data: cmts } = await supabase
          .from("comments")
          .select("id")
          .in("video_id", ids);
        if (!cancelled) cmtCount = cmts?.length ?? 0;
      }
      if (cancelled) return;

      if (p.display_name) setDisplayName(p.display_name);
      setFollowers(p.followers_count ?? 0);
      setVideos(rows.map((r) => mapDbVideo(r)));
      setSeries(seriesRows);
      setEpisodesCount(epCount);
      setCommentsCount(cmtCount);
      fetchedFor.current = user.id;
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const totalViews = videos.reduce((a, v) => a + (v.views ?? 0), 0);
  const totalLikes = videos.reduce((a, v) => a + (v.likes ?? 0), 0);
  const publishedCount = videos.filter((v) => v.status === "published").length;

  const stats: Stat[] = [
    {
      label: "Total Views",
      value: formatNumber(totalViews),
      icon: Eye,
      color: "from-gold/20 to-transparent",
    },
    {
      label: "Videos",
      value: String(videos.length),
      icon: Film,
      color: "from-purple/20 to-transparent",
    },
    {
      label: "Total Likes",
      value: formatNumber(totalLikes),
      icon: ThumbsUp,
      color: "from-sky-500/20 to-transparent",
    },
    {
      label: "Followers",
      value: formatNumber(followers),
      icon: Users,
      color: "from-emerald-500/20 to-transparent",
    },
  ];

  const topList = [...videos].sort((a, b) => b.views - a.views).slice(0, 4);
  const latest = videos.slice(0, 4);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your studio…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-cream">
            Welcome back,{" "}
            {displayName ? displayName.trim().split(/\s+/)[0] : "Creator"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {videos.length === 0
              ? "Upload your first story to get started."
              : publishedCount + " of your " + videos.length + " videos are live."}
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim"
        >
          <Upload className="h-4 w-4" />
          Upload Video
        </Link>
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
                <stat.icon className="h-5 w-5 text-gold" />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live
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

      {/* Top videos + series snapshot */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Top videos */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-cream">
              <TrendingUp className="h-4 w-4 text-gold" /> Top Videos
            </h3>
            <Link href="/videos" className="text-xs text-gold hover:text-gold-dim">
              View all
            </Link>
          </div>
          {topList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] py-10 text-center">
              <Clapperboard className="h-7 w-7 text-muted-foreground/50" />
              <p className="mt-3 text-xs font-semibold text-cream">No videos yet</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Upload your first story and it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topList.map((video, idx) => (
                <Link
                  key={video.id}
href={'/watch/' + video.id}
                  className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="pointer-events-none relative aspect-video w-20 shrink-0 overflow-hidden rounded-lg">
                    <CinemaImage
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-cream">
                      {video.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatNumber(video.views)} views · {formatNumber(video.likes)} likes
                    </p>
                  </div>
                  <span className="text-xs font-display font-bold text-muted-foreground">
                    #{idx + 1}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Series snapshot */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-cream">
              <Layers className="h-4 w-4 text-gold" /> My Series
            </h3>
            <Link href="/my-series" className="text-xs text-gold hover:text-gold-dim">
              View all
            </Link>
          </div>
          {series.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] py-10 text-center">
              <Layers className="h-7 w-7 text-muted-foreground/50" />
              <p className="mt-3 text-xs font-semibold text-cream">No series yet</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Group your uploads into series as you publish episodes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {series.slice(0, 3).map((s) => (
                <Link
                  key={s.id}
                  href={'/series/' + s.id}
                  className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                    <Layers className="h-4 w-4 text-gold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-cream">{s.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatNumber(s.total_views ?? 0)} views
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      s.status === "published"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-white/[0.08] text-muted-foreground"
                    )}
                  >
                    {s.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
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

      {/* Latest uploads */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-cream">
            Latest Uploads
          </h3>
          <Link
            href="/videos"
            className="flex items-center gap-1 text-xs text-gold hover:text-gold-dim"
          >
            My Videos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          {latest.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <Clapperboard className="h-7 w-7 text-muted-foreground/50" />
              <p className="mt-3 text-xs font-semibold text-cream">Nothing uploaded yet</p>
            </div>
          ) : (
            latest.map((video, idx) => (
              <Link
                key={video.id}
                href={'/watch/' + video.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]",
                  idx !== 0 && "border-t border-white/[0.04]"
                )}
              >
                <div className="pointer-events-none relative aspect-video w-16 shrink-0 overflow-hidden rounded-lg">
                  <CinemaImage src={video.thumbnail} alt={video.title} fill sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-xs font-semibold text-cream">
                    {video.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatNumber(video.views)} views ·{" "}
                    {new Date(video.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <AIBadge origin={video.origin} />
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                      video.status === "published"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : video.status === "processing"
                        ? "bg-purple/15 text-purple"
                        : "bg-white/[0.08] text-muted-foreground"
                    )}
                  >
                    {video.status}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "My Videos",
            value: String(videos.length),
            icon: Clapperboard,
            href: "/videos",
          },
          {
            label: "My Series",
            value: String(series.length),
            icon: Layers,
            href: "/my-series",
          },
          {
            label: "Episodes",
            value: String(episodesCount),
            icon: Play,
            href: "/episodes",
          },
          {
            label: "Comments",
            value: formatNumber(commentsCount),
            icon: MessageCircle,
            href: "/comments",
          },
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