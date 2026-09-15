"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Loader2, LogIn } from "lucide-react";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = React.useState<"loading" | "granted" | "denied">("loading");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/session", { cache: "no-store" });
        const data = (await res.json()) as { isAdmin?: boolean };
        if (!cancelled) setAuthState(data.isAdmin ? "granted" : "denied");
      } catch {
        if (!cancelled) setAuthState("denied");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (authState === "loading") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#060814]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-20%] h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[130px]" />
          <div className="absolute bottom-[-25%] right-[-10%] h-[380px] w-[420px] rounded-full bg-amber-400/10 blur-[130px]" />
        </div>
        <Loader2 className="relative h-9 w-9 animate-spin text-amber-300" />
        <p className="relative mt-4 text-sm font-medium text-zinc-400">
          Verifying admin access…
        </p>
      </div>
    );
  }

  if (authState === "denied") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#060814] px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-[-30%] h-[380px] w-[480px] rounded-full bg-indigo-600/15 blur-[130px]" />
          <div className="absolute bottom-[-30%] right-1/4 h-[380px] w-[480px] rounded-full bg-amber-400/10 blur-[130px]" />
        </div>
        <div className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.03] p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5438dc]/15 shadow-[0_0_30px_rgba(84,56,220,0.25)]">
            <ShieldAlert className="h-8 w-8 text-amber-300" strokeWidth={1.8} />
          </div>
          <h1 className="text-xl font-bold text-white">Admin access required</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            This area is restricted to administrators. Sign in with an admin account
            to continue.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push("/home")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5438dc] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(84,56,220,0.4)] transition-colors hover:bg-[#4a2fc4]"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
            <Link
              href="/home"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#060814]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/3 h-[320px] w-[460px] rounded-full bg-indigo-600/15 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-5%] h-[360px] w-[420px] rounded-full bg-amber-400/[0.08] blur-[150px]" />
      </div>

      <AdminSidebar />
      <AdminMobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative z-10 lg:pl-[248px]">
        <AdminTopBar onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}