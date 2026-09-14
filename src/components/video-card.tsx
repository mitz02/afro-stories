"use client";

import Link from "next/link";
import { Play, Clock, Eye } from "lucide-react";
import { AIBadge, PremiumBadge } from "@/components/ui/badges";
import { CinemaImage } from "@/components/ui/cinema-image";
import { ProgressBar } from "@/components/ui/progress";
import { getCountry } from "@/lib/data/countries";
import { cn, formatDuration, formatNumber, timeAgo } from "@/lib/utils";
import { useWatchProgressStore } from "@/lib/store";
import type { Video } from "@/types";

interface VideoCardProps {
  video: Video;
  showCreator?: boolean;
  showProgress?: boolean;
  className?: string;
  aspect?: "video" | "vertical" | "poster";
}

export function VideoCard({
  video,
  showCreator = true,
  showProgress = true,
  className,
  aspect = "video",
}: VideoCardProps) {
  const getProgress = useWatchProgressStore((s) => s.getProgress);
  const progress = getProgress(video.id);
  const country = getCountry(video.country);

  const aspectClass = {
    video: "aspect-video",
    vertical: "aspect-[9/16]",
    poster: "aspect-[2/3]",
  }[aspect];

  return (
    <Link
      href={`/watch/${video.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c1024] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_8px_24px_rgba(84,56,220,0.2)]",
        aspect === "video" && "shrink-0 w-[240px] sm:w-[280px]",
        className
      )}
    >
      {/* Artwork */}
      <div className={cn("relative w-full overflow-hidden bg-zinc-900", aspectClass)}>
        <CinemaImage
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 50vw, 300px"
          className="transition-transform duration-500 group-hover:scale-105"
          gradient="from-transparent via-black/10 to-black/70"
          fallbackText={video.title[0]}
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          {video.monetization === "premium" && (
            <PremiumBadge points={video.unlockPrice} />
          )}
          {video.origin !== "human" && <AIBadge origin={video.origin} />}
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {formatDuration(video.duration)}
        </div>

        {/* Hover play */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#f5b942] text-black shadow-[0_0_20px_rgba(245,185,66,0.5)] transition-transform group-hover:scale-110">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </div>
        </div>

        {showProgress && progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0">
            <ProgressBar value={progress} />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col p-3 pt-2.5">
        <h3 className="line-clamp-1 text-xs sm:text-[13px] font-bold text-white transition-colors group-hover:text-amber-300">
          {video.title}
        </h3>
        {showCreator && (
          <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-zinc-400">
            <span className="truncate">
              {video.creatorId === "c_chiefuwa" ? "Chief Uwa Folktales" : "Creator"}
            </span>
            <span className="text-white/15">•</span>
            <span className="inline-flex items-center gap-1 shrink-0">
              <Eye className="h-3 w-3" />
              {formatNumber(video.views)}
            </span>
          </div>
        )}
        <div className="mt-auto flex items-center gap-1.5 pt-1.5 text-[10.5px] text-zinc-500">
          <span className="inline-flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {timeAgo(video.publishedAt ?? video.createdAt)}
          </span>
          {country && (
            <>
              <span className="text-white/15">•</span>
              <span className="truncate">
                {country.flag} {country.name}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}