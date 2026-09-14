"use client";

import Link from "next/link";
import { Clock, Play, Lock, Eye, CheckCircle2 } from "lucide-react";
import { CinemaImage } from "@/components/ui/cinema-image";
import { PremiumBadge } from "@/components/ui/badges";
import { ProgressBar } from "@/components/ui/progress";
import { cn, formatDuration, formatNumber, formatPoints } from "@/lib/utils";
import { useUnlocksStore, useWatchProgressStore } from "@/lib/store";
import type { Episode } from "@/types";

interface EpisodeCardProps {
  episode: Episode;
  seriesId: string;
  index?: number;
  isNext?: boolean;
  isCurrent?: boolean;
  showProgress?: boolean;
  className?: string;
}

export function EpisodeCard({
  episode,
  seriesId,
  index,
  isNext,
  isCurrent,
  showProgress = true,
  className,
}: EpisodeCardProps) {
  const { isUnlocked } = useUnlocksStore();
  const getProgress = useWatchProgressStore((s) => s.getProgress);
  const progress = getProgress(episode.videoId);
  const unlocked = isUnlocked(episode.id) || episode.monetization === "free";
  const lockActive = episode.monetization === "premium" && !unlocked;

  return (
    <Link
      href={`/watch/${episode.videoId}`}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "group flex gap-3 rounded-xl p-2 transition-colors",
        isNext && "border border-gold/30 bg-gold/5",
        isCurrent
          ? "border border-gold/40 bg-gold/[0.07] shadow-[0_0_0_1px_rgba(245,185,66,0.2)]"
          : "hover:bg-white/[0.04]",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-[130px] shrink-0 overflow-hidden rounded-lg sm:w-[170px]">
        <CinemaImage
          src={episode.thumbnail}
          alt={episode.title}
          fill
          sizes="170px"
          className="transition-transform duration-500 group-hover:scale-105"
          gradient="from-black/10 to-black/60"
          fallbackText={episode.title[0]}
        />

        {/* Episode number badge */}
        <div className="absolute left-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-black/70 px-1 text-[10px] font-bold text-white backdrop-blur-sm">
          {episode.episodeNumber}
        </div>

        {/* Current episode indicator */}
        {isCurrent && !lockActive && (
          <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-md bg-gold px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-black">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-black" />
            </span>
            Playing
          </div>
        )}

        {isNext && !isCurrent && (
          <div className="absolute left-1.5 top-1.5 right-1.5 flex items-center justify-center rounded-md bg-gold px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-black opacity-0 transition-opacity group-hover:opacity-100 sm:top-auto sm:right-1.5 sm:bottom-1.5 sm:left-1.5">
            Up Next
          </div>
        )}

        {/* Locked state */}
        {lockActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 backdrop-blur-[2px]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-black/50 text-gold">
              <Lock className="h-3.5 w-3.5" />
            </div>
            {typeof episode.unlockPrice === "number" && (
              <span className="rounded-full bg-gold px-1.5 py-px text-[8.5px] font-bold text-black">
                {formatPoints(episode.unlockPrice)} pts
              </span>
            )}
          </div>
        )}

        {/* Play on hover (unlocked only) */}
        {!lockActive && (
          <div className="absolute inset-0 m-auto flex h-9 w-9 items-center justify-center rounded-full bg-gold text-black opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </div>
        )}

        <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-px text-[10px] font-medium text-white">
          {formatDuration(episode.duration)}
        </div>
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className={cn(
                "text-[11px] font-medium uppercase tracking-wider",
                isCurrent ? "text-gold" : "text-muted-foreground"
              )}
            >
              S{episode.seasonNumber} · E
              {typeof index === "number" ? index : episode.episodeNumber}
            </p>
            <h4
              className={cn(
                "line-clamp-1 font-display text-[15px] font-semibold transition-colors",
                isCurrent
                  ? "text-gold"
                  : "text-cream group-hover:text-gold"
              )}
            >
              {episode.title}
            </h4>
          </div>
          {episode.monetization === "premium" && (
            <PremiumBadge
              points={episode.unlockPrice}
              size="xs"
              className="shrink-0"
            />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {episode.description}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-1.5 text-[11px] text-muted-foreground/70">
          {!lockActive && (
            <span className="inline-flex items-center gap-0.5">
              <Eye className="h-3 w-3" />
              {formatNumber(episode.views)} views
            </span>
          )}
          <span className="inline-flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {formatDuration(episode.duration)}
          </span>
          {unlocked && !lockActive && (
            <span className="inline-flex items-center gap-0.5 text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Unlocked
            </span>
          )}
          {lockActive && (
            <span className="inline-flex items-center gap-0.5 text-gold">
              <Lock className="h-3 w-3" />
              Premium
            </span>
          )}
        </div>

        {showProgress && progress > 0 && progress < 100 && (
          <ProgressBar value={progress} className="mt-2 h-0.5" />
        )}
      </div>
    </Link>
  );
}