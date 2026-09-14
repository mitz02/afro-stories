import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service-role";

export interface CreatorSession {
  userId: string;
  userEmail: string;
  creatorProfileId: string; // creator_profiles.id (videos.creator_id FK)
}

/**
 * Resolves the current authenticated user and confirms they own an approved
 * creator profile. Returns null for guests/viewers/pending creators.
 */
export async function requireCreator(): Promise<CreatorSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const service = getServiceClient();
  const { data: creator } = await service
    .from("creator_profiles")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!creator || creator.status !== "approved") return null;

  return {
    userId: user.id,
    userEmail: user.email ?? "",
    creatorProfileId: creator.id,
  };
}