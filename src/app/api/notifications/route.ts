import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service-role";
import { timeAgo } from "@/lib/utils";
import { notifications as mockNotifications } from "@/lib/data/notifications";

export const runtime = "nodejs";

interface DbNotificationRow {
  id: string;
  user_id: string;
  type: string | null;
  title: string;
  message: string;
  image: string | null;
  link: string | null;
  read: boolean | null;
  created_at: string | null;
}

export interface ApiNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  image: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
  timeAgo: string;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is not authenticated (guest), provide curated system/announcement updates
    if (!user) {
      const guestItems: ApiNotification[] = [
        {
          id: "guest_welcome",
          userId: "guest",
          type: "system",
          title: "Welcome to AfriTales ✨",
          message: "Explore timeless African folklore, mythology, and cinematic short series.",
          image: null,
          link: "/home",
          read: false,
          createdAt: new Date().toISOString(),
          timeAgo: "Just now",
        },
        {
          id: "guest_trending",
          userId: "guest",
          type: "new_episode",
          title: "Trending Story: The Legend of Queen Amina",
          message: "Discover this week's #1 African historical epic.",
          image: "https://images.unsplash.com/photo-1489674267075-cee793167910?w=200&q=80",
          link: "/watch/v_hero_lastkingdom",
          read: false,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          timeAgo: "2h ago",
        },
        {
          id: "guest_signin",
          userId: "guest",
          type: "unlock",
          title: "Sign in to unlock full stories",
          message: "Create your free account to keep your history, wallet & notifications in sync.",
          image: null,
          link: "/login",
          read: false,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          timeAgo: "5h ago",
        },
      ];
      return NextResponse.json({
        notifications: guestItems,
        unread: guestItems.length,
        isGuest: true,
      });
    }

    // Authenticated user: fetch from database
    const { data, error } = await supabase
      .from("notifications")
      .select("id, user_id, type, title, message, image, link, read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60);

    if (!error && data && data.length > 0) {
      const items: ApiNotification[] = data.map((v) => {
        const row = v as unknown as DbNotificationRow;
        const createdAt = row.created_at ?? new Date().toISOString();
        return {
          id: row.id,
          userId: row.user_id,
          type: row.type ?? "system",
          title: row.title,
          message: row.message,
          image: row.image ?? null,
          link: row.link ?? null,
          read: row.read ?? false,
          createdAt,
          timeAgo: timeAgo(createdAt),
        };
      });

      const unread = items.filter((n) => !n.read).length;
      return NextResponse.json({ notifications: items, unread });
    }

    // If user has 0 notifications in DB (e.g. newly registered), seed starter notifications into DB
    const starters = [
      {
        user_id: user.id,
        type: "system",
        title: "Welcome to AfriTales! ✨",
        message: "Your journey into rich African storytelling begins now.",
        image: null,
        link: "/home",
        read: false,
      },
      {
        user_id: user.id,
        type: "new_episode",
        title: "New Episode Available",
        message: "The Last Kingdom S2 E2 — \"The Brothers' Betrayal\" is ready to watch.",
        image: "https://images.unsplash.com/photo-1489674267075-cee793167910?w=200&q=80",
        link: "/watch/v_hero_lastkingdom",
        read: false,
      },
      {
        user_id: user.id,
        type: "unlock",
        title: "Points Balance Ready",
        message: "Use points to unlock premium episodes anytime.",
        image: null,
        link: "/wallet",
        read: false,
      },
    ];

    // Attempt to persist starters in background using service client
    try {
      const serviceClient = getServiceClient();
      void serviceClient
        .from("notifications")
        .insert(starters)
        .then(
          () => undefined,
          () => undefined
        );
    } catch {
      // ignore
    }

    const fallbackItems: ApiNotification[] = starters.map((s, index) => ({
      id: `seed_${index}`,
      userId: user.id,
      type: s.type,
      title: s.title,
      message: s.message,
      image: s.image,
      link: s.link,
      read: s.read,
      createdAt: new Date().toISOString(),
      timeAgo: "Just now",
    }));

    return NextResponse.json({
      notifications: fallbackItems,
      unread: fallbackItems.length,
    });
  } catch (err) {
    console.error("Notifications GET error:", err);
    // Graceful fallback to mock data on server exception
    const items: ApiNotification[] = mockNotifications.slice(0, 5).map((m) => ({
      id: m.id,
      userId: m.userId,
      type: m.type,
      title: m.title,
      message: m.message,
      image: m.image ?? null,
      link: m.link ?? null,
      read: m.read,
      createdAt: m.createdAt,
      timeAgo: timeAgo(m.createdAt),
    }));
    return NextResponse.json({
      notifications: items,
      unread: items.filter((n) => !n.read).length,
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = (await req.json().catch(() => ({}))) as {
      notificationId?: string;
      all?: boolean;
    };

    if (!user) {
      // Guests acknowledge locally
      return NextResponse.json({ ok: true });
    }

    if (body.all) {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) console.warn("Notifications mark-all error:", error.message);
      return NextResponse.json({ ok: true });
    }

    if (body.notificationId) {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", body.notificationId)
        .eq("user_id", user.id);

      if (error) console.warn("Notifications mark-one error:", error.message);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "notificationId or all is required." }, { status: 400 });
  } catch (err) {
    console.error("Notifications PATCH error:", err);
    return NextResponse.json({ ok: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = (await req.json().catch(() => ({}))) as {
      type?: string;
      title?: string;
      message?: string;
      image?: string;
      link?: string;
      userId?: string;
    };

    const targetUserId = body.userId ?? user?.id;
    if (!targetUserId || !body.title || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields: title, message, targetUserId" },
        { status: 400 }
      );
    }

    const client = (() => {
      try {
        return getServiceClient();
      } catch {
        return supabase;
      }
    })();

    const { data, error } = await client
      .from("notifications")
      .insert({
        user_id: targetUserId,
        type: body.type ?? "system",
        title: body.title,
        message: body.message,
        image: body.image ?? null,
        link: body.link ?? null,
        read: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: data });
  } catch (err) {
    console.error("Notifications POST error:", err);
    return NextResponse.json({ error: "Failed to create notification." }, { status: 500 });
  }
}
