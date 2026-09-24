import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to unlock premium content." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = (await req.json().catch(() => ({}))) as {
      episodeId?: string;
      videoId?: string;
      price?: number;
      episodeTitle?: string;
      seriesId?: string;
      unlockType?: "episode" | "series";
    };

    const { episodeId, videoId, price, episodeTitle, seriesId, unlockType = "episode" } = body;

    if (!videoId || typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "Missing required fields: videoId, price." },
        { status: 400 }
      );
    }

    if (unlockType === "series" && !seriesId) {
      return NextResponse.json(
        { error: "seriesId required for series unlock." },
        { status: 400 }
      );
    }

    if (unlockType === "episode" && !episodeId) {
      return NextResponse.json(
        { error: "episodeId required for episode unlock." },
        { status: 400 }
      );
    }

    const { data: walletRows } = await supabase.rpc("get_user_wallet_balance", {
      p_user_id: userId,
    });

    const currentBalance: number = walletRows?.[0]?.balance ?? 0;

    if (currentBalance < price) {
      return NextResponse.json(
        {
          error: "Insufficient points. Please top up your wallet.",
          balance: currentBalance,
          required: price,
        },
        { status: 402 }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const videoIsUuid = uuidRegex.test(videoId);
    const episodeIsUuid = episodeId ? uuidRegex.test(episodeId) : false;
    const seriesIsUuid = seriesId ? uuidRegex.test(seriesId) : false;

    let unlockResult = false;
    let unlockError: string | null = null;

    if (unlockType === "series" && seriesIsUuid && videoIsUuid) {
      // Series bulk unlock
      const { data, error } = await supabase.rpc("unlock_series", {
        p_user_id: userId,
        p_series_id: seriesId,
        p_price: price,
      });

      if (error) {
        unlockError = error.message ?? "Failed to unlock series.";
      } else {
        unlockResult = data ?? false;
      }
    } else if (unlockType === "episode" && episodeIsUuid && videoIsUuid) {
      // Episode unlock - verify episode exists in DB
      const { data: episode } = await supabase
        .from("episodes")
        .select("id")
        .eq("id", episodeId)
        .maybeSingle();

      if (episode) {
        const { data, error } = await supabase.rpc("unlock_episode", {
          p_user_id: userId,
          p_episode_id: episodeId,
          p_video_id: videoId,
          p_price: price,
        });

        if (error) {
          unlockError = error.message ?? "Failed to unlock episode.";
        } else {
          unlockResult = data ?? false;
        }
      } else {
        // Episode doesn't exist in DB (standalone video or mock data): fall back to manual
        const description = episodeTitle
          ? `Unlocked "${episodeTitle}"`
          : "Unlocked premium episode";

        const { error: txError } = await supabase.from("point_transactions").insert({
          user_id: userId,
          type: "unlock",
          amount: -price,
          description,
          status: "success",
          completed_at: new Date().toISOString(),
        });

        if (txError) {
          console.warn("Failed to record point_transaction:", txError.message);
        }

        const { error: deductError } = await supabase.rpc("deduct_points", {
          p_user_id: userId,
          p_amount: price,
          p_description: description,
          p_reference: `unlock_${episodeId}`,
        });

        if (deductError) {
          unlockError = deductError.message ?? "Failed to deduct points.";
        } else {
          unlockResult = true;
        }
      }
    } else {
      // Mock / non-UUID IDs: just record a point_transaction manually
      const description = episodeTitle
        ? `Unlocked "${episodeTitle}"`
        : unlockType === "series"
        ? "Unlocked full series"
        : "Unlocked premium episode";

      const { error: txError } = await supabase.from("point_transactions").insert({
        user_id: userId,
        type: "unlock",
        amount: -price,
        description,
        status: "success",
        completed_at: new Date().toISOString(),
      });

      if (txError) {
        console.warn("Failed to record point_transaction:", txError.message);
      }

      const { error: deductError } = await supabase.rpc("deduct_points", {
        p_user_id: userId,
        p_amount: price,
        p_description: description,
        p_reference: `unlock_${episodeId ?? seriesId ?? videoId}`,
      });

      if (deductError) {
        return NextResponse.json(
          { error: deductError.message ?? "Failed to deduct points." },
          { status: 500 }
        );
      }

      unlockResult = true;
    }

    if (unlockError) {
      return NextResponse.json({ error: unlockError }, { status: 500 });
    }

    if (!unlockResult) {
      return NextResponse.json(
        { error: "Insufficient points or content already unlocked." },
        { status: 402 }
      );
    }

    // Insert unlock notification for user
    void supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type: "unlock",
        title: unlockType === "series" ? "Series Unlocked! 🎉" : "Episode Unlocked! 🎉",
        message: unlockType === "series"
          ? `You unlocked the full series (${price} points deducted).`
          : `You unlocked "${episodeTitle ?? "Premium Episode"}" (${price} points deducted).`,
        link: `/watch/${videoId}`,
        read: false,
      })
      .then(
        () => undefined,
        () => undefined
      );

    const { data: updatedWallet } = await supabase.rpc("get_user_wallet_balance", {
      p_user_id: userId,
    });

    const newBalance: number = updatedWallet?.[0]?.balance ?? Math.max(0, currentBalance - price);

    return NextResponse.json({ success: true, balance: newBalance, unlockType });
  } catch (err) {
    console.error("Unlock API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}