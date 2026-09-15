"use client";

import * as React from "react";
import Link from "next/link";
import {
  UploadCloud,
  Eye,
  Plus,
  Pencil,
  Layers,
  Calendar,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { CinemaImage } from "@/components/ui/cinema-image";
import { AIBadge } from "@/components/ui/badges";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { createClient } from "@/lib/supabase/client";
import { cn, formatNumber } from "@/lib/utils";

interface SeriesRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  cover_gradient: string | null;
  status: string;
  total_views: number;
  total_likes: number;
  created_at: string;
  updated_at: string | null;
}

interface SeriesWithCounts extends SeriesRow {
  seasonCount: number;
  episodeCount: number;
}

export default function MySeriesPage() {
  const { user } = useSessionProfile();
  const [rows, setRows] = React.useState<SeriesWithCounts[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
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
      const { data: seriesRows, error: seriesErr } = await supabase
        .from("series")
        .select(
          "id, slug, title, description, cover_image, cover_gradient, status, total_views, total_likes, created_at, updated_at"
        )
        .eq("creator_id", profileId)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (seriesErr) {
        setError(seriesErr.message);
        setLoading(false);
        return;
      }
      const list = (seriesRows ?? []) as unknown as SeriesRow[];

      let counts: Record<string, { seasonCount: number; episodeCount: number }> = {};
      if (list.length > 0) {
        const ids = list.map((s) => s.id);
        const [{ data: seasons }, { data: episodes }] = await Promise.all([
          supabase
            .from("seasons")
            .select("id, series_id")
            .in("series_id", ids),
          supabase
            .from("episodes")
            .select("id, series_id")
            .in("series_id", ids),
        ]);
        if (cancelled) return;
        const seasonMap: Record<string, number> = {};
        for (const s of seasons ?? []) {
          const sid = (s as { series_id: string }).series_id;
          seasonMap[sid] = (seasonMap[sid] ?? 0) + 1;
        }
        const episodeMap: Record<string, number> = {};
        for (const e of episodes ?? []) {
          const sid = (e as { series_id: string }).series_id;
          episodeMap[sid] = (episodeMap[sid] ?? 0) + 1;
        }
        counts = Object.fromEntries(
          ids.map((id) => [
            id,
            {
              seasonCount: seasonMap[id] ?? 0,
              episodeCount: episodeMap[id] ?? 0,
            },
          ])
        );
      }

      setRows(
        list.map((s) => ({
          ...s,
          seasonCount: counts[s.id]?.seasonCount ?? 0,
          episodeCount: counts[s.id]?.episodeCount ?? 0,
        }))
      );
      fetchedFor.current = user.id;
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const totalViews = rows.reduce((sum, s) => sum + (s.total_views ?? 0), 0);
  const totalEpisodes = rows.reduce((sum, s) => sum + s.episodeCount, 0);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your series…</p>
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
          <h1 className="font-display text-2xl font-black text-cream">My Series</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} series · {totalEpisodes} episodes ·{" "}
            {formatNumber(totalViews)} views
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim"
        >
          <UploadCloud className="h-4 w-4" />
          New Series
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] py-16 text-center">
          <Layers className="h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 font-display text-sm font-bold text-cream">No series yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload a story in Series Episode mode to create your first series.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((s) => (
            <div
              key={s.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-gold/25 sm:flex-row"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl sm:w-52">
                <CinemaImage
                  src={
                    s.cover_image ??
                    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=640&q=80"
                  }
                  alt={s.title}
                  fill
                  sizes="208px"
                  gradient={
                    s.cover_gradient ?? "from-black/80 via-black/40 to-black"
                  }
                />
                <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-gold">
                  {s.seasonCount} {s.seasonCount === 1 ? "Season" : "Seasons"}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <AIBadge origin="ai_generated" />
                    <h3 className="mt-1.5 truncate font-display text-lg font-bold text-cream">
                      {s.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
                      {s.description || "No description yet."}
                    </p>
                  </div>
                  <button
                    className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-gold"
                    aria-label="More options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {formatNumber(s.total_views ?? 0)} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" /> {s.episodeCount} episodes
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />{" "}
                    {new Date(s.updated_at ?? s.created_at).getFullYear()}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-semibold",
                      s.status === "published"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : s.status === "draft"
                        ? "bg-white/[0.08] text-muted-foreground"
                        : "bg-gold/10 text-gold"
                    )}
                  >
                    {s.status[0].toUpperCase() + s.status.slice(1)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/series/${s.id}`}
                    className="rounded-full border border-white/[0.12] px-4 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-gold/50 hover:text-gold"
                  >
                    View Page
                  </Link>
                  <Link
                    href="/upload"
                    className="rounded-full border border-white/[0.12] px-4 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-gold/50 hover:text-gold"
                  >
                    <span className="flex items-center gap-1.5">
                      <Plus className="h-3 w-3" /> Add Episode
                    </span>
                  </Link>
                  <button className="rounded-full border border-white/[0.12] px-4 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-gold/50 hover:text-gold">
                    <span className="flex items-center gap-1.5">
                      <Pencil className="h-3 w-3" /> Edit
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}