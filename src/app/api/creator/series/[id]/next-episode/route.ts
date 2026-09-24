import { NextResponse, type NextRequest } from "next/server";
import { gateCreator } from "@/lib/bunny-auth";
import { getServiceClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

/**
 * GET /api/creator/series/[id]/next-episode?season=1
 *
 * Returns the next episode number for a given series + season, along with
 * the list of existing seasons so the Add Episode modal can populate itself.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await gateCreator();
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: gate.reason === "unauthenticated" ? 401 : 403 }
    );
  }

  const { id: seriesId } = await params;
  const service = getServiceClient();

  // Verify this series belongs to the calling creator
  const { data: seriesRow, error: seriesErr } = await service
    .from("series")
    .select("id, title, creator_id")
    .eq("id", seriesId)
    .eq("creator_id", gate.session.creatorProfileId)
    .maybeSingle();

  if (seriesErr || !seriesRow) {
    return NextResponse.json(
      { error: "Series not found or access denied." },
      { status: 404 }
    );
  }

  // Get all seasons for this series
  const { data: seasonsData } = await service
    .from("seasons")
    .select("id, season_number, title, episode_count")
    .eq("series_id", seriesId)
    .order("season_number", { ascending: true });

  const seasons = (seasonsData ?? []) as {
    id: string;
    season_number: number;
    title: string;
    episode_count: number;
  }[];

  // Determine the latest season number (or 1 if no seasons yet)
  const latestSeasonNumber =
    seasons.length > 0 ? seasons[seasons.length - 1].season_number : 1;

  // For each season, find the max episode number
  const { data: episodeCounts } = await service
    .from("episodes")
    .select("season_number, episode_number")
    .eq("series_id", seriesId)
    .order("season_number", { ascending: true })
    .order("episode_number", { ascending: true });

  const episodeCountMap: Record<number, number> = {};
  for (const ep of episodeCounts ?? []) {
    const row = ep as { season_number: number; episode_number: number };
    if (
      !episodeCountMap[row.season_number] ||
      row.episode_number > episodeCountMap[row.season_number]
    ) {
      episodeCountMap[row.season_number] = row.episode_number;
    }
  }

  // Next episode in the latest season
  const nextEpisodeNumber = (episodeCountMap[latestSeasonNumber] ?? 0) + 1;

  return NextResponse.json({
    seriesId,
    seriesTitle: (seriesRow as { title: string }).title,
    seasons,
    latestSeasonNumber,
    nextEpisodeNumber,
    episodeCountMap,
  });
}
