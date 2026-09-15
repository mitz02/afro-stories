import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ liked: false, followingCreator: false });
  }

  const { data: like } = await supabase
    .from("video_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .maybeSingle();

  const { data: video } = await supabase
    .from("videos")
    .select("creator_id")
    .eq("id", videoId)
    .maybeSingle();

  let followingCreator = false;
  if (video && (video as { creator_id: string }).creator_id) {
    const { data: follow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("followee_id", (video as { creator_id: string }).creator_id)
      .eq("followee_type", "creator")
      .maybeSingle();
    followingCreator = !!follow;
  }

  return NextResponse.json({
    liked: !!like,
    followingCreator,
  });
}
