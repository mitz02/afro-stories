"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { useMemo, useRef } from "react";
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
  Loader2,
  Film,
} from "lucide-react";
import { CinemaImage } from "@/components/ui/cinema-image";
import { AIBadge } from "@/components/ui/badges";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { createClient } from "@/lib/supabase/client";
import { mapDbVideo, type DbVideoRow } from "@/lib/supabase/videos";
import { cn, formatNumber, formatDuration } from "@/lib/utils";
import type { Video } from "@/types";

const tabs = ["All", "Published", "Drafts", "Pending"] as const;

export default function VideosPage() {
  const [tab, setTab] = React.useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = React.useState("");
  const { user } = useSessionProfile();
  const [dbRows, setDbRows] = React.useState<Video[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const fetchedFor = useRef<string | null>(null);

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
      const { data: rows, error: rowsError } = await supabase
        .from("videos")
        .select("*")
        .eq("creator_id", profileId)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (rowsError) {
        setError(rowsError.message);
      } else {
        setDbRows((rows ?? []).map((r) => mapDbVideo(r as unknown as DbVideoRow)));
      }
      fetchedFor.current = user.id;
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = useMemo(() => {
    return dbRows.filter((v) => {
      const matchesTab =
        tab === "All" ||
        (tab === "Published" && v.status === "published") ||
        (tab === "Drafts" && v.status === "draft") ||
        (tab === "Pending" &&
          (v.status === "pending_review" || v.status === "processing"));
      const matchesQuery = v.title.toLowerCase().includes(query.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [dbRows, tab, query]);

  const totalViews = dbRows.reduce((a, v) => a + (v.views ?? 0), 0);
  const publishedCount = dbRows.filter((v) => v.status === "published").length;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your videos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-cream">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-cream">My Videos</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {dbRows.length} uploaded · {publishedCount} published ·{" "}
            {formatNumber(totalViews)} total views
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
        {filtered.map((video) => {
          const comments = Math.round((video.views ?? 0) / 380);
          return (
            <div
              key={video.id}
              className="group flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.14] sm:flex-row sm:items-center"
            >
              <Link
                href={'/watch/' + video.id}
                className="relative block w-full shrink-0 sm:w-44"
              >
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
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      video.status === "published"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : video.status === "pending_review"
                        ? "bg-gold/10 text-gold"
                        : video.status === "processing"
                        ? "bg-purple/15 text-purple"
                        : "bg-white/[0.08] text-muted-foreground"
                    )}
                  >
                    {video.status === "pending_review"
                      ? "Pending Review"
                      : video.status[0].toUpperCase() + video.status.slice(1)}
                  </span>
                </div>
                <Link
                  href={'/watch/' + video.id}
                  className="mt-1.5 block truncate text-sm font-bold text-cream hover:text-gold"
                >
                  {video.title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {formatNumber(video.views)} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {formatNumber(video.likes)} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {formatNumber(comments)}
                  </span>
                  <span
                    className={cn(
                      video.type === "series" ? "text-gold" : "text-muted-foreground"
                    )}
                  >
                    {video.type === "series" ? "Series episode" : "Single"}
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
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] py-16 text-center">
            {tab === "All" && dbRows.length === 0 ? (
              <Film className="h-8 w-8 text-muted-foreground/40" />
            ) : (
              <MoreVertical className="h-8 w-8 text-muted-foreground/40" />
            )}
            <p className="mt-3 font-display text-sm font-bold text-cream">
              {tab === "All" && dbRows.length === 0
                ? "No uploads yet"
                : 'No ' + tab.toLowerCase() + ' videos'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tab === "All" && dbRows.length === 0
                ? "Upload your first story to get started."
                : tab === "Drafts"
                ? "Start a story and save it as a draft."
                : tab === "Pending"
                ? "Your stories under review will appear here."
                : "Nothing matches your filters."}
            </p>
            {tab === "All" && dbRows.length === 0 && (
              <Link
                href="/upload"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-black transition-all hover:bg-gold-dim"
              >
                <UploadCloud className="h-4 w-4" /> Upload your first video
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}