import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id ?? null;
    const { searchParams } = new URL(req.url);
    const seriesId = searchParams.get("seriesId");

    if (!seriesId) {
      return NextResponse.json({ error: "seriesId required" }, { status: 400 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const seriesIsUuid = uuidRegex.test(seriesId);

    if (!seriesIsUuid) {
      return NextResponse.json({ error: "Invalid seriesId format" }, { status: 400 });
    }

    // Verify series exists and is completed
    const { data: series, error: seriesError } = await supabase
      .from("series")
      .select("id, completed, status, title")
      .eq("id", seriesId)
      .maybeSingle();

    if (seriesError || !series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    if (!series.completed || series.status !== "published") {
      return NextResponse.json(
        { error: "Series is not completed or not published" },
        { status: 400 }
      );
    }

    // If user is authenticated, calculate personalized bulk price
    if (userId) {
      const { data, error } = await supabase.rpc("calculate_series_bulk_price", {
        p_user_id: userId,
        p_series_id: seriesId,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data?.[0] ?? {
        total_episodes: 0,
        unlocked_episodes: 0,
        remaining_episodes: 0,
        total_price: 0,
        bulk_price: 0,
        discount_percent: 30,
      });
    }

    // Guest - return full price
    const { data: episodes } = await supabase
      .from("episodes")
      .select("unlock_price")
      .eq("series_id", seriesId);

    const totalPrice = episodes?.reduce((sum, e) => sum + (e.unlock_price ?? 0), 0) ?? 0;
    const episodeCount = episodes?.length ?? 0;

    return NextResponse.json({
      total_episodes: episodeCount,
      unlocked_episodes: 0,
      remaining_episodes: episodeCount,
      total_price: totalPrice,
      bulk_price: Math.max(Math.floor(totalPrice * 0.7), 100),
      discount_percent: 30,
    });
  } catch (err) {
    console.error("Bulk price API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}