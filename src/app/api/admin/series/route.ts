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
    .from("series")
    .select("id, title, status, total_views, total_likes, followers_count, completed, monetization, created_at, creator_id")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const creatorIds = [
    ...new Set(
      (data ?? [])
        .map((s) => (s as { creator_id: string | null }).creator_id)
        .filter(Boolean) as string[]
    ),
  ];
  const creatorsMap: Record<string, string> = {};
  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("creator_profiles")
      .select("id, display_name")
      .in("id", creatorIds);
    for (const p of profiles ?? []) {
      creatorsMap[(p as { id: string }).id] = (
        p as { display_name: string | null }
      ).display_name ?? "Unknown";
    }
  }

  const series = (data ?? []).map((s) => {
    const row = s as {
      id: string;
      title: string;
      status: string;
      total_views: number;
      total_likes: number;
      followers_count: number;
      completed: boolean;
      monetization: string;
      created_at: string;
      creator_id: string | null;
    };
    return {
      id: row.id,
      title: row.title,
      status: row.status,
      views: row.total_views ?? 0,
      likes: row.total_likes ?? 0,
      followers: row.followers_count ?? 0,
      completed: row.completed,
      monetization: row.monetization,
      createdAt: row.created_at,
      creator: row.creator_id ? creatorsMap[row.creator_id] : "—",
    };
  });

  return NextResponse.json({ series });
}