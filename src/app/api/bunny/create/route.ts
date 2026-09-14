import { NextResponse, type NextRequest } from "next/server";
import { createBunnyVideo, getTusUploadCredentials } from "@/lib/bunny";
import { requireCreator } from "@/lib/bunny-auth";

export const runtime = "nodejs";

/**
 * Step 1 of the upload flow. Creates a Bunny Stream video slot and returns
 * TUS resumable-upload credentials. The browser then uploads the raw file
 * bytes directly to Bunny using those credentials, so the Bunny API key is
 * never exposed to the client.
 */
export async function POST(req: NextRequest) {
  const session = await requireCreator();
  if (!session) {
    return NextResponse.json(
      { error: "Sign in with an approved creator account to upload." },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { title?: string; thumbnailTime?: number };

  try {
    const video = await createBunnyVideo(body.title || "Untitled Video", body.thumbnailTime);
    const tus = getTusUploadCredentials(video.guid);
    return NextResponse.json({
      videoId: video.guid,
      libraryId: tus.libraryId,
      expirationTime: tus.expirationTime,
      signature: tus.signature,
      title: video.title,
    });
  } catch (e) {
    console.error("bunny/create failed:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}