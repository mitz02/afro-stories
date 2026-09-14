import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  Play,
  Clapperboard,
  Coins,
  Users,
  MonitorPlay,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Sparkles,
  Film,
  Phone,
} from "lucide-react";
import { CinemaImage } from "@/components/ui/cinema-image";
import { countries } from "@/lib/data/countries";
import { creators } from "@/lib/data/creators";
import { getSeries, getEpisodesForSeries } from "@/lib/data/series";
import type { Series } from "@/types";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-charcoal">
      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-black/60 to-transparent">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo linkToHome={false} />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-gold-dim"
            >
              Join Aafstories
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <HeroCollage />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-charcoal/40 to-charcoal" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-28 text-center sm:px-6">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/40 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Africa's New Storytelling Platform
          </p>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-black uppercase leading-[0.95] text-cream sm:text-7xl md:text-8xl">
            Africa has stories
            <br />
            <span className="text-gradient-gold">
              the world hasn't heard yet.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            Discover unforgettable African stories, support African creators,
            and experience a new generation of entertainment.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/home"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-9 py-4 text-sm font-bold uppercase tracking-wider text-black shadow-xl shadow-gold/30 transition-all hover:bg-gold-dim"
            >
              <Play className="h-4 w-4 fill-current transition-transform group-hover:scale-110" />
              Watch Stories
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/[0.06] px-9 py-4 text-sm font-bold uppercase tracking-wider text-cream backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-gold"
            >
              <Clapperboard className="h-4 w-4" />
              Become a Creator
            </Link>
          </div>
          <div className="mx-auto mt-14 flex max-w-2xl items-center justify-center gap-6 text-center">
            {[
              { value: "12K+", label: "African Stories" },
              { value: "4,800+", label: "Creators" },
              { value: "50+", label: "Countries" },
              { value: "140M+", label: "Watch Hours" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-bold text-gradient-gold sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground">
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </div>
      </section>

      {/* DISCOVER AFRICAN STORIES */}
      <DiscoverSection />
      {/* CREATE YOUR SERIES */}
      <CreateSection />
      {/* EARN FROM YOUR STORIES */}
      <EarnSection />
      {/* MEET AFRICAN CREATORS */}
      <CreatorsSection />
      {/* WATCH ANYWHERE */}
      <WatchAnywhereSection />
      {/* HOW IT WORKS */}
      <HowItWorks />
      {/* FOR CREATORS + FOR VIEWERS */}
      <WhoSection />
      {/* FAQ */}
      <FaqSection />
      {/* FINAL CTA */}
      <FinalCta />
      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
}

/* ================= HERO COLLAGE ================= */
function HeroCollage() {
  const featuredSeries = [
    "s_lastkingdom",
    "s_omegaprincess",
    "s_ghostsashanti",
    "s_teranga",
  ]
    .map(getSeries)
    .filter(Boolean);

  return (
    <div className="absolute inset-0 grid grid-cols-2 gap-1.5 opacity-60 md:grid-cols-4">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className={`relative overflow-hidden ${i % 2 === 0 ? "translate-y-6" : "-translate-y-4"}`}>
          <CinemaImage
            src={featuredSeries[i % featuredSeries.length]?.coverImage}
            alt=""
            fill
            className="scale-110"
            gradient="from-black/30 to-black/60"
          />
        </div>
      ))}
    </div>
  );
}

