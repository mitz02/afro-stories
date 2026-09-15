import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isFeatureEnabled } from "@/lib/supabase/features";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { videoId?: string };
  const videoId = body.videoId?.trim();
  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId." }, { status: 400 });
  }

  if (!(await isFeatureEnabled("views_tracking_enabled"))) {
    return NextResponse.json({ tracked: false });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_video_views", {
    p_video_id: videoId,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ tracked: true });
}