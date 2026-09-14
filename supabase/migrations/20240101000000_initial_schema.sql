-- ============================================================================
-- Aafstories — Database Migration
-- PostgreSQL / Supabase schema for African Storytelling Platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('viewer', 'creator', 'admin');
CREATE TYPE creator_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');
CREATE TYPE video_type AS ENUM ('single', 'series', 'short');
CREATE TYPE content_origin AS ENUM ('ai_generated', 'ai_assisted', 'human');
CREATE TYPE visibility_status AS ENUM ('draft', 'processing', 'pending_review', 'published', 'rejected', 'suspended');
CREATE TYPE monetization_type AS ENUM ('free', 'premium');
CREATE TYPE age_rating AS ENUM ('G', 'PG', '12+', '16+', '18+');
CREATE TYPE country_code AS ENUM (
  'NG', 'GH', 'KE', 'ZA', 'ET', 'TZ', 'UG', 'RW', 'SN', 'CM',
  'ZW', 'ZM', 'EG', 'MA', 'CI', 'BJ', 'SL', 'MZ', 'AO', 'MW'
);
CREATE TYPE notification_type AS ENUM (
  'new_episode', 'new_video', 'series_release', 'follow',
  'like', 'comment', 'unlock', 'earnings', 'withdrawal', 'system'
);
CREATE TYPE report_category AS ENUM (
  'copyright', 'violence', 'hate', 'scam', 'sexual', 'misleading', 'other'
);
CREATE TYPE report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
CREATE TYPE transaction_type AS ENUM ('purchase', 'unlock', 'refund', 'bonus');
CREATE TYPE transaction_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ============================================================================
-- COUNTRIES (Reference Data)
-- ============================================================================

CREATE TABLE countries (
  code country_code PRIMARY KEY,
  name TEXT NOT NULL,
  flag TEXT NOT NULL,
  mux TEXT,
  gradient TEXT NOT NULL,
  content_count INT DEFAULT 0,
  creator_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USERS
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  avatar_gradient TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  country country_code NOT NULL DEFAULT 'NG',
  verified BOOLEAN DEFAULT FALSE,
  password_hash TEXT, -- bcrypt/argon2 hash
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_country ON users(country);

-- ============================================================================
-- CREATOR PROFILES
-- ============================================================================

CREATE TABLE creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT,
  avatar_gradient TEXT NOT NULL,
  cover_image TEXT,
  bio TEXT DEFAULT '',
  country country_code NOT NULL,
  city TEXT,
  verified BOOLEAN DEFAULT FALSE,
  status creator_status NOT NULL DEFAULT 'pending',
  followers_count INT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_videos INT DEFAULT 0,
  total_series INT DEFAULT 0,
  joined_date DATE DEFAULT CURRENT_DATE,
  categories TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  stripe_account_id TEXT, -- for payouts
  payout_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX idx_creator_profiles_username ON creator_profiles(username);
CREATE INDEX idx_creator_profiles_status ON creator_profiles(status);
CREATE INDEX idx_creator_profiles_country ON creator_profiles(country);
CREATE INDEX idx_creator_profiles_featured ON creator_profiles(featured) WHERE featured = TRUE;

-- ============================================================================
-- SERIES
-- ============================================================================

CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image TEXT,
  cover_gradient TEXT,
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  country country_code NOT NULL,
  genre TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'English',
  age_rating age_rating NOT NULL DEFAULT 'PG',
  status visibility_status NOT NULL DEFAULT 'draft',
  total_views BIGINT DEFAULT 0,
  total_likes BIGINT DEFAULT 0,
  followers_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  average_episode_duration INT DEFAULT 0, -- seconds
  monetization monetization_type NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_series_slug ON series(slug);
CREATE INDEX idx_series_creator_id ON series(creator_id);
CREATE INDEX idx_series_status ON series(status);
CREATE INDEX idx_series_country ON series(country);
CREATE INDEX idx_series_featured ON series(featured) WHERE featured = TRUE;
CREATE INDEX idx_series_genre ON series USING GIN(genre);

-- ============================================================================
-- SEASONS
-- ============================================================================

CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  season_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  episode_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, season_number)
);

CREATE INDEX idx_seasons_series_id ON seasons(series_id);

