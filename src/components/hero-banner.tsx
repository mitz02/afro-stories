"use client";

import Link from "next/link";
import { Play, Info, Sparkles } from "lucide-react";
import { CinemaImage } from "@/components/ui/cinema-image";
import { AIBadge } from "@/components/ui/badges";
import { getCountry } from "@/lib/data/countries";
import { getCreator } from "@/lib/data/creators";
import { formatNumber, cn } from "@/lib/utils";
import type { Series, Video } from "@/types";

export function HeroBanner({
  series,
  video,
}: {
  series: Series;
  video?: Video;
}) {
  const creator = getCreator(series.creatorId);
  const country = getCountry(series.country);
  const seasonCount = series.seasons.length;
  const episodeCount = series.seasons.reduce((a, s) => a + s.episodeCount, 0);

  return (
    <section className="relative -mx-4 sm:-mx-6">
      {/* Background */}
      <div className="relative h-[560px] w-full overflow-hidden sm:h-[580px]">
        <CinemaImage
          src={series.coverImage}
          alt={series.title}
          fill
          priority
          sizes="100vw"
          className="animate-ken-burns"
          gradient="from-black/40 via-transparent to-background"
        />
        {/* Scene overlays */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
          <div className="max-w-xl">
            {/* Meta chips */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {video?.origin && video.origin !== "human" && (
                <AIBadge origin={video.origin} />
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                Featured Story
              </span>
              {series.genre.slice(0, 3).map((g) => (
                <Link
                  key={g}
                  href={`/explore?genre=${encodeURIComponent(g)}`}
                  className="rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-gold/40 hover:text-gold"
                >
                  {g}
                </Link>
              ))}
            </div>

            <h1 className="font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-cream sm:text-6xl md:text-7xl">
              <span className="text-gradient-gold">{series.title}</span>
            </h1>

            <p className="mt-4 line-clamp-3 max-w-lg text-sm leading-relaxed text-white/75 sm:text-[15px]">
              {video?.description ?? series.description}
            </p>

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/70">
              {creator && (
                <Link
                  href={`/creator/${creator.id}`}
                  className="flex items-center gap-1.5 transition-colors hover:text-gold"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-700 text-[9px] font-bold text-white">
                    {creator.displayName[0]}
                  </span>
                  {creator.displayName}
                </Link>
              )}
              {country && (
                <span className="flex items-center gap-1">
                  {country.flag} {country.name}
                </span>
              )}
              <span>{seasonCount} Season{seasonCount > 1 ? "s" : ""} · {episodeCount} Episodes</span>
              <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
                {series.ageRating}
              </span>
              {video && (
                <span className="text-muted-foreground">
                  {formatNumber(video.views)} views
                </span>
              )}
            </div>

            {/* CTA buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/watch/${video?.id ?? "v_hero_lastkingdom"}`}
                className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-bold uppercase tracking-wider text-black shadow-lg shadow-gold/30 transition-all hover:bg-gold-dim hover:shadow-gold/50"
              >
                <Play className="h-4 w-4 fill-current transition-transform group-hover:scale-110" />
                Watch Now
              </Link>
              <Link
                href={`/series/${series.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-7 py-3 text-sm font-bold uppercase tracking-wider text-cream backdrop-blur-sm transition-all hover:border-gold/50 hover:bg-white/[0.12]"
              >
                <Info className="h-4 w-4" />
                Explore Series
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}