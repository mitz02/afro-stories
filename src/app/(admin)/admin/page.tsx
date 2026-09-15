"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  ThumbsUp,
  MessageCircle,
  Users,
  Loader2,
  Film,
  Clapperboard,
  Flag,
  Settings,
  ArrowRight,
  UserRound,
  ArrowUpRight,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoStat {
  id: string;
  title: string;
  views: number;
  likes: number;
  status: string;
  creator: string;
}

interface Totals {
  videos: number;
  views: number;
  likes: number;
  comments: number;
  follows: number;
}

const shortcuts = [
  {
    href: "/admin/videos",
    icon: Film,
    label: "Manage videos",
    description: "Review uploads",
    accent: "from-indigo-400 to-indigo-600/60",
  },
  {
    href: "/admin/series",
    icon: Clapperboard,
    label: "Manage series",
    description: "Organize collections",
    accent: "from-amber-300 to-amber-500/60",
  },
  {
    href: "/admin/creators",
    icon: UserRound,
    label: "Creators",
    description: "Review accounts",
    accent: "from-emerald-400 to-emerald-600/60",
  },
  {
    href: "/admin/comments",
    icon: MessageCircle,
    label: "Comments",
    description: "Moderate discussion",
    accent: "from-sky-400 to-sky-600/60",
  },
  {
    href: "/admin/reports",
    icon: Flag,
    label: "Reports",
    description: "Resolve violations",
    accent: "from-rose-400 to-rose-600/60",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    label: "Feature controls",
    description: "Toggle platform features",
    accent: "from-violet-400 to-violet-600/60",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [totals, setTotals] = React.useState<Totals | null>(null);
  const [topVideos, setTopVideos] = React.useState<VideoStat[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (res.status === 403) {
          if (!cancelled) setError("Not authorized. You need an admin account.");
          return;
        }
        if (!res.ok) throw new Error("Failed to load admin data");
        const data = (await res.json()) as { totals: Totals; topVideos: VideoStat[] };
        if (!cancelled) {
          setTotals(data.totals);
          setTopVideos(data.topVideos);
        }
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-300" />
        <p className="mt-4 text-sm font-medium text-zinc-500">Loading overview…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-zinc-400">{error}</p>
        <button
          onClick={() => router.push("/home")}
          className="mt-4 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-xs font-semibold text-white hover:border-white/20"
        >
          Back to site
        </button>
      </div>
    );
  }

  const statDefinitions = [
    { label: "Total views", value: totals?.views ?? 0, icon: Eye, tint: "text-amber-300", chip: "bg-amber-400/15" },
    { label: "Total likes", value: totals?.likes ?? 0, icon: ThumbsUp, tint: "text-rose-300", chip: "bg-rose-400/15" },
    { label: "Comments", value: totals?.comments ?? 0, icon: MessageCircle, tint: "text-sky-300", chip: "bg-sky-400/15" },
    { label: "Follows", value: totals?.follows ?? 0, icon: Users, tint: "text-emerald-300", chip: "bg-emerald-400/15" },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-400/90">
            Overview
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome back, <span className="text-amber-300">Admin</span>
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            A snapshot of everything happening across AfriTales.
          </p>
        </div>
        <Link
          href="/admin/videos"
          className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#5438dc] px-4.5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(84,56,220,0.4)] transition-colors hover:bg-[#4a2fc4] sm:self-auto"
        >
          <Film className="h-4 w-4" />
          Review content
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statDefinitions.map((s) => (
          <div
            key={s.label}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.045]"
          >
            <div
              className={cn(
                "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-2xl transition-all group-hover:opacity-60",
                s.chip
              )}
            />
            <div className="relative flex w-fit items-center justify-center rounded-xl bg-white/[0.05] p-2.5">
              <s.icon className={cn("h-4.5 w-4.5", s.tint)} strokeWidth={1.9} />
            </div>
            <p className="relative mt-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {s.label}
            </p>
            <p className="relative mt-1 text-2xl font-bold tabular-nums tracking-tight text-white sm:text-[27px]">
              {s.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Quick actions</h2>
          <LifeBuoy className="h-4 w-4 text-zinc-600" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shortcuts.map((sc) => (
            <Link
              key={sc.href}
              href={sc.href}
              className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.05]"
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                  sc.accent
                )}
              >
                <sc.icon className="h-4 w-4 text-white" strokeWidth={2} />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[13px] font-semibold text-white">{sc.label}</p>
                <p className="truncate text-[11px] text-zinc-500">{sc.description}</p>
              </div>
              <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-300" />
            </Link>
          ))}
        </div>
      </section>

      {/* Top videos */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Top videos by views</h2>
          <Link
            href="/admin/videos"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 transition-colors hover:text-amber-200"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {topVideos.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-12 text-center">
            <Film className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-400">No videos uploaded yet.</p>
            <p className="mt-1 text-xs text-zinc-600">
              Uploads will appear here once your creators publish content.
            </p>
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/[0.07] text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Video</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Views</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Likes</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold">Creator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.045]">
                  {topVideos.slice(0, 6).map((v) => (
                    <tr key={v.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="max-w-[280px] truncate px-5 py-3.5 font-semibold text-white">
                        {v.title}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-zinc-300">
                        {v.views.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-zinc-400">
                        {v.likes.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide",
                            v.status === "published"
                              ? "bg-emerald-400/15 text-emerald-300"
                              : v.status === "processing"
                              ? "bg-amber-400/15 text-amber-300"
                              : "bg-white/[0.06] text-zinc-400"
                          )}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="max-w-[160px] truncate px-5 py-3.5 text-zinc-400">
                        {v.creator}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list fallback */}
            <div className="divide-y divide-white/[0.045] md:hidden">
              {topVideos.slice(0, 6).map((v) => (
                <div key={v.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{v.title}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">{v.creator}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold tabular-nums text-white">
                      {v.views.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-500">{v.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}