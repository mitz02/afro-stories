import { NextResponse } from "next/server";
import { getAllFlags } from "@/lib/supabase/features";

export const runtime = "nodejs";

export async function GET() {
  const flags = await getAllFlags();
  return NextResponse.json({
    viewsTracking: flags.views_tracking_enabled ?? true,
    likes: flags.likes_enabled ?? true,
    comments: flags.comments_enabled ?? true,
    follows: flags.follows_enabled ?? true,
  });
}