"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Plus, Coins, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionProfile } from "@/lib/supabase/use-auth";

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  {
    href: "/upload",
    label: "Create",
    icon: Plus,
    prominent: true,
  },
];

// Earnings - only for creators
const earningsItem = { href: "/earnings", label: "Earnings", icon: Coins };

// Profile - always visible, navigates to settings if logged in, login page if not
const profileItem = {
  href: "/settings",
  label: "Profile",
  icon: User,
  loginHref: "/login?redirect=/settings",
};

export function BottomNavigation() {
  const pathname = usePathname();
  const { user, loading } = useSessionProfile();
  const isCreator = user?.role === "creator";

  // Don't render creator items until user data is loaded
  if (loading) {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5">
          {items.map((item) => {
            const active = item.href === "/home" ? pathname === "/home" : pathname.startsWith(item.href);

            if (item.prominent) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center py-2"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-burnt-orange text-black shadow-lg shadow-gold/30 -mt-5 border-4 border-background">
                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <span className="mt-0.5 text-[10px] font-semibold text-gold">
                    Create
                  </span>
                </Link>
              );
            }

            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2",
                  active ? "text-gold" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className={cn("text-[10px]", active ? "font-semibold" : "font-medium")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // Profile link - goes to settings if logged in, login page with redirect if not
  const profileHref = user ? profileItem.href : profileItem.loginHref;
  const profileActive = user ? pathname.startsWith(profileItem.href) : false;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const active = item.href === "/home" ? pathname === "/home" : pathname.startsWith(item.href);

          if (item.prominent) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center py-2"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-burnt-orange text-black shadow-lg shadow-gold/30 -mt-5 border-4 border-background">
                  <Plus className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <span className="mt-0.5 text-[10px] font-semibold text-gold">
                  Create
                </span>
              </Link>
            );
          }

          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2",
                active ? "text-gold" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              <span className={cn("text-[10px]", active ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Earnings - only for creators */}
        {isCreator && (
          <Link
            key={earningsItem.href}
            href={earningsItem.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-2",
              pathname.startsWith(earningsItem.href) ? "text-gold" : "text-muted-foreground"
            )}
          >
            <Coins className="h-5 w-5" strokeWidth={pathname.startsWith(earningsItem.href) ? 2.4 : 1.8} />
            <span className={cn("text-[10px]", pathname.startsWith(earningsItem.href) ? "font-semibold" : "font-medium")}>
              {earningsItem.label}
            </span>
          </Link>
        )}

        {/* Profile - always visible */}
        <Link
          key={profileItem.href}
          href={profileHref}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 py-2",
            profileActive ? "text-gold" : "text-muted-foreground"
          )}
        >
          <User className="h-5 w-5" strokeWidth={profileActive ? 2.4 : 1.8} />
          <span className={cn("text-[10px]", profileActive ? "font-semibold" : "font-medium")}>
            {profileItem.label}
          </span>
        </Link>
      </div>
    </nav>
  );
}