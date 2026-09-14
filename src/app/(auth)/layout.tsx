"use client";

import Link from "next/link";
import { Coins, Clapperboard, Globe, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const perks = [
  {
    icon: <Coins className="h-[18px] w-[18px] text-gold" />,
    title: "Earn with every story",
    body: "Monetise your work with premium point unlocks and paid episodes.",
  },
  {
    icon: <Clapperboard className="h-[18px] w-[18px] text-gold" />,
    title: "A studio built for storytellers",
    body: "Upload, schedule, and track analytics with a creator dashboard.",
  },
  {
    icon: <Globe className="h-[18px] w-[18px] text-gold" />,
    title: "Pan-African audience",
    body: "Over 1,400 creators and hundreds of thousands of listeners across 48 countries.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-charcoal lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-purple-deep/30 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-[-10rem] h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />

      {/* Brand panel */}
      <aside className="relative z-10 hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-deep/40 via-purple/5 to-transparent" />
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.18]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <pattern id="aaf-auth-grid" width="56" height="56" patternUnits="userSpaceOnUse">
              <path
                d="M56 0H0v56"
                fill="none"
                stroke="url(#aaf-auth-lines)"
                strokeWidth="0.75"
              />
            </pattern>
            <linearGradient id="aaf-auth-lines" x1="0" y1="0" x2="56" y2="56">
              <stop stopColor="#f5b942" stopOpacity="0.5" />
              <stop offset="1" stopColor="#a34ae0" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#aaf-auth-grid)" />
        </svg>

        <div className="relative z-10">
          <Logo />
          <div className="mt-16 max-w-md space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/30 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
              Africa&apos;s Storytelling Home
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-cream">
              Every voice,{" "}
              <span className="text-gradient-gold">every story</span>, finally heard.
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Join a fast-growing community where African creators publish, earn,
              and connect with listeners who love their world — and where every
              watcher discovers stories that feel like home.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-5">
          {perks.map((p) => (
            <div key={p.title} className="flex items-start gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold/25 bg-gold/[0.08]">
                {p.icon}
              </span>
              <div>
                <p className="text-sm font-bold text-cream">{p.title}</p>
                <p className="mt-0.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-x-8 gap-y-1.5 border-t border-white/10 pt-6">
            {[
              { value: "1.4K+", label: "creators" },
              { value: "210K+", label: "stories" },
              { value: "48", label: "countries" },
            ].map((s) => (
              <div key={s.label}>
                <span className="block font-display text-2xl font-bold text-gold">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-gold/70" />
          Secure sign-in · Your data stays yours, always.
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 pt-5 sm:px-8">
          <Link href="/" aria-label="Back to Aafstories home">
            <Logo linkToHome={false} />
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}