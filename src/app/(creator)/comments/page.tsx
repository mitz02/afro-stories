"use client";

import { useState } from "react";
import {
  Heart,
  Search,
  Reply,
  MoreVertical,
  Inbox,
} from "lucide-react";
import { comments } from "@/lib/data/comments";
import { creators } from "@/lib/data/creators";
import { cn, timeAgo } from "@/lib/utils";

const filters = ["All", "Replied", "Unreplied", "Pinned"] as const;

export default function CommentsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const creatorAvatars: Record<string, string> = Object.fromEntries(
    creators.map((c) => [c.id, c.avatar])
  );

  const rows = comments
    .filter((c) => {
      if (filter === "Replied") return !!c.replies?.some((r) => r.userId === "u_chiefuwa");
      if (filter === "Unreplied") return !c.replies?.some((r) => r.userId === "u_chiefuwa");
      if (filter === "Pinned") return !!c.pinned;
      return true;
    })
    .filter((c) =>
      c.text.toLowerCase().includes(query.toLowerCase())
    );

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-cream">Comments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join the conversation happening on your stories.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border border-white/[0.1] p-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                filter === f
                  ? "bg-gold text-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search comments…"
            className="rounded-full border border-white/[0.1] bg-charcoal-raised py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {rows.map((comment) => {
          const chiefReply = comment.replies?.find((r) => r.userId === "u_chiefuwa");
          return (
            <div
              key={comment.id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/[0.06]">
                  <img
                    src={
                      comment.userAvatar ||
                      `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${comment.userId}`
                    }
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-cream">
                      {comment.userDisplayName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {timeAgo(comment.createdAt)}
                    </span>
                    {comment.pinned && (
                      <span className="rounded-full bg-purple/15 px-2 py-0.5 text-[10px] font-semibold text-purple">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                    {comment.text}
                  </p>

                  {/* Reply by creator */}
                  {chiefReply && (
                    <div className="mt-3 rounded-xl border-l-2 border-gold bg-gold/[0.06] p-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-gold">
                          <Reply className="h-3 w-3" /> Chief Uwa Folktales
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(chiefReply.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                        {chiefReply.text}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => toggleLike(comment.id)}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                      liked.has(comment.id)
                        ? "bg-crimson/15 text-crimson"
                        : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-3.5 w-3.5",
                        liked.has(comment.id) && "fill-crimson"
                      )}
                    />
                    {comment.likes + (liked.has(comment.id) ? 1 : 0)}
                  </button>
                  <button
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:text-gold"
                    aria-label="More"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {rows.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] py-16 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 font-display text-sm font-bold text-cream">
            No comments found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a different filter or search.
          </p>
        </div>
      )}
    </div>
  );
}