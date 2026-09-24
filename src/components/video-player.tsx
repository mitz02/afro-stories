"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  SkipForward,
  SkipBack,
  Clapperboard,
  X,
  Loader2,
  Heart,
} from "lucide-react";
import { CinemaImage } from "@/components/ui/cinema-image";
import { TiktokOverlay } from "@/components/tiktok-overlay";
import { getEpisodesForSeries } from "@/lib/data/series";
import { cn, formatDuration } from "@/lib/utils";
import { useWatchProgressStore } from "@/lib/store";
import { useToastStore } from "@/lib/store";
import type { Episode, Series } from "@/types";

export interface TiktokOverlayData {
  videoId: string;
  creatorId: string;
  liked: boolean;
  likeCount: number;
  saved: boolean;
  following: boolean;
  creatorName: string;
  creatorAvatar: string;
  creatorVerified: boolean;
  caption: string;
  hashtags: string[];
  series: Series | null | undefined;
  currentEpisodeId: string | undefined;
  currentSeasonNumber: number | undefined;
  onLike: () => void;
  onFollow: () => void;
  onOpenComments: () => void;
  onOpenEpisodes: (series: any, currentEpisodeId: string | undefined, currentSeasonNumber: number | undefined) => void;
  onSelectEpisode: (episodeId: string, videoId: string) => void;
  onSupport: () => void;
}

interface VideoPlayerProps {
  videoId: string;
  title: string;
  thumbnail: string;
  gradient?: string;
  duration: number;
  hlsUrl?: string;
  episode?: Episode;
  series?: Series;
  overlay?: TiktokOverlayData | null;
  onSelectEpisode: (episodeId: string, videoId: string) => void;
  onFirstPlay?: ((videoId: string) => void) | undefined;
}

interface HeartBurst {
  id: number;
  left: number;
}

let heartBurstId = 0;

