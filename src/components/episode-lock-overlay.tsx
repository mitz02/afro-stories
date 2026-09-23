"use client";

import { useEffect, useState } from "react";
import { Coins, Lock, LogIn, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { formatPoints } from "@/lib/utils";
import { useUnlocksStore, useWalletStore, useToastStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { PointPurchaseModal } from "@/components/point-purchase-modal";

export function EpisodeLockOverlay({
  episodeId,
  videoId,
  unlockPrice,
  episodeTitle,
  seriesTitle,
}: {
  episodeId: string;
  videoId: string;
  unlockPrice: number;
  episodeTitle: string;
  seriesTitle?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { balance, deductPoints, setBalance } = useWalletStore();
  const { user, balance: userBalance, refresh } = useSessionProfile();
  const { unlockEpisode, isUnlocked } = useUnlocksStore();
  const showToast = useToastStore((s) => s.showToast);
  const [showPurchase, setShowPurchase] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const isGuest = !user;
  const effectiveBalance = user ? userBalance : balance;
  const enough = effectiveBalance >= unlockPrice;
  const alreadyUnlocked = isUnlocked(episodeId);

  // Keep local wallet store in sync with DB balance for signed-in users
  useEffect(() => {
    if (user) setBalance(userBalance);
  }, [user, userBalance, setBalance]);

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
                &quot;{episodeTitle}&quot; is a premium story.
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

  // --- Signed in but insufficient points ---
  if (!enough) {
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
                <span className="line-clamp-1">&quot;{episodeTitle}&quot;</span>
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
  const handleUnlock = async () => {
    if (isUnlocking) return;
    setIsUnlocking(true);
    try {
      // Deduct locally first for instant UX feedback
      const ok = deductPoints(unlockPrice, `Unlocked ${episodeTitle}`);
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
          episodeId,
          videoId,
          price: unlockPrice,
          episodeTitle,
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
      unlockEpisode(episodeId);
      showToast("Episode unlocked! 🎉", `"${episodeTitle}" is now ready to watch.`);
      // Refresh DB balance
      await refresh();
    } catch {
      await refresh();
      showToast("Unlock failed", "Something went wrong. Please try again.");
    } finally {
      setIsUnlocking(false);
    }
  };

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
            <span className="line-clamp-1">&quot;{episodeTitle}&quot;</span>
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

          <div className="mt-5 flex gap-2.5">
            <button
              onClick={() => void handleUnlock()}
              disabled={isUnlocking}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim disabled:opacity-50"
            >
              {isUnlocking ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                  Unlocking…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Unlock Now &middot; {formatPoints(unlockPrice)} pts
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}