"use client";

import * as React from "react";
import Link from "next/link";
import { Film, Eye, ThumbsUp, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminVideo {
  id: string;
  title: string;
  views: number;
  likes: number;
  status: string;
  monetization: string;
  type: string;
  createdAt: string;
  publishedAt: string | null;
  creator: string;
}

function statusClasses(status: string) {
  if (status === "published")
    return "bg-emerald-400/15 text-emerald-300";
  if (status === "processing") return "bg-amber-400/15 text-amber-300";
  if (status === "draft") return "bg-white/[0.06] text-zinc-400";
  return "bg-rose-400/15 text-rose-300";
}

export default function AdminVideosPage() {
  const [videos, setVideos] = React.useState<AdminVideo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/videos", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load videos");
        const data = (await res.json()) as { videos: AdminVideo[] };
        if (!cancelled) setVideos(data.videos);
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
        <p className="mt-3 text-sm text-zinc-500">Loading videos…</p>
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

  const totalViews = videos.reduce((a, v) => a + (v.views ?? 0), 0);
  const published = videos.filter((v) => v.status === "published").length;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-400/90">
          Content
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Videos</h1>
        <p className="text-sm text-zinc-400">
          All uploads across the platform, newest first.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-white">{videos.length}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Published</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-emerald-300">{published}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total views</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-white">{totalViews.toLocaleString()}</p>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-14 text-center">
          <Film className="mx-auto h-9 w-9 text-zinc-600" />
          <p className="mt-3 text-sm font-medium text-zinc-400">No videos yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/[0.07] text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Video</th>
                  <th className="px-5 py-3.5 font-semibold">Creator</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Type</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Views</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Likes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.045]">
                {videos.map((v) => (
                  <tr key={v.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="max-w-[280px] px-5 py-3.5 font-semibold text-white">
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                          <Film className="h-3.5 w-3.5 text-zinc-400" />
                        </span>
                        <span className="truncate">{v.title}</span>
                      </span>
                    </td>
                    <td className="max-w-[150px] truncate px-5 py-3.5 text-zinc-400">{v.creator}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide", statusClasses(v.status))}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 capitalize text-zinc-400">{v.type}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-zinc-300">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-zinc-500" />
                        {v.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5 text-zinc-500" />
                        {v.likes.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-white/[0.045] md:hidden">
            {videos.map((v) => (
              <div key={v.id} className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                  <Film className="h-4 w-4 text-zinc-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">{v.title}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
                    <span>{v.creator}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase", statusClasses(v.status))}>
                      {v.status}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold tabular-nums text-white">
                    {(v.views ?? 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-zinc-500">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 transition-colors hover:text-amber-200"
        >
          Back to overview
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}