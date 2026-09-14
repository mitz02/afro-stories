"use client";

import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative h-1 w-full overflow-hidden rounded-full bg-white/20", className)}>
      <div
        className={cn("h-full rounded-full bg-gold transition-all", barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}