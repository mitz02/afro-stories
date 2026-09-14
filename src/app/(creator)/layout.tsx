"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Clapperboard,
  Layers,
  Film,
  BarChart3,
  Coins,
  Users,
  MessageCircle,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navSections = [
  {
    title: "Manage",
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        icon: LayoutDashboard,
        exact: true,
      },
      { href: "/upload", label: "Upload", icon: Upload },
      { href: "/videos", label: "My Videos", icon: Clapperboard },
      { href: "/my-series", label: "My Series", icon: Layers },
      { href: "/episodes", label: "Episodes", icon: Film },
    ],
  },
  {
    title: "Grow",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/earnings", label: "Earnings", icon: Coins },
      { href: "/followers", label: "Followers", icon: Users },
      { href: "/comments", label: "Comments", icon: MessageCircle },
    ],
  },
  {
    title: "Tools",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-charcoal">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.06] bg-charcoal-raised transition-transform md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
          <Link href="/">
            <Logo linkToHome={false} />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-muted-foreground hover:text-foreground md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Creator switch */}
        <div className="border-b border-white/[0.06] px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-gold/25 bg-gradient-to-br from-gold/[0.08] to-transparent p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 font-display text-lg font-bold text-white">
              CU
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-cream">
                Chief Uwa Folktales
              </p>
              <p className="text-[11px] text-emerald-400">Creator · Approved</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-gold/10 text-gold"
                          : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {item.label === "Upload" && (
                        <span className="ml-auto rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                          NEW
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] p-4">
          <Link
            href="/home"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Clapperboard className="h-4 w-4" />
            Back to Viewer
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col md:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/[0.06] bg-charcoal/90 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-muted-foreground hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-cream">
              Creator Studio
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden rounded-xl border border-gold/25 bg-gold/[0.06] px-4 py-2 text-xs sm:block">
              <span className="text-muted-foreground">Available:</span>{" "}
              <span className="font-bold text-gold">₦842,500</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 font-display text-sm font-bold text-white">
              CU
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}