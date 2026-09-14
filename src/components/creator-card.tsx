"use client";

import Link from "next/link";
import { Eye, UserPlus, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/ui/badges";
import { getCountry } from "@/lib/data/countries";
import { cn, formatNumber } from "@/lib/utils";
import { useSocialStore } from "@/lib/store";
import type { CreatorProfile } from "@/types";

export function CreatorCard({
  creator,
  className,
  showFollow = true,
}: {
  creator: CreatorProfile;
  className?: string;
  showFollow?: boolean;
}) {
  const country = getCountry(creator.country);
  const { followedCreators, toggleFollowCreator } = useSocialStore();
  const isFollowing = followedCreators.includes(creator.id);
  const initials = creator.displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      className={cn(
        "shrink-0 rounded-2xl border border-white/[0.06] bg-charcoal-raised p-4 text-center transition-colors hover:border-gold/30",
        className
      )}
    >
      <Link href={`/creator/${creator.id}`} className="block">
        <Avatar className="mx-auto h-20 w-20 border-2 border-gold/40">
          <AvatarImage src={creator.avatar} alt={creator.displayName} />
          <AvatarFallback
            className={cn("font-display text-2xl", creator.avatarGradient)}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>

      <Link href={`/creator/${creator.id}`} className="group mt-3 block">
        <div className="flex items-center justify-center gap-1">
          <h3 className="line-clamp-1 font-display text-sm font-semibold text-cream group-hover:text-gold">
            {creator.displayName}
          </h3>
          {creator.verified && <VerifiedBadge size={14} />}
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {creator.city}, {country?.name ?? creator.country}
        </p>
      </Link>

      <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
        <span className="font-semibold text-cream">{formatNumber(creator.followers)}</span>
        <span>followers</span>
        <span className="text-white/15">•</span>
        <span className="inline-flex items-center gap-0.5">
          <Eye className="h-3 w-3" />
          {formatNumber(creator.totalViews)}
        </span>
      </div>

      {showFollow && (
        <button
          onClick={() => toggleFollowCreator(creator.id)}
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-semibold transition-all",
            isFollowing
              ? "bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1]"
              : "bg-gold text-black hover:bg-gold-dim"
          )}
        >
          {isFollowing ? (
            <>
              <Check className="h-3.5 w-3.5" /> Following
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" /> Follow
            </>
          )}
        </button>
      )}
    </div>
  );
}