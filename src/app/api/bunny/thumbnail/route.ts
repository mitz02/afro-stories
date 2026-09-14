import { NextResponse, type NextRequest } from "next/server";
import { requireCreator } from "@/lib/bunny-auth";
import { getServiceClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function ensureBucket(service: ReturnType<typeof getServiceClient>): Promise<void> {
  const { data } = await service.storage.getBucket("thumbnails");
  if (!data) {
    const { error } = await service.storage.createBucket("thumbnails", { public: true });
    if (error) throw new Error("Could not create storage bucket: " + error.message);
  }
}

/**
 * Stores a custom thumbnail image for a Bunny video in Supabase Storage
 * (public bucket "thumbnails"). Called right before /api/bunny/confirm, which
 * persists the returned URL on the video row.
 */
export async function POST(req: NextRequest) {
  const session = await requireCreator();
  if (!session) {
    return NextResponse.json(
      { error: "Sign in with an approved creator account to upload a thumbnail." },
      { status: 401 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const file = form.get("file");
  const bunnyVideoId = String(form.get("bunnyVideoId") ?? "").trim();
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }
  if (!bunnyVideoId) {
    return NextResponse.json({ error: "Missing bunnyVideoId." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPG, WebP or GIF images are supported." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Thumbnail must be under 10 MB." }, { status: 400 });
  }

  try {
    const service = getServiceClient();
    await ensureBucket(service);

    const ext = EXT[file.type] ?? "jpg";
    const path = `thumbnails/${session.userId}/${bunnyVideoId}.${ext}`;
    const { error } = await service.storage
      .from("thumbnails")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (error) throw new Error(error.message);

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const url = `${base}/storage/v1/object/public/thumbnails/${path}`;
    return NextResponse.json({ url, path });
  } catch (e) {
    console.error("bunny/thumbnail failed:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}