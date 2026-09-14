import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Star, Trophy, Zap } from "lucide-react";

const spotlight = {
  kicker: "Story of the Week",
  title: "The Legend of Queen Amina",
  description:
    "In the ancient city of Zazzau, a young princess must master the blade, rally her people and defend her kingdom against the armies that threaten to swallow the North. A story of courage, sacrifice and a throne won with fire.",
  genre: "History & Legend",
  chapters: 38,
  rating: "4.9",
  price: 480,
  image: "/home-assets/warrior-queen.jpg",
  href: "/watch/v_hero_lastkingdom",
};

export function HomeSpotlight() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1024] shadow-xl">
      <div className="grid items-stretch lg:grid-cols-[1.2fr_1fr]">
        {/* Copy */}
        <div className="relative z-10 p-5 sm:p-7 lg:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.16em] text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {spotlight.kicker}
          </span>

          <h2 className="mt-3 text-xl sm:text-2xl lg:text-[26px] font-black leading-tight tracking-tight text-white">
            {spotlight.title}
          </h2>

          <p className="mt-2.5 max-w-xl text-xs sm:text-[13px] leading-relaxed text-zinc-400">
            {spotlight.description}
          </p>

          {/* Stats row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {spotlight.rating}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Zap className="h-3.5 w-3.5 fill-indigo-400 text-indigo-400" />
              {spotlight.chapters} chapters
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              #1 {spotlight.genre} this week
            </span>
          </div>

          {/* Price + CTAs */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-black shadow-sm">
                $
              </div>
              <span className="text-sm font-bold text-amber-300">
                {spotlight.price}
              </span>
            </div>

            <Link
              href={spotlight.href}
              className="inline-flex items-center gap-2 rounded-full bg-[#f5b942] px-5 py-2.5 text-xs sm:text-sm font-bold text-black shadow-[0_4px_16px_rgba(245,185,66,0.35)] transition-transform hover:scale-[1.03] hover:bg-[#ffc857]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Watch Now
            </Link>

            <Link
              href="/explore?category=history"
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/20 px-4 py-2.5 text-xs sm:text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10"
            >
              See more legends
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Artwork */}
        <div className="relative min-h-[220px] lg:min-h-0">
          <Image
            src={spotlight.image}
            alt={spotlight.title}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c1024] via-[#0c1024]/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0c1024] to-transparent lg:hidden" />
        </div>
      </div>
    </section>
  );
}