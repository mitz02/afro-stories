import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const { isAdmin, displayName, email } = await getAdminSession();
  return NextResponse.json({ isAdmin, displayName, email });
}