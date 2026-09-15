"use client";

import * as React from "react";
import {
  Coins,
  Loader2,
  Plus,
  Save,
  Trash2,
  Sparkles,
  Info,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToastStore } from "@/lib/store";
import { cn, formatNaira } from "@/lib/utils";

interface PointPackageRow {
  id: string;
  points: number;
  priceNaira: number;
  bonus: number;
  popular: boolean;
  active: boolean;
  sortOrder: number;
}

export default function AdminPricingPage() {
  const [packages, setPackages] = React.useState<PointPackageRow[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  const showToast = useToastStore((s) => s.showToast);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/pricing", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load pricing");
        const data = (await res.json()) as { packages: PointPackageRow[] };
        if (!cancelled) setPackages(data.packages);
        setDirty(false);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setError(null);
    setLoading(true);
    setAttempt((a) => a + 1);
  };

  const update = (id: string, patch: Partial<PointPackageRow>) => {
    if (!packages) return;
    setPackages(packages.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setDirty(true);
  };

  const addPackage = () => {
    if (!packages) return;
    const stamp = Date.now();
    setPackages([
      ...packages,
      {
        id: `pp_custom_${stamp}`,
        points: 100,
        priceNaira: 1000,
        bonus: 0,
        popular: false,
        active: true,
        sortOrder: packages.length + 1,
      },
    ]);
    setDirty(true);
  };

  const removePackage = (id: string) => {
    if (!packages) return;
    setPackages(packages.filter((p) => p.id !== id));
    setDirty(true);
  };

  const save = async () => {
    if (!packages || packages.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packages }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = (await res.json()) as { packages: PointPackageRow[] };
      setPackages(data.packages);
      setDirty(false);
      showToast("Pricing saved", "Updated prices are now live for buyers.");
    } catch {
      showToast("Save failed", "Could not persist pricing changes. Check the migration is applied.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-amber-300" />
        <p className="mt-3 text-sm text-zinc-500">Loading pricing…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-zinc-400">
          {error} — are you signed in as an admin?
        </p>
        <button
          onClick={retry}
          className="mt-4 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-xs font-semibold text-white hover:border-white/20"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalCost =
    (packages ?? []).reduce((a, p) => a + p.points + (p.bonus ?? 0), 0) || 0;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-400/90">
            Monetization
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Point Pricing
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Set how much each points package costs. Prices are charged in naira via Paystack.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={addPackage}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-100 transition-colors hover:border-white/30 hover:bg-white/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Add package
          </button>
          <button
            onClick={() => void save()}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold to-burnt-orange px-5 py-2 text-xs font-bold text-black transition-all hover:brightness-110 disabled:opacity-40"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                {dirty ? "Save changes" : "Saved"}
              </>
            )}
          </button>
        </div>
      </div>

      {packages && packages.length > 0 && (
        <div className="grid gap-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-white/[0.025] p-4 transition-colors sm:p-5",
                pkg.active
                  ? "border-white/[0.07]"
                  : "border-white/[0.04] opacity-75"
              )}
            >
              {pkg.popular && (
                <span className="absolute right-4 top-3.5 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold uppercase text-black">
                  <Sparkles className="h-2.5 w-2.5" />
                  Popular
                </span>
              )}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-[180px] items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      pkg.popular
                        ? "bg-gold/20 text-gold"
                        : "bg-white/[0.06] text-zinc-400"
                    )}
                  >
                    <Coins className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">
                      {formatNaira(pkg.priceNaira)}
                    </p>
                    <p className="text-[11px] text-zinc-500">{pkg.id}</p>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Points
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={pkg.points}
                      onChange={(e) =>
                        update(pkg.id, { points: Number(e.target.value) || 0 })
                      }
                      className="h-9 w-full rounded-xl border border-white/10 bg-[#0e1329]/80 px-3 text-sm font-semibold text-white outline-none transition-colors focus:border-amber-500/60"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Price (₦)
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={pkg.priceNaira}
                      onChange={(e) =>
                        update(pkg.id, {
                          priceNaira: Number(e.target.value) || 0,
                        })
                      }
                      className="h-9 w-full rounded-xl border border-white/10 bg-[#0e1329]/80 px-3 text-sm font-semibold text-white outline-none transition-colors focus:border-amber-500/60"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Bonus
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={pkg.bonus}
                      onChange={(e) =>
                        update(pkg.id, { bonus: Number(e.target.value) || 0 })
                      }
                      className="h-9 w-full rounded-xl border border-white/10 bg-[#0e1329]/80 px-3 text-sm font-semibold text-white outline-none transition-colors focus:border-amber-500/60"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Order
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={pkg.sortOrder}
                      onChange={(e) =>
                        update(pkg.id, {
                          sortOrder: Number(e.target.value) || 0,
                        })
                      }
                      className="h-9 w-full rounded-xl border border-white/10 bg-[#0e1329]/80 px-3 text-sm font-semibold text-white outline-none transition-colors focus:border-amber-500/60"
                    />
                  </label>
                </div>

                <div className="flex shrink-0 items-center gap-3 sm:flex-col">
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={pkg.popular}
                      onCheckedChange={(checked: boolean) =>
                        update(pkg.id, { popular: checked })
                      }
                    />
                    <span className="text-[11px] font-semibold text-zinc-400">
                      Popular
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={pkg.active}
                      onCheckedChange={(checked: boolean) =>
                        update(pkg.id, { active: checked })
                      }
                    />
                    <span className="text-[11px] font-semibold text-zinc-400">
                      {pkg.active ? "Active" : "Hidden"}
                    </span>
                  </label>
                  <button
                    onClick={() => removePackage(pkg.id)}
                    aria-label={`Delete ${pkg.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition-colors hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-400">
          Total points on offer:{" "}
          <span className="font-semibold text-gold">
            {totalCost.toLocaleString("en-NG")}
          </span>
        </p>
        <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-[#0d1326]/60 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
          <p className="text-xs leading-relaxed text-zinc-500">
            Prices are stored in the{" "}
            <span className="text-zinc-300">point_packages</span> table and shown
            live to buyers in the Buy Points modal. Unlock prices per episode are
            configured on each episode, not here.
          </p>
        </div>
      </div>
    </div>
  );
}