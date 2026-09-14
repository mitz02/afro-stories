"use client";

import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notifications } from "@/lib/data/notifications";
import { timeAgo, cn } from "@/lib/utils";
import { useState } from "react";

export function NotificationPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [allRead, setAllRead] = useState(false);
  const unread = allRead ? 0 : notifications.filter((n) => !n.read).length;

  const typeStyles: Record<string, string> = {
    new_episode: "from-purple-600/30 to-transparent",
    new_video: "from-purple-600/30 to-transparent",
    series_release: "from-gold/30 to-transparent",
    follow: "from-sky-600/30 to-transparent",
    like: "from-rose-600/30 to-transparent",
    comment: "from-emerald-600/30 to-transparent",
    unlock: "from-gold/40 to-transparent",
    earnings: "from-emerald-600/40 to-transparent",
    withdrawal: "from-sky-600/40 to-transparent",
    system: "from-violet-600/30 to-transparent",
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
          />
        }
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-crimson px-1 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] border-white/[0.08] bg-charcoal-raised p-0">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
          <h3 className="font-display text-sm font-bold text-cream">Notifications</h3>
          <button
            onClick={() => setAllRead(true)}
            className="flex items-center gap-1 text-xs text-gold transition-colors hover:text-gold-dim"
          >
            <Check className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 && (
            <div className="py-10 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
            </div>
          )}

          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link ?? "#"}
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex gap-3 border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.04]",
                !n.read && !allRead && "bg-white/[0.03]"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br text-white",
                  typeStyles[n.type] ?? "from-purple-600/30 to-transparent"
                )}
              >
                {n.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-snug text-cream">
                  {n.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {n.message}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground/60">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
              {!n.read && !allRead && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
              )}
            </Link>
          ))}
        </div>

        <div className="border-t border-white/[0.08] p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            View all
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}