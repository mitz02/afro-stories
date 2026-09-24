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
  series: Series;
  currentEpisodeId?: string;
  currentSeasonNumber?: number;
  onSelectEpisode: (episodeId: string, videoId: string) => void;
}

export function EpisodesModal({
  open,
  onOpenChange,
  series,
  currentEpisodeId,
  currentSeasonNumber,
  onSelectEpisode,
}: EpisodesModalProps) {
  const { isUnlocked } = useUnlocksStore();
  const [selectedSeason, setSelectedSeason] = useState(currentSeasonNumber || 1);
  const [episodes, setEpisodes] = useState<any[]>([]);

  // Fetch episodes when series or season changes
  useEffect(() => {
    if (!series) {
      setEpisodes([]);
      return;
    }
    const eps = getEpisodesForSeries(series.id, selectedSeason);
    setEpisodes(eps);
  }, [series?.id, selectedSeason]);

  const isEpisodeUnlocked = (ep: any) => {
    return ep.monetization === "free" || isUnlocked(ep.id);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-charcoal-raised/95 rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl backdrop-blur-xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-white/[0.08] bg-charcoal-raised/95 p-4 backdrop-blur-xl z-10">
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
                    {series?.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Season {selectedSeason} &middot; {series?.seasons?.length ?? 1} seasons
                  </p>
                </div>
              </div>
            </div>

            {/* Season Selector */}
            {series?.seasons && series.seasons.length > 1 && (
              <div className="sticky top-12 z-10 border-b border-white/[0.06] bg-charcoal-raised/95 px-4 py-3 backdrop-blur-xl">
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
                      onClick={() => setSelectedSeason((s) => Math.min(series.seasons.length, s + 1))}
                      disabled={selectedSeason >= series.seasons.length}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Next season"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="max-h-[65vh] overflow-y-auto p-4">
              <div className="space-y-2">
                {episodes.map((ep) => {
                  const unlocked = isEpisodeUnlocked(ep);
                  const isCurrent = ep.id === currentEpisodeId;

                  return (
                    <a
                      key={ep.id}
                      href={unlocked ? `/watch/${ep.videoId}` : "#"}
                      onClick={(e) => {
                        if (!unlocked) {
                          e.preventDefault();
                          return;
                        }
                        onSelectEpisode(ep.id, ep.videoId);
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-xl p-2 transition-colors",
                        isCurrent
                          ? "bg-gold/10 text-gold"
                          : "hover:bg-white/[0.04]"
                      )}
                    >
                      <div className={cn(
                        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        unlocked ? "bg-white/10" : "bg-gray-900/50"
                      )}>
                        <span className={cn(
                          "text-[10px] font-semibold",
                          unlocked ? "text-cream" : "text-muted-foreground"
                        )}>
                          E{ep.episodeNumber}
                        </span>
                        {!unlocked && (
                          <Lock className="absolute inset-0 h-5 w-5 text-gold/50" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "truncate text-xs font-medium",
                          ep.id === currentEpisodeId ? "text-gold" : "text-cream"
                        )}>
                          {ep.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {typeof ep.duration === "number" ? formatDuration(ep.duration) : ep.duration}
                          </span>
                          {!unlocked && (
                            <span className="flex items-center gap-1 text-gold">
                              <Lock className="h-2.5 w-2.5" />
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                      {ep.id === currentEpisodeId && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold">
                          <Play className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </a>
                  );
                })}
                {episodes.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      No episodes in this season
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
