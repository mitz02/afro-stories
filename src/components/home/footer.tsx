"use client";

import * as React from "react";
import Link from "next/link";
import { AtSign, Camera, PlaySquare, Music2, ArrowRight, Mail } from "lucide-react";
import { AfriMask } from "@/components/home/sidebar";
import { useToastStore } from "@/lib/store";

const columns = [
  {
    title: "Quick Links",
    links: [
      { label: "Explore", href: "/explore" },
      { label: "How it Works", href: "/register" },
      { label: "Pricing", href: "/wallet" },
      { label: "FAQ", href: "/explore" },
    ],
  },
  {
    title: "For Creators",
    links: [
      { label: "Creator Guide", href: "/dashboard" },
      { label: "Success Stories", href: "/creators" },
      { label: "Resources", href: "/analytics" },
      { label: "Community", href: "/shorts" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/explore" },
      { label: "Contact Us", href: "/register" },
      { label: "Terms of Service", href: "/register" },
      { label: "Privacy Policy", href: "/register" },
    ],
  },
];

const socials = [
  { icon: AtSign, label: "Twitter / X" },
  { icon: Camera, label: "Instagram" },
  { icon: PlaySquare, label: "YouTube" },
  { icon: Music2, label: "TikTok" },
];

export function HomeFooter() {
  const showToast = useToastStore((s) => s.showToast);
  const [email, setEmail] = React.useState("");

  return (
    <footer className="relative mt-20 border-t border-white/[0.06] bg-[#05060f] px-4 pb-10 pt-14 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <AfriMask className="h-11 w-11" />
              <div className="leading-tight">
                <p className="font-display text-lg font-bold text-cream">
                  Afri<span className="text-gradient-gold">Tales</span>
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gold/80">
                  Our Stories. Our Wealth.
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A premium marketplace for African stories, animations, audiobooks
              and scripts. Created by us, for us.
            </p>
            <div className="mt-5 flex gap-2.5">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => showToast(s.label, "Follow AfriTales on social media.")}
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] text-muted-foreground transition-all hover:border-gold/50 hover:bg-gold/10 hover:text-gold"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Stay Connected
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Fresh stories and creator tips, straight to your inbox.
            </p>
            <div className="mt-4 flex">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter your email"
                  className="h-11 w-full rounded-l-full border border-white/[0.1] bg-white/[0.03] pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/50"
                />
              </div>
              <button
                onClick={() => {
                  if (!/^\S+@\S+\.\S+$/.test(email)) return;
                  showToast("You're in! 🎉", "Watch your inbox for the next drop.");
                  setEmail("");
                }}
                aria-label="Subscribe"
                className="flex h-11 items-center gap-1 rounded-r-full bg-gradient-to-r from-gold to-burnt-orange px-4 text-black shadow-lg shadow-gold/20 transition-transform hover:scale-[1.03]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} AfriTales. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <span className="text-crimson">♥</span> across Africa
            <span className="hidden text-white/25 sm:inline">·</span>
            <span className="hidden sm:inline">Lagos · Accra · Nairobi · Johannesburg</span>
          </p>
        </div>
      </div>
    </footer>
  );
}