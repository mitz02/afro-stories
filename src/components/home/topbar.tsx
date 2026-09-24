"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Menu, Bell, Wallet } from "lucide-react";
import { useWalletStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { formatNumber } from "@/lib/utils";
import { useUiStore } from "@/lib/store";
import { SearchModal } from "@/components/search-modal";
import { NotificationPanel } from "@/components/notification-panel";

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const walletBalance = useWalletStore((s) => s.balance);
  const { user, balance: realBalance } = useSessionProfile();
  const { setSearchOpen, notificationsOpen, setNotificationsOpen } = useUiStore();

  const signedIn = !!user;
  const balance = signedIn ? realBalance : walletBalance;

  return (
    <>
      <SearchModal />
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070a18]/90 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-4 lg:px-6">
          {/* Left: Mobile menu only */}
          <div className="flex items-center gap-2 lg:hidden min-w-0">
            <button
              onClick={onMenu}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Center: Search Icon - ALL screen sizes, opens SearchModal */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex w-full max-w-[200px] h-9 items-center justify-center gap-2 rounded-full border border-white/10 bg-[#0e1329]/80 pl-4 pr-3 text-xs text-white placeholder-zinc-400"
              aria-label="Search"
            >
              <Search className="h-4 w-4 text-zinc-400" />
              <span className="truncate">Search...</span>
            </button>
          </div>

          {/* Right Section - Notification, Wallet */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Notification Bell */}
            <NotificationPanel
              open={notificationsOpen}
              onOpenChange={setNotificationsOpen}
            />

            {/* Wallet Balance - hidden on mobile, shown on sm+ */}
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
          </div>
        </div>
      </header>
    </>
  );
}