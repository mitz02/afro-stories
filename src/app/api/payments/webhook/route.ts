import { createHmac } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";
  if (!secret || !signature) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = (await JSON.parse(rawBody).catch(() => ({}))) as {
    event?: string;
    data?: { reference?: string; status?: string };
  };

  if (event.event === "charge.success" && event.data?.reference) {
    const service = getServiceClient();

    // Look up the intent row by reference to get the authoritative owner.
    const { data: payment } = await service
      .from("point_payments")
      .select("user_id")
      .eq("reference", event.data.reference)
      .maybeSingle();

    if (payment) {
      await service.rpc("credit_point_payment", {
        p_user_id: payment.user_id,
        p_reference: event.data.reference,
      });
    }
  }

  return NextResponse.json({ received: true });
}