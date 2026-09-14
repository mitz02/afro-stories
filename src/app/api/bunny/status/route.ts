import { NextResponse, type NextRequest } from "next/server";
import { getBunnyVideo } from "@/lib/bunny";
import { requireCreator } from "@/lib/bunny-auth";

export const runtime = "nodejs";

/** Lightweight encode-progress poller used by the upload flow. */
export async function GET(req: NextRequest) {
  const session = await requireCreator();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const videoId = req.nextUrl.searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId." }, { status: 400 });
  }

  try {
    const video = await getBunnyVideo(videoId);
    return NextResponse.json({
      videoId: video.guid,
      status: video.status,
      encodeProgress: video.encodeProgress,
      duration: video.length,
      width: video.width ?? null,
      height: video.height ?? null,
      availableResolutions: video.availableResolutions ?? null,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}