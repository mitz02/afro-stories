"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { VideoCard } from "@/components/video-card";
import { SeriesCard } from "@/components/series-card";
import { GenreCard, genres } from "@/components/genre-card";
import { CountryCard } from "@/components/country-card";
import { videos } from "@/lib/data/videos";
import { series } from "@/lib/data/series";
import { countries } from "@/lib/data/countries";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "most_watched", label: "Most Watched" },
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
];

// Map home category keys (from /home Browse by Category) to explore genres.
const categoryGenre: Record<string, string> = {
  action: "Adventure",
  drama: "Drama",
  fantasy: "Fantasy",
  comedy: "Comedy",
  history: "History",
  family: "Kids",
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExploreContent />
    </Suspense>
  );
}

function ExploreSkeleton() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <div className="h-9 w-52 animate-shimmer rounded-lg" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-9 w-24 animate-shimmer rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-video animate-shimmer rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeGenre, setActiveGenre] = useState<string | null>(() => {
    const category = searchParams.get("category");
    if (category && categoryGenre[category]) return categoryGenre[category];
    return searchParams.get("genre") ?? null;
  });
  const [activeCountry, setActiveCountry] = useState<string | null>(
    searchParams.get("country") ?? null
  );
  const [sort, setSort] = useState("trending");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setQuery(q);
    const category = searchParams.get("category");
    if (category && categoryGenre[category]) {
      setActiveGenre(categoryGenre[category]);
    } else if (searchParams.has("genre")) {
      setActiveGenre(searchParams.get("genre"));
    }
    if (searchParams.has("country")) {
      setActiveCountry(searchParams.get("country"));
    }
  }, [searchParams]);

  const filteredVideos = useMemo(() => {
    let list = [...videos];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.tags.some((t) => t.includes(q)) ||
          v.genre.some((g) => g.toLowerCase().includes(q))
      );
    }

    if (activeGenre) {
      list = list.filter((v) => v.genre.includes(activeGenre));
    }

    if (activeCountry) {
      list = list.filter((v) => v.country === activeCountry);
    }

    if (sort === "trending") {
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.views - a.views);
    } else if (sort === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.publishedAt ?? b.createdAt).getTime() -
          new Date(a.publishedAt ?? a.createdAt).getTime()
      );
    } else if (sort === "most_watched") {
      list.sort((a, b) => b.views - a.views);
    } else if (sort === "free") {
      list = list.filter((v) => v.monetization === "free");
    } else if (sort === "premium") {
      list = list.filter((v) => v.monetization === "premium");
    }

    return list;
  }, [query, activeGenre, activeCountry, sort]);

  const hasActiveFilters = query || activeGenre || activeCountry || sort !== "trending";

  const clearFilters = () => {
    setQuery("");
    setActiveGenre(null);
    setActiveCountry(null);
    setSort("trending");
  };

  const filterBadgeCount =
    (query ? 1 : 0) +
    (activeGenre ? 1 : 0) +
    (activeCountry ? 1 : 0) +
    (sort !== "trending" ? 1 : 0);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-5 sm:space-y-7 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f5b942]" />
            Explore
          </p>
          <h1 className="mt-1.5 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
            Discover the continent
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Stories from every corner of Africa
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories, creators…"
              className="h-11 w-full rounded-full border border-white/10 bg-[#0e1329]/80 pl-11 pr-10 text-sm text-white placeholder-zinc-400 outline-none transition-all focus:border-indigo-500/60 focus:bg-[#121835] focus:shadow-[0_0_12px_rgba(84,56,220,0.2)]"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Genres */}
      <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveGenre(null)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
            !activeGenre
              ? "border-amber-400/60 bg-amber-400/10 text-amber-300 shadow-[0_0_12px_rgba(245,185,66,0.15)]"
              : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/25 hover:text-white"
          )}
        >
          All Stories
        </button>
        {genres.map((g) => (
          <button
            key={g.name}
            onClick={() => setActiveGenre(activeGenre === g.name ? null : g.name)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
              activeGenre === g.name
                ? "border-amber-400/60 bg-amber-400/10 text-amber-300 shadow-[0_0_12px_rgba(245,185,66,0.15)]"
                : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/25 hover:text-white"
            )}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all",
              showFilters || activeCountry
                ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/25 hover:text-white"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {filterBadgeCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#f5b942] text-[10px] font-bold text-black">
                {filterBadgeCount}
              </span>
            )}
          </button>
          {showFilters && (
            <div className="flex items-center gap-2">
              <select
                value={activeCountry ?? ""}
                onChange={(e) => setActiveCountry(e.target.value || null)}
                className="rounded-full border border-white/10 bg-[#0e1329]/80 px-4 py-2 text-xs font-medium text-white outline-none transition-colors focus:border-indigo-500/60 [&>option]:bg-[#0c1024]"
              >
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-amber-300"
            >
              Clear all filters <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="no-scrollbar -mx-4 flex items-center gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {sortOptions.map((o) => (
            <button
              key={o.value}
              onClick={() => setSort(o.value)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                sort === o.value
                  ? "bg-[#0e1329] text-amber-300 ring-1 ring-amber-400/30"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="pt-1">
        {activeGenre && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {genres
              .filter((g) => g.name === activeGenre)
              .map((g) => (
                <GenreCard key={g.name} genre={g} className="w-full" />
              ))}
          </div>
        )}

        {activeCountry && (
          <div className="mb-6">
            {countries
              .filter((c) => c.code === activeCountry)
              .map((c) => (
                <div key={c.code} className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  <CountryCard country={c} className="w-full" />
                </div>
              ))}
          </div>
        )}

        {/* Country discover strip (when no filter) */}
        {!hasActiveFilters && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                Explore Africa by Country
              </h2>
              <span className="text-[11px] text-zinc-400">12 regions</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {countries.slice(0, 12).map((c) => (
                <CountryCard key={c.code} country={c} compact className="w-full" />
              ))}
            </div>
          </div>
        )}

        {!query && !activeGenre && !activeCountry && (
          <div className="mt-8 space-y-3.5">
            <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
              Browse by Category
            </h2>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              {genres.slice(0, 8).map((g) => (
                <GenreCard key={g.name} genre={g} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
            {query
              ? `Results for "${query}"`
              : activeGenre
              ? `${activeGenre} Stories`
              : activeCountry
              ? countries.find((c) => c.code === activeCountry)?.name
              : "All Stories"}
            <span className="ml-2 text-sm font-medium text-zinc-400">
              ({filteredVideos.length})
            </span>
          </h2>
        </div>

        {/* Video grid */}
        <div className="mt-4 grid grid-cols-1 gap-x-3 gap-y-5 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredVideos.map((v) => (
            <VideoCard key={v.id} video={v} className="w-full h-full" />
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <Search className="mx-auto h-8 w-8 text-zinc-500/40" />
            <p className="mt-3 text-lg font-bold text-white">
              No stories found
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Try a different search or clear your filters.
            </p>
          </div>
        )}
      </div>

      {/* Series section */}
      {!activeGenre && !activeCountry && (
        <div className="pt-4">
          <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
            Featured Series
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {series.slice(0, 4).map((s) => (
              <SeriesCard key={s.id} series={s} className="w-full" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}