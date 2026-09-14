"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Play,
  Heart,
  Share2,
  Bell,
  BellRing,
  Eye,
  Calendar,
  Check,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { CinemaImage } from "@/components/ui/cinema-image";
import { EpisodeCard } from "@/components/episode-card";
import { VerifiedBadge, AIBadge, PremiumBadge } from "@/components/ui/badges";
import { CreatorCard } from "@/components/creator-card";
import { SeriesCard } from "@/components/series-card";
import { HorizontalScroller } from "@/components/horizontal-scroller";
import { SectionHeading } from "@/components/section-heading";
import { getSeries, getEpisodesForSeries, getNextEpisode, series as allSeries } from "@/lib/data/series";
import { getCreator } from "@/lib/data/creators";
import { getCountry } from "@/lib/data/countries";
import { getVideo } from "@/lib/data/videos";
import { useSocialStore, useToastStore } from "@/lib/store";
import { formatNumber, cn, timeAgo } from "@/lib/utils";

export default function SeriesPage() {
  const { id } = useParams<{ id: string }>();
  const series = getSeries(id);
  const [activeSeason, setActiveSeason] = useState(1);
  const { followedSeries, toggleFollowSeries } = useSocialStore();
  const showToast = useToastStore((s) => s.showToast);

  if (!series) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-2xl text-cream">Series not found</p>
        <Link href="/explore" className="mt-4 text-sm text-gold hover:underline">
          Explore other stories
        </Link>
      </div>
    );
  }

  const creator = getCreator(series.creatorId);
  const country = getCountry(series.country);
  const seasons = series.seasons;
  const currentSeason = seasons.find((s) => s.seasonNumber === activeSeason) ?? seasons[0];
  const seasonEpisodes = getEpisodesForSeries(series.id, activeSeason);
  const firstEpisode = getEpisodesForSeries(series.id, 1)[0];
  const allEpisodesFlat = series.seasons.flatMap((s) =>
    getEpisodesForSeries(series.id, s.seasonNumber)
  );
  const totalEpisodes = allEpisodesFlat.length;
  const isFollowing = followedSeries.includes(series.id);
  const firstVideo = firstEpisode ? getVideo(firstEpisode.videoId) : undefined;
  const countryName = country?.name ?? series.country;

  const handleFollow = () => {
    toggleFollowSeries(series.id);
    showToast(
      isFollowing ? "Unfollowed series" : `Following "${series.title}"`,
      isFollowing ? "You'll no longer get updates." : "You'll get notified of new episodes."
    );
  };

  const handleShare = () => {
    showToast("Link copied to clipboard", "Share the story with your friends.");
  };

  const popularSeries = allSeries.filter((s) => s.id !== series.id).slice(0, 6);
  const similarSeries = allSeries
    .filter((s) => s.id !== series.id)
    .sort((a, b) => {
      const aOverlap = a.genre.filter((g) => series.genre.includes(g)).length;
      const bOverlap = b.genre.filter((g) => series.genre.includes(g)).length;
      return bOverlap - aOverlap;
    })
    .slice(0, 6);

  return (
    <div>
      {/* COVER */}
      <div className="relative h-[420px] w-full overflow-hidden sm:h-[480px]">
        <CinemaImage
          src={series.coverImage}
          alt={series.title}
          fill
          priority
          sizes="100vw"
          className="animate-ken-burns"
          gradient="from-black/30 via-transparent to-charcoal"
        />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/85 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-charcoal via-charcoal/70 to-transparent" />
      </div>

      <div className="mx-auto -mt-40 max-w-7xl px-4 pb-16 sm:px-6 md:px-8">
        <div className="relative z-10 grid gap-10 lg:grid-cols-[320px_1fr]">
          {/* Poster */}
          <div className="hidden lg:block">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60">
              <CinemaImage
                src={series.coverImage}
                alt={series.title}
                fill
                sizes="320px"
                gradient="from-transparent via-transparent to-black/60"
              />
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent p-3">
                <div className="flex items-center gap-1.5">
                  {series.monetization === "premium" && <PremiumBadge size="xs" />}
                </div>
              </div>
            </div>
          </div>

          {/* Header content */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {series.featured && (
                <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
                  Featured
                </span>
              )}
              {series.monetization === "premium" && <PremiumBadge size="md" />}
              {firstVideo?.origin && firstVideo.origin !== "human" && (
                <AIBadge origin={firstVideo.origin} size="sm" />
              )}
              {series.completed && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                  <Check className="h-3 w-3" />
                  Completed
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-4xl font-black leading-tight text-cream sm:text-5xl">
              {series.title}
            </h1>

            {/* Meta */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {creator && (
                <Link href={`/creator/${creator.id}`} className="group flex items-center gap-1.5">
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white", creator.avatarGradient)}>
                    {creator.displayName[0]}
                  </span>
                  <span className="transition-colors group-hover:text-gold">
                    {creator.displayName}
                  </span>
                  {creator.verified && <VerifiedBadge size={13} />}
                </Link>
              )}
              {country && (
                <span className="flex items-center gap-1">
                  {country.flag} {countryName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {formatNumber(series.totalViews)} views
              </span>
              <span className="rounded border border-white/20 px-1.5 py-0.5 text-xs">
                {series.ageRating}
              </span>
              <span className="text-xs text-muted-foreground/60">
                {timeAgo(series.updatedAt)} updated
              </span>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">
              {series.description}
            </p>

            {/* Tags / genres */}
            <div className="mt-4 flex flex-wrap gap-2">
              {series.genre.map((g) => (
                <Link
                  key={g}
                  href={`/explore?genre=${encodeURIComponent(g)}`}
                  className="rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
                >
                  {g}
                </Link>
              ))}
            </div>

            {/* CTA row */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {firstEpisode && (
                <Link
                  href={`/watch/${firstEpisode.videoId}`}
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-black shadow-lg shadow-gold/30 transition-all hover:bg-gold-dim"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Watch First Episode
                </Link>
              )}
              <button
                onClick={handleFollow}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm font-bold uppercase tracking-wider transition-all",
                  isFollowing
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-white/20 bg-white/[0.04] text-cream hover:border-gold/50"
                )}
              >
                {isFollowing ? (
                  <>
                    <BellRing className="h-4 w-4" />
                    Following Series
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    Follow Series
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  toggleFollowSeries(series.id);
                  showToast("Series saved", "Added to your saved series.");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 p-3.5 text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
                aria-label="Save"
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 p-3.5 text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="mt-7 flex flex-wrap gap-6 border-t border-white/[0.06] pt-5 text-center">
              {[
                { label: "Episodes", value: totalEpisodes.toString() },
                { label: "Seasons", value: seasons.length.toString() },
                { label: "Followers", value: formatNumber(series.followers) },
                { label: "Likes", value: formatNumber(series.totalLikes) },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-xl font-bold text-cream">
                    {stat.value}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SEASONS & EPISODES */}
        <div className="mt-14">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-cream">
              Seasons & Episodes
            </h2>
            {/* Season selector */}
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {seasons.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSeason(s.seasonNumber)}
                  className={cn(
                    "shrink-0 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
                    activeSeason === s.seasonNumber
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-white/[0.1] text-muted-foreground hover:text-foreground"
                  )}
                >
                  Season {s.seasonNumber}
                </button>
              ))}
            </div>
          </div>

          {currentSeason && (
            <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-cream">
                    {currentSeason.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {currentSeason.episodeCount} episodes
                  </p>
                </div>
                {currentSeason.description && (
                  <p className="hidden max-w-md text-right text-xs text-muted-foreground sm:block">
                    {currentSeason.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Episode list */}
          <div className="space-y-2">
            {seasonEpisodes.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/[0.08] py-12 text-center">
                <Calendar className="mx-auto h-6 w-6 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Coming soon. This season is still in production.
                </p>
              </div>
            )}
            {seasonEpisodes.map((ep, idx) => {
              const next = getNextEpisode(series.id, ep.seasonNumber, ep.episodeNumber);
              const isThisNext = next?.id === ep.id;
              return (
                <EpisodeCard
                  key={ep.id}
                  episode={ep}
                  seriesId={series.id}
                  index={idx + 1}
                  isNext={false}
                />
              );
            })}
          </div>

          {/* All episodes (other seasons quick access) */}
          {/* Next episode (recommendation) */}
          {firstEpisode &&
            (() => {
              const next = getNextEpisode(series.id, activeSeason, seasonEpisodes.length);
              if (!next) return null;
              return (
                <div className="mt-8 rounded-2xl border border-gold/25 bg-gradient-to-r from-gold/[0.07] to-transparent p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-display text-lg font-bold text-cream">
                      <Play className="h-4 w-4 fill-current text-gold" />
                      Up Next
                    </h3>
                  </div>
                  <div className="mt-3">
                    <EpisodeCard
                      episode={next}
                      seriesId={series.id}
                      isNext
                    />
                  </div>
                </div>
              );
            })()}
        </div>

        {/* CREATOR */}
        {creator && (
          <div className="mt-14 border-t border-white/[0.06] pt-10">
            <SectionHeading
              title="About the Creator"
              href={`/creator/${creator.id}`}
            />
            <div className="max-w-md">
              <CreatorCard creator={creator} />
            </div>
          </div>
        )}

        {/* MORE SERIES */}
        <div className="mt-14 border-t border-white/[0.06] pt-10">
          <SectionHeading title="More Like This" subtitle="Recommended series" href="/explore" />
          <HorizontalScroller>
            {similarSeries.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </HorizontalScroller>
        </div>
      </div>
    </div>
  );
}