import { NextResponse, type NextRequest } from "next/server";
import { gateCreator } from "@/lib/bunny-auth";
import { getServiceClient } from "@/lib/supabase/service-role";
import { bunnyHlsUrl } from "@/lib/bunny";

export const runtime = "nodejs";

function slugify(value: string, suffix?: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return suffix ? `${slug}-${suffix}` : slug;
}

const COUNTRY_CODES = new Set([
  "NG", "GH", "KE", "ZA", "ET", "TZ", "UG", "RW", "SN", "CM",
  "ZW", "ZM", "EG", "MA", "CI", "BJ", "SL", "MZ", "AO", "MW",
]);

interface ConfirmBody {
  bunnyVideoId?: string;
  title?: string;
  description?: string;
  genre?: string;
  tags?: string;
  language?: string;
  country?: string;
  origin?: "ai_generated" | "ai_assisted" | "human";
  contentMode?: "single" | "series";
  monetizationType?: "free" | "premium";
  unlockPrice?: number;
  publishMode?: "draft" | "publish" | "schedule";
  seriesTitle?: string;
  seriesDescription?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  episodeDescription?: string;
  thumbnail?: string;
}

/**
 * Step 5 of the upload flow. Records the uploaded Bunny video in the
 * Aafstories `videos` table (creating the series/season/episode rows too when
 * the creator chose Series Episode mode). Encoding finishes asynchronously and
 * the Bunny webhook flips the row to `published`.
 */
export async function POST(req: NextRequest) {
  const gate = await gateCreator();
  if (!gate.ok) {
    const status = gate.reason === "unauthenticated" ? 401 : 403;
    const error =
      gate.reason === "unauthenticated"
        ? "Your session expired. Please sign in again and retry."
        : "This account isn't an approved creator yet. Sign in with an approved creator account to publish.";
    return NextResponse.json({ error }, { status });
  }
  const session = gate.session;

  const body = (await req.json().catch(() => ({}))) as ConfirmBody;
  const bunnyVideoId = body.bunnyVideoId?.trim();
  if (!bunnyVideoId) {
    return NextResponse.json({ error: "Missing bunnyVideoId." }, { status: 400 });
  }
  const title = (body.title ?? "Untitled Story").trim();
  if (title.length < 1) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const countryCode = COUNTRY_CODES.has(body.country ?? "") ? (body.country as string) : "NG";
  const monetization = body.monetizationType === "premium" ? "premium" : "free";
  const unlockPrice = monetization === "premium" ? Math.max(0, Number(body.unlockPrice ?? 50)) : 0;
  const origin = ["ai_generated", "ai_assisted", "human"].includes(body.origin ?? "")
    ? (body.origin as "ai_generated" | "ai_assisted" | "human")
    : "ai_assisted";
  const thumbnail = typeof body.thumbnail === "string" ? body.thumbnail.trim() : "";
  // Publish now -> the row is "processing" until Bunny finishes encoding, then
  // the webhook brings it live. Draft / schedule -> stays "draft".
  const publishMode: "draft" | "publish" | "schedule" =
    body.publishMode === "publish" || body.publishMode === "schedule"
      ? body.publishMode
      : "draft";
  const visibility = publishMode === "publish" ? "processing" : "draft";
  const hls = bunnyHlsUrl(bunnyVideoId);
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID ?? null;

  const service = getServiceClient();

  try {
    const slugSuffix = bunnyVideoId.slice(0, 8);
    const { data: videoRow, error: videoErr } = await service
      .from("videos")
      .insert({
        slug: slugify(title, slugSuffix),
        title,
        description: body.description ?? "",
        type: body.contentMode === "series" ? "series" : "single",
        origin,
        status: visibility,
        monetization,
        unlock_price: unlockPrice,
        age_rating: "PG",
        genre: body.genre ? [body.genre] : [],
        language: body.language || "English",
        country: countryCode,
        tags: (body.tags ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        creator_id: session.creatorProfileId,
        bunny_video_id: bunnyVideoId,
        bunny_library_id: libraryId,
        hls_url: hls,
        video_url: hls,
        thumbnail: thumbnail || null,
        thumbnail_urls: thumbnail ? [thumbnail] : [],
        processing_status: "pending",
      })
      .select("id")
      .single();

    if (videoErr || !videoRow) {
      throw new Error("Failed to create video record: " + (videoErr?.message ?? "unknown"));
    }
    const videoId = (videoRow as { id: string }).id;

    let seriesId: string | null = null;
    let episodeId: string | null = null;

    if (body.contentMode === "series" && body.seriesTitle?.trim()) {
      const { data: seriesRow } = await service
        .from("series")
        .insert({
          slug: slugify(body.seriesTitle, slugSuffix),
          title: body.seriesTitle.trim(),
          description: body.seriesDescription ?? "",
          cover_image: null,
          cover_gradient: null,
          creator_id: session.creatorProfileId,
          country: countryCode,
          genre: body.genre ? [body.genre] : [],
          language: body.language || "English",
          age_rating: "PG",
          status: visibility,
          monetization,
        })
        .select("id")
        .single();
      seriesId = seriesRow ? (seriesRow as { id: string }).id : null;

      if (seriesId) {
        const seasonNum = Math.max(1, Number(body.seasonNumber ?? 1));
        const { data: seasonRow } = await service
          .from("seasons")
          .insert({
            series_id: seriesId,
            season_number: seasonNum,
            title: `Season ${seasonNum}`,
          })
          .select("id")
          .single();
        const seasonId = seasonRow ? (seasonRow as { id: string }).id : null;

        const episodeNum = Math.max(1, Number(body.episodeNumber ?? 1));
        const { data: episodeRow } = await service
          .from("episodes")
          .insert({
            series_id: seriesId,
            season_number: seasonNum,
            episode_number: episodeNum,
            title: body.episodeTitle?.trim() || title,
            description: body.episodeDescription ?? "",
            thumbnail: null,
            video_id: videoId,
            monetization,
            unlock_price: unlockPrice,
            published_at: new Date().toISOString(),
          })
          .select("id")
          .single();
        episodeId = episodeRow ? (episodeRow as { id: string }).id : null;

        if (episodeId) {
          await service
            .from("videos")
            .update({ series_id: seriesId, episode_id: episodeId })
            .eq("id", videoId);
        }
      }
    }

    return NextResponse.json({
      videoId,
      slug: slugify(title, slugSuffix),
      title,
      seriesId,
      status: visibility,
      watchUrl: `/watch/${videoId}`,
    });
  } catch (e) {
    console.error("bunny/confirm failed:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}