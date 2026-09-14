"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const supabase = createClient();
  const [user, setUser] = useState<SessionProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const refresh = useCallback(async () => {
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

    setUser({
      id: session.user.id,
      username: data?.username ?? fallback,
      display_name: data?.display_name ?? fallback,
      role: data?.role ?? "viewer",
      avatar: data?.avatar ?? null,
      email,
    });

    const { data: wallet } = await supabase.rpc("get_user_wallet_balance", {
      p_user_id: session.user.id,
    });
    setBalance(wallet?.[0]?.balance ?? 0);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void refresh();
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
  }, [refresh, supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBalance(0);
    setLoading(false);
  }, [supabase]);

  return { user, loading, balance, signOut, refresh };
}