"use client";

import * as React from "react";
import { Users, Eye, Film, BadgeCheck, Loader2, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminCreator {
  id: string;
  username: string;
  displayName: string;
  email: string;
  status: string;
  verified: boolean;
  followers: number;
  views: number;
  videos: number;
  country: string;
  createdAt: string;
}

function statusClasses(status: string) {
  if (status === "active") return "bg-emerald-400/15 text-emerald-300";
  if (status === "pending") return "bg-amber-400/15 text-amber-300";
  if (status === "suspended") return "bg-rose-400/15 text-rose-300";
  return "bg-white/[0.06] text-zinc-400";
}

export default function AdminCreatorsPage() {
  const [creators, setCreators] = React.useState<AdminCreator[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/creators", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load creators");
        const data = (await res.json()) as { creators: AdminCreator[] };
        if (!cancelled) setCreators(data.creators);
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
        <p className="mt-3 text-sm text-zinc-500">Loading creators…</p>
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

  const verifiedCount = creators.filter((c) => c.verified).length;
  const totalFollowers = creators.reduce((a, c) => a + (c.followers ?? 0), 0);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-400/90">
          Creators
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Creators
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Accounts that publish content on AfriTales.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-white">{creators.length}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Verified</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-amber-300">{verifiedCount}</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Followers</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-white">
            {totalFollowers.toLocaleString()}
          </p>
        </div>
      </div>

      {creators.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-14 text-center">
          <Users className="mx-auto h-9 w-9 text-zinc-600" />
          <p className="mt-3 text-sm font-medium text-zinc-400">No creators yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {creators.map((c) => {
            const initial = (c.displayName || c.username || "C").trim().charAt(0).toUpperCase();
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-white/[0.15] hover:bg-white/[0.045]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 text-base font-black text-white ring-2 ring-white/15">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-bold text-white">
                      {c.displayName || c.username}
                      {c.verified && (
                        <BadgeCheck className="h-4 w-4 shrink-0 text-amber-300" />
                      )}
                    </p>
                    <p className="truncate text-[11px] text-zinc-500">
                      @{c.username} · {c.email}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      statusClasses(c.status)
                    )}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-zinc-500" />
                      <strong className="tabular-nums text-white">
                        {(c.views ?? 0).toLocaleString()}
                      </strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Film className="h-3.5 w-3.5 text-zinc-500" />
                      <strong className="tabular-nums text-white">{c.videos}</strong>
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-zinc-500">
                    {c.country} · <Globe2 className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}