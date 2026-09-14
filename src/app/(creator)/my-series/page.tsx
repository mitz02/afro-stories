"use client";

import Link from "next/link";
import {
  UploadCloud,
  Eye,
  Plus,
  Pencil,
  MoreVertical,
  Layers,
  Calendar,
  Clock,
} from "lucide-react";
import { series } from "@/lib/data/series";
import { CinemaImage } from "@/components/ui/cinema-image";
import { AIBadge } from "@/components/ui/badges";
import { cn, formatNumber } from "@/lib/utils";

export default function MySeriesPage() {
  const mySeries = series.filter((s) => s.creatorId === "c_chiefuwa");

  const totalViews = mySeries.reduce((sum, s) => sum + s.totalViews, 0);
  const totalEpisodes = mySeries.reduce(
    (sum, s) => sum + s.seasons.reduce((acc, se) => acc + se.episodeCount, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-cream">
            My Series
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mySeries.length} series · {totalEpisodes} episodes ·{" "}
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

      <div className="space-y-4">
        {mySeries.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-gold/25 sm:flex-row"
          >
            <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl sm:w-52">
              <CinemaImage
                src={s.coverImage}
                alt={s.title}
                fill
                sizes="208px"
                gradient={s.coverGradient ?? "from-black/80 via-black/40 to-black"}
              />
              <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-gold">
                {s.seasons.length} {s.seasons.length === 1 ? "Season" : "Seasons"}
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
                    {s.description}
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
                  <Eye className="h-3 w-3" /> {formatNumber(s.totalViews)} views
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" /> {totalEpisodes} episodes
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />{" "}
                  {new Date(s.updatedAt ?? s.createdAt).getFullYear()}
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
                <button className="rounded-full border border-white/[0.12] px-4 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-gold/50 hover:text-gold">
                  <span className="flex items-center gap-1.5">
                    <Plus className="h-3 w-3" /> Add Episode
                  </span>
                </button>
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
    </div>
  );
}