"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  TrendingUp,
  Sparkles,
  Film,
  Clapperboard,
  User,
  LogOut,
  ChevronDown,
  Upload,
  ArrowRight,
  Clock,
  Shield,
  Coins,
} from "lucide-react";
import { useWalletStore, useToastStore, useUiStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { formatNumber, cn, formatDuration } from "@/lib/utils";
import { NotificationPanel } from "@/components/notification-panel";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
import { videos } from "@/lib/data/videos";
import { series } from "@/lib/data/series";
import { creators } from "@/lib/data/creators";

const TRENDING_SEARCHES = [
  "The Last Kingdom",
  "Yoruba Folklore",
  "Queen Amina",
  "Zulu Legends",
  "Anansi",
  "Lagos Cyberpunk",
];

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const walletBalance = useWalletStore((s) => s.balance);
  const showToast = useToastStore((s) => s.showToast);
  const { user, balance: realBalance, signOut } = useSessionProfile();
  const { notificationsOpen, setNotificationsOpen } = useUiStore();

  const [q, setQ] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);

  const signedIn = !!user;
  const balance = signedIn ? realBalance : walletBalance;
  const displayName = user?.display_name || user?.username || user?.email?.split("@")[0] || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  // Close search & profile dropdowns on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K or '/' to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter search results
  const searchResults = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return { videos: [], series: [], creators: [] };
    return {
      videos: videos
        .filter(
          (v) =>
            v.title.toLowerCase().includes(term) ||
            v.tags.some((t) => t.toLowerCase().includes(term)) ||
            v.genre.some((g) => g.toLowerCase().includes(term))
        )
        .slice(0, 4),
      series: series
        .filter(
          (s) =>
            s.title.toLowerCase().includes(term) ||
            s.description.toLowerCase().includes(term) ||
            s.genre.some((g) => g.toLowerCase().includes(term))
        )
        .slice(0, 3),
      creators: creators
        .filter(
          (c) =>
            c.displayName.toLowerCase().includes(term) ||
            c.username.toLowerCase().includes(term)
        )
        .slice(0, 2),
    };
  }, [q]);

  const hasResults =
    searchResults.videos.length > 0 ||
    searchResults.series.length > 0 ||
    searchResults.creators.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      setSearchOpen(false);
      router.push(`/explore?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const handleSelectResult = (url: string) => {
    setSearchOpen(false);
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
      <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-4 lg:px-6">
        {/* Left Section: Mobile Menu & Desktop Brand Tag */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onMenu}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white transition-colors"
            >
              <HamburgerMenu size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Desktop Tag */}
          <div className="hidden lg:flex items-center gap-2 select-none">
            <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold text-amber-300 shadow-[0_0_12px_rgba(245,185,66,0.1)]">
              <Sparkles className="h-3 w-3 text-amber-400" />
              AfriTales
            </span>
          </div>
        </div>

        {/* Center: Modern Search Bar on Desktop */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-[560px] xl:max-w-[660px] mx-auto hidden lg:block">
          <form
            onSubmit={handleSubmit}
            className={cn(
              "group relative flex items-center h-10 w-full rounded-2xl border transition-all duration-200",
              searchOpen
                ? "border-amber-400/50 bg-[#0b0f24] ring-2 ring-amber-400/20 shadow-[0_0_24px_rgba(245,185,66,0.12)]"
                : "border-white/[0.1] bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center ml-2.5 rounded-xl bg-amber-400/10 text-amber-400 transition-colors group-focus-within:bg-amber-400 group-focus-within:text-black">
              <Search className="h-3.5 w-3.5" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                if (!searchOpen) setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search stories, folklore, series, creators..."
              className="h-full w-full bg-transparent px-3 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            />

            <div className="flex items-center gap-1.5 mr-2">
              {q ? (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    searchInputRef.current?.focus();
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 select-none">
                  ⌘K
                </kbd>
              )}
            </div>
          </form>

          {/* Search Dropdown / Autocomplete Panel */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/[0.12] bg-[#0c1024]/98 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Empty query state: Trending searches */}
              {!q.trim() && (
                <div className="p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-2.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Trending Searches
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TRENDING_SEARCHES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setQ(item);
                          handleSelectResult(`/explore?q=${encodeURIComponent(item)}`);
                        }}
                        className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300 transition-colors"
                      >
                        <Clock className="h-3 w-3 text-zinc-500" />
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Has search results */}
              {q.trim() && hasResults && (
                <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/[0.06] p-2">
                  {/* Series Matches */}
                  {searchResults.series.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 mb-2 flex items-center gap-1">
                        <Clapperboard className="h-3 w-3" /> Series
                      </div>
                      <div className="space-y-1">
                        {searchResults.series.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleSelectResult(`/series/${s.id}`)}
                            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/[0.06] text-left transition-colors group"
                          >
                            <img
                              src={s.coverImage}
                              alt={s.title}
                              className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                                {s.title}
                              </p>
                              <p className="text-[10px] text-zinc-400 truncate">
                                {s.genre.slice(0, 2).join(" · ")} &middot; {s.seasons.length} Season{s.seasons.length > 1 ? "s" : ""}
                              </p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stories / Videos Matches */}
                  {searchResults.videos.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 mb-2 flex items-center gap-1">
                        <Film className="h-3 w-3" /> Stories
                      </div>
                      <div className="space-y-1">
                        {searchResults.videos.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleSelectResult(`/watch/${v.id}`)}
                            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/[0.06] text-left transition-colors group"
                          >
                            <img
                              src={v.thumbnail}
                              alt={v.title}
                              className="h-10 w-16 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                                {v.title}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                                <span>{formatDuration(v.duration)}</span>
                                <span className={v.monetization === "free" ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                                  {v.monetization === "free" ? "Free" : `${v.unlockPrice} pts`}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Creators Matches */}
                  {searchResults.creators.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 mb-2 flex items-center gap-1">
                        <User className="h-3 w-3" /> Storytellers
                      </div>
                      <div className="space-y-1">
                        {searchResults.creators.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectResult(`/creator/${c.id}`)}
                            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/[0.06] text-left transition-colors group"
                          >
                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-white text-xs font-bold shrink-0", c.avatarGradient || "from-amber-400 to-amber-600")}>
                              {c.displayName.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                                {c.displayName}
                              </p>
                              <p className="text-[10px] text-zinc-400 truncate">
                                @{c.username} &middot; {formatNumber(c.followers)} followers
                              </p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No results */}
              {q.trim() && !hasResults && (
                <div className="py-8 px-4 text-center">
                  <p className="text-xs text-zinc-400">No stories or creators found matching &ldquo;{q}&rdquo;</p>
                  <button
                    type="button"
                    onClick={() => handleSelectResult(`/explore?q=${encodeURIComponent(q.trim())}`)}
                    className="mt-2 text-xs font-semibold text-amber-400 hover:underline"
                  >
                    Search in Explore catalog &rarr;
                  </button>
                </div>
              )}

              {/* Bottom bar */}
              {q.trim() && (
                <div className="border-t border-white/[0.06] bg-white/[0.02] p-2.5 px-4 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    Press <kbd className="text-[10px] bg-white/10 px-1 py-0.5 rounded text-zinc-300">Enter ↵</kbd> to see all
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectResult(`/explore?q=${encodeURIComponent(q.trim())}`)}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    View all results <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Mobile Search, Upload, Notifications, Wallet, Profile */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Mobile Search Icon */}
          <Link
            href="/explore"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* Desktop Upload Button */}
          <Link
            href="/upload"
            className="hidden xl:flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all shadow-[0_0_12px_rgba(245,185,66,0.1)]"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Link>

          {/* Notification Bell */}
          <NotificationPanel
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
          />

          {/* Wallet Balance (Desktop & Tablet) */}
          <Link
            href="/wallet"
            className="hidden sm:flex h-9 items-center gap-2 rounded-full border border-amber-500/25 bg-[#0e1329]/90 px-3 transition-colors hover:border-amber-500/40 hover:bg-[#131935]"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-black text-[10px] font-black shadow-[0_0_8px_rgba(245,185,66,0.5)]">
              $
            </div>
            <span className="text-xs font-bold text-zinc-100">{formatNumber(balance)}</span>
            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-zinc-400 hover:text-white hover:border-white/40">
              <span className="text-[10px] leading-none">+</span>
            </div>
          </Link>

          {/* Mobile Wallet Balance (icon only) */}
          <Link
            href="/wallet"
            className="flex h-9 w-9 sm:hidden items-center justify-center rounded-full border border-amber-500/20 bg-[#0e1329]/90 transition-colors hover:border-amber-500/40 hover:bg-[#131935]"
            aria-label={`Wallet: ${formatNumber(balance)} points`}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-black text-[10px] font-black shadow-[0_0_8px_rgba(245,185,66,0.5)]">
              $
            </div>
          </Link>

          {/* Desktop User Avatar / Profile Dropdown */}
          <div ref={profileRef} className="relative hidden md:block">
            {signedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1 pr-2.5 text-zinc-300 hover:border-white/25 hover:bg-white/[0.08] transition-all"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-amber-500 text-[11px] font-bold text-white shadow-sm">
                    {userInitial}
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 max-w-[80px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/[0.1] bg-[#0c1024]/98 p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                      <p className="text-xs font-bold text-zinc-100 truncate">{displayName}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                    >
                      <Shield className="h-3.5 w-3.5 text-amber-400" />
                      Creator Studio
                    </Link>

                    <Link
                      href="/my-series"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                    >
                      <Clapperboard className="h-3.5 w-3.5 text-purple-400" />
                      My Series
                    </Link>

                    <Link
                      href="/wallet"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                    >
                      <Coins className="h-3.5 w-3.5 text-emerald-400" />
                      Wallet & Points
                    </Link>

                    <div className="my-1 border-t border-white/[0.06]" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:border-amber-400/50 hover:text-amber-300 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}