-- ============================================================================
-- VIDEOS
-- ============================================================================

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail TEXT,
  thumbnail_gradient TEXT,
  video_url TEXT,
  duration INT NOT NULL DEFAULT 0, -- seconds
  type video_type NOT NULL DEFAULT 'single',
  origin content_origin NOT NULL DEFAULT 'human',
  status visibility_status NOT NULL DEFAULT 'draft',
  monetization monetization_type NOT NULL DEFAULT 'free',
  unlock_price INT DEFAULT 0, -- points
  age_rating age_rating NOT NULL DEFAULT 'PG',
  genre TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'English',
  country country_code NOT NULL,
  tags TEXT[] DEFAULT '{}',
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT FALSE,
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE SET NULL,
  episode_id UUID, -- will FK to episodes after episodes table
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  processing_error TEXT,
  hls_url TEXT,
  dash_url TEXT,
  preview_url TEXT,
  thumbnail_urls TEXT[] DEFAULT '{}', -- multiple sizes
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_videos_slug ON videos(slug);
CREATE INDEX idx_videos_creator_id ON videos(creator_id);
CREATE INDEX idx_videos_series_id ON videos(series_id);
CREATE INDEX idx_videos_episode_id ON videos(episode_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_type ON videos(type);
CREATE INDEX idx_videos_country ON videos(country);
CREATE INDEX idx_videos_featured ON videos(featured) WHERE featured = TRUE;
CREATE INDEX idx_videos_genre ON videos USING GIN(genre);
CREATE INDEX idx_videos_tags ON videos USING GIN(tags);
CREATE INDEX idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX idx_videos_monetization ON videos(monetization);

-- ============================================================================
-- EPISODES
-- ============================================================================

CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  season_number INT NOT NULL,
  episode_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail TEXT,
  thumbnail_gradient TEXT,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  duration INT NOT NULL DEFAULT 0, -- seconds
  monetization monetization_type NOT NULL DEFAULT 'free',
  unlock_price INT DEFAULT 0, -- points
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments_count INT DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, season_number, episode_number)
);

CREATE INDEX idx_episodes_series_id ON episodes(series_id);
CREATE INDEX idx_episodes_season_episode ON episodes(series_id, season_number, episode_number);
CREATE INDEX idx_episodes_video_id ON episodes(video_id);
CREATE INDEX idx_episodes_published_at ON episodes(published_at DESC);

-- Add FK from videos to episodes (circular reference resolved)
ALTER TABLE videos ADD CONSTRAINT fk_videos_episode_id
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE SET NULL;

-- ============================================================================
-- SOCIAL: LIKES
-- ============================================================================

CREATE TABLE video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_video_likes_user_id ON video_likes(user_id);
CREATE INDEX idx_video_likes_video_id ON video_likes(video_id);

-- ============================================================================
-- SOCIAL: FOLLOWS
-- ============================================================================

CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id UUID NOT NULL, -- references users(id) or creator_profiles(id)
  followee_type TEXT NOT NULL CHECK (followee_type IN ('creator', 'series')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, followee_id, followee_type)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_followee_id ON follows(followee_id);
CREATE INDEX idx_follows_followee_type ON follows(followee_type);

-- ============================================================================
-- SOCIAL: COMMENTS
-- ============================================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_display_name TEXT NOT NULL,
  user_avatar TEXT,
  text TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  pinned BOOLEAN DEFAULT FALSE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_comment_target CHECK (
    (video_id IS NOT NULL AND episode_id IS NULL) OR
    (video_id IS NULL AND episode_id IS NOT NULL)
  )
);

CREATE INDEX idx_comments_video_id ON comments(video_id);
CREATE INDEX idx_comments_episode_id ON comments(episode_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Comment likes
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);

-- ============================================================================
-- WATCH HISTORY & WATCHLIST
-- ============================================================================

CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed BOOLEAN DEFAULT FALSE,
  watch_time INT DEFAULT 0, -- seconds watched
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_video_id ON watch_history(video_id);
CREATE INDEX idx_watch_history_episode_id ON watch_history(episode_id);
CREATE INDEX idx_watch_history_watched_at ON watch_history(watched_at DESC);

CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);

-- ============================================================================
-- WALLET & ECONOMY
-- ============================================================================

