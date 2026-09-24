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

interface AddEpisodeBody {
  seriesId: string;
  bunnyVideoId: string;
  title: string;
  seasonNumber: number;
  isNewSeason?: boolean;
  monetizationType?: "free" | "premium";
  unlockPrice?: number;
  thumbnail?: string;
}

/**
 * POST /api/creator/add-episode
 *
 * Adds a new episode to an existing series. Auto-calculates the next episode
 * number from the database so the creator never has to worry about numbering.
 */
export async function POST(req: NextRequest) {
  const gate = await gateCreator();
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.reason === "unauthenticated" ? "Unauthorized" : "Forbidden" },
      { status: gate.reason === "unauthenticated" ? 401 : 403 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as AddEpisodeBody;

  if (!body.seriesId || !body.bunnyVideoId || !body.title?.trim()) {
    return NextResponse.json(
      { error: "seriesId, bunnyVideoId, and title are required." },
      { status: 400 }
    );
  }

  const service = getServiceClient();

  // 1. Verify this series belongs to the calling creator
  const { data: seriesRow, error: seriesErr } = await service
    .from("series")
    .select("id, title, creator_id, status, genre, language, country, monetization")
    .eq("id", body.seriesId)
    .eq("creator_id", gate.session.creatorProfileId)
    .maybeSingle();

  if (seriesErr || !seriesRow) {
    return NextResponse.json(
      { error: "Series not found or access denied." },
      { status: 404 }
    );
  }

  const series = seriesRow as {
    id: string;
    title: string;
    creator_id: string;
    status: string;
    genre: string[];
    language: string;
    country: string;
    monetization: string;
  };

  const seasonNumber = Math.max(1, Number(body.seasonNumber ?? 1));
  const monetization = body.monetizationType === "premium" ? "premium" : "free";
  const unlockPrice = monetization === "premium" ? Math.max(0, Number(body.unlockPrice ?? 50)) : 0;
  const thumbnail = body.thumbnail?.trim() || null;
  const bunnyVideoId = body.bunnyVideoId.trim();
  const title = body.title.trim();
  const hls = bunnyHlsUrl(bunnyVideoId);
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID ?? null;

  try {
    // 2. Idempotency check: don't create a duplicate video row
    const { data: existing } = await service
      .from("videos")
      .select("id")
      .eq("bunny_video_id", bunnyVideoId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "This video was already saved.", alreadyExists: true },
        { status: 409 }
      );
    }

    // 3. Ensure the season row exists (upsert so adding to existing season is safe)
    const { data: seasonRow } = await service
      .from("seasons")
      .upsert(
        {
          series_id: body.seriesId,
          season_number: seasonNumber,
          title: `Season ${seasonNumber}`,
        },
        { onConflict: "series_id,season_number" }
      )
      .select("id")
      .single();

    // 4. Compute the next episode number for this series + season
    const { data: maxEpRow } = await service
      .from("episodes")
      .select("episode_number")
      .eq("series_id", body.seriesId)
      .eq("season_number", seasonNumber)
      .order("episode_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextEpisodeNumber = ((maxEpRow as { episode_number: number } | null)?.episode_number ?? 0) + 1;

    // 5. Create the video row
    const slugSuffix = bunnyVideoId.slice(0, 8);
    const { data: videoRow, error: videoErr } = await service
      .from("videos")
      .insert({
        slug: slugify(title, slugSuffix),
        title,
        description: "",
        type: "series",
        origin: "human",
        status: "processing",
        monetization,
        unlock_price: unlockPrice,
        age_rating: "PG",
        genre: series.genre ?? [],
        language: series.language ?? "English",
        country: series.country ?? "NG",
        tags: [],
        creator_id: gate.session.creatorProfileId,
        series_id: body.seriesId,
        bunny_video_id: bunnyVideoId,
        bunny_library_id: libraryId,
        hls_url: hls,
        video_url: hls,
        thumbnail,
        thumbnail_urls: thumbnail ? [thumbnail] : [],
        processing_status: "pending",
      })
      .select("id")
      .single();

    if (videoErr || !videoRow) {
      throw new Error("Failed to create video record: " + (videoErr?.message ?? "unknown"));
    }

    const videoId = (videoRow as { id: string }).id;

    // 6. Create the episode row
    const { data: episodeRow, error: episodeErr } = await service
      .from("episodes")
      .insert({
        series_id: body.seriesId,
        season_number: seasonNumber,
        episode_number: nextEpisodeNumber,
        title,
        description: "",
        thumbnail,
        video_id: videoId,
        monetization,
        unlock_price: unlockPrice,
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (episodeErr || !episodeRow) {
      throw new Error("Failed to create episode record: " + (episodeErr?.message ?? "unknown"));
    }

    const episodeId = (episodeRow as { id: string }).id;

    // 7. Back-link the video to its episode + update season episode_count
    await Promise.all([
      service
        .from("videos")
        .update({ episode_id: episodeId })
        .eq("id", videoId),
      service
        .rpc("increment_season_episode_count", {
          p_series_id: body.seriesId,
          p_season_number: seasonNumber,
        })
        .then(
          () => null,
          () => null
        ), // best-effort; RPC may not exist
    ]);

    return NextResponse.json({
      videoId,
      episodeId,
      episodeNumber: nextEpisodeNumber,
      seasonNumber,
      watchUrl: `/watch/${videoId}`,
    });
  } catch (e) {
    console.error("add-episode failed:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
