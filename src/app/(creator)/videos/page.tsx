"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  Eye,
  Heart,
  MessageCircle,
  MoreVertical,
  Pencil,
  Trash2,
  BarChart3,
  Search,
  Lock,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { videos } from "@/lib/data/videos";
import { series, episodes } from "@/lib/data/series";
import { CinemaImage } from "@/components/ui/cinema-image";
import { AIBadge } from "@/components/ui/badges";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { createClient } from "@/lib/supabase/client";
import { mapDbVideo, type DbVideoRow } from "@/lib/supabase/videos";
import { cn, formatNumber, formatDuration } from "@/lib/utils";
import type { Video } from "@/types";

const tabs = ["All", "Published", "Drafts", "Pending"] as const;

const seriesTitles: Record<string, string> = Object.fromEntries(
  series.map((s) => [s.id, s.title])
);

type LibraryItem = {
  id: string;
  title: string;
  views: number;
  likes: number;
  duration: number;
  thumbnail: string;
  origin: Video["origin"];
  status: Video["status"];
  type: "video" | "episode";
  _db: boolean;
};

export default function VideosPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = useState("");
  const { user } = useSessionProfile();
  const [dbRows, setDbRows] = useState<Video[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const fetchedFor = useRef<string | null>(null);

  // Fetch the signed-in creator's real uploads (Bunny-backed) from Supabase.
  useEffect(() => {
    if (!user || fetchedFor.current === user.id) return;
    fetchedFor.current = user.id;
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      setDbLoading(true);
      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const profileId = profile ? (profile as { id: string }).id : null;
      if (!profileId) {
        setDbLoading(false);
        return;
      }
      const { data: rows } = await supabase
        .from("videos")
        .select("*")
        .eq("creator_id", profileId)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setDbRows((rows ?? []).map((r) => mapDbVideo(r as unknown as DbVideoRow)));
      setDbLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const all = useMemo<LibraryItem[]>(
    () => [
      ...videos
        .filter((v) => v.creatorId === "c_chiefuwa")
        .map((v) => ({
          id: v.id,
          title: v.title,
          views: v.views,
          likes: v.likes,
          duration: v.duration,
          thumbnail: v.thumbnail,
          origin: v.origin,
          status: v.status,
          type: "video" as const,
          _db: false,
        })),
      ...episodes.map((e) => ({
        id: e.id,
        title: `${seriesTitles[e.seriesId] ?? "Series"} — S${e.seasonNumber}E${e.episodeNumber}: ${e.title}`,
        views: e.views,
        likes: e.likes,
        duration: e.duration,
        thumbnail: e.thumbnail,
        origin: "ai_generated" as const,
        status: "published" as const,
        type: "episode" as const,
        _db: false,
      })),
      ...dbRows.map((v) => ({
        id: v.id,
        title: v.title,
        views: v.views,
        likes: v.likes,
        duration: v.duration,
        thumbnail: v.thumbnail,
        origin: v.origin,
        status: v.status,
        type: "video" as const,
        _db: true,
      })),
    ],
    [dbRows]
  );

  const filtered = all.filter((v) => {
    const matchesTab =
      tab === "All" ||
      (tab === "Published" && v.status === "published") ||
      (tab === "Drafts" && v.status === "draft") ||
      (tab === "Pending" &&
        (v.status === "pending_review" || v.status === "processing"));
    const matchesQuery = v.title.toLowerCase().includes(query.toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-cream">
            My Videos
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {filtered.length} stories · {formatNumber(0)} total views
            {dbLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />}
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim"
        >
          <UploadCloud className="h-4 w-4" />
          New Video
        </Link>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border border-white/[0.1] p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                tab === t
                  ? "bg-gold text-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos…"
            className="rounded-full border border-white/[0.1] bg-charcoal-raised py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Video list */}
      <div className="space-y-3">
        {filtered.map((video, idx) => (
          <div
            key={video.id}
            className="group flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.14] sm:flex-row sm:items-center"
          >
            <Link href={video._db ? `/watch/${video.id}` : "/analytics"} className="relative block w-full shrink-0 sm:w-44">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                <CinemaImage src={video.thumbnail} alt={video.title} fill sizes="176px" />
                {(video.status === "pending_review" ||
                  video.status === "processing") && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Lock className="h-6 w-6 text-gold" />
                  </div>
                )}
              </div>
              <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-cream">
                {formatDuration(video.duration)}
              </span>
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <AIBadge origin={video.origin} />
                {video.status === "draft" && (
                  <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Draft
                  </span>
                )}
                {video.status === "pending_review" && (
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">
                    Pending Review
                  </span>
                )}
                {video.status === "processing" && (
                  <span className="rounded-full bg-purple/15 px-2 py-0.5 text-[10px] font-semibold text-purple">
                    Processing
                  </span>
                )}
              </div>
              <Link
                href={video._db ? `/watch/${video.id}` : "/analytics"}
                className="mt-1.5 block truncate text-sm font-bold text-cream hover:text-gold"
              >
                {video.title}
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {formatNumber(video.views)} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" /> {formatNumber(video.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> {Math.round(video.views / 380)}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 font-semibold",
                    idx === 0 ? "text-gold" : "text-emerald-300"
                  )}
                >
                  <TrendingUp className="h-3 w-3" /> +{(8 + idx * 3)}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
              <div className="flex items-center gap-1.5">
                <button
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-gold"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-purple"
                  aria-label="Analytics"
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-crimson"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] py-16 text-center">
            <MoreVertical className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 font-display text-sm font-bold text-cream">
              No {tab.toLowerCase()} videos
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tab === "Drafts"
                ? "Start a story and save it as a draft."
                : tab === "Pending"
                ? "Your stories under review will appear here."
                : "Upload your first story to get started."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}