"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { trendingStories } from "@/lib/data/home-data";

export function HomeTrending() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-[#0c1024] p-4 shadow-xl">
      {/* Widget Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🔥</span>
        <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-tight">
          Trending Now
        </h3>
      </div>

      {/* 3 Trending Items */}
      <div className="space-y-2.5">
        {trendingStories.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex items-center justify-between gap-2.5 rounded-xl border border-white/[0.04] bg-white/[0.02] p-2 transition-colors hover:border-white/10 hover:bg-white/[0.05]"
          >
            {/* Thumbnail */}
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="50px"
              />
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                {item.title}
              </p>
              <div className="mt-1 flex items-center gap-2">
                {/* Coin Badge */}
                <div className="flex items-center gap-1">
                  <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-black text-black">
                    $
                  </div>
                  <span className="text-[11px] font-bold text-amber-300">
                    {item.price}
                  </span>
                </div>

                {/* Status Badge */}
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-semibold border ${
                    item.status === "Completed"
                      ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-400"
                      : "border-sky-500/40 bg-sky-950/40 text-sky-400"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}