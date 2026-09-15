"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, LogOut, ExternalLink, Shield, ChevronDown } from "lucide-react";
import { AdminBrand } from "@/components/admin/admin-sidebar";
import { useToastStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { cn } from "@/lib/utils";

const pageTitles: { match: string; title: string }[] = [
  { match: "/admin/settings", title: "Feature Controls" },
  { match: "/admin/reports", title: "Reports" },
  { match: "/admin/comments", title: "Comments" },
  { match: "/admin/creators", title: "Creators" },
  { match: "/admin/series", title: "Series" },
  { match: "/admin/videos", title: "Videos" },
  { match: "/admin", title: "Dashboard" },
];

function usePageTitle(pathname: string) {
  const item = pageTitles.find((p) => p.match === pathname || pathname.startsWith(p.match));
  return item?.title ?? "Admin";
}

export function AdminTopBar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const { user, signOut } = useSessionProfile();
  const [profileOpen, setProfileOpen] = React.useState(false);

  const displayName = user?.display_name ?? user?.email ?? "Admin";
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";

  const handleSignOut = async () => {
    setProfileOpen(false);
    await signOut();
    showToast("Signed out", "See you soon!");
    router.push("/home");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070a18]/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu + brand */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onMenu}
            aria-label="Open admin menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <AdminBrand compact />
        </div>

        {/* Page title (desktop) */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5438dc]/20 text-amber-300">
            <Shield className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-white">{usePageTitle(pathname)}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Admin Console
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/home"
            className="hidden h-9 sm:h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 sm:px-4 text-[11px] sm:text-xs font-semibold text-zinc-300 transition-colors hover:border-white/25 hover:text-white sm:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View site
          </Link>

          <button
            onClick={() => showToast("No new alerts", "You're all caught up, admin.")}
            aria-label="Notifications"
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-[#0e1329]/80 text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-0.5 top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-50" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
            </span>
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen((o) => !o)}
              aria-label="Open admin profile menu"
              className="flex items-center gap-2.5 rounded-full p-0.5 transition-colors hover:bg-white/[0.06]"
            >
              <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-sm font-black text-neutral-950 ring-2 ring-amber-400/80 shadow-md">
                {initial}
              </div>
              <div className="hidden text-left xl:block leading-tight pr-1">
                <p className="text-xs font-bold text-white">{displayName}</p>
                <p className="text-[10px] text-amber-400/90">Administrator</p>
              </div>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform",
                  profileOpen && "rotate-180"
                )}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1226] shadow-2xl backdrop-blur-xl">
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <p className="truncate text-sm font-bold text-white">{displayName}</p>
                  <p className="text-[11px] text-zinc-400">Administrator account</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <Shield className="h-4 w-4 text-amber-300" />
                    Feature Controls
                  </Link>
                  <Link
                    href="/home"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Back to site
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
        </div>
      </div>
    </header>
  );
}