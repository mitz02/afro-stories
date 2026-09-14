-- Fix RLS infinite recursion (42P17) in public RLS policies.
-- Each EXISTS(SELECT 1 FROM users WHERE id=auth.uid() AND role='admin') re-triggers the
-- users_select_own policy on the same relation -> infinite recursion. Replace with a
-- SECURITY DEFINER helper (runs with RLS bypass).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Recreate affected policies (29):

DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users FOR SELECT TO authenticated USING (
  auth.uid() = id OR
  public.is_admin()
);

DROP POLICY IF EXISTS "creator_profiles_select_own" ON creator_profiles;
CREATE POLICY "creator_profiles_select_own" ON creator_profiles FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR
  status = 'approved' OR
  public.is_admin()
);

DROP POLICY IF EXISTS "creator_profiles_update_own" ON creator_profiles;
CREATE POLICY "creator_profiles_update_own" ON creator_profiles FOR UPDATE TO authenticated USING (
  user_id = auth.uid() OR
  public.is_admin()
) WITH CHECK (
  user_id = auth.uid() OR
  public.is_admin()
);

DROP POLICY IF EXISTS "series_select_own" ON series;
CREATE POLICY "series_select_own" ON series FOR SELECT TO authenticated USING (
  status = 'published' OR
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "series_update_own" ON series;
CREATE POLICY "series_update_own" ON series FOR UPDATE TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
) WITH CHECK (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "series_delete_own" ON series;
CREATE POLICY "series_delete_own" ON series FOR DELETE TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "seasons_select_own" ON seasons;
CREATE POLICY "seasons_select_own" ON seasons FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM series WHERE id = seasons.series_id AND status = 'published') OR
  EXISTS (SELECT 1 FROM series WHERE id = seasons.series_id AND creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "videos_select_own" ON videos;
CREATE POLICY "videos_select_own" ON videos FOR SELECT TO authenticated USING (
  status = 'published' OR
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "videos_update_own" ON videos;
CREATE POLICY "videos_update_own" ON videos FOR UPDATE TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
) WITH CHECK (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "videos_delete_own" ON videos;
CREATE POLICY "videos_delete_own" ON videos FOR DELETE TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "episodes_select_own" ON episodes;
CREATE POLICY "episodes_select_own" ON episodes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM series WHERE id = episodes.series_id AND status = 'published') OR
  EXISTS (SELECT 1 FROM series WHERE id = episodes.series_id AND creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "comments_select_all" ON comments;
CREATE POLICY "comments_select_all" ON comments FOR SELECT TO authenticated USING (
  -- Can read comments on published content or own comments
  (video_id IN (SELECT id FROM videos WHERE status = 'published')) OR
  (episode_id IN (SELECT e.id FROM episodes e JOIN series s ON s.id = e.series_id WHERE s.status = 'published')) OR
  user_id = auth.uid() OR
  public.is_admin()
);

DROP POLICY IF EXISTS "comments_delete_own" ON comments;
CREATE POLICY "comments_delete_own" ON comments FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "creator_earnings_select_own" ON creator_earnings;
CREATE POLICY "creator_earnings_select_own" ON creator_earnings FOR SELECT TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "withdrawals_select_own" ON withdrawals;
CREATE POLICY "withdrawals_select_own" ON withdrawals FOR SELECT TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "withdrawals_update_own" ON withdrawals;
CREATE POLICY "withdrawals_update_own" ON withdrawals FOR UPDATE TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
) WITH CHECK (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "reports_select_own" ON reports;
CREATE POLICY "reports_select_own" ON reports FOR SELECT TO authenticated USING (
  reporter_id = auth.uid() OR
  public.is_admin()
);

DROP POLICY IF EXISTS "reports_update_admin" ON reports;
CREATE POLICY "reports_update_admin" ON reports FOR UPDATE TO authenticated USING (
  public.is_admin()
) WITH CHECK (
  public.is_admin()
);

DROP POLICY IF EXISTS "video_processing_jobs_select_own" ON video_processing_jobs;
CREATE POLICY "video_processing_jobs_select_own" ON video_processing_jobs FOR SELECT TO authenticated USING (
  video_id IN (SELECT id FROM videos WHERE creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "creator_analytics_select_own" ON creator_analytics_daily;
CREATE POLICY "creator_analytics_select_own" ON creator_analytics_daily FOR SELECT TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "video_analytics_select_own" ON video_analytics_daily;
CREATE POLICY "video_analytics_select_own" ON video_analytics_daily FOR SELECT TO authenticated USING (
  video_id IN (SELECT id FROM videos WHERE creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "admin_all_users" ON users;
CREATE POLICY "admin_all_users" ON users FOR ALL TO authenticated USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "admin_all_creator_profiles" ON creator_profiles;
CREATE POLICY "admin_all_creator_profiles" ON creator_profiles FOR ALL TO authenticated USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "admin_all_series" ON series;
CREATE POLICY "admin_all_series" ON series FOR ALL TO authenticated USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "admin_all_videos" ON videos;
CREATE POLICY "admin_all_videos" ON videos FOR ALL TO authenticated USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "admin_all_episodes" ON episodes;
CREATE POLICY "admin_all_episodes" ON episodes FOR ALL TO authenticated USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "admin_all_reports" ON reports;
CREATE POLICY "admin_all_reports" ON reports FOR ALL TO authenticated USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "admin_all_withdrawals" ON withdrawals;
CREATE POLICY "admin_all_withdrawals" ON withdrawals FOR ALL TO authenticated USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "audit_log_admin_read" ON audit_log;
CREATE POLICY "audit_log_admin_read" ON audit_log FOR SELECT TO authenticated USING (
  public.is_admin()
);
