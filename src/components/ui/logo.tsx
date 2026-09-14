import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
  linkToHome?: boolean;
}

export function Logo({ className, linkToHome = true }: LogoProps) {
  const logo = (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none">
          <defs>
            <linearGradient id="aaf-logo-g" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stopColor="#f5b942" />
              <stop offset="55%" stopColor="#a34ae0" />
              <stop offset="100%" stopColor="#e25822" />
            </linearGradient>
          </defs>
          <path
            d="M16 2L30 10v12L16 30 2 22V10L16 2z"
            fill="url(#aaf-logo-g)"
            fillOpacity="0.15"
            stroke="url(#aaf-logo-g)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M16 7.5l8.5 4.75v9.5L16 26.5l-8.5-4.75v-9.5L16 7.5z"
            stroke="url(#aaf-logo-g)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="17" r="3.4" fill="url(#aaf-logo-g)" />
          <circle cx="16" cy="17" r="1.6" fill="#0b0b12" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-xl font-bold tracking-tight text-cream">
          Aaf<span className="text-gradient-gold">stories</span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          African Stories
        </span>
      </div>
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="inline-flex">
        {logo}
      </Link>
    );
  }

  return logo;
}