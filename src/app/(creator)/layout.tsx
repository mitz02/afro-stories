"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
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
import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { stickerAvatar } from "@/lib/stickers";
import { Loader2 } from "lucide-react";

interface SessionProfile {
  id: string;
  username: string;
  display_name: string | null;
  role: "viewer" | "creator" | "admin";
  avatar: string | null;
  email: string;
}

interface CreatorIdentity {
  display_name: string | null;
  username: string;
  avatar_gradient: string | null;
  followers_count: number;
  total_videos: number;
  status: string;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "C";
}

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
  const [user, setUser] = useState<SessionProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState<CreatorIdentity | null>(null);
  const [identityLoading, setIdentityLoading] = useState(true);
  const fetchedFor = React.useRef<string | null>(null);

  // Only fetch session on client side
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        const email = session.user.email ?? "";
        const fallback = email.split("@")[0] || "Guest";
        const { data } = await supabase
          .from("users")
          .select("id, username, display_name, role, avatar")
          .eq("id", session.user.id)
          .maybeSingle();
        const metaAvatar = session.user.user_metadata?.avatar as string | undefined;
        const avatar = data?.avatar ?? metaAvatar ?? stickerAvatar(session.user.id + (session.user.email ?? ""));
        setUser({
          id: session.user.id,
          username: data?.username ?? fallback,
          display_name: data?.display_name ?? fallback,
          role: data?.role ?? "viewer",
          avatar,
          email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session) {
        // Refresh will be handled by the effect below
      } else {
        setUser(null);
      }
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch creator identity when user changes
  useEffect(() => {
    if (!user || fetchedFor.current === user.id) return;
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("id, display_name, username, avatar_gradient, followers_count, total_videos, status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (profile) {
        const p = profile as {
          id: string;
          display_name: string | null;
          username: string;
          avatar_gradient: string | null;
          followers_count: number;
          total_videos: number;
          status: string;
        };
        const { count } = await supabase
          .from("videos")
          .select("*", { count: "exact", head: true })
          .eq("creator_id", p.id);
        if (cancelled) return;
        setIdentity({
          display_name: p.display_name,
          username: p.username,
          avatar_gradient: p.avatar_gradient,
          followers_count: p.followers_count ?? 0,
          total_videos: count ?? p.total_videos ?? 0,
          status: p.status,
        });
      }
      fetchedFor.current = user.id;
      setIdentityLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName = identity?.display_name ?? user?.display_name ?? "Creator";
  const userInitials = initials(displayName);
  const gradient =
    identity?.avatar_gradient && identity.avatar_gradient.includes("from-")
      ? identity.avatar_gradient
      : "from-amber-500 to-orange-700";

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

        {/* Creator identity */}
        <div className="border-b border-white/[0.06] px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-gold/25 bg-gradient-to-br from-gold/[0.08] to-transparent p-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0e1329] font-display text-lg font-bold text-white"
              style={{
                backgroundImage: user?.avatar
                  ? "none"
                  : `linear-gradient(135deg, ${gradient.split(" ")[0].replace("from-", "")}, ${gradient.split(" ")[1]?.replace("to-", "") ?? ""})`,
              }}
            >
              {identityLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white/70" />
              ) : user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                userInitials
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-cream">{displayName}</p>
              <p className="text-[11px] text-emerald-400">
                Creator ·{" "}
                {identity?.status
                  ? identity.status[0].toUpperCase() + identity.status.slice(1)
                  : "Approved"}
              </p>
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
        {/* Top bar - responsive */}
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b border-white/[0.06] bg-charcoal/90 px-3 sm:px-4 md:px-6 backdrop-blur-xl">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Title - truncated on small screens */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-bold text-cream truncate sm:text-xl">
              Creator Studio
            </h1>
          </div>

          {/* Right side - responsive */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Stats pill - hidden on mobile, icon only on sm, full on lg */}
            <div className="hidden sm:flex lg:hidden items-center gap-1.5 rounded-xl border border-gold/25 bg-gold/[0.06] px-2.5 py-1.5 text-xs">
              <span className="font-bold text-gold">{identity ? identity.total_videos : "—"}</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-bold text-gold">{identity ? identity.followers_count.toLocaleString() : "—"}</span>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-gold/25 bg-gold/[0.06] px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">Videos:</span>{" "}
              <span className="font-bold text-gold">{identity ? identity.total_videos : "—"}</span>
              <span className="text-muted-foreground">· Followers:</span>{" "}
              <span className="font-bold text-gold">{identity ? identity.followers_count.toLocaleString() : "—"}</span>
            </div>

            {/* Avatar - responsive sizing */}
            <div
              className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0e1329] font-display font-bold text-white transition-colors hover:ring-2 hover:ring-gold/50"
              style={{
                backgroundImage: user?.avatar
                  ? "none"
                  : `linear-gradient(135deg, ${gradient.split(" ")[0].replace("from-", "")}, ${gradient.split(" ")[1]?.replace("to-", "") ?? ""})`,
                width: "36px",
                height: "36px",
                minWidth: "36px",
              }}
            >
              {identityLoading ? (
                <span className="text-xs">…</span>
              ) : user?.avatar ? (
                <img src={user.avatar} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm sm:text-base">{userInitials}</span>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}