"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Search, Plus, Menu, LogOut, UserRound, ChevronDown, X, Film, Layers, ArrowRight } from "lucide-react";
import { AfriMask } from "@/components/home/sidebar";
import { useToastStore, useWalletStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { formatNumber } from "@/lib/utils";
import { videos } from "@/lib/data/videos";
import { series } from "@/lib/data/series";
import { creators } from "@/lib/data/creators";
import { NotificationPanel } from "@/components/notification-panel";

const roleLabel = { viewer: "Story Lover", creator: "Creator", admin: "Admin" } as const;

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const walletBalance = useWalletStore((s) => s.balance);
  const { user, balance: realBalance, signOut } = useSessionProfile();
  const [q, setQ] = React.useState("");
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  const signedIn = !!user;
  const role = user?.role;
  const displayName = user?.display_name ?? user?.email;
  const initial = (displayName ?? "G").trim().charAt(0).toUpperCase();
  const balance = signedIn ? realBalance : walletBalance;

  // Filter search results
  const searchResults = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return { videos: [], series: [], creators: [] };
    return {
      videos: videos.filter(
        (v) =>
          v.title.toLowerCase().includes(term) ||
          v.tags.some((t) => t.toLowerCase().includes(term)) ||
          v.genre.some((g) => g.toLowerCase().includes(term))
      ).slice(0, 4),
      series: series.filter(
        (s) =>
          s.title.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term) ||
          s.genre.some((g) => g.toLowerCase().includes(term))
      ).slice(0, 3),
      creators: creators.filter(
        (c) =>
          c.displayName.toLowerCase().includes(term) ||
          c.username.toLowerCase().includes(term)
      ).slice(0, 2),
    };
  }, [q]);

  const hasResults =
    searchResults.videos.length > 0 ||
    searchResults.series.length > 0 ||
    searchResults.creators.length > 0;

  // Handle outside click to close search dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      setSearchFocused(false);
      router.push(`/explore?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const handleSelectResult = (url: string) => {
    setSearchFocused(false);
    setQ("");
    router.push(url);
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
        <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-2 sm:mx-4">
          <form onSubmit={submit} className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={q}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setQ(e.target.value);
                setSearchFocused(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchFocused(false);
              }}
              placeholder="Search for stories, creators, genres..."
              className="h-9 sm:h-10 w-full rounded-full border border-white/10 bg-[#0e1329]/80 pl-10 pr-16 text-xs sm:text-sm text-white placeholder-zinc-400 outline-none transition-all focus:border-indigo-500/60 focus:bg-[#121835] focus:shadow-[0_0_12px_rgba(84,56,220,0.2)]"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="absolute right-9 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Live Search Dropdown */}
          {searchFocused && q.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1226]/95 backdrop-blur-2xl shadow-2xl">
              <div className="max-h-[380px] overflow-y-auto p-2 space-y-3">
                {/* Videos / Stories */}
                {searchResults.videos.length > 0 && (
                  <div>
                    <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/80 flex items-center gap-1.5">
                      <Film className="h-3 w-3" /> Stories & Videos
                    </p>
                    <div className="space-y-0.5">
                      {searchResults.videos.map((vid) => (
                        <button
                          key={vid.id}
                          onClick={() => handleSelectResult(`/watch/${vid.id}`)}
                          className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/[0.06]"
                        >
                          <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                            <img
                              src={vid.thumbnail}
                              alt={vid.title}
                              className="h-full w-full object-cover"
                            />
                            {vid.monetization === "premium" && (
                              <span className="absolute bottom-1 right-1 rounded bg-amber-400 px-1 py-0.2 text-[8px] font-black text-black">
                                {vid.unlockPrice} pts
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-white">
                              {vid.title}
                            </p>
                            <p className="truncate text-[10.5px] text-zinc-400">
                              {vid.genre.slice(0, 2).join(", ")} · {vid.language}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Series */}
                {searchResults.series.length > 0 && (
                  <div>
                    <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400/80 flex items-center gap-1.5">
                      <Layers className="h-3 w-3" /> Series
                    </p>
                    <div className="space-y-0.5">
                      {searchResults.series.map((ser) => (
                        <button
                          key={ser.id}
                          onClick={() => handleSelectResult(`/series/${ser.id}`)}
                          className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/[0.06]"
                        >
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                            <img
                              src={ser.coverImage}
                              alt={ser.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-white">
                              {ser.title}
                            </p>
                            <p className="truncate text-[10.5px] text-zinc-400">
                              {ser.genre.join(", ")} · {ser.seasons.reduce((sum, s) => sum + s.episodeCount, 0)} episodes
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Creators */}
                {searchResults.creators.length > 0 && (
                  <div>
                    <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <UserRound className="h-3 w-3" /> Creators
                    </p>
                    <div className="space-y-0.5">
                      {searchResults.creators.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectResult(`/creator/${c.id}`)}
                          className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/[0.06]"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-indigo-600 text-xs font-bold text-white">
                            {c.displayName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-white">
                              {c.displayName}
                            </p>
                            <p className="truncate text-[10.5px] text-zinc-400">
                              @{c.username} · {c.city}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!hasResults && (
                  <div className="py-6 text-center">
                    <p className="text-xs font-medium text-zinc-300">
                      No quick matches found for &quot;{q}&quot;
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Press Enter to search all stories across Africa.
                    </p>
                  </div>
                )}
              </div>

              {/* View all in explore footer */}
              <div className="border-t border-white/[0.06] bg-black/20 p-2 text-center">
                <button
                  onClick={() => {
                    setSearchFocused(false);
                    router.push(`/explore?q=${encodeURIComponent(q.trim())}`);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-400/10"
                >
                  <span>See all results for &quot;{q}&quot;</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <NotificationPanel />

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
                  <div
                    className="relative h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-full bg-[#0e1329] ring-2 ring-amber-400/80 shadow-md"
                    style={{
                      backgroundImage: user.avatar
                        ? "none"
                        : "linear-gradient(135deg, #7c3aed, #db2777)",
                    }}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={displayName ?? "Profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-black text-white">
                        {initial}
                      </span>
                    )}
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