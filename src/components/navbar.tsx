"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Clapperboard,
  PlaySquare,
  Users,
  Search,
  Bell,
  Plus,
  LogOut,
  Wallet,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchModal } from "@/components/search-modal";
import { NotificationPanel } from "@/components/notification-panel";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { stickerAvatar } from "@/lib/stickers";

const navLinks = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/series", label: "Series", icon: Clapperboard },
  { href: "/shorts", label: "Shorts", icon: PlaySquare },
  { href: "/creators", label: "Creators", icon: Users },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useSessionProfile();
  const { setSearchOpen, notificationsOpen, setNotificationsOpen } = useUiStore();
  const [scrolled, setScrolled] = useState(false);

  if (typeof window !== "undefined") {
    window.addEventListener(
      "scroll",
      () => setScrolled(window.scrollY > 24),
      { passive: true }
    );
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all",
          scrolled
            ? "border-b border-white/[0.06] bg-background/85 backdrop-blur-xl"
            : "bg-gradient-to-b from-black/70 to-transparent"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
const active =
            link.href === "/home"
              ? pathname === "/home"
              : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-gold/10 text-gold"
                      : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>

            <NotificationPanel
              open={notificationsOpen}
              onOpenChange={setNotificationsOpen}
            />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-9 w-9 overflow-hidden rounded-full border border-gold/40 transition-transform hover:scale-105">
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={user.avatar ?? stickerAvatar(user.email)}
                      alt={user.display_name ?? "Profile"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs text-white">
                      {(user.display_name ?? user.username ?? "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium text-cream">
                      {user.display_name ?? user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    render={<Link href="/creator/c_chiefuwa" />}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/wallet" />}>
                    <Wallet className="mr-2 h-4 w-4" />
                    Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/dashboard" />}>
                    <Plus className="mr-2 h-4 w-4" />
                    Creator Dashboard
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem render={<Link href="/admin" />}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => {
                      void signOut();
                      router.push("/");
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-full bg-gradient-to-r from-gold to-burnt-orange px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition-all hover:brightness-110 sm:inline-block"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </header>

      <SearchModal />
    </>
  );
}