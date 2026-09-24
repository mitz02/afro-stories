import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id ?? null;
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ error: "videoId required" }, { status: 400 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const videoIsUuid = uuidRegex.test(videoId);

    if (!videoIsUuid) {
      return NextResponse.json({ error: "Invalid videoId format" }, { status: 400 });
    }

    // If user not authenticated, check if video is free
    if (!userId) {
      const { data: video } = await supabase
        .from("videos")
        .select("monetization")
        .eq("id", videoId)
        .maybeSingle();

      return NextResponse.json({
        hasAccess: video?.monetization === "free",
        unlockType: video?.monetization === "free" ? "free" : "locked",
        episodeId: null,
        seriesId: null,
      });
    }

    // Use the database function for access check
    const { data, error } = await supabase.rpc("check_user_video_access", {
      p_user_id: userId,
      p_video_id: videoId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = data?.[0] ?? {
      has_access: false,
      unlock_type: "locked",
      episode_id: null,
      series_id: null,
    };

    return NextResponse.json({
      hasAccess: result.has_access,
      unlockType: result.unlock_type,
      episodeId: result.episode_id,
      seriesId: result.series_id,
    });
  } catch (err) {
    console.error("Check access API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}