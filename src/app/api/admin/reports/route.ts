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
    .from("reports")
    .select("id, video_id, reporter_id, category, description, status, created_at, resolved_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const videoIds = [
    ...new Set(
      (data ?? [])
        .map((r) => (r as { video_id: string | null }).video_id)
        .filter(Boolean) as string[]
    ),
  ];
  const reporterIds = [
    ...new Set(
      (data ?? [])
        .map((r) => (r as { reporter_id: string | null }).reporter_id)
        .filter(Boolean) as string[]
    ),
  ];
  const videosMap: Record<string, string> = {};
  const reportersMap: Record<string, string> = {};

  const [videosRes, reportersRes] = await Promise.all([
    videoIds.length > 0
      ? supabase.from("videos").select("id, title").in("id", videoIds)
      : Promise.resolve({ data: [] }),
    reporterIds.length > 0
      ? supabase.from("users").select("id, email").in("id", reporterIds)
      : Promise.resolve({ data: [] }),
  ]);
  for (const v of (videosRes as { data: { id: string; title: string }[] }).data ?? []) {
    videosMap[v.id] = v.title;
  }
  for (const u of (reportersRes as { data: { id: string; email: string }[] }).data ?? []) {
    reportersMap[u.id] = u.email;
  }

  const reports = (data ?? []).map((r) => {
    const row = r as {
      id: string;
      video_id: string | null;
      reporter_id: string | null;
      category: string;
      description: string;
      status: string;
      created_at: string;
      resolved_at: string | null;
    };
    return {
      id: row.id,
      video: row.video_id ? videosMap[row.video_id] ?? "Unknown video" : "—",
      reporter: row.reporter_id ? reportersMap[row.reporter_id] ?? "Unknown" : "—",
      category: row.category,
      description: row.description,
      status: row.status,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
    };
  });

  return NextResponse.json({ reports });
}