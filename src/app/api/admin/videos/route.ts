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
    .from("videos")
    .select("id, title, views, likes, status, monetization, type, created_at, published_at, creator_id")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const creatorIds = [
    ...new Set(
      (data ?? [])
        .map((v) => (v as { creator_id: string | null }).creator_id)
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

  const videos = (data ?? []).map((v) => {
    const row = v as {
      id: string;
      title: string;
      views: number;
      likes: number;
      status: string;
      monetization: string;
      type: string;
      created_at: string;
      published_at: string | null;
      creator_id: string | null;
    };
    return {
      id: row.id,
      title: row.title,
      views: row.views ?? 0,
      likes: row.likes ?? 0,
      status: row.status,
      monetization: row.monetization,
      type: row.type,
      createdAt: row.created_at,
      publishedAt: row.published_at,
      creator: row.creator_id ? creatorsMap[row.creator_id] : "—",
    };
  });

  return NextResponse.json({ videos });
}