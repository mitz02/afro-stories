import { useEffect, useState } from "react";
import { Coins, Lock, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  const { balance, deductPoints } = useWalletStore();
  const setWalletBalance = useWalletStore((s) => s.setBalance);
  const { user, balance: userBalance } = useSessionProfile();
  const { unlockEpisode } = useUnlocksStore();
  const showToast = useToastStore((s) => s.showToast);
  const [showPurchase, setShowPurchase] = useState(false);

  // Signed-in balance comes from the DB wallet (points bought via Paystack).
  useEffect(() => {
    if (user) setWalletBalance(userBalance);
  }, [user, userBalance, setWalletBalance]);

  const enough = balance >= unlockPrice;

  const handleUnlock = () => {
    if (deductPoints(unlockPrice, `Unlocked ${episodeTitle}`)) {
      unlockEpisode(episodeId);
      showToast(
        "Episode unlocked!",
        `${episodeTitle} is now available to watch.`
      );
    } else {
      setShowPurchase(true);
    }
  };

  return (
    <>
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
                {enough
                  ? `Unlock for ${formatPoints(unlockPrice)} points`
                  : `Need ${formatPoints(unlockPrice)} points`}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
              <span className="text-muted-foreground">Your balance</span>
              <span className={enough ? "font-semibold text-emerald-400" : "font-semibold text-crimson"}>
                {formatPoints(balance)} pts {!enough && "· insufficient"}
              </span>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={handleUnlock}
                disabled={!enough}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim disabled:opacity-40"
              >
                <Lock className="h-4 w-4" />
                {enough ? "Unlock Now" : "Add Points"}
              </button>
            </div>
            {!enough && (
              <button
                onClick={() => setShowPurchase(true)}
                className="mt-2 text-xs text-gold underline-offset-2 hover:underline"
              >
                Or buy points to watch this premium story
              </button>
            )}
            <button
              onClick={() => setShowPurchase(false)}
              className="mx-auto mt-3 flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground"
            >
              <X className="h-3 w-3" />
              Back
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <PointPurchaseModal
        open={showPurchase}
        onOpenChange={setShowPurchase}
        episodeTitle={episodeTitle}
      />
    </>
  );
}