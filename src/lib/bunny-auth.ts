import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service-role";

export interface CreatorSession {
  userId: string;
  userEmail: string;
  creatorProfileId: string; // creator_profiles.id (videos.creator_id FK)
}

export type CreatorGate =
  | { ok: true; session: CreatorSession }
  | {
      ok: false;
      reason: "unauthenticated" | "no-profile" | "pending" | "rejected";
    };

/**
 * Resolves the current authenticated user and confirms they own an approved
 * creator profile. Returns a detailed result so callers can tell guests apart
 * from viewers and unapproved creators.
 */
export async function gateCreator(): Promise<CreatorGate> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  const service = getServiceClient();
  const { data: creator } = await service
    .from("creator_profiles")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!creator) return { ok: false, reason: "no-profile" };
  if (creator.status !== "approved")
    return { ok: false, reason: creator.status === "rejected" ? "rejected" : "pending" };

  return {
    ok: true,
    session: {
      userId: user.id,
      userEmail: user.email ?? "",
      creatorProfileId: creator.id,
    },
  };
}

/**
 * Back-compat helper that only returns the session when the user is an
 * approved creator, otherwise null.
 */
export async function requireCreator(): Promise<CreatorSession | null> {
  const gate = await gateCreator();
  return gate.ok ? gate.session : null;
}