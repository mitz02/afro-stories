import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

export async function POST(req: NextRequest) {
  if (!PAYSTACK_SECRET) {
    return NextResponse.json(
      { error: "Paystack not configured." },
      { status: 500 }
    );
  }

  const { packageId } = (await req.json().catch(() => ({}))) as {
    packageId?: string;
  };
  if (!packageId) {
    return NextResponse.json(
      { error: "Missing packageId." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const userEmail = session.user.email ?? "";

  // Resolve the package from the DB (authoritative price in kobo)
  const { data: pkg, error: pkgError } = await supabase
    .from("point_packages")
    .select("id, points, price, bonus, active")
    .eq("id", packageId)
    .eq("active", true)
    .maybeSingle();
  if (pkgError || !pkg) {
    return NextResponse.json(
      { error: "Invalid package." },
      { status: 400 }
    );
  }

  const reference = `AFT-${crypto.randomUUID().replace(/-/g, "")}`;
  const bonus = pkg.bonus ?? 0;

  // Record the payment intent so credit is idempotent
  const service = getServiceClient();
  const { error: intentError } = await service.from("point_payments").insert({
    user_id: session.user.id,
    package_id: pkg.id,
    reference,
    amount_kobo: pkg.price,
    points: pkg.points,
    bonus,
  });
  if (intentError) {
    return NextResponse.json(
      { error: "Could not start payment." },
      { status: 500 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    new URL(req.url).origin;
  const callbackUrl = `${baseUrl}/payments/callback?reference=${reference}`;

  const paystackRes = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        amount: pkg.price,
        currency: "NGN",
        reference,
        callback_url: callbackUrl,
        metadata: {
          user_id: session.user.id,
          package_id: pkg.id,
        },
      }),
    }
  );

  const paystack = (await paystackRes.json().catch(() => ({}))) as {
    status?: boolean;
    data?: { authorization_url?: string; reference?: string };
    message?: string;
  };

  if (!paystack.status || !paystack.data?.authorization_url) {
    return NextResponse.json(
      { error: paystack.message ?? "Paystack could not initialize the payment." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    authorizationUrl: paystack.data.authorization_url,
    reference: paystack.data.reference ?? reference,
  });
}