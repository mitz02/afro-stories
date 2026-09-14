"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HorizontalScroller({
  children,
  className,
  buttonClassName,
}: {
  children: React.ReactNode;
  className?: string;
  buttonClassName?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="group/scroller relative">
      <div
        ref={containerRef}
        className={cn(
          "no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-1 sm:gap-4",
          className
        )}
      >
        {children}
      </div>
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className={cn(
          "absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-charcoal-raised/90 text-foreground opacity-0 shadow-lg backdrop-blur transition-all hover:border-gold/40 group-hover/scroller:opacity-100 md:flex",
          buttonClassName
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className={cn(
          "absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-charcoal-raised/90 text-foreground opacity-0 shadow-lg backdrop-blur transition-all hover:border-gold/40 group-hover/scroller:opacity-100 md:flex",
          buttonClassName
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}