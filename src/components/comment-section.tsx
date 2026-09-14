"use client";

import { useState } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Send,
  Pin,
  Flag,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getCommentsForVideo } from "@/lib/data/comments";
import { currentUser } from "@/lib/data/creators";
import { timeAgo, formatNumber, cn } from "@/lib/utils";
import type { Comment } from "@/types";

export function CommentSection({ videoId }: { videoId: string }) {
  const comments = getCommentsForVideo(videoId);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const [likedReplyIds, setLikedReplyIds] = useState<string[]>([]);

  const handleSubmit = () => {
    const text = newComment.trim();
    if (!text) return;
    const comment: Comment = {
      id: `cm_new_${Date.now()}`,
      videoId,
      userId: currentUser.id,
      userDisplayName: currentUser.displayName,
      userAvatar: "",
      text,
      likes: 0,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setLocalComments([comment, ...localComments]);
    setNewComment("");
  };

  const toggleCommentLike = (id: string) => {
    setLikedCommentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleReplyLike = (id: string) => {
    setLikedReplyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const sorted = [...localComments].sort(
    (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
  );
  const sortedWithAge = sorted.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <h3 className="font-display text-lg font-bold text-cream">
        Comments{" "}
        <span className="text-sm font-medium text-muted-foreground">
          ({localComments.length})
        </span>
      </h3>

      {/* Input */}
      <div className="mt-3 flex gap-3">
        <Avatar className="h-9 w-9 border border-gold/30">
          <AvatarFallback
            className={cn(
              "text-xs text-white",
              currentUser.avatarGradient ?? "bg-gradient-to-br from-violet-500 to-fuchsia-600"
            )}
          >
            AO
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 focus-within:border-gold/50">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Share your thoughts on this story…"
            className="flex-1 bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="rounded-lg p-1.5 text-gold transition-colors hover:bg-gold/10 disabled:opacity-30"
            aria-label="Post comment"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-4 space-y-5">
        {sortedWithAge.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/[0.08] py-8 text-center">
            <MessageCircle className="mx-auto h-6 w-6 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">
              No comments yet. Start the conversation!
            </p>
          </div>
        )}

        {sortedWithAge.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            liked={likedCommentIds.includes(comment.id)}
            onToggleLike={() => toggleCommentLike(comment.id)}
          >
            {comment.replies?.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                liked={likedReplyIds.includes(reply.id)}
                onToggleLike={() => toggleReplyLike(reply.id)}
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
  children,
}: {
  comment: Comment;
  liked: boolean;
  onToggleLike: () => void;
  children?: React.ReactNode;
}) {
  const isCreator = comment.userDisplayName.includes("Chief Uwa");
  const isPinned = comment.pinned;
  const effectiveLikes = comment.likes + (liked ? 1 : 0);

  return (
    <div className={cn("flex gap-3", isPinned && "rounded-xl border border-gold/20 bg-gold/[0.04] p-2.5")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs text-white",
            isCreator
              ? "bg-gradient-to-br from-amber-500 to-orange-700"
              : "bg-gradient-to-br from-purple-deep to-black"
          )}
        >
          {comment.userDisplayName[0]}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-cream">
            {comment.userDisplayName}
          </span>
          {isPinned && (
            <span className="inline-flex items-center gap-0.5 rounded bg-gold/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-gold">
              <Pin className="h-2.5 w-2.5" /> Pinned
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/60">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">
          {comment.text}
        </p>
        <div className="mt-1.5 flex items-center gap-4">
          <button
            onClick={onToggleLike}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              liked ? "text-gold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ThumbsUp className={cn("h-3.5 w-3.5", liked && "fill-current")} />
            {formatNumber(effectiveLikes)}
          </button>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            Reply
          </button>
          <button className="text-xs text-muted-foreground/50 hover:text-crimson">
            <Flag className="h-3 w-3" />
          </button>
        </div>
        {children && <div className="mt-3 space-y-3 border-l border-white/[0.08] pl-4">{children}</div>}
      </div>
    </div>
  );
}