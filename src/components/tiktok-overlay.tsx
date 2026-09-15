"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  Plus,
  Check,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/badges";
import { formatNumber, cn } from "@/lib/utils";

interface TiktokOverlayProps {
  videoId: string;
  liked: boolean;
  likeCount: number;
  saved: boolean;
  following: boolean;
  creatorName: string;
  creatorAvatar: string;
  creatorVerified: boolean;
  caption: string;
  hashtags: string[];
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onFollow: () => void;
  onOpenComments: () => void;
}

export function TiktokOverlay({
  videoId,
  liked,
  likeCount,
  saved,
  following,
  creatorName,
  creatorAvatar,
  creatorVerified,
  caption,
  hashtags,
  onLike,
  onSave,
  onShare,
  onFollow,
  onOpenComments,
}: TiktokOverlayProps) {
  const [commentCount, setCommentCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/social/comments?videoId=${videoId}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { comments: unknown[] };
        if (!cancelled && Array.isArray(data.comments)) {
          setCommentCount(data.comments.length);
        }
      } catch {
        // keep count hidden
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  const railBtn =
    "flex flex-col items-center gap-1.5 text-white transition-colors";

  return (
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

      {/* Action rail (right) */}
      <div className="pointer-events-auto absolute bottom-44 right-2.5 z-10 flex flex-col items-center gap-4 sm:bottom-48 sm:right-4">
        {/* Follow */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            onClick={onFollow}
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-sm font-black text-white ring-2 transition-transform hover:scale-105",
              creatorAvatar
            )}
          >
            {creatorName[0]?.toUpperCase()}
            <span
              className={cn(
                "absolute -bottom-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-black",
                following
                  ? "bg-white text-black"
                  : "bg-crimson text-white"
              )}
            >
              {following ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : (
                <Plus className="h-3 w-3" strokeWidth={3} />
              )}
            </span>
          </button>
          <span className="mt-1 text-[9px] font-bold text-white">
            {following ? "Following" : "Follow"}
          </span>
        </div>

        {/* Like */}
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

        {/* Comments */}
        <button onClick={onOpenComments} className={railBtn}>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-transform hover:scale-110">
            <MessageCircle className="h-5.5 w-5.5" />
          </span>
          <span className="text-[11px] font-semibold tabular-nums drop-shadow">
            {commentCount == null ? "..." : formatNumber(commentCount)}
          </span>
        </button>

        {/* Save */}
        <button onClick={onSave} className={railBtn}>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-transform hover:scale-110">
            <Bookmark
              className={cn(
                "h-5.5 w-5.5",
                saved && "fill-amber-300 text-amber-300"
              )}
            />
          </span>
          <span className="text-[11px] font-semibold drop-shadow">
            {saved ? "Saved" : "Save"}
          </span>
        </button>

        {/* Share */}
        <button onClick={onShare} className={railBtn}>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-transform hover:scale-110">
            <Share2 className="h-5.5 w-5.5" />
          </span>
          <span className="text-[11px] font-semibold drop-shadow">Share</span>
        </button>
      </div>
    </div>
  );
}