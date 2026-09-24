"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Upload,
  CheckCircle2,
  Loader2,
  Film,
  Lock,
  Unlock,
  ChevronDown,
  Plus,
} from "lucide-react";
import * as tus from "tus-js-client";
import { cn } from "@/lib/utils";

interface Season {
  id: string;
  season_number: number;
  title: string;
  episode_count: number;
}

interface AddEpisodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
  seriesTitle: string;
  onSuccess?: (episodeNumber: number, videoId: string) => void;
}

type Step = "upload" | "details" | "publishing" | "done";

export function AddEpisodeModal({
  open,
  onOpenChange,
  seriesId,
  seriesTitle,
  onSuccess,
}: AddEpisodeModalProps) {
  // Meta from server
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [latestSeason, setLatestSeason] = useState(1);
  const [nextEpNumber, setNextEpNumber] = useState(1);
  const [episodeCountMap, setEpisodeCountMap] = useState<Record<number, number>>({});
  const [loadingMeta, setLoadingMeta] = useState(false);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);
  const [bunnyVideoId, setBunnyVideoId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Thumbnail
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState("");
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isNewSeason, setIsNewSeason] = useState(false);
  const [monetization, setMonetization] = useState<"free" | "premium">("free");
  const [unlockPrice, setUnlockPrice] = useState(150);

  // Flow
  const [step, setStep] = useState<Step>("upload");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [resultEpisodeNumber, setResultEpisodeNumber] = useState<number | null>(null);
  const [resultVideoId, setResultVideoId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const publishingRef = useRef(false);

  // Load series meta when modal opens
  useEffect(() => {
    if (!open || !seriesId) return;
    setLoadingMeta(true);
    fetch(`/api/creator/series/${seriesId}/next-episode`)
      .then((r) => r.json())
      .then((d: {
        seasons?: Season[];
        latestSeasonNumber?: number;
        nextEpisodeNumber?: number;
        episodeCountMap?: Record<number, number>;
      }) => {
        const s = d.seasons ?? [];
        setSeasons(s);
        const lat = d.latestSeasonNumber ?? 1;
        setLatestSeason(lat);
        setSelectedSeason(lat);
        setNextEpNumber(d.nextEpisodeNumber ?? 1);
        setEpisodeCountMap(d.episodeCountMap ?? {});
      })
      .catch(() => {})
      .finally(() => setLoadingMeta(false));
  }, [open, seriesId]);

  // Recompute next ep number when season selection changes
  useEffect(() => {
    if (isNewSeason) {
      const maxSeason = Math.max(latestSeason, ...Object.keys(episodeCountMap).map(Number));
      setNextEpNumber(1);
      setSelectedSeason(maxSeason + 1);
    } else {
      setNextEpNumber((episodeCountMap[selectedSeason] ?? 0) + 1);
    }
  }, [selectedSeason, isNewSeason, episodeCountMap, latestSeason]);

  function resetAll() {
    setFile(null);
    setDragging(false);
    setUploading(false);
    setUploadProgress(0);
    setUploadDone(false);
    setBunnyVideoId(null);
    setUploadError(null);
    setThumbnailFile(null);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(null);
    setThumbnailUrl(null);
    setTitle("");
    setMonetization("free");
    setUnlockPrice(150);
    setStep("upload");
    setPublishing(false);
    setPublishError(null);
    setResultEpisodeNumber(null);
    setResultVideoId(null);
    publishingRef.current = false;
  }

  function handleClose() {
    if (uploading) return; // don't close mid-upload
    resetAll();
    onOpenChange(false);
  }

  // ─── File selection ──────────────────────────────────────────────
  function pickFile(f: File) {
    if (f.type && !f.type.startsWith("video/")) {
      setUploadError(`"${f.name}" is not a video file.`);
      return;
    }
    setUploadError(null);
    setFile(f);
    // Auto-fill title from filename (strip extension)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim());
    startUpload(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }

  // ─── TUS upload ──────────────────────────────────────────────────
  async function startUpload(f: File) {
    setUploading(true);
    setUploadProgress(0);
    setUploadDone(false);
    setBunnyVideoId(null);
    try {
      const res = await fetch("/api/bunny/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: f.name }),
      });
      const data = (await res.json()) as {
        videoId?: string;
        libraryId?: string;
        expirationTime?: number;
        signature?: string;
        error?: string;
      };
      if (!res.ok || !data.videoId || !data.signature) {
        throw new Error(data.error ?? "Could not start the upload.");
      }

      await new Promise<void>((resolve, reject) => {
        const safeTitle = (f.name || "video.mp4")
          .replace(/\s+/g, " ")
          .replace(/[^\x20-\x7E]/g, "")
          .trim()
          .slice(0, 100) || "video";

        const upload = new tus.Upload(f, {
          endpoint: "https://video.bunnycdn.com/tusupload",
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            AuthorizationSignature: data.signature as string,
            AuthorizationExpire: String(data.expirationTime as number),
            VideoId: data.videoId as string,
            LibraryId: data.libraryId as string,
          },
          metadata: { filetype: f.type || "video/mp4", title: safeTitle },
          chunkSize: 5 * 1024 * 1024,
          onProgress: (uploaded, total) => {
            if (total) setUploadProgress(Math.min(100, Math.round((uploaded / total) * 100)));
          },
          onError: (err) => reject(new Error(err.message)),
          onSuccess: () => resolve(),
        });
        upload
          .findPreviousUploads()
          .then((prev) => {
            if (prev.length) upload.resumeFromPreviousUpload(prev[0]);
            upload.start();
          })
          .catch(() => upload.start());
      });

      setBunnyVideoId(data.videoId!);
      setUploadDone(true);
      setStep("details");
    } catch (e) {
      setUploadError((e as Error).message || "Upload failed. Please try again.");
      setFile(null);
    } finally {
      setUploading(false);
    }
  }

  // ─── Thumbnail ────────────────────────────────────────────────────
  function handleThumbnailSelect(files: FileList | null) {
    const f = files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setThumbnailFile(f);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(URL.createObjectURL(f));
    setThumbnailUrl(null);
  }

  // ─── Publish ──────────────────────────────────────────────────────
  async function handlePublish() {
    if (!bunnyVideoId || !title.trim()) return;
    if (publishingRef.current) return;
    publishingRef.current = true;
    setPublishing(true);
    setPublishError(null);
    setStep("publishing");

    try {
      // Upload thumbnail if present
      let finalThumbnail = thumbnailUrl;
      if (thumbnailFile && !finalThumbnail) {
        try {
          const fd = new FormData();
          fd.append("file", thumbnailFile);
          fd.append("bunnyVideoId", bunnyVideoId);
          const tRes = await fetch("/api/bunny/thumbnail", { method: "POST", body: fd });
          const tData = (await tRes.json().catch(() => ({}))) as { url?: string };
          if (tData.url) {
            finalThumbnail = tData.url;
            setThumbnailUrl(tData.url);
          }
        } catch {
          // non-fatal — continue without thumbnail
        }
      }

      const res = await fetch("/api/creator/add-episode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId,
          bunnyVideoId,
          title: title.trim(),
          seasonNumber: selectedSeason,
          isNewSeason,
          monetizationType: monetization,
          unlockPrice,
          thumbnail: finalThumbnail ?? undefined,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        alreadyExists?: boolean;
        episodeNumber?: number;
        videoId?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save episode.");
      }

      setResultEpisodeNumber(data.episodeNumber ?? nextEpNumber);
      setResultVideoId(data.videoId ?? null);
      setStep("done");
      onSuccess?.(data.episodeNumber ?? nextEpNumber, data.videoId ?? "");
    } catch (e) {
      setPublishError((e as Error).message);
      setStep("details");
    } finally {
      setPublishing(false);
      publishingRef.current = false;
    }
  }

  // ─── Derived ──────────────────────────────────────────────────────
  const canPublish = uploadDone && title.trim().length > 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="relative w-full max-w-lg bg-[#111] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div>
                <h2 className="font-display text-base font-bold text-cream">Add Episode</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[280px]">
                  {seriesTitle}
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={uploading}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* STEP: UPLOAD */}
              {step === "upload" && (
                <>
                  {loadingMeta && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading series info…
                    </div>
                  )}

                  {/* Episode info pill */}
                  {!loadingMeta && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-white/[0.06] border border-white/[0.1] px-3 py-1 font-semibold text-cream">
                        Season {latestSeason}
                      </span>
                      <span className="rounded-full bg-gold/10 border border-gold/30 px-3 py-1 font-bold text-gold">
                        Episode {nextEpNumber}
                      </span>
                      <span className="text-muted-foreground">will be auto-assigned</span>
                    </div>
                  )}

                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 text-center transition-all cursor-pointer",
                      dragging
                        ? "border-gold/60 bg-gold/5"
                        : uploading
                        ? "border-white/[0.08] cursor-not-allowed"
                        : "border-white/[0.12] hover:border-gold/40 hover:bg-white/[0.02]"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) pickFile(f);
                      }}
                    />
                    {uploading ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-gold mb-3" />
                        <p className="text-sm font-semibold text-cream">
                          Uploading… {uploadProgress}%
                        </p>
                        <div className="mt-3 w-48 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                          <div
                            className="h-full bg-gold rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        {file && (
                          <p className="mt-2 text-[11px] text-muted-foreground max-w-[240px] truncate">
                            {file.name}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <Film className="h-8 w-8 text-muted-foreground/50 mb-3" />
                        <p className="text-sm font-semibold text-cream">
                          Drop video here or click to browse
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          MP4, MOV, or WebM — no size limit
                        </p>
                      </>
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-xs text-crimson/80 bg-crimson/10 border border-crimson/20 rounded-lg px-3 py-2">
                      {uploadError}
                    </p>
                  )}
                </>
              )}

              {/* STEP: DETAILS */}
              {step === "details" && (
                <>
                  {/* Upload complete banner */}
                  <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-300">Video uploaded!</p>
                      {file && (
                        <p className="text-[10px] text-emerald-400/70 truncate max-w-[260px]">
                          {file.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Episode title */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Episode Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. The Return of the King"
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-cream placeholder:text-muted-foreground/50 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/20"
                    />
                  </div>

                  {/* Season selector */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Season
                    </label>
                    <div className="space-y-2">
                      {/* Existing seasons */}
                      <div className="flex flex-wrap gap-2">
                        {seasons.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => { setIsNewSeason(false); setSelectedSeason(s.season_number); }}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                              !isNewSeason && selectedSeason === s.season_number
                                ? "border-gold/50 bg-gold/10 text-gold"
                                : "border-white/[0.1] text-muted-foreground hover:border-white/25 hover:text-cream"
                            )}
                          >
                            S{s.season_number}
                            <span className="ml-1 text-[10px] opacity-60">
                              ({s.episode_count} eps)
                            </span>
                          </button>
                        ))}
                        {/* New season button */}
                        <button
                          onClick={() => setIsNewSeason(true)}
                          className={cn(
                            "flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                            isNewSeason
                              ? "border-purple/50 bg-purple/10 text-purple-300"
                              : "border-white/[0.1] text-muted-foreground hover:border-white/25 hover:text-cream"
                          )}
                        >
                          <Plus className="h-3 w-3" />
                          New Season
                        </button>
                      </div>

                      {/* Episode number display */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Will be saved as:</span>
                        <span className="font-bold text-gold">
                          S{selectedSeason} E{nextEpNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Monetization */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Access
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMonetization("free")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all",
                          monetization === "free"
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                            : "border-white/[0.1] text-muted-foreground hover:border-white/20"
                        )}
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        Free
                      </button>
                      <button
                        onClick={() => setMonetization("premium")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all",
                          monetization === "premium"
                            ? "border-gold/50 bg-gold/10 text-gold"
                            : "border-white/[0.1] text-muted-foreground hover:border-white/20"
                        )}
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Premium
                      </button>
                    </div>
                    {monetization === "premium" && (
                      <div className="mt-3">
                        <label className="mb-1 block text-[11px] text-muted-foreground">
                          Unlock price (points)
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={10000}
                          step={10}
                          value={unlockPrice}
                          onChange={(e) => setUnlockPrice(Number(e.target.value))}
                          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm text-cream focus:border-gold/50 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Optional thumbnail */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Thumbnail{" "}
                      <span className="normal-case font-normal text-muted-foreground/60">(optional)</span>
                    </label>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleThumbnailSelect(e.target.files)}
                    />
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full aspect-video object-cover rounded-xl border border-white/[0.08]"
                        />
                        <button
                          onClick={() => {
                            URL.revokeObjectURL(thumbnailPreview);
                            setThumbnailPreview(null);
                            setThumbnailFile(null);
                          }}
                          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] py-4 text-xs text-muted-foreground hover:border-white/25 hover:text-cream transition-colors"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Click to upload thumbnail
                      </button>
                    )}
                  </div>

                  {publishError && (
                    <p className="text-xs text-crimson/80 bg-crimson/10 border border-crimson/20 rounded-lg px-3 py-2">
                      {publishError}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleClose}
                      className="flex-1 rounded-xl border border-white/[0.1] py-2.5 text-sm font-semibold text-muted-foreground hover:text-cream transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePublish}
                      disabled={!canPublish || publishing}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gold py-2.5 text-sm font-bold text-black transition-all hover:bg-gold/90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {publishing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        "Publish Episode"
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* STEP: PUBLISHING */}
              {step === "publishing" && (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-gold" />
                  <p className="font-display text-base font-bold text-cream">Saving episode…</p>
                  <p className="text-xs text-muted-foreground max-w-[260px]">
                    Creating the episode record and linking it to the series.
                  </p>
                </div>
              )}

              {/* STEP: DONE */}
              {step === "done" && (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-cream">Episode Added!</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      S{selectedSeason} E{resultEpisodeNumber} &mdash; &ldquo;{title}&rdquo;
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      The video is encoding and will be live shortly.
                    </p>
                  </div>
                  <div className="flex gap-3 w-full">
                    {resultVideoId && (
                      <a
                        href={`/watch/${resultVideoId}`}
                        className="flex-1 rounded-xl border border-white/[0.12] py-2.5 text-sm font-semibold text-foreground hover:border-gold/40 hover:text-gold transition-colors text-center"
                      >
                        Watch
                      </a>
                    )}
                    <button
                      onClick={handleClose}
                      className="flex-1 rounded-xl bg-gold py-2.5 text-sm font-bold text-black hover:bg-gold/90 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
