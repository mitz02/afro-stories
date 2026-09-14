"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1024] p-5 sm:p-7 lg:p-8 shadow-xl">
      {/* Background artwork on the right */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-2/3 lg:w-[58%] overflow-hidden">
        <Image
          src="/home-assets/hero-artwork.jpg"
          alt="Epic African Stories"
          fill
          priority
          className="object-cover object-right"
          sizes="(max-width: 768px) 100vw, 60vw"
        />
        {/* Soft edge blend gradient on left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1024] via-[#0c1024]/70 to-transparent" />
        {/* Vertical gradient on small screens to ensure text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1024] via-[#0c1024]/50 to-transparent sm:hidden" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-lg">
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black leading-tight tracking-tight text-white">
          Epic Stories.
          <br />
          Timeless Culture.
          <br />
          <span className="text-[#f5b942]">Real Value.</span>
        </h1>

        <p className="mt-3 max-w-sm sm:max-w-md text-xs sm:text-[13px] leading-relaxed text-zinc-300">
          Discover amazing African stories, from love and romance to comedy,
          action, drama and more. Watch, enjoy and be part of a growing community
          of storytellers.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full bg-[#f5b942] px-5 py-2 text-xs sm:text-sm font-bold text-black transition-transform hover:scale-[1.03] hover:bg-[#ffc857] shadow-[0_4px_16px_rgba(245,185,66,0.35)]"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Explore Stories
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center rounded-full border border-white/20 bg-black/20 px-5 py-2 text-xs sm:text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10"
          >
            How it Works
          </Link>
        </div>
      </div>
    </section>
  );
}