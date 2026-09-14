import { Unlock, HeartHandshake, Gift, Library, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: Unlock,
    title: "Buy & Unlock",
    body: "Instant access to amazing stories",
    gradient: "from-gold/30 via-amber-600/20 to-transparent",
    iconBox: "bg-gold text-black shadow-[0_10px_30px_-6px_rgba(245,185,66,0.6)]",
  },
  {
    icon: HeartHandshake,
    title: "Support Creators",
    body: "Your purchase helps creators earn more",
    gradient: "from-pink-500/25 via-purple-deep/20 to-transparent",
    iconBox: "bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-[0_10px_30px_-6px_rgba(236,72,153,0.6)]",
  },
  {
    icon: Gift,
    title: "Earn Rewards",
    body: "Get points and unlock awesome badges",
    gradient: "from-violet-500/25 via-purple-deep/25 to-transparent",
    iconBox: "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-[0_10px_30px_-6px_rgba(139,92,246,0.6)]",
  },
  {
    icon: Library,
    title: "Build Your Library",
    body: "Save and organize your favorite stories",
    gradient: "from-emerald-500/25 via-teal-600/15 to-transparent",
    iconBox: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_10px_30px_-6px_rgba(16,185,129,0.6)]",
  },
];

export function HomeBenefits() {
  return (
    <section>
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {benefits.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16]"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${b.gradient}`} />
              <div className="relative">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${b.iconBox}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <p className="mt-4 font-display text-lg font-bold text-cream">{b.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
              </div>
              <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          );
        })}
      </div>
    </section>
  );
}