CREATE TABLE point_packages (
  id TEXT PRIMARY KEY, -- e.g., 'pp_100', 'pp_500'
  points INT NOT NULL,
  price INT NOT NULL, -- in NGN kobo (smallest unit)
  popular BOOLEAN DEFAULT FALSE,
  bonus INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount INT NOT NULL, -- positive for credit, negative for debit
  description TEXT NOT NULL,
  reference TEXT, -- payment gateway reference
  status transaction_status NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_type ON point_transactions(type);
CREATE INDEX idx_point_transactions_status ON point_transactions(status);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at DESC);

-- Wallet view (materialized for performance)
CREATE TABLE point_wallets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0,
  lifetime_points BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATOR EARNINGS
-- ============================================================================

CREATE TABLE creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
  amount INT NOT NULL, -- in points
  unlocked_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  platform_commission DECIMAL(5,2) NOT NULL DEFAULT 30.00, -- percentage
  net_earnings INT NOT NULL, -- in NGN kobo
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_creator_earnings_creator_id ON creator_earnings(creator_id);
CREATE INDEX idx_creator_earnings_video_id ON creator_earnings(video_id);
CREATE INDEX idx_creator_earnings_episode_id ON creator_earnings(episode_id);
CREATE INDEX idx_creator_earnings_created_at ON creator_earnings(created_at DESC);

-- ============================================================================
-- WITHDRAWALS
-- ============================================================================

CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL, -- in NGN kobo
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  bank_code TEXT, -- for Nigerian banks (NIBSS code)
  status withdrawal_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_withdrawals_creator_id ON withdrawals(creator_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  image TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- REPORTS & MODERATION
-- ============================================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category report_category NOT NULL,
  description TEXT NOT NULL,
  status report_status NOT NULL DEFAULT 'open',
  moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_reports_video_id ON reports(video_id);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- ============================================================================
-- ANALYTICS (Pre-aggregated for performance)
-- ============================================================================

CREATE TABLE creator_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views BIGINT DEFAULT 0,
  watch_time_seconds BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  new_followers INT DEFAULT 0,
  revenue_points BIGINT DEFAULT 0,
  revenue_ngn BIGINT DEFAULT 0, -- kobo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, date)
);

CREATE INDEX idx_creator_analytics_creator_date ON creator_analytics_daily(creator_id, date DESC);

CREATE TABLE video_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views BIGINT DEFAULT 0,
  watch_time_seconds BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  completions INT DEFAULT 0,
  revenue_points BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, date)
);

CREATE INDEX idx_video_analytics_video_date ON video_analytics_daily(video_id, date DESC);

-- ============================================================================
-- VIDEO PROCESSING QUEUE
-- ============================================================================

CREATE TABLE video_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued', -- queued, processing, completed, failed
  priority INT DEFAULT 0,
  input_url TEXT NOT NULL,
  output_urls JSONB DEFAULT '{}',
  error_message TEXT,
  progress INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_processing_jobs_video_id ON video_processing_jobs(video_id);
CREATE INDEX idx_video_processing_jobs_status ON video_processing_jobs(status);
CREATE INDEX idx_video_processing_jobs_priority ON video_processing_jobs(priority DESC, created_at);

-- ============================================================================
-- SEARCH (for full-text search)
-- ============================================================================

CREATE TABLE search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('video', 'series', 'creator')),
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  genre TEXT[],
  creator_name TEXT,
  country country_code,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

CREATE INDEX idx_search_index_fulltext ON search_index USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(creator_name, ''))
);
CREATE INDEX idx_search_index_entity ON search_index(entity_type, entity_id);
CREATE INDEX idx_search_index_country ON search_index(country);
CREATE INDEX idx_search_index_genre ON search_index USING GIN(genre);

-- ============================================================================
-- RLS (Row Level Security) POLICIES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
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

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creator_profiles_updated_at BEFORE UPDATE ON creator_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON series FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_watch_history_updated_at BEFORE UPDATE ON watch_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_point_packages_updated_at BEFORE UPDATE ON point_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_point_wallets_updated_at BEFORE UPDATE ON point_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGERS FOR COUNTERS (Denormalized counts)
-- ============================================================================

