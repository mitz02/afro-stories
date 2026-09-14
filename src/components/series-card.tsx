"use client";

import Link from "next/link";
import { Layers, Eye, Play } from "lucide-react";
import { CinemaImage } from "@/components/ui/cinema-image";
import { AIBadge, PremiumBadge } from "@/components/ui/badges";
import { getCountry } from "@/lib/data/countries";
import { getCreator } from "@/lib/data/creators";
import { cn, formatNumber } from "@/lib/utils";
import type { Series } from "@/types";

export function SeriesCard({
  series,
  className,
  large = false,
}: {
  series: Series;
  className?: string;
  large?: boolean;
}) {
  const creator = getCreator(series.creatorId);
  const country = getCountry(series.country);
  const seasonCount = series.seasons.length;
  const firstSeason = series.seasons[0];
  const totalEpisodes = series.seasons.reduce(
    (acc, s) => acc + s.episodeCount,
    0
  );

  return (
    <Link
      href={`/series/${series.id}`}
      className={cn("group block shrink-0", large ? "w-[260px] sm:w-[320px]" : "w-[200px] sm:w-[240px]", className)}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl",
          large ? "aspect-[2/3]" : "aspect-[16/10]"
        )}
      >
        <CinemaImage
          src={series.coverImage}
          alt={series.title}
          fill
          sizes="(max-width: 640px) 50vw, 320px"
          className="transition-transform duration-500 group-hover:scale-105"
          gradient="from-transparent via-transparent to-black/80"
          fallbackText={series.title[0]}
        />

        {/* Overlay info */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="flex items-center gap-1.5">
            {series.monetization === "premium" && <PremiumBadge size="xs" />}
            {firstSeason && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white/90 backdrop-blur-sm">
                <Layers className="h-2.5 w-2.5" />
                S{firstSeason.seasonNumber} · {firstSeason.episodeCount} eps
              </span>
            )}
          </div>
          <h3 className={cn(
            "mt-1.5 line-clamp-2 font-display font-bold text-white",
            large ? "text-lg leading-snug" : "text-sm leading-snug"
          )}>
            {series.title}
          </h3>
        </div>

        {/* Hover CTA */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-black shadow-lg shadow-gold/40">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-white">
              Watch Series
            </span>
          </div>
        </div>

        {/* Completion badge */}
        {series.status === "published" && (
          <div className="absolute right-2 top-2 flex items-center gap-1">
            {series.featured && (
              <span className="rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
                Featured
              </span>
            )}
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="mt-2 px-0.5">
        <div className="flex items-center justify-between">
          <p className="truncate text-[11px] text-muted-foreground">
            {creator?.displayName ?? "Creator"}
          </p>
          {series.completed && (
            <span className="flex items-center gap-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-300">
              Completed
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
          <span className="inline-flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {formatNumber(series.totalViews)}
          </span>
          {country && (
            <>
              <span className="text-white/15">•</span>
              <span>
                {country.flag} {country.name}
              </span>
            </>
          )}
          <span className="text-white/15">•</span>
          <span>{seasonCount} {seasonCount === 1 ? "season" : "seasons"}</span>
        </div>
      </div>
    </Link>
  );
}