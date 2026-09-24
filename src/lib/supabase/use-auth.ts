"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { stickerAvatar } from "@/lib/stickers";

export interface SessionProfile {
  id: string;
  username: string;
  display_name: string | null;
  role: "viewer" | "creator" | "admin";
  avatar: string | null;
  email: string;
}

interface UseSessionProfile {
  user: SessionProfile | null;
  loading: boolean;
  balance: number;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSessionProfile(): UseSessionProfile {
  const [user, setUser] = useState<SessionProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  const getSupabase = useCallback(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }, []);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setUser(null);
      setBalance(0);
      setLoading(false);
      return;
    }

    const email = session.user.email ?? "";
    const fallback = email.split("@")[0] || "Guest";

    const { data } = await supabase
      .from("users")
      .select("id, username, display_name, role, avatar")
      .eq("id", session.user.id)
      .maybeSingle();

    const metaAvatar = session.user.user_metadata?.avatar as string | undefined;
    const avatar =
      data?.avatar ??
      metaAvatar ??
      stickerAvatar(session.user.id + (session.user.email ?? ""));

    // Persist the sticker picked at registration (or the id-derived fallback)
    // onto the public users row so DB-level consumers see it too.
    if (data && !data.avatar && metaAvatar) {
      supabase
        .from("users")
        .update({ avatar: metaAvatar })
        .eq("id", session.user.id)
        .then(
          () => undefined,
          () => undefined
        );
    }

    setUser({
      id: session.user.id,
      username: data?.username ?? fallback,
      display_name: data?.display_name ?? fallback,
      role: data?.role ?? "viewer",
      avatar,
      email,
    });

    const { data: wallet } = await supabase.rpc("get_user_wallet_balance", {
      p_user_id: session.user.id,
    });
    setBalance(wallet?.[0]?.balance ?? 0);
    setLoading(false);
  }, [getSupabase]);

  useEffect(() => {
    void refresh();
    const supabase = getSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        void refresh();
      } else {
        setUser(null);
        setBalance(0);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [refresh, getSupabase]);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setBalance(0);
    setLoading(false);
  }, [getSupabase]);

  return { user, loading, balance, signOut, refresh };
}