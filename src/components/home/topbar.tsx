"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Menu, X, ArrowRight, Film, Layers, UserRound } from "lucide-react";
import { AfriMask } from "@/components/home/sidebar";
import { useWalletStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { formatNumber } from "@/lib/utils";
import { videos } from "@/lib/data/videos";
import { series } from "@/lib/data/series";
import { creators } from "@/lib/data/creators";

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const walletBalance = useWalletStore((s) => s.balance);
  const { user, balance: realBalance } = useSessionProfile();
  const [q, setQ] = React.useState("");
  const [searchFocused, setSearchFocused] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  const signedIn = !!user;
  const balance = signedIn ? realBalance : walletBalance;

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

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070a18]/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-4 lg:px-6">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-2 lg:hidden min-w-0">
          <button
            onClick={onMenu}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/home" className="flex items-center gap-2 shrink-0">
            <AfriMask className="h-7 w-7" />
            <span className="font-bold text-white text-sm hidden sm:inline">AfriTales</span>
          </Link>
        </div>

        {/* Center: Search Bar - hidden on mobile, shown on sm+ */}
        <div className="hidden sm:flex flex-1 max-w-xl mx-2 sm:mx-4 lg:mx-8">
          <form onSubmit={submit} className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
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
              placeholder="Search stories, creators, genres..."
              className="h-9 w-full rounded-full border border-white/10 bg-[#0e1329]/80 pl-9 pr-10 text-xs text-white placeholder-zinc-400 outline-none transition-all focus:border-indigo-500/60 focus:bg-[#121835] focus:shadow-[0_0_12px_rgba(84,56,220,0.2)]"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Live Search Dropdown */}
          {searchFocused && q.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1226]/95 backdrop-blur-2xl shadow-2xl">
              <div className="max-h-[380px] overflow-y-auto p-2 space-y-3">
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
                            <img src={vid.thumbnail} alt={vid.title} className="h-full w-full object-cover" />
                            {vid.monetization === "premium" && (
                              <span className="absolute bottom-1 right-1 rounded bg-amber-400 px-1 py-0.2 text-[8px] font-black text-black">
                                {vid.unlockPrice} pts
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-white">{vid.title}</p>
                            <p className="truncate text-[10.5px] text-zinc-400">{vid.genre.slice(0, 2).join(", ")} · {vid.language}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                            <img src={ser.coverImage} alt={ser.title} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-white">{ser.title}</p>
                            <p className="truncate text-[10.5px] text-zinc-400">{ser.genre.join(", ")} · {ser.seasons.reduce((sum, s) => sum + s.episodeCount, 0)} episodes</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                            <p className="truncate text-xs font-semibold text-white">{c.displayName}</p>
                            <p className="truncate text-[10.5px] text-zinc-400">@{c.username} · {c.city}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {!hasResults && (
                  <div className="py-6 text-center">
                    <p className="text-xs font-medium text-zinc-300">No quick matches found for {q}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Press Enter to search all stories across Africa.</p>
                  </div>
                )}
              </div>
              <div className="border-t border-white/[0.06] bg-black/20 p-2 text-center">
                <button
                  onClick={() => {
                    setSearchFocused(false);
                    router.push(`/explore?q=${encodeURIComponent(q.trim())}`);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-400/10"
                >
                  <span>See all results for {q}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search Button (only on mobile) */}
        <div className="sm:hidden flex-1 flex justify-center">
          <button
            onClick={() => router.push("/explore")}
            className="flex w-full max-w-[200px] h-9 items-center justify-center gap-2 rounded-full border border-white/10 bg-[#0e1329]/80 pl-4 pr-3 text-xs text-white placeholder-zinc-400"
            aria-label="Search"
          >
            <Search className="h-4 w-4 text-zinc-400" />
            <span className="truncate">Search...</span>
          </button>
        </div>

        {/* Right Section - Only Coin Balance */}
        <div className="flex shrink-0 items-center">
          {/* Coin Balance Pill - hidden on mobile, shown on sm+ */}
          <Link
            href="/wallet"
            className="flex h-9 items-center gap-1.5 rounded-full border border-amber-500/20 bg-[#0e1329]/90 px-2.5 transition-colors hover:border-amber-500/40 hover:bg-[#131935] hidden sm:flex"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-black text-[10px] font-black shadow-[0_0_8px_rgba(245,185,66,0.5)]">
              $
            </div>
            <span className="text-xs font-bold text-zinc-100">{formatNumber(balance)}</span>
            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white/25 text-zinc-400 hover:text-white">
              <span className="h-2.5 w-2.5">+</span>
            </div>
          </Link>

          {/* Mobile Coin Balance (icon only) */}
          <Link
            href="/wallet"
            className="flex h-9 w-9 sm:hidden items-center justify-center rounded-full border border-amber-500/20 bg-[#0e1329]/90 transition-colors hover:border-amber-500/40 hover:bg-[#131935]"
            aria-label={`Wallet: ${formatNumber(balance)} points`}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-black text-[10px] font-black shadow-[0_0_8px_rgba(245,185,66,0.5)]">
              $
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}