import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  if (!(await isAdminUser(supabase))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const [
    videoCount,
    viewsSum,
    likesSum,
    commentCount,
    followCount,
    topVideos,
  ] = await Promise.all([
    supabase.from("videos").select("id", { count: "exact", head: true }),
    supabase.from("videos").select("views").gt("views", 0),
    supabase.from("videos").select("likes").gt("likes", 0),
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase.from("follows").select("id", { count: "exact", head: true }),
    supabase
      .from("videos")
      .select("id, title, views, likes, status, creator_id")
      .order("views", { ascending: false })
      .limit(10),
  ]);

  const totalViews = (viewsSum.data ?? []).reduce(
    (acc: number, v) => acc + (Number((v as { views: number }).views) || 0),
    0
  );
  const totalLikes = (likesSum.data ?? []).reduce(
    (acc: number, l) => acc + (Number((l as { likes: number }).likes) || 0),
    0
  );

  // Resolve creator display names for the top videos.
  const creatorIds = [
    ...new Set(
      (topVideos.data ?? []).map(
        (v) => (v as { creator_id: string | null }).creator_id
      ).filter(Boolean) as string[]
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

  const videos = (topVideos.data ?? []).map((v) => {
    const row = v as {
      id: string;
      title: string;
      views: number;
      likes: number;
      status: string;
      creator_id: string | null;
    };
    return {
      id: row.id,
      title: row.title,
      views: row.views ?? 0,
      likes: row.likes ?? 0,
      status: row.status,
      creator: row.creator_id ? creatorsMap[row.creator_id] : "—",
    };
  });

  return NextResponse.json({
    totals: {
      videos: videoCount.count ?? 0,
      views: totalViews,
      likes: totalLikes,
      comments: commentCount.count ?? 0,
      follows: followCount.count ?? 0,
    },
    topVideos: videos,
  });
}