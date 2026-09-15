"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock, User, AlertCircle, CheckCircle, Sparkles, Users, Clapperboard } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToastStore } from "@/lib/store";
import { cn, roleHomePath } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const toastMessages = {
  success: { title: "Account created!", description: "Welcome to Aafstories. Redirecting..." },
  successConfirm: { title: "Check your inbox", description: "We sent you a confirmation link. Confirm your email, then sign in." },
  error: { title: "Registration failed", description: "This email may already be in use. Try signing in." },
  validation: { title: "Please fix the errors", description: "Check the fields highlighted below." },
  passwords: { title: "Passwords don't match", description: "Please make sure both passwords are identical." },
};

const PARTICLES_REGISTER = [
  [0, 3, 2, 2, 0, 15],
  [7, 16, 5, 3, 3, 22],
  [14, 29, 4, 4, 6, 19],
  [21, 42, 3, 5, 1, 16],
  [28, 55, 2, 2, 4, 23],
  [35, 68, 5, 3, 7, 20],
  [42, 81, 4, 4, 2, 17],
  [49, 94, 3, 5, 5, 24],
  [56, 7, 2, 2, 0, 21],
  [63, 20, 5, 3, 3, 18],
  [70, 33, 4, 4, 6, 15],
  [77, 46, 3, 5, 1, 22],
  [84, 59, 2, 2, 4, 19],
  [91, 72, 5, 3, 7, 16],
  [98, 85, 4, 4, 2, 23],
  [5, 98, 3, 5, 5, 20],
  [12, 11, 2, 2, 0, 17],
  [19, 24, 5, 3, 3, 24],
  [26, 37, 4, 4, 6, 21],
  [33, 50, 3, 5, 1, 18],
  [40, 63, 2, 2, 4, 15],
  [47, 76, 5, 3, 7, 22],
  [54, 89, 4, 4, 2, 19],
  [61, 2, 3, 5, 5, 16],
  [68, 15, 2, 2, 0, 23],
];

