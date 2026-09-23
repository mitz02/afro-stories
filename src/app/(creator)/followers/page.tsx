"use client";`nexport const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Search, UserCheck, Inbox, X, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatNumber, timeAgo } from "@/lib/utils";

const tabs = ["Followers", "Following", "New this week"] as const;

const FLAGS: Record<string, string> = {
  NG: "🇳🇬", GH: "🇬🇭", KE: "🇰🇪", ZA: "🇿🇦", ET: "🇪🇹", TZ: "🇹🇿", UG: "🇺🇬",
  RW: "🇷🇼", SN: "🇸🇳", CM: "🇨🇲", ZW: "🇿🇼", ZM: "🇿🇲", EG: "🇪🇬", MA: "🇲🇦",
  CI: "🇨🇮", BJ: "🇧🇯", SL: "🇸🇱", MZ: "🇲🇿", AO: "🇦🇴", MW: "🇲🇼", GB: "🇬🇧",
};

interface Follower {
  id: string;
  userId: string;
  name: string;
  handle: string;
  avatar: string | null;
  country: string;
  since: string;
}

interface Following {
  id: string;
  since: string;
  type: "creator" | "series";
  name: string;
  handle: string;
  avatar: string | null;
  thumbnail: string | null;
}

export default function FollowersPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Followers");
  const [query, setQuery] = useState("");
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/creator/followers");
        const json = (await res.json()) as {
          followers?: Follower[];
          following?: Following[];
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error ?? "Failed to load followers.");
          setLoading(false);
          return;
        }
        setFollowers(json.followers ?? []);
        setFollowing(json.following ?? []);
      } catch {
        if (!cancelled) setError("Failed to load followers.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = Date.now();
  const newThisWeek = followers.filter(
    (f) => now - new Date(f.since).getTime() <= 7 * 24 * 60 * 60 * 1000
  );

  const displayRows: { key: string; f: Follower | null; fol: Following | null }[] = [];
  if (tab === "Followers") {
    displayRows.push(
      ...followers.map((f) => ({ key: `f_${f.id}`, f, fol: null }))
    );
  } else if (tab === "Following") {
    displayRows.push(
      ...following.map((fo) => ({ key: `fo_${fo.id}`, f: null, fol: fo }))
    );
  } else {
    displayRows.push(
      ...newThisWeek.map((f) => ({ key: `nw_${f.id}`, f, fol: null }))
    );
  }

  const rows = displayRows.filter((r) => {
    const q = query.toLowerCase();
    const name = (r.f?.name ?? r.fol?.name ?? "").toLowerCase();
    const handle = (r.f?.handle ?? r.fol?.handle ?? "").toLowerCase();
    return !q || name.includes(q) || handle.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-cream">Followers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatNumber(followers.length)} people follow your stories.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="rounded-full border border-white/[0.1] bg-charcoal-raised py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-full border border-white/[0.1] p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
              tab === t
                ? "bg-gold text-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
            {t === "Followers" && followers.length > 0 && (
              <span className={cn("ml-1.5", tab === t ? "text-black/70" : "text-muted-foreground/70")}>
                {followers.length}
              </span>
            )}
            {t === "New this week" && newThisWeek.length > 0 && (
              <span className={cn("ml-1.5 text-emerald-400", tab === t && "text-black/70")}>
                {newThisWeek.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-gold" />
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] py-16 text-center">
          <X className="h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 font-display text-sm font-bold text-cream">Something went wrong</p>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => {
            if (r.fol) {
              const fo = r.fol;
              return (
                <div
                  key={r.key}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12]"
                >
                  <Avatar className="h-11 w-11 shrink-0 border border-gold/30">
                    {fo.avatar && <AvatarImage src={fo.avatar} alt={fo.name} />}
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-fuchsia-600 font-display text-sm text-cream">
                      {fo.type === "creator"
                        ? fo.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
                        : "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-cream">{fo.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {fo.type === "creator" ? `@${fo.handle}` : "Series"} · following since {timeAgo(fo.since)}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.12] px-3 py-1.5 text-xs font-bold text-muted-foreground">
                    <UserCheck className="h-3.5 w-3.5" /> Following
                  </span>
                </div>
              );
            }
            const f = r.f!;
            return (
              <div
                key={r.key}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12]"
              >
                <Avatar className="h-11 w-11 shrink-0 overflow-hidden border border-gold/30">
                  {f.avatar && <AvatarImage src={f.avatar} alt={f.name} />}
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-fuchsia-600 font-display text-sm text-cream">
                    {f.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-cream">{f.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    @{f.handle} · {FLAGS[f.country] ?? "🌍"} following since {timeAgo(f.since)}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.1] px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  Follower
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] py-16 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 font-display text-sm font-bold text-cream">
            {tab === "Following"
              ? "You are not following anyone yet"
              : tab === "New this week"
              ? "No new followers this week"
              : "No followers found"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {query ? "Try a different search." : "Your followers will appear here."}
          </p>
        </div>
      )}
    </div>
  );
}