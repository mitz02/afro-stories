import { NextResponse, type NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

/**
 * GET /api/series/[id]/episodes
 *
 * Public endpoint — returns the full episode list for a series so the
 * watch page can render the episode sidebar for real (Bunny-uploaded) series.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: seriesId } = await params;
  if (!seriesId) {
    return NextResponse.json({ error: "Missing series id." }, { status: 400 });
  }

  const service = getServiceClient();

  try {
    // Fetch series metadata
    const { data: seriesData, error: seriesErr } = await service
      .from("series")
      .select("id, title, description, cover_image, cover_gradient, status, genre, language, country, age_rating, monetization, total_views, total_likes, created_at, updated_at")
      .eq("id", seriesId)
      .maybeSingle();

    if (seriesErr || !seriesData) {
      return NextResponse.json({ error: "Series not found." }, { status: 404 });
    }

    const series = seriesData as Record<string, unknown>;

    // Fetch all seasons
    const { data: seasonsData } = await service
      .from("seasons")
      .select("id, series_id, season_number, title, description, episode_count")
      .eq("series_id", seriesId)
      .order("season_number", { ascending: true });

    // Fetch all episodes with their video info
    const { data: episodesData, error: episodesErr } = await service
      .from("episodes")
      .select("id, series_id, season_number, episode_number, title, description, thumbnail, video_id, duration, monetization, unlock_price, views, likes, published_at")
      .eq("series_id", seriesId)
      .order("season_number", { ascending: true })
      .order("episode_number", { ascending: true });

    if (episodesErr) {
      return NextResponse.json({ error: episodesErr.message }, { status: 500 });
    }

    const episodes = (episodesData ?? []).map((ep) => {
      const row = ep as Record<string, unknown>;
      return {
        id: row.id as string,
        seriesId: row.series_id as string,
        seasonNumber: row.season_number as number,
        episodeNumber: row.episode_number as number,
        title: row.title as string,
        description: (row.description as string) ?? "",
        thumbnail: (row.thumbnail as string | null) ?? null,
        thumbnailGradient: null,
        videoId: row.video_id as string,
        duration: (row.duration as number) ?? 0,
        monetization: (row.monetization as string) === "premium" ? "premium" : "free",
        unlockPrice: (row.unlock_price as number) ?? 0,
        views: (row.views as number) ?? 0,
        likes: (row.likes as number) ?? 0,
        comments: 0,
        publishedAt: (row.published_at as string) ?? new Date().toISOString(),
      };
    });

    const seasons = (seasonsData ?? []).map((s) => {
      const row = s as Record<string, unknown>;
      const seasonEps = episodes.filter((e) => e.seasonNumber === (row.season_number as number));
      return {
        id: row.id as string,
        seriesId: row.series_id as string,
        seasonNumber: row.season_number as number,
        title: (row.title as string) ?? `Season ${row.season_number}`,
        description: (row.description as string) ?? "",
        episodeCount: seasonEps.length,
      };
    });

    // Build a Series-shaped object that the watch page can use directly
    const seriesObj = {
      id: series.id as string,
      slug: (series.id as string),
      title: series.title as string,
      description: (series.description as string) ?? "",
      coverImage: (series.cover_image as string) ?? "",
      coverGradient: (series.cover_gradient as string) ?? undefined,
      creatorId: "",
      country: (series.country as string) ?? "NG",
      genre: (series.genre as string[]) ?? [],
      language: (series.language as string) ?? "English",
      ageRating: (series.age_rating as string) ?? "PG",
      status: (series.status as string) ?? "published",
      totalViews: (series.total_views as number) ?? 0,
      totalLikes: (series.total_likes as number) ?? 0,
      followers: 0,
      featured: false,
      completed: false,
      averageEpisodeDuration: 0,
      monetization: (series.monetization as string) ?? "free",
      seasons,
      createdAt: (series.created_at as string) ?? new Date().toISOString(),
      updatedAt: (series.updated_at as string) ?? new Date().toISOString(),
    };

    return NextResponse.json({ series: seriesObj, episodes, seasons });
  } catch (e) {
    console.error("series/episodes failed:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
