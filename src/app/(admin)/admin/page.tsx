"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, ThumbsUp, MessageCircle, Users, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface Flags {
  viewsTracking: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
}

interface VideoStat {
  id: string;
  title: string;
  views: number;
  likes: number;
  status: string;
  creator: string;
}

interface Totals {
  videos: number;
  views: number;
  likes: number;
  comments: number;
  follows: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [flags, setFlags] = useState<Flags | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [topVideos, setTopVideos] = useState<VideoStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, statsRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/stats"),
      ]);
      if (settingsRes.status === 403 || statsRes.status === 403) {
        setError("Not authorized. You need an admin account.");
        return;
      }
      if (!settingsRes.ok || !statsRes.ok) throw new Error("Failed to load admin data");
      const settingsData = (await settingsRes.json()) as { flags: Flags };
      const statsData = (await statsRes.json()) as { totals: Totals; topVideos: VideoStat[] };
      setFlags(settingsData.flags);
      setTotals(statsData.totals);
      setTopVideos(statsData.topVideos);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const toggleFlag = async (key: string, value: boolean) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = (await res.json()) as { flags: Flags };
      setFlags(data.flags);
    } catch {
      // revert optimistic UI by reloading
      void load();
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="mt-4 font-display text-lg text-cream">Loading admin panel…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-4 text-center">
        <Shield className="mb-4 h-12 w-12 text-crimson" />
        <p className="font-display text-xl text-cream">{error}</p>
        <button
          onClick={() => router.push("/home")}
          className="mt-4 rounded-full bg-gold px-6 py-2 text-sm font-bold text-black hover:bg-gold-dim"
        >
          Go back
        </button>
      </div>
    );
  }

  const toggleDefinitions: { key: string; label: string; description: string; apiKey: keyof Flags }[] = [
    { key: "views_tracking_enabled", label: "View counting", description: "Increment view counts when users watch videos.", apiKey: "viewsTracking" },
    { key: "likes_enabled", label: "Likes", description: "Allow users to like videos.", apiKey: "likes" },
    { key: "comments_enabled", label: "Comments", description: "Allow users to post and view comments.", apiKey: "comments" },
    { key: "follows_enabled", label: "Follows", description: "Allow users to follow creators.", apiKey: "follows" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-gold" />
        <h1 className="font-display text-2xl font-bold text-cream">Admin Dashboard</h1>
      </div>

      {/* Stats cards */}
      {totals && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={<Eye className="h-5 w-5 text-gold" />} label="Total views" value={totals.views.toLocaleString()} />
          <StatCard icon={<ThumbsUp className="h-5 w-5 text-gold" />} label="Total likes" value={totals.likes.toLocaleString()} />
          <StatCard icon={<MessageCircle className="h-5 w-5 text-gold" />} label="Comments" value={totals.comments.toLocaleString()} />
          <StatCard icon={<Users className="h-5 w-5 text-gold" />} label="Follows" value={totals.follows.toLocaleString()} />
        </div>
      )}

      {/* Feature toggles */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-cream">Feature Toggles</h2>
        <Card className="mt-3 divide-y divide-white/[0.06] bg-white/[0.02] p-1">
          {toggleDefinitions.map((t) => (
            <div key={t.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-cream">{t.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
              </div>
              <Switch
                checked={flags?.[t.apiKey] ?? true}
                onCheckedChange={(checked: boolean) => void toggleFlag(t.key, checked)}
                disabled={savingKey === t.key}
              />
            </div>
          ))}
        </Card>
      </section>

      {/* Top videos table */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-cream">Top Videos by Views</h2>
        {topVideos.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No videos yet.</p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3 text-right">Views</th>
                  <th className="hidden px-4 py-3 text-right sm:table-cell">Likes</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Status</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Creator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {topVideos.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02]">
                    <td className="max-w-[260px] truncate px-4 py-3 font-semibold text-cream">{v.title}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{v.views.toLocaleString()}</td>
                    <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground sm:table-cell">{v.likes.toLocaleString()}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          v.status === "published"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : v.status === "processing"
                            ? "bg-gold/10 text-gold"
                            : "bg-white/[0.06] text-muted-foreground"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{v.creator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-cream">{value}</p>
    </Card>
  );
}