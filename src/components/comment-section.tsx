"use client";

import { useEffect, useState } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Send,
  Pin,
  Flag,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { timeAgo, formatNumber, cn } from "@/lib/utils";

interface DbComment {
  id: string;
  video_id: string | null;
  episode_id: string | null;
  user_id: string;
  user_display_name: string;
  user_avatar: string | null;
  text: string;
  likes_count: number;
  pinned: boolean;
  parent_id: string | null;
  created_at: string;
  replies: DbComment[];
}

export function CommentSection({ videoId }: { videoId: string }) {
  const { user } = useSessionProfile();
  const [comments, setComments] = useState<DbComment[]>([]);
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/social/comments?videoId=${videoId}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          comments: DbComment[];
          likedCommentIds: string[];
        };
        if (cancelled) return;
        setComments(data.comments ?? []);
        setLikedCommentIds(data.likedCommentIds ?? []);
      } catch {
        // leave empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [videoId]);

  const handleSubmit = async () => {
    const text = newComment.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/social/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          text,
          parentId: replyTo ?? undefined,
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { comment: DbComment };
      if (data.comment) {
        if (replyTo) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === replyTo
                ? { ...c, replies: [...c.replies, data.comment] }
                : c
            )
          );
        } else {
          setComments((prev) => [data.comment, ...prev]);
        }
        setNewComment("");
        setReplyTo(null);
      }
    } finally {
      setPosting(false);
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    const wasLiked = likedCommentIds.includes(commentId);
    setLikedCommentIds((prev) =>
      wasLiked ? prev.filter((x) => x !== commentId) : [...prev, commentId]
    );
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return { ...c, likes_count: c.likes_count + (wasLiked ? -1 : 1) };
        }
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === commentId
              ? { ...r, likes_count: r.likes_count + (wasLiked ? -1 : 1) }
              : r
          ),
        };
      })
    );
    try {
      const res = await fetch("/api/social/comment-like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      if (!res.ok) {
        setLikedCommentIds((prev) =>
          wasLiked ? [...prev, commentId] : prev.filter((x) => x !== commentId)
        );
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return { ...c, likes_count: c.likes_count + (wasLiked ? 1 : -1) };
            }
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId
                  ? { ...r, likes_count: r.likes_count + (wasLiked ? 1 : -1) }
                  : r
              ),
            };
          })
        );
      }
    } catch {
      setLikedCommentIds((prev) =>
        wasLiked ? [...prev, commentId] : prev.filter((x) => x !== commentId)
      );
    }
  };

  return (
    <div>
      <h3 className="font-display text-lg font-bold text-cream">
        Comments{" "}
        <span className="text-sm font-medium text-muted-foreground">
          ({comments.length})
        </span>
      </h3>

      {/* Input */}
      {!user ? (
        <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <a href="/login" className="font-semibold text-gold hover:underline">Sign in</a> to join the conversation.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex gap-3">
          <Avatar className="h-9 w-9 border border-gold/30">
            <AvatarFallback className="text-xs text-white bg-gradient-to-br from-purple-deep to-black">
              {user.display_name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 focus-within:border-gold/50">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              placeholder={
                replyTo
                  ? "Write a reply…"
                  : "Share your thoughts on this story…"
              }
              className="flex-1 bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
            {replyTo && (
              <button
                onClick={() => setReplyTo(null)}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || posting}
              className="rounded-lg p-1.5 text-gold transition-colors hover:bg-gold/10 disabled:opacity-30"
              aria-label="Post comment"
            >
              {posting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="mt-4 space-y-5">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gold" />
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/[0.08] py-8 text-center">
            <MessageCircle className="mx-auto h-6 w-6 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">
              No comments yet. Start the conversation!
            </p>
          </div>
        )}

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            liked={likedCommentIds.includes(comment.id)}
            onToggleLike={() => toggleCommentLike(comment.id)}
            onReply={() => {
              setReplyTo(comment.id);
              setNewComment("");
            }}
            currentUserId={user?.id}
            isLoggedIn={!!user}
          >
            {comment.replies?.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                liked={likedCommentIds.includes(reply.id)}
                onToggleLike={() => toggleCommentLike(reply.id)}
                onReply={() => {
                  setReplyTo(comment.id);
                  setNewComment("");
                }}
                currentUserId={user?.id}
                isLoggedIn={!!user}
              />
            ))}
          </CommentItem>
        ))}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  liked,
  onToggleLike,
  onReply,
  children,
  currentUserId,
  isLoggedIn,
}: {
  comment: DbComment;
  liked: boolean;
  onToggleLike: () => void;
  onReply: () => void;
  children?: React.ReactNode;
  currentUserId?: string;
  isLoggedIn: boolean;
}) {
  const isOwn = comment.user_id === currentUserId;
  const isPinned = comment.pinned;
  const effectiveLikes = comment.likes_count + (liked ? 1 : 0);

  return (
    <div
      className={cn(
        "flex gap-3",
        isPinned &&
          "rounded-xl border border-gold/20 bg-gold/[0.04] p-2.5"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs text-white",
            isOwn
              ? "bg-gradient-to-br from-amber-500 to-orange-700"
              : "bg-gradient-to-br from-purple-deep to-black"
          )}
        >
          {comment.user_display_name[0]}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-cream">
            {comment.user_display_name}
          </span>
          {isPinned && (
            <span className="inline-flex items-center gap-0.5 rounded bg-gold/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-gold">
              <Pin className="h-2.5 w-2.5" /> Pinned
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/60">
            {timeAgo(comment.created_at)}
          </span>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">
          {comment.text}
        </p>
        <div className="mt-1.5 flex items-center gap-4">
          <button
            onClick={isLoggedIn ? onToggleLike : () => window.location.href = "/login"}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              liked ? "text-gold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ThumbsUp className={cn("h-3.5 w-3.5", liked && "fill-current")} />
            {formatNumber(effectiveLikes)}
          </button>
          <button
            onClick={isLoggedIn ? onReply : () => window.location.href = "/login"}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Reply
          </button>
          <button className="text-xs text-muted-foreground/50 hover:text-crimson">
            <Flag className="h-3 w-3" />
          </button>
        </div>
        {children && (
          <div className="mt-3 space-y-3 border-l border-white/[0.08] pl-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
