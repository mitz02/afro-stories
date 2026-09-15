"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle, AlertCircle, Coins } from "lucide-react";
import { useWalletStore } from "@/lib/store";
import { formatPoints } from "@/lib/utils";

export function PaystackCallback({ reference }: { reference: string | null }) {
  const missingReference = reference === null;
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    missingReference ? "error" : "loading"
  );
  const [balance, setBalance] = useState<number | null>(null);
  const [message, setMessage] = useState(
    missingReference ? "Missing payment reference." : "Verifying your payment…"
  );
  const setWalletBalance = useWalletStore((s) => s.setBalance);

  useEffect(() => {
    if (missingReference) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/payments/verify?reference=${encodeURIComponent(reference!)}`
        );
        if (cancelled || !res.ok) {
          setStatus("error");
          setMessage("Could not verify payment.");
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          const newBalance = Number(data.balance ?? 0);
          setBalance(newBalance);
          setWalletBalance(newBalance);
          setMessage(
            `${formatPoints(newBalance)} points added — you're all set!`
          );
          setStatus("success");
        } else {
          setMessage(data.message ?? "Payment was not successful.");
          setStatus("error");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Could not reach the server.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [missingReference, reference, setWalletBalance]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 text-center">
      {status === "loading" && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
          <p className="mt-5 font-display text-xl text-cream">{message}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This usually takes a few seconds.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <p className="mt-5 font-display text-xl text-cream">
            Payment successful!
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          {balance !== null && (
            <p className="mt-1 text-2xl font-bold text-gold">
              {formatPoints(balance)} pts
            </p>
          )}
          <Link
            href="/home"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-burnt-orange px-6 py-3 text-sm font-bold uppercase text-black transition-all hover:brightness-110"
          >
            <Coins className="h-4 w-4" />
            Start watching
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <p className="mt-5 font-display text-xl text-cream">Payment issue</p>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <Link
            href="/home"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:border-white/30 hover:bg-white/10"
          >
            Back to home
          </Link>
        </>
      )}
    </div>
  );
}