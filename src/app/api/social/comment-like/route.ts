import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to like comments." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { commentId?: string };
  const commentId = body.commentId?.trim();
  if (!commentId) {
    return NextResponse.json({ error: "Missing commentId." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("comment_id", commentId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("comment_likes")
      .delete()
      .eq("id", (existing as { id: string }).id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ liked: false });
  }

  const { error } = await supabase.from("comment_likes").insert({
    user_id: user.id,
    comment_id: commentId,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ liked: true });
}
