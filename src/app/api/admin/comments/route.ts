import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  if (!(await isAdminUser(supabase))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("comments")
    .select("id, video_id, episode_id, user_id, user_display_name, text, likes_count, pinned, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const videoIds = [
    ...new Set(
      (data ?? [])
        .map((c) => (c as { video_id: string | null }).video_id)
        .filter(Boolean) as string[]
    ),
  ];
  const videosMap: Record<string, string> = {};
  if (videoIds.length > 0) {
    const { data: videos } = await supabase
      .from("videos")
      .select("id, title")
      .in("id", videoIds);
    for (const v of videos ?? []) {
      videosMap[(v as { id: string }).id] = (v as { title: string }).title;
    }
  }

  const comments = (data ?? []).map((c) => {
    const row = c as {
      id: string;
      video_id: string | null;
      user_display_name: string;
      text: string;
      likes_count: number;
      pinned: boolean;
      created_at: string;
    };
    return {
      id: row.id,
      video: row.video_id ? videosMap[row.video_id] ?? "Unknown video" : "—",
      user: row.user_display_name,
      text: row.text,
      likes: row.likes_count ?? 0,
      pinned: row.pinned,
      createdAt: row.created_at,
    };
  });

  return NextResponse.json({ comments });
}