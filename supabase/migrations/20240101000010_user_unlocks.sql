-- ============================================================================
-- USER UNLOCKS / PURCHASES
-- Permanent access tracking for episodes and series (separate from watch_history)
-- ============================================================================

-- 1) User unlocks table - source of truth for permanent access
CREATE TABLE IF NOT EXISTS user_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Polymorphic: either episode_id OR series_id is set (enforced by check constraint)
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE, -- denormalized for fast lookups
  price_paid INT NOT NULL, -- points paid at time of purchase
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Metadata for refunds, promotions, etc.
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, episode_id),
  UNIQUE(user_id, series_id),
  CONSTRAINT chk_unlock_target CHECK (
    (episode_id IS NOT NULL AND series_id IS NULL) OR
    (episode_id IS NULL AND series_id IS NOT NULL)
  )
);

CREATE INDEX idx_user_unlocks_user_id ON user_unlocks(user_id);
CREATE INDEX idx_user_unlocks_episode_id ON user_unlocks(episode_id);
CREATE INDEX idx_user_unlocks_series_id ON user_unlocks(series_id);
CREATE INDEX idx_user_unlocks_video_id ON user_unlocks(video_id);
CREATE INDEX idx_user_unlocks_user_episode ON user_unlocks(user_id, episode_id);
CREATE INDEX idx_user_unlocks_user_series ON user_unlocks(user_id, series_id);
-- Composite index for "has user unlocked this video?" queries (covers both episode and series)
CREATE INDEX idx_user_unlocks_user_video ON user_unlocks(user_id, video_id);

-- RLS policies
ALTER TABLE user_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_unlocks_select_own" ON user_unlocks;
CREATE POLICY "user_unlocks_select_own" ON user_unlocks
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_unlocks_insert_own" ON user_unlocks;
CREATE POLICY "user_unlocks_insert_own" ON user_unlocks
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Allow service role / admin functions to insert
GRANT SELECT, INSERT ON user_unlocks TO authenticated;
GRANT ALL ON user_unlocks TO service_role;


-- 2) Series pricing for bulk unlock
-- Add bulk_unlock_price to series table (if not exists, will be added via migration)
-- For now we'll compute it dynamically: sum of remaining episode prices * discount factor


-- 3) Optimized unlock_episode function - uses user_unlocks table
CREATE OR REPLACE FUNCTION unlock_episode(p_user_id UUID, p_episode_id UUID, p_video_id UUID, p_price INT)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN;
  v_series_id UUID;
BEGIN
  -- Check if already unlocked (fast indexed lookup)
  IF EXISTS (SELECT 1 FROM user_unlocks WHERE user_id = p_user_id AND episode_id = p_episode_id) THEN
    RETURN TRUE;
  END IF;

  -- Deduct points
  v_success := deduct_points(p_user_id, p_price, 'Unlocked episode', p_episode_id::TEXT);
  IF NOT v_success THEN
    RETURN FALSE;
  END IF;

  -- Get series_id for potential series unlock tracking
  SELECT series_id INTO v_series_id FROM episodes WHERE id = p_episode_id;

  -- Record permanent unlock in user_unlocks
  INSERT INTO user_unlocks (user_id, episode_id, series_id, video_id, price_paid)
  VALUES (p_user_id, p_episode_id, v_series_id, p_video_id, p_price);

  -- Update episode views
  UPDATE episodes SET views = views + 1 WHERE id = p_episode_id;

  -- Update video views
  UPDATE videos SET views = views + 1 WHERE id = p_video_id;

  -- Creator earnings
  INSERT INTO creator_earnings (creator_id, video_id, episode_id, amount, unlocked_by, platform_commission, net_earnings)
  SELECT cp.id, p_video_id, p_episode_id, p_price, p_user_id, 30.00, (p_price * 70 / 100) * 10
  FROM creator_profiles cp
  JOIN videos v ON v.creator_id = cp.id
  WHERE v.id = p_video_id;

  -- Also update watch_history for progress tracking (non-blocking)
  INSERT INTO watch_history (user_id, video_id, episode_id, watched_at, progress, completed, watch_time)
  VALUES (p_user_id, p_video_id, p_episode_id, NOW(), 100, TRUE, 0)
  ON CONFLICT (user_id, video_id) DO UPDATE SET
    progress = 100,
    completed = TRUE,
    watched_at = NOW();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION unlock_episode(UUID, UUID, UUID, INT) TO authenticated;


-- 4) New function: Unlock entire series (bulk purchase)
-- Only works for completed series
CREATE OR REPLACE FUNCTION unlock_series(p_user_id UUID, p_series_id UUID, p_price INT)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN;
  v_video_ids UUID[];
  v_episode_count INT;
  v_unlocks_inserted INT := 0;
