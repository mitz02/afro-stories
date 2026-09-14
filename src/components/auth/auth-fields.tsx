"use client";

import * as React from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground/70">{hint}</p>
      ) : null}
    </div>
  );
}

const fieldClass =
  "h-11 w-full rounded-xl border border-input bg-white/[0.03] px-3.5 text-sm text-foreground shadow-inner shadow-black/20 outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-gold/20";

export function TextField({
  type = "text",
  className,
  ...props
}: React.ComponentProps<"input">) {
  return <input type={type} className={cn(fieldClass, className)} {...props} />;
}

export function PasswordField({
  className,
  value,
  ...props
}: React.ComponentProps<"input"> & { value?: string }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        className={cn(fieldClass, "pr-11", className)}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function passwordScore(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const label =
    score <= 1 ? "Too weak" : score === 2 ? "Weak" : score === 3 ? "Okay" : score === 4 ? "Strong" : "Very strong";
  return { score: Math.min(score, 4), label };
}

export function PasswordStrength({ password }: { password: string }) {
  const { score, label } = passwordScore(password);
  if (!password) return null;
  const colors = ["bg-red-500", "bg-orange-500", "bg-gold", "bg-emerald-500"];
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full bg-white/10",
              i < score && colors[score - 1]
            )}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl border-white/10 bg-white/[0.03] text-sm hover:bg-white/[0.07]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z"
          />
        </svg>
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl border-white/10 bg-white/[0.03] text-sm hover:bg-white/[0.07]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground">
          <path d="M16.365 1.43c0 1.14-.42 2.2-1.11 2.95-.84.9-2.2 1.59-3.36 1.5-.05-.92.38-2.03 1.05-2.79.68-.8 1.97-1.45 3.42-1.66Zm5.488 15.48c-.56 1.27-2.35 4.4-4.24 4.37-1.03.02-1.36-.66-2.77-.66-1.4 0-1.8.64-2.87.67-1.88.06-4.03-3.71-4.5-5.02-.62-1.72-1.25-4.5-.55-6.51.5-1.45 1.7-2.53 3.18-2.56 1.04-.03 1.88.6 2.5.6.63 0 1.69-.73 2.88-.64.8.03 1.75.35 2.53 1.1-.46.32-.87.75-1.17 1.25-.74 1.3-.63 2.83.1 4.09-.58.85-1.15 1.14-1.76 1.7-.66.63-1.17 1.66-1.15 2.22.03.3.13.58.42.65.86.04 1.44.43 2.17 1.14a5.4 5.4 0 0 1 1.11 1.78Z" />
        </svg>
        Apple
      </Button>
      <Button
        type="button"
        variant="outline"
        className="col-span-2 h-11 rounded-xl border-white/10 bg-white/[0.03] text-sm hover:bg-white/[0.07]"
      >
        <Mail className="h-4 w-4" />
        Continue with an email code
      </Button>
    </div>
  );
}

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  selected: boolean;
  onClick: () => void;
}

export function RoleCard({ icon, title, subtitle, selected, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all",
        selected
          ? "border-gold/70 bg-gold/[0.08] shadow-[0_0_0_3px_rgba(245,185,66,0.12)]"
          : "border-white/10 bg-white/[0.02] hover:border-white/25"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          selected ? "bg-gold text-black" : "bg-white/[0.06] text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className={cn("block text-sm font-bold", selected ? "text-gold" : "text-foreground")}>
          {title}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {subtitle}
        </span>
      </span>
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        or
      </span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}