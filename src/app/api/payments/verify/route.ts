import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  if (!PAYSTACK_SECRET) {
    return NextResponse.json(
      { error: "Paystack not configured." },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    }
  );
  const paystack = (await paystackRes.json().catch(() => ({}))) as {
    status?: boolean;
    data?: { status?: string; amount?: number };
  };

  const paid =
    paystack.status === true && paystack.data?.status === "success";

  const { data, error } = await supabase.rpc("credit_point_payment", {
    p_user_id: session.user.id,
    p_reference: reference,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  const balance = Number(row?.new_balance ?? 0);
  const credited = Boolean(row?.success);

  return NextResponse.json({
    paid,
    credited,
    success: paid && credited,
    balance,
    message: row?.message ?? (paid ? "Payment confirmed." : "Payment not found."),
  });
}