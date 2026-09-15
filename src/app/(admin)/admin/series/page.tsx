"use client";

import * as React from "react";
import { Clapperboard, Eye, ThumbsUp, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSeries {
  id: string;
  title: string;
  status: string;
  views: number;
  likes: number;
  followers: number;
  completed: boolean;
  monetization: string;
  createdAt: string;
  creator: string;
}

function statusClasses(status: string) {
  if (status === "published") return "bg-emerald-400/15 text-emerald-300";
  if (status === "draft") return "bg-white/[0.06] text-zinc-400";
  return "bg-amber-400/15 text-amber-300";
}

export default function AdminSeriesPage() {
  const [series, setSeries] = React.useState<AdminSeries[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/series", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load series");
        const data = (await res.json()) as { series: AdminSeries[] };
        if (!cancelled) setSeries(data.series);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-amber-300" />
        <p className="mt-3 text-sm text-zinc-500">Loading series…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-zinc-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-400/90">
          Content
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Series
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Story collections created across the platform.
        </p>
      </div>

      {series.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-14 text-center">
          <Clapperboard className="mx-auto h-9 w-9 text-zinc-600" />
          <p className="mt-3 text-sm font-medium text-zinc-400">No series yet.</p>
          <p className="mt-1 text-xs text-zinc-600">
            Creators can group episodes into series from the creator dashboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {series.map((s) => (
            <div
              key={s.id}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-white/[0.15] hover:bg-white/[0.045]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300/80 to-amber-500/60 shadow-[0_0_18px_rgba(245,185,66,0.25)]">
                    <Clapperboard className="h-5 w-5 text-neutral-950" strokeWidth={2.1} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{s.title}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">{s.creator}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    statusClasses(s.status)
                  )}
                >
                  {s.status}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4 border-t border-white/[0.05] pt-3 text-[11px] text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-zinc-500" />
                  <strong className="tabular-nums text-white">{s.views.toLocaleString()}</strong>
                  views
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ThumbsUp className="h-3.5 w-3.5 text-zinc-500" />
                  <strong className="tabular-nums text-white">{s.likes.toLocaleString()}</strong>
                  likes
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-zinc-500" />
                  <strong className="tabular-nums text-white">{s.followers.toLocaleString()}</strong>
                  followers
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}