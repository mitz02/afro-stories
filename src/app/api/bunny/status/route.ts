import { NextResponse, type NextRequest } from "next/server";
import { getBunnyVideo } from "@/lib/bunny";
import { gateCreator } from "@/lib/bunny-auth";

export const runtime = "nodejs";

/** Lightweight encode-progress poller used by the upload flow. */
export async function GET(req: NextRequest) {
  const gate = await gateCreator();
  if (!gate.ok) {
    const status = gate.reason === "unauthenticated" ? 401 : 403;
    const error =
      gate.reason === "unauthenticated"
        ? "Your session expired. Please sign in again and retry."
        : "This account isn't an approved creator yet.";
    return NextResponse.json({ error }, { status });
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