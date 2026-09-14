"use client";

import { useState } from "react";
import { X, Coins, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pointPackages, currentWallet } from "@/lib/data/wallet";
import { useWalletStore, useToastStore } from "@/lib/store";
import { formatNaira, formatPoints, cn } from "@/lib/utils";

export function PointPurchaseModal({
  open,
  onOpenChange,
  episodeTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeTitle?: string;
}) {
  const { balance, buyPoints } = useWalletStore();
  const showToast = useToastStore((s) => s.showToast);
  const [selected, setSelected] = useState<string | null>(null);

  const finalize = () => {
    if (!selected) return;
    const pkg = pointPackages.find((p) => p.id === selected);
    if (!pkg) return;
    buyPoints(selected);
    showToast(
      `${formatPoints(pkg.points + (pkg.bonus ?? 0))} points added`,
      episodeTitle ? `Unlock "${episodeTitle}" with your new points` : undefined
    );
    setSelected(null);
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-white/[0.1] bg-charcoal-raised p-6 sm:rounded-3xl"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/15 blur-[60px]" />
              <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-purple/15 blur-[60px]" />
            </div>

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-gold" />
                    <h3 className="font-display text-lg font-bold text-cream">
                      Buy Points
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {episodeTitle ? (
                      <>Unlock <span className="text-gold">"{episodeTitle}"</span> and other premium stories.</>
                    ) : (
                      "The currency for premium African stories."
                    )}
                  </p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Balance */}
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/10 to-transparent px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
                  </span>
                  Current balance
                </div>
                <span className="font-display text-lg font-bold text-gold">
                  {formatPoints(balance)} pts
                </span>
              </div>

              {/* Packages */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {pointPackages.map((pkg) => {
                  const isSelected = selected === pkg.id;
                  const effective = pkg.points + (pkg.bonus ?? 0);
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelected(pkg.id)}
                      className={cn(
                        "relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
                        isSelected
                          ? "border-gold bg-gold/10 shadow-lg shadow-gold/20"
                          : "border-white/[0.08] bg-white/[0.03] hover:border-gold/40"
                      )}
                    >
                      {pkg.popular && (
                        <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-black">
                          <Sparkles className="h-2.5 w-2.5" />
                          Popular
                        </span>
                      )}
                      <p className="font-display text-2xl font-bold text-cream">
                        {formatPoints(pkg.points)}
                      </p>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        points
                      </p>
                      <div className="mt-2 flex items-end justify-between">
                        <span className="text-sm font-semibold text-gold">
                          {formatNaira(pkg.price)}
                        </span>
                        {pkg.bonus ? (
                          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                            +{pkg.bonus} bonus
                          </span>
                        ) : null}
                      </div>
                      {isSelected && (
                        <div className="absolute bottom-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-black">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={finalize}
                disabled={!selected}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-burnt-orange py-3.5 text-sm font-bold uppercase tracking-wider text-black transition-all hover:brightness-110 disabled:opacity-40"
              >
                <Coins className="h-4 w-4" />
                {selected
                  ? `Buy ${formatNaira(pointPackages.find((p) => p.id === selected)?.price ?? 0)} · ${formatPoints(
                      (pointPackages.find((p) => p.id === selected)?.points ?? 0) +
                        (pointPackages.find((p) => p.id === selected)?.bonus ?? 0)
                    )} pts`
                  : "Select a package"}
              </button>

              <p className="mt-3 text-center text-[11px] text-muted-foreground/60">
                Points never expire. Payments are secure via Paystack.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}