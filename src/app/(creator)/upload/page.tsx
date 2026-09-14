"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  Film,
  Info,
  Layers,
  Coins,
  Rocket,
  Check,
  ChevronLeft,
  ChevronRight,
  FileVideo,
  X,
  Plus,
  Sparkles,
  Clock,
} from "lucide-react";
import { useToastStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { cn } from "@/lib/utils";
import * as tus from "tus-js-client";

const steps = [
  { index: 1, title: "Upload", icon: UploadCloud },
  { index: 2, title: "Details", icon: Info },
  { index: 3, title: "Type", icon: Layers },
  { index: 4, title: "Monetization", icon: Coins },
  { index: 5, title: "Publish", icon: Rocket },
];

const genreOptions = [
  "Folklore",
  "Animation",
  "Drama",
  "Comedy",
  "Horror",
  "Fantasy",
  "Adventure",
  "History",
  "Kids",
  "Documentary",
  "AI Stories",
  "Short Films",
  "African Legends",
  "Romance",
  "Sci-Fi",
  "Mythology",
];

const countryOptions = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Ethiopia",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Senegal",
  "Cameroon",
  "Zimbabwe",
  "Egypt",
  "Morocco",
];

const languageOptions = [
  "English",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Swahili",
  "French",
  "Arabic",
  "Amharic",
  "Wolof",
  "Zulu",
  "Twi",
];

const pointOptions = [0, 50, 100, 200, 500];

