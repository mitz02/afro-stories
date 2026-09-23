import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to request a withdrawal." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "No creator profile found." }, { status: 404 });
  }
  const profileId = (profile as { id: string }).id;

  const body = (await req.json().catch(() => ({}))) as {
    amountNaira?: number;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };

  const amountNaira = Math.floor(Number(body.amountNaira));
  const bankName = body.bankName?.trim();
  const accountNumber = body.accountNumber?.trim();
  const accountName = body.accountName?.trim();

  if (!amountNaira || amountNaira < 10000) {
    return NextResponse.json(
      { error: "Minimum withdrawal is ₦10,000." },
      { status: 400 }
    );
  }
  if (!bankName || !accountNumber || !accountName) {
    return NextResponse.json(
      { error: "Bank name, account number and account name are required." },
      { status: 400 }
    );
  }

  const svc = getServiceClient();

  const { data, error } = await svc
    .from("withdrawals")
    .insert({
      creator_id: profileId,
      amount: amountNaira * 100, // stored in kobo
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      status: "pending",
    })
    .select("id, amount, bank_name, status, created_at")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ withdrawal: data });
}