export default function RegisterPage() {
  const router = useRouter();
  const { toasts, dismissToast } = useToastStore();
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "viewer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.displayName.trim()) newErrors.displayName = "Display name is required";
    else if (formData.displayName.trim().length < 2) newErrors.displayName = "Must be at least 2 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = "Include at least one uppercase letter";
    else if (!/[0-9]/.test(formData.password)) newErrors.password = "Include at least one number";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!termsAccepted) newErrors.terms = "You must accept the terms to continue";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      useToastStore.getState().showToast(toastMessages.validation.title, toastMessages.validation.description);
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            display_name: formData.displayName.trim(),
            username: formData.displayName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 32),
            role: formData.role,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        useToastStore.getState().showToast(toastMessages.error.title, error.message || toastMessages.error.description);
        return;
      }

      if (data.session) {
        useToastStore.getState().showToast(toastMessages.success.title, toastMessages.success.description);
        setShowSuccess(true);
        setTimeout(() => router.push(roleHomePath(formData.role)), 1200);
      } else {
        useToastStore.getState().showToast(toastMessages.successConfirm.title, toastMessages.successConfirm.description);
      }
    } catch {
      useToastStore.getState().showToast(toastMessages.error.title, toastMessages.error.description);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const passwordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = passwordStrength(formData.password);
  const strengthLabels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
  const strengthColors = ["crimson", "orange", "yellow", "lime", "emerald"];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-charcoal overflow-hidden px-4 py-8">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/2 -left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-gold/15 via-transparent to-purple/10 blur-[150px]" />
        <div className="absolute -bottom-1/2 -right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple/10 via-transparent to-gold/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black" />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES_REGISTER.map(([left, top, w, h, delay, duration], i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gold/20 animate-float"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${w}px`,
              height: `${h}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        ))}
      </div>

      <ToastProvider>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast}>
            <div className="grid gap-1">
              <ToastTitle className="font-display">{toast.title}</ToastTitle>
              <ToastDescription>{toast.description}</ToastDescription>
            </div>
            <ToastClose onClick={() => dismissToast(toast.id)} />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Logo className="mx-auto" />
        </div>

        {/* Card */}
        <Card className="relative overflow-hidden bg-charcoal-raised/80 border-white/[0.08] backdrop-blur-xl shadow-2xl">
          {/* Top accent border */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-purple to-gold" />

          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-purple/20">
              <Sparkles className="h-6 w-6 text-gold" />
            </div>
            <CardTitle className="font-display text-2xl font-black text-cream">
              Create Your Account
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              Join thousands of African storytellers and fans
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Role Selector */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">I want to</Label>
                <div role="radiogroup" aria-label="I want to" className="grid grid-cols-2 gap-3">
                  {[
                    { value: "viewer", label: "Watch Stories", icon: Users, desc: "Discover & enjoy African content" },
                    { value: "creator", label: "Create Stories", icon: Clapperboard, desc: "Publish & monetize your work" },
                  ].map((role) => (
                    <label
                      key={role.value}
                      className={cn(
                        "relative block cursor-pointer p-4 text-left transition-all border-2 rounded-2xl select-none",
                        formData.role === role.value
                          ? "border-gold/50 bg-gold/10 bg-gradient-to-br from-gold/5 to-transparent"
                          : "border-white/[0.08] bg-white/[0.03] hover:border-gold/30 hover:bg-white/[0.06]"
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={() => handleChange("role", role.value)}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: formData.role === role.value ? "linear-gradient(135deg, #d4a843, #c8962e)" : "rgba(255,255,255,0.06)" }}>
                          <role.icon className="h-5 w-5" style={{ color: formData.role === role.value ? "black" : "inherit" }} />
                        </span>
                        <div>
                          <p className="font-semibold text-cream">{role.label}</p>
                          <p className="text-[11px] text-muted-foreground">{role.desc}</p>
                        </div>
                      </div>
                      {formData.role === role.value && (
                        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gold flex items-center justify-center">
                          <CheckCircle className="h-3.5 w-3.5 text-black" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-sm font-medium text-foreground">
                  Display Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/50" aria-hidden="true" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={formData.displayName}
                    onChange={(e) => handleChange("displayName", e.target.value)}
                    className={cn(
                      "pl-10 bg-white/[0.03] border-white/[0.1] placeholder:text-muted-foreground/40",
                      "focus:border-gold/50 focus:ring-gold/20",
                      errors.displayName && "border-crimson/50 focus:border-crimson focus:ring-crimson/20"
                    )}
                    disabled={isLoading}
                    autoComplete="name"
                    autoFocus
                  />
                </div>
                {errors.displayName && (
                  <p className="flex items-center gap-1.5 text-xs text-crimson" role="alert">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.displayName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/50" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={cn(
                      "pl-10 bg-white/[0.03] border-white/[0.1] placeholder:text-muted-foreground/40",
                      "focus:border-gold/50 focus:ring-gold/20",
                      errors.email && "border-crimson/50 focus:border-crimson focus:ring-crimson/20"
                    )}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1.5 text-xs text-crimson" role="alert">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/50" aria-hidden="true" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={cn(
                      "pl-10 pr-12 bg-white/[0.03] border-white/[0.1] placeholder:text-muted-foreground/40",
                      "focus:border-gold/50 focus:ring-gold/20",
                      errors.password && "border-crimson/50 focus:border-crimson focus:ring-crimson/20"
                    )}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1.5 text-xs text-crimson" role="alert">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.password}
                  </p>
                )}

                {/* Password strength meter */}
                {formData.password && (
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{
                          width: `${(strength / 4) * 100}%`,
                          backgroundColor: strengthColors[strength - 1] || "transparent",
                        }}
                      />
                    </div>
                    <p className="text-[11px] font-medium" style={{ color: strengthColors[strength - 1] || "transparent" }}>
                      {strength > 0 ? `Password strength: ${strengthLabels[strength - 1]}` : ""}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70">
                      Minimum 8 characters with uppercase & number
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/50" aria-hidden="true" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className={cn(
                      "pl-10 bg-white/[0.03] border-white/[0.1] placeholder:text-muted-foreground/40",
                      "focus:border-gold/50 focus:ring-gold/20",
                      errors.confirmPassword && "border-crimson/50 focus:border-crimson focus:ring-crimson/20"
                    )}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1.5 text-xs text-crimson" role="alert">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-white/[0.2] bg-white/[0.03] text-gold focus:ring-gold/20 focus:ring-offset-charcoal-raised"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-gold hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
                </Label>
              </div>
              {errors.terms && (
                <p className="-mt-2 flex items-center gap-1.5 text-xs text-crimson" role="alert">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.terms}
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full py-3.5 text-sm font-bold uppercase tracking-wider"
                disabled={isLoading}
                style={{ background: "linear-gradient(135deg, #d4a843 0%, #c8962e 100%)" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider text-muted-foreground/60 bg-charcoal-raised/80 px-4">
                or continue with
              </div>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-white/[0.03] border-white/[0.1] hover:border-gold/30 hover:bg-gold/5 transition-all"
                disabled={isLoading}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-white/[0.03] border-white/[0.1] hover:border-gold/30 hover:bg-gold/5 transition-all"
                disabled={isLoading}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold hover:underline transition-colors">
            Sign in
          </Link>
        </p>

        {/* Benefits */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: "🎬", label: "12K+ Stories" },
            { icon: "💰", label: "Earn in NGN" },
            { icon: "🌍", label: "50+ Countries" },
          ].map((benefit) => (
            <div key={benefit.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-xl">{benefit.icon}</div>
              <p className="mt-1 text-[11px] font-medium text-cream">{benefit.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative mx-auto max-w-sm rounded-3xl bg-charcoal-raised p-8 text-center border border-gold/30 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-black text-cream">Welcome to Aafstories!</h3>
            <p className="mt-2 text-muted-foreground">Your journey begins now. Redirecting...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-15px); opacity: 0.4; }
          75% { transform: translateY(-30px) translateX(5px); opacity: 0.5; }
        }
        .animate-float { animation: float ease-in-out infinite; }
      `}</style>
    </div>
  );
}
