"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  UserPlus,
  Heart,
  Share2,
  Check,
  BellRing,
  MapPin,
  Calendar,
  Clapperboard,
  PlaySquare,
  Play,
  Film,
  MessageCircle,
  Award,
} from "lucide-react";
import { CinemaImage } from "@/components/ui/cinema-image";
import { VerifiedBadge, AIBadge } from "@/components/ui/badges";
import { VideoCard } from "@/components/video-card";
import { SeriesCard } from "@/components/series-card";
import { TabList, TabTrigger } from "@/components/tabs-custom";
import { getCreator } from "@/lib/data/creators";
import { getVideosByCreator } from "@/lib/data/videos";
import { series as allSeries } from "@/lib/data/series";
import { getCountry } from "@/lib/data/countries";
import { useSocialStore, useToastStore } from "@/lib/store";
import { cn, formatNumber, timeAgo } from "@/lib/utils";

export default function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const creator = getCreator(id);
  const [activeTab, setActiveTab] = useState("videos");

  const { followedCreators, toggleFollowCreator } = useSocialStore();
  const showToast = useToastStore((s) => s.showToast);

  if (!creator) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-2xl text-cream">Creator not found</p>
        <Link href="/creators" className="mt-4 text-sm text-gold hover:underline">
          Browse all creators
        </Link>
      </div>
    );
  }

  const country = getCountry(creator.country);
  const creatorVideos = getVideosByCreator(creator.id);
  const creatorSeries = allSeries.filter((s) => s.creatorId === creator.id);
  const shorts = creatorVideos.filter((v) => v.type === "short");
  const isFollowing = followedCreators.includes(creator.id);
  const initials = creator.displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const handleFollow = () => {
    toggleFollowCreator(creator.id);
    showToast(
      isFollowing ? "Unfollowed creator" : `Following ${creator.displayName}`,
      isFollowing ? undefined : "You'll see new stories in your feed."
    );
  };

  const handleShare = () => {
    showToast("Link copied to clipboard", "Share this creator with your friends.");
  };

  const handleSupport = () => {
    showToast("Support coming soon", "Direct creator support is launching soon.");
  };

  const tabs = [
    { value: "videos", label: "Videos", count: creatorVideos.length },
    { value: "series", label: "Series", count: creatorSeries.length },
    { value: "shorts", label: "Shorts", count: shorts.length },
    { value: "about", label: "About" },
  ];

  return (
    <div>
      {/* COVER */}
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <CinemaImage
          src={creator.coverImage}
          alt=""
          fill
          sizes="100vw"
          gradient="from-black/40 via-transparent to-charcoal/90"
        />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* HEADER */}
        <div className="relative -mt-16 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className={cn(
                  "flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-background bg-gradient-to-br font-display text-5xl font-black text-white shadow-2xl",
                  creator.avatarGradient
                )}
              >
                {initials}
              </div>
              {creator.featured && (
                <div className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-gold text-black shadow-lg">
                  <Award className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-black text-cream sm:text-4xl">
                  {creator.displayName}
                </h1>
                {creator.verified && <VerifiedBadge size={20} />}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                @{creator.username}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {country && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {creator.city}, {country.name} {country.flag}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {timeAgo(creator.joinedDate)}
                </span>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleFollow}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all",
                isFollowing
                  ? "bg-white/[0.08] text-muted-foreground hover:bg-white/[0.12]"
                  : "bg-gold text-black hover:bg-gold-dim"
              )}
            >
              {isFollowing ? (
                <>
                  <BellRing className="h-4 w-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Follow
                </>
              )}
            </button>
            <button
              onClick={handleSupport}
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-6 py-3 text-sm font-bold text-gold transition-all hover:bg-gold hover:text-black"
            >
              <Heart className="h-4 w-4" />
              Support Creator
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center rounded-full border border-white/15 p-3 text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-7 grid grid-cols-4 gap-3">
          {[
            { label: "Followers", value: formatNumber(creator.followers) },
            { label: "Total Views", value: formatNumber(creator.totalViews) },
            { label: "Videos", value: creator.totalVideos.toString() },
            { label: "Series", value: creator.totalSeries.toString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-center"
            >
              <p className="font-display text-lg font-bold text-cream sm:text-xl">
                {stat.value}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="mt-8">
          <TabList className="no-scrollbar flex gap-1 overflow-x-auto border-b border-white/[0.08]">
            {tabs.map((tab) => (
              <TabTrigger
                key={tab.value}
                active={activeTab === tab.value}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
                <span className="ml-1.5 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-muted-foreground">
                  {tab.count ?? ""}
                </span>
              </TabTrigger>
            ))}
          </TabList>

          {/* TAB CONTENT */}
          <div className="mt-6">
            {activeTab === "videos" && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {creatorVideos.map((v) => (
                  <VideoCard key={v.id} video={v} className="w-full" />
                ))}
                {creatorVideos.length === 0 && (
                  <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                    No videos yet.
                  </p>
                )}
              </div>
            )}

            {activeTab === "series" && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {creatorSeries.map((s) => (
                  <SeriesCard key={s.id} series={s} className="w-full" />
                ))}
                {creatorSeries.length === 0 && (
                  <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                    No series yet.
                  </p>
                )}
              </div>
            )}

            {activeTab === "shorts" && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {shorts.map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    aspect="vertical"
                    className="w-full"
                  />
                ))}
                {shorts.length === 0 && (
                  <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                    No shorts yet.
                  </p>
                )}
              </div>
            )}

            {activeTab === "about" && (
              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <h3 className="font-display text-lg font-bold text-cream">
                    About {creator.displayName}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {creator.bio}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {creator.categories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/explore?genre=${encodeURIComponent(cat)}`}
                        className="rounded-full border border-white/[0.1] px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <h3 className="font-display text-lg font-bold text-cream">
                    Quick Stats
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    {[
                      { icon: Eye, label: "Avg views / video", value: formatNumber(Math.round(creator.totalViews / Math.max(creator.totalVideos, 1))) },
                      { icon: MessageCircle, label: "Engagement rate", value: "4.8%" },
                      { icon: Clapperboard, label: "Series", value: creator.totalSeries.toString() },
                      { icon: PlaySquare, label: "Shorts", value: shorts.length.toString() },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <stat.icon className="h-4 w-4 text-gold" />
                          {stat.label}
                        </span>
                        <span className="font-semibold text-cream">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CALL TO ACTION */}
        <div className="mt-14 rounded-3xl border border-gold/20 bg-gradient-to-br from-purple/15 to-gold/[0.06] p-8 text-center sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            Support this storyteller
          </p>
          <h2 className="mx-auto mt-3 max-w-xl font-display text-2xl font-black text-cream sm:text-3xl">
            The stories of {creator.city} deserve an audience.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Follow {creator.displayName.split(" ")[0]} and never miss a new
            episode, series, or short.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleFollow}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold transition-all",
                isFollowing
                  ? "bg-white/[0.1] text-muted-foreground"
                  : "bg-gold text-black hover:bg-gold-dim"
              )}
            >
              {isFollowing ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button
              onClick={handleSupport}
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-7 py-3 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-black"
            >
              <Heart className="h-4 w-4" />
              Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}