-- ============================================================================
-- Aafstories — Bunny Stream integration
-- Stores the Bunny Stream video GUID on each Aafstories video row so Bunny
-- webhooks, the direct-upload flow and the HLS host can map a Bunny video
-- back to its Aafstories record.
-- ============================================================================

ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS bunny_video_id TEXT,
  ADD COLUMN IF NOT EXISTS bunny_library_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_videos_bunny_video_id
  ON videos(bunny_video_id) WHERE bunny_video_id IS NOT NULL;

-- Creators can read their own video rows (RLS videos_select_own already covers
-- users who own a creator profile). No additional policy needed here.