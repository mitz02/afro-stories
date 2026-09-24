"use client";

import { useState, useEffect } from "react";
import { X, Heart, Coins, Minus, Plus, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { formatPoints } from "@/lib/utils";
import { useWalletStore } from "@/lib/store";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { useToastStore } from "@/lib/store";

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
  creatorName: string;
  videoId: string;
}

export function SupportModal({
  open,
  onOpenChange,
  creatorId,
  creatorName,
  videoId,
}: SupportModalProps) {
  const { balance, deductPoints, setBalance } = useWalletStore();
  const { user, balance: userBalance, refresh } = useSessionProfile();
  const showToast = useToastStore((s) => s.showToast);

  const signedIn = !!user;
  const effectiveBalance = user ? userBalance : balance;
  const [amount, setAmount] = useState(50);
  const [isSending, setIsSending] = useState(false);

  const maxAmount = effectiveBalance;
  const canSend = amount > 0 && amount <= effectiveBalance && !isSending;

  const handleClose = () => {
    setAmount(50);
    onOpenChange(false);
  };

  const handleSend = async () => {
    if (!canSend) return;
    setIsSending(true);

    const ok = deductPoints(amount, `Supported ${creatorName}`);
    if (!ok) {
      showToast("Insufficient points", "Please top up your wallet.");
      setIsSending(false);
      return;
    }

    try {
      const res = await fetch("/api/wallet/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId, videoId, amount }),
      });

      if (!res.ok) {
        const { data: updatedWallet } = await (await import("@/lib/supabase/client")).createClient().rpc("get_user_wallet_balance", { p_user_id: user?.id ?? "" });
        const newBalance = updatedWallet?.[0]?.balance ?? userBalance - amount;
        setBalance(newBalance);
        showToast("Support failed", "Something went wrong. Please try again.");
        setIsSending(false);
        return;
      }

      const data = await res.json();
      showToast("Thanks for supporting! 💛", `${amount} points sent to ${creatorName}`);
      setBalance(data.balance);
      if (user) await refresh();
      handleClose();
    } catch {
      setBalance(userBalance - amount);
      showToast("Support failed", "Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const increment = (val: number) => {
    const next = amount + val;
    if (next >= 1 && next <= maxAmount) setAmount(next);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-charcoal-raised/95 rounded-2xl border border-white/[0.08] p-6 shadow-2xl backdrop-blur-xl"
        >
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15">
              <Heart className="h-7 w-7 text-gold" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-cream">
              Support {creatorName}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Send points to show your appreciation
            </p>
          </div>

          <div className="mb-4 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <span className="text-sm text-muted-foreground">Your balance</span>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-gold" />
              <span className="font-bold text-gold">{formatPoints(effectiveBalance)} pts</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-cream">
              Amount to send
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => increment(-10)}
                disabled={amount <= 10 || isSending}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-muted-foreground transition-colors hover:border-gold/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    if (val >= 1 && val <= 1000000) setAmount(val);
                  }}
                  onBlur={() => setAmount(Math.max(1, Math.min(amount, 1000000)))}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-center text-lg font-bold text-cream outline-none focus:border-gold/50"
                  max={1000000}
                  min={1}
                />
              </div>
              <button
                onClick={() => increment(10)}
                disabled={amount >= 1000000 || isSending}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-muted-foreground transition-colors hover:border-gold/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Min: 1 pt</span>
              <span>Max: {formatPoints(maxAmount)} pts</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.03] py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Send {formatPoints(amount)} pts
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}