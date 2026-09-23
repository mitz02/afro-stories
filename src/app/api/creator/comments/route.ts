import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

interface CommentRow {
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
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to view comments." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "No creator profile found." }, { status: 404 });
  }
  const profileId = (profile as { id: string }).id;

  const svc = getServiceClient();

  const { data: videoRows } = await svc
    .from("videos")
    .select("id, title")
    .eq("creator_id", profileId)
    .order("created_at", { ascending: false });
  const videoIds = (videoRows ?? []).map((v) => (v as { id: string }).id);

  if (videoIds.length === 0) {
    return NextResponse.json({ comments: [], likedCommentIds: [] });
  }

  const cols =
    "id, video_id, episode_id, user_id, user_display_name, user_avatar, text, likes_count, pinned, parent_id, created_at";

  const { data: top, error: cErr } = await svc
    .from("comments")
    .select(cols)
    .in("video_id", videoIds)
    .is("parent_id", null)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (cErr) {
    return NextResponse.json({ error: cErr.message }, { status: 500 });
  }

  const topRows = (top ?? []) as CommentRow[];
  const topIds = topRows.map((c) => c.id);
  let replyRows: CommentRow[] = [];
  if (topIds.length > 0) {
    const { data: replies, error: rErr } = await svc
      .from("comments")
      .select(cols)
      .in("parent_id", topIds)
      .order("created_at", { ascending: true });
    if (rErr) {
      return NextResponse.json({ error: rErr.message }, { status: 500 });
    }
    replyRows = (replies ?? []) as CommentRow[];
  }

  const repliesByParent: Record<string, CommentRow[]> = {};
  for (const r of replyRows) {
    const pid = r.parent_id!;
    if (!repliesByParent[pid]) repliesByParent[pid] = [];
    repliesByParent[pid].push(r);
  }

  const allIds = [...topIds, ...replyRows.map((r) => r.id)];
  let likedCommentIds: string[] = [];
  if (allIds.length > 0) {
    const { data: likes } = await svc
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", user.id)
      .in("comment_id", allIds);
    likedCommentIds = (likes ?? []).map((l) => (l as { comment_id: string }).comment_id);
  }

  const videoTitleMap = new Map(
    (videoRows ?? []).map((v) => [(v as { id: string }).id, (v as { title: string }).title])
  );

  const comments = topRows.map((c) => {
    const replies = (repliesByParent[c.id] ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      userDisplayName: r.user_display_name,
      userAvatar: r.user_avatar,
      text: r.text,
      likes: r.likes_count ?? 0,
      pinned: r.pinned,
      createdAt: r.created_at,
      videoId: r.video_id,
      episodeId: r.episode_id,
    }));
    const hasOwnerReply = replies.some((r) => r.userId === user.id);
    return {
      id: c.id,
      video: c.video_id ? videoTitleMap.get(c.video_id) ?? "Unknown" : "Unknown",
      userId: c.user_id,
      userDisplayName: c.user_display_name,
      userAvatar: c.user_avatar,
      text: c.text,
      likes: c.likes_count ?? 0,
      pinned: c.pinned,
      createdAt: c.created_at,
      videoId: c.video_id,
      episodeId: c.episode_id,
      hasOwnerReply,
      replies,
    };
  });

  return NextResponse.json({ comments, likedCommentIds });
}