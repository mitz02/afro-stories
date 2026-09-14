"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Lock,
  Play,
  Eye,
  Heart,
  MessageCircle,
  UploadCloud,
  Coins,
} from "lucide-react";
import { series, episodes } from "@/lib/data/series";
import { CinemaImage } from "@/components/ui/cinema-image";
import { PremiumBadge } from "@/components/ui/badges";
import { cn, formatNumber, formatDuration } from "@/lib/utils";

const darkThumbnails: Record<string, string> = {
  s_lastkingdom:
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=400&q=80",
  s_chibundu: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400&q=80",
  s_ghostsofashanti:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=80",
  s_shango: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80",
  s_childrenofearth:
    "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&q=80",
  s_ancestralvoices:
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",
  s_omogirl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
  s_yemaja: "https://images.unsplash.com/photo-1516205651411-aef33a44e7d2?w=400&q=80",
};

export default function EpisodesPage() {
  const mySeries = useMemo(
    () => series.filter((s) => s.creatorId === "c_chiefuwa" || s.creatorId === "c_tobi"),
    []
  );

  const [seriesFilter, setSeriesFilter] = useState<string>("all");

  const seriesIds = useMemo(
    () => new Set(mySeries.map((s) => s.id)),
    [mySeries]
  );

  const filteredSeries = mySeries.filter(
    (s) => seriesFilter === "all" || s.id === seriesFilter
  );

  const myEpisodes = episodes.filter((e) => seriesIds.has(e.seriesId));

  const totalViews = myEpisodes.reduce((sum, e) => sum + e.views, 0);
  const totalUnlocks = myEpisodes
    .filter((e) => e.monetization === "premium")
    .reduce((sum, e) => sum + Math.round(e.views * 0.03), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-cream">Episodes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {myEpisodes.length} episodes · {formatNumber(totalViews)} views ·{" "}
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
        {mySeries.map((s) => (
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
          const seriesEpisodes = myEpisodes.filter((e) => e.seriesId === s.id);
          return (
            <div key={s.id}>
              <h3 className="mb-3 font-display text-base font-bold text-cream">
                {s.title}
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  {seriesEpisodes.length} episodes
                </span>
              </h3>
              <div className="space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                {seriesEpisodes.map((e, idx) => (
                  <div
                    key={e.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.04]",
                      idx !== 0 && "border-t border-white/[0.03]"
                    )}
                  >
                    <div className="relative w-28 shrink-0">
                      <div className="relative aspect-video overflow-hidden rounded-lg">
                        <CinemaImage
                          src={
                            e.thumbnail ||
                            darkThumbnails[s.id] ||
                            "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80"
                          }
                          alt={e.title}
                          fill
                          sizes="112px"
                          gradient={e.thumbnailGradient ?? "from-black/60 to-black"}
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
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gold">
                          S{e.seasonNumber}E{e.episodeNumber}
                        </span>
                        {e.monetization === "premium" && <PremiumBadge />}
                      </div>
                      <p className="mt-0.5 truncate text-sm font-bold text-cream">
                        {e.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {formatNumber(e.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {formatNumber(e.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {formatNumber(e.comments)}
                        </span>
                        {e.monetization === "premium" && (
                          <span className="flex items-center gap-1 font-semibold text-gold">
                            <Coins className="h-3 w-3" /> {formatNumber(Math.round(e.views * 0.03))} unlocks
                          </span>
                        )}
                      </div>
                    </div>

                    <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-muted-foreground transition-all hover:border-gold hover:text-gold">
                      <Play className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}