import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service-role";
import { isStickerAvatar, stickerAvatar } from "@/lib/stickers";

export const runtime = "nodejs";

interface DbUploadRow {
  id: string;
  title: string;
  status: string | null;
  thumbnail: string | null;
  created_at: string | null;
  views: number | null;
  unlock_price: number | null;
  creator_id: string | null;
  series_id: string | null;
  creator_profiles: {
    display_name: string | null;
    username: string | null;
    avatar: string | null;
  }[] | null;
}

export interface HomeUploadItem {
  id: string;
  title: string;
  author: string;
  status: "Completed" | "In Progress";
  tags: string[];
  price: number;
  image: string;
  href: string;
}

export async function GET() {
  const svc = getServiceClient();
  const { data, error } = await svc
    .from("videos")
    .select(
      "id, title, status, thumbnail, created_at, views, unlock_price, creator_id, series_id, creator_profiles(display_name, username, avatar)"
    )
    .eq("status", "published")
    .not("thumbnail", "is", null)
    .not("title", "is", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items: HomeUploadItem[] = (data ?? []).map((v) => {
    const row = v as unknown as DbUploadRow;
    const profile = row.creator_profiles?.[0] ?? null;
    const displayName =
      profile?.display_name ?? profile?.username ?? "Aafstories Creator";
    const seed = profile?.avatar && !isStickerAvatar(profile.avatar)
      ? profile.avatar
      : stickerAvatar(
          row.creator_id ?? row.id ?? "creator" + (profile?.username ?? row.id ?? "seed")
        );
    return {
      id: row.id,
      title: row.title ?? "Untitled story",
      author: displayName,
      status: "In Progress",
      tags: ["Uploaded", "African Stories"],
      price: row.unlock_price ?? 150,
      image: row.thumbnail ?? "",
      href: `/watch/${row.id}`,
    };
  });

  return NextResponse.json({ videos: items });
}
