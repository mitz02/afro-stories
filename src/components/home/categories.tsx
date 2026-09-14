"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { homeCategories } from "@/lib/data/home-data";

export function HomeCategories() {
  return (
    <section className="space-y-3 sm:space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight">
          Browse by Category
        </h2>
        <Link
          href="/explore"
          className="flex items-center gap-1 text-xs sm:text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          View all categories
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 10 Category Cards */}
      <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2.5 pb-1 lg:grid lg:grid-cols-10 lg:gap-2.5">
        {homeCategories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className={`group relative flex flex-col items-center justify-between rounded-xl border ${cat.borderClass} bg-gradient-to-b ${cat.bgGradient} p-2 text-center transition-all duration-200 hover:scale-[1.04] hover:shadow-lg w-[88px] shrink-0 sm:w-[96px] lg:w-auto snap-start`}
          >
            {/* Top Icon Artwork */}
            <div className="relative h-10 w-full overflow-hidden rounded-md flex items-center justify-center">
              <Image
                src={cat.iconImage}
                alt={cat.name}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-110"
                sizes="100px"
              />
            </div>

            {/* Title & Stories count */}
            <div className="mt-1.5 w-full">
              <p className="truncate text-[11px] sm:text-xs font-bold text-white leading-tight">
                {cat.name}
              </p>
              <p className="mt-0.5 text-[9.5px] text-zinc-400">
                {cat.count}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}