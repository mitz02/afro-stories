import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
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

    // Parse request body
    const body = (await req.json()) as {
      episodeId?: string;
      videoId?: string;
      price?: number;
      episodeTitle?: string;
    };

    const { episodeId, videoId, price, episodeTitle } = body;

    if (!episodeId || !videoId || typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "Missing required fields: episodeId, videoId, price." },
        { status: 400 }
      );
    }

    // Check current wallet balance
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

    // Try to parse UUIDs — episode IDs from mock data may not be real UUIDs,
    // so we use a best-effort approach: call the RPC if the IDs look like UUIDs,
    // otherwise fall back to manually recording the point deduction.
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const episodeIsUuid = uuidRegex.test(episodeId);
    const videoIsUuid = uuidRegex.test(videoId);

    if (episodeIsUuid && videoIsUuid) {
      // Use the dedicated DB function (deducts points + records earnings)
      const { data: unlockResult, error: unlockError } = await supabase.rpc(
        "unlock_episode",
        {
          p_user_id: userId,
          p_episode_id: episodeId,
          p_video_id: videoId,
          p_price: price,
        }
      );

      if (unlockError) {
        return NextResponse.json(
          { error: unlockError.message ?? "Failed to unlock episode." },
          { status: 500 }
        );
      }

      if (unlockResult === false) {
        return NextResponse.json(
          { error: "Insufficient points or episode already unlocked." },
          { status: 402 }
        );
      }
    } else {
      // Mock / non-UUID IDs: just record a point_transaction manually
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
        // Not a hard failure — still let the client deduct locally
        console.warn("Failed to record point_transaction:", txError.message);
      }

      // Deduct from wallet
      const { error: deductError } = await supabase.rpc("deduct_points", {
        p_user_id: userId,
        p_amount: price,
        p_description: description,
        p_reference: `unlock_${episodeId}`,
      });

      if (deductError) {
        return NextResponse.json(
          { error: deductError.message ?? "Failed to deduct points." },
          { status: 500 }
        );
      }
    }

    // Insert unlock notification for user
    void supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type: "unlock",
        title: "Episode Unlocked 🎉",
        message: `You unlocked "${episodeTitle ?? "Premium Episode"}" (${price} points deducted).`,
        link: `/watch/${videoId}`,
        read: false,
      })
      .then(
        () => undefined,
        () => undefined
      );

    // Return updated balance
    const { data: updatedWallet } = await supabase.rpc("get_user_wallet_balance", {
      p_user_id: userId,
    });

    const newBalance: number = updatedWallet?.[0]?.balance ?? Math.max(0, currentBalance - price);

    return NextResponse.json({ success: true, balance: newBalance });
  } catch (err) {
    console.error("Unlock API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
