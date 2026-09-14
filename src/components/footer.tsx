"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { AtSign, Camera, PlaySquare, Mail } from "lucide-react";

const linkGroups = [
  {
    title: "Discover",
    links: [
      { label: "Home", href: "/" },
      { label: "Explore", href: "/explore" },
      { label: "Series", href: "/series" },
      { label: "Shorts", href: "/shorts" },
      { label: "Creators", href: "/creators" },
    ],
  },
  {
    title: "Creators",
    links: [
      { label: "Become a Creator", href: "/create" },
      { label: "Creator Dashboard", href: "/dashboard" },
      { label: "Upload Video", href: "/upload" },
      { label: "Earnings", href: "/dashboard/earnings" },
      { label: "Creator Guidelines", href: "/guidelines" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "The Aafstories Story", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-charcoal">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-purple/20 blur-[100px]" />
        <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gold/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Discover African stories. Watch African creators. Support African
              storytellers. A new generation of entertainment begins here.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { icon: AtSign, label: "Twitter/X" },
                { icon: Camera, label: "Instagram" },
                { icon: PlaySquare, label: "YouTube" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="font-display text-sm font-bold uppercase tracking-widest text-cream">
                {group.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Aafstories. All stories belong to their creators.</p>
          <div className="flex items-center gap-4">
            <a href="mailto:hello@aafstories.com" className="flex items-center gap-1.5 hover:text-gold">
              <Mail className="h-3.5 w-3.5" />
              hello@aafstories.com
            </a>
            <span>Made with pride across Africa 🇳🇬 🇬🇭 🇰🇪 🇿🇦</span>
          </div>
        </div>
      </div>
    </footer>
  );
}