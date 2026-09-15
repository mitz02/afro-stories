"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Clapperboard,
  Users,
  MessageCircle,
  Flag,
  Settings,
  Coins,
  Shield,
  LogOut,
  X,
  ExternalLink,
} from "lucide-react";
import { useToastStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { cn } from "@/lib/utils";

const adminNav = [
  {
    section: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    section: "Content",
    items: [
      { href: "/admin/videos", label: "Videos", icon: Film },
      { href: "/admin/series", label: "Series", icon: Clapperboard },
    ],
  },
  {
    section: "Creators",
    items: [{ href: "/admin/creators", label: "Creators", icon: Users }],
  },
  {
    section: "Community",
    items: [
      { href: "/admin/comments", label: "Comments", icon: MessageCircle },
      { href: "/admin/reports", label: "Reports", icon: Flag },
    ],
  },
  {
    section: "System",
    items: [
      { href: "/admin/settings", label: "Feature Controls", icon: Settings },
      { href: "/admin/pricing", label: "Point Pricing", icon: Coins },
    ],
  },
];

export function AdminBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_20px_rgba(245,185,66,0.4)]">
        <Shield className="h-5 w-5 text-neutral-950" strokeWidth={2.4} />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-[17px] font-bold tracking-tight text-white">
            Afri<span className="text-white">Tales</span>
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-400/90">
            Admin Console
          </p>
        </div>
      )}
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
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
        active
          ? "bg-[#5438dc] text-white shadow-[0_4px_16px_rgba(84,56,220,0.45)]"
          : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
      )}
    >
      <Icon
        className={cn(
          "h-[17px] w-[17px] shrink-0 transition-transform group-hover:scale-105",
          active ? "text-amber-300" : "text-zinc-400 group-hover:text-white"
        )}
        strokeWidth={active ? 2.2 : 1.8}
      />
      <span>{label}</span>
    </Link>
  );
}

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useSessionProfile();
  const showToast = useToastStore((s) => s.showToast);

  const displayName = user?.display_name ?? user?.email ?? "Admin";
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";

  const handleSignOut = async () => {
    await signOut();
    showToast("Signed out", "See you soon!");
    router.push("/home");
  };

  return (
    <div className="flex h-full flex-col px-3.5 py-5">
      {/* Brand */}
      <div className="mb-7">
        <AdminBrand />
      </div>

      {/* Nav */}
      <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-0.5">
        {adminNav.map((group) => {
          const active = group.items.some(
            (i) => i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href)
          );
          return (
            <div key={group.section}>
              <p
                className={cn(
                  "mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] transition-colors",
                  active ? "text-amber-400/80" : "text-zinc-500"
                )}
              >
                {group.section}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      active={isActive}
                      onClick={onNavigate}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* System status card */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-[#0e122b] via-[#0b0e22] to-[#070918] p-4">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <p className="text-[11px] font-bold text-emerald-300">All systems operational</p>
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-zinc-400">
              Streaming, uploads and social features running normally.
            </p>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-emerald-500/[0.07] to-transparent" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 space-y-2.5 border-t border-white/[0.06] pt-3.5">
        <Link
          href="/home"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Back to site
        </Link>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0d1226]/90 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-sm font-black text-neutral-950 ring-2 ring-amber-400/60">
            {initial}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-bold text-white">{displayName}</p>
            <p className="text-[10px] text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <Shield className="h-2.5 w-2.5 text-amber-400" />
                Administrator
              </span>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-white/[0.08] bg-[#070a18] lg:block">
      <AdminSidebarContent />
    </aside>
  );
}

export function AdminMobileSidebar({
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
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[264px] flex-col overflow-hidden border-r border-white/10 bg-[#070a18] shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-3.5 z-20 rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        <AdminSidebarContent onNavigate={onClose} />
      </aside>
    </div>
  );
}