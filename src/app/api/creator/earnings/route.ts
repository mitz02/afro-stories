import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

interface EarningRow {
  id: string;
  amount: number;
  net_earnings: number;
  created_at: string;
  video_id: string;
  videos: { title: string } | null;
}

interface WithdrawalRow {
  id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short" });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to view earnings." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("id, display_name, payout_email")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "No creator profile found." }, { status: 404 });
  }
  const p = profile as { id: string; display_name: string | null; payout_email: string | null };
  const profileId = p.id;

  const svc = getServiceClient();

  const [earningsRes, withdrawalsRes] = await Promise.all([
    svc
      .from("creator_earnings")
      .select("id, amount, net_earnings, created_at, video_id, videos(title)")
      .eq("creator_id", profileId)
      .order("created_at", { ascending: false }),
    svc
      .from("withdrawals")
      .select("*")
      .eq("creator_id", profileId)
      .order("created_at", { ascending: false }),
  ]);

  const earnings = (earningsRes.data ?? []) as unknown as EarningRow[];
  const withdrawals = (withdrawalsRes.data ?? []) as unknown as WithdrawalRow[];

  const totalEarningsKobo = earnings.reduce((a, e) => a + (e.net_earnings ?? 0), 0);
  const pointsEarned = earnings.reduce((a, e) => a + (e.amount ?? 0), 0);
  const completedKobo = withdrawals
    .filter((w) => w.status === "completed")
    .reduce((a, w) => a + (w.amount ?? 0), 0);
  const pendingKobo = withdrawals
    .filter((w) => w.status === "pending" || w.status === "processing")
    .reduce((a, w) => a + (w.amount ?? 0), 0);
  const availableKobo = totalEarningsKobo - completedKobo;

  const toNaira = (kobo: number) => Math.round(kobo) / 100;

  const transactions = [
    ...earnings.map((e) => ({
      id: e.id,
      type: "unlock" as const,
      title: e.videos?.title ?? "Episode unlock",
      amount: toNaira(e.net_earnings ?? 0),
      date: e.created_at,
      status: "settled" as const,
    })),
    ...withdrawals.map((w) => ({
      id: w.id,
      type: "withdrawal" as const,
      title: `Withdrawal to ${w.bank_name}`,
      amount: -toNaira(w.amount ?? 0),
      date: w.created_at,
      status: w.status as "pending" | "processing" | "completed" | "failed",
    })),
  ].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Month chart: last 6 months zero-filled, real values bucketed in.
  const now = new Date();
  const bucketed: Record<string, number> = {};
  for (const e of earnings) {
    const label = monthLabel(e.created_at);
    bucketed[label] = (bucketed[label] ?? 0) + toNaira(e.net_earnings ?? 0);
  }
  const chart: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString(undefined, { month: "short" });
    chart.push({ label, value: Math.round((bucketed[label] ?? 0) * 100) / 100 });
  }

  return NextResponse.json({
    summary: {
      available: toNaira(Math.max(availableKobo, 0)),
      pending: toNaira(pendingKobo),
      total: toNaira(totalEarningsKobo),
      points: pointsEarned,
    },
    transactions,
    chart,
    profile: {
      displayName: p.display_name,
      payoutEmail: p.payout_email,
    },
    bank:
      withdrawals.length > 0
        ? {
            bankName: withdrawals[0].bank_name,
            accountName: withdrawals[0].account_name,
            accountNumber: withdrawals[0].account_number,
          }
        : null,
  });
}