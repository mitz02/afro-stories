-- 20240101000007 VIEWS TRACKING + ADMIN FEATURE FLAGS + ADMIN ROLE
-- ------------------------------------------------------------------
-- 1. Increment views: videos already have a `views` column; nothing writes
--    to it at runtime. This RPC is SECURITY DEFINER so anon viewers can
--    bump counters without touching video row RLS (which only permits the
--    owning creator / admins to UPDATE polls).
-- 2. app_settings: simple key/value feature-flag table the admin dashboard
--    reads and writes. Apps default every flag to ON.
-- 3. Promote the seed account chief_uwa@aafstories.com to role 'admin' so
--    the admin dashboard is reachable. Change the email below if your admin
--    account differs.

-- 1) Views counter RPC --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_video_views(p_video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE videos SET views = views + 1 WHERE id = p_video_id;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_video_views(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_video_views(uuid) TO anon, authenticated;

-- 2) Feature flags table ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
  key        TEXT PRIMARY KEY,
  value      BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by UUID REFERENCES public.users (id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_settings (key, value) VALUES
  ('views_tracking_enabled', TRUE),
  ('likes_enabled',          TRUE),
  ('comments_enabled',       TRUE),
  ('follows_enabled',        TRUE)
ON CONFLICT (key) DO NOTHING;

-- anyone can read flags (public read-only)
DROP POLICY IF EXISTS "app_settings_public_read" ON public.app_settings;
CREATE POLICY "app_settings_public_read" ON public.app_settings
  FOR SELECT TO anon, authenticated USING (TRUE);

-- only admins may write flags
DROP POLICY IF EXISTS "app_settings_admin_write" ON public.app_settings;
CREATE POLICY "app_settings_admin_write" ON public.app_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3) Promote a real account to admin (change the email if yours differs) ------
UPDATE public.users
SET role = 'admin'
WHERE email = 'chief_uwa@aafstories.com'
  AND role <> 'admin';