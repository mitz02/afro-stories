"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Film,
  Layers,
  Heart,
  MessageSquare,
  UserCheck,
  Coins,
  Sparkles,
  LockOpen,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/lib/store";

export interface ApiNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  image: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
  timeAgo: string;
}

interface NotificationPanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerClassName?: string;
}

function getTypeIcon(type: string) {
  switch (type) {
    case "new_episode":
    case "new_video":
      return <Film className="h-4 w-4 text-purple-300" />;
    case "series_release":
      return <Layers className="h-4 w-4 text-amber-300" />;
    case "like":
      return <Heart className="h-4 w-4 text-rose-400" />;
    case "comment":
      return <MessageSquare className="h-4 w-4 text-emerald-300" />;
    case "follow":
      return <UserCheck className="h-4 w-4 text-sky-300" />;
    case "unlock":
      return <LockOpen className="h-4 w-4 text-amber-400" />;
    case "earnings":
    case "withdrawal":
      return <Coins className="h-4 w-4 text-yellow-300" />;
    case "system":
    default:
      return <Sparkles className="h-4 w-4 text-indigo-300" />;
  }
}

function getTypeBg(type: string) {
  switch (type) {
    case "new_episode":
    case "new_video":
      return "bg-purple-500/20 border-purple-500/30 text-purple-300";
    case "series_release":
      return "bg-amber-500/20 border-amber-500/30 text-amber-300";
    case "like":
      return "bg-rose-500/20 border-rose-500/30 text-rose-400";
    case "comment":
      return "bg-emerald-500/20 border-emerald-500/30 text-emerald-300";
    case "follow":
      return "bg-sky-500/20 border-sky-500/30 text-sky-300";
    case "unlock":
      return "bg-amber-400/20 border-amber-400/30 text-amber-400";
    case "earnings":
    case "withdrawal":
      return "bg-yellow-500/20 border-yellow-500/30 text-yellow-300";
    case "system":
    default:
      return "bg-indigo-500/20 border-indigo-500/30 text-indigo-300";
  }
}

export function NotificationPanel({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  triggerClassName,
}: NotificationPanelProps) {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);

  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOnOpenChange) controlledOnOpenChange(next);
      else setInternalOpen(next);
    },
    [controlledOnOpenChange]
  );

  const [items, setItems] = React.useState<ApiNotification[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [tab, setTab] = React.useState<"all" | "unread">("all");
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Load notifications from API
  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const body = (await res.json()) as {
          notifications?: ApiNotification[];
          unread?: number;
        };
        const fetchedItems = body.notifications ?? [];
        setItems(fetchedItems);
        const computedUnread =
          typeof body.unread === "number"
            ? body.unread
            : fetchedItems.filter((n) => !n.read).length;
        setUnread(computedUnread);
      }
    } catch (err) {
      console.warn("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch immediately on mount so unread count appears right away
  React.useEffect(() => {
    void load();
  }, [load]);

  // Re-fetch whenever the dropdown opens
  React.useEffect(() => {
    if (isOpen) {
      void load();
    }
  }, [isOpen, load]);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setOpen]);

  // Mark all notifications as read
  const markAllRead = async () => {
    if (unread === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    showToast("Notifications cleared", "All notifications marked as read.");

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch {
      // Optimistic update retained
    }
  };

  // Mark single notification as read
  const markRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnread((u) => Math.max(0, u - 1));

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch {
      // Optimistic update retained
    }
  };

  const handleItemClick = (n: ApiNotification) => {
    if (!n.read) {
      void markRead(n.id);
    }
    setOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

  const filteredItems = React.useMemo(() => {
    if (tab === "unread") {
      return items.filter((n) => !n.read);
    }
    return items;
  }, [items, tab]);

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className={cn(
          "relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-[#0e1329]/80 text-zinc-300 transition-all hover:border-white/25 hover:text-white",
          isOpen && "border-amber-400/50 bg-[#141b38] text-amber-300 shadow-[0_0_12px_rgba(245,185,66,0.2)]",
          triggerClassName
        )}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9.5px] font-black text-white shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 z-50 w-[350px] sm:w-[390px] overflow-hidden rounded-2xl border border-white/12 bg-[#0c1024]/95 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-[#0e132c]/80">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Notifications</h3>
              {unread > 0 && (
                <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  {unread} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-amber-400 hover:bg-amber-400/10 transition-colors"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-white/[0.06] px-4 bg-black/20">
            <button
              onClick={() => setTab("all")}
              className={cn(
                "py-2 px-3 text-xs font-semibold border-b-2 transition-colors",
                tab === "all"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              )}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setTab("unread")}
              className={cn(
                "py-2 px-3 text-xs font-semibold border-b-2 transition-colors",
                tab === "unread"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              )}
            >
              Unread ({unread})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto no-scrollbar divide-y divide-white/[0.04]">
            {loading && items.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400 mb-2" />
                <p>Loading notifications…</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 text-center px-4">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-zinc-400 mb-2.5">
                  <Bell className="h-5 w-5 opacity-40" />
                </div>
                <p className="text-xs font-bold text-white">
                  {tab === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {tab === "unread"
                    ? "You are all caught up on your alerts."
                    : "Stories, unlock events, and updates will appear here."}
                </p>
              </div>
            ) : (
              filteredItems.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={cn(
                    "group relative flex items-start gap-3 p-3.5 cursor-pointer transition-all hover:bg-white/[0.06]",
                    !n.read ? "bg-indigo-500/[0.04]" : "opacity-85"
                  )}
                >
                  {/* Left Icon or Thumbnail */}
                  <div className="relative shrink-0">
                    {n.image ? (
                      <div className="h-10 w-10 overflow-hidden rounded-xl bg-zinc-800 border border-white/10">
                        <img
                          src={n.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl border",
                          getTypeBg(n.type)
                        )}
                      >
                        {getTypeIcon(n.type)}
                      </div>
                    )}
                    {!n.read && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,185,66,0.8)]" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p
                        className={cn(
                          "truncate text-xs font-bold",
                          !n.read ? "text-white" : "text-zinc-300"
                        )}
                      >
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-zinc-500 tabular-nums">
                        {n.timeAgo}
                      </span>
                    </div>

                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors">
                      {n.message}
                    </p>

                    {n.link && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-amber-400/90 group-hover:text-amber-300">
                        <span>View</span>
                        <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
                      </p>
                    )}
                  </div>

                  {/* Mark as read single button */}
                  {!n.read && (
                    <button
                      onClick={(e) => void markRead(n.id, e)}
                      title="Mark as read"
                      aria-label="Mark as read"
                      className="opacity-0 group-hover:opacity-100 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 text-zinc-300 hover:bg-amber-400 hover:text-black transition-all"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2.5 bg-[#0e132c]/80 text-[11px]">
            <span className="text-zinc-400">
              {unread > 0 ? `${unread} unread updates` : "All caught up"}
            </span>
            <Link
              href="/home"
              onClick={() => setOpen(false)}
              className="font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Explore Feed &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
