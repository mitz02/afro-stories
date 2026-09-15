import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllFlags } from "@/lib/supabase/features";
import { isAdminUser } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const VALID_KEYS = new Set([
  "views_tracking_enabled",
  "likes_enabled",
  "comments_enabled",
  "follows_enabled",
]);

export async function GET() {
  const supabase = await createClient();
  if (!(await isAdminUser(supabase))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const flags = await getAllFlags();
  return NextResponse.json({ flags });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!(await isAdminUser(supabase))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = (await req.json().catch(() => ({}))) as {
    key?: string;
    value?: unknown;
  };
  const key = body.key;
  if (!key || !VALID_KEYS.has(key)) {
    return NextResponse.json({ error: "Unknown setting key." }, { status: 400 });
  }
  const value = Boolean(body.value);

  const { error } = await supabase.from("app_settings").upsert(
    { key, value, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const flags = await getAllFlags();
  return NextResponse.json({ flags, updated: { key, value } });
}