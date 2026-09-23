import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service-role";
import { stickerAvatar } from "@/lib/stickers";

export const runtime = "nodejs";

interface FollowerRow {
  id: string;
  created_at: string;
  follower_id: string;
  users: {
    display_name: string;
    username: string;
    avatar: string | null;
    country: string;
  } | null;
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to view followers." }, { status: 401 });
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

  const { data: followerRows, error: fErr } = await svc
    .from("follows")
    .select(
      "id, created_at, follower_id, users!follows_follower_id_fkey(display_name, username, avatar, country)"
    )
    .eq("followee_id", profileId)
    .eq("followee_type", "creator")
    .order("created_at", { ascending: false });
  if (fErr) {
    return NextResponse.json({ error: fErr.message }, { status: 500 });
  }

  const followers = (followerRows ?? []).map((r) => {
    const row = r as unknown as FollowerRow;
    return {
      id: row.id,
      userId: row.follower_id,
      name: row.users?.display_name ?? "User",
      handle: row.users?.username ?? "",
      avatar: row.users?.avatar ?? stickerAvatar(row.follower_id),
      country: row.users?.country ?? "NG",
      since: row.created_at,
    };
  });

  const { data: followingRows, error: folErr } = await svc
    .from("follows")
    .select("id, created_at, followee_id, followee_type")
    .eq("follower_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);
  if (folErr) {
    return NextResponse.json({ error: folErr.message }, { status: 500 });
  }

  const rows = (followingRows ?? []) as {
    id: string;
    created_at: string;
    followee_id: string;
    followee_type: string;
  }[];

  const creatorIds = rows
    .filter((r) => r.followee_type === "creator")
    .map((r) => r.followee_id);
  const seriesIds = rows
    .filter((r) => r.followee_type === "series")
    .map((r) => r.followee_id);

  const [creators, series] = await Promise.all([
    creatorIds.length > 0
      ? svc
          .from("creator_profiles")
          .select("id, display_name, username, avatar")
          .in("id", creatorIds)
      : Promise.resolve({ data: [] }),
    seriesIds.length > 0
      ? svc.from("series").select("id, title, cover_image").in("id", seriesIds)
      : Promise.resolve({ data: [] }),
  ]);

  const creatorMap = new Map(
    ((creators.data ?? []) as unknown as {
      id: string;
      display_name: string;
      username: string;
      avatar: string | null;
    }[]).map((c) => [c.id, c])
  );
  const seriesMap = new Map(
    ((series.data ?? []) as unknown as { id: string; title: string; cover_image: string | null }[]).map(
      (s) => [s.id, s]
    )
  );

  const following = rows.map((r) => {
    if (r.followee_type === "creator") {
      const c = creatorMap.get(r.followee_id);
      return {
        id: r.id,
        since: r.created_at,
        type: "creator" as const,
        name: c?.display_name ?? "Creator",
        handle: c?.username ?? "",
        avatar: c?.avatar ?? stickerAvatar(r.followee_id),
        thumbnail: null,
      };
    }
    const s = seriesMap.get(r.followee_id);
    return {
      id: r.id,
      since: r.created_at,
      type: "series" as const,
      name: s?.title ?? "Series",
      handle: "",
      avatar: null,
      thumbnail: s?.cover_image ?? null,
    };
  });

  return NextResponse.json({ followers, following });
}