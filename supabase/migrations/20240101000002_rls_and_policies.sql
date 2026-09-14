-- ============================================================================
-- Aafstories — RLS Policies & Security
-- Row Level Security policies for all tables
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PUBLIC READ ACCESS (anon role)
-- ============================================================================

-- Countries are public
CREATE POLICY "countries_public_read" ON countries FOR SELECT TO anon USING (TRUE);

-- Point packages are public
CREATE POLICY "point_packages_public_read" ON point_packages FOR SELECT TO anon USING (active = TRUE);

-- Published series are public
CREATE POLICY "series_public_read" ON series FOR SELECT TO anon USING (status = 'published');

-- Published videos are public
CREATE POLICY "videos_public_read" ON videos FOR SELECT TO anon USING (status = 'published');

-- Episodes of published series are public
CREATE POLICY "episodes_public_read" ON episodes FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM series WHERE id = episodes.series_id AND status = 'published')
);

-- Approved creator profiles are public
CREATE POLICY "creator_profiles_public_read" ON creator_profiles FOR SELECT TO anon USING (status = 'approved');

-- Seasons of published series are public
CREATE POLICY "seasons_public_read" ON seasons FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM series WHERE id = seasons.series_id AND status = 'published')
);

-- Search index is public
CREATE POLICY "search_index_public_read" ON search_index FOR SELECT TO anon USING (TRUE);

-- Materialized views (mv_top_creators, mv_trending_videos, mv_top_series):
-- public read access is granted via GRANT SELECT in 0001 (RLS policies are not allowed on matviews)

-- ============================================================================
-- AUTHENTICATED USER POLICIES
-- ============================================================================

-- Users can read their own profile, admins can read all
CREATE POLICY "users_select_own" ON users FOR SELECT TO authenticated USING (
  auth.uid() = id OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Users can update their own profile (limited fields)
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Creator profiles: owner can read/update, admins can manage all
CREATE POLICY "creator_profiles_select_own" ON creator_profiles FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR
  status = 'approved' OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "creator_profiles_insert_own" ON creator_profiles FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "creator_profiles_update_own" ON creator_profiles FOR UPDATE TO authenticated USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Series: owner can manage, admins can manage all
CREATE POLICY "series_select_own" ON series FOR SELECT TO authenticated USING (
  status = 'published' OR
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "series_insert_own" ON series FOR INSERT TO authenticated WITH CHECK (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid() AND status = 'approved')
);

CREATE POLICY "series_update_own" ON series FOR UPDATE TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "series_delete_own" ON series FOR DELETE TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Seasons: follow series permissions
CREATE POLICY "seasons_select_own" ON seasons FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM series WHERE id = seasons.series_id AND status = 'published') OR
  EXISTS (SELECT 1 FROM series WHERE id = seasons.series_id AND creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "seasons_insert_own" ON seasons FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM series WHERE id = seasons.series_id AND creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "seasons_update_own" ON seasons FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM series WHERE id = seasons.series_id AND creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()))
);

-- Videos: owner can manage, admins can manage all
CREATE POLICY "videos_select_own" ON videos FOR SELECT TO authenticated USING (
  status = 'published' OR
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "videos_insert_own" ON videos FOR INSERT TO authenticated WITH CHECK (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid() AND status = 'approved')
);

CREATE POLICY "videos_update_own" ON videos FOR UPDATE TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "videos_delete_own" ON videos FOR DELETE TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Episodes: follow series permissions
CREATE POLICY "episodes_select_own" ON episodes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM series WHERE id = episodes.series_id AND status = 'published') OR
  EXISTS (SELECT 1 FROM series WHERE id = episodes.series_id AND creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "episodes_insert_own" ON episodes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM series WHERE id = episodes.series_id AND creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "episodes_update_own" ON episodes FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM series WHERE id = episodes.series_id AND creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "episodes_delete_own" ON episodes FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM series WHERE id = episodes.series_id AND creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()))
);

