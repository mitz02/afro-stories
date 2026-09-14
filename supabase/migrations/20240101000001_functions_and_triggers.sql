-- ============================================================================
-- Aafstories — Additional Functions & Triggers
-- Advanced functions, materialized views, and scheduled jobs
-- ============================================================================

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

-- Top creators by views (refreshed daily)
CREATE MATERIALIZED VIEW mv_top_creators AS
SELECT
  cp.id,
  cp.display_name,
  cp.avatar,
  cp.avatar_gradient,
  cp.country,
  cp.followers_count,
  cp.total_views,
  cp.total_videos,
  cp.verified,
  ROW_NUMBER() OVER (ORDER BY cp.total_views DESC) AS rank
FROM creator_profiles cp
WHERE cp.status = 'approved'
ORDER BY cp.total_views DESC
LIMIT 100;

CREATE UNIQUE INDEX idx_mv_top_creators_id ON mv_top_creators(id);

-- Trending videos (last 7 days)
CREATE MATERIALIZED VIEW mv_trending_videos AS
SELECT
  v.id,
  v.slug,
  v.title,
  v.thumbnail,
  v.thumbnail_gradient,
  v.duration,
  v.views,
  v.likes,
  v.shares,
  v.published_at,
  cp.display_name AS creator_name,
  cp.avatar AS creator_avatar,
  cp.avatar_gradient AS creator_avatar_gradient,
  s.title AS series_title,
  s.slug AS series_slug,
  e.season_number,
  e.episode_number,
  (v.views * 1.0 / GREATEST(EXTRACT(EPOCH FROM (NOW() - v.published_at)) / 3600, 1)) AS velocity
FROM videos v
JOIN creator_profiles cp ON cp.id = v.creator_id
LEFT JOIN episodes e ON e.video_id = v.id
LEFT JOIN series s ON s.id = COALESCE(v.series_id, e.series_id)
WHERE v.status = 'published'
  AND v.published_at >= NOW() - INTERVAL '7 days'
  AND v.type IN ('single', 'series')
ORDER BY velocity DESC
LIMIT 50;

CREATE UNIQUE INDEX idx_mv_trending_videos_id ON mv_trending_videos(id);

-- Top series by followers
CREATE MATERIALIZED VIEW mv_top_series AS
SELECT
  s.id,
  s.slug,
  s.title,
  s.cover_image,
  s.cover_gradient,
  s.followers_count,
  s.total_views,
  s.total_likes,
  s.completed,
  s.genre,
  cp.display_name AS creator_name,
  cp.avatar AS creator_avatar,
  c.name AS country_name,
  c.flag AS country_flag
FROM series s
JOIN creator_profiles cp ON cp.id = s.creator_id
JOIN countries c ON c.code = s.country
WHERE s.status = 'published'
ORDER BY s.followers_count DESC
LIMIT 50;

CREATE UNIQUE INDEX idx_mv_top_series_id ON mv_top_series(id);

-- ============================================================================
-- REFRESH FUNCTION FOR MATERIALIZED VIEWS
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_analytics_mvs()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_creators;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_trending_videos;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_series;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEARCH FUNCTIONS
-- ============================================================================

-- Full-text search across videos, series, creators
CREATE OR REPLACE FUNCTION search_content(
  p_query TEXT,
  p_type TEXT DEFAULT 'all', -- 'all', 'video', 'series', 'creator'
  p_country country_code DEFAULT NULL,
  p_genre TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  description TEXT,
  thumbnail TEXT,
  creator_name TEXT,
  creator_avatar TEXT,
  creator_avatar_gradient TEXT,
  country country_code,
  genre TEXT[],
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT
      'video' AS entity_type,
      v.id AS entity_id,
      v.title,
      v.description,
      v.thumbnail,
      cp.display_name AS creator_name,
      cp.avatar AS creator_avatar,
      cp.avatar_gradient AS creator_avatar_gradient,
      v.country,
      v.genre,
      ts_rank_cd(
        to_tsvector('english', v.title || ' ' || COALESCE(v.description, '') || ' ' || COALESCE(cp.display_name, '')),
        plainto_tsquery('english', p_query)
      ) AS rank
    FROM videos v
    JOIN creator_profiles cp ON cp.id = v.creator_id
    WHERE v.status = 'published'
      AND (p_country IS NULL OR v.country = p_country)
      AND (p_genre IS NULL OR p_genre = ANY(v.genre))
      AND plainto_tsquery('english', p_query) @@ to_tsvector('english', v.title || ' ' || COALESCE(v.description, '') || ' ' || COALESCE(cp.display_name, ''))

    UNION ALL

    SELECT
      'series' AS entity_type,
      s.id AS entity_id,
      s.title,
      s.description,
      s.cover_image AS thumbnail,
      cp.display_name AS creator_name,
      cp.avatar AS creator_avatar,
      cp.avatar_gradient AS creator_avatar_gradient,
      s.country,
      s.genre,
      ts_rank_cd(
        to_tsvector('english', s.title || ' ' || COALESCE(s.description, '') || ' ' || COALESCE(cp.display_name, '')),
        plainto_tsquery('english', p_query)
      ) AS rank
    FROM series s
    JOIN creator_profiles cp ON cp.id = s.creator_id
    WHERE s.status = 'published'
      AND (p_country IS NULL OR s.country = p_country)
      AND (p_genre IS NULL OR p_genre = ANY(s.genre))
      AND plainto_tsquery('english', p_query) @@ to_tsvector('english', s.title || ' ' || COALESCE(s.description, '') || ' ' || COALESCE(cp.display_name, ''))

    UNION ALL

    SELECT
      'creator' AS entity_type,
      cp.id AS entity_id,
      cp.display_name AS title,
      cp.bio AS description,
      cp.avatar AS thumbnail,
      cp.display_name AS creator_name,
      cp.avatar AS creator_avatar,
      cp.avatar_gradient AS creator_avatar_gradient,
      cp.country,
      cp.categories AS genre,
      ts_rank_cd(
        to_tsvector('english', cp.display_name || ' ' || COALESCE(cp.bio, '') || ' ' || COALESCE(array_to_string(cp.categories, ' '), '')),
        plainto_tsquery('english', p_query)
      ) AS rank
    FROM creator_profiles cp
    WHERE cp.status = 'approved'
      AND (p_country IS NULL OR cp.country = p_country)
      AND (p_genre IS NULL OR p_genre = ANY(cp.categories))
      AND plainto_tsquery('english', p_query) @@ to_tsvector('english', cp.display_name || ' ' || COALESCE(cp.bio, '') || ' ' || COALESCE(array_to_string(cp.categories, ' '), ''))
  )
  SELECT * FROM ranked
  WHERE (p_type = 'all' OR ranked.entity_type = p_type)
  ORDER BY ranked.rank DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RECOMMENDATION FUNCTIONS
