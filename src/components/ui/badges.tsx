import { cn } from "@/lib/utils";
import { Sparkles, Lock, BadgeCheck, ShieldCheck, UserCircle2 } from "lucide-react";
import type { ContentOrigin } from "@/types";

export function AIBadge({
  origin,
  size = "sm",
  className,
}: {
  origin: ContentOrigin;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const config = {
    ai_generated: {
      label: "AI Generated",
      icon: Sparkles,
      styles: "border-violet-500/40 bg-violet-500/15 text-violet-200",
    },
    ai_assisted: {
      label: "AI Assisted",
      icon: Sparkles,
      styles: "border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-200",
    },
    human: {
      label: "Human Created",
      icon: UserCircle2,
      styles: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
    },
  }[origin];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "xs" && "px-1.5 py-0.5 text-[9px]",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-2.5 py-1 text-xs",
        config.styles,
        className
      )}
    >
      <Icon className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {config.label}
    </span>
  );
}

export function PremiumBadge({
  points,
  size = "sm",
  className,
}: {
  points?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gradient-to-r from-gold/20 to-orange-500/20 font-medium text-gold",
        size === "xs" && "px-1.5 py-0.5 text-[9px]",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Lock className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {points ? `${points} pts` : "Premium"}
    </span>
  );
}

export function VerifiedBadge({
  size = 14,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <BadgeCheck
      style={{ width: size, height: size }}
      className={cn("shrink-0 fill-gold text-background", className)}
    />
  );
}

export function SecurityBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200",
        className
      )}
    >
      <ShieldCheck className="h-3 w-3" />
      Verified
    </span>
  );
}