-- Video likes counter
CREATE OR REPLACE FUNCTION update_video_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE videos SET likes = likes + 1 WHERE id = NEW.video_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE videos SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.video_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_video_likes_count
  AFTER INSERT OR DELETE ON video_likes
  FOR EACH ROW EXECUTE FUNCTION update_video_likes_count();

-- Episode likes counter (via video_likes on episode's video)
-- Handled by application logic since episodes reference videos

-- Comment likes counter
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_comment_likes_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Followers counter
CREATE OR REPLACE FUNCTION update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.followee_type = 'creator' THEN
      UPDATE creator_profiles SET followers_count = followers_count + 1 WHERE id = NEW.followee_id;
    ELSIF NEW.followee_type = 'series' THEN
      UPDATE series SET followers_count = followers_count + 1 WHERE id = NEW.followee_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.followee_type = 'creator' THEN
      UPDATE creator_profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.followee_id;
    ELSIF OLD.followee_type = 'series' THEN
      UPDATE series SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.followee_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_followers_count
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_followers_count();

-- Comments counter on episodes
CREATE OR REPLACE FUNCTION update_episode_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE episodes SET comments_count = comments_count + 1 WHERE id = NEW.episode_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE episodes SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.episode_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_episode_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_episode_comments_count();

-- Video views counter (incremented via API)
-- Series total views counter
CREATE OR REPLACE FUNCTION update_series_total_views()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE series SET total_views = total_views + NEW.views WHERE id = NEW.series_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.views != OLD.views THEN
    UPDATE series SET total_views = total_views + (NEW.views - OLD.views) WHERE id = NEW.series_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_series_total_views
  AFTER INSERT OR UPDATE ON episodes
  FOR EACH ROW EXECUTE FUNCTION update_series_total_views();

-- ============================================================================
-- SEED DATA: Countries
-- ============================================================================

INSERT INTO countries (code, name, flag, gradient, content_count, creator_count) VALUES
  ('NG', 'Nigeria', '🇳🇬', 'from-emerald-600 to-green-800', 2480, 640),
  ('GH', 'Ghana', '🇬🇭', 'from-amber-500 to-yellow-700', 1320, 380),
  ('KE', 'Kenya', '🇰🇪', 'from-red-600 to-slate-900', 980, 310),
  ('ZA', 'South Africa', '🇿🇦', 'from-emerald-500 to-yellow-600', 1450, 290),
  ('ET', 'Ethiopia', '🇪🇹', 'from-emerald-600 to-red-700', 420, 120),
  ('TZ', 'Tanzania', '🇹🇿', 'from-emerald-500 to-teal-800', 340, 95),
  ('UG', 'Uganda', '🇺🇬', 'from-yellow-500 to-red-800', 310, 85),
  ('RW', 'Rwanda', '🇷🇼', 'from-sky-500 to-yellow-600', 180, 45),
  ('SN', 'Senegal', '🇸🇳', 'from-emerald-600 to-red-600', 260, 70),
  ('CM', 'Cameroon', '🇨🇲', 'from-red-600 to-yellow-600', 290, 80),
  ('ZW', 'Zimbabwe', '🇿🇼', 'from-red-600 to-emerald-600', 210, 60),
  ('ZM', 'Zambia', '🇿🇲', 'from-orange-600 to-emerald-700', 170, 45),
  ('EG', 'Egypt', '🇪🇬', 'from-red-600 to-amber-700', 520, 150),
  ('MA', 'Morocco', '🇲🇦', 'from-red-600 to-amber-800', 380, 110),
  ('CI', 'Côte d''Ivoire', '🇨🇮', 'from-orange-500 to-emerald-600', 240, 65),
  ('BJ', 'Benin', '🇧🇯', 'from-emerald-600 to-yellow-600', 150, 40),
  ('SL', 'Sierra Leone', '🇸🇱', 'from-emerald-600 to-sky-600', 90, 25),
  ('MZ', 'Mozambique', '🇲🇿', 'from-teal-700 to-yellow-600', 130, 30),
  ('AO', 'Angola', '🇦🇴', 'from-red-700 to-yellow-600', 140, 35),
  ('MW', 'Malawi', '🇲🇼', 'from-rose-600 to-emerald-600', 80, 22)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  flag = EXCLUDED.flag,
  gradient = EXCLUDED.gradient;

-- ============================================================================
-- SEED DATA: Point Packages
-- ============================================================================

INSERT INTO point_packages (id, points, price, popular, bonus, sort_order) VALUES
  ('pp_100', 100, 100000, FALSE, 0, 1),       -- ₦1,000
  ('pp_500', 500, 450000, TRUE, 50, 2),        -- ₦4,500 + 50 bonus
  ('pp_1000', 1000, 800000, FALSE, 150, 3),    -- ₦8,000 + 150 bonus
  ('pp_2500', 2500, 1750000, FALSE, 500, 4)    -- ₦17,500 + 500 bonus
ON CONFLICT (id) DO UPDATE SET
  points = EXCLUDED.points,
  price = EXCLUDED.price,
  popular = EXCLUDED.popular,
  bonus = EXCLUDED.bonus,
  sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's wallet balance
CREATE OR REPLACE FUNCTION get_user_wallet_balance(p_user_id UUID)
RETURNS TABLE(balance INT, lifetime_points BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(pw.balance, 0), COALESCE(pw.lifetime_points, 0)
  FROM point_wallets pw
  WHERE pw.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has enough points
CREATE OR REPLACE FUNCTION user_has_enough_points(p_user_id UUID, p_amount INT)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance INT;
BEGIN
  SELECT COALESCE(balance, 0) INTO v_balance FROM point_wallets WHERE user_id = p_user_id;
  RETURN v_balance >= p_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deduct points from wallet
CREATE OR REPLACE FUNCTION deduct_points(p_user_id UUID, p_amount INT, p_description TEXT, p_reference TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance INT;
BEGIN
  SELECT COALESCE(balance, 0) INTO v_balance FROM point_wallets WHERE user_id = p_user_id;
  IF v_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  INSERT INTO point_transactions (user_id, type, amount, description, reference, status, completed_at)
  VALUES (p_user_id, 'unlock', -p_amount, p_description, p_reference, 'success', NOW());

  UPDATE point_wallets SET balance = balance - p_amount WHERE user_id = p_user_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add points to wallet
CREATE OR REPLACE FUNCTION add_points(p_user_id UUID, p_amount INT, p_type transaction_type, p_description TEXT, p_reference TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO point_transactions (user_id, type, amount, description, reference, status, completed_at)
  VALUES (p_user_id, p_type, p_amount, p_description, p_reference, 'success', NOW());

  INSERT INTO point_wallets (user_id, balance, lifetime_points)
  VALUES (p_user_id, p_amount, CASE WHEN p_type = 'purchase' THEN p_amount ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE SET
    balance = point_wallets.balance + p_amount,
    lifetime_points = point_wallets.lifetime_points + CASE WHEN p_type = 'purchase' THEN p_amount ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unlock episode (deduct points + record unlock)
CREATE OR REPLACE FUNCTION unlock_episode(p_user_id UUID, p_episode_id UUID, p_video_id UUID, p_price INT)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN;
BEGIN
  -- Check if already unlocked
  IF EXISTS (SELECT 1 FROM watch_history WHERE user_id = p_user_id AND episode_id = p_episode_id AND completed = TRUE) THEN
    RETURN TRUE;
  END IF;

  -- Deduct points
  v_success := deduct_points(p_user_id, p_price, 'Unlocked episode', p_episode_id::TEXT);
  IF NOT v_success THEN
    RETURN FALSE;
  END IF;

  -- Record in watch_history as completed
  INSERT INTO watch_history (user_id, video_id, episode_id, watched_at, progress, completed, watch_time)
  VALUES (p_user_id, p_video_id, p_episode_id, NOW(), 100, TRUE, 0)
  ON CONFLICT (user_id, video_id) DO UPDATE SET
    progress = 100,
    completed = TRUE,
    watched_at = NOW();

  -- Update episode views
  UPDATE episodes SET views = views + 1 WHERE id = p_episode_id;

  -- Update video views
  UPDATE videos SET views = views + 1 WHERE id = p_video_id;

  -- Creator earnings
  INSERT INTO creator_earnings (creator_id, video_id, episode_id, amount, unlocked_by, platform_commission, net_earnings)
  SELECT cp.id, p_video_id, p_episode_id, p_price, p_user_id, 30.00, (p_price * 70 / 100) * 10 -- convert to NGN kobo (example rate)
  FROM creator_profiles cp
  JOIN videos v ON v.creator_id = cp.id
  WHERE v.id = p_video_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Creator dashboard summary
CREATE VIEW creator_dashboard_summary AS
SELECT
  cp.id AS creator_id,
  cp.display_name,
  cp.avatar,
  cp.followers_count,
  cp.total_views,
  cp.total_videos,
  cp.total_series,
  COALESCE(SUM(ce.net_earnings), 0) AS total_earnings_ngn,
  COALESCE(SUM(ce.amount), 0) AS total_points_earned,
  COALESCE(SUM(CASE WHEN w.status = 'pending' THEN w.amount ELSE 0 END), 0) AS pending_withdrawals,
  COALESCE(SUM(CASE WHEN w.status = 'completed' THEN w.amount ELSE 0 END), 0) AS completed_withdrawals
FROM creator_profiles cp
LEFT JOIN creator_earnings ce ON ce.creator_id = cp.id
LEFT JOIN withdrawals w ON w.creator_id = cp.id
GROUP BY cp.id;

-- Video with series info
CREATE VIEW video_with_series AS
SELECT
  v.*,
  s.title AS series_title,
  s.slug AS series_slug,
  e.season_number,
  e.episode_number,
  e.title AS episode_title,
  cp.display_name AS creator_name,
  cp.avatar AS creator_avatar,
  cp.avatar_gradient AS creator_avatar_gradient,
  cp.verified AS creator_verified,
  c.name AS country_name,
  c.flag AS country_flag
FROM videos v
LEFT JOIN episodes e ON e.video_id = v.id
LEFT JOIN series s ON s.id = COALESCE(v.series_id, e.series_id)
LEFT JOIN creator_profiles cp ON cp.id = v.creator_id
LEFT JOIN countries c ON c.code = v.country;

-- Series with episode count
CREATE VIEW series_with_stats AS
SELECT
  s.*,
  cp.display_name AS creator_name,
  cp.avatar AS creator_avatar,
  cp.avatar_gradient AS creator_avatar_gradient,
  cp.verified AS creator_verified,
  c.name AS country_name,
  c.flag AS country_flag,
  COUNT(DISTINCT sea.id) AS season_count,
  COUNT(DISTINCT e.id) AS episode_count
FROM series s
LEFT JOIN creator_profiles cp ON cp.id = s.creator_id
LEFT JOIN countries c ON c.code = s.country
LEFT JOIN seasons sea ON sea.series_id = s.id
LEFT JOIN episodes e ON e.series_id = s.id
GROUP BY s.id, cp.id, c.code;

-- ============================================================================
-- GRANTS (for Supabase anon/authenticated roles)
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON countries TO anon, authenticated;
GRANT SELECT ON point_packages TO anon, authenticated;

-- Authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON creator_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON series TO authenticated;
GRANT SELECT, INSERT, UPDATE ON seasons TO authenticated;
GRANT SELECT, INSERT, UPDATE ON videos TO authenticated;
GRANT SELECT, INSERT, UPDATE ON episodes TO authenticated;
GRANT SELECT, INSERT, DELETE ON video_likes TO authenticated;
GRANT SELECT, INSERT, DELETE ON follows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON comment_likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON watch_history TO authenticated;
GRANT SELECT, INSERT, DELETE ON watchlist TO authenticated;
GRANT SELECT ON point_transactions TO authenticated;
GRANT SELECT, UPDATE ON point_wallets TO authenticated;
GRANT SELECT ON creator_earnings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON withdrawals TO authenticated;
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT ON reports TO authenticated;
GRANT SELECT ON video_processing_jobs TO authenticated;
GRANT SELECT ON search_index TO authenticated;
GRANT SELECT ON creator_dashboard_summary TO authenticated;
GRANT SELECT ON video_with_series TO authenticated;
GRANT SELECT ON series_with_stats TO authenticated;

-- Functions
GRANT EXECUTE ON FUNCTION get_user_wallet_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_enough_points(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_points(UUID, INT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_points(UUID, INT, transaction_type, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION unlock_episode(UUID, UUID, UUID, INT) TO authenticated;

-- ============================================================================
-- COMPLETION
-- ============================================================================

COMMENT ON SCHEMA public IS 'Aafstories - African Storytelling Platform Database Schema';