export function VideoPlayer({
  videoId,
  title,
  thumbnail,
  gradient,
  duration,
  hlsUrl,
  episode,
  series,
  overlay,
  onSelectEpisode,
  onFirstPlay,
}: VideoPlayerProps) {
  const showToast = useToastStore((s) => s.showToast);
  const mode = hlsUrl ? "hls" : "sim";
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [elapsed, setElapsed] = useState(0); // centi-seconds for sim, driven by currentTime for hls
  const [buffering, setBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [episodesOpen, setEpisodesOpen] = useState(false);
  const [quality, setQuality] = useState("Auto");
  const [speed, setSpeed] = useState(1);
  const [captions, setCaptions] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const playingRef = useRef(false);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const firedPlayRef = useRef(false);
  const heartTapRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [heartBursts, setHeartBursts] = useState<HeartBurst[]>([]);
  const { setProgress, getProgress } = useWatchProgressStore();
  const startProgress = getProgress(videoId);

  // Double-tap anywhere on the video (fullscreen) = like, TikTok style.
  const handleContainerDoubleTap = () => {
    if (!overlay || heartTapRef.current) return;
    heartTapRef.current = setTimeout(() => {
      heartTapRef.current = null;
    }, 400);
    if (!overlay.liked) overlay.onLike();
    const id = ++heartBurstId;
    setHeartBursts((prev) => [
      ...prev.slice(-3),
      { id, left: 20 + Math.random() * 60 },
    ]);
    setTimeout(() => {
      setHeartBursts((prev) => prev.filter((b) => b.id !== id));
    }, 900);
  };

  const notifyFirstPlay = () => {
    if (firedPlayRef.current) return;
    firedPlayRef.current = true;
    onFirstPlay?.(videoId);
  };

  // Reset the one-shot "view counted" flag when navigating between episodes.
  useEffect(() => {
    firedPlayRef.current = false;
  }, [videoId]);

  // Load the HLS manifest for real Bunny videos.
  useEffect(() => {
    if (!hlsUrl) return;
    const el = videoRef.current;
    if (!el) return;

    setBuffering(true);
    let destroyed = false;

    if (el.canPlayType("application/vnd.apple.mpegurl")) {
      el.src = hlsUrl;
    } else {
      void import("hls.js").then(({ default: Hls }) => {
        if (destroyed) return;
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
          hlsRef.current = hls;
          hls.loadSource(hlsUrl);
          hls.attachMedia(el);
        } else if (el.canPlayType("video/mp4")) {
          el.src = hlsUrl;
        }
      });
    }

    return () => {
      destroyed = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      el.removeAttribute("src");
      el.load();
    };
  }, [hlsUrl]);

  // Simulated playback "engine" (mock catalog videos only).
  useEffect(() => {
    if (mode !== "sim") return;
    if (playing && elapsed < duration * 100) {
      const timer = setInterval(() => {
        setElapsed((prev) => {
          const next = Math.min(prev + 1, duration * 100);
          if (next >= duration * 100) {
            setPlaying(false);
            setProgress(videoId, 100);
            return duration * 100;
          }
          setProgress(videoId, next);
          return next;
        });
      }, 25);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, duration]);

  const togglePlay = () => {
    if (mode === "hls") {
      const el = videoRef.current;
      if (!el) return;
      if (el.paused) void el.play();
      else el.pause();
    } else {
      const next = !playingRef.current;
      playingRef.current = next;
      setPlaying(next);
      if (next) notifyFirstPlay();
    }
    resetControlsTimer();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (mode === "hls") {
      const el = videoRef.current;
      if (el) el.currentTime = val / 100;
    }
    setElapsed(val);
    setProgress(videoId, val);
  };

  const skip = (seconds: number) => {
    if (mode === "hls") {
      const el = videoRef.current;
      if (!el) return;
      el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + seconds));
      setElapsed(Math.round(el.currentTime * 100));
    } else {
      setElapsed((p) => Math.max(0, Math.min(duration * 100, p + seconds * 100)));
    }
    resetControlsTimer();
  };

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playingRef.current) setShowControls(false);
    }, 2600);
  };

  useEffect(() => {
    const onFsChange = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      void document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    const el = videoRef.current;
    if (el) el.muted = nextMuted;
    setVolume(nextMuted ? 0 : volume || 0.7);
  };

  useEffect(() => {
    if (mode !== "hls") return;
    const el = videoRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
  }, [volume, muted, mode]);

  useEffect(() => {
    const el = videoRef.current;
    if (el && speed >= 0.5) el.playbackRate = speed;
  }, [speed, mode]);

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  const maxElapsed = Math.max(1, Math.round(duration * 100), elapsed);
  const simElapsed = formatDuration(elapsed / 100);
  const simTotal = formatDuration(Math.max(duration, elapsed / 100));
  const pct = elapsed > 0 ? (elapsed / maxElapsed) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="group/player relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onDoubleClick={overlay && fullscreen ? handleContainerDoubleTap : undefined}
    >
      {/* Backdrop / poster (hls video element renders above it once playing) */}
      <CinemaImage
        src={thumbnail}
        alt={title}
        fill
        sizes="100vw"
        className={cn(
          "transition-transform duration-[8000ms] ease-linear",
          playing && mode === "sim" && "scale-105"
        )}
        gradient="from-black/20 via-black/30 to-black/60"
      />

      {/* Real video element for Bunny/HLS content */}
      {mode === "hls" && (
        <video
          ref={videoRef}
          poster={thumbnail}
          playsInline
          className="absolute inset-0 h-full w-full object-contain"
          onPlaying={() => {
            setBuffering(false);
            setPlaying(true);
            playingRef.current = true;
          }}
          onWaiting={() => setBuffering(true)}
          onPlay={() => {
            setPlaying(true);
            playingRef.current = true;
            notifyFirstPlay();
          }}
          onPause={() => {
            setPlaying(false);
            playingRef.current = false;
          }}
          onEnded={() => {
            setPlaying(false);
            playingRef.current = false;
            setProgress(videoId, 100);
          }}
          onTimeUpdate={(e) => {
            setElapsed(Math.round(e.currentTarget.currentTime * 100));
          }}
          onLoadedMetadata={(e) => {
            if (duration === 0) {
              const secs = e.currentTarget.duration;
              setElapsed(0);
              void secs;
            }
          }}
          onError={(e) => {
            console.error("Video playback error:", e);
            setBuffering(false);
            setPlaying(false);
            showToast?.("Playback error", "Failed to load video stream. Please try again.");
          }}
        />
      )}

      {/* Buffering spinner */}
      {buffering && playing && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
        </div>
      )}

      {/* TikTok-style engagement overlay (fullscreen only) */}
      {overlay && fullscreen && (
        <TiktokOverlay
          videoId={overlay.videoId}
          creatorId={overlay.creatorId}
          liked={overlay.liked}
          likeCount={overlay.likeCount}
          following={overlay.following}
          creatorName={overlay.creatorName}
          creatorAvatar={overlay.creatorAvatar}
          creatorVerified={overlay.creatorVerified}
          caption={overlay.caption}
          hashtags={overlay.hashtags}
          series={series}
          currentEpisodeId={episode?.id ?? undefined}
          currentSeasonNumber={episode?.seasonNumber ?? undefined}
          onLike={overlay.onLike}
          onFollow={overlay.onFollow}
          onOpenComments={overlay.onOpenComments}
          onOpenEpisodes={overlay.onOpenEpisodes}
          onSelectEpisode={onSelectEpisode}
        />
      )}

      {/* Heart bursts from double-tap (fullscreen) */}
      {fullscreen &&
        heartBursts.map((b) => (
          <span
            key={b.id}
            style={{ left: `${b.left}%` }}
            className="tiktok-heart-burst pointer-events-none absolute bottom-[38%] z-[16] text-crimson"
          >
            <Heart className="h-16 w-16 fill-current" />
          </span>
        ))}

      {/* Fake timecode / scanline to sell the cinematic feel (sim only) */}
      {playing && mode === "sim" && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-px animate-pulse bg-white/10" />
          <div className="absolute inset-x-0 bottom-16 h-px animate-pulse bg-white/10" />
        </div>
      )}

      {/* Center big play button (when paused/idle) */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 backdrop-blur-[1px] transition-opacity"
          aria-label="Play"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/95 text-black shadow-2xl shadow-gold/40 transition-transform hover:scale-110">
            <Play className="ml-1 h-9 w-9 fill-current" />
          </span>
        </button>
      )}

      {/* TOP BAR — episode selector & title */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={series ? `/series/${series.id}` : "#"}
            className="shrink-0 rounded-lg border border-white/15 bg-black/40 p-1.5 text-gold transition-colors hover:border-gold/50"
          >
            <Clapperboard className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            {episode && (
              <p className="truncate text-[11px] text-white/60">
                S{episode.seasonNumber} · E{episode.episodeNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CENTER CONTROLS */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-16 transition-opacity",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Seek bar */}
        <div className="mb-2 flex items-center gap-3">
          <span className="w-12 text-right text-[11px] font-medium tabular-nums text-white/80">
            {simElapsed}
          </span>
          <input
            type="range"
            min={0}
            max={maxElapsed}
            value={Math.min(elapsed, maxElapsed)}
            onChange={handleSeek}
            className="player-seek min-w-0 flex-1 cursor-pointer"
            style={{ ["--seek-fill" as string]: `${pct}%` }}
            aria-label="Seek"
          />
          <span className="w-12 text-[11px] font-medium tabular-nums text-white/60">
            {simTotal}
          </span>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className="p-1.5 text-white transition-colors hover:text-gold">
            {playing ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </button>
          <button
            onClick={() => skip(-15)}
            aria-label="Back 15s"
            className="p-1.5 text-white transition-colors hover:text-gold"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={() => skip(15)}
            aria-label="Forward 15s"
            className="p-1.5 text-white transition-colors hover:text-gold"
          >
            <SkipForward className="h-5 w-5" />
          </button>

          <button
            onClick={toggleMute}
            aria-label="Mute"
            className="p-1.5 text-white transition-colors hover:text-gold"
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume * 100}
            onChange={(e) => {
              setVolume(Number(e.target.value) / 100);
              setMuted(false);
            }}
            className="player-seek hidden w-20 cursor-pointer sm:block"
            style={{ ["--seek-fill" as string]: `${muted ? 0 : volume * 100}%` }}
            aria-label="Volume"
          />
          <span className="hidden text-[11px] text-white/50 sm:inline">
            {speed}x
          </span>

          <div className="ml-auto flex items-center gap-1">
            {/* Episode selector */}
            {series && (
              <div className="relative">
                <button
                  onClick={() => {
                    setEpisodesOpen(!episodesOpen);
                    setSettingsOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Clapperboard className="h-3.5 w-3.5" />
                  Episodes
                  <span className="hidden sm:inline">
                    · E{episode?.episodeNumber}
                  </span>
                </button>
                {episodesOpen && (
                  <div className="absolute bottom-11 right-0 z-30 max-h-80 w-72 overflow-y-auto rounded-xl border border-white/10 bg-charcoal-raised/95 p-2 shadow-2xl backdrop-blur-xl">
                    <div className="mb-1.5 flex items-center justify-between px-2 py-1">
                      <span className="text-xs font-bold text-cream">
                        More Episodes
                      </span>
                      <button
                        onClick={() => setEpisodesOpen(false)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {series.seasons.flatMap((season) =>
                      season && shouldRenderSeason(season.seasonNumber)
                        ? [
                            <div
                              key={`s${season.seasonNumber}`}
                              className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold"
                            >
                              Season {season.seasonNumber}
                            </div>,
                            ...(allEpisodesFor(series, season.seasonNumber).map(
                              (ep) => (
                                <button
                                  key={ep.id}
                                  onClick={() => {
                                    setEpisodesOpen(false);
                                    onSelectEpisode?.(ep.id, ep.videoId);
                                  }}
                                  className={cn(
                                    "mb-0.5 flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors hover:bg-white/[0.08]",
                                    ep.id === episode?.id &&
                                      "bg-gold/10 text-gold"
                                  )}
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    <span className="text-muted-foreground">
                                      E{ep.episodeNumber}
                                    </span>
                                    <span className="truncate text-cream">
                                      {ep.title}
                                    </span>
                                  </span>
                                  <span className="shrink-0 text-[10px]">
                                    {formatDuration(ep.duration)}
                                  </span>
                                </button>
                              )
                            )),
                          ]
                        : []
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Settings (speed + quality) */}
            <div className="relative">
              <button
                onClick={() => {
                  setSettingsOpen(!settingsOpen);
                  setEpisodesOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Settings className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{quality}</span>
              </button>
              {settingsOpen && (
                <div className="absolute bottom-11 right-0 z-30 w-48 rounded-xl border border-white/10 bg-charcoal-raised/95 p-1.5 shadow-2xl backdrop-blur-xl">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Quality
                  </div>
                  {["Auto", "1080p", "720p"].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuality(q);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-white/[0.08]",
                        quality === q && "text-gold"
                      )}
                    >
                      {q}
                      {quality === q && <span className="text-gold">●</span>}
                    </button>
                  ))}
                  <div className="mt-1 border-t border-white/[0.08] px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Speed
                  </div>
                  {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSpeed(s);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-white/[0.08]",
                        speed === s && "text-gold"
                      )}
                    >
                      {s}x
                      {speed === s && <span className="text-gold">●</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Captions */}
            <button
              onClick={() => setCaptions(!captions)}
              aria-label="Captions"
              className={cn(
                "rounded-lg px-2 py-1.5 transition-colors",
                captions
                  ? "bg-gold text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              <Subtitles className="h-3.5 w-3.5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              aria-label="Fullscreen"
              className="rounded-lg p-1.5 text-white transition-colors hover:text-gold"
            >
              {fullscreen ? (
                <Minimize className="h-4.5 w-4.5" />
              ) : (
                <Maximize className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function shouldRenderSeason(seasonNumber: number): boolean {
  return seasonNumber > 0;
}

function allEpisodesFor(series: Series, seasonNumber: number) {
  return getEpisodesForSeries(series.id, seasonNumber);
}