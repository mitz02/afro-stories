-- Allow anonymous visitors to read comments + replies on published content.
-- Without this, logged-out viewers see an empty comment section even when
-- comments exist (RLS silently filters them out).

DROP POLICY IF EXISTS "comments_public_read" ON comments;
CREATE POLICY "comments_public_read" ON comments FOR SELECT TO anon USING (
  (video_id IN (SELECT id FROM videos WHERE status = 'published')) OR
  (episode_id IN (SELECT e.id FROM episodes e JOIN series s ON s.id = e.series_id WHERE s.status = 'published'))
);