"use client";

import * as React from "react";
import { MessageCircle, ThumbsUp, Pin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminComment {
  id: string;
  video: string;
  user: string;
  text: string;
  likes: number;
  pinned: boolean;
  createdAt: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = React.useState<AdminComment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/comments", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load comments");
        const data = (await res.json()) as { comments: AdminComment[] };
        if (!cancelled) setComments(data.comments);
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
        <p className="mt-3 text-sm text-zinc-500">Loading comments…</p>
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

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-400/90">
          Community
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Comments
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Recent discussion across the platform.
        </p>
      </div>

      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-14 text-center">
          <MessageCircle className="mx-auto h-9 w-9 text-zinc-600" />
          <p className="mt-3 text-sm font-medium text-zinc-400">No comments yet.</p>
          <p className="mt-1 text-xs text-zinc-600">
            Comments appear here once viewers start discussions on videos. Apply migration{" "}
            <span className="font-mono text-zinc-400">000006</span> so everyone can read them.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => {
            const initial = (c.user || "U").trim().charAt(0).toUpperCase();
            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors",
                  c.pinned && "border-amber-400/30 bg-amber-400/[0.04]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-sm font-black text-white ring-2 ring-white/10">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm font-bold text-white">{c.user}</p>
                      <span className="text-[10px] text-zinc-500">
                        on <span className="text-zinc-300 italic">“{c.video}”</span>
                      </span>
                      {c.pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-amber-300">
                          <Pin className="h-2.5 w-2.5" />
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{c.text}</p>
                    <div className="mt-2.5 flex items-center gap-4 text-[11px] text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {c.likes} likes
                      </span>
                      <span className="tabular-nums">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}