"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Heart, Search, Reply, Inbox, MoreVertical, Loader2, Send } from "lucide-react";
import { stickerAvatar } from "@/lib/stickers";
import { useToastStore } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";

const filters = ["All", "Replied", "Unreplied", "Pinned"] as const;

interface CommentReply {
  id: string;
  userId: string;
  userDisplayName: string;
  userAvatar: string | null;
  text: string;
  likes: number;
  pinned: boolean;
  createdAt: string;
  videoId: string | null;
  episodeId: string | null;
}

interface CommentRow {
  id: string;
  video: string;
  userId: string;
  userDisplayName: string;
  userAvatar: string | null;
  text: string;
  likes: number;
  pinned: boolean;
  createdAt: string;
  videoId: string | null;
  episodeId: string | null;
  hasOwnerReply: boolean;
  replies: CommentReply[];
}

export default function CommentsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/creator/comments");
        const json = (await res.json()) as {
          comments?: CommentRow[];
          likedCommentIds?: string[];
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error ?? "Failed to load comments.");
          setLoading(false);
          return;
        }
        setRows(json.comments ?? []);
        setLikedIds(new Set(json.likedCommentIds ?? []));
      } catch {
        if (!cancelled) setError("Failed to load comments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = rows
    .filter((c) => {
      if (filter === "Replied") return c.hasOwnerReply;
      if (filter === "Unreplied") return !c.hasOwnerReply;
      if (filter === "Pinned") return c.pinned;
      return true;
    })
    .filter((c) => {
      const q = query.toLowerCase();
      return (
        !q ||
        c.text.toLowerCase().includes(q) ||
        c.userDisplayName.toLowerCase().includes(q)
      );
    });

  const toggleLike = async (id: string) => {
    const prev = new Set(likedIds);
    setLikedIds((old) => {
      const next = new Set(old);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      const res = await fetch("/api/social/comment-like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: id }),
      });
      const json = (await res.json()) as { liked?: boolean; error?: string };
      if (!res.ok) {
        setLikedIds(prev);
        showToast("Could not like comment", json.error ?? "Try again.");
      }
    } catch {
      setLikedIds(prev);
      showToast("Could not like comment", "Check your connection.");
    }
  };

  const submitReply = async (comment: CommentRow) => {
    if (!replyText.trim() || !comment.videoId) return;
    setPosting(true);
    try {
      const res = await fetch("/api/social/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: comment.videoId,
          parentId: comment.id,
          text: replyText.trim(),
        }),
      });
      const json = (await res.json()) as {
        comment?: { id: string; user_display_name: string; text: string; likes_count: number; pinned: boolean; created_at: string };
        error?: string;
      };
      if (!res.ok || !json.comment) {
        showToast("Could not post reply", json.error ?? "Try again.");
        setPosting(false);
        return;
      }
      setRows((old) =>
        old.map((c) =>
          c.id === comment.id
            ? {
                ...c,
                hasOwnerReply: true,
                replies: [
                  ...c.replies,
                  {
                    id: json.comment!.id,
                    userId: "",
                    userDisplayName: json.comment!.user_display_name,
                    userAvatar: null,
                    text: json.comment!.text,
                    likes: json.comment!.likes_count ?? 0,
                    pinned: json.comment!.pinned ?? false,
                    createdAt: json.comment!.created_at,
                    videoId: comment.videoId,
                    episodeId: null,
                  },
                ],
              }
            : c
        )
      );
      setReplyingTo(null);
      setReplyText("");
      showToast("Reply posted", "Your reply is now live.");
    } catch {
      showToast("Could not post reply", "Check your connection.");
    } finally {
      setPosting(false);
    }
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

      {/* List */}
      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-gold" />
          <p className="mt-3 text-sm text-muted-foreground">Loading comments…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] py-16 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 font-display text-sm font-bold text-cream">Something went wrong</p>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/[0.08]">
                  <img
                    src={comment.userAvatar ?? stickerAvatar(comment.userId)}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-cream">
                      {comment.userDisplayName}
                    </span>
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      on {comment.video}
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

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {comment.replies.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-xl border-l-2 border-gold bg-gold/[0.06] p-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-gold">
                              <Reply className="h-3 w-3" /> {r.userDisplayName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {timeAgo(r.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                            {r.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply composer */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 focus-within:border-gold/50">
                      <input
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && !e.shiftKey && submitReply(comment)
                        }
                        placeholder="Write a reply…"
                        className="flex-1 bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                      />
                      <button
                        onClick={() => submitReply(comment)}
                        disabled={!replyText.trim() || posting}
                        className="rounded-lg p-1.5 text-gold transition-colors hover:bg-gold/10 disabled:opacity-30"
                        aria-label="Send reply"
                      >
                        {posting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => toggleLike(comment.id)}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                      likedIds.has(comment.id)
                        ? "bg-crimson/15 text-crimson"
                        : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-3.5 w-3.5",
                        likedIds.has(comment.id) && "fill-crimson"
                      )}
                    />
                    {comment.likes + (likedIds.has(comment.id) ? 1 : 0)}
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo((cur) => (cur === comment.id ? null : comment.id));
                      setReplyText("");
                    }}
                    className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-gold"
                  >
                    <Reply className="h-3.5 w-3.5" /> Reply
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
          ))}
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
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