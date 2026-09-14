"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, UserCheck, Plus, BadgeCheck, MoreVertical } from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { creators } from "@/lib/data/creators";
import { cn, formatNumber, timeAgo } from "@/lib/utils";

const tabs = ["Followers", "Following", "New this week"] as const;

const followers = [
  { id: "u_1", name: "Kwame Asante", handle: "king_slayer", city: "Accra", country: "GH", since: "2024-01-16" },
  { id: "u_2", name: "Lagos Girl", handle: "lagos_girl", city: "Lagos", country: "NG", since: "2024-01-20" },
  { id: "u_3", name: "Zuri M.", handle: "zuri_m", city: "Nairobi", country: "KE", since: "2024-02-02" },
  { id: "u_4", name: "Courage Osei", handle: "courage_o", city: "Kumasi", country: "GH", since: "2024-03-11" },
  { id: "u_5", name: "CyberAfrican", handle: "cyberafr1can", city: "Johannesburg", country: "ZA", since: "2024-04-25" },
  { id: "u_6", name: "Mombasa Vibes", handle: "mombasa_vibes", city: "Mombasa", country: "KE", since: "2024-05-06" },
  { id: "u_7", name: "Adaeze", handle: "ada_collective", city: "Lagos", country: "NG", since: "2024-06-18" },
  { id: "u_8", name: "Film Buff Uk", handle: "filmipop", city: "London", country: "GB", since: "2024-07-03" },
];

export default function FollowersPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Followers");
  const [query, setQuery] = useState("");
  const [following, setFollowing] = useState<Set<string>>(
    new Set(["u_1", "u_3", "u_5"])
  );

  const founder = creators[0];

  const displayRows =
    tab === "Followers"
      ? followers
      : tab === "Following"
      ? followers.filter((f) => following.has(f.id))
      : followers.slice(0, 3);

  const rows = displayRows.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  const toggleFollow = (id: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-cream">Followers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatNumber(founder.followers)} people follow your stories.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search followers…"
            className="rounded-full border border-white/[0.1] bg-charcoal-raised py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
          />
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
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12]"
          >
            <Avatar className="h-11 w-11 shrink-0 border border-gold/30">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${f.id}`}
                alt={f.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-fuchsia-600 font-display text-sm text-cream">
                {f.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-cream">{f.name}</p>
                {f.id === "u_7" && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-gold" />}
              </div>
              <p className="truncate text-[11px] text-muted-foreground">
                @{f.handle} · {f.city} · following since {timeAgo(f.since)}
              </p>
            </div>
            <button
              onClick={() => toggleFollow(f.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all",
                following.has(f.id)
                  ? "border border-white/[0.12] text-muted-foreground hover:border-crimson/50 hover:text-crimson"
                  : "bg-gold text-black hover:bg-gold-dim"
              )}
            >
              {following.has(f.id) ? (
                <>
                  <UserCheck className="h-3.5 w-3.5" /> Following
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Follow
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] py-16 text-center">
          <UserCheck className="h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 font-display text-sm font-bold text-cream">
            No followers found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a different search.
          </p>
        </div>
      )}
    </div>
  );
}