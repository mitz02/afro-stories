import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to like stories." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { videoId?: string };
  const videoId = body.videoId?.trim();
  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("video_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("video_likes")
      .delete()
      .eq("id", (existing as { id: string }).id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ liked: false });
  }

  const { error } = await supabase.from("video_likes").insert({
    user_id: user.id,
    video_id: videoId,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ liked: true });
}
