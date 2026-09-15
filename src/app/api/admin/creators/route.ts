import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  if (!(await isAdminUser(supabase))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("creator_profiles")
    .select("id, user_id, username, display_name, status, verified, followers_count, total_views, total_videos, country, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = [
    ...new Set(
      (data ?? []).map((c) => (c as { user_id: string | null }).user_id).filter(Boolean) as string[]
    ),
  ];
  const emailsMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: users } = await supabase.from("users").select("id, email").in("id", userIds);
    for (const u of users ?? []) {
      emailsMap[(u as { id: string }).id] = (u as { email: string }).email;
    }
  }

  const creators = (data ?? []).map((c) => {
    const row = c as {
      id: string;
      user_id: string | null;
      username: string;
      display_name: string;
      status: string;
      verified: boolean;
      followers_count: number;
      total_views: number;
      total_videos: number;
      country: string;
      created_at: string;
    };
    return {
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      email: row.user_id ? emailsMap[row.user_id] ?? "—" : "—",
      status: row.status,
      verified: row.verified,
      followers: row.followers_count ?? 0,
      views: row.total_views ?? 0,
      videos: row.total_videos ?? 0,
      country: row.country,
      createdAt: row.created_at,
    };
  });

  return NextResponse.json({ creators });
}