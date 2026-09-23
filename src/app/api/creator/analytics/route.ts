import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const COUNTRY_NAMES: Record<string, string> = {
  NG: "Nigeria", GH: "Ghana", KE: "Kenya", ZA: "South Africa", ET: "Ethiopia",
  TZ: "Tanzania", UG: "Uganda", RW: "Rwanda", SN: "Senegal", CM: "Cameroon",
  ZW: "Zimbabwe", ZM: "Zambia", EG: "Egypt", MA: "Morocco", CI: "Côte d'Ivoire",
  BJ: "Benin", SL: "Sierra Leone", MZ: "Mozambique", AO: "Angola", MW: "Malawi",
};

const COUNTRY_FLAGS: Record<string, string> = {
  NG: "🇳🇬", GH: "🇬🇭", KE: "🇰🇪", ZA: "🇿🇦", ET: "🇪🇹",
  TZ: "🇹🇿", UG: "🇺🇬", RW: "🇷🇼", SN: "🇸🇳", CM: "🇨🇲",
  ZW: "🇿🇼", ZM: "🇿🇲", EG: "🇪🇬", MA: "🇲🇦", CI: "🇨🇮",
  BJ: "🇧🇯", SL: "🇸🇱", MZ: "🇲🇿", AO: "🇦🇴", MW: "🇲🇼",
};

interface WatchEventRow {
  id: string;
  video_id: string;
  user_id: string;
  watched_at: string;
  progress: number;
  watch_time: number;
  users: { country: string } | null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to view analytics." }, { status: 401 });
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

  const svc = getServiceClient();

  const { data: videoRows, error: vErr } = await svc
    .from("videos")
    .select("id, title, thumbnail, status, views, likes, shares, duration, created_at")
    .eq("creator_id", profileId)
    .order("created_at", { ascending: false });
  if (vErr) {
    return NextResponse.json({ error: vErr.message }, { status: 500 });
  }
  const videos = (videoRows ?? []) as {
    id: string;
    title: string;
    thumbnail: string | null;
    status: string;
    views: number;
    likes: number;
    shares: number;
    duration: number;
    created_at: string;
  }[];

  const videoIds = videos.map((v) => v.id);

  let watchEvents: WatchEventRow[] = [];
  let followerCreatedAt: string[] = [];

  const [wh, fl] = await Promise.all([
    videoIds.length > 0
      ? svc
          .from("watch_history")
          .select("id, video_id, user_id, watched_at, progress, watch_time, users(country)")
          .in("video_id", videoIds)
      : Promise.resolve({ data: [] }),
    svc
      .from("follows")
      .select("created_at")
      .eq("followee_id", profileId)
      .eq("followee_type", "creator"),
  ]);

  watchEvents = (wh.data ?? []) as unknown as WatchEventRow[];
  followerCreatedAt = ((fl.data ?? []) as { created_at: string }[]).map(
    (r) => r.created_at
  );

  const totalViews = videos.reduce((a, v) => a + (v.views ?? 0), 0);
  const totalLikes = videos.reduce((a, v) => a + (v.likes ?? 0), 0);
  const totalShares = videos.reduce((a, v) => a + (v.shares ?? 0), 0);
  const watchTimeSeconds = watchEvents.reduce((a, e) => a + (e.watch_time ?? 0), 0);
  const uniqueViewers = new Set(watchEvents.map((e) => e.user_id)).size;

  const countryCounts: Record<string, number> = {};
  for (const e of watchEvents) {
    const code = e.users?.country ?? "NG";
    countryCounts[code] = (countryCounts[code] ?? 0) + 1;
  }
  const topCountries = Object.entries(countryCounts)
    .map(([code, views]) => ({
      code,
      name: COUNTRY_NAMES[code] ?? code,
      flag: COUNTRY_FLAGS[code] ?? "🌍",
      views,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  const viewsPerVideo: Record<string, number> = {};
  const watchSecondsPerVideo: Record<string, number> = {};
  const progressPerVideo: Record<string, number[]> = {};
  for (const e of watchEvents) {
    viewsPerVideo[e.video_id] = (viewsPerVideo[e.video_id] ?? 0) + 1;
    watchSecondsPerVideo[e.video_id] =
      (watchSecondsPerVideo[e.video_id] ?? 0) + (e.watch_time ?? 0);
    if (!progressPerVideo[e.video_id]) progressPerVideo[e.video_id] = [];
    progressPerVideo[e.video_id].push(e.progress ?? 0);
  }

  const topVideos = videos
    .map((v) => {
      const eventCount = viewsPerVideo[v.id] ?? 0;
      const avgProgress = progressPerVideo[v.id]?.length
        ? progressPerVideo[v.id].reduce((a, b) => a + b, 0) /
          progressPerVideo[v.id].length
        : 0;
      return {
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail,
        status: v.status,
        views: v.views,
        likes: v.likes ?? 0,
        watchSeconds: watchSecondsPerVideo[v.id] ?? 0,
        completionRate: Math.round(avgProgress),
        events: eventCount,
        createdAt: v.created_at,
      };
    })
    .sort((a, b) => b.views - a.views);

  return NextResponse.json({
    overview: {
      totalViews,
      totalLikes,
      totalShares,
      watchTimeSeconds,
      uniqueViewers,
      followers: followerCreatedAt.length,
    },
    watchEvents: watchEvents.map((e) => ({
      videoId: e.video_id,
      watchedAt: e.watched_at,
      watchTime: e.watch_time ?? 0,
      progress: e.progress ?? 0,
      country: e.users?.country ?? "NG",
    })),
    followerCreatedAt,
    topVideos,
    topCountries,
  });
}