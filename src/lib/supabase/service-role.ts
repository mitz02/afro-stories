import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let instance: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service role key.
 * Bypasses RLS — never import this into client components or route modules
 * that run in the browser.
 */
export function getServiceClient(): SupabaseClient {
  if (!instance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Supabase service role client is not configured.");
    }
    instance = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return instance;
}