"use client";

import { Crown, Gem, Shield, Medal, Sparkles, Trophy, Coins, Star, Sword, Zap, Flame } from "lucide-react";
import { useToastStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const milestones = [
  { icon: Sword, label: "First Story", done: true },
  { icon: Coins, label: "10 Sales", done: false, progress: "3 / 10" },
  { icon: Trophy, label: "Top Creator", done: false, locked: true },
];

export function HomeQuest() {
  const showToast = useToastStore((s) => s.showToast);

  const claim = (label: string) =>
    showToast(`${label} +50 XP`, "Reward added to your quest progress.");

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-gold/20 bg-gradient-to-br from-[#1a1140] via-[#120b30] to-[#070817] p-6 sm:p-9">
      {/* Aura */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-purple/25 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gold/[0.12] blur-[100px]" />

      {/* Floating reward objects */}
      <Gem className="pointer-events-none absolute right-[12%] top-6 h-8 w-8 rotate-12 text-violet-300 drop-shadow-[0_0_18px_rgba(216,180,254,0.8)] animate-pulse-glow" />
      <Crown className="pointer-events-none absolute right-[38%] top-10 hidden h-7 w-7 -rotate-6 text-gold drop-shadow-[0_0_18px_rgba(245,185,66,0.8)] animate-pulse-glow lg:block" />
      <Shield className="pointer-events-none absolute bottom-8 right-[20%] h-7 w-7 text-amber-300 drop-shadow-[0_0_16px_rgba(252,211,77,0.7)] animate-pulse-glow" />
      <Medal className="pointer-events-none absolute bottom-10 left-[46%] hidden h-6 w-6 text-cream/70 drop-shadow-[0_0_12px_rgba(240,231,203,0.6)] animate-pulse-glow lg:block" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Left: quest progress */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/[0.08] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
            <Sparkles className="h-3.5 w-3.5" /> AfriTales Quest
          </p>
          <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-cream sm:text-4xl">
            Play. Level up.
            <br />
            <span className="text-gradient-gold">Get rewarded.</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Every story you unlock and create earns XP — climb the leaderboard,
            unlock badges and become a legend of the AfriTales universe.
          </p>

          {/* Level card */}
          <div className="mt-7 flex max-w-md items-center gap-5 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-md">
            <div className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/25 to-purple-deep/30 shadow-[0_0_30px_-6px_rgba(245,185,66,0.5)]">
              <span className="font-display text-2xl font-black text-gold">12</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold/80">Level</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 font-display text-lg font-bold text-cream">
                  <Crown className="h-4 w-4 text-gold" /> Storyteller
                </p>
                <span className="text-xs font-bold text-gold">1,230 / 1,500 XP</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-gold via-gold to-burnt-orange shadow-[0_0_14px_rgba(245,185,66,0.7)]" />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-gold">270 XP</span> until Level 13 — Daily Quests give +50 XP
              </p>
            </div>
          </div>

          {/* Quest chips */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            {[
              { icon: Zap, label: "Daily Quest", live: true },
              { icon: Medal, label: "Achievements", live: false },
              { icon: Trophy, label: "Leaderboard", live: false },
            ].map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.label}
                  onClick={() => claim(q.label)}
                  className={cn(
                    "group flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all",
                    q.live
                      ? "border-gold/50 bg-gold/10 text-gold hover:bg-gold hover:text-black"
                      : "border-white/[0.1] bg-white/[0.03] text-muted-foreground hover:border-gold/40 hover:text-gold"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", q.live && "text-gold group-hover:text-black")} />
                  {q.label}
                  {q.live && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: milestones */}
        <div className="rounded-3xl border border-white/[0.08] bg-black/25 p-5 backdrop-blur-md lg:self-center">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
            <Flame className="h-4 w-4" /> Quest Milestones
          </p>
          <div className="mt-4 space-y-2.5">
            {milestones.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className={cn(
                    "flex items-center gap-3.5 rounded-2xl border px-4 py-3",
                    m.done
                      ? "border-gold/30 bg-gold/[0.08]"
                      : "border-white/[0.07] bg-white/[0.02]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      m.done
                        ? "bg-gold text-black shadow-[0_0_20px_rgba(245,185,66,0.4)]"
                        : m.locked
                          ? "bg-white/[0.04] text-white/25"
                          : "bg-purple/25 text-violet-300"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-bold", m.done ? "text-cream" : m.locked ? "text-white/40" : "text-cream")}>
                      {m.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {m.done ? "Completed · +120 XP" : m.locked ? "Locked — reach Level 15" : `${m.progress} sales this month`}
                    </p>
                  </div>
                  {m.done && <Star className="h-4 w-4 fill-gold text-gold" />}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-gold/30 bg-gold/[0.05] px-4 py-3">
            <p className="text-xs text-muted-foreground">Your rank this week</p>
            <p className="flex items-center gap-1.5 font-display text-lg font-black text-gold">
              <Trophy className="h-4 w-4" /> #4 of 1,214
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}