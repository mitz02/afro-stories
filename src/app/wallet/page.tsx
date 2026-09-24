"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Coins,
  Plus,
  Loader2,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { PointPurchaseModal } from "@/components/point-purchase-modal";
import { formatPoints, cn } from "@/lib/utils";

interface WalletTransaction {
  id: string;
  type: "purchase" | "unlock" | "refund" | "bonus";
  amount: number;
  description: string;
  reference?: string;
  status: "pending" | "success" | "failed";
  created_at: string;
}

function typeIcon(type: WalletTransaction["type"]) {
  switch (type) {
    case "purchase":
      return { icon: ShoppingBag, cls: "bg-gold/15 text-gold" };
    case "unlock":
      return { icon: ArrowUpRight, cls: "bg-cyan-500/10 text-cyan-300" };
    case "bonus":
      return { icon: Sparkles, cls: "bg-emerald-500/10 text-emerald-300" };
    case "refund":
      return { icon: CheckCircle2, cls: "bg-purple-500/10 text-purple-300" };
  }
}

function statusBadge(status: WalletTransaction["status"]) {
  switch (status) {
    case "success":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
          <CheckCircle2 className="h-3 w-3" /> Paid
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
          <Clock className="h-3 w-3" /> Pending
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-300">
          <XCircle className="h-3 w-3" /> Failed
        </span>
      );
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function WalletPage() {
  const router = useRouter();
  const { user, balance, loading: profileLoading } = useSessionProfile();
  const [transactions, setTransactions] = useState<WalletTransaction[] | null>(null);
  const [txLoading, setTxLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("point_transactions")
        .select("id, type, amount, description, reference, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (!cancelled) {
        if (!error && data) {
          setTransactions(
            (data as {
              id: string;
              type: "purchase" | "unlock" | "refund" | "bonus";
              amount: number;
              description: string;
              reference?: string;
              status: "pending" | "success" | "failed";
              created_at: string;
            }[]).map((t) => ({
              id: t.id,
              type: t.type,
              amount: t.amount,
              description: t.description,
              reference: t.reference,
              status: t.status,
              created_at: t.created_at,
            }))
          );
        } else {
          setTransactions([]);
        }
        setTxLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!profileLoading && !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
          <ShoppingBag className="h-7 w-7 text-gold" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-cream">
          Your Wallet
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Sign in to see your points balance and purchase history.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-6 rounded-full bg-gradient-to-r from-gold to-burnt-orange px-6 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all hover:brightness-110"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-400/90">
            Wallet
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Purchases & Points
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Your balance and every point transaction, newest first.
          </p>
        </div>
        <button
          onClick={() => setShowPurchase(true)}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-gradient-to-r from-gold to-burnt-orange px-5 py-2.5 text-sm font-bold text-black transition-all hover:brightness-110 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Buy Points
        </button>
      </div>

      {/* Balance card */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-r from-gold/10 via-[#0d1326]/60 to-[#0d1326]/60 p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400">
          <Coins className="h-4 w-4 text-gold" />
          Available points
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-display text-5xl font-black text-gold">
            {formatPoints(balance)}
          </span>
          <span className="pb-1.5 text-sm font-semibold text-zinc-400">pts</span>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Points are used to unlock premium episodes. They never expire.
        </p>
      </div>

      {/* Transactions */}
      <div className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Transaction history
        </h2>
        <div className="mt-3 space-y-2.5">
          {txLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-8 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin text-gold" />
              Loading transactions…
            </div>
          ) : transactions && transactions.length > 0 ? (
            transactions.map((tx) => {
              const meta = typeIcon(tx.type);
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      meta.cls
                    )}
                  >
                    <meta.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-100">
                      {tx.description}
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">
                      {formatDate(tx.created_at)}
                      {tx.reference ? ` · ${tx.reference.slice(0, 14)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        tx.amount > 0 ? "text-emerald-400" : "text-zinc-200"
                      )}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount.toLocaleString("en-NG")}
                    </span>
                    {statusBadge(tx.status)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
                <Coins className="h-5 w-5 text-zinc-500" />
              </div>
              <p className="text-sm text-zinc-500">
                No transactions yet. Buy points to unlock premium stories.
              </p>
              <button
                onClick={() => setShowPurchase(true)}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-zinc-100 transition-colors hover:border-gold/40 hover:text-gold"
              >
                <Plus className="h-3.5 w-3.5" />
                Buy points
              </button>
            </div>
          )}
        </div>
      </div>

      <PointPurchaseModal
        open={showPurchase}
        onOpenChange={setShowPurchase}
      />
    </div>
  );
}