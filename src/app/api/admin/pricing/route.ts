import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface PackageInput {
  id: string;
  points: number;
  priceNaira: number; // editor works in naira; DB stores kobo
  bonus: number;
  popular: boolean;
  active: boolean;
  sortOrder: number;
}

export async function GET() {
  const supabase = await createClient();
  if (!(await isAdminUser(supabase))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("point_packages")
    .select("id, points, price, bonus, popular, active, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const packages = (data ?? []).map((p) => {
    const row = p as {
      id: string;
      points: number;
      price: number;
      bonus: number;
      popular: boolean;
      active: boolean;
      sort_order: number;
    };
    return {
      id: row.id,
      points: row.points,
      priceNaira: Math.round(row.price / 100), // kobo -> naira
      bonus: row.bonus ?? 0,
      popular: row.popular ?? false,
      active: row.active ?? true,
      sortOrder: row.sort_order ?? 0,
    };
  });

  return NextResponse.json({ packages });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!(await isAdminUser(supabase))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    packages?: PackageInput[];
  };
  const packages = body.packages;
  if (!Array.isArray(packages) || packages.length === 0) {
    return NextResponse.json({ error: "Missing packages." }, { status: 400 });
  }

  const rows = packages.map((p) => ({
    id: p.id,
    points: Math.max(1, Math.round(p.points)),
    price: Math.max(1, Math.round(p.priceNaira * 100)), // naira -> kobo
    bonus: Math.max(0, Math.round(p.bonus)),
    popular: Boolean(p.popular),
    active: Boolean(p.active),
    sort_order: Math.round(p.sortOrder),
  }));

  const { data, error } = await supabase
    .from("point_packages")
    .upsert(rows, { onConflict: "id" })
    .select("id, points, price, bonus, popular, active, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const saved = (data ?? []).map((p) => {
    const row = p as {
      id: string;
      points: number;
      price: number;
      bonus: number;
      popular: boolean;
      active: boolean;
      sort_order: number;
    };
    return {
      id: row.id,
      points: row.points,
      priceNaira: Math.round(row.price / 100),
      bonus: row.bonus ?? 0,
      popular: row.popular ?? false,
      active: row.active ?? true,
      sortOrder: row.sort_order ?? 0,
    };
  });

  return NextResponse.json({ packages: saved });
}