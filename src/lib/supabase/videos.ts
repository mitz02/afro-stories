import type { Video } from "@/types";

export interface DbVideoRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  duration: number | null;
  type: string | null;
  origin: string | null;
  status: string | null;
  monetization: string | null;
  unlock_price: number | null;
  age_rating: string | null;
  genre: string[] | null;
  language: string | null;
  country: string | null;
  tags: string[] | null;
  views: number | null;
  likes: number | null;
  shares: number | null;
  created_at: string | null;
  published_at: string | null;
  creator_id: string | null;
  series_id: string | null;
  episode_id: string | null;
  bunny_video_id: string | null;
  hls_url: string | null;
  video_url: string | null;
  processing_status: string | null;
  processing_error: string | null;
}

export const PLACEHOLDER_THUMBNAIL =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1280&q=80";

export function mapDbVideo(row: DbVideoRow): Video {
  const isSeries = row.type === "series";
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    thumbnail: row.thumbnail ?? PLACEHOLDER_THUMBNAIL,
    duration: row.duration ?? 0,
    type: isSeries ? "series" : "single",
    origin: ["ai_generated", "ai_assisted", "human"].includes(row.origin ?? "")
      ? (row.origin as Video["origin"])
      : "ai_assisted",
    status: ["draft", "processing", "pending_review", "published", "rejected", "suspended"].includes(
      row.status ?? ""
    )
      ? (row.status as Video["status"])
      : "draft",
    monetization: row.monetization === "premium" ? "premium" : "free",
    unlockPrice: row.unlock_price ?? 0,
    ageRating: (["G", "PG", "12+", "16+", "18+"] as const).includes(row.age_rating as never)
      ? (row.age_rating as Video["ageRating"])
      : "PG",
    genre: row.genre && row.genre.length > 0 ? row.genre : [],
    language: row.language ?? "English",
    country: (row.country ?? "NG") as Video["country"],
    tags: row.tags ?? [],
    views: row.views ?? 0,
    likes: row.likes ?? 0,
    shares: row.shares ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
    publishedAt: row.published_at ?? row.created_at ?? new Date().toISOString(),
    creatorId: row.creator_id ?? "",
    seriesId: row.series_id ?? undefined,
    episodeId: row.episode_id ?? undefined,
    hlsUrl: row.hls_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
  };
}

export type { Video };