"use client";

import * as React from "react";
import Link from "next/link";
import {
  Lock,
  Play,
  Eye,
  Heart,
  MessageCircle,
  UploadCloud,
  Coins,
  Layers,
  Loader2,
  Film,
} from "lucide-react";
import { CinemaImage } from "@/components/ui/cinema-image";
import { PremiumBadge } from "@/components/ui/badges";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { createClient } from "@/lib/supabase/client";
import { cn, formatNumber, formatDuration } from "@/lib/utils";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=640&q=80";

interface SeriesRow {
  id: string;
  title: string;
  cover_image: string | null;
}

interface EpisodeRow {
  id: string;
  series_id: string;
  season_number: number;
  episode_number: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  video_id: string | null;
  duration: number;
  monetization: string;
  unlock_price: number;
  views: number;
  likes: number;
  comments_count: number;
  published_at: string;
}

export default function EpisodesPage() {
  const { user } = useSessionProfile();
  const [seriesList, setSeriesList] = React.useState<SeriesRow[]>([]);
  const [episodes, setEpisodes] = React.useState<EpisodeRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [seriesFilter, setSeriesFilter] = React.useState("all");
  const fetchedFor = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!user || fetchedFor.current === user.id) return;
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const profileId = profile ? (profile as { id: string }).id : null;
      if (!profileId) {
        setLoading(false);
        return;
      }
      const { data: seriesRows } = await supabase
        .from("series")
        .select("id, title, cover_image")
        .eq("creator_id", profileId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      const sList = (seriesRows ?? []) as unknown as SeriesRow[];
      setSeriesList(sList);

      if (sList.length === 0) {
        setLoading(false);
        return;
      }
      const ids = sList.map((s) => s.id);
      const { data: eps, error: epsErr } = await supabase
        .from("episodes")
        .select(
          "id, series_id, season_number, episode_number, title, description, thumbnail, video_id, duration, monetization, unlock_price, views, likes, comments_count, published_at"
        )
        .in("series_id", ids)
        .order("season_number", { ascending: true })
        .order("episode_number", { ascending: true });
      if (cancelled) return;
      if (epsErr) {
        setError(epsErr.message);
      } else {
        setEpisodes((eps ?? []) as unknown as EpisodeRow[]);
      }
      fetchedFor.current = user.id;
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredSeries =
    seriesFilter === "all"
      ? seriesList
      : seriesList.filter((s) => s.id === seriesFilter);

  const totalViews = episodes.reduce((sum, e) => sum + (e.views ?? 0), 0);
  const totalUnlocks = episodes
    .filter((e) => e.monetization === "premium")
    .reduce((sum, e) => sum + Math.round((e.views ?? 0) * 0.03), 0);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="mt-4 text-sm text-muted-foreground">Loading episodes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-cream">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-cream">Episodes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {episodes.length} episodes · {formatNumber(totalViews)} views ·{" "}
            {formatNumber(totalUnlocks)} premium unlocks
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim"
        >
          <UploadCloud className="h-4 w-4" />
          New Episode
        </Link>
      </div>

      {seriesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] py-16 text-center">
          <Film className="h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 font-display text-sm font-bold text-cream">No episodes yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload a story in Series Episode mode to start publishing episodes.
          </p>
        </div>
      ) : (
        <>
          {/* Series filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSeriesFilter("all")}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                seriesFilter === "all"
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-white/[0.1] text-muted-foreground hover:text-foreground"
              )}
            >
              All Series
            </button>
            {seriesList.map((s) => (
              <button
                key={s.id}
                onClick={() => setSeriesFilter(s.id)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                  seriesFilter === s.id
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-white/[0.1] text-muted-foreground hover:text-foreground"
                )}
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* Episodes */}
          <div className="space-y-5">
            {filteredSeries.map((s) => {
              const seriesEpisodes = episodes.filter((e) => e.series_id === s.id);
              return (
                <div key={s.id}>
                  <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-cream">
                    <Layers className="h-4 w-4 text-gold" />
                    {s.title}
                    <span className="text-xs font-medium text-muted-foreground">
                      {seriesEpisodes.length} episodes
                    </span>
                  </h3>
                  <div className="space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                    {seriesEpisodes.length === 0 ? (
                      <p className="px-3 py-4 text-xs text-muted-foreground">
                        No episodes yet in this series.
                      </p>
                    ) : (
                      seriesEpisodes.map((e, idx) => (
                        <div
                          key={e.id}
                          className={cn(
                            "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.04]",
                            idx !== 0 && "border-t border-white/[0.03]"
                          )}
                        >
                          <Link href={`/watch/${e.video_id}`} className="relative w-28 shrink-0">
                            <div className="relative aspect-video overflow-hidden rounded-lg">
                              <CinemaImage
                                src={e.thumbnail || s.cover_image || PLACEHOLDER}
                                alt={e.title}
                                fill
                                sizes="112px"
                                gradient="from-black/60 to-black"
                              />
                              {e.monetization === "premium" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <Lock className="h-4 w-4 text-gold" />
                                </div>
                              )}
                            </div>
                            <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-semibold text-cream">
                              {formatDuration(e.duration)}
                            </span>
                          </Link>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-gold">
                                S{e.season_number}E{e.episode_number}
                              </span>
                              {e.monetization === "premium" && <PremiumBadge />}
                            </div>
                            <Link
                              href={`/watch/${e.video_id}`}
                              className="mt-0.5 block truncate text-sm font-bold text-cream hover:text-gold"
                            >
                              {e.title}
                            </Link>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" /> {formatNumber(e.views ?? 0)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" /> {formatNumber(e.likes ?? 0)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />{" "}
                                {formatNumber(e.comments_count ?? 0)}
                              </span>
                              {e.monetization === "premium" && (
                                <span className="flex items-center gap-1 font-semibold text-gold">
                                  <Coins className="h-3 w-3" />{" "}
                                  {formatNumber(Math.round((e.views ?? 0) * 0.03))} unlocks
                                </span>
                              )}
                            </div>
                          </div>

                          <Link
                            href={`/watch/${e.video_id}`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-muted-foreground transition-all hover:border-gold hover:text-gold"
                            aria-label={`Play ${e.title}`}
                          >
                            <Play className="h-4 w-4" />
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}