/* ================= DISCOVER ================= */
function DiscoverSection() {
  const series = ["s_lastkingdom", "s_omegaprincess", "s_ghostsashanti"]
    .map(getSeries)
    .filter((s): s is Series => Boolean(s));

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            Discover
          </p>
          <h2 className="mt-3 font-display text-4xl font-black text-cream sm:text-5xl">
            African Stories, Finally
            <br />
            <span className="text-gradient-gold">Owned by African Creators</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Folklore, animation, short films, AI cinema, documentaries, and
            episodic entertainment — all in one immersive African experience.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Folklore & Legends",
              desc: "Ancient stories reimagined for a new generation.",
            },
            {
              icon: Film,
              title: "Cinematic Series",
              desc: "Season-based episodic entertainment made for binge-watching.",
            },
            {
              icon: Sparkles,
              title: "AI-Generated Cinema",
              desc: "African creators building the future of AI storytelling.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-white/[0.08] bg-charcoal-raised p-8 transition-colors hover:border-gold/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-purple/20">
                <feature.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-cream">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {series.map((s) => (
            <Link
              key={s.id}
              href={`/series/${s.id}`}
              className="group relative aspect-[16/10] overflow-hidden rounded-2xl"
            >
              <CinemaImage
                src={s.coverImage}
                alt={s.title}
                fill
                className="transition-transform duration-500 group-hover:scale-105"
                gradient="from-transparent to-black/70"
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-lg font-bold text-white">
                  {s.title}
                </h3>
                <p className="mt-0.5 text-xs text-white/60">
                  {s.genre.join(" · ")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= CREATE ================= */
function CreateSection() {
  const series = ["s_lastkingdom", "s_omegaprincess"];
  const episode = getEpisodesForSeries("s_lastkingdom", 1)[0];

  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-purple/20 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />
      </div>
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            For Creators
          </p>
          <h2 className="mt-3 font-display text-4xl font-black leading-tight text-cream sm:text-5xl">
            Build your own
            <br />
            <span className="text-gradient-gold">African Netflix series.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Create your profile, upload videos, combine episodes into seasons,
            and release your own episodic series. Aafstories gives creators the
            tools of a streaming giant — with none of the gatekeepers.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Create series with multiple seasons and episodes",
              "Upload animation, films, shorts, and documentaries",
              "Transparent AI-content labels — no hidden usage",
              "Simple upload wizard: create → upload → publish",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-muted-foreground">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] text-gold">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-7 py-3 text-sm font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-black"
          >
            Start Creating
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Visual: series + episodes */}
        <div className="relative">
          {series
            .map(getSeries)
            .filter((s): s is Series => Boolean(s))
            .map((s, idx) => (
              <div
                key={s.id}
                className={`relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl ${
                  idx === 0
                    ? "z-10 mx-auto w-[85%] rotate-[-1.5deg]"
                    : "absolute right-0 top-8 z-0 w-[60%] rotate-[2deg] opacity-70"
                }`}
              >
                <CinemaImage
                  src={s.coverImage}
                  alt={s.title}
                  className="aspect-video"
                />
              </div>
            ))}
          {episode && (
            <div className="relative z-20 -mt-10 ml-auto mr-8 w-[240px] rounded-2xl border border-gold/40 bg-background/90 p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-black">
                  <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                </span>
                <div>
                  <p className="text-xs font-bold text-cream">{episode.title}</p>
                  <p className="text-[10px] text-gold">
                    S{episode.seasonNumber} · E{episode.episodeNumber}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ================= EARN ================= */
function EarnSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Points card */}
          <div className="relative order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-charcoal-raised to-black p-8 shadow-2xl">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/15 blur-[70px]" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-gold" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                    Point Balance
                  </p>
                </div>
                <p className="mt-4 font-display text-5xl font-black text-gradient-gold">
                  1,250 pts
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { pts: "100", price: "₦1,000" },
                    { pts: "500", price: "₦4,500" },
                    { pts: "1,000", price: "₦8,000" },
                  ].map((pkg) => (
                    <div
                      key={pkg.pts}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-center"
                    >
                      <p className="font-display text-lg font-bold text-cream">
                        {pkg.pts}
                      </p>
                      <p className="text-[10px] text-muted-foreground">points</p>
                      <p className="mt-1 text-xs font-semibold text-gold">
                        {pkg.price}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-[11px] text-muted-foreground/70">
                  Spending points rewards the creators you love. Always.
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
              Earn From Your Stories
            </p>
            <h2 className="mt-3 font-display text-4xl font-black leading-tight text-cream sm:text-5xl">
              Your craft,
              <br />
              <span className="text-gradient-gold">your revenue.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Set the point price for your premium episodes. When viewers unlock
              them, you earn. Track everything in a creator dashboard built for
              storytellers — not spreadsheets.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-4">
              {[
                { label: "Available balance", value: "₦842,500" },
                { label: "Pending earnings", value: "₦175,000" },
                { label: "Total earnings", value: "₦1,284,000" },
                { label: "Total points earned", value: "684K" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
                >
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-cream">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= CREATORS ================= */
function CreatorsSection() {
  const top = creators.filter((c) => c.verified).slice(0, 4);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            Meet African Creators
          </p>
          <h2 className="mt-3 font-display text-4xl font-black text-cream sm:text-5xl">
            Storytellers from{" "}
            <span className="text-gradient-gold">Lagos to Nairobi.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((c) => (
            <Link
              key={c.id}
              href={`/creator/${c.id}`}
              className="group rounded-3xl border border-white/[0.08] bg-charcoal-raised p-6 text-center transition-colors hover:border-gold/40"
            >
              <div
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br font-display text-2xl font-bold text-white ${c.avatarGradient}`}
              >
                {c.displayName[0]}
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-cream group-hover:text-gold">
                {c.displayName}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {c.city}, {c.country}
              </p>
              <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <span>
                  <span className="font-bold text-cream">
                    {(c.followers / 1000).toFixed(1)}K
                  </span>{" "}
                  followers
                </span>
                <span className="text-white/15">•</span>
                <span>
                  <span className="font-bold text-cream">
                    {(c.totalViews / 1000000).toFixed(1)}M
                  </span>{" "}
                  views
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= WATCH ANYWHERE ================= */
function WatchAnywhereSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 rounded-full bg-purple/15 blur-[120px]" />
      </div>
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/25 to-purple/20">
            <MonitorPlay className="h-6 w-6 text-gold" />
          </div>
          <h2 className="mt-5 font-display text-4xl font-black leading-tight text-cream sm:text-5xl">
            Watch anywhere.
            <br />
            <span className="text-gradient-gold">Feel at home.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Mobile-first, built for African bandwidth realities. Vertical
            shorts for the commute, cinematic episodes for the couch, and a
            premium, ad-light experience designed for the continent.
          </p>
        </div>
        {/* Country marquee */}
        <div className="flex flex-wrap justify-center gap-3">
          {countries.slice(0, 16).map((c) => (
            <div
              key={c.code}
              className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-charcoal-raised px-4 py-2 text-sm text-muted-foreground"
            >
              <span className="text-base">{c.flag}</span>
              {c.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= HOW IT WORKS ================= */
function HowItWorks() {
  const steps = [
    {
      icon: Users,
      title: "Create your account",
      desc: "Sign up in seconds. No gatekeepers, no waiting lists.",
    },
    {
      icon: Clapperboard,
      title: "Upload your story",
      desc: "Add a thumbnail, pick a category, choose Free or Premium.",
    },
    {
      icon: Play,
      title: "Publish for the world",
      desc: "Go live instantly and start building your African fanbase.",
    },
    {
      icon: Coins,
      title: "Earn from your audience",
      desc: "Monetize premium episodes with points viewers love to spend.",
    },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            How It Works
          </p>
          <h2 className="mt-3 font-display text-4xl font-black text-cream sm:text-5xl">
            From idea to{" "}
            <span className="text-gradient-gold">audience in minutes.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={step.title} className="relative rounded-3xl border border-white/[0.08] bg-charcoal-raised p-7">
              <span className="absolute right-6 top-5 font-display text-5xl font-black text-white/[0.04]">
                {idx + 1}
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-purple/20">
                <step.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-cream">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= WHO SECTION ================= */
function WhoSection() {
  return (
    <section className="border-t border-white/[0.06] py-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/[0.08] to-transparent p-10">
          <Clapperboard className="h-7 w-7 text-gold" />
          <h3 className="mt-4 font-display text-2xl font-black text-cream">
            For Creators
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {[
              "Own your content — no exclusivity traps",
              "Earn in Naira with Nigerian bank withdrawals",
              "Analytics that show your real audience",
              "A community that celebrates African storytelling",
            ].map((li) => (
              <li key={li} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {li}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-purple/25 bg-gradient-to-br from-purple/[0.08] to-transparent p-10">
          <Play className="h-7 w-7 text-purple" />
          <h3 className="mt-4 font-display text-2xl font-black text-cream">
            For Viewers
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {[
              "Discover stories mainstream platforms will never show",
              "Support creators directly with every point you spend",
              "Build watchlists, follow creators, and never miss an episode",
              "1,000s of hours of folklore, film, and emerging AI cinema",
            ].map((li) => (
              <li key={li} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple" />
                {li}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ================= FAQ ================= */
function FaqSection() {
  const faqs = [
    {
      q: "Is Aafstories free to use?",
      a: "Yes. Thousands of stories are completely free to watch. Premium stories are unlocked with points — a simple in-app currency you can buy in packages starting at ₦1,000.",
    },
    {
      q: "How do creators earn money?",
      a: "Creators choose a point price for premium episodes. Every time a viewer unlocks their content, the creator earns revenue. Creators can withdraw earnings directly to Nigerian bank accounts.",
    },
    {
      q: "Can I upload AI-generated content?",
      a: "Absolutely. We celebrate AI storytellers — with full transparency. Content is labeled AI Generated, AI Assisted, or Human Created so viewers always know.",
    },
    {
      q: "Where can I watch?",
      a: "Anywhere. Aafstories is mobile-first, beautifully responsive on tablets and desktop, and built to stream smoothly.",
    },
    {
      q: "Who owns my content?",
      a: "You do. We never claim ownership of your stories. You can publish, remove, or republish your content however you like.",
    },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-4xl font-black text-cream">
            Questions, answered.
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-white/[0.08] bg-charcoal-raised px-6 py-5 transition-colors open:border-gold/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-semibold text-cream">
                {faq.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-gold transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FINAL CTA ================= */
function FinalCta() {
  return (
    <section className="relative overflow-hidden py-28 text-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple/25 via-gold/10 to-burnt-orange/20 blur-[120px]" />
      </div>
      <div className="relative mx-auto max-w-3xl px-4">
        <h2 className="font-display text-5xl font-black leading-tight text-cream sm:text-6xl">
          Your story is
          <br />
          <span className="text-gradient-gold">waiting to be told.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground sm:text-base">
          Join the movement building Africa's own home for stories — whether
          you tell them, or you love watching them unfold.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-9 py-4 text-sm font-bold uppercase tracking-wider text-black shadow-xl shadow-gold/30 transition-all hover:bg-gold-dim"
          >
            Become a Creator
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-9 py-4 text-sm font-bold uppercase tracking-wider text-cream transition-colors hover:border-gold/60 hover:text-gold"
          >
            Watch Stories
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================= FOOTER ================= */
function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-black/40 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row">
        <Logo linkToHome={false} />
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
          <Link href="/about" className="transition-colors hover:text-gold">
            About
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-gold">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-gold">
            Terms
          </Link>
          <Link href="/guidelines" className="transition-colors hover:text-gold">
            Creator Guidelines
          </Link>
          <Link href="/contact" className="transition-colors hover:text-gold">
            Contact
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08]">
            <Phone className="h-3.5 w-3.5" />
          </span>
          <div className="text-[11px] leading-tight text-muted-foreground">
            <p>hello@aafstories.com</p>
            <p>Lagos · Nairobi · Accra · Cape Town</p>
          </div>
        </div>
      </div>
    </footer>
  );
}