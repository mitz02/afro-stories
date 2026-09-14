"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Clock, Film, Users, Layers } from "lucide-react";
import { useUiStore } from "@/lib/store";
import { creators } from "@/lib/data/creators";
import { series } from "@/lib/data/series";
import { videos } from "@/lib/data/videos";
import { countries } from "@/lib/data/countries";
import { CinemaImage } from "@/components/ui/cinema-image";
import { VerifiedBadge } from "@/components/ui/badges";
import { cn } from "@/lib/utils";

const trendingSearches = [
  "Yoruba mythology",
  "Swahili folklore",
  "The Last Kingdom",
  "Zulu legends",
  "Lagos horror",
];

const recentSearches = ["Nigerian folklore", "Omega Princess", "Ashanti"];

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useUiStore();
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!searchOpen) setQuery("");
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { creators: [], series: [], videos: [], countries: [] };

    return {
      creators: creators.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.bio.toLowerCase().includes(q)
      ),
      series: series.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.genre.some((g) => g.toLowerCase().includes(q))
      ),
      videos: videos.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q))
      ),
      countries: countries.filter((c) => c.name.toLowerCase().includes(q)),
    };
  }, [query]);

  const hasResults =
    results.creators.length +
      results.series.length +
      results.videos.length +
      results.countries.length >
    0;

  const goToSearch = (path: string) => {
    setSearchOpen(false);
    router.push(path);
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setSearchOpen(false)}
      />
      <div className="absolute inset-x-0 top-0 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 pt-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 focus-within:border-gold/50">
            <Search className="h-5 w-5 text-gold" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories, creators, series…"
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <button onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto py-5">
            {!query && (
              <>
                <div className="mb-5">
                  <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
                    <TrendingUp className="h-3.5 w-3.5" /> Trending across Africa
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((t) => (
                      <button
                        key={t}
                        onClick={() => setQuery(t)}
                        className="rounded-full border border-white/[0.08] bg-charcoal-raised px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Recent
                  </h4>
                  <div className="space-y-1">
                    {recentSearches.map((r) => (
                      <button
                        key={r}
                        onClick={() => setQuery(r)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {query && !hasResults && (
              <div className="py-12 text-center">
                <Search className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 font-display text-lg text-cream">No results for "{query}"</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different story, creator, or genre.
                </p>
              </div>
            )}

            {query && hasResults && (
              <div className="space-y-6">
                {results.creators.length > 0 && (
                  <SearchSection title="Creators">
                    {results.creators.slice(0, 4).map((c) => (
                      <SearchRow
                        key={c.id}
                        icon={<Users className="h-4 w-4 text-gold" />}
                        title={c.displayName}
                        subtitle={`${c.city}, ${countries.find((cc) => cc.code === c.country)?.name}`}
                        trailing={
                          c.verified ? <VerifiedBadge size={13} /> : undefined
                        }
                        onClick={() => goToSearch(`/creator/${c.id}`)}
                      />
                    ))}
                  </SearchSection>
                )}

                {results.series.length > 0 && (
                  <SearchSection title="Series">
                    {results.series.slice(0, 4).map((s) => (
                      <SearchRow
                        key={s.id}
                        image={s.coverImage}
                        imageGradient={s.coverGradient}
                        icon={<Layers className="h-4 w-4 text-gold" />}
                        title={s.title}
                        subtitle={`${s.genre.join(" · ")} · ${s.country}`}
                        onClick={() => goToSearch(`/series/${s.id}`)}
                      />
                    ))}
                  </SearchSection>
                )}

                {results.videos.length > 0 && (
                  <SearchSection title="Videos">
                    {results.videos.slice(0, 4).map((v) => (
                      <SearchRow
                        key={v.id}
                        image={v.thumbnail}
                        imageGradient={v.thumbnailGradient}
                        icon={<Film className="h-4 w-4 text-gold" />}
                        title={v.title}
                        subtitle={v.tags.slice(0, 3).join(" · ")}
                        onClick={() => goToSearch(`/watch/${v.id}`)}
                      />
                    ))}
                  </SearchSection>
                )}

                {results.countries.length > 0 && (
                  <SearchSection title="Countries">
                    {results.countries.slice(0, 4).map((c) => (
                      <SearchRow
                        key={c.code}
                        icon={<span className="text-base">{c.flag}</span>}
                        title={c.name}
                        subtitle={`${c.contentCount.toLocaleString()} stories`}
                        onClick={() => goToSearch(`/explore?country=${c.code}`)}
                      />
                    ))}
                  </SearchSection>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SearchRow({
  icon,
  image,
  imageGradient,
  title,
  subtitle,
  trailing,
  onClick,
}: {
  icon: React.ReactNode;
  image?: string;
  imageGradient?: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.05]"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-deep to-black",
          !image && "bg-secondary"
        )}
      >
        {image ? (
          <CinemaImage src={image} alt="" fill className="h-full w-full" gradient={imageGradient} />
        ) : (
          icon
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-cream">{title}</p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {trailing}
    </button>
  );
}