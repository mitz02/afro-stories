import { Phone, Star, Bell, Search, Coins, Play, BarChart3, Crown, Trophy, Sparkles, Heart } from "lucide-react";
import { CinemaImage } from "@/components/ui/cinema-image";
import { formatNaira } from "@/lib/utils";

function PhoneFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative w-[210px] shrink-0 rounded-[34px] border border-white/[0.14] bg-[#0a0b1e] p-2 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95),0_0_60px_-20px_rgba(167,139,250,0.5)] ${className}`}
    >
      <div className="absolute left-1/2 top-2.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80" />
      <div className="overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#070817]">
        {children}
      </div>
    </div>
  );
}

function AppHomeScreen() {
  return (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-sm font-bold text-cream">
            Afri<span className="text-gold">Tales</span>
          </p>
          <p className="text-[8px] uppercase tracking-widest text-gold/70">Our Stories</p>
        </div>
        <div className="flex gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.05] text-white/60">
            <Bell className="h-3 w-3" />
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.05] text-white/60">
            <Search className="h-3 w-3" />
          </span>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-[9px] text-white/40">
        <Search className="h-2.5 w-2.5" /> Search stories, creators…
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[10px] font-bold text-cream">Trending Now</p>
        <span className="text-[8px] text-gold">See all</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {[
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80",
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&q=80",
          "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=300&q=80",
          "https://images.unsplash.com/photo-1539650116574-5798617ca30b?w=300&q=80",
        ].map((src, i) => (
          <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-lg">
            <CinemaImage src={src} alt="" fill sizes="160px" />
            <span className="absolute bottom-1 left-1 rounded bg-gold px-1 text-[6px] font-black text-black">
              ₦{(i + 2) * 300}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PurchaseScreen() {
  return (
    <div className="relative">
      <div className="relative aspect-[3/4]">
        <CinemaImage
          src="https://images.unsplash.com/photo-1539650116574-5798617ca30b?w=400&q=80"
          alt=""
          fill
          sizes="320px"
          gradient="from-transparent via-black/20 to-black"
        />
        <span className="absolute left-3 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 backdrop-blur text-white/80 text-[10px]">‹</span>
        <span className="absolute right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/80">
          <Heart className="h-3 w-3" />
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-[10px] font-bold text-white">{""}</p>
          <p className="font-display text-[13px] font-bold leading-tight text-cream">
            Rise of the Orisha
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[8px] text-white/70">
            <Star className="h-2.5 w-2.5 fill-gold text-gold" /> 5.0 · Chief Uwa Folktales
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between p-3 pt-2.5">
        <div>
          <p className="text-[8px] uppercase tracking-wider text-white/40">Price</p>
          <p className="font-display text-base font-black text-gold">{formatNaira(900)}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-[10px] font-black uppercase tracking-wider text-black shadow-[0_0_18px_rgba(245,185,66,0.5)]">
          <Play className="h-2.5 w-2.5 fill-current" /> Buy & Unlock
        </span>
      </div>
    </div>
  );
}

function CreatorScreen() {
  return (
    <div className="p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold to-burnt-orange text-[10px] font-black text-black">
          CU
        </span>
        <div>
          <p className="text-[10px] font-bold text-cream">Chief Uwa Studio</p>
          <p className="text-[8px] text-gold">Creator</p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-400/15 px-2 py-0.5 text-[7px] font-bold text-emerald-400">
          Live
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5">
          <p className="text-[8px] text-white/50">Earnings</p>
          <p className="mt-0.5 font-display text-sm font-black text-gold">{formatNaira(2450000)}</p>
          <p className="flex items-center gap-1 text-[7px] text-emerald-400">
            <BarChart3 className="h-2 w-2" /> +24% this week
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5">
          <p className="text-[8px] text-white/50">Views</p>
          <p className="mt-0.5 font-display text-sm font-black text-cream">1.2M</p>
          <p className="text-[7px] text-white/50">Across 12 stories</p>
        </div>
      </div>

      <p className="mt-2.5 text-[9px] font-bold text-cream">Weekly views</p>
      <div className="mt-1.5 flex h-14 items-end gap-1.5">
        {[35, 55, 40, 70, 60, 85, 100].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-gradient-to-t from-purple-deep to-gold/80 transition-all hover:to-gold"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-2 space-y-1">
        {[
          ["The Last Kingdom", "₦124K"],
          ["Rise of the Orisha", "₦98K"],
          ["Nnobi & the Firebird", "₦76K"],
        ].map(([t, p]) => (
          <div key={t} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2 py-1.5 text-[8px]">
            <span className="truncate pr-2 text-white/70">{t}</span>
            <span className="font-bold text-gold">{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestScreen() {
  return (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[10px] font-bold text-cream">
          <Crown className="h-3.5 w-3.5 text-gold" /> AfriTales Quest
        </p>
        <span className="rounded-full bg-purple/25 px-2 py-0.5 text-[7px] font-bold text-violet-300">
          Level 12
        </span>
      </div>
      <p className="mt-1 text-[11px] text-white/50">Storyteller</p>

      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-gold to-burnt-orange" />
      </div>
      <div className="mt-1 flex justify-between text-[7px] text-white/40">
        <span>1,230 / 1,500 XP</span>
        <span className="text-gold">+270 XP to next level</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          { label: "Daily Quest", icon: Sparkles, done: true },
          { label: "Achievements", icon: Trophy, done: true },
          { label: "First Story", icon: Play, done: true },
          { label: "10 Sales", icon: Coins, done: false },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.label}
              className={`flex items-center gap-2 rounded-xl border p-2 ${
                a.done
                  ? "border-gold/25 bg-gold/[0.07]"
                  : "border-white/[0.07] bg-white/[0.03]"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${a.done ? "text-gold" : "text-white/40"}`} />
              <span className={`text-[8px] font-semibold ${a.done ? "text-cream" : "text-white/40"}`}>
                {a.label}
              </span>
              {a.done && <span className="ml-auto text-[8px] text-emerald-400">✓</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 rounded-xl bg-gradient-to-br from-gold/[0.15] to-transparent p-2.5">
        <p className="text-[8px] uppercase tracking-widest text-gold">Leaderboard</p>
        <div className="mt-1.5 space-y-1">
          {[
            ["1", "Chief Uwa", "12,450 XP"],
            ["2", "Adaeze", "11,980 XP"],
            ["3", "Zanele", "11,210 XP"],
          ].map(([r, n, xp]) => (
            <div key={r} className="flex items-center justify-between text-[8px]">
              <span className="flex items-center gap-1.5 text-white/60">
                <span className="font-black text-gold">#{r}</span> {n}
              </span>
              <span className="text-white/50">{xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomeShowcase() {
  return (
    <section>
      <div className="mb-8 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.07] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
          One Platform. Every Screen.
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-2xl font-black tracking-tight text-cream sm:text-4xl">
          A marketplace, a studio and a{" "}
          <span className="text-gradient-gold">quest</span> — in your pocket.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Discover stories, buy unlocks, manage your creator studio and earn
          XP — all from beautifully crafted mobile apps.
        </p>
      </div>

      {/* Glow behind */}
      <div className="relative overflow-hidden py-10">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-purple-deep/40 blur-[120px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[90px]" />

        {/* Desktop staggered stack */}
        <div className="relative hidden justify-center gap-6 py-4 md:flex">
          <PhoneFrame className="-mt-4 rotate-[-8deg] translate-x-24 scale-95 opacity-80 hover:opacity-100 transition-opacity">
            <AppHomeScreen />
          </PhoneFrame>
          <PhoneFrame className="-mx-10 rotate-[4deg] z-20">
            <PurchaseScreen />
          </PhoneFrame>
          <PhoneFrame className="mt-1 rotate-[-4deg] -mx-10 scale-95 opacity-90 hover:opacity-100 transition-opacity">
            <CreatorScreen />
          </PhoneFrame>
          <PhoneFrame className="mt-3 -translate-x-20 -rotate-[5deg] scale-90 opacity-70 hover:opacity-100 transition-opacity">
            <QuestScreen />
          </PhoneFrame>
        </div>

        {/* Mobile scroller */}
        <div className="no-scrollbar flex gap-5 overflow-x-auto px-4 py-4 md:hidden">
          <PhoneFrame className="rotate-[-4deg]">
            <AppHomeScreen />
          </PhoneFrame>
          <PhoneFrame>
            <PurchaseScreen />
          </PhoneFrame>
          <PhoneFrame className="rotate-2">
            <CreatorScreen />
          </PhoneFrame>
          <PhoneFrame>
            <QuestScreen />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}