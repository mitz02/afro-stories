"use client";

import * as React from "react";
import { Loader2, Eye, ThumbsUp, MessageCircle, Heart, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToastStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Flags {
  viewsTracking: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
}

const settings: {
  key: string;
  apiKey: keyof Flags;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  chip: string;
  label: string;
  description: string;
}[] = [
  {
    key: "views_tracking_enabled",
    apiKey: "viewsTracking",
    icon: Eye,
    tint: "text-amber-300",
    chip: "bg-amber-400/15",
    label: "View counting",
    description: "Increment view counts when users watch videos. Storage is handled by the increment_video_views RPC.",
  },
  {
    key: "likes_enabled",
    apiKey: "likes",
    icon: ThumbsUp,
    tint: "text-rose-300",
    chip: "bg-rose-400/15",
    label: "Likes",
    description: "Allow users to like and unlike videos across the platform.",
  },
  {
    key: "comments_enabled",
    apiKey: "comments",
    icon: MessageCircle,
    tint: "text-sky-300",
    chip: "bg-sky-400/15",
    label: "Comments",
    description: "Allow users to post, view and like comments on videos.",
  },
  {
    key: "follows_enabled",
    apiKey: "follows",
    icon: Heart,
    tint: "text-emerald-300",
    chip: "bg-emerald-400/15",
    label: "Follows",
    description: "Allow users to follow creators and see their content in their feed.",
  },
];

export default function AdminSettingsPage() {
  const [flags, setFlags] = React.useState<Flags | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingKey, setSavingKey] = React.useState<string | null>(null);
  const [justSaved, setJustSaved] = React.useState<string | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const showToast = useToastStore((s) => s.showToast);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load settings");
        const data = (await res.json()) as { flags: Flags };
        if (!cancelled) setFlags(data.flags);
        setError(null);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setError(null);
    setLoading(true);
    setAttempt((a) => a + 1);
  };

  const toggleFlag = async (key: string, value: boolean) => {
    if (!flags) return;
    const prev = flags;
    const optimistic = { ...flags, [settings.find((s) => s.key === key)!.apiKey]: value } as Flags;
    setFlags(optimistic);
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = (await res.json()) as { flags: Flags };
      setFlags(data.flags);
      setJustSaved(key);
      window.setTimeout(() => setJustSaved((k) => (k === key ? null : k)), 1800);
    } catch {
      setFlags(prev);
      showToast("Update failed", "Could not persist the change. Check the app_settings table exists.");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-amber-300" />
        <p className="mt-3 text-sm text-zinc-500">Loading feature flags…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-zinc-400">
          {error} — are you signed in as an admin?
        </p>
        <button
          onClick={retry}
          className="mt-4 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-xs font-semibold text-white hover:border-white/20"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-400/90">
          System
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Feature Controls
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Toggle platform-wide features. Changes apply instantly across the site.
        </p>
      </div>

      {flags && (
        <div className="grid gap-3">
          {settings.map((s) => {
            const isSaving = savingKey === s.key;
            const saved = justSaved === s.key;
            return (
              <div
                key={s.key}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors sm:p-5",
                  isSaving && "opacity-80"
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    s.chip,
                    saved && "ring-2 ring-emerald-400/60"
                  )}
                >
                  <s.icon className={cn("h-5 w-5", s.tint)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{s.label}</p>
                    {isSaving && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-300" />
                    )}
                    {saved && !isSaving && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                        Saved
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                    {s.description}
                  </p>
                </div>
                <Switch
                  checked={flags[s.apiKey]}
                  onCheckedChange={(checked: boolean) => void toggleFlag(s.key, checked)}
                  disabled={isSaving}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-[#0d1326]/60 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
        <p className="text-xs leading-relaxed text-zinc-500">
          Flags are stored in the <span className="text-zinc-300">app_settings</span> table and
          cached for 30 seconds. When a flag is missing it defaults to{" "}
          <span className="text-zinc-300">on</span>, so the platform works even before the
          feature-flag migration is applied.
        </p>
      </div>
    </div>
  );
}