-- 20240101000008 PERFORMANCE INDEXES
-- ------------------------------------------------------------------
-- Composite + partial indexes tuned to the queries the app actually
-- runs (creator studio, watch page, comments, notifications, wallet).
-- All CREATE INDEX [IF NOT EXISTS] so the file is safe to re-run.

-- Creator studio: dashboard + My Videos sort latest-first per creator
CREATE INDEX IF NOT EXISTS idx_videos_creator_created_at
  ON videos (creator_id, created_at DESC);

-- My Series sorts latest-first per creator
CREATE INDEX IF NOT EXISTS idx_series_creator_created_at
  ON series (creator_id, created_at DESC);

-- Watch page: related/feed "recent published" lookups
CREATE INDEX IF NOT EXISTS idx_videos_status_published_at
  ON videos (status, published_at DESC)
  WHERE status = 'published';

-- Comment feed: top-level comments of a video, newest first (pinned handled separately)
CREATE INDEX IF NOT EXISTS idx_comments_video_feed
  ON comments (video_id, parent_id, created_at DESC);

-- Creator dashboard: comment counts for a set of owned videos
CREATE INDEX IF NOT EXISTS idx_comments_video_id_created_at
  ON comments (video_id, created_at DESC);

-- Episodes list per series (creator studio episodes page)
CREATE INDEX IF NOT EXISTS idx_episodes_series_published_at
  ON episodes (series_id, published_at DESC);

-- Notification panel: a user's inbox, newest first, unread filter
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
  ON notifications (user_id, created_at DESC);

-- Watch history: a user's history, most recent first
CREATE INDEX IF NOT EXISTS idx_watch_history_user_created_at
  ON watch_history (user_id, watched_at DESC);

-- Watchlist: a user's saved list, most recent first
CREATE INDEX IF NOT EXISTS idx_watchlist_user_added_at
  ON watchlist (user_id, added_at DESC);

-- Wallet: a user's point transactions, newest first
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_created_at
  ON point_transactions (user_id, created_at DESC);

-- Earnings panel: a creator's earnings, newest first
CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator_created_at
  ON creator_earnings (creator_id, created_at DESC);

-- Admin creators list sorts by created_at
CREATE INDEX IF NOT EXISTS idx_creator_profiles_created_at
  ON creator_profiles (created_at DESC);

-- Admin reports queue filters by status and sorts newest first
CREATE INDEX IF NOT EXISTS idx_reports_status_created_at
  ON reports (status, created_at DESC)
  WHERE status <> 'resolved' AND status <> 'dismissed';

-- Series admin/moderation list by status
CREATE INDEX IF NOT EXISTS idx_series_status_created_at
  ON series (status, created_at DESC);

-- Videos moderation list by status
CREATE INDEX IF NOT EXISTS idx_videos_status_created_at
  ON videos (status, created_at DESC);

-- Search: trigram indexes for ILIKE '%term%' title/name lookups
CREATE INDEX IF NOT EXISTS idx_videos_title_trgm
  ON videos USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_series_title_trgm
  ON series USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_creator_profiles_name_trgm
  ON creator_profiles USING GIN (display_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_creator_profiles_username_trgm
  ON creator_profiles USING GIN (username gin_trgm_ops);