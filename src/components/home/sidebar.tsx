"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Compass,
  Shapes,
  Trophy,
  ShoppingBag,
  LayoutDashboard,
  Upload,
  Coins,
  BarChart3,
  Settings,
  X,
  Crown,
  LogOut,
  UserRound,
} from "lucide-react";
import { useToastStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/explore", label: "Categories", icon: Shapes },
  { href: "/shorts", label: "Rankings", icon: Trophy },
  { href: "/wallet", label: "Purchases", icon: ShoppingBag },
];

const personalItems = ["Purchases"];

const creatorNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/earnings", label: "Earnings", icon: Coins },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const authLabel = { viewer: "Story Lover", creator: "Creator", admin: "Admin" } as const;

export function AfriMask({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_16px_rgba(245,185,66,0.35)]",
        className || "h-9 w-9"
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[65%] w-[65%] text-neutral-950"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 2.5 22 7v7l-10 7-10-7V7l10-4.5Z" opacity="0.35" />
        <path
          d="M12 4.9 19.4 8v5.2L12 19.1l-7.4-5.9V8l7.4-3.1Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M12 8.2c.9 0 1.7.44 2.2 1.12L13 12.2c.28-.37.85-.6 1.6-.47l-.45 1.92c-.85-.06-1.5.22-1.97.73l-2.2-1.36c.57-.78 1.15-1.52 1.22-2.44.06-.7-.11-1.3-.5-1.85l1.32-.87c.1.94.65 1.4 1.98 1.32Z"
          stroke="currentColor"
          strokeWidth="0.9"
          fill="none"
        />
      </svg>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
        active
          ? "bg-[#5438dc] text-white shadow-[0_4px_16px_rgba(84,56,220,0.4)]"
          : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-105",
          active ? "text-white" : "text-zinc-400 group-hover:text-white"
        )}
        strokeWidth={active ? 2.2 : 1.8}
      />
      <span>{label}</span>
    </Link>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useSessionProfile();
  const showToast = useToastStore((s) => s.showToast);

  const isGuest = !user;
  const isCreator = user?.role === "creator";
  const displayName = user?.display_name ?? user?.email ?? "Guest";
  const initial = displayName.trim().charAt(0).toUpperCase() || "G";

  const navItems = isGuest
    ? mainNav.filter((item) => !personalItems.includes(item.label))
    : mainNav;

  const handleSignOut = async () => {
    await signOut();
    showToast("Signed out", "See you soon!");
    router.push("/home");
  };

  return (
    <div className="flex h-full flex-col px-3.5 py-4">
      {/* Brand Header */}
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <AfriMask className="h-9 w-9" />
        <div className="leading-tight">
          <p className="text-[17px] font-bold tracking-tight text-white">
            Afri<span className="text-white">Tales</span>
          </p>
          <p className="text-[9px] font-medium tracking-wider text-zinc-400">
            Our Stories. Our Wealth.
          </p>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 space-y-5 overflow-y-auto no-scrollbar pr-0.5">
        {/* Main Section */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/home"
                ? pathname === "/home" || pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href);

            return (
              <NavItem
                key={item.label}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={active}
                onClick={onNavigate}
              />
            );
          })}
        </div>

        {/* Creator Section */}
        {isCreator && (
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              FOR CREATORS
            </p>
            <div className="space-y-1">
              {creatorNav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <NavItem
                    key={item.label}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={active}
                    onClick={onNavigate}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Promo Card 1: Become a Creator (guests only) */}
        {isGuest && (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1226]/90 p-3.5 shadow-lg">
            <div className="relative z-10 pr-14">
              <p className="text-[13px] font-bold text-white">Become a Creator</p>
              <p className="mt-1 text-[10.5px] leading-snug text-zinc-400">
                Share your stories, earn and build your legacy.
              </p>
              <Link
                href="/register"
                onClick={onNavigate}
                className="mt-2.5 inline-block rounded-lg bg-[#f5b942] px-3 py-1.5 text-center text-[11px] font-bold text-black transition-all hover:bg-[#ffc857] hover:shadow-md"
              >
                Get Started
              </Link>
            </div>
            {/* Warrior Queen Illustration */}
            <div className="pointer-events-none absolute -bottom-1 -right-1 h-24 w-14 overflow-hidden">
              <Image
                src="/home-assets/warrior-queen.jpg"
                alt="Warrior Queen"
                fill
                className="object-cover object-top opacity-90"
                sizes="60px"
              />
            </div>
          </div>
        )}

        {/* Promo Card 2: Real Stories. Real People. African Dreams. */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-[#0e122b] via-[#0b0e22] to-[#070918] p-4 text-center shadow-lg">
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/10">
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            <p className="font-display text-[13px] font-bold leading-snug text-cream">
              Real Stories.
              <br />
              Real People.
              <br />
              <span className="text-amber-300/90">African Dreams.</span>
            </p>
          </div>

          {/* Savannah silhouette bottom artwork */}
          <div className="relative mt-3 h-14 w-full overflow-hidden rounded-lg">
            <Image
              src="/home-assets/savannah-silhouette.jpg"
              alt="African Savannah Sunset"
              fill
              className="object-cover object-center opacity-85"
              sizes="200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070918]/90 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Auth footer */}
      <div className="mt-4 border-t border-white/[0.06] pt-3.5">
        {isGuest ? (
          <div className="rounded-2xl border border-white/10 bg-[#0d1226]/90 p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
                <UserRound className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <p className="text-[12.5px] font-bold text-white">Not signed in</p>
                <p className="text-[10px] text-zinc-400">
                  Sign in for your library & wallet
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={onNavigate}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-xs font-semibold text-zinc-100 transition-colors hover:border-white/30 hover:bg-white/10"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={onNavigate}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[#f5b942] text-xs font-bold text-black transition-colors hover:bg-[#ffc857]"
              >
                Join Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0d1226]/90 px-3 py-2.5">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#0e1329] ring-2 ring-amber-400/60"
                style={{ backgroundImage: user.avatar ? "none" : "linear-gradient(135deg, #f59e0b, #b45309)" }}
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
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-bold text-white">
                {displayName}
              </p>
              <p className="text-[10px] text-zinc-400">{user?.role && authLabel[user.role]}</p>
            </div>
            <Link
              href={user?.role === "creator" ? "/dashboard" : "/settings"}
              onClick={onNavigate}
              aria-label="Profile settings"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-white/25 hover:text-white"
            >
              <UserRound className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[228px] border-r border-white/[0.08] bg-[#070a18] lg:block">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[260px] flex-col overflow-hidden border-r border-white/10 bg-[#070a18] shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-3.5 z-20 rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  );
}