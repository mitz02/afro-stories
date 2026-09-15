"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Coins, Check, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pointPackages as staticPackages } from "@/lib/data/wallet";
import { createClient } from "@/lib/supabase/client";
import { useWalletStore, useToastStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { formatNaira, formatPoints, cn } from "@/lib/utils";

interface BuyPackage {
  id: string;
  points: number;
  priceNaira: number;
  bonus: number;
  popular: boolean;
}

export function PointPurchaseModal({
  open,
  onOpenChange,
  episodeTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeTitle?: string;
}) {
  const router = useRouter();
  const storeBalance = useWalletStore((s) => s.balance);
  const showToast = useToastStore((s) => s.showToast);
  const { user, balance: userBalance } = useSessionProfile();
  const [selected, setSelected] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [packages, setPackages] = useState<BuyPackage[] | null>(null);

  // Load live pricing from the DB (admin-managed), falling back to the
  // static seed list if the point_packages migration isn't applied yet.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let next: BuyPackage[];
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("point_packages")
          .select("id, points, price, bonus, popular, active, sort_order")
          .eq("active", true)
          .order("sort_order", { ascending: true });
        if (error || !data || data.length === 0) {
          next = staticPackages.map((p) => ({
            id: p.id,
            points: p.points,
            priceNaira: p.price,
            bonus: p.bonus ?? 0,
            popular: p.popular ?? false,
          }));
        } else {
          next = (data as {
            id: string;
            points: number;
            price: number;
            bonus: number;
            popular: boolean;
          }[]).map((p) => ({
            id: p.id,
            points: p.points,
            priceNaira: Math.round(p.price / 100), // kobo -> naira
            bonus: p.bonus ?? 0,
            popular: p.popular ?? false,
          }));
        }
      } catch {
        next = staticPackages.map((p) => ({
          id: p.id,
          points: p.points,
          priceNaira: p.price,
          bonus: p.bonus ?? 0,
          popular: p.popular ?? false,
        }));
      }
      if (!cancelled) {
        setPackages(next);
        // Drop any selection that a fresh package list no longer contains so a
        // stale selection can't be charged against the wrong price.
        setSelected((current) =>
          next.some((p) => p.id === current) ? current : null
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const balance = user ? userBalance : storeBalance;

  const selectedPkg = useMemo(
    () => packages?.find((p) => p.id === selected) ?? null,
    [packages, selected]
  );

  const startPurchase = async () => {
    if (!selected) return;
    if (!user) {
      showToast("Sign in required", "Create an account to buy points.");
      router.push("/login");
      return;
    }
    setStarting(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selected }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        authorizationUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.authorizationUrl) {
        showToast("Payment failed", data.error ?? "Could not start payment.");
        setStarting(false);
        return;
      }
      window.location.href = data.authorizationUrl;
    } catch {
      showToast("Payment failed", "Could not reach the payment provider.");
      setStarting(false);
    }
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
                      <>
                        Unlock <span className="text-gold">&quot;{episodeTitle}&quot;</span> and other premium stories.
                      </>
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
                {(packages ?? []).map((pkg) => {
                  const isSelected = selected === pkg.id;
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
                          {formatNaira(pkg.priceNaira)}
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
                onClick={startPurchase}
                disabled={!selected || starting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-burnt-orange py-3.5 text-sm font-bold uppercase tracking-wider text-black transition-all hover:brightness-110 disabled:opacity-40"
              >
                {starting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to Paystack…
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4" />
                    {selected && selectedPkg ? (
                      `Buy ${formatNaira(selectedPkg.priceNaira)} · ${formatPoints(
                        selectedPkg.points + selectedPkg.bonus
                      )} pts`
                    ) : (
                      "Select a package"
                    )}
                  </>
                )}
              </button>

              {!user && (
                <p className="mt-3 text-center text-[11px] text-gold">
                  You&apos;ll need an account to pay — you&apos;ll be taken to sign in.
                </p>
              )}

              <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
                Points never expire. Payments are secure via Paystack.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}