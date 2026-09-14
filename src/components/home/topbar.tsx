"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Search, Plus, Menu, LogOut, UserRound, ChevronDown } from "lucide-react";
import { AfriMask } from "@/components/home/sidebar";
import { useToastStore, useWalletStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { formatNumber } from "@/lib/utils";

const roleLabel = { viewer: "Story Lover", creator: "Creator", admin: "Admin" } as const;

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const walletBalance = useWalletStore((s) => s.balance);
  const { user, balance: realBalance, signOut } = useSessionProfile();
  const [q, setQ] = React.useState("");
  const [profileOpen, setProfileOpen] = React.useState(false);

  const signedIn = !!user;
  const role = user?.role;
  const displayName = user?.display_name ?? user?.email;
  const initial = (displayName ?? "G").trim().charAt(0).toUpperCase();
  const balance = signedIn ? realBalance : walletBalance;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/explore?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const handleSignOut = async () => {
    setProfileOpen(false);
    await signOut();
    showToast("Signed out", "See you soon!");
    router.push("/home");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070a18]/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu and logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onMenu}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/home" className="flex items-center gap-2">
            <AfriMask className="h-8 w-8" />
            <span className="font-bold text-white text-base">AfriTales</span>
          </Link>
        </div>

        {/* Central Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4">
          <form onSubmit={submit} className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for stories, creators, genres..."
              className="h-9 sm:h-10 w-full rounded-full border border-white/10 bg-[#0e1329]/80 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-zinc-400 outline-none transition-all focus:border-indigo-500/60 focus:bg-[#121835] focus:shadow-[0_0_12px_rgba(84,56,220,0.2)]"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {!signedIn ? (
            <>
              <Link
                href="/login"
                className="inline-flex h-9 sm:h-10 items-center rounded-full border border-white/15 bg-white/[0.04] px-4 sm:px-5 text-xs sm:text-sm font-semibold text-zinc-100 transition-colors hover:border-white/30 hover:bg-white/10"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 sm:h-10 items-center rounded-full bg-[#f5b942] px-4 sm:px-5 text-xs sm:text-sm font-bold text-black shadow-[0_4px_16px_rgba(245,185,66,0.35)] transition-transform hover:scale-[1.03] hover:bg-[#ffc857]"
              >
                Join Now
              </Link>
            </>
          ) : (
            <>
              {/* Notification bell */}
              <button
                onClick={() =>
                  showToast("3 new updates", "New episodes released from Chief Uwa.")
                }
                aria-label="Notifications"
                className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-[#0e1329]/80 text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.7)]">
                  3
                </span>
              </button>

              {/* Coin Balance Pill */}
              <Link
                href="/wallet"
                className="flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-full border border-amber-500/20 bg-[#0e1329]/90 px-2.5 sm:px-3.5 transition-colors hover:border-amber-500/40 hover:bg-[#131935]"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-black text-[10px] font-black shadow-[0_0_8px_rgba(245,185,66,0.5)]">
                  $
                </div>
                <span className="text-xs sm:text-sm font-bold text-zinc-100">
                  {formatNumber(balance)}
                </span>
                <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white/25 text-zinc-400 hover:text-white">
                  <Plus className="h-2.5 w-2.5" />
                </div>
              </Link>

              {/* Profile cluster with dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  aria-label="Open profile menu"
                  className="flex items-center gap-2.5 rounded-full p-0.5 transition-colors hover:bg-white/[0.06]"
                >
                  <div className="relative h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-sm font-black text-neutral-950 ring-2 ring-amber-400/80 shadow-md">
                    {initial}
                  </div>
                  <div className="hidden text-left xl:block leading-tight pr-1">
                    <p className="text-xs font-bold text-white">{displayName}</p>
                    <p className="text-[10px] text-zinc-400">{role && roleLabel[role]}</p>
                  </div>
                  <ChevronDown
                    className={cnIcon(profileOpen)}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1226] shadow-2xl backdrop-blur-xl">
                    <div className="border-b border-white/[0.06] px-4 py-3">
                      <p className="truncate text-sm font-bold text-white">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {role && roleLabel[role]} account
                      </p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href={role === "creator" ? "/dashboard" : "/settings"}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <UserRound className="h-4 w-4" />
                        Profile & Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-red-300"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function cnIcon(open: boolean) {
  return `h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`;
}