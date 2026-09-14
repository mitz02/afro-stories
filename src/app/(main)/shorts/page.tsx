"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  UserPlus,
  Volume2,
  VolumeX,
  Home,
} from "lucide-react";
import { CinemaImage } from "@/components/ui/cinema-image";
import { VerifiedBadge, AIBadge, PremiumBadge } from "@/components/ui/badges";
import { EpisodeLockOverlay } from "@/components/episode-lock-overlay";
import { shorts } from "@/lib/data/shorts";
import { getCreator } from "@/lib/data/creators";
import { getCountry } from "@/lib/data/countries";
import { useSocialStore, useToastStore } from "@/lib/store";
import { cn, formatNumber } from "@/lib/utils";

export default function ShortsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const touchStartY = useRef<number | null>(null);

  const { likedVideoIds, toggleLike, isLiked, isSaved, toggleSave, isFollowingCreator, toggleFollowCreator } =
    useSocialStore();
  const showToast = useToastStore((s) => s.showToast);

  const scrollTo = useCallback((index: number) => {
    const el = containerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(shorts.length - 1, index));
    el.scrollTo({ top: clamped * el.clientHeight, behavior: "smooth" });
    setActiveIndex(clamped);
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 40) scrollTo(activeIndex + 1);
      else if (e.deltaY < -40) scrollTo(activeIndex - 1);
    },
    [activeIndex, scrollTo]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 60) {
      if (delta > 0) scrollTo(activeIndex + 1);
      else scrollTo(activeIndex - 1);
    }
    touchStartY.current = null;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  if (shorts.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <Home className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-muted-foreground">No shorts available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-black pt-16 md:pt-0">
      {/* Container */}
      <div
        ref={containerRef}
        className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {shorts.map((short, index) => {
          const creator = getCreator(short.video.creatorId);
          const country = getCountry(short.video.country);
          const liked = isLiked(short.video.id, false);
          const saved = isSaved(short.video.id);
          const isFollowing = creator ? isFollowingCreator(creator.id) : false;
          const shortUnlocked = short.video.monetization === "free" || index < 2;
          const lockActive = short.video.monetization === "premium" && !shortUnlocked;

          return (
            <section
              key={short.id}
              className={cn(
                "relative flex h-full w-full snap-start snap-always items-center justify-center overflow-hidden",
                index === activeIndex ? "pointer-events-auto" : "pointer-events-none"
              )}
            >
              {/* Video background */}
              <CinemaImage
                src={short.thumbnail}
                alt={short.title}
                fill
                sizes="100vw"
                className={cn(index === activeIndex && !muted && "scale-110")}
                gradient="from-black/30 via-black/20 to-black/70"
              />

              {/* Top gradient */}
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
                <Link href="/home" className="rounded-full bg-white/10 p-2.5 backdrop-blur-md transition-colors hover:bg-white/20">
                  <Home className="h-5 w-5 text-white" />
                </Link>
                <span className="rounded-full bg-black/40 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cream backdrop-blur-md">
                  Shorts
                </span>
                <button
                  onClick={() => setMuted(!muted)}
                  className="rounded-full bg-black/30 p-2.5 backdrop-blur-md transition-colors hover:bg-black/60"
                  aria-label="Toggle sound"
                >
                  {muted ? (
                    <VolumeX className="h-5 w-5 text-white" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-white" />
                  )}
                </button>
              </div>

              {/* Premium lock */}
              {lockActive && (
                <EpisodeLockOverlay
                  episodeId={`short_${short.id}`}
                  videoId={short.video.id}
                  unlockPrice={short.video.unlockPrice ?? 20}
                  episodeTitle={short.title}
                  seriesTitle="Premium Short"
                />
              )}

              {/* Right rail */}
              <div className="absolute bottom-0 right-3 z-20 flex flex-col items-center gap-4 pb-24 sm:pb-10">
                <button
                  onClick={() => {
                    toggleLike(short.video.id, false);
                    showToast(
                      liked ? "Removed like" : "Liked this short",
                      liked ? undefined : "Show the creator some love!"
                    );
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-all",
                      liked
                        ? "bg-gold/90 text-black"
                        : "bg-black/40 text-white hover:bg-black/60"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", liked && "fill-current")} />
                  </span>
                  <span className="text-[11px] font-semibold text-white">
                    {formatNumber(short.video.likes)}
                  </span>
                </button>

                <button className="flex flex-col items-center gap-1">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-semibold text-white">
                    {formatNumber(short.comments)}
                  </span>
                </button>

                <button
                  onClick={() => showToast("Link copied to clipboard", "Share this short with your friends.")}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60">
                    <Share2 className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-semibold text-white">
                    Share
                  </span>
                </button>

                <button
                  onClick={() => {
                    toggleSave(short.video.id);
                    showToast(saved ? "Removed from saved" : "Saved for later");
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-all",
                      saved
                        ? "bg-emerald-500/90 text-white"
                        : "bg-black/40 text-white hover:bg-black/60"
                    )}
                  >
                    <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
                  </span>
                  <span className="text-[11px] font-semibold text-white">
                    {saved ? "Saved" : "Save"}
                  </span>
                </button>
              </div>

              {/* Bottom info */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-4 pb-20 sm:pb-10">
                {creator && (
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/creator/${creator.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-full pr-4 pl-1.5 py-1.5 backdrop-blur-md transition-colors",
                        isFollowing ? "bg-black/40" : "bg-black/30 hover:bg-black/50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
                          creator.avatarGradient
                        )}
                      >
                        {creator.displayName[0]}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {creator.displayName}
                      </span>
                      {creator.verified && <VerifiedBadge size={13} />}
                    </Link>
                    {creator && (
                      <button
                        onClick={() => {
                          toggleFollowCreator(creator.id);
                          showToast(
                            isFollowing ? "Unfollowed" : `Following ${creator.displayName.split(" ")[0]}`,
                            isFollowing ? undefined : "You'll see more from this creator."
                          );
                        }}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all",
                          isFollowing
                            ? "bg-black/50 text-white"
                            : "bg-gold text-black"
                        )}
                        aria-label={isFollowing ? "Unfollow" : "Follow"}
                      >
                        {isFollowing ? (
                          <UserPlus className="h-4 w-4" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                )}

                {short.video.origin !== "human" && (
                  <div className="mt-2.5">
                    <AIBadge origin={short.video.origin} size="sm" />
                  </div>
                )}

                <h2 className="mt-2.5 max-w-[80%] font-display text-lg font-bold text-white">
                  {short.title}
                </h2>
                <p className="mt-1 max-w-[85%] text-xs leading-relaxed text-white/70">
                  {short.description}
                </p>

                {country && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-white/50">
                    <span>{country.flag}</span>
                    {country.name} · {short.video.genre[0]}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}