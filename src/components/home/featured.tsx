"use client";

import * as React from "react";
import Link from "next/link";
import type { HomeUploadItem } from "@/app/api/home/uploads/route";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { featuredStories, type FeaturedStoryItem } from "@/lib/data/home-data";

function StoryCard({ story }: { story: FeaturedStoryItem }) {
  return (
    <Link
      href={story.href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c1024] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_8px_24px_rgba(84,56,220,0.2)]"
    >
      {/* Artwork container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
        <Image
          src={story.image}
          alt={story.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Subtle dark gradient overlay on the artwork */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1024] via-transparent to-black/30" />

        {/* Status Badge */}
        <div className="absolute top-2 right-2 z-10">
          <span
            className={`rounded-full px-2 py-0.5 text-[8.5px] font-semibold border backdrop-blur-md ${
              story.status === "Completed"
                ? "border-emerald-500/50 bg-emerald-950/70 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                : "border-sky-500/50 bg-sky-950/70 text-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.3)]"
            }`}
          >
            {story.status}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="relative flex flex-1 flex-col justify-between p-3 pt-2">
        <div>
          {/* Title */}
          <h3 className="truncate text-xs sm:text-[13px] font-bold text-white transition-colors group-hover:text-amber-300">
            {story.title}
          </h3>

          {/* Author */}
          <p className="truncate text-[10.5px] text-zinc-400 mt-0.5">
            {story.author}
          </p>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[8.5px] font-medium text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Price + Watch Button */}
        <div className="mt-3 flex items-center justify-between gap-2 pt-1">
          {/* Coin Price */}
          <div className="flex items-center gap-1.5">
            <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-black text-black shadow-sm">
              $
            </div>
            <span className="text-xs font-bold text-amber-300">
              {story.price}
            </span>
          </div>

          {/* Watch Button */}
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-zinc-200 backdrop-blur-sm transition-all duration-200 group-hover:border-indigo-400/60 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_0_14px_rgba(84,56,220,0.45)]">
            <Play className="h-2.5 w-2.5 fill-current" />
            Watch
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HomeFeatured() {
  const [realCards, setRealCards] = React.useState<FeaturedStoryItem[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function loadRealUploads() {
      try {
        const res = await fetch("/api/home/uploads");
        const body = (await res.json()) as { videos?: HomeUploadItem[] };
        if (cancelled || !Array.isArray(body.videos)) return;
        setRealCards(body.videos.map(toFeaturedCard));
      } catch {
        // keep dummy grid as-is on failure
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void loadRealUploads();
    return () => {
      cancelled = true;
    };
  }, []);

  // Real uploads replace the first `realCards.length` dummy entries;
  // the remaining dummy cards stay so the grid never shrinks.
  const merged =
    loaded && realCards.length > 0
      ? [...realCards, ...featuredStories.slice(realCards.length)]
      : featuredStories;

  return (
    <section className="space-y-3 sm:space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 text-sm sm:text-base">⭐</span>
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight">
            Featured Stories
          </h2>
        </div>
        <Link
          href="/explore"
          className="flex items-center gap-1 text-xs sm:text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 5-column responsive grid matching reference design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3.5">
        {merged.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}

function toFeaturedCard(upload: HomeUploadItem): FeaturedStoryItem {
  return {
    id: upload.id,
    title: upload.title,
    author: upload.author,
    status: upload.status === "Completed" ? "Completed" : "In Progress",
    tags: upload.tags,
    price: upload.price,
    image: upload.image,
    fullCard: upload.image,
    href: `/watch/${upload.id}`,
  };
}
