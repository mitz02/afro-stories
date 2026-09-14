"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Country } from "@/types";

export function CountryCard({
  country,
  className,
  compact = false,
}: {
  country: Country;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/explore?country=${country.code}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.06]",
        compact ? "aspect-[4/3]" : "aspect-[3/4]",
        className
      )}
    >
      {/* Gradient background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-110",
          country.gradient
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Flag */}
      <div
        className={cn(
          "flex items-center justify-center",
          compact ? "pt-3 text-3xl" : "pt-6 text-5xl"
        )}
      >
        <span className="drop-shadow-lg">{country.flag}</span>
      </div>

      {/* Label */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="font-display text-sm font-bold text-white">
          {country.name}
        </h3>
        {!compact && (
          <p className="mt-0.5 text-[11px] text-white/70">
            {country.contentCount.toLocaleString()} stories · {country.creatorCount}{" "}
            creators
          </p>
        )}
        {!compact && (
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-gold opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-3 w-3 fill-current" />
            Explore {country.name}
            <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </div>
    </Link>
  );
}