"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  Save,
  Lock,
  Bell,
  ShieldCheck,
  Globe,
  Coins,
  Palette,
  Check,
  Loader2,
  Shuffle,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToastStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useSessionProfile } from "@/lib/supabase/use-auth";
import { stickerAvatar, randomStickerSeed } from "@/lib/stickers";
import type { CountryCode } from "@/types";

const tabs = ["Channel", "Account", "Notifications", "Payments", "Privacy"] as const;

const countries: CountryCode[] = [
  "NG",
  "GH",
  "KE",
  "ZA",
  "RW",
  "UG",
];

const countryNames: Record<CountryCode, string> = {
  NG: "Nigeria",
  GH: "Ghana",
  KE: "Kenya",
  ZA: "South Africa",
  RW: "Rwanda",
  UG: "Uganda",
  ET: "Ethiopia",
  TZ: "Tanzania",
  SN: "Senegal",
  CM: "Cameroon",
  ZW: "Zimbabwe",
  ZM: "Zambia",
  EG: "Egypt",
  MA: "Morocco",
  CI: "Côte d'Ivoire",
  BJ: "Benin",
  SL: "Sierra Leone",
  MZ: "Mozambique",
  AO: "Angola",
  MW: "Malawi",
};

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Channel");
  const [saving, setSaving] = useState(false);
  const [rerolling, setRerolling] = useState(false);
  const showToast = useToastStore((s) => s.showToast);
  const { user, refresh } = useSessionProfile();

  const [form, setForm] = useState({
    displayName: "",
    username: "",
    bio: "Bringing African folklore to a new generation.",
    city: "Lagos",
    country: "NG" as CountryCode,
    whatsappEnabled: true,
    email: "",
    payoutEnabled: true,
    minimumPayout: 10000,
    publicTooltips: true,
  });

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      displayName: user.display_name ?? f.displayName,
      username: user.username || f.username,
      email: user.email || f.email,
    }));
  }, [user]);

  const rerollAvatar = async () => {
    if (!user) {
      showToast("Sign in required", "Sign in to update your avatar.");
      return;
    }
    setRerolling(true);
    try {
      const next = stickerAvatar(randomStickerSeed());
      const supabase = createClient();
      const { error } = await supabase
        .from("users")
        .update({ avatar: next })
        .eq("id", user.id);
      if (error) throw new Error(error.message);
      await refresh();
      showToast("New avatar assigned", "Your sticker avatar has been updated.");
    } catch {
      showToast("Update failed", "Could not update your avatar. Try again.");
    } finally {
      setRerolling(false);
    }
  };

  const [emailNotifs, setEmailNotifs] = useState({
    newFollower: true,
    comments: true,
    unlocks: true,
    tip: false,
    digests: false,
  });

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Settings saved", "Your changes have been updated.");
    }, 900);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-cream">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your channel, account, and payouts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-full border border-white/[0.1] p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
              tab === t
                ? "bg-gold text-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* CHANNEL */}
      {tab === "Channel" && (
        <div className="space-y-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-gold/40">
                <AvatarImage
                  src={user?.avatar ?? stickerAvatar(user?.email ?? "creator")}
                  alt={form.displayName || "Avatar"}
                />
                <AvatarFallback className="font-display text-2xl text-cream bg-gradient-to-br from-violet-500 to-fuchsia-600">
                  {(form.displayName || "AV").split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={rerollAvatar}
                disabled={rerolling}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] bg-charcoal-raised text-muted-foreground transition-colors hover:text-gold disabled:opacity-60"
                aria-label="Change avatar"
                title="Reroll sticker avatar"
              >
                {rerolling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Shuffle className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div>
              <p className="font-display text-base font-bold text-cream">
                Channel Avatar
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your unique sticker — tap the shuffle button to get a new one.
              </p>
            </div>
          </div>

          <Field label="Channel Name">
            <input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="input-base"
            />
          </Field>

          <Field label="Channel Username">
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="input-base"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Used in your profile URL: aafstories.africa/@
              <span className="text-gold">{form.username}</span>
            </p>
          </Field>

          <Field label="Bio">
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="input-base resize-none"
            />
            <p className="mt-1.5 text-right text-[11px] text-muted-foreground">
              {form.bio.length}/300
            </p>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City">
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input-base"
              />
            </Field>
            <Field label="Country">
              <select
                value={form.country}
                onChange={(e) =>
                  setForm({ ...form, country: e.target.value as CountryCode })
                }
                className="input-base"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {countryNames[c]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="rounded-xl border border-gold/20 bg-gold/[0.06] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="text-xs">
                <p className="font-bold text-cream">Verification status</p>
                <p className="mt-1 text-muted-foreground">
                  Your channel is verified. The gold badge appears next to your
                  name across Aafstories.
                </p>
              </div>
            </div>
          </div>

          <SaveButton save={save} saving={saving} />
        </div>
      )}

      {/* ACCOUNT */}
      {tab === "Account" && (
        <div className="space-y-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
          <div>
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-cream">
              <Lock className="h-4 w-4 text-gold" /> Login & Security
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage your login information and secure your account.
            </p>
          </div>

          <Field label="Email Address">
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-base"
            />
          </Field>

          <Field label="Password">
            <button className="input-base flex items-center justify-between text-left">
              <span className="text-muted-foreground">••••••••••••</span>
              <span className="text-xs font-bold text-gold">Change</span>
            </button>
          </Field>

          <div className="space-y-3">
            {[
              {
                title: "Two-factor authentication",
                desc: "Add an extra layer of security to your account.",
                enabled: true,
              },
              {
                title: "Login alerts",
                desc: "Get notified when a new device signs in.",
                enabled: false,
              },
            ].map((item) => (
              <ToggleRow
                key={item.title}
                title={item.title}
                desc={item.desc}
                defaultChecked={item.enabled}
              />
            ))}
          </div>

          <SaveButton save={save} saving={saving} />
        </div>
      )}

      {/* NOTIFICATIONS */}
      {tab === "Notifications" && (
        <div className="space-y-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
          <div>
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-cream">
              <Bell className="h-4 w-4 text-gold" /> Email Notifications
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose what updates you'd like to receive via email.
            </p>
          </div>

          <div className="space-y-1">
            {(
              [
                { key: "newFollower", title: "New followers", desc: "When someone follows your channel." },
                { key: "comments", title: "New comments", desc: "When a viewer comments on your story." },
                { key: "unlocks", title: "Premium unlocks", desc: "When a viewer unlocks your premium episode." },
                { key: "tip", title: "Tips & gifts", desc: "When someone tips or gifts you points." },
                { key: "digests", title: "Weekly digest", desc: "A summary of your channel performance each week." },
              ] as const
            ).map((item) => (
              <ToggleRow
                key={item.key}
                title={item.title}
                desc={item.desc}
                defaultChecked={emailNotifs[item.key]}
                onToggle={(v) => setEmailNotifs({ ...emailNotifs, [item.key]: v })}
              />
            ))}
          </div>

          <SaveButton save={save} saving={saving} />
        </div>
      )}

      {/* PAYMENTS */}
      {tab === "Payments" && (
        <div className="space-y-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
          <div>
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-cream">
              <Coins className="h-4 w-4 text-gold" /> Payout Settings
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Where and when your earnings are paid out.
            </p>
          </div>

          <Field label="Bank Account">
            <select className="input-base">
              {["Access Bank ·••• 6789", "Kuda •••• 4321"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>

          <Field label="Minimum Payout Threshold (₦)">
            <input
              type="number"
              value={form.minimumPayout}
              onChange={(e) => setForm({ ...form, minimumPayout: Number(e.target.value) })}
              className="input-base"
            />
          </Field>

          <ToggleRow
            title="Automatic payouts"
            desc="Send my available balance to my bank when it crosses the threshold."
            defaultChecked={form.payoutEnabled}
            onToggle={(v) => setForm({ ...form, payoutEnabled: v })}
          />

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs">
            <p className="font-bold text-cream">Withdrawal notes</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
              <li>Payouts settle within 1–3 business days.</li>
              <li>A processing fee of 1.5% applies to withdrawals.</li>
              <li>Minimum payout is ₦10,000.</li>
            </ul>
          </div>

          <SaveButton save={save} saving={saving} />
        </div>
      )}

      {/* PRIVACY */}
      {tab === "Privacy" && (
        <div className="space-y-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
          <div>
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-cream">
              <Globe className="h-4 w-4 text-gold" /> Privacy & Visibility
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Control how your channel and content appear.
            </p>
          </div>

          <ToggleRow
            title="Public channel"
            desc="Anyone can view your channel and stories."
            defaultChecked
          />
          <ToggleRow
            title="Show AI content labels"
            desc="Display AI Badges on your content."
            defaultChecked={form.publicTooltips}
            onToggle={(v) => setForm({ ...form, publicTooltips: v })}
          />
          <ToggleRow
            title="Hide earnings"
            desc="Keep your audience metrics private from viewers."
            defaultChecked
          />

          <div className="rounded-xl border border-gold/20 bg-gold/[0.06] p-4">
            <div className="flex items-start gap-3">
              <Palette className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="text-xs">
                <p className="font-bold text-cream">Content visibility</p>
                <p className="mt-1 text-muted-foreground">
                  Premium episodes are only visible to viewers after they unlock
                  them with points. You can change individual episode settings
                  from the Episodes page.
                </p>
              </div>
            </div>
          </div>

          <SaveButton save={save} saving={saving} />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-cream">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  defaultChecked,
  onToggle,
}: {
  title: string;
  desc: string;
  defaultChecked?: boolean;
  onToggle?: (v: boolean) => void;
}) {
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.04] py-3.5 last:border-0">
      <div>
        <p className="text-sm font-semibold text-cream">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={() => {
          const next = !checked;
          setChecked(next);
          onToggle?.(next);
        }}
        role="switch"
        aria-checked={checked}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-gold" : "bg-white/[0.12]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
            checked ? "left-[22px]" : "left-0.5"
          )}
        >
          {checked && <Check className="h-3 w-3 translate-x-1 translate-y-1 text-black" />}
        </span>
      </button>
    </div>
  );
}

function SaveButton({ save, saving }: { save: () => void; saving: boolean }) {
  return (
    <button
      onClick={save}
      disabled={saving}
      className="flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-black transition-all hover:bg-gold-dim disabled:opacity-60"
    >
      {saving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
        </>
      ) : (
        <>
          <Save className="h-4 w-4" /> Save Changes
        </>
      )}
    </button>
  );
}