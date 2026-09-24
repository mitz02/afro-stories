"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Play, Lock, Clock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { formatDuration, cn } from "@/lib/utils";
import { useUnlocksStore } from "@/lib/store";
import { getEpisodesForSeries } from "@/lib/data/series";
import type { Series } from "@/types";

interface EpisodesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series?: Series | null;
  currentEpisodeId?: string;
  currentSeasonNumber?: number;
  episodes?: any[];
  allSeasons?: any[];
  onSelectEpisode: (episodeId: string, videoId: string) => void;
}

export function EpisodesModal({
  open,
  onOpenChange,
  series,
  currentEpisodeId,
  currentSeasonNumber,
  episodes: propEpisodes,
  allSeasons: propSeasons,
  onSelectEpisode,
}: EpisodesModalProps) {
  const { isUnlocked } = useUnlocksStore();
  const [selectedSeason, setSelectedSeason] = useState(currentSeasonNumber || 1);
  const [episodes, setEpisodes] = useState<any[]>([]);

  // Update selectedSeason if currentSeasonNumber changes
  useEffect(() => {
    if (currentSeasonNumber) {
      setSelectedSeason(currentSeasonNumber);
    }
  }, [currentSeasonNumber]);

  // Fetch episodes when series or season changes, or use propEpisodes
  useEffect(() => {
    if (propEpisodes && propEpisodes.length > 0) {
      const seasonEps = propEpisodes.filter(
        (e: any) => !selectedSeason || Number(e.seasonNumber) === Number(selectedSeason)
      );
      setEpisodes(seasonEps.length > 0 ? seasonEps : propEpisodes);
      return;
    }

    if (!series) {
      setEpisodes([]);
      return;
    }

    const eps = getEpisodesForSeries(series.id, selectedSeason);
    if (eps.length > 0) {
      setEpisodes(eps);
      return;
    }

    // If not found in mock data, fetch from DB episodes API
    let cancelled = false;
    fetch(`/api/series/${series.id}/episodes`)
      .then((res) => res.json())
      .then((data: { episodes?: any[] }) => {
        if (cancelled) return;
        const allEps = data.episodes ?? [];
        const seasonEps = selectedSeason
          ? allEps.filter((e: any) => Number(e.seasonNumber) === Number(selectedSeason))
          : allEps;
        setEpisodes(seasonEps.length > 0 ? seasonEps : allEps);
      })
      .catch(() => {
        if (!cancelled) setEpisodes([]);
      });

    return () => {
      cancelled = true;
    };
  }, [series?.id, selectedSeason, propEpisodes]);

  const isEpisodeUnlocked = (ep: any) => {
    return ep.monetization === "free" || isUnlocked(ep.id);
  };

  const seasonsList =
    propSeasons && propSeasons.length > 0
      ? propSeasons
      : series?.seasons && series.seasons.length > 0
      ? series.seasons
      : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-[#111] rounded-2xl border border-white/[0.1] overflow-hidden shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-white/[0.08] bg-[#111]/95 p-4 backdrop-blur-xl z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-bold text-cream truncate">
                    {series?.title || "Series Episodes"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Season {selectedSeason} &middot; {seasonsList.length > 0 ? seasonsList.length : 1} season{seasonsList.length === 1 ? "" : "s"} &middot; {episodes.length} episodes
                  </p>
                </div>
              </div>
            </div>

            {/* Season Selector */}
            {seasonsList.length > 1 && (
              <div className="sticky top-12 z-10 border-b border-white/[0.06] bg-[#111]/95 px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Season
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedSeason((s) => Math.max(1, s - 1))}
                      disabled={selectedSeason <= 1}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Previous season"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="px-3 text-sm font-semibold text-cream">
                      Season {selectedSeason}
                    </span>
                    <button
                      onClick={() => setSelectedSeason((s) => Math.min(seasonsList.length, s + 1))}
                      disabled={selectedSeason >= seasonsList.length}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Next season"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Episodes List */}
            <div className="max-h-[65vh] overflow-y-auto p-4 space-y-2">
              {episodes.map((ep) => {
                const unlocked = isEpisodeUnlocked(ep);
                const targetVideoId = ep.videoId || ep.id;
                const isCurrent = ep.id === currentEpisodeId || targetVideoId === currentEpisodeId;

                return (
                  <div
                    key={ep.id}
                    onClick={() => {
                      onSelectEpisode(ep.id, targetVideoId);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-3 transition-all cursor-pointer select-none",
                      isCurrent
                        ? "bg-gold/15 text-gold border border-gold/30 shadow-sm"
                        : "hover:bg-white/[0.06] text-cream"
                    )}
                  >
                    <div
                      className={cn(
                        "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-bold text-xs",
                        unlocked ? "bg-white/10 text-cream" : "bg-black/60 text-muted-foreground"
                      )}
                    >
                      {isCurrent ? (
                        <Play className="h-4 w-4 text-gold fill-gold" />
                      ) : (
                        <span>E{ep.episodeNumber}</span>
                      )}
                      {!unlocked && !isCurrent && (
                        <Lock className="absolute inset-0 m-auto h-4 w-4 text-gold/60" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          isCurrent ? "text-gold font-bold" : "text-cream"
                        )}
                      >
                        {ep.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {typeof ep.duration === "number" ? formatDuration(ep.duration) : ep.duration || "1m"}
                        </span>
                        {unlocked ? (
                          <span className="text-emerald-400 font-semibold">Free</span>
                        ) : (
                          <span className="flex items-center gap-1 font-semibold text-gold">
                            <Lock className="h-3 w-3" />
                            {ep.unlockPrice ? `${ep.unlockPrice} pts` : "Premium"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground hover:bg-gold/20 hover:text-gold transition-colors">
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </div>
                  </div>
                );
              })}

              {episodes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No episodes available for this season
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
