import { createClient } from "@/lib/supabase/server";

const cache = new Map<string, { value: boolean; expires: number }>();
const TTL_MS = 15_000;
const DEFAULT_FLAGS: Record<string, boolean> = {
  views_tracking_enabled: true,
  likes_enabled: true,
  comments_enabled: true,
  follows_enabled: true,
};

/**
 * Read a feature flag from the app_settings table, caching the result for a
 * short TTL so bot-free page loads don't hammer the DB. Flags default to ON
 * if the settings table is missing/unreachable.
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.value;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) {
      // table missing (migration not applied) — fall back to the default
      return DEFAULT_FLAGS[key] ?? true;
    }
    const value = Boolean(data?.value);
    cache.set(key, { value, expires: Date.now() + TTL_MS });
    return value;
  } catch {
    return DEFAULT_FLAGS[key] ?? true;
  }
}

export async function getAllFlags(): Promise<Record<string, boolean>> {
  const keys = Object.keys(DEFAULT_FLAGS);
  const entries = await Promise.all(keys.map((k) => isFeatureEnabled(k)));
  const flags: Record<string, boolean> = {};
  keys.forEach((k, i) => {
    flags[k] = entries[i];
  });
  return flags;
}