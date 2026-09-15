"use client";

import * as React from "react";
import { Flag, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminReport {
  id: string;
  video: string;
  reporter: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

function statusClasses(status: string) {
  if (status === "open") return "bg-rose-400/15 text-rose-300";
  if (status === "investigating") return "bg-amber-400/15 text-amber-300";
  if (status === "resolved") return "bg-emerald-400/15 text-emerald-300";
  return "bg-white/[0.06] text-zinc-400";
}

export default function AdminReportsPage() {
  const [reports, setReports] = React.useState<AdminReport[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/reports", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load reports");
        const data = (await res.json()) as { reports: AdminReport[] };
        if (!cancelled) setReports(data.reports);
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
        <p className="mt-3 text-sm text-zinc-500">Loading reports…</p>
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

  const open = reports.filter((r) => r.status === "open").length;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-400/90">
            Community
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Reports
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Content flagged by viewers for review.
          </p>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold",
            open > 0 ? "bg-rose-400/15 text-rose-300" : "bg-emerald-400/15 text-emerald-300"
          )}
        >
          <span className={cn("relative flex h-2 w-2")}>
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                open > 0 ? "bg-rose-400" : "bg-emerald-400"
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                open > 0 ? "bg-rose-400" : "bg-emerald-400"
              )}
            />
          </span>
          {open === 0 ? "All clear" : `${open} open`}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-14 text-center">
          <ShieldCheck className="mx-auto h-9 w-9 text-emerald-400/80" />
          <p className="mt-3 text-sm font-medium text-zinc-400">No reports yet.</p>
          <p className="mt-1 text-xs text-zinc-600">
            Great — nothing has been flagged for review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-white/[0.13] hover:bg-white/[0.04]"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-400/15">
                  <Flag className="h-4 w-4 text-rose-300" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white italic">“{r.video}”</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    Reported by {r.reporter} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    statusClasses(r.status)
                  )}
                >
                  {r.status}
                </span>
              </div>
              <div className="mt-3 rounded-xl bg-white/[0.03] px-3.5 py-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {r.category}
                </span>
                <p className="mt-1 text-sm leading-relaxed text-zinc-300">{r.description}</p>
              </div>
              {r.resolvedAt && (
                <p className="mt-2 text-[11px] text-emerald-300/80">
                  Resolved on{" "}
                  {new Date(r.resolvedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}