-- ============================================================================

-- Get recommended videos for user based on watch history
CREATE OR REPLACE FUNCTION get_recommended_videos(
  p_user_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE(
  video_id UUID,
  title TEXT,
  thumbnail TEXT,
  thumbnail_gradient TEXT,
  duration INT,
  creator_name TEXT,
  creator_avatar TEXT,
  score REAL
) AS $$
BEGIN
  RETURN QUERY
  WITH user_genres AS (
    SELECT UNNEST(v.genre) AS genre, COUNT(*) AS cnt
    FROM watch_history wh
    JOIN videos v ON v.id = wh.video_id
    WHERE wh.user_id = p_user_id
      AND wh.completed = TRUE
    GROUP BY genre
    ORDER BY cnt DESC
    LIMIT 5
  ),
  user_creators AS (
    SELECT v.creator_id, COUNT(*) AS cnt
    FROM watch_history wh
    JOIN videos v ON v.id = wh.video_id
    WHERE wh.user_id = p_user_id
      AND wh.completed = TRUE
    GROUP BY v.creator_id
    ORDER BY cnt DESC
    LIMIT 5
  ),
  user_countries AS (
    SELECT v.country, COUNT(*) AS cnt
    FROM watch_history wh
    JOIN videos v ON v.id = wh.video_id
    WHERE wh.user_id = p_user_id
      AND wh.completed = TRUE
    GROUP BY v.country
    ORDER BY cnt DESC
    LIMIT 3
  ),
  watched_videos AS (
    SELECT video_id FROM watch_history WHERE user_id = p_user_id
  ),
  scored AS (
    SELECT
      v.id AS video_id,
      v.title,
      v.thumbnail,
      v.thumbnail_gradient,
      v.duration,
      cp.display_name AS creator_name,
      cp.avatar AS creator_avatar,
      (
        COALESCE((SELECT 1 FROM user_genres ug WHERE ug.genre = ANY(v.genre)), 0) * 3.0 +
        COALESCE((SELECT 1 FROM user_creators uc WHERE uc.creator_id = v.creator_id), 0) * 2.0 +
        COALESCE((SELECT 1 FROM user_countries uco WHERE uco.country = v.country), 0) * 1.5 +
        (v.views::REAL / GREATEST(EXTRACT(EPOCH FROM (NOW() - v.published_at)) / 86400, 1)) * 0.1
      ) AS score
    FROM videos v
    JOIN creator_profiles cp ON cp.id = v.creator_id
    WHERE v.status = 'published'
      AND v.id NOT IN (SELECT video_id FROM watched_videos)
      AND v.type IN ('single', 'short')
  )
  SELECT * FROM scored
  ORDER BY scored.score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- EARNINGS CALCULATION
-- ============================================================================

-- Calculate creator earnings summary
CREATE OR REPLACE FUNCTION calculate_creator_earnings_summary(p_creator_id UUID)
RETURNS TABLE(
  available_balance BIGINT,
  pending_balance BIGINT,
  total_earnings BIGINT,
  withdrawable_balance BIGINT,
  total_points_earned BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN w.status IN ('completed', 'processing') THEN 0 ELSE ce.net_earnings END), 0) AS available_balance,
    COALESCE(SUM(CASE WHEN w.status IN ('pending', 'processing') THEN w.amount ELSE 0 END), 0) AS pending_balance,
    COALESCE(SUM(ce.net_earnings), 0) AS total_earnings,
    COALESCE(SUM(CASE WHEN w.status = 'completed' THEN 0 ELSE ce.net_earnings END), 0) -
    COALESCE(SUM(CASE WHEN w.status IN ('pending', 'processing') THEN w.amount ELSE 0 END), 0) AS withdrawable_balance,
    COALESCE(SUM(ce.amount), 0) AS total_points_earned
  FROM creator_earnings ce
  LEFT JOIN withdrawals w ON w.creator_id = ce.creator_id
  WHERE ce.creator_id = p_creator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Clean up old notifications (older than 90 days, read)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM notifications
  WHERE read = TRUE
    AND created_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired processing jobs