-- Video likes: users manage their own likes
CREATE POLICY "video_likes_select_own" ON video_likes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "video_likes_insert_own" ON video_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "video_likes_delete_own" ON video_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Follows: users manage their own follows
CREATE POLICY "follows_select_own" ON follows FOR SELECT TO authenticated USING (follower_id = auth.uid());
CREATE POLICY "follows_insert_own" ON follows FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());
CREATE POLICY "follows_delete_own" ON follows FOR DELETE TO authenticated USING (follower_id = auth.uid());

-- Comments: users manage their own comments
CREATE POLICY "comments_select_all" ON comments FOR SELECT TO authenticated USING (
  -- Can read comments on published content or own comments
  (video_id IN (SELECT id FROM videos WHERE status = 'published')) OR
  (episode_id IN (SELECT e.id FROM episodes e JOIN series s ON s.id = e.series_id WHERE s.status = 'published')) OR
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "comments_insert_own" ON comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_update_own" ON comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_delete_own" ON comments FOR DELETE TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Comment likes: users manage their own
CREATE POLICY "comment_likes_select_own" ON comment_likes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "comment_likes_insert_own" ON comment_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "comment_likes_delete_own" ON comment_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Watch history: users manage their own
CREATE POLICY "watch_history_select_own" ON watch_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "watch_history_insert_own" ON watch_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "watch_history_update_own" ON watch_history FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "watch_history_delete_own" ON watch_history FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Watchlist: users manage their own
CREATE POLICY "watchlist_select_own" ON watchlist FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "watchlist_insert_own" ON watchlist FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "watchlist_delete_own" ON watchlist FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Point transactions: users can read their own
CREATE POLICY "point_transactions_select_own" ON point_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Point wallets: users can read their own
CREATE POLICY "point_wallets_select_own" ON point_wallets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "point_wallets_update_own" ON point_wallets FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Creator earnings: creator can read their own, admins can read all
CREATE POLICY "creator_earnings_select_own" ON creator_earnings FOR SELECT TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Withdrawals: creator can manage their own, admins can manage all
CREATE POLICY "withdrawals_select_own" ON withdrawals FOR SELECT TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "withdrawals_insert_own" ON withdrawals FOR INSERT TO authenticated WITH CHECK (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "withdrawals_update_own" ON withdrawals FOR UPDATE TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications: users manage their own
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Reports: reporter can read own, admins can read all
CREATE POLICY "reports_select_own" ON reports FOR SELECT TO authenticated USING (
  reporter_id = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "reports_insert_own" ON reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "reports_update_admin" ON reports FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Video processing jobs: creator can read their own, admins can read all
CREATE POLICY "video_processing_jobs_select_own" ON video_processing_jobs FOR SELECT TO authenticated USING (
  video_id IN (SELECT id FROM videos WHERE creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "video_processing_jobs_insert_own" ON video_processing_jobs FOR INSERT TO authenticated WITH CHECK (
  video_id IN (SELECT id FROM videos WHERE creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()))
);

-- Analytics: creator can read their own, admins can read all
CREATE POLICY "creator_analytics_select_own" ON creator_analytics_daily FOR SELECT TO authenticated USING (
  creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "video_analytics_select_own" ON video_analytics_daily FOR SELECT TO authenticated USING (
  video_id IN (SELECT id FROM videos WHERE creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- ADMIN-ONLY POLICIES
-- ============================================================================

-- Admins can manage everything
CREATE POLICY "admin_all_users" ON users FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_creator_profiles" ON creator_profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_series" ON series FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_videos" ON videos FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_episodes" ON episodes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_reports" ON reports FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_withdrawals" ON withdrawals FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- FUNCTION PERMISSIONS
-- ============================================================================

-- Grant execute on security definer functions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_wallet_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_enough_points(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_points(UUID, INT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_points(UUID, INT, transaction_type, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION unlock_episode(UUID, UUID, UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_content(TEXT, TEXT, country_code, TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recommended_videos(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_creator_earnings_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_analytics_mvs() TO authenticated;
GRANT EXECUTE ON FUNCTION start_video_processing(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_video_processing(UUID, TEXT, TEXT, TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION fail_video_processing(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_country_content_counts() TO authenticated;

-- ============================================================================
-- SECURITY DEFINER FUNCTIONS FOR CROSS-TABLE OPERATIONS
-- ============================================================================

-- Function to safely create a creator profile (called after user signup)
CREATE OR REPLACE FUNCTION public.create_creator_profile(
  p_user_id UUID,
  p_username TEXT,
  p_display_name TEXT,
  p_country country_code,
  p_city TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT '',
  p_avatar TEXT DEFAULT NULL,
  p_avatar_gradient TEXT DEFAULT 'from-gray-500 to-gray-700',
  p_cover_image TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_creator_id UUID;
BEGIN
  -- Verify user exists and is a creator
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND role = 'creator') THEN
    RAISE EXCEPTION 'User not found or not a creator';
  END IF;

  -- Check username availability
  IF EXISTS (SELECT 1 FROM creator_profiles WHERE username = p_username) THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;

  INSERT INTO creator_profiles (
    user_id, username, display_name, country, city, bio,
    avatar, avatar_gradient, cover_image, status
  ) VALUES (
    p_user_id, p_username, p_display_name, p_country, p_city, p_bio,
    p_avatar, p_avatar_gradient, p_cover_image, 'pending'
  ) RETURNING id INTO v_creator_id;

  -- Initialize wallet
  INSERT INTO point_wallets (user_id, balance, lifetime_points)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN v_creator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_creator_profile(UUID, TEXT, TEXT, country_code, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Function to safely purchase points
CREATE OR REPLACE FUNCTION public.purchase_points(
  p_user_id UUID,
  p_package_id TEXT,
  p_reference TEXT
)
RETURNS TABLE(success BOOLEAN, new_balance INT, transaction_id UUID) AS $$
DECLARE
  v_package RECORD;
  v_points INT;
  v_bonus INT;
  v_tx_id UUID;
BEGIN
  -- Get package details
  SELECT * INTO v_package FROM point_packages WHERE id = p_package_id AND active = TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid package';
  END IF;

  v_points := v_package.points;
  v_bonus := COALESCE(v_package.bonus, 0);

  -- Record purchase transaction
  INSERT INTO point_transactions (user_id, type, amount, description, reference, status, completed_at)
  VALUES (p_user_id, 'purchase', v_points + v_bonus, 'Purchased ' || v_package.points || ' points package', p_reference, 'success', NOW())
  RETURNING id INTO v_tx_id;

  -- Record bonus if applicable
  IF v_bonus > 0 THEN
    INSERT INTO point_transactions (user_id, type, amount, description, reference, status, completed_at)
    VALUES (p_user_id, 'bonus', v_bonus, 'Purchase bonus', p_reference || '_bonus', 'success', NOW());
  END IF;

  -- Update wallet
  INSERT INTO point_wallets (user_id, balance, lifetime_points)
  VALUES (p_user_id, v_points + v_bonus, v_points + v_bonus)
  ON CONFLICT (user_id) DO UPDATE SET
    balance = point_wallets.balance + v_points + v_bonus,
    lifetime_points = point_wallets.lifetime_points + v_points + v_bonus;

  RETURN QUERY SELECT TRUE, (SELECT balance FROM point_wallets WHERE user_id = p_user_id), v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.purchase_points(UUID, TEXT, TEXT) TO authenticated;

-- ============================================================================
-- AUDIT LOGGING (Optional - for sensitive operations)
-- ============================================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_read" ON audit_log FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Trigger function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_creator_profiles AFTER INSERT OR UPDATE OR DELETE ON creator_profiles FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_withdrawals AFTER INSERT OR UPDATE OR DELETE ON withdrawals FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_point_transactions AFTER INSERT OR UPDATE ON point_transactions FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ============================================================================
-- COMPLETION
-- ============================================================================

COMMENT ON TABLE audit_log IS 'Audit trail for sensitive operations';