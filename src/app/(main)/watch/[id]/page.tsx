"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  Share2,
  Bookmark,
  Flag,
  Eye,
  Bell,
  BellRing,
  Clapperboard,
  Calendar,
  Lock,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { VideoPlayer } from "@/components/video-player";
import { EpisodeLockOverlay } from "@/components/episode-lock-overlay";
import { EpisodeCard } from "@/components/episode-card";
import { CommentSection } from "@/components/comment-section";
import { SectionHeading } from "@/components/section-heading";
import { HorizontalScroller } from "@/components/horizontal-scroller";
import { VideoCard } from "@/components/video-card";
import { VerifiedBadge, AIBadge, PremiumBadge } from "@/components/ui/badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CinemaImage } from "@/components/ui/cinema-image";
import { getVideo, videos } from "@/lib/data/videos";
import {
  getSeries,
  getEpisode,
  getEpisodesForSeries,
  getNextEpisode,
  getSeasonsForSeries,
  episodes,
} from "@/lib/data/series";
import { getCreator, currentUser } from "@/lib/data/creators";
import { getCountry } from "@/lib/data/countries";
import { useUnlocksStore, useSocialStore, useToastStore } from "@/lib/store";
import { cn, formatDuration, formatNumber, formatPoints, timeAgo } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { mapDbVideo, type DbVideoRow } from "@/lib/supabase/videos";
import type { Video } from "@/types";

