import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service-role";
import { isStickerAvatar, stickerAvatar } from "@/lib/stickers";
import { videos as mockVideos } from "@/lib/data/videos";
import { creators as mockCreators } from "@/lib/data/creators";

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
  try {
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

    if (!error && data && data.length > 0) {
      const items: HomeUploadItem[] = data.map((v) => {
        const row = v as unknown as DbUploadRow;
        const profile = row.creator_profiles?.[0] ?? null;
        const displayName =
          profile?.display_name ?? profile?.username ?? "Aafstories Creator";
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
  } catch (err) {
    console.warn("Failed to load uploads from database, using fallback:", err);
  }

  // Graceful fallback so API never returns 500
  const fallbackItems: HomeUploadItem[] = mockVideos.slice(0, 8).map((vid) => {
    const creator = mockCreators.find((c) => c.id === vid.creatorId);
    return {
      id: vid.id,
      title: vid.title,
      author: creator?.displayName ?? "Aafstories Creator",
      status: "In Progress",
      tags: vid.genre ?? ["African Stories"],
      price: vid.unlockPrice ?? 150,
      image: vid.thumbnail ?? "",
      href: `/watch/${vid.id}`,
    };
  });

  return NextResponse.json({ videos: fallbackItems });
}
