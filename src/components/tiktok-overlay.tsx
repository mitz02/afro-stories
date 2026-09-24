"use client";

import { useState } from "react";
import {
  Heart,
  Music2,
  Plus,
  Check,
  Heart as HeartIcon,
  MessageCircle,
  List,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/badges";
import { formatNumber, cn } from "@/lib/utils";
import { useWalletStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { useToastStore } from "@/lib/store";
import { SupportModal } from "@/components/support-modal";
import { EpisodesModal } from "@/components/episodes-modal";

interface TiktokOverlayProps {
  videoId: string;
  creatorId: string;
  liked: boolean;
  likeCount: number;
  following: boolean;
  creatorName: string;
  creatorAvatar: string;
  creatorVerified: boolean;
  caption: string;
  hashtags: string[];
  series: any | null;
  currentEpisodeId: string | undefined;
  currentSeasonNumber: number | undefined;
  onLike: () => void;
  onFollow: () => void;
  onOpenComments: () => void;
  onOpenEpisodes: (series: any, currentEpisodeId: string | undefined, currentSeasonNumber: number | undefined) => void;
  onSelectEpisode: (episodeId: string, videoId: string) => void;
}

export function TiktokOverlay({
  videoId,
  creatorId,
  liked,
  likeCount,
  following,
  creatorName,
  creatorAvatar,
  creatorVerified,
  caption,
  hashtags,
  series,
  currentEpisodeId,
  currentSeasonNumber,
  onLike,
  onFollow,
  onOpenComments,
  onOpenEpisodes,
  onSelectEpisode,
}: TiktokOverlayProps) {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showEpisodesModal, setShowEpisodesModal] = useState(false);

  const { balance, deductPoints, setBalance } = useWalletStore();
  const { user, balance: userBalance, refresh } = useSessionProfile();
  const showToast = useToastStore((s) => s.showToast);

  const signedIn = !!user;
  const effectiveBalance = user ? userBalance : balance;

  const handleSupport = async () => {
    if (!signedIn) {
      setShowSupportModal(true);
      return;
    }

    setShowSupportModal(true);
  };

  const handleOpenEpisodes = () => {
    if (series) {
      setShowEpisodesModal(true);
    }
  };

  const railBtn =
    "flex flex-col items-center gap-1.5 text-white transition-colors";

  return (
    <>
      <SupportModal
        open={showSupportModal}
        onOpenChange={setShowSupportModal}
        creatorId={creatorId}
        creatorName={creatorName}
        videoId={videoId}
      />
      <EpisodesModal
        open={showEpisodesModal}
        onOpenChange={setShowEpisodesModal}
        series={series}
        currentEpisodeId={currentEpisodeId}
        currentSeasonNumber={currentSeasonNumber}
        onSelectEpisode={onSelectEpisode}
      />

      <div className="pointer-events-none absolute inset-0 z-[15] overflow-hidden">
        {/* Music disc (bottom-left) */}
        <div className="pointer-events-none absolute bottom-44 left-4 z-10 flex flex-col items-center gap-2 sm:bottom-48 sm:left-5">
          <div className="tiktok-music-spin relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-black ring-[3px] ring-zinc-700">
            <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle_at_center,#3f3f46_0px,#3f3f46_1px,transparent_1px,transparent_5px)] opacity-60" />
            <div className="absolute inset-[38%] rounded-full bg-zinc-900 ring-1 ring-zinc-700">
              <div className="absolute inset-0 flex items-center justify-center">
                <Music2 className="h-2.5 w-2.5 text-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* Caption card (bottom-left) */}
        <div className="pointer-events-none absolute bottom-[7.5rem] left-4 z-10 w-[min(80%,20rem)] text-left sm:bottom-40 sm:left-5 sm:w-[min(65%,22rem)]">
          <span className="mt-1 inline-flex max-w-full items-center gap-1.5">
            <span className="truncate text-sm font-bold text-white">
              @{creatorName}
            </span>
            {creatorVerified && <VerifiedBadge size={15} />}
          </span>
          <p className="mt-1 line-clamp-2 max-w-md text-xs leading-relaxed text-white/90 drop-shadow">
            {caption}
          </p>
          {hashtags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {hashtags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold text-cyan-300 drop-shadow"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action rail (right) - Support, Episodes, Likes */}
        <div className="pointer-events-auto absolute bottom-44 right-2.5 z-10 flex flex-col items-center gap-4 sm:bottom-48 sm:right-4">
          {/* Support */}
          <button onClick={handleSupport} className={railBtn}>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-transform hover:scale-110">
              <Heart className="h-5.5 w-5.5 text-gold" />
            </span>
            <span className="text-[11px] font-semibold drop-shadow text-gold">Support</span>
          </button>

          {/* Episodes */}
          <button onClick={handleOpenEpisodes} className={railBtn} disabled={!series}>
            <span className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-transform hover:scale-110",
              !series && "opacity-30"
            )}>
              <List className="h-5.5 w-5.5" />
            </span>
            <span className={cn("text-[11px] font-semibold drop-shadow", !series && "opacity-30")}>
              Episodes
            </span>
          </button>

          {/* Likes */}
          <button onClick={onLike} className={railBtn}>
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-transform hover:scale-110",
                liked && "scale-110"
              )}
            >
              <Heart
                className={cn(
                  "h-5.5 w-5.5",
                  liked && "tiktok-heart-pop fill-crimson text-crimson"
                )}
              />
            </span>
            <span className="text-[11px] font-semibold tabular-nums drop-shadow">
              {formatNumber(liked ? likeCount : Math.max(0, likeCount - 1))}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}