const countryCodes: Record<string, string> = {
  Nigeria: "NG",
  Ghana: "GH",
  Kenya: "KE",
  "South Africa": "ZA",
  Ethiopia: "ET",
  Tanzania: "TZ",
  Uganda: "UG",
  Rwanda: "RW",
  Senegal: "SN",
  Cameroon: "CM",
  Zimbabwe: "ZW",
  Egypt: "EG",
  Morocco: "MA",
};

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const showToast = useToastStore((s) => s.showToast);
  const { user, loading: authLoading } = useSessionProfile();
  const publishingRef = useRef(false);

  // State
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bunnyVideoId, setBunnyVideoId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    genre: "",
    country: "Nigeria",
    language: "English",
    tags: "",
    origin: "ai_assisted" as "ai_generated" | "ai_assisted" | "human",
    contentMode: "single" as "single" | "series",
    isNewSeries: true,
    seriesTitle: "",
    seriesDescription: "",
    seasonNumber: 1,
    episodeNumber: 1,
    episodeTitle: "",
    episodeDescription: "",
    monetizationType: "free" as "free" | "premium",
    unlockPrice: 50,
  });

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const file = Array.from(fileList)[0];
    if (!file) return;
    setFiles([file]);
    setUploadProgress(0);
    setUploadComplete(false);
    setBunnyVideoId(null);
    setUploading(true);
    setUploadError(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setThumbnailUrl(null);

    // Accept the file regardless of browser MIME quirks, but reject obvious
    // non-videos up front with a clear message.
    if (file.type && !file.type.startsWith("video/")) {
      setUploadError(
        `"${file.name}" is not a video file (detected type: ${file.type || "unknown"}).`
      );
      setFiles([]);
      setUploading(false);
      return;
    }

    // 1) Ask the server for a Bunny Stream slot + TUS upload credentials.
    // 2) Upload the raw bytes straight to Bunny with tus-js-client (the API
    //    key never leaves the server; uploads resume automatically).
    void (async () => {
      try {
        const res = await fetch("/api/bunny/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: file.name }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          videoId?: string;
          libraryId?: string;
          expirationTime?: number;
          signature?: string;
          error?: string;
        };
        if (
          !res.ok ||
          !data.videoId ||
          !data.libraryId ||
          !data.expirationTime ||
          !data.signature
        ) {
          const msg =
            data.error ?? (res.ok ? "Could not start the upload." : "Server refused the upload.");
          throw new Error(msg);
        }

        await new Promise<void>((resolve, reject) => {
          // TUS metadata must be plain ASCII — long or non-ASCII filenames can
          // break the CREATE request headers.
          const safeTitle = (file.name || "video.mp4")
            .replace(/\s+/g, " ")
            .replace(/[^\x20-\x7E]/g, "")
            .trim()
            .slice(0, 100) || "video";
          const upload = new tus.Upload(file, {
            endpoint: "https://video.bunnycdn.com/tusupload",
            retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
            headers: {
              AuthorizationSignature: data.signature as string,
              AuthorizationExpire: String(data.expirationTime as number),
              VideoId: data.videoId as string,
              LibraryId: data.libraryId as string,
            },
            metadata: {
              filetype: file.type || "video/mp4",
              title: safeTitle,
            },
            chunkSize: 5 * 1024 * 1024,
            onProgress: (bytesUploaded, bytesTotal) => {
              if (bytesTotal) {
                setUploadProgress(
                  Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100))
                );
              }
            },
            onError: (err) => reject(new Error(err.message)),
            onSuccess: () => resolve(),
          });
          // Resume is best-effort: some browsers block the storage tus uses
          // for resume, and a failed resume must never block a fresh upload.
          upload
            .findPreviousUploads()
            .then((previousUploads) => {
              if (previousUploads.length) {
                upload.resumeFromPreviousUpload(previousUploads[0]);
              }
              upload.start();
            })
            .catch(() => upload.start());
        });

        setBunnyVideoId(data.videoId);
        setUploadComplete(true);
        setUploadError(null);
        showToast("Upload complete!", "Video is being processed.");
      } catch (e) {
        setFiles([]);
        const message = (e as Error).message ?? "";
        setUploadError(
          /fetch|network|failed to fetch/i.test(message)
            ? "Could not reach the upload server. Check your internet connection and try again."
            : message || "Upload failed. Please try again."
        );
        showToast("Upload failed", message || "Please try again.");
      } finally {
        setUploading(false);
      }
    })();
  };

  const handleThumbnailSelect = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Invalid thumbnail", "Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Thumbnail too large", "Images must be under 10 MB.");
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setThumbnailUrl(null);
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(null);
    setThumbnailUrl(null);
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return uploadComplete;
      case 2:
        return form.title.trim().length > 2 && form.description.trim().length > 10;
      case 3:
        if (form.contentMode === "series") {
          return form.seriesTitle.trim().length > 2 && form.episodeTitle.trim().length > 2;
        }
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
    else handlePublish();
  };

  const handlePublish = async (mode?: "draft" | "publish" | "schedule") => {
    if (!bunnyVideoId) {
      showToast("Upload your video first", "No file has been uploaded yet.");
      return;
    }
    if (publishingRef.current) return; // same-tick double-click guard
    publishingRef.current = true;
    setPublishing(true);
    try {
      // Upload a custom thumbnail (best-effort — publish proceeds even if it fails).
      let thumbnail = thumbnailUrl;
      if (thumbnailFile && !thumbnail) {
        try {
          const fd = new FormData();
          fd.append("file", thumbnailFile);
          fd.append("bunnyVideoId", bunnyVideoId);
          const tRes = await fetch("/api/bunny/thumbnail", { method: "POST", body: fd });
          const tData = (await tRes.json().catch(() => ({}))) as { url?: string; error?: string };
          if (!tRes.ok || !tData.url) throw new Error(tData.error ?? "Thumbnail upload failed.");
          thumbnail = tData.url;
          setThumbnailUrl(tData.url);
        } catch (e) {
          showToast("Thumbnail not saved", (e as Error).message ?? "Publishing without it.");
        }
      }

      const res = await fetch("/api/bunny/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bunnyVideoId,
          title: form.title,
          description: form.description,
          genre: form.genre,
          tags: form.tags,
          language: form.language,
          country: countryCodes[form.country] ?? "NG",
          origin: form.origin,
          contentMode: form.contentMode,
          monetizationType: form.monetizationType,
          unlockPrice: form.unlockPrice,
          publishMode: mode ?? "publish",
          seriesTitle: form.contentMode === "series" ? form.seriesTitle : undefined,
          seriesDescription: form.seriesDescription,
          seasonNumber: form.seasonNumber,
          episodeNumber: form.episodeNumber,
          episodeTitle: form.episodeTitle,
          episodeDescription: form.episodeDescription,
          thumbnail: thumbnail ?? undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        alreadyPublished?: boolean;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not save your story.");

      if (data.alreadyPublished) {
        showToast(
          "This upload was already saved",
          "No duplicate was created — refresh to start a new upload."
        );
        setPublishing(false);
        publishingRef.current = false;
        return;
      }

      if (mode === "draft") {
        showToast("Draft saved", "You can continue editing later.");
      } else if (mode === "schedule") {
        showToast("Release scheduled", "Your story will go live on the chosen date.");
      } else {
        showToast(
          "Published! 🎉",
          form.contentMode === "series"
            ? `"${form.seriesTitle}" is now live on Aafstories.`
            : `"${form.title}" is now live on Aafstories.`
        );
      }

      // Reset the flow so the finished upload can't be resubmitted and so the
      // next upload starts on a clean Step 1.
      setFiles([]);
      setUploadProgress(0);
      setUploadComplete(false);
      setBunnyVideoId(null);
      setUploadError(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setThumbnailUrl(null);
      setCurrentStep(1);
    } catch (e) {
      showToast("Couldn't publish", (e as Error).message ?? "Please try again.");
    } finally {
      setPublishing(false);
      publishingRef.current = false;
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {authLoading && (
        <div className="mb-6 rounded-xl border border-white/[0.06] bg-surface p-8 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      )}

      {!authLoading && !user && (
        <div className="mb-6 rounded-xl border border-gold/30 bg-gold/10 p-6 text-center">
          <h2 className="font-display text-lg font-black text-cream">
            Sign in to upload
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You need an approved creator account to upload stories.
          </p>
          <a
            href="/login"
            className="mt-4 inline-flex rounded-full bg-gold px-5 py-2 text-sm font-bold text-black hover:bg-gold-dim"
          >
            Sign in
          </a>
        </div>
      )}

      {!authLoading && user && user.role === "viewer" && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="font-display text-lg font-black text-cream">
            Not an approved creator
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You're signed in as{" "}
            <span className="font-semibold text-foreground">{user.email}</span>{" "}
            — this account doesn't have creator access yet.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with an approved creator account to upload, or contact
            support to have this account approved.
          </p>
          <a
            href="/login"
            className="mt-4 inline-flex rounded-full bg-gold px-5 py-2 text-sm font-bold text-black hover:bg-gold-dim"
          >
            Switch account
          </a>
        </div>
      )}

      {!authLoading && user && user.role !== "viewer" && (
        <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-cream">
            Upload Your Story
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            From file to the world in 5 simple steps.
          </p>
        </div>
        <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
          Step {currentStep} of 5
        </span>
      </div>

      {/* Progress steps */}
      <div className="mb-8 flex items-center gap-0">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.index;
          const isDone = currentStep > step.index;
          return (
            <div key={step.index} className="flex flex-1 items-center">
              <button
                onClick={() => {
                  if (canProceed(step.index - 1) && step.index < currentStep) {
                    setCurrentStep(step.index);
                  }
                }}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    isActive
                      ? "border-gold bg-gold/15 text-gold"
                      : isDone
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                      : "border-white/[0.1] text-muted-foreground/40"
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive || isDone
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                  )}
                >
                  {step.title}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-1 mb-5 h-0.5 flex-1 rounded-full",
                    isDone ? "bg-emerald-500/50" : "bg-white/[0.08]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* STEP 1: UPLOAD */}
      {currentStep === 1 && (
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFileSelect(e.dataTransfer.files);
            }}
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all sm:p-14",
              dragging
                ? "border-gold bg-gold/[0.06] scale-[1.02]"
                : uploadComplete
                ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                : "border-white/[0.12]"
            )}
          >
            {uploadComplete ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check className="h-8 w-8 text-emerald-400" />
                </div>
                <p className="mt-4 font-display text-lg font-bold text-cream">
                  Upload complete!
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {files[0]?.name ?? "video.mp4"} is processing.
                </p>
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
                  <UploadCloud className="h-8 w-8 text-gold" />
                </div>
                <p className="mt-4 font-display text-lg font-bold text-cream">
                  Drag & drop your video
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  or click to browse · MP4, MOV, WebM
                </p>
                <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim disabled:pointer-events-none disabled:opacity-60">
                  <FileVideo className="h-4 w-4" />
                  {uploading ? "Uploading…" : "Choose Video"}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    onClick={(e) => {
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {["MP4", "MOV", "WebM", "Max 2GB"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[10px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {uploadError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              <span className="flex-1">{uploadError}</span>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="shrink-0 text-red-300/70 transition-colors hover:text-red-200"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Upload progress */}
          {files.length > 0 && !uploadComplete && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <FileVideo className="h-4 w-4 text-gold" />
                  {files[0].name}
                </span>
                <span className="font-semibold text-gold">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold to-burnt-orange transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadComplete && (
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Processing quality</span>
                <span className="text-emerald-400">1080p ready</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Aspect ratio</span>
                <span>16:9 · landscape</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: DETAILS */}
      {currentStep === 2 && (
        <div className="space-y-5 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-cream">
              Story Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. The Warrior of Benin — Episode 1"
              className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-cream">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell viewers what your story is about…"
              rows={4}
              className="w-full resize-none rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-cream">
              Thumbnail
            </label>
            <div className="flex items-center gap-4">
              <label className="relative block aspect-video w-44 cursor-pointer overflow-hidden rounded-xl border border-dashed transition-all hover:border-gold/50">
                {thumbnailPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        clearThumbnail();
                      }}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
                      aria-label="Remove thumbnail"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] font-semibold text-white">
                      Click to change
                    </span>
                  </>
                ) : (
                  <span
                    className={cn(
                      "flex h-full w-full flex-col items-center justify-center text-muted-foreground/40",
                      form.title ? "hover:border-gold/50" : ""
                    )}
                  >
                    <Plus className="mx-auto mb-1 h-4 w-4" />
                    Add thumbnail
                  </span>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleThumbnailSelect(e.target.files)}
                />
              </label>
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold text-cream">Tip</p>
                <p className="mt-1 max-w-[220px] leading-relaxed">
                  Use a dramatic frame from your story. 16:9, at least 1280×720.
                </p>
                {thumbnailFile && thumbnailUrl && (
                  <p className="mt-1 text-emerald-400">Thumbnail saved with your story.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-cream">
                Genre *
              </label>
              <select
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground focus:border-gold/60 focus:outline-none"
              >
                <option value="">Select genre</option>
                {genreOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-cream">
                Country
              </label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground focus:border-gold/60 focus:outline-none"
              >
                {countryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-cream">
                Language
              </label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground focus:border-gold/60 focus:outline-none"
              >
                {languageOptions.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-cream">
                Tags
              </label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="warrior, prophecy, adventure"
                className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
              />
            </div>
          </div>

          {/* AI origin */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-cream">
              How was this content created?
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  { value: "human", label: "Human Created", desc: "All by me" },
                  { value: "ai_assisted", label: "AI Assisted", desc: "Partially AI" },
                  { value: "ai_generated", label: "AI Generated", desc: "Fully AI" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, origin: opt.value })}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    form.origin === opt.value
                      ? "border-gold bg-gold/10"
                      : "border-white/[0.08] hover:border-white/[0.2]"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-bold",
                      form.origin === opt.value ? "text-gold" : "text-cream"
                    )}
                  >
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
              <Sparkles className="h-3 w-3 text-gold" />
              Aafstories is transparent about AI usage. This label is always shown.
            </p>
          </div>
        </div>
      )}

      {/* STEP 3: TYPE */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setForm({ ...form, contentMode: "single" })}
              className={cn(
                "rounded-2xl border p-6 text-left transition-all",
                form.contentMode === "single"
                  ? "border-gold bg-gold/[0.08] shadow-lg shadow-gold/10"
                  : "border-white/[0.08] hover:border-white/[0.2]"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple/30 to-black">
                <Film className="h-5 w-5 text-purple" />
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-cream">
                Single Video
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                A standalone story, short film, or documentary.
              </p>
              {form.contentMode === "single" && (
                <span className="mt-3 inline-block rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold text-black">
                  Selected
                </span>
              )}
            </button>

            <button
              onClick={() => setForm({ ...form, contentMode: "series" })}
              className={cn(
                "rounded-2xl border p-6 text-left transition-all",
                form.contentMode === "series"
                  ? "border-gold bg-gold/[0.08] shadow-lg shadow-gold/10"
                  : "border-white/[0.08] hover:border-white/[0.2]"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold/30 to-black">
                <Layers className="h-5 w-5 text-gold" />
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-cream">
                Series Episode
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                An episode within a seasonal series. Build your own African
                Netflix show.
              </p>
              {form.contentMode === "series" && (
                <span className="mt-3 inline-block rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold text-black">
                  Selected
                </span>
              )}
            </button>
          </div>

          {form.contentMode === "series" && (
            <div className="space-y-5 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <h3 className="font-display text-base font-bold text-cream">
                  Create Series
                </h3>
                <span className="rounded-full bg-purple/15 px-2.5 py-0.5 text-[10px] font-semibold text-purple">
                  New
                </span>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-cream">
                  Series Title *
                </label>
                <input
                  value={form.seriesTitle}
                  onChange={(e) => setForm({ ...form, seriesTitle: e.target.value })}
                  placeholder="e.g. The Warrior of Benin"
                  className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-cream">
                  Series Description
                </label>
                <textarea
                  value={form.seriesDescription}
                  onChange={(e) => setForm({ ...form, seriesDescription: e.target.value })}
                  placeholder="What is this series about?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-cream">
                    Season
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.seasonNumber}
                    onChange={(e) => setForm({ ...form, seasonNumber: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground focus:border-gold/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-cream">
                    Episode Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.episodeNumber}
                    onChange={(e) => setForm({ ...form, episodeNumber: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground focus:border-gold/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-cream">
                    Episode Title *
                  </label>
                  <input
                    value={form.episodeTitle}
                    onChange={(e) => setForm({ ...form, episodeTitle: e.target.value })}
                    placeholder="e.g. The Prophecy"
                    className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-cream">
                  Episode Description
                </label>
                <textarea
                  value={form.episodeDescription}
                  onChange={(e) => setForm({ ...form, episodeDescription: e.target.value })}
                  placeholder="What happens in this episode?"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
                />
              </div>

              <button className="inline-flex items-center gap-2 rounded-full border border-purple/40 bg-purple/10 px-4 py-2 text-xs font-bold text-purple transition-colors hover:bg-purple/20">
                <Plus className="h-3.5 w-3.5" />
                Add Another Episode Later
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: MONETIZATION */}
      {currentStep === 4 && (
        <div className="space-y-5 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
          <div>
            <h3 className="font-display text-lg font-bold text-cream">
              Monetization
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              How viewers will access this story.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setForm({ ...form, monetizationType: "free" })}
              className={cn(
                "rounded-2xl border p-6 text-left transition-all",
                form.monetizationType === "free"
                  ? "border-emerald-500/60 bg-emerald-500/[0.08]"
                  : "border-white/[0.08] hover:border-white/[0.2]"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
                <Film className="h-5 w-5 text-emerald-300" />
              </div>
              <h4 className="mt-3 font-display text-base font-bold text-cream">
                Free
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Anyone can watch. Perfect for building an audience.
              </p>
              {form.monetizationType === "free" && (
                <span className="mt-3 inline-block rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-black">
                  Selected
                </span>
              )}
            </button>

            <button
              onClick={() => setForm({ ...form, monetizationType: "premium" })}
              className={cn(
                "rounded-2xl border p-6 text-left transition-all",
                form.monetizationType === "premium"
                  ? "border-gold bg-gold/[0.08]"
                  : "border-white/[0.08] hover:border-white/[0.2]"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
                <Coins className="h-5 w-5 text-gold" />
              </div>
              <h4 className="mt-3 font-display text-base font-bold text-cream">
                Premium
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Viewers spend points to unlock. You earn per unlock.
              </p>
              {form.monetizationType === "premium" && (
                <span className="mt-3 inline-block rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold text-black">
                  Selected
                </span>
              )}
            </button>
          </div>

          {form.monetizationType === "premium" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-cream">
                Unlock Price (points)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {pointOptions.map((points) => (
                  <button
                    key={points}
                    onClick={() => setForm({ ...form, unlockPrice: points })}
                    className={cn(
                      "rounded-xl border py-3 text-sm font-bold transition-all",
                      form.unlockPrice === points
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-white/[0.08] text-muted-foreground hover:border-white/[0.2]"
                    )}
                  >
                    {points} pts
                  </button>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Coins className="h-3.5 w-3.5 text-gold" />
                Viewers with 0 points will be prompted to buy more. You earn
                revenue whenever your episode is unlocked.
              </p>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: PUBLISH */}
      {currentStep === 5 && (
        <div className="space-y-5">
          <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/[0.08] to-transparent p-6 sm:p-8">
            <h3 className="font-display text-lg font-bold text-cream">
              Ready to share your story?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your details below:
            </p>

            {/* Summary */}
            <div className="mt-5 space-y-2.5 text-sm">
              <SummaryRow label="Video" value={files[0]?.name ?? "video.mp4"} />
              <SummaryRow label="Title" value={form.title || "—"} />
              <SummaryRow
                label="Type"
                value={form.contentMode === "series" ? `Series · S${form.seasonNumber} E${form.episodeNumber}` : "Single Video"}
              />
              {form.contentMode === "series" && (
                <SummaryRow label="Series" value={form.seriesTitle || "—"} />
              )}
              <SummaryRow
                label="Content"
                value={
                  form.origin === "human"
                    ? "Human Created"
                    : form.origin === "ai_assisted"
                    ? "AI Assisted"
                    : "AI Generated"
                }
              />
              <SummaryRow
                label="Monetization"
                value={
                  form.monetizationType === "premium"
                    ? `Premium · ${form.unlockPrice} points`
                    : "Free"
                }
              />
            </div>
          </div>

          {/* Publish options */}
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => handlePublish("draft")}
              className="rounded-2xl border border-white/[0.1] p-5 text-center transition-colors hover:border-white/[0.2]"
            >
              <FileVideo className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-bold text-cream">Save Draft</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Keep editing later
              </p>
            </button>

            <button
              onClick={() => handlePublish("publish")}
              className="rounded-2xl border border-gold bg-gold/[0.12] p-5 text-center transition-colors hover:bg-gold/[0.2]"
            >
              <Rocket className="mx-auto h-6 w-6 text-gold" />
              <p className="mt-2 text-sm font-bold text-gold">Publish Now</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Go live immediately
              </p>
            </button>

            <button
              onClick={() => handlePublish("schedule")}
              className="rounded-2xl border border-white/[0.1] p-5 text-center transition-colors hover:border-white/[0.2]"
            >
              <Clock className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-bold text-cream">Schedule Release</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Choose a date & time
              </p>
            </button>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] px-6 py-3 text-sm font-semibold text-muted-foreground transition-all hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {currentStep < 5 ? (
          <button
            onClick={goNext}
            disabled={!canProceed(currentStep)}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim disabled:opacity-40"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={goNext}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim"
          >
            <Rocket className="h-4 w-4" />
            Finish
          </button>
        )}
      </div>
        </>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="line-clamp-1 max-w-[60%] text-right font-semibold text-cream">
        {value}
      </span>
    </div>
  );
}