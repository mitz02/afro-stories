"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  Banknote,
  Clock,
  TrendingUp,
  Coins,
  ArrowUpRight,
  Download,
  CheckCircle2,
  Copy,
  Loader2,
  Inbox,
} from "lucide-react";
import { LineChart } from "@/components/charts";
import { useToastStore } from "@/lib/store";
import { cn, formatNaira } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "unlock" | "withdrawal";
  title: string;
  amount: number;
  date: string;
  status: "settled" | "pending" | "processing" | "completed" | "failed";
}

interface EarningsData {
  summary: { available: number; pending: number; total: number; points: number };
  transactions: Transaction[];
  chart: { label: string; value: number }[];
  profile: { displayName: string | null; payoutEmail: string | null };
  bank: { bankName: string; accountName: string; accountNumber: string } | null;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [amount, setAmount] = useState(10000);
  const [bankName, setBankName] = useState("Access Bank");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const showToast = useToastStore((s) => s.showToast);

  const refresh = async () => {
    try {
      const res = await fetch("/api/creator/earnings");
      const json = (await res.json()) as EarningsData | { error?: string };
      if (!res.ok) {
        setError((json as { error?: string }).error ?? "Failed to load earnings.");
        return;
      }
      setData(json as EarningsData);
    } catch {
      setError("Failed to load earnings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleWithdraw = async () => {
    if (!data) return;
    if (amount <= 0) return;
    if (amount > data.summary.available) {
      showToast(
        "Insufficient balance",
        `Your available balance is ${formatNaira(data.summary.available)}.`
      );
      return;
    }
    if (amount < 10000) {
      showToast("Minimum withdrawal", "The minimum withdrawal is ₦10,000.");
      return;
    }
    if (!accountNumber.trim() || !accountName.trim()) {
      showToast("Missing bank details", "Enter your account name and number.");
      return;
    }
    setWithdrawing(true);
    try {
      const res = await fetch("/api/creator/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountNaira: amount,
          bankName,
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
        }),
      });
      const json = (await res.json()) as {
        withdrawal?: { id: string };
        error?: string;
      };
      if (!res.ok) {
        showToast("Withdrawal failed", json.error ?? "Try again.");
        setWithdrawing(false);
        return;
      }
      showToast(
        "Withdrawal requested",
        `${formatNaira(amount)} will be sent to ${bankName} within 1-3 business days.`
      );
      await refresh();
    } catch {
      showToast("Withdrawal failed", "Check your connection.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your earnings…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] text-center">
        <Inbox className="h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 font-display text-sm font-bold text-cream">Something went wrong</p>
        <p className="mt-1 text-xs text-muted-foreground">{error ?? "No data."}</p>
      </div>
    );
  }

  const { summary } = data;

  const cards = [
    {
      label: "Available Balance",
      value: formatNaira(summary.available),
      icon: Wallet,
      type: "primary" as const,
    },
    {
      label: "Pending",
      value: formatNaira(summary.pending),
      icon: Clock,
      type: "neutral" as const,
    },
    {
      label: "Total Earnings",
      value: formatNaira(summary.total),
      icon: TrendingUp,
      type: "accent" as const,
    },
    {
      label: "Points Earned",
      value: formatNumber(summary.points),
      icon: Coins,
      type: "gold" as const,
    },
  ];

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
            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-muted-foreground">
              Last 6 months
            </span>
          </div>
          <LineChart data={data.chart} formatValue={(v) => formatNaira(v)} />
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-muted-foreground">Lifetime earnings</p>
              <p className="mt-0.5 font-bold text-cream">{formatNaira(summary.total)}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-muted-foreground">Withdrawn</p>
              <p className="mt-0.5 font-bold text-cream">
                {formatNaira(Math.max(summary.total - summary.available, 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Withdraw card */}
        <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/[0.08] to-transparent p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold text-cream">Withdraw Funds</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Your available balance:{" "}
            <span className="font-bold text-gold">
              {formatNaira(summary.available)}
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
                  min={10000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground focus:border-gold/60 focus:outline-none"
                />
                <button
                  onClick={() => setAmount(summary.available)}
                  className="shrink-0 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-xs font-bold text-gold hover:bg-gold/20"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-cream">
                  Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground focus:border-gold/60 focus:outline-none"
                >
                  {["Access Bank", "Kuda", "GTBank", "Moniepoint", "Zenith Bank", "UBA"].map(
                    (b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-cream">
                  Account Number
                </label>
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0123456789"
                  className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-cream">
                Account Name
              </label>
              <input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Full name on the account"
                className="w-full rounded-xl border border-white/[0.1] bg-charcoal-raised px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold/60 focus:outline-none"
              />
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

        {data.transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] py-14 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 font-display text-sm font-bold text-cream">
              No transactions yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Unlock revenue and withdrawals will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            {data.transactions.map((tx, idx) => (
              <div
                key={tx.id}
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
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
                        : tx.status === "failed"
                        ? "bg-crimson/10 text-crimson"
                        : "bg-gold/10 text-gold"
                    )}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
          {data.bank && (
            <button
              onClick={() => {
                navigator.clipboard?.writeText(data.bank!.accountNumber);
                showToast("Copied", "Account number copied.");
              }}
              className="flex items-center gap-1.5 rounded-full border border-white/[0.1] px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {data.bank ? (
            [
              { label: "Account Name", value: data.bank.accountName },
              { label: "Bank", value: data.bank.bankName },
              { label: "Account Number", value: data.bank.accountNumber },
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
            ))
          ) : data.profile.payoutEmail ? (
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:col-span-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Payout email
                </p>
                <p className="text-sm font-semibold text-cream">
                  {data.profile.payoutEmail}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:col-span-3">
              <p className="text-xs text-muted-foreground">
                Your bank details will be saved here after your first withdrawal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}