function resolveVideo(id: string): Video | undefined {
  const existing = getVideo(id);
  if (existing) return existing;

  const ep = episodes.find((e) => e.videoId === id);
  if (!ep) return undefined;

  const s = getSeries(ep.seriesId);
  return {
    id: ep.videoId,
    slug: ep.id,
    title: s ? `${s.title} — ${ep.title}` : ep.title,
    description: ep.description,
    thumbnail: ep.thumbnail,
    thumbnailGradient: ep.thumbnailGradient,
    duration: ep.duration,
    type: "series",
    origin: "human",
    status: "published",
    monetization: ep.monetization,
    unlockPrice: ep.unlockPrice,
    ageRating: s?.ageRating ?? "16+",
    genre: s?.genre ?? [],
    language: s?.language ?? "English",
    country: s?.country ?? "NG",
    tags: [],
    views: ep.views,
    likes: ep.likes,
    shares: 0,
    createdAt: ep.publishedAt,
    publishedAt: ep.publishedAt,
    creatorId: s?.creatorId ?? currentUser.id,
    seriesId: s?.id,
    episodeId: ep.id,
  };
}

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const mockVideo = useMemo(() => resolveVideo(id), [id]);

  const [dbVideo, setDbVideo] = useState<Video | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbCreatorName, setDbCreatorName] = useState<string | null>(null);
  const showToast = useToastStore((s) => s.showToast);

  // Real DB videos (creator uploads via Bunny) aren't in the mock catalog —
  // fall back to Supabase and render the HLS stream. While a video is
  // "processing" we keep polling until it goes live, so the page never shows
  // "Still encoding…" forever.
  useEffect(() => {
    if (mockVideo) return;
    let cancelled = false;
    const supabase = createClient();
    const load = async (): Promise<"processing" | "locked-in"> => {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (cancelled || !data) return "locked-in";
      const mapped = mapDbVideo(data as unknown as DbVideoRow);
      setDbVideo(mapped);
      const creatorId = (data as unknown as DbVideoRow).creator_id;
      if (creatorId) {
        const { data: creator } = await supabase
          .from("creator_profiles")
          .select("display_name")
          .eq("id", creatorId)
          .maybeSingle();
        if (creator) {
          setDbCreatorName((creator as { display_name: string | null }).display_name);
        }
      }
      return mapped.status === "processing" ? "processing" : "locked-in";
    };

    void (async () => {
      const state = await load();
      if (cancelled) return;
      setDbLoading(false);
      if (state !== "processing") return;

      const poll = setInterval(async () => {
        const next = await load();
        if (cancelled) {
          clearInterval(poll);
          return;
        }
        if (next === "locked-in") {
          clearInterval(poll);
          showToast(
            "Your video is now live!",
            "Encoding finished and it's ready to watch."
          );
        }
      }, 8000);

      return () => {
        cancelled = true;
        clearInterval(poll);
      };
    })();

    return () => {
      cancelled = true;
    };
  }, [id, mockVideo, showToast]);

  const video: Video | null | undefined = mockVideo ?? dbVideo;
  const isDb = !mockVideo && !!dbVideo;
  const isProcessing = video?.status === "processing";

  const episode = video?.episodeId ? getEpisode(video.episodeId) : undefined;
  const series = video?.seriesId ? getSeries(video.seriesId) : undefined;

  // Tracks the selected season, resetting automatically whenever the video
  // changes (navigating between episodes). Derived from the current video id
  // so no effect is needed to keep it in sync.
  const [seasonSelection, setSeasonSelection] = useState<{
    videoId: string;
    season: number;
  }>({ videoId: video?.id ?? "", season: episode?.seasonNumber ?? 1 });
  const selectedSeason =
    seasonSelection.videoId === video?.id
      ? seasonSelection.season
      : (episode?.seasonNumber ?? 1);

  const handleSelectSeason = (seasonNumber: number) => {
    setSeasonSelection({ videoId: video?.id ?? "", season: seasonNumber });
  };

  const { isUnlocked } = useUnlocksStore();
  const { isSaved, toggleSave } = useSocialStore();

  const [liked, setLiked] = useState(false);
  const [followingCreator, setFollowingCreator] = useState(false);
  const [flags, setFlags] = useState({ viewsTracking: true, likes: true, comments: true, follows: true });
  const viewTrackedRef = useRef(new Set<string>());

  useEffect(() => {
    if (!video) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/social/status?videoId=${video.id}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { liked?: boolean; followingCreator?: boolean };
        if (cancelled) return;
        if (typeof data.liked === "boolean") setLiked(data.liked);
        if (typeof data.followingCreator === "boolean") setFollowingCreator(data.followingCreator);
      } catch {
        // not signed in or network error — leave defaults
      }
    })();
    return () => { cancelled = true; };
  }, [video]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/social/flags");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { viewsTracking?: boolean; likes?: boolean; comments?: boolean; follows?: boolean };
        if (cancelled) return;
        setFlags({
          viewsTracking: data.viewsTracking ?? true,
          likes: data.likes ?? true,
          comments: data.comments ?? true,
          follows: data.follows ?? true,
        });
      } catch {
        // leave defaults
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const trackView = (vid: string) => {
    if (!flags.viewsTracking) return;
    if (viewTrackedRef.current.has(vid)) return;
    viewTrackedRef.current.add(vid);
    void fetch("/api/social/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: vid }),
    });
  };

  if (dbLoading && !mockVideo) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="mt-4 font-display text-lg text-cream">Loading story…</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-2xl text-cream">Video not found</p>
        <Link href="/explore" className="mt-4 text-sm text-gold hover:underline">
          Discover other stories
        </Link>
      </div>
    );
  }

  const mockCreator = getCreator(video.creatorId);
  const creator: {
    id: string;
    displayName: string;
    city: string;
    verified: boolean;
    followers: number;
    avatarGradient: string;
  } | undefined = mockCreator
    ? {
        id: mockCreator.id,
        displayName: mockCreator.displayName,
        city: mockCreator.city,
        verified: mockCreator.verified,
        followers: mockCreator.followers,
        avatarGradient: mockCreator.avatarGradient ?? "from-purple-700 to-gold",
      }
    : dbCreatorName
    ? {
        id: video.creatorId,
        displayName: dbCreatorName,
        city: "",
        verified: false,
        followers: 0,
        avatarGradient: "from-purple-700 to-gold",
      }
    : undefined;
  const country = getCountry(video.country);

  const unlocked =
    video.monetization === "free" ||
    (episode ? isUnlocked(episode.id) : isUnlocked(video.id));
  const lockActive = video.monetization === "premium" && !unlocked;
  const saved = isSaved(video.id);
  const effectiveLikes = (video?.likes ?? 0) + (liked ? 1 : 0);

  const allSeasons = series ? getSeasonsForSeries(series.id) : [];
  const seriesEpisodes = series ? getEpisodesForSeries(series.id, selectedSeason) : [];
  const freeCount = seriesEpisodes.filter((e) => e.monetization === "free").length;
  const lockedCount = seriesEpisodes.length - freeCount;
  const nextEpisode = series && episode
    ? getNextEpisode(series.id, episode.seasonNumber, episode.episodeNumber)
    : undefined;

  const handleSelectEpisode = (episodeId: string, nextVideoId: string) => {
    router.push(`/watch/${nextVideoId}`);
  };

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    showToast(
      wasLiked ? "Removed like" : "You liked this story",
      wasLiked ? undefined : "Support the storyteller!"
    );
    try {
      const res = await fetch("/api/social/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id }),
      });
      if (!res.ok) setLiked(wasLiked);
    } catch {
      setLiked(wasLiked);
    }
  };

  const handleSave = () => {
    toggleSave(video.id);
    showToast(saved ? "Removed from saved" : "Saved for later", saved ? undefined : "It's in your watchlist.");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard", "Share the story with your friends.");
    } catch {
      showToast("Share this story", window.location.href);
    }
  };

  const handleFollow = async () => {
    if (!creator) return;
    const wasFollowing = followingCreator;
    setFollowingCreator(!wasFollowing);
    showToast(
      wasFollowing ? "Unfollowed creator" : `Following ${creator.displayName}`,
      wasFollowing ? undefined : "You'll see new stories in your feed."
    );
    try {
      const res = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followeeId: creator.id, followeeType: "creator" }),
      });
      if (!res.ok) {
        setFollowingCreator(wasFollowing);
      }
    } catch {
      setFollowingCreator(wasFollowing);
    }
  };

  const handleReport = () => {
    showToast("Report submitted", "Our moderation team will review it. Thank you.");
  };

  const related = videos.filter((v) => v.id !== video.id).slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* LEFT COLUMN: player + info + comments */}
        <div className="min-w-0 lg:col-start-1">
          {/* Series breadcrumb */}
          {series && (
            <Link
              href={`/series/${series.id}`}
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-purple transition-colors hover:text-gold"
            >
              <Clapperboard className="h-4 w-4" />
              {series.title}
              {episode && (
                <span className="text-muted-foreground">
                  · S{episode.seasonNumber} E{episode.episodeNumber}
                </span>
              )}
            </Link>
          )}

          {/* PLAYER */}
          <div className="relative">
            {isProcessing ? (
              <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
                <div className="absolute inset-0">
                  <VideoPlayerBackdrop thumbnail={video.thumbnail} title={video.title} />
                </div>
                <Loader2 className="relative h-10 w-10 animate-spin text-gold" />
                <p className="relative font-display text-lg font-bold text-cream">
                  Still encoding…
                </p>
                <p className="relative max-w-sm px-6 text-center text-xs text-muted-foreground">
                  This story is being processed on our streaming servers and
                  will go live shortly. No action needed.
                </p>
              </div>
            ) : (
              <VideoPlayer
                videoId={video.id}
                hlsUrl={isDb ? dbVideo?.hlsUrl : undefined}
                title={`${series ? series.title + " — " : ""}${video.title}`}
                thumbnail={video.thumbnail}
                gradient={video.thumbnailGradient}
                duration={video.duration}
                episode={episode}
                series={series}
                overlay={
                  creator
                    ? {
                        videoId: video.id,
                        liked,
                        likeCount: effectiveLikes,
                        saved,
                        following: followingCreator,
                        creatorName: creator.displayName,
                        creatorAvatar: creator.avatarGradient,
                        creatorVerified: creator.verified,
                        caption:
                          video.description.length > 220
                            ? `${video.description.slice(0, 220)}…`
                            : video.description,
                        hashtags: video.tags.slice(0, 4),
                        onLike: () => void handleLike(),
                        onSave: handleSave,
                        onShare: () => void handleShare(),
                        onFollow: () => void handleFollow(),
                        onOpenComments: () => {
                          document
                            .getElementById("watch-comments")
                            ?.scrollIntoView({ behavior: "smooth" });
                        },
                      }
                    : null
                }
                onSelectEpisode={handleSelectEpisode}
                onFirstPlay={!lockActive ? trackView : undefined}
              />
            )}
            {lockActive && (
              <EpisodeLockOverlay
                episodeId={episode?.id ?? video.id}
                videoId={video.id}
                unlockPrice={episode?.unlockPrice ?? video.unlockPrice ?? 50}
                episodeTitle={episode?.title ?? video.title}
                seriesTitle={series?.title}
                seriesId={series?.id}
                seriesCompleted={series?.completed}
              />
            )}
          </div>

          {/* TITLE + ACTIONS */}
          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-display text-xl font-bold text-cream sm:text-2xl">
                  {video.title}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {formatNumber(video.views)} views
                  </span>
                  <span>{formatDuration(video.duration)}</span>
                  <span>{timeAgo(video.publishedAt ?? video.createdAt)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {flags.likes && (
                <button
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all",
                    liked
                      ? "border-gold/60 bg-gold/15 text-gold"
                      : "border-white/[0.12] text-muted-foreground hover:border-gold/40 hover:text-gold"
                  )}
                >
                  <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
                  {formatNumber(effectiveLikes)}
                </button>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 rounded-full border border-white/[0.12] px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:border-gold/40 hover:text-gold"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  onClick={handleSave}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all",
                    saved
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border-white/[0.12] text-muted-foreground hover:border-gold/40 hover:text-gold"
                  )}
                >
                  <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  onClick={handleReport}
                  className="flex items-center gap-1.5 rounded-full border border-white/[0.12] px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:border-crimson/50 hover:text-crimson"
                >
                  <Flag className="h-4 w-4" />
                  <span className="hidden sm:inline">Report</span>
                </button>
              </div>
            </div>

            {/* DESCRIPTION CARD */}
            <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              {creator && (
                <div className="flex items-center justify-between gap-4">
                  <Link href={`/creator/${creator.id}`} className="group flex min-w-0 items-center gap-3">
                    <Avatar className="h-11 w-11 border-2 border-gold/30">
                      <AvatarFallback className={cn("font-display text-lg text-white", creator.avatarGradient)}>
                        {creator.displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-display text-sm font-bold text-cream transition-colors group-hover:text-gold">
                          {creator.displayName}
                        </p>
                        {creator.verified && <VerifiedBadge size={14} />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {creator.city}, {country?.name} · {formatNumber(creator.followers)} followers
                      </p>
                    </div>
                  </Link>
                  {flags.follows && (
                  <button
                    onClick={handleFollow}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all",
                      followingCreator
                        ? "bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1]"
                        : "bg-gold text-black hover:bg-gold-dim"
                    )}
                  >
                    {followingCreator ? (
                      <>
                        <BellRing className="h-3.5 w-3.5" />
                        Following
                      </>
                    ) : (
                      <>
                        <Bell className="h-3.5 w-3.5" />
                        Follow
                      </>
                    )}
                  </button>
                  )}
                </div>
              )}

              <p className="mt-4 text-sm leading-relaxed text-foreground/85">
                {video.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {video.origin && video.origin !== "human" && <AIBadge origin={video.origin} />}
                {video.monetization === "premium" && (
                  <PremiumBadge points={video.unlockPrice} />
                )}
                {video.tags.slice(0, 5).map((t) => (
                  <Link
                    key={t}
                    href={`/explore?genre=${encodeURIComponent(t)}`}
                    className="rounded-full border border-white/[0.08] px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
                  >
                    #{t}
                  </Link>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.06] pt-4 text-xs text-muted-foreground">
                {country && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-base">{country.flag}</span>
                    {country.name} · {video.language}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Released {timeAgo(video.publishedAt ?? video.createdAt)}
                </span>
                <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
                  {video.ageRating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: episodes rail */}
        {series && seriesEpisodes.length > 0 && (
          <aside className="w-full min-w-0 space-y-4 self-start lg:sticky lg:top-24 lg:col-start-2">
            {/* UP NEXT */}
            {nextEpisode && (
              <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.08] via-gold/[0.03] to-transparent p-3.5">
                <div className="mb-2.5 flex items-center justify-between px-1">
                  <h3 className="flex items-center gap-2 font-display text-sm font-bold text-cream">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
                    </span>
                    Up Next
                  </h3>
                  {nextEpisode.monetization === "premium" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[9.5px] font-bold text-gold">
                      <Lock className="h-2.5 w-2.5" />
                      {formatPoints(nextEpisode.unlockPrice ?? 0)} pts
                    </span>
                  )}
                </div>
                <EpisodeCard
                  episode={nextEpisode}
                  seriesId={series.id}
                  isNext
                  isCurrent={nextEpisode.id === episode?.id}
                />
              </div>
            )}
            {!nextEpisode && (
              <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.08] via-gold/[0.03] to-transparent p-4">
                <p className="flex items-center gap-2 font-display text-sm font-bold text-cream">
                  <PlayCircle className="h-4 w-4 text-gold" />
                  Series Complete
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  You&apos;ve watched every episode so far. Check back for the next season!
                </p>
              </div>
            )}

            {/* EPISODES PANEL */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] p-4 pb-3">
                <h3 className="font-display text-base font-bold tracking-tight text-cream">
                  Episodes
                </h3>
                {allSeasons.length > 1 ? (
                  <div className="flex items-center gap-1">
                    {allSeasons.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSelectSeason(s.seasonNumber)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                          selectedSeason === s.seasonNumber
                            ? "border-gold/50 bg-gold/15 text-gold"
                            : "border-white/[0.1] text-muted-foreground hover:border-gold/30 hover:text-gold"
                        )}
                      >
                        S{s.seasonNumber}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    Season {selectedSeason}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-300">
                  {freeCount} free
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 font-semibold text-gold">
                  <Lock className="h-2.5 w-2.5" />
                  {lockedCount} locked
                </span>
                <span className="ml-auto text-muted-foreground">
                  {seriesEpisodes.length} episodes
                </span>
              </div>

              <div className="max-h-[520px] space-y-1 overflow-y-auto p-2 no-scrollbar">
                {seriesEpisodes.map((ep) => (
                  <EpisodeCard
                    key={ep.id}
                    episode={ep}
                    seriesId={series.id}
                    isCurrent={ep.id === episode?.id}
                    isNext={nextEpisode?.id === ep.id}
                  />
                ))}
                {seriesEpisodes.length === 0 && (
                  <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                    No episodes in this season yet.
                  </p>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* COMMENTS */}
      {flags.comments && (
      <div id="watch-comments" className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 lg:col-start-1">
          <CommentSection videoId={video.id} />
        </div>
      </div>
      )}

      {/* RELATED */}
      <div className="mt-12">
        <SectionHeading title="You Might Also Like" href="/explore" />
        <HorizontalScroller>
          {related.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </HorizontalScroller>
      </div>
    </div>
  );
}

function VideoPlayerBackdrop({ thumbnail, title }: { thumbnail: string; title: string }) {
  return (
    <CinemaImage
      src={thumbnail}
      alt={title}
      fill
      sizes="100vw"
      className="opacity-30 blur-sm"
      gradient="from-black/60 via-black/60 to-black/80"
    />
  );
}