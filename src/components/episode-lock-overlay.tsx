"use client";

import { useEffect, useState } from "react";
import { Coins, Lock, LogIn, Wallet, Sparkles, Calculator } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { formatPoints } from "@/lib/utils";
import { useUnlocksStore, useWalletStore, useToastStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { PointPurchaseModal } from "@/components/point-purchase-modal";

interface SeriesBulkPrice {
  total_episodes: number;
  unlocked_episodes: number;
  remaining_episodes: number;
  total_price: number;
  bulk_price: number;
  discount_percent: number;
}

export function EpisodeLockOverlay({
  episodeId,
  videoId,
  unlockPrice,
  episodeTitle,
  seriesTitle,
  seriesId,
  seriesCompleted,
}: {
  episodeId: string;
  videoId: string;
  unlockPrice: number;
  episodeTitle: string;
  seriesTitle?: string;
  seriesId?: string;
  seriesCompleted?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { balance, deductPoints, setBalance } = useWalletStore();
  const { user, balance: userBalance, refresh } = useSessionProfile();
  const { unlockEpisode, isUnlocked } = useUnlocksStore();
  const showToast = useToastStore((s) => s.showToast);
  const [showPurchase, setShowPurchase] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showSeriesOption, setShowSeriesOption] = useState(false);
  const [seriesBulkPrice, setSeriesBulkPrice] = useState<SeriesBulkPrice | null>(null);

  const isGuest = !user;
  const effectiveBalance = user ? userBalance : balance;
  const enough = effectiveBalance >= unlockPrice;
  const alreadyUnlocked = isUnlocked(episodeId);

  // Keep local wallet store in sync with DB balance for signed-in users
  useEffect(() => {
    if (user) setBalance(userBalance);
  }, [user, userBalance, setBalance]);

  // Fetch series bulk price when series is completed and user is signed in
  useEffect(() => {
    if (!seriesCompleted || !seriesId || !user || seriesBulkPrice) return;
    fetch(`/api/wallet/bulk-price?seriesId=${seriesId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.remaining_episodes > 0) {
          setSeriesBulkPrice(data);
          setShowSeriesOption(true);
        }
      })
      .catch(console.error);
  }, [seriesCompleted, seriesId, user, seriesBulkPrice]);

  // If already unlocked, nothing to show (parent hides us)
  if (alreadyUnlocked) return null;

  // --- Guest: not signed in ---
  if (isGuest) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-black/75 p-6 text-center backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/15">
              <LogIn className="h-7 w-7 text-indigo-400" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-cream">
              Sign in to Watch
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {seriesTitle && (
                <span className="block text-gold">{seriesTitle}</span>
              )}
              <span className="line-clamp-1">
                {"\""}{episodeTitle}{"\""} is a premium story.
              </span>
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-gold/25 bg-gold/[0.08] py-2.5">
              <Coins className="h-4 w-4 text-gold" />
              <span className="text-sm font-semibold text-gold">
                Unlock for {formatPoints(unlockPrice)} points
              </span>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Create a free account or sign in to buy points and unlock premium stories.
            </p>

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() =>
                  router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#5438dc] py-3 text-sm font-bold text-white transition-all hover:bg-[#6449f0]"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </button>
              <button
                onClick={() =>
                  router.push(`/register?redirect=${encodeURIComponent(pathname)}`)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim"
              >
                Join Free
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // --- Signed in but insufficient points for single episode ---
  if (!enough && (!seriesBulkPrice || effectiveBalance < seriesBulkPrice.bulk_price)) {
    return (
      <>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-black/75 p-6 text-center backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
                <Lock className="h-7 w-7 text-gold" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-cream">
                Premium Episode
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {seriesTitle && (
                  <span className="block text-gold">{seriesTitle}</span>
                )}
<span className="line-clamp-1">{"\""}{episodeTitle}{"\""}</span>
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-gold/25 bg-gold/[0.08] py-2.5">
                <Coins className="h-4 w-4 text-gold" />
                <span className="text-sm font-semibold text-gold">
                  Requires {formatPoints(unlockPrice)} points
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                <span className="text-muted-foreground">Your balance</span>
                <span className="font-semibold text-crimson">
                  {formatPoints(effectiveBalance)} pts &middot; insufficient
                </span>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                You need{" "}
                <span className="font-bold text-gold">
                  {formatPoints(unlockPrice - effectiveBalance)} more points
                </span>{" "}
                to unlock this episode.
              </p>

              <div className="mt-5 flex gap-2.5">
                <button
                  onClick={() => setShowPurchase(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim"
                >
                  <Wallet className="h-4 w-4" />
                  Buy Points
                </button>
              </div>
              <button
                onClick={() =>
                  router.push(`/wallet?required=${unlockPrice}`)
                }
                className="mt-2 text-xs text-gold underline-offset-2 hover:underline"
              >
                Go to your wallet
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <PointPurchaseModal
          open={showPurchase}
          onOpenChange={(open) => {
            setShowPurchase(open);
            if (!open) void refresh();
          }}
          episodeTitle={episodeTitle}
        />
      </>
    );
  }

  // --- Signed in with enough points ---
  const handleUnlock = async (type: "episode" | "series" = "episode") => {
    if (isUnlocking) return;
    setIsUnlocking(true);

    const price = type === "series" ? seriesBulkPrice?.bulk_price ?? unlockPrice : unlockPrice;
    const title = type === "series" ? `${seriesTitle} (Full Series)` : episodeTitle;
    const id = type === "series" ? seriesId : episodeId;

    if (!id) return;

    try {
      // Deduct locally first for instant UX feedback
      const ok = deductPoints(price, `Unlocked ${title}`);
      if (!ok) {
        showToast("Insufficient points", "Please top up your wallet.");
        setIsUnlocking(false);
        return;
      }

      // Record unlock server-side via Supabase RPC
      const res = await fetch("/api/wallet/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId: type === "episode" ? id : undefined,
          videoId,
          price,
          episodeTitle: title,
          seriesId: type === "series" ? id : undefined,
          unlockType: type,
        }),
      });

      if (!res.ok) {
        // If server fails, restore the locally deducted amount
        const { error } = (await res.json().catch(() => ({}))) as { error?: string };
        // Restore balance by re-fetching
        await refresh();
        showToast(
          "Unlock failed",
          error ?? "Something went wrong. Please try again."
        );
        setIsUnlocking(false);
        return;
      }

      // Record in local unlocks store so the overlay disappears immediately
      if (type === "episode") {
        unlockEpisode(episodeId);
      } else {
        // For series, unlock all episodes locally
        // The backend already inserted user_unlocks for all episodes
        showToast("Series unlocked! \u{1F389}", `"${seriesTitle}" is now fully unlocked.`);
      }
      // Refresh DB balance
      await refresh();
    } catch {
      await refresh();
      showToast("Unlock failed", "Something went wrong. Please try again.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const canUnlockSeries = seriesBulkPrice && effectiveBalance >= seriesBulkPrice.bulk_price && seriesBulkPrice.remaining_episodes > 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-black/70 p-6 text-center backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
            <Lock className="h-7 w-7 text-gold" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-cream">
            Premium Episode
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {seriesTitle && (
              <span className="block text-gold">{seriesTitle}</span>
            )}
            <span className="line-clamp-1">{"\""}{episodeTitle}{"\""}</span>
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-gold/25 bg-gold/[0.08] py-2.5">
            <Coins className="h-4 w-4 text-gold" />
            <span className="text-sm font-semibold text-gold">
              Unlock for {formatPoints(unlockPrice)} points
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
            <span className="text-muted-foreground">Your balance</span>
            <span className="font-semibold text-emerald-400">
              {formatPoints(effectiveBalance)} pts
            </span>
          </div>

          {/* Series Bulk Unlock Option */}
          {showSeriesOption && seriesBulkPrice && canUnlockSeries && (
            <div className="mt-4 p-4 rounded-xl border border-gold/25 bg-gradient-to-br from-gold/[0.08] via-transparent to-transparent">
              <div className="flex items-center gap-2 text-xs font-semibold text-gold mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Better Value: Unlock Full Series</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                  <p className="text-muted-foreground">Episodes</p>
                  <p className="font-bold text-cream">{seriesBulkPrice.total_episodes} total</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                  <p className="text-muted-foreground">You own</p>
                  <p className="font-bold text-emerald-400">{seriesBulkPrice.unlocked_episodes}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-bold text-gold">{seriesBulkPrice.remaining_episodes}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                  <p className="text-muted-foreground">Individual total</p>
                  <p className="font-bold text-muted-foreground">{formatPoints(seriesBulkPrice.total_price)} pts</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm">
                <Calculator className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-emerald-300">
                  Bulk price: {formatPoints(seriesBulkPrice.bulk_price)} pts
                  <span className="ml-1 text-xs font-normal text-emerald-500">({seriesBulkPrice.discount_percent}% off)</span>
                </span>
              </div>
              <button
                onClick={() => void handleUnlock("series")}
                disabled={isUnlocking}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-full bg-emerald-500 py-2.5 text-sm font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-50"
              >
                {isUnlocking ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                    Unlocking Series\u{2026}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Unlock Full Series &middot; {formatPoints(seriesBulkPrice.bulk_price)} pts
                  </>
                )}
              </button>
            </div>
          )}

          <div className="mt-5 flex gap-2.5">
            <button
              onClick={() => void handleUnlock("episode")}
              disabled={isUnlocking}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim disabled:opacity-50"
            >
              {isUnlocking ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                  Unlocking\u{2026}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Unlock Episode &middot; {formatPoints(unlockPrice)} pts
                </>
              )}
            </button>
          </div>

          {showSeriesOption && seriesBulkPrice && !canUnlockSeries && seriesBulkPrice.remaining_episodes > 1 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Unlock full series for {formatPoints(seriesBulkPrice.bulk_price)} pts
              <span className="font-semibold text-gold"> ({seriesBulkPrice.discount_percent}% off)</span>
              &mdash; need {formatPoints(seriesBulkPrice.bulk_price - effectiveBalance)} more points
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}