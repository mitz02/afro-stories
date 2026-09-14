import { NextResponse, type NextRequest } from "next/server";
import { createBunnyVideo, getTusUploadCredentials } from "@/lib/bunny";
import { gateCreator } from "@/lib/bunny-auth";

export const runtime = "nodejs";

/**
 * Step 1 of the upload flow. Creates a Bunny Stream video slot and returns
 * TUS resumable-upload credentials. The browser then uploads the raw file
 * bytes directly to Bunny using those credentials, so the Bunny API key is
 * never exposed to the client.
 */
export async function POST(req: NextRequest) {
  const gate = await gateCreator();
  if (!gate.ok) {
    if (gate.reason === "unauthenticated") {
      return NextResponse.json(
        { error: "Your session expired. Please sign in again and retry the upload." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        error:
          "This account isn't an approved creator yet. Sign in with an approved creator account to upload.",
      },
      { status: 403 }
    );
  }
  const session = gate.session;

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