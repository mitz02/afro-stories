import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getServiceClient } from "@/lib/supabase/service-role";
import {
  getBunnyVideo,
  bunnyHlsUrl,
  bunnyThumbnailUrl,
  isBunnyFinished,
  isBunnyFailed,
} from "@/lib/bunny";

export const runtime = "nodejs";

/**
 * Bunny Stream webhook receiver. Bunny POSTs { VideoLibraryId, VideoGuid,
 * Status } whenever a video changes state. When encoding finishes (3/4) we
 * mark the matching Aafstories `videos` row as published; on failure (5) we
 * record the error. Signed webhooks are verified against BUNNY_WEBHOOK_SECRET
 * when configured.
 */
async function verifySignature(req: NextRequest, raw: string): Promise<boolean> {
  const secret = process.env.BUNNY_WEBHOOK_SECRET;
  if (!secret) return false;
  const version = req.headers.get("x-bunnystream-signature-version");
  const algorithm = req.headers.get("x-bunnystream-signature-algorithm");
  const signature = req.headers.get("x-bunnystream-signature");
  if (!signature || version !== "v1" || algorithm !== "hmac-sha256") return false;

  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const raw = await req.text();

  const secret = process.env.BUNNY_WEBHOOK_SECRET;
  if (secret) {
    const valid = await verifySignature(req, raw);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
  }

  let body: { VideoLibraryId?: number; VideoGuid?: string; Status?: number };
  try {
    body = JSON.parse(raw || "{}") as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { VideoGuid, Status } = body;
  if (!VideoGuid) {
    return NextResponse.json({ error: "Missing VideoGuid." }, { status: 400 });
  }

  const service = getServiceClient();

  // Find our row first — if Bunny still encodes a video we don't track, ack silently.
  const { data: existing } = await service
    .from("videos")
    .select(
      "id, status, processing_status, thumbnail, thumbnail_urls, series_id, episode_id"
    )
    .eq("bunny_video_id", VideoGuid)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ ok: true, ack: "untracked" });
  }

  if (isBunnyFailed(Number(Status))) {
    await service
      .from("videos")
      .update({
        processing_status: "failed",
        processing_error: `Bunny encoding failed (status ${Status}).`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    return NextResponse.json({ ok: true });
  }

  if (!isBunnyFinished(Number(Status))) {
    // Still queuing/encoding — we'll get the final status later.
    return NextResponse.json({ ok: true, ack: "processing" });
  }

  let details;
  try {
    details = await getBunnyVideo(VideoGuid);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }

  const thumbnailUrl = details.thumbnailCount > 0 ? bunnyThumbnailUrl(VideoGuid) : null;
  const hls = bunnyHlsUrl(VideoGuid);

  // Keep a creator-uploaded custom thumbnail; only fall back to Bunny's auto-generated frame when none was set.
  const hasCustomThumbnail = Boolean(existing.thumbnail);
  const resolvedThumbnail = hasCustomThumbnail ? existing.thumbnail : (thumbnailUrl ?? null);
  const resolvedThumbnails = hasCustomThumbnail
    ? existing.thumbnail_urls
    : thumbnailUrl
      ? [thumbnailUrl]
      : [];

  const publishedFromProcessing = existing.status === "processing";
  await service
    .from("videos")
    .update({
      processing_status: "completed",
      processing_error: null,
      duration: details.length ?? 0,
      hls_url: hls,
      video_url: hls,
      thumbnail_urls: resolvedThumbnails,
      thumbnail: resolvedThumbnail,
      status: publishedFromProcessing ? "published" : existing.status,
      ...(publishedFromProcessing ? { published_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  // Promote the parent series + linked episode row when this video goes live,
  // so `/my-series` and `/episodes` reflect published status immediately.
  if (publishedFromProcessing) {
    const publishedAt = new Date().toISOString();
    const row = existing as {
      series_id: string | null;
      episode_id: string | null;
    };

    if (row.episode_id) {
      await service
        .from("episodes")
        .update({
          duration: details.length ?? 0,
          published_at: publishedAt,
          updated_at: publishedAt,
        })
        .eq("id", row.episode_id)
        .is("video_id", existing.id);
    }

    if (row.series_id) {
      await service
        .from("series")
        .update({
          status: "published",
          average_episode_duration: details.length ?? 0,
          updated_at: publishedAt,
        })
        .eq("id", row.series_id)
        .eq("status", "processing");
    }
  }

  return NextResponse.json({ ok: true });
}