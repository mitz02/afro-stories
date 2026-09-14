"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useToastStore } from "@/lib/store";

export function Toaster() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[90] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4 md:bottom-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="pointer-events-auto flex w-full items-center gap-3 rounded-xl border border-gold/30 bg-charcoal-raised/95 px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-xl"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-gold" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-cream">
                {toast.title}
              </p>
              {toast.description && (
                <p className="truncate text-xs text-muted-foreground">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}