"use client";

import { useState } from "react";
import {
  Wallet,
  Banknote,
  Clock,
  TrendingUp,
  Coins,
  ArrowUpRight,
  Download,
  CheckCircle2,
  Loader2,
  Copy,
} from "lucide-react";
import { LineChart } from "@/components/charts";
import { creatorEarnings, earningsByMonth } from "@/lib/data/wallet";
import { useToastStore } from "@/lib/store";
import { cn, formatNaira } from "@/lib/utils";

export default function EarningsPage() {
  const [withdrawing, setWithdrawing] = useState(false);
  const [amount, setAmount] = useState(50000);
  const [bank, setBank] = useState("Access Bank");
  const showToast = useToastStore((s) => s.showToast);

  const cards = [
    {
      label: "Available Balance",
      value: formatNaira(creatorEarnings.availableBalance),
      icon: Wallet,
      type: "primary",
    },
    {
      label: "Pending",
      value: formatNaira(creatorEarnings.pendingBalance),
      icon: Clock,
      type: "neutral",
    },
    {
      label: "Total Earnings",
      value: formatNaira(creatorEarnings.totalEarnings),
      icon: TrendingUp,
      type: "accent",
    },
    {
      label: "Points Earned",
      value: formatNumber(creatorEarnings.totalPointsEarned),
      icon: Coins,
      type: "gold",
    },
  ];

  const handleWithdraw = () => {
    if (amount <= 0) return;
    if (amount > creatorEarnings.availableBalance) {
      showToast("Insufficient balance", "Your available balance is lower than this amount.");
      return;
    }
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      showToast(
        "Withdrawal requested",
        `₦${amount.toLocaleString()} will be sent to ${bank} within 1-3 business days.`
      );
    }, 1200);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-black text-cream">Earnings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your revenue and withdraw your balance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={cn(
              "rounded-2xl border p-4",
              card.type === "primary"
                ? "border-gold/30 bg-gradient-to-br from-gold/[0.12] to-transparent"
                : card.type === "gold"
                ? "border-gold/20 bg-white/[0.02]"
                : "border-white/[0.06] bg-white/[0.02]"
            )}
          >
            <card.icon
              className={cn(
                "h-5 w-5",
                card.type === "primary"
                  ? "text-gold"
                  : card.type === "accent"
                  ? "text-purple"
                  : "text-muted-foreground"
              )}
            />
            <p className="mt-3 font-display text-lg font-bold text-cream">
              {card.value}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Chart + Withdraw */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-cream">
              Earnings Overview
            </h3>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              +22.3% YoY
            </span>
          </div>
          <LineChart data={earningsByMonth} />
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-muted-foreground">Best month</p>
              <p className="mt-0.5 font-bold text-cream">December · ₦246K</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-muted-foreground">Avg. unlock rate</p>
              <p className="mt-0.5 font-bold text-cream">3.2% of views</p>
            </div>
          </div>
        </div>

        {/* Withdraw card */}
        <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/[0.08] to-transparent p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold text-cream">
            Withdraw Funds
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Your available balance:{" "}
            <span className="font-bold text-gold">
              {formatNaira(creatorEarnings.availableBalance)}
            </span>
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-cream">
                Amount (₦)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground focus:border-gold/60 focus:outline-none"
                />
                <button
                  onClick={() => setAmount(creatorEarnings.availableBalance)}
                  className="shrink-0 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-xs font-bold text-gold hover:bg-gold/20"
                >
                  Max
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-cream">
                Bank Account
              </label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground focus:border-gold/60 focus:outline-none"
              >
                {["Access Bank", "Kuda", "GTBank", "Moniepoint", "Zenith Bank"].map(
                  (b) => (
                    <option key={b} value={b}>
                      {b} ·••• 6789
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3.5 text-sm font-bold text-black transition-all hover:bg-gold-dim disabled:opacity-60"
            >
              {withdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4" />
                  Withdraw {formatNaira(amount)}
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              Payments settle in 1–3 business days. Minimum withdrawal ₦10,000.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-cream">
            Transaction History
          </h3>
          <button
            onClick={() =>
              showToast("Export started", "Your earnings report is being prepared.")
            }
            className="flex items-center gap-1.5 rounded-full border border-white/[0.1] px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          {/* Sample unlocks revenue */}
          {[
            {
              title: "The Last Kingdom — The Prophecy",
              type: "unlock",
              amount: 240000,
              date: "Dec 28, 2026",
              status: "settled",
            },
            {
              title: "The Last Kingdom — The Warrior",
              type: "unlock",
              amount: 186000,
              date: "Dec 21, 2026",
              status: "settled",
            },
            {
              title: "The Last Kingdom — The Alliance",
              type: "unlock",
              amount: 152000,
              date: "Dec 15, 2026",
              status: "settled",
            },
            {
              title: "Withdrawal to Access Bank",
              type: "withdrawal",
              amount: -250000,
              date: "Jul 2, 2026",
              status: "completed",
            },
            {
              title: "Withdrawal to Access Bank",
              type: "withdrawal",
              amount: -120500,
              date: "Sep 7, 2026",
              status: "processing",
            },
          ].map((tx, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-between px-4 py-3.5",
                idx !== 0 && "border-t border-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    tx.type === "withdrawal"
                      ? "bg-purple/15 text-purple"
                      : "bg-emerald-500/15 text-emerald-400"
                  )}
                >
                  {tx.type === "withdrawal" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <Coins className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-cream">{tx.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {tx.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-sm font-bold",
                    tx.amount > 0 ? "text-emerald-300" : "text-foreground"
                  )}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {formatNaira(Math.abs(tx.amount))}
                </p>
                <span
                  className={cn(
                    "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    tx.status === "completed" || tx.status === "settled"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-gold/10 text-gold"
                  )}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank details */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-cream">
              Bank Details
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Where withdrawals are sent.
            </p>
          </div>
          <button
            onClick={() => showToast("Copied", "Account number copied.")}
            className="flex items-center gap-1.5 rounded-full border border-white/[0.1] px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Account Name", value: "Chinedu Uwadiegwu" },
            { label: "Bank", value: "Access Bank" },
            { label: "Account Number", value: "0123456789" },
          ].map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {b.label}
                </p>
                <p className="text-sm font-semibold text-cream">{b.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}