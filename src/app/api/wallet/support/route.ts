import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to support creators." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = (await req.json().catch(() => ({}))) as {
      creatorId?: string;
      videoId?: string;
      amount?: number;
      message?: string;
    };

    const { creatorId, videoId, amount, message } = body;

    if (!creatorId || !videoId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Missing required fields: creatorId, videoId, amount." },
        { status: 400 }
      );
    }

    const { data: walletRows } = await supabase.rpc("get_user_wallet_balance", {
      p_user_id: userId,
    });

    const currentBalance: number = walletRows?.[0]?.balance ?? 0;

    if (currentBalance < amount) {
      return NextResponse.json(
        {
          error: "Insufficient points. Please top up your wallet.",
          balance: currentBalance,
          required: amount,
        },
        { status: 402 }
      );
    }

    // Deduct points from supporter
    const { error: deductError } = await supabase.rpc("deduct_points", {
      p_user_id: userId,
      p_amount: amount,
      p_description: message ? `Support: ${message}` : `Supported creator`,
      p_reference: `support_${videoId}`,
    });

    if (deductError) {
      return NextResponse.json(
        { error: deductError.message ?? "Failed to deduct points." },
        { status: 500 }
      );
    }

    // Record point transaction
    await supabase.from("point_transactions").insert({
      user_id: userId,
      type: "support",
      amount: -amount,
      description: message ? `Support: ${message}` : "Supported creator",
      status: "success",
      completed_at: new Date().toISOString(),
    });

    // Add points to creator's earnings
    const serviceClient = getServiceClient();
    await serviceClient
      .from("creator_earnings")
      .insert({
        creator_id: creatorId,
        video_id: videoId,
        amount: amount,
        unlocked_by: userId,
        platform_commission: 0,
        net_earnings: amount,
      })
      .then(
        () => undefined,
        () => undefined
      );

    // Create notification for creator
    await serviceClient
      .from("notifications")
      .insert({
        user_id: creatorId,
        type: "support",
        title: "Someone supported you! 💛",
        message: `${message ? `Message: "${message}" ` : ""}${amount} points received from a viewer.`,
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

    const newBalance: number = updatedWallet?.[0]?.balance ?? Math.max(0, currentBalance - amount);

    return NextResponse.json({ success: true, balance: newBalance, amount });
  } catch (err) {
    console.error("Support API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}