BEGIN
  -- Verify series exists and is completed
  IF NOT EXISTS (SELECT 1 FROM series WHERE id = p_series_id AND completed = TRUE AND status = 'published') THEN
    RAISE EXCEPTION 'Series not found, not completed, or not published';
  END IF;

  -- Check if already unlocked
  IF EXISTS (SELECT 1 FROM user_unlocks WHERE user_id = p_user_id AND series_id = p_series_id) THEN
    RETURN TRUE;
  END IF;

  -- Deduct points
  v_success := deduct_points(p_user_id, p_price, 'Unlocked full series', p_series_id::TEXT);
  IF NOT v_success THEN
    RETURN FALSE;
  END IF;

  -- Get all episode video_ids for this series
  SELECT ARRAY_AGG(e.video_id) INTO v_video_ids
  FROM episodes e
  WHERE e.series_id = p_series_id;

  IF v_video_ids IS NULL OR array_length(v_video_ids, 1) = 0 THEN
    RAISE EXCEPTION 'Series has no episodes';
  END IF;

  -- Bulk insert unlocks for all episodes in the series
  INSERT INTO user_unlocks (user_id, episode_id, series_id, video_id, price_paid)
  SELECT p_user_id, e.id, p_series_id, e.video_id, 
         CASE 
           WHEN p_price > 0 AND (SELECT COUNT(*) FROM episodes WHERE series_id = p_series_id) > 0
           THEN p_price / (SELECT COUNT(*) FROM episodes WHERE series_id = p_series_id)
           ELSE 0
         END
  FROM episodes e
  WHERE e.series_id = p_series_id
  ON CONFLICT (user_id, episode_id) DO NOTHING;

  GET DIAGNOSTICS v_unlocks_inserted = ROW_COUNT;

  -- Update views for all episodes
  UPDATE episodes SET views = views + 1 WHERE series_id = p_series_id;

  -- Update series total views
  UPDATE series SET total_views = total_views + v_unlocks_inserted WHERE id = p_series_id;

  -- Creator earnings for series unlock (single record)
  INSERT INTO creator_earnings (creator_id, video_id, episode_id, amount, unlocked_by, platform_commission, net_earnings)
  SELECT cp.id, v_video_ids[1], NULL, p_price, p_user_id, 30.00, (p_price * 70 / 100) * 10
  FROM creator_profiles cp
  JOIN videos v ON v.creator_id = cp.id
  WHERE v.id = v_video_ids[1];

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION unlock_series(UUID, UUID, INT) TO authenticated;


-- 5) Helper function: Check if user has access to video (episode or series)
-- Returns: has_access (boolean), unlock_type ('episode'|'series'|'free')
CREATE OR REPLACE FUNCTION check_user_video_access(p_user_id UUID, p_video_id UUID)
RETURNS TABLE(has_access BOOLEAN, unlock_type TEXT, episode_id UUID, series_id UUID) AS $$
DECLARE
  v_video videos%ROWTYPE;
  v_episode episodes%ROWTYPE;
  v_series series%ROWTYPE;
BEGIN
  -- Get video info
  SELECT * INTO v_video FROM videos WHERE id = p_video_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'not_found', NULL, NULL;
    RETURN;
  END IF;

  -- Free content - always accessible
  IF v_video.monetization = 'free' THEN
    RETURN QUERY SELECT TRUE, 'free', NULL, NULL;
    RETURN;
  END IF;

  -- Not authenticated
  IF p_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'locked', NULL, NULL;
    RETURN;
  END IF;

  -- Check episode unlock
  IF v_video.episode_id IS NOT NULL THEN
    SELECT e.*, s.completed as series_completed, s.id as series_id_val
    INTO v_episode, v_series
    FROM episodes e
    LEFT JOIN series s ON s.id = e.series_id
    WHERE e.id = v_video.episode_id;

    IF FOUND THEN
      -- Check episode unlock
      IF EXISTS (SELECT 1 FROM user_unlocks WHERE user_id = p_user_id AND episode_id = v_episode.id) THEN
        RETURN QUERY SELECT TRUE, 'episode', v_episode.id, v_episode.series_id;
        RETURN;
      END IF;

      -- Check series unlock (if series is completed)
      IF v_series.completed AND EXISTS (SELECT 1 FROM user_unlocks WHERE user_id = p_user_id AND series_id = v_episode.series_id) THEN
        RETURN QUERY SELECT TRUE, 'series', v_episode.id, v_episode.series_id;
        RETURN;
      END IF;

      RETURN QUERY SELECT FALSE, 'locked', v_episode.id, v_episode.series_id;
      RETURN;
    END IF;
  END IF;

  -- Standalone premium video
  IF EXISTS (SELECT 1 FROM user_unlocks WHERE user_id = p_user_id AND video_id = p_video_id) THEN
    RETURN QUERY SELECT TRUE, 'episode', NULL, NULL;
    RETURN;
  END IF;

  RETURN QUERY SELECT FALSE, 'locked', NULL, NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_user_video_access(UUID, UUID) TO authenticated;


-- 6) Helper: Calculate bulk unlock price for a series
-- Returns the total price with discount for buying all remaining episodes
CREATE OR REPLACE FUNCTION calculate_series_bulk_price(p_user_id UUID, p_series_id UUID)
RETURNS TABLE(
  total_episodes INT,
  unlocked_episodes INT,
  remaining_episodes INT,
  total_price INT,
  bulk_price INT,
  discount_percent INT
) AS $$
BEGIN
  RETURN QUERY
  WITH episode_stats AS (
    SELECT 
      COUNT(*) as total_episodes,
      COALESCE(SUM(unlock_price), 0) as total_price,
      COUNT(*) FILTER (WHERE e.id IN (
        SELECT episode_id FROM user_unlocks WHERE user_id = p_user_id AND series_id = p_series_id
      )) as unlocked_episodes
    FROM episodes e
    WHERE e.series_id = p_series_id
  )
  SELECT 
    total_episodes,
    unlocked_episodes,
    (total_episodes - unlocked_episodes) as remaining_episodes,
    total_price,
    CASE 
      WHEN (total_episodes - unlocked_episodes) > 0 
      THEN GREATEST(total_price * 70 / 100, 100) -- 30% discount, minimum 100 points
      ELSE 0
    END as bulk_price,
    30 as discount_percent
  FROM episode_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION calculate_series_bulk_price(UUID, UUID) TO authenticated;