CREATE OR REPLACE FUNCTION cleanup_stale_processing_jobs()
RETURNS INT AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE video_processing_jobs
  SET status = 'failed', error_message = 'Job timed out'
  WHERE status = 'processing'
    AND started_at < NOW() - INTERVAL '2 hours';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SCHEDULED JOBS (using pg_cron if available)
-- ============================================================================

-- These would be set up via pg_cron extension in Supabase Dashboard
-- SELECT cron.schedule('refresh-analytics-mvs', '0 3 * * *', 'SELECT refresh_analytics_mvs();');
-- SELECT cron.schedule('cleanup-notifications', '0 4 * * *', 'SELECT cleanup_old_notifications();');
-- SELECT cron.schedule('cleanup-stale-jobs', '*/15 * * * *', 'SELECT cleanup_stale_processing_jobs();');
-- SELECT cron.schedule('update-country-counts', '0 5 * * *', 'SELECT update_country_content_counts();');

-- ============================================================================
-- COUNTRY COUNTS UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_country_content_counts()
RETURNS VOID AS $$
BEGIN
  UPDATE countries c SET
    content_count = (
      SELECT COUNT(*) FROM videos v WHERE v.country = c.code AND v.status = 'published'
    ) + (
      SELECT COUNT(*) FROM series s WHERE s.country = c.code AND s.status = 'published'
    ),
    creator_count = (
      SELECT COUNT(*) FROM creator_profiles cp WHERE cp.country = c.code AND cp.status = 'approved'
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIDEO PROCESSING HELPERS
-- ============================================================================

-- Mark video processing as started
CREATE OR REPLACE FUNCTION start_video_processing(p_video_id UUID, p_input_url TEXT)
RETURNS UUID AS $$
DECLARE
  v_job_id UUID;
BEGIN
  INSERT INTO video_processing_jobs (video_id, status, input_url, started_at)
  VALUES (p_video_id, 'processing', p_input_url, NOW())
  RETURNING id INTO v_job_id;

  UPDATE videos SET processing_status = 'processing' WHERE id = p_video_id;
  RETURN v_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark video processing as completed
CREATE OR REPLACE FUNCTION complete_video_processing(
  p_job_id UUID,
  p_hls_url TEXT,
  p_dash_url TEXT,
  p_preview_url TEXT,
  p_thumbnail_urls TEXT[]
)
RETURNS VOID AS $$
DECLARE
  v_video_id UUID;
BEGIN
  SELECT video_id INTO v_video_id FROM video_processing_jobs WHERE id = p_job_id;

  UPDATE video_processing_jobs
  SET status = 'completed',
      output_urls = jsonb_build_object(
        'hls', p_hls_url,
        'dash', p_dash_url,
        'preview', p_preview_url,
        'thumbnails', p_thumbnail_urls
      ),
      completed_at = NOW(),
      progress = 100
  WHERE id = p_job_id;

  UPDATE videos
  SET processing_status = 'completed',
      hls_url = p_hls_url,
      dash_url = p_dash_url,
      preview_url = p_preview_url,
      thumbnail_urls = p_thumbnail_urls,
      status = 'published',
      published_at = COALESCE(published_at, NOW())
  WHERE id = v_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark video processing as failed
CREATE OR REPLACE FUNCTION fail_video_processing(p_job_id UUID, p_error TEXT)
RETURNS VOID AS $$
DECLARE
  v_video_id UUID;
BEGIN
  SELECT video_id INTO v_video_id FROM video_processing_jobs WHERE id = p_job_id;

  UPDATE video_processing_jobs
  SET status = 'failed',
      error_message = p_error,
      completed_at = NOW()
  WHERE id = p_job_id;

  UPDATE videos
  SET processing_status = 'failed',
      processing_error = p_error
  WHERE id = v_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION search_content(TEXT, TEXT, country_code, TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recommended_videos(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_creator_earnings_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_analytics_mvs() TO authenticated;
GRANT EXECUTE ON FUNCTION start_video_processing(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_video_processing(UUID, TEXT, TEXT, TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION fail_video_processing(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_country_content_counts() TO authenticated;

-- Materialized view access
GRANT SELECT ON mv_top_creators TO anon, authenticated;
GRANT SELECT ON mv_trending_videos TO anon, authenticated;
GRANT SELECT ON mv_top_series TO anon, authenticated;