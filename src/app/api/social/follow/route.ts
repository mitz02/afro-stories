import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to follow creators." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    followeeId?: string;
    followeeType?: "creator" | "series";
  };
  const followeeId = body.followeeId?.trim();
  const followeeType = body.followeeType ?? "creator";
  if (!followeeId) {
    return NextResponse.json({ error: "Missing followeeId." }, { status: 400 });
  }
  if (followeeType !== "creator" && followeeType !== "series") {
    return NextResponse.json({ error: "Invalid followeeType." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("followee_id", followeeId)
    .eq("followee_type", followeeType)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("id", (existing as { id: string }).id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ following: false });
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    followee_id: followeeId,
    followee_type: followeeType,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ following: true });
}
