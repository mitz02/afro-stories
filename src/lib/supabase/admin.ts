import { createClient } from "@/lib/supabase/server";

export async function isAdminUser(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return (data as { role?: string } | null)?.role === "admin";
}

export async function getAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, user: null, isAdmin: false, displayName: null, email: null };
  }
  const { data } = await supabase
    .from("users")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();
  const role = (data as { role?: string } | null)?.role;
  const displayName =
    (data as { display_name?: string | null } | null)?.display_name ??
    user.email ??
    "Admin";
  return {
    supabase,
    user,
    isAdmin: role === "admin",
    displayName,
    email: user.email,
  };
}