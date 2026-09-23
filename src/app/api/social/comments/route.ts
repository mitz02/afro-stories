import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stickerAvatar } from "@/lib/stickers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, video_id, episode_id, user_id, user_display_name, user_avatar, text, likes_count, pinned, parent_id, created_at")
    .eq("video_id", videoId)
    .is("parent_id", null)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const commentIds = (comments ?? []).map((c) => c.id);
  let replies: Record<string, unknown[]> = {};

  if (commentIds.length > 0) {
    const { data: replyRows } = await supabase
      .from("comments")
      .select("id, video_id, episode_id, user_id, user_display_name, user_avatar, text, likes_count, pinned, parent_id, created_at")
      .in("parent_id", commentIds)
      .order("created_at", { ascending: true });

    if (replyRows) {
      replies = {};
      for (const r of replyRows) {
        const pid = (r as { parent_id: string }).parent_id;
        if (!replies[pid]) replies[pid] = [];
        replies[pid].push(r);
      }
    }
  }

  let likedCommentIds: string[] = [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const allIds = [
      ...commentIds,
      ...Object.values(replies).flat().map((r) => (r as { id: string }).id),
    ];
    if (allIds.length > 0) {
      const { data: likes } = await supabase
        .from("comment_likes")
        .select("comment_id")
        .eq("user_id", user.id)
        .in("comment_id", allIds);
      likedCommentIds = (likes ?? []).map((l) => (l as { comment_id: string }).comment_id);
    }
  }

  return NextResponse.json({
    comments: (comments ?? []).map((c) => ({
      ...c,
      replies: replies[(c as { id: string }).id] ?? [],
    })),
    likedCommentIds,
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    videoId?: string;
    text?: string;
    parentId?: string;
  };
  const videoId = body.videoId?.trim();
  const text = body.text?.trim();
  if (!videoId || !text) {
    return NextResponse.json({ error: "Missing videoId or text." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, username, avatar")
    .eq("id", user.id)
    .maybeSingle();
  const profileRow = profile as {
    display_name?: string | null;
    username?: string;
    avatar?: string | null;
  } | null;
  const displayName =
    profileRow?.display_name ??
    profileRow?.username ??
    user.email?.split("@")[0] ??
    "User";
  const avatar = profileRow?.avatar ?? stickerAvatar(user.id);

  const insert: Record<string, unknown> = {
    video_id: videoId,
    user_id: user.id,
    user_display_name: displayName,
    user_avatar: avatar,
    text,
  };
  if (body.parentId) insert.parent_id = body.parentId;

  const { data: comment, error } = await supabase
    .from("comments")
    .insert(insert)
    .select("id, video_id, episode_id, user_id, user_display_name, user_avatar, text, likes_count, pinned, parent_id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ comment: { ...comment, replies: [] } });
}
