-- ============================================================================
-- Aafstories — Seed Data Migration
-- Deterministic seed of all demo content derived from the app's mock data
-- (src/lib/data/*). Uses md5-derived UUIDs so IDs are stable across runs.
-- ============================================================================

-- ============================================================================
-- DETERMINISTIC UUID HELPER
-- Maps a stable text id (e.g. 'u_chiefuwa') to a fixed UUID.
-- ============================================================================

CREATE OR REPLACE FUNCTION deterministic_uuid(p_id TEXT)
RETURNS UUID AS $$
DECLARE
  v_md5 TEXT;
BEGIN
  v_md5 := md5(p_id);
  RETURN (
    substr(v_md5, 1, 8) || '-' ||
    substr(v_md5, 9, 4) || '-' ||
    substr(v_md5, 13, 4) || '-' ||
    substr(v_md5, 17, 4) || '-' ||
    substr(v_md5, 21, 12)
  )::UUID;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- SEED: DEMO USERS
-- ============================================================================

INSERT INTO users (id, username, display_name, email, avatar, avatar_gradient, role, country, verified) VALUES
  (deterministic_uuid('u_me'),       'amara',        'Amara Okafor',       'amara@aafstories.com', '/avatars/amara.png',  'from-violet-500 to-fuchsia-600', 'viewer',  'NG', FALSE),
  (deterministic_uuid('u_demo'),     'demo',         'Demo Viewer',        'demo@aafstories.com',  NULL,                  NULL,                              'viewer',  'NG', FALSE),
  (deterministic_uuid('u_test'),     'test_user',    'Test User',          'test@test.com',        NULL,                  NULL,                              'viewer',  'GH', FALSE),
  (deterministic_uuid('u_chiefuwa'), 'chief_uwa',    'Chief Uwa Folktales','chief_uwa@aafstories.com','/avatars/chiefuwa.png','from-amber-500 to-orange-700', 'creator', 'NG', TRUE),
  (deterministic_uuid('u_aida'),     'aida_studio',  'Aïda.Studio',        'aida@aafstories.com',  '/avatars/aida.png',    'from-purple-500 to-indigo-700', 'creator', 'SN', TRUE),
  (deterministic_uuid('u_kwame'),    'kwame_films',  'Kwame Films',        'kwame@aafstories.com', '/avatars/kwame.png',   'from-emerald-500 to-teal-700',  'creator', 'GH', TRUE),
  (deterministic_uuid('u_nyandwi'),  'nyandwi_creates','Nyandwi Creates',  'nyandwi@aafstories.com','/avatars/nyandwi.png','from-sky-500 to-blue-700',      'creator', 'RW', TRUE),
  (deterministic_uuid('u_zanele'),   'zanele_talks', 'Zanele Talks',       'zanele@aafstories.com', '/avatars/zanele.png',  'from-rose-500 to-red-700',      'creator', 'ZA', TRUE),
  (deterministic_uuid('u_malik'),    'malik_animates','Malik Animates',    'malik@aafstories.com',  '/avatars/malik.png',   'from-orange-500 to-amber-700',  'creator', 'KE', FALSE),
  (deterministic_uuid('u_amina'),    'amina_stories','Amina Stories',      'amina@aafstories.com',  '/avatars/amina.png',   'from-pink-500 to-fuchsia-700',  'creator', 'EG', TRUE),
  (deterministic_uuid('u_kofi'),     'kofi_horror',  'Kofi Horror',        'kofi@aafstories.com',   '/avatars/kofi.png',    'from-slate-500 to-black',       'creator', 'GH', TRUE),
  (deterministic_uuid('u_selam'),    'selam_films',  'Selam Films',        'selam@aafstories.com',  '/avatars/selam.png',   'from-amber-500 to-yellow-700',  'creator', 'ET', FALSE),
  (deterministic_uuid('u_tobi'),     'tobi_ai',      'Tobi AI Studios',    'tobi@aafstories.com',   '/avatars/tobi.png',    'from-cyan-500 to-violet-700',   'creator', 'NG', TRUE),
  (deterministic_uuid('u_ibrahim'),  'ibrahim_ma',   'Ibrahim Marrakesh',  'ibrahim@aafstories.com','/avatars/ibrahim.png','from-stone-600 to-amber-900',   'creator', 'MA', TRUE),
  (deterministic_uuid('u_nala'),     'nala_laughs',  'Nala Laughs',        'nala@aafstories.com',   '/avatars/nala.png',    'from-lime-500 to-emerald-700',  'creator', 'KE', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED: CREATOR PROFILES
-- ============================================================================

INSERT INTO creator_profiles (
  id, user_id, username, display_name, avatar, avatar_gradient, cover_image,
  bio, country, city, verified, status, followers_count, total_views, total_videos,
  total_series, joined_date, categories, featured
) VALUES
  (deterministic_uuid('c_chiefuwa'), deterministic_uuid('u_chiefuwa'), 'chief_uwa', 'Chief Uwa Folktales', '/avatars/chiefuwa.png', 'from-amber-500 to-orange-700',
   'https://images.unsplash.com/photo-1547210787-b9a60d0226f0?w=1600&q=80',
   'Bringing ancient African folklore to a new generation. Nigerian storyteller weaving proverbs, spirits, and warriors into cinematic tales.',
   'NG', 'Lagos', TRUE, 'approved', 84200, 12800000, 124, 8, '2023-02-14', ARRAY['Folklore','Animation','African Legends'], TRUE),

  (deterministic_uuid('c_aida'), deterministic_uuid('u_aida'), 'aida_studio', 'Aïda.Studio', '/avatars/aida.png', 'from-purple-500 to-indigo-700',
   'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1600&q=80',
   'Senegalese visual artist and animator. Afro-futurist dreams rendered frame by frame.',
   'SN', 'Dakar', TRUE, 'approved', 52300, 7400000, 76, 5, '2023-05-01', ARRAY['Animation','Sci-Fi','AI Stories'], TRUE),

  (deterministic_uuid('c_kwame'), deterministic_uuid('u_kwame'), 'kwame_films', 'Kwame Films', '/avatars/kwame.png', 'from-emerald-500 to-teal-700',
   'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1600&q=80',
   'Ghanaian filmmaker crafting documentaries and episodic dramas from Accra. Stories rooted in truth.',
   'GH', 'Accra', TRUE, 'approved', 38100, 5200000, 58, 4, '2023-08-20', ARRAY['Documentary','Drama','History'], FALSE),

  (deterministic_uuid('c_nyandwi'), deterministic_uuid('u_nyandwi'), 'nyandwi_creates', 'Nyandwi Creates', '/avatars/nyandwi.png', 'from-sky-500 to-blue-700',
   'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80',
   'Rwandan creator making animated children''s stories with kindness at their heart.',
   'RW', 'Kigali', TRUE, 'approved', 19600, 3100000, 42, 3, '2024-01-15', ARRAY['Kids','Animation'], FALSE),

  (deterministic_uuid('c_zanele'), deterministic_uuid('u_zanele'), 'zanele_talks', 'Zanele Talks', '/avatars/zanele.png', 'from-rose-500 to-red-700',
   'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1600&q=80',
   'South African storyteller covering horror, mythology, and the legends beneath Table Mountain.',
   'ZA', 'Cape Town', TRUE, 'approved', 28900, 4600000, 65, 4, '2023-11-05', ARRAY['Horror','Fantasy','African Legends'], TRUE),

  (deterministic_uuid('c_malik'), deterministic_uuid('u_malik'), 'malik_animates', 'Malik Animates', '/avatars/malik.png', 'from-orange-500 to-amber-700',
   'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=1600&q=80',
   'Kenyan animator obsessed with Swahili coast legends and coastal fantasy.',
   'KE', 'Mombasa', FALSE, 'approved', 14200, 1900000, 33, 2, '2024-03-10', ARRAY['Animation','Fantasy','Adventure'], FALSE),

  (deterministic_uuid('c_amina'), deterministic_uuid('u_amina'), 'amina_stories', 'Amina Stories', '/avatars/amina.png', 'from-pink-500 to-fuchsia-700',
   'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=1600&q=80',
   'Egyptian-Cairo creator of romance and drama short films blending Nile heritage with modern love stories.',
   'EG', 'Cairo', TRUE, 'approved', 33400, 5800000, 51, 3, '2023-04-01', ARRAY['Romance','Drama','Short Films'], FALSE),

  (deterministic_uuid('c_kofi'), deterministic_uuid('u_kofi'), 'kofi_horror', 'Kofi Horror', '/avatars/kofi.png', 'from-slate-500 to-black',
   'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80',
   'One man exploring the darkest folklore of the Ashanti kingdom. Ghana''s #1 horror storyteller.',
   'GH', 'Kumasi', TRUE, 'approved', 41800, 6900000, 88, 6, '2023-01-20', ARRAY['Horror','Folklore','African Legends'], TRUE),

  (deterministic_uuid('c_selam'), deterministic_uuid('u_selam'), 'selam_films', 'Selam Films', '/avatars/selam.png', 'from-amber-500 to-yellow-700',
   'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1600&q=80',
   'Ethiopian filmmaker documenting the highlands, ancient churches, and hero stories of the Horn of Africa.',
   'ET', 'Addis Ababa', FALSE, 'approved', 12300, 1800000, 28, 2, '2024-06-01', ARRAY['Documentary','History','Adventure'], FALSE),

  (deterministic_uuid('c_tobi'), deterministic_uuid('u_tobi'), 'tobi_ai', 'Tobi AI Studios', '/avatars/tobi.png', 'from-cyan-500 to-violet-700',
   'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1600&q=80',
   'Pushing the limits of AI-generated African content. Noise to cinema — one prompt at a time.',
   'NG', 'Abuja', TRUE, 'approved', 67100, 9200000, 112, 7, '2023-09-01', ARRAY['AI Stories','Animation','Sci-Fi'], TRUE),

  (deterministic_uuid('c_ibrahim'), deterministic_uuid('u_ibrahim'), 'ibrahim_ma', 'Ibrahim Marrakesh', '/avatars/ibrahim.png', 'from-stone-600 to-amber-900',
   'https://images.unsplash.com/photo-1511247281353-e68dd95af593?w=1600&q=80',
   'Moroccan mini-series creator. Desert noir, medina mysticism, and slow-burn thrillers.',
   'MA', 'Marrakesh', TRUE, 'approved', 21500, 2800000, 46, 3, '2024-02-01', ARRAY['Drama','Thriller','Mini-Series'], FALSE),

  (deterministic_uuid('c_nala'), deterministic_uuid('u_nala'), 'nala_laughs', 'Nala Laughs', '/avatars/nala.png', 'from-lime-500 to-emerald-700',
   'https://images.unsplash.com/photo-1533228100845-08145b01de14?w=1600&q=80',
   'Kenyan comedy shorts. Stories from the matatu, the office, and everywhere in between.',
   'KE', 'Nairobi', TRUE, 'approved', 45700, 7300000, 96, 4, '2023-07-01', ARRAY['Comedy','Shorts'], FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED: SERIES
-- ============================================================================

INSERT INTO series (
  id, slug, title, description, cover_image, cover_gradient, creator_id, country,
  genre, language, age_rating, status, total_views, total_likes, followers_count,
  featured, completed, average_episode_duration, monetization, created_at, updated_at
) VALUES
  (deterministic_uuid('s_lastkingdom'),   'the-last-kingdom',   'The Last Kingdom',
   'A young warrior discovers that his bloodline carries an ancient power capable of saving — or destroying — his kingdom. An epic African fantasy spanning kingdoms, spirits, and destiny.',
   'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1600&q=80', 'from-amber-500/30 via-purple-900/40 to-black',
   deterministic_uuid('c_chiefuwa'), 'NG', ARRAY['Fantasy','Adventure','African Legends'], 'English', '16+', 'published',
   4860000, 328000, 268000, TRUE, TRUE, 1850, 'premium', '2024-01-10', '2025-08-22'),

  (deterministic_uuid('s_totssavanna'),   'tales-of-the-savanna', 'Tales of the Savanna',
   'Beautifully animated folktales from the grasslands of East Africa. Each episode is a window into a different tribe''s wisdom, humor, and magic.',
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80', 'from-emerald-500/30 via-teal-900/40 to-black',
   deterministic_uuid('c_nyandwi'), 'RW', ARRAY['Kids','Animation','Folklore'], 'English', 'G', 'published',
   2140000, 198000, 89000, FALSE, FALSE, 720, 'free', '2024-04-02', '2025-09-01'),

  (deterministic_uuid('s_omegaprincess'), 'the-omega-princess', 'The Omega Princess',
   'In the floating city of Lagos 2075, Princess Amara — last heir of a tech dynasty — must decide whether to save her people as a machine or as a human.',
   'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1600&q=80', 'from-cyan-500/30 via-violet-900/40 to-black',
   deterministic_uuid('c_tobi'), 'NG', ARRAY['Sci-Fi','AI Stories','Animation'], 'English', '12+', 'published',
   3720000, 245000, 156000, TRUE, FALSE, 1350, 'premium', '2024-06-15', '2025-08-30'),

  (deterministic_uuid('s_silencedstones'), 'silenced-stones', 'Silenced Stones',
   'A documentary series tracing the untold histories carved into West Africa''s ancient monuments and ruins. Where archaeology meets myth.',
   'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=1600&q=80', 'from-amber-700/40 via-stone-900/40 to-black',
   deterministic_uuid('c_kwame'), 'GH', ARRAY['Documentary','History'], 'English', 'PG', 'published',
   890000, 54000, 23000, FALSE, TRUE, 2400, 'free', '2024-09-01', '2025-07-20'),

  (deterministic_uuid('s_ghostsashanti'), 'ghosts-of-the-ashanti', 'Ghosts of the Ashanti',
   'Kofi Horror revisits the bone-chilling stories whispered in Kumasi after dark. Ghosts, curses, and the spirits that refuse to rest.',
   'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1600&q=80', 'from-red-900/40 via-black to-black',
   deterministic_uuid('c_kofi'), 'GH', ARRAY['Horror','Folklore','African Legends'], 'English', '16+', 'published',
   2890000, 176000, 98000, TRUE, FALSE, 1080, 'premium', '2024-02-20', '2025-09-04'),

  (deterministic_uuid('s_teranga'),       'teranga',            'Teranga',
   'From Dakar to Toronto, a Senegalese chef carries the concept of Teranga — sacred hospitality — across continents. A heartwarming African drama.',
   'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=1600&q=80', 'from-orange-500/30 via-purple-900/40 to-black',
   deterministic_uuid('c_aida'), 'SN', ARRAY['Drama','Romance'], 'French', 'PG', 'published',
   1650000, 124000, 45000, FALSE, FALSE, 1580, 'free', '2024-07-10', '2025-08-15'),

  (deterministic_uuid('s_nileaffair'),    'the-nile-affair',    'The Nile Affair',
   'Cairo. 1923. An archaeologist, a singer, and a secret that the sands kept for three thousand years. A premium period romance.',
   'https://images.unsplash.com/photo-1539650116574-5798617ca30b?w=1600&q=80', 'from-amber-600/30 via-stone-900/40 to-black',
   deterministic_uuid('c_amina'), 'EG', ARRAY['Romance','Drama','History'], 'Arabic', '12+', 'published',
   2040000, 158000, 67000, FALSE, TRUE, 2120, 'premium', '2024-03-01', '2025-06-30'),

  (deterministic_uuid('s_zulu'),          'legends-of-zulu',    'Legends of Zululand',
   'Mythology from beneath Table Mountain to the Kingdom of the Zulu. Ancient gods, heroes, and the storms they rode.',
   'https://images.unsplash.com/photo-1523428006214-e6b6691d35ff?w=1600&q=80', 'from-rose-800/40 via-black to-black',
   deterministic_uuid('c_zanele'), 'ZA', ARRAY['Mythology','Fantasy','African Legends'], 'English', '12+', 'published',
   1280000, 92000, 34000, FALSE, FALSE, 1250, 'free', '2024-10-01', '2025-08-28'),

  (deterministic_uuid('s_matatu'),        'matatu-54',          'Matatu 54',
   'Every day on Nairobi''s Route 54 is a sitcom. Ride with the crew of Matatu 54 as they navigate traffic, love triangles, and mkokoteni chaos.',
   'https://images.unsplash.com/photo-1524095731963-b4e38d1b3329?w=1600&q=80', 'from-blue-700/40 via-purple-900/40 to-black',
   deterministic_uuid('c_nala'), 'KE', ARRAY['Comedy','Drama'], 'Swahili', 'PG', 'published',
   1760000, 134000, 58000, FALSE, FALSE, 780, 'free', '2024-05-20', '2025-09-02'),

  (deterministic_uuid('s_medina'),        'the-medina-files',   'The Medina Files',
   'In Marrakesh''s ancient medina, a detective with a gift for reading lies uncovers a conspiracy that reaches the highest councils of the kingdom.',
   'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1600&q=80', 'from-stone-700/50 via-orange-900/40 to-black',
   deterministic_uuid('c_ibrahim'), 'MA', ARRAY['Thriller','Drama','Mystery'], 'Arabic', '16+', 'published',
   985000, 72000, 21000, FALSE, TRUE, 2650, 'premium', '2024-08-05', '2025-07-10')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED: SEASONS
-- ============================================================================

INSERT INTO seasons (id, series_id, season_number, title, description, episode_count) VALUES
  (deterministic_uuid('s1_lastkingdom'), deterministic_uuid('s_lastkingdom'), 1, 'Season 1',
   'The prophecy awakens as Adaeze, a blacksmith''s daughter, discovers the blood of kings flows in her veins.', 6),
  (deterministic_uuid('s2_lastkingdom'), deterministic_uuid('s_lastkingdom'), 2, 'Season 2',
   'The kingdom fractures as old alliances crumble and the shadow from the north grows stronger.', 6),
  (deterministic_uuid('s1_tots'),        deterministic_uuid('s_totssavanna'), 1, 'Season 1',
   'Twelve tales from the heart of the savanna.', 12),
  (deterministic_uuid('s1_omega'),       deterministic_uuid('s_omegaprincess'), 1, 'Season 1',
   'Five episodes of Lagos 2075.', 5),
  (deterministic_uuid('s2_omega'),       deterministic_uuid('s_omegaprincess'), 2, 'Season 2',
   'The uprising.', 5),
  (deterministic_uuid('s1_stones'),      deterministic_uuid('s_silencedstones'), 1, 'Season 1',
   'Ghosts of the Sahel.', 4),
  (deterministic_uuid('s1_ghosts'),      deterministic_uuid('s_ghostsashanti'), 1, 'Season 1',
   'Eight terrifying legends.', 8),
  (deterministic_uuid('s2_ghosts'),      deterministic_uuid('s_ghostsashanti'), 2, 'Season 2',
   'The curse deepens.', 8),
  (deterministic_uuid('s1_teranga'),     deterministic_uuid('s_teranga'), 1, 'Season 1',
   'Dakar.', 6),
  (deterministic_uuid('s1_nile'),        deterministic_uuid('s_nileaffair'), 1, 'Season 1',
   'The dig begins.', 6),
  (deterministic_uuid('s1_zulu'),        deterministic_uuid('s_zulu'), 1, 'Season 1',
   'Gods and warriors.', 5),
  (deterministic_uuid('s1_matatu'),      deterministic_uuid('s_matatu'), 1, 'Season 1',
   'Race against time.', 8),
  (deterministic_uuid('s1_medina'),      deterministic_uuid('s_medina'), 1, 'Season 1',
   'Six episodes through the souks.', 6)
ON CONFLICT (series_id, season_number) DO NOTHING;

-- ============================================================================
-- SEED: VIDEOS
-- Episode videos first (they hold the video_id referenced by episodes).
-- ============================================================================

INSERT INTO videos (
  id, slug, title, description, thumbnail, thumbnail_gradient, video_url, duration,
  type, origin, status, monetization, unlock_price, age_rating, genre, language,
  country, tags, views, likes, shares, processing_status, created_at, published_at,
  featured, creator_id, series_id
) VALUES
-- The Last Kingdom S1
  (deterministic_uuid('v_lk_s1e1'), 'last-kingdom-s1e1', 'The Prophecy',
   'When a wounded stranger arrives at the village with news of a coming war, blacksmith''s daughter Adaeze discovers a birthmark that seals her fate.',
   'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1200&q=80', 'from-purple-800/60 to-black',
   'https://stream.mux.com/v_lk_s1e1.m3u8', 1850, 'series', 'ai_generated', 'published',
   'free', 0, '16+', ARRAY['Fantasy','Adventure','African Legends'], 'English', 'NG',
   ARRAY['fantasy','warrior','prophecy'], 1240000, 91000, 42000, 'completed', '2024-01-15', '2024-01-15',
   TRUE, deterministic_uuid('c_chiefuwa'), deterministic_uuid('s_lastkingdom')),
  (deterministic_uuid('v_lk_s1e2'), 'last-kingdom-s1e2', 'The Forbidden Forest',
   'To unlock her power, Adaeze must enter the Forbidden Forest — where the spirits of three fallen kings guard the secrets of her lineage.',
   'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80', 'from-emerald-900/60 to-black',
   'https://stream.mux.com/v_lk_s1e2.m3u8', 1900, 'series', 'ai_generated', 'published',
   'premium', 50, '16+', ARRAY['Fantasy','Adventure','African Legends'], 'English', 'NG',
   ARRAY['fantasy','forest','spirits'], 982000, 64200, 28100, 'completed', '2024-01-22', '2024-01-22',
   FALSE, deterministic_uuid('c_chiefuwa'), deterministic_uuid('s_lastkingdom')),
  (deterministic_uuid('v_lk_s1e3'), 'last-kingdom-s1e3', 'The Warrior',
   'Adaeze takes her first command in the night battle of Ossi River. Some say a queen was born that evening.',
   'https://images.unsplash.com/photo-1470784869199-0bf6c4c1b2b1?w=1200&q=80', 'from-orange-800/60 to-black',
   'https://stream.mux.com/v_lk_s1e3.m3u8', 1780, 'series', 'ai_generated', 'published',
   'premium', 50, '16+', ARRAY['Fantasy','Adventure','African Legends'], 'English', 'NG',
   ARRAY['battle','queen','war'], 873000, 55100, 23300, 'completed', '2024-01-29', '2024-01-29',
   FALSE, deterministic_uuid('c_chiefuwa'), deterministic_uuid('s_lastkingdom')),
  (deterministic_uuid('v_lk_s1e4'), 'last-kingdom-s1e4', 'The Return',
   'The usurper has claimed the throne. Adaeze returns not to beg — but to take back what was stolen.',
   'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80', 'from-red-900/60 to-black',
   'https://stream.mux.com/v_lk_s1e4.m3u8', 1940, 'series', 'ai_generated', 'published',
   'premium', 75, '16+', ARRAY['Fantasy','Adventure','African Legends'], 'English', 'NG',
   ARRAY['throne','revenge','return'], 795000, 48000, 19100, 'completed', '2024-02-05', '2024-02-05',
   FALSE, deterministic_uuid('c_chiefuwa'), deterministic_uuid('s_lastkingdom')),
  (deterministic_uuid('v_lk_s1e5'), 'last-kingdom-s1e5', 'The Alliance',
   'Ancient enemies become uneasy allies as the northern shadow spreads. Adaeze must choose who to trust.',
   'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', 'from-sky-900/60 to-black',
   'https://stream.mux.com/v_lk_s1e5.m3u8', 1820, 'series', 'ai_generated', 'published',
   'premium', 50, '16+', ARRAY['Fantasy','Adventure','African Legends'], 'English', 'NG',
   ARRAY['alliance','trust','spies'], 712000, 41000, 15800, 'completed', '2024-02-12', '2024-02-12',
   FALSE, deterministic_uuid('c_chiefuwa'), deterministic_uuid('s_lastkingdom')),
  (deterministic_uuid('v_lk_s1e6'), 'last-kingdom-s1e6', 'The Ascension',
   'The final battle for the kingdom. A crown of fire or a funeral pyre — Adaeze decides which one the night will bring.',
   'https://images.unsplash.com/photo-1519802157191-8e14a5d39d2c?w=1200&q=80', 'from-amber-700/60 to-black',
   'https://stream.mux.com/v_lk_s1e6.m3u8', 2200, 'series', 'ai_generated', 'published',
   'premium', 100, '16+', ARRAY['Fantasy','Adventure','African Legends'], 'English', 'NG',
   ARRAY['final-battle','crown','destiny'], 968000, 83000, 37200, 'completed', '2024-02-19', '2024-02-19',
   FALSE, deterministic_uuid('c_chiefuwa'), deterministic_uuid('s_lastkingdom')),
-- The Last Kingdom S2
  (deterministic_uuid('v_lk_s2e1'), 'last-kingdom-s2e1', 'The Queen''s Decision',
   'Six months after the ascension, Adaeze rules over a divided kingdom. But a letter from the north changes everything.',
   'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=1200&q=80', 'from-purple-900/60 to-black',
   'https://stream.mux.com/v_lk_s2e1.m3u8', 1880, 'series', 'ai_generated', 'published',
   'premium', 100, '16+', ARRAY['Fantasy','Adventure','African Legends'], 'English', 'NG',
   ARRAY['queen','letter','north'], 690000, 38900, 14500, 'completed', '2025-08-22', '2025-08-22',
   FALSE, deterministic_uuid('c_chiefuwa'), deterministic_uuid('s_lastkingdom')),
  (deterministic_uuid('v_lk_s2e2'), 'last-kingdom-s2e2', 'The Brothers'' Betrayal',
   'The twin princes of the northern provinces stage a coup. Adaeze''s most trusted generals walk into the trap.',
   'https://images.unsplash.com/photo-1489674267075-cee793167910?w=1200&q=80', 'from-red-800/60 to-black',
   'https://stream.mux.com/v_lk_s2e2.m3u8', 1750, 'series', 'ai_generated', 'published',
   'premium', 100, '16+', ARRAY['Fantasy','Adventure','African Legends'], 'English', 'NG',
   ARRAY['coup','betrayal','princes'], 512000, 28000, 10300, 'completed', '2025-08-29', '2025-08-29',
   FALSE, deterministic_uuid('c_chiefuwa'), deterministic_uuid('s_lastkingdom')),
-- Tales of the Savanna
  (deterministic_uuid('v_tots_s1e1'), 'tales-of-the-savanna-s1e1', 'How the Baobab Got Its Shape',
   'A curious aardvark challenges the sky god to a dance contest — and the baobab tree never forgets what happened.',
   'https://images.unsplash.com/photo-1523633589114-88eaf4b4f1a8?w=1200&q=80', 'from-emerald-700/50 to-black',
   'https://stream.mux.com/v_tots_s1e1.m3u8', 720, 'series', 'ai_assisted', 'published',
   'free', 0, 'G', ARRAY['Kids','Animation','Folklore'], 'English', 'RW',
   ARRAY['baobab','folklore','children'], 418000, 39200, 14300, 'completed', '2024-04-08', '2024-04-08',
   FALSE, deterministic_uuid('c_nyandwi'), deterministic_uuid('s_totssavanna')),
  (deterministic_uuid('v_tots_s1e2'), 'tales-of-the-savanna-s1e2', 'The Greedy Crocodile',
   'Mamba the crocodile thinks he owns the whole river. The kingfisher teaches him a lesson about sharing.',
   'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=1200&q=80', 'from-teal-800/50 to-black',
   'https://stream.mux.com/v_tots_s1e2.m3u8', 690, 'series', 'ai_assisted', 'published',
   'free', 0, 'G', ARRAY['Kids','Animation','Folklore'], 'English', 'RW',
   ARRAY['crocodile','river','lesson'], 356000, 30400, 9800, 'completed', '2024-04-15', '2024-04-15',
   FALSE, deterministic_uuid('c_nyandwi'), deterministic_uuid('s_totssavanna')),
  (deterministic_uuid('v_tots_s1e3'), 'tales-of-the-savanna-s1e3', 'Why the Moon Follows the Sun',
   'The story of two star-crossed spirits whose love created night and day across the savanna skies.',
   'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&q=80', 'from-indigo-800/60 to-black',
   'https://stream.mux.com/v_tots_s1e3.m3u8', 745, 'series', 'ai_assisted', 'published',
   'free', 0, 'G', ARRAY['Kids','Animation','Folklore'], 'English', 'RW',
   ARRAY['moon','sun','love'], 389000, 35700, 11200, 'completed', '2024-04-22', '2024-04-22',
   FALSE, deterministic_uuid('c_nyandwi'), deterministic_uuid('s_totssavanna')),
-- Ghosts of the Ashanti
  (deterministic_uuid('v_ga_s1e1'), 'ghosts-ashanti-s1e1', 'The Red Canoe',
   'The most whispered story in Kumasi: the fisherman who was promised gold and came back with something else.',
   'https://images.unsplash.com/photo-1508776982115-11f8a0e0b4a1?w=1200&q=80', 'from-slate-900/70 to-black',
   'https://stream.mux.com/v_ga_s1e1.m3u8', 1150, 'series', 'human', 'published',
   'free', 0, '16+', ARRAY['Horror','Folklore','African Legends'], 'English', 'GH',
   ARRAY['canoe','fisherman','ghost'], 884000, 62000, 34800, 'completed', '2024-03-01', '2024-03-01',
   FALSE, deterministic_uuid('c_kofi'), deterministic_uuid('s_ghostsashanti')),
  (deterministic_uuid('v_ga_s1e2'), 'ghosts-ashanti-s1e2', 'The Gilded Drum',
   'A royal drummer finds a golden drum at the riverbank. Every beat tells a warning he can''t ignore.',
   'https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=1200&q=80', 'from-amber-900/50 to-black',
   'https://stream.mux.com/v_ga_s1e2.m3u8', 1080, 'series', 'human', 'published',
   'premium', 50, '16+', ARRAY['Horror','Folklore','African Legends'], 'English', 'GH',
   ARRAY['drum','warning','royal'], 742000, 49000, 20100, 'completed', '2024-03-08', '2024-03-08',
   FALSE, deterministic_uuid('c_kofi'), deterministic_uuid('s_ghostsashanti')),
  (deterministic_uuid('v_ga_s1e3'), 'ghosts-ashanti-s1e3', 'The One Who Returned',
   'Fifty years after his funeral, the village elder walks home for his yam festival. He says he''s not done with his stories.',
   'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&q=80', 'from-purple-950/60 to-black',
   'https://stream.mux.com/v_ga_s1e3.m3u8', 1215, 'series', 'human', 'published',
   'premium', 50, '16+', ARRAY['Horror','Folklore','African Legends'], 'English', 'GH',
   ARRAY['elder','funeral','return'], 668000, 41300, 15900, 'completed', '2024-03-15', '2024-03-15',
   FALSE, deterministic_uuid('c_kofi'), deterministic_uuid('s_ghostsashanti')),
-- The Omega Princess
  (deterministic_uuid('v_op_s1e1'), 'omega-princess-s1e1', 'Neural Lagos',
   'Eko City 2075. Amara''s eyes are sockets of light, and half of Lagos runs on the code in her blood.',
   'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80', 'from-violet-900/60 to-black',
   'https://stream.mux.com/v_op_s1e1.m3u8', 1380, 'series', 'ai_generated', 'published',
   'free', 0, '12+', ARRAY['Sci-Fi','AI Stories','Animation'], 'English', 'NG',
   ARRAY['lagos','cyberpunk','neural'], 1120000, 86000, 45100, 'completed', '2024-06-20', '2024-06-20',
   TRUE, deterministic_uuid('c_tobi'), deterministic_uuid('s_omegaprincess')),
  (deterministic_uuid('v_op_s1e2'), 'omega-princess-s1e2', 'The Overnight Uprising',
   'When the drones stop obeying the corporation, everyone in the floating city wants to know: who is the Omega Princess?',
   'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80', 'from-cyan-900/60 to-black',
   'https://stream.mux.com/v_op_s1e2.m3u8', 1420, 'series', 'ai_generated', 'published',
   'premium', 50, '12+', ARRAY['Sci-Fi','AI Stories','Animation'], 'English', 'NG',
   ARRAY['drones','uprising','corporate'], 932000, 68000, 31200, 'completed', '2024-06-27', '2024-06-27',
   FALSE, deterministic_uuid('c_tobi'), deterministic_uuid('s_omegaprincess')),
  (deterministic_uuid('v_op_s1e3'), 'omega-princess-s1e3', 'Blood and Binary',
   'Amara discovers her own neural code was written by the machine she''s been fighting — and her father is the author.',
   'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80', 'from-fuchsia-900/60 to-black',
   'https://stream.mux.com/v_op_s1e3.m3u8', 1360, 'series', 'ai_generated', 'published',
   'premium', 50, '12+', ARRAY['Sci-Fi','AI Stories','Animation'], 'English', 'NG',
   ARRAY['neural','father','secret'], 812000, 58900, 26400, 'completed', '2024-07-04', '2024-07-04',
   FALSE, deterministic_uuid('c_tobi'), deterministic_uuid('s_omegaprincess')),
-- Silenced Stones
  (deterministic_uuid('v_ss_s1e1'), 'silenced-stones-s1e1', 'The Walls of the Sahel',
   'Journey north to the forgotten citadels that protected West African learning for a thousand years.',
   'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?w=1200&q=80', 'from-yellow-800/50 to-black',
   'https://stream.mux.com/v_ss_s1e1.m3u8', 2480, 'series', 'human', 'published',
   'free', 0, 'PG', ARRAY['Documentary','History'], 'English', 'GH',
   ARRAY['sahel','citadels','history'], 342000, 21800, 8800, 'completed', '2024-09-10', '2024-09-10',
   FALSE, deterministic_uuid('c_kwame'), deterministic_uuid('s_silencedstones')),
  (deterministic_uuid('v_ss_s1e2'), 'silenced-stones-s1e2', 'The Kingdom Beneath the Lake',
   'When Lake Volta rose in the 1960s, it swallowed towns whole. Divers search for what survived beneath the water.',
   'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80', 'from-sky-900/50 to-black',
   'https://stream.mux.com/v_ss_s1e2.m3u8', 2300, 'series', 'human', 'published',
   'free', 0, 'PG', ARRAY['Documentary','History'], 'English', 'GH',
   ARRAY['lake','divers','volta'], 296000, 18400, 7100, 'completed', '2024-09-17', '2024-09-17',
   FALSE, deterministic_uuid('c_kwame'), deterministic_uuid('s_silencedstones')),
-- Teranga
  (deterministic_uuid('v_tg_s1e1'), 'teranga-s1e1', 'Dakar, Season One, Bissap',
   'Aminata wakes before the sun to set up her grandmother''s bissap stall — and her phone keeps buzzing with the news that changes her future.',
   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80', 'from-orange-800/50 to-black',
   'https://stream.mux.com/v_tg_s1e1.m3u8', 1610, 'series', 'ai_assisted', 'published',
   'free', 0, 'PG', ARRAY['Drama','Romance'], 'French', 'SN',
   ARRAY['dakar','bissap','family'], 482000, 35600, 14200, 'completed', '2024-07-15', '2024-07-15',
   FALSE, deterministic_uuid('c_aida'), deterministic_uuid('s_teranga')),
  (deterministic_uuid('v_tg_s1e2'), 'teranga-s1e2', 'The Passport',
   'A visa interview at the Canadian embassy. Aminata carries a thermos of bissap because in her family, you never visit empty-handed.',
   'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80', 'from-indigo-800/50 to-black',
   'https://stream.mux.com/v_tg_s1e2.m3u8', 1730, 'series', 'ai_assisted', 'published',
   'free', 0, 'PG', ARRAY['Drama','Romance'], 'French', 'SN',
   ARRAY['visa','embassy','hospitality'], 398000, 28700, 10100, 'completed', '2024-07-22', '2024-07-22',
   FALSE, deterministic_uuid('c_aida'), deterministic_uuid('s_teranga')),
-- Standalone / showcase videos
  (deterministic_uuid('v_hero_lastkingdom'), 'last-kingdom-episode-1', 'The Last Kingdom — The Prophecy',
   'A young warrior discovers that his bloodline carries an ancient power capable of saving — or destroying — his kingdom.',
   'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1400&q=80', 'from-purple-900/70 via-purple-700/20 to-black',
   'https://stream.mux.com/v_hero_lastkingdom.m3u8', 1850, 'series', 'ai_generated', 'published',
   'free', 0, '16+', ARRAY['Fantasy','Adventure','African Legends'], 'English', 'NG',
   ARRAY['fantasy','warrior','prophecy','nigeria','african legends'], 1240000, 91000, 42000, 'completed',
   '2024-01-15', '2024-01-15', TRUE, deterministic_uuid('c_chiefuwa'), deterministic_uuid('s_lastkingdom')),
  (deterministic_uuid('v_ani_tobi'), 'omega-princess-trailer', 'The Omega Princess — Official Trailer',
   'The future of Lagos is code. And Adaeze Amara is its heartbeat. Watch the trailer for the series threatening to change African animation.',
   'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&q=80', 'from-violet-900/70 via-indigo-700/20 to-black',
   'https://stream.mux.com/v_ani_tobi.m3u8', 132, 'short', 'ai_generated', 'published',
   'free', 0, '12+', ARRAY['Sci-Fi','AI Stories','Animation'], 'English', 'NG',
   ARRAY['trailer','scifi','ai','lagos','cyberpunk'], 684000, 52300, 28900, 'completed',
   '2024-06-19', '2024-06-19', TRUE, deterministic_uuid('c_tobi'), deterministic_uuid('s_omegaprincess')),
  (deterministic_uuid('v_redcanoe'), 'the-red-canoe', 'The Red Canoe — Part 1',
   'Every village on the river knows the story. Mansa ignored it. Three nights later, the canoe returned.',
   'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&q=80', 'from-slate-950 via-red-950/60 to-black',
   'https://stream.mux.com/v_redcanoe.m3u8', 1240, 'single', 'human', 'published',
   'premium', 50, '16+', ARRAY['Horror','Folklore'], 'English', 'GH',
   ARRAY['horror','river','ghana','folklore','curse'], 884000, 62000, 34800, 'completed',
   '2024-03-01', '2024-03-01', FALSE, deterministic_uuid('c_kofi'), NULL),
  (deterministic_uuid('v_swahili_coast'), 'swahili-coast-adventure', 'The Pirate Queen of the Swahili Coast',
   'Sail back six centuries to the red-inked legend of a woman who ruled the coral reefs between Mombasa and Zanzibar.',
   'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=80', 'from-teal-900/70 via-amber-700/20 to-black',
   'https://stream.mux.com/v_swahili_coast.m3u8', 1560, 'single', 'ai_assisted', 'published',
   'free', 0, 'PG', ARRAY['Adventure','History','African Legends'], 'Swahili', 'KE',
   ARRAY['swahili','history','pirates','kenya','oceania'], 315000, 24700, 11800, 'completed',
   '2024-09-02', '2024-09-02', FALSE, deterministic_uuid('c_malik'), NULL),
  (deterministic_uuid('v_sahara_trade'), 'sahara-trade-routes', 'The Millionaires of the Sahara',
   'Before oil, before empires — salt and gold built West African millionaires. A documentary on the trade routes that shaped a continent.',
   'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1400&q=80', 'from-amber-800/60 via-stone-900/30 to-black',
   'https://stream.mux.com/v_sahara_trade.m3u8', 2810, 'single', 'human', 'published',
   'free', 0, 'PG', ARRAY['Documentary','History'], 'English', 'GH',
   ARRAY['documentary','sahara','trade','history','ghana'], 182000, 14300, 5900, 'completed',
   '2024-11-05', '2024-11-05', FALSE, deterministic_uuid('c_kwame'), NULL),
  (deterministic_uuid('v_amara_short'), 'amara-savannah-short', 'Amara in the Whispering Grass',
   'A 90-second silent short: a girl, a field, and the ancestors who answer when she listens.',
   'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1400&q=80', 'from-emerald-800/60 via-lime-700/20 to-black',
   'https://stream.mux.com/v_amara_short.m3u8', 92, 'short', 'ai_generated', 'published',
   'free', 0, 'G', ARRAY['Animation','Kids'], 'No Dialogue', 'RW',
   ARRAY['short','animation','children','savannah'], 486000, 41200, 19700, 'completed',
   '2024-12-01', '2024-12-01', FALSE, deterministic_uuid('c_nyandwi'), NULL),
  (deterministic_uuid('v_zulu_thunder'), 'zulu-thunder-god', 'Inkosi Yendaba: The Storm God''s Bargain',
   'One of the oldest tales of the Zulu people — the day the sky cracked open and a deity asked for a sacrifice.',
   'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1400&q=80', 'from-slate-900 via-blue-950/50 to-black',
   'https://stream.mux.com/v_zulu_thunder.m3u8', 1680, 'single', 'human', 'published',
   'premium', 75, '12+', ARRAY['Mythology','Fantasy','African Legends'], 'English', 'ZA',
   ARRAY['zulu','mythology','thunder','south africa','storm'], 284000, 21800, 9400, 'completed',
   '2024-10-12', '2024-10-12', FALSE, deterministic_uuid('c_zanele'), NULL),
  (deterministic_uuid('v_nile_romance'), 'nile-romance-trailer', 'The Nile Affair — Trailer',
   'Cairo 1923. A romance forbidden by class, protected by a secret older than the pyramids.',
   'https://images.unsplash.com/photo-1539650116574-5798617ca30b?w=1400&q=80', 'from-amber-700/60 via-stone-800/30 to-black',
   'https://stream.mux.com/v_nile_romance.m3u8', 118, 'short', 'human', 'published',
   'free', 0, '12+', ARRAY['Romance','Drama','History'], 'Arabic', 'EG',
   ARRAY['trailer','romance','egypt','1920s','cairo'], 392000, 28700, 13300, 'completed',
   '2024-03-10', '2024-03-10', FALSE, deterministic_uuid('c_amina'), NULL),
  (deterministic_uuid('v_matatu_54'), 'matatu-54-episode-1', 'Matatu 54 — Episode 1: Race Against Time',
   'The crew of Route 54 must beat the wedding party to the venue, while dodging traffic, exes, and a runaway goat.',
   'https://images.unsplash.com/photo-1501728927745-797487d1a03e?w=1400&q=80', 'from-sky-800/60 via-violet-800/20 to-black',
   'https://stream.mux.com/v_matatu_54.m3u8', 790, 'short', 'human', 'published',
   'free', 0, 'PG', ARRAY['Comedy','Drama'], 'Swahili', 'KE',
   ARRAY['comedy','kenya','matatu','nairobi','sitcom'], 518000, 39400, 21200, 'completed',
   '2024-05-25', '2024-05-25', FALSE, deterministic_uuid('c_nala'), NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED: EPISODES (link series + season + video)
-- ============================================================================

INSERT INTO episodes (
  id, series_id, season_number, episode_number, title, description, thumbnail,
  thumbnail_gradient, video_id, duration, monetization, unlock_price, views, likes,
  comments_count, published_at
) VALUES
  -- The Last Kingdom S1
  (deterministic_uuid('e_lk_s1e1'), deterministic_uuid('s_lastkingdom'), 1, 1, 'The Prophecy',
   'When a wounded stranger arrives at the village with news of a coming war, blacksmith''s daughter Adaeze discovers a birthmark that seals her fate.',
   'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1200&q=80', 'from-purple-800/60 to-black',
   deterministic_uuid('v_lk_s1e1'), 1850, 'free', 0, 1240000, 91000, 2140, '2024-01-15'),
  (deterministic_uuid('e_lk_s1e2'), deterministic_uuid('s_lastkingdom'), 1, 2, 'The Forbidden Forest',
   'To unlock her power, Adaeze must enter the Forbidden Forest — where the spirits of three fallen kings guard the secrets of her lineage.',
   'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80', 'from-emerald-900/60 to-black',
   deterministic_uuid('v_lk_s1e2'), 1900, 'premium', 50, 982000, 64200, 1380, '2024-01-22'),
  (deterministic_uuid('e_lk_s1e3'), deterministic_uuid('s_lastkingdom'), 1, 3, 'The Warrior',
   'Adaeze takes her first command in the night battle of Ossi River. Some say a queen was born that evening.',
   'https://images.unsplash.com/photo-1470784869199-0bf6c4c1b2b1?w=1200&q=80', 'from-orange-800/60 to-black',
   deterministic_uuid('v_lk_s1e3'), 1780, 'premium', 50, 873000, 55100, 1105, '2024-01-29'),
  (deterministic_uuid('e_lk_s1e4'), deterministic_uuid('s_lastkingdom'), 1, 4, 'The Return',
   'The usurper has claimed the throne. Adaeze returns not to beg — but to take back what was stolen.',
   'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80', 'from-red-900/60 to-black',
   deterministic_uuid('v_lk_s1e4'), 1940, 'premium', 75, 795000, 48000, 980, '2024-02-05'),
  (deterministic_uuid('e_lk_s1e5'), deterministic_uuid('s_lastkingdom'), 1, 5, 'The Alliance',
   'Ancient enemies become uneasy allies as the northern shadow spreads. Adaeze must choose who to trust.',
   'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', 'from-sky-900/60 to-black',
   deterministic_uuid('v_lk_s1e5'), 1820, 'premium', 50, 712000, 41000, 823, '2024-02-12'),
  (deterministic_uuid('e_lk_s1e6'), deterministic_uuid('s_lastkingdom'), 1, 6, 'The Ascension',
   'The final battle for the kingdom. A crown of fire or a funeral pyre — Adaeze decides which one the night will bring.',
   'https://images.unsplash.com/photo-1519802157191-8e14a5d39d2c?w=1200&q=80', 'from-amber-700/60 to-black',
   deterministic_uuid('v_lk_s1e6'), 2200, 'premium', 100, 968000, 83000, 2100, '2024-02-19'),
  -- The Last Kingdom S2
  (deterministic_uuid('e_lk_s2e1'), deterministic_uuid('s_lastkingdom'), 2, 1, 'The Queen''s Decision',
   'Six months after the ascension, Adaeze rules over a divided kingdom. But a letter from the north changes everything.',
   'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=1200&q=80', 'from-purple-900/60 to-black',
   deterministic_uuid('v_lk_s2e1'), 1880, 'premium', 100, 690000, 38900, 742, '2025-08-22'),
  (deterministic_uuid('e_lk_s2e2'), deterministic_uuid('s_lastkingdom'), 2, 2, 'The Brothers'' Betrayal',
   'The twin princes of the northern provinces stage a coup. Adaeze''s most trusted generals walk into the trap.',
   'https://images.unsplash.com/photo-1489674267075-cee793167910?w=1200&q=80', 'from-red-800/60 to-black',
   deterministic_uuid('v_lk_s2e2'), 1750, 'premium', 100, 512000, 28000, 510, '2025-08-29'),
  -- Tales of the Savanna
  (deterministic_uuid('e_tots_s1e1'), deterministic_uuid('s_totssavanna'), 1, 1, 'How the Baobab Got Its Shape',
   'A curious aardvark challenges the sky god to a dance contest — and the baobab tree never forgets what happened.',
   'https://images.unsplash.com/photo-1523633589114-88eaf4b4f1a8?w=1200&q=80', 'from-emerald-700/50 to-black',
   deterministic_uuid('v_tots_s1e1'), 720, 'free', 0, 418000, 39200, 610, '2024-04-08'),
  (deterministic_uuid('e_tots_s1e2'), deterministic_uuid('s_totssavanna'), 1, 2, 'The Greedy Crocodile',
   'Mamba the crocodile thinks he owns the whole river. The kingfisher teaches him a lesson about sharing.',
   'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=1200&q=80', 'from-teal-800/50 to-black',
   deterministic_uuid('v_tots_s1e2'), 690, 'free', 0, 356000, 30400, 445, '2024-04-15'),
  (deterministic_uuid('e_tots_s1e3'), deterministic_uuid('s_totssavanna'), 1, 3, 'Why the Moon Follows the Sun',
   'The story of two star-crossed spirits whose love created night and day across the savanna skies.',
   'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&q=80', 'from-indigo-800/60 to-black',
   deterministic_uuid('v_tots_s1e3'), 745, 'free', 0, 389000, 35700, 502, '2024-04-22'),
  -- Ghosts of the Ashanti
  (deterministic_uuid('e_ga_s1e1'), deterministic_uuid('s_ghostsashanti'), 1, 1, 'The Red Canoe',
   'The most whispered story in Kumasi: the fisherman who was promised gold and came back with something else.',
   'https://images.unsplash.com/photo-1508776982115-11f8a0e0b4a1?w=1200&q=80', 'from-slate-900/70 to-black',
   deterministic_uuid('v_ga_s1e1'), 1150, 'free', 0, 884000, 62000, 1840, '2024-03-01'),
  (deterministic_uuid('e_ga_s1e2'), deterministic_uuid('s_ghostsashanti'), 1, 2, 'The Gilded Drum',
   'A royal drummer finds a golden drum at the riverbank. Every beat tells a warning he can''t ignore.',
   'https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=1200&q=80', 'from-amber-900/50 to-black',
   deterministic_uuid('v_ga_s1e2'), 1080, 'premium', 50, 742000, 49000, 1210, '2024-03-08'),
  (deterministic_uuid('e_ga_s1e3'), deterministic_uuid('s_ghostsashanti'), 1, 3, 'The One Who Returned',
   'Fifty years after his funeral, the village elder walks home for his yam festival. He says he''s not done with his stories.',
   'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&q=80', 'from-purple-950/60 to-black',
   deterministic_uuid('v_ga_s1e3'), 1215, 'premium', 50, 668000, 41300, 980, '2024-03-15'),
  -- The Omega Princess
  (deterministic_uuid('e_op_s1e1'), deterministic_uuid('s_omegaprincess'), 1, 1, 'Neural Lagos',
   'Eko City 2075. Amara''s eyes are sockets of light, and half of Lagos runs on the code in her blood.',
   'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80', 'from-violet-900/60 to-black',
   deterministic_uuid('v_op_s1e1'), 1380, 'free', 0, 1120000, 86000, 2310, '2024-06-20'),
  (deterministic_uuid('e_op_s1e2'), deterministic_uuid('s_omegaprincess'), 1, 2, 'The Overnight Uprising',
   'When the drones stop obeying the corporation, everyone in the floating city wants to know: who is the Omega Princess?',
   'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80', 'from-cyan-900/60 to-black',
   deterministic_uuid('v_op_s1e2'), 1420, 'premium', 50, 932000, 68000, 1740, '2024-06-27'),
  (deterministic_uuid('e_op_s1e3'), deterministic_uuid('s_omegaprincess'), 1, 3, 'Blood and Binary',
   'Amara discovers her own neural code was written by the machine she''s been fighting — and her father is the author.',
   'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80', 'from-fuchsia-900/60 to-black',
   deterministic_uuid('v_op_s1e3'), 1360, 'premium', 50, 812000, 58900, 1450, '2024-07-04'),
  -- Silenced Stones
  (deterministic_uuid('e_ss_s1e1'), deterministic_uuid('s_silencedstones'), 1, 1, 'The Walls of the Sahel',
   'Journey north to the forgotten citadels that protected West African learning for a thousand years.',
   'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?w=1200&q=80', 'from-yellow-800/50 to-black',
   deterministic_uuid('v_ss_s1e1'), 2480, 'free', 0, 342000, 21800, 380, '2024-09-10'),
  (deterministic_uuid('e_ss_s1e2'), deterministic_uuid('s_silencedstones'), 1, 2, 'The Kingdom Beneath the Lake',
   'When Lake Volta rose in the 1960s, it swallowed towns whole. Divers search for what survived beneath the water.',
   'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80', 'from-sky-900/50 to-black',
   deterministic_uuid('v_ss_s1e2'), 2300, 'free', 0, 296000, 18400, 302, '2024-09-17'),
  -- Teranga
  (deterministic_uuid('e_tg_s1e1'), deterministic_uuid('s_teranga'), 1, 1, 'Dakar, Season One, Bissap',
   'Aminata wakes before the sun to set up her grandmother''s bissap stall — and her phone keeps buzzing with the news that changes her future.',
   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80', 'from-orange-800/50 to-black',
   deterministic_uuid('v_tg_s1e1'), 1610, 'free', 0, 482000, 35600, 620, '2024-07-15'),
  (deterministic_uuid('e_tg_s1e2'), deterministic_uuid('s_teranga'), 1, 2, 'The Passport',
   'A visa interview at the Canadian embassy. Aminata carries a thermos of bissap because in her family, you never visit empty-handed.',
   'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80', 'from-indigo-800/50 to-black',
   deterministic_uuid('v_tg_s1e2'), 1730, 'free', 0, 398000, 28700, 480, '2024-07-22')
ON CONFLICT (series_id, season_number, episode_number) DO NOTHING;

-- Link episode videos back (videos.episode_id)
UPDATE videos v SET episode_id = e.id
FROM episodes e WHERE e.video_id = v.id AND v.episode_id IS NULL;

-- The hero video mirrors the S1E1 episode
UPDATE videos v SET episode_id = deterministic_uuid('e_lk_s1e1')
WHERE v.id = deterministic_uuid('v_hero_lastkingdom');

-- ============================================================================
-- RESET SERIES TOTALS (the episode-view trigger accumulates views; reset to
-- the canonical mock values so the numbers match the app's data layer)
-- ============================================================================

UPDATE series s SET total_views = t.total_views
FROM (VALUES
  (deterministic_uuid('s_lastkingdom'),   4860000),
  (deterministic_uuid('s_totssavanna'),   2140000),
  (deterministic_uuid('s_omegaprincess'), 3720000),
  (deterministic_uuid('s_silencedstones'), 890000),
  (deterministic_uuid('s_ghostsashanti'), 2890000),
  (deterministic_uuid('s_teranga'),       1650000),
  (deterministic_uuid('s_nileaffair'),    2040000),
  (deterministic_uuid('s_zulu'),          1280000),
  (deterministic_uuid('s_matatu'),        1760000),
  (deterministic_uuid('s_medina'),         985000)
) AS t(id, total_views)
WHERE s.id = t.id;

-- ============================================================================
-- SEED: POINT WALLETS + TRANSACTIONS (demo spenders)
-- ============================================================================

INSERT INTO point_wallets (user_id, balance, lifetime_points) VALUES
  (deterministic_uuid('u_me'),   100, 150),
  (deterministic_uuid('u_demo'),  0,  50),
  (deterministic_uuid('u_test'), 300, 1000)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO point_transactions (user_id, type, amount, description, reference, status, completed_at) VALUES
  (deterministic_uuid('u_me'),   'bonus',   150, 'Welcome points',            'welcome_amara',      'success', NOW() - INTERVAL '7 days'),
  (deterministic_uuid('u_me'),   'unlock',  -50, 'Unlocked "The Forbidden Forest"', 'unlock_e_lk_s1e2', 'success', NOW() - INTERVAL '5 days'),
  (deterministic_uuid('u_demo'), 'bonus',    50, 'Welcome points',            'welcome_demo',       'success', NOW() - INTERVAL '10 days'),
  (deterministic_uuid('u_demo'), 'unlock',  -50, 'Unlocked "The Gilded Drum"','unlock_e_ga_s1e2',  'success', NOW() - INTERVAL '4 days'),
  (deterministic_uuid('u_test'), 'purchase',500, 'Purchased 500 points package (with bonus)', 'pay_test_001', 'success', NOW() - INTERVAL '2 days'),
  (deterministic_uuid('u_test'), 'bonus',    50, 'Purchase bonus',            'pay_test_001_bonus', 'success', NOW() - INTERVAL '2 days');

-- ============================================================================
-- SEED: CREATOR EARNINGS (populates creator dashboards)
-- ============================================================================

INSERT INTO creator_earnings (creator_id, video_id, episode_id, amount, unlocked_by, platform_commission, net_earnings)
SELECT cp.id, v.id, e.id, 50, deterministic_uuid('u_demo'), 30.00, (50 * 70 / 100) * 10
FROM creator_profiles cp
JOIN videos v ON v.id = deterministic_uuid('v_lk_s1e2')
JOIN episodes e ON e.video_id = v.id
WHERE cp.id = deterministic_uuid('c_chiefuwa')
ON CONFLICT DO NOTHING;

INSERT INTO creator_earnings (creator_id, video_id, episode_id, amount, unlocked_by, platform_commission, net_earnings)
SELECT cp.id, v.id, e.id, 50, deterministic_uuid('u_me'), 30.00, (50 * 70 / 100) * 10
FROM creator_profiles cp
JOIN videos v ON v.id = deterministic_uuid('v_ga_s1e2')
JOIN episodes e ON e.video_id = v.id
WHERE cp.id = deterministic_uuid('c_kofi')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED: SOCIAL DATA (demo viewer activity)
-- ============================================================================

INSERT INTO video_likes (user_id, video_id)
SELECT deterministic_uuid('u_me'), id FROM videos WHERE id IN (
  deterministic_uuid('v_hero_lastkingdom'),
  deterministic_uuid('v_ga_s1e1'),
  deterministic_uuid('v_ani_tobi'),
  deterministic_uuid('v_swahili_coast'),
  deterministic_uuid('v_op_s1e1'),
  deterministic_uuid('v_matatu_54')
) ON CONFLICT DO NOTHING;

INSERT INTO follows (follower_id, followee_id, followee_type)
VALUES
  (deterministic_uuid('u_me'), deterministic_uuid('c_chiefuwa'), 'creator'),
  (deterministic_uuid('u_me'), deterministic_uuid('c_kofi'),     'creator'),
  (deterministic_uuid('u_me'), deterministic_uuid('c_tobi'),     'creator'),
  (deterministic_uuid('u_me'), deterministic_uuid('c_nala'),     'creator'),
  (deterministic_uuid('u_me'), deterministic_uuid('s_lastkingdom'), 'series'),
  (deterministic_uuid('u_me'), deterministic_uuid('s_ghostsashanti'), 'series'),
  (deterministic_uuid('u_demo'), deterministic_uuid('s_lastkingdom'), 'series')
ON CONFLICT DO NOTHING;

INSERT INTO watch_history (user_id, video_id, episode_id, progress, completed, watch_time, watched_at) VALUES
  (deterministic_uuid('u_me'), deterministic_uuid('v_hero_lastkingdom'), deterministic_uuid('e_lk_s1e1'), 100, TRUE, 1850, NOW() - INTERVAL '3 days'),
  (deterministic_uuid('u_me'), deterministic_uuid('v_ga_s1e1'),         deterministic_uuid('e_ga_s1e1'), 100, TRUE, 1150, NOW() - INTERVAL '2 days'),
  (deterministic_uuid('u_me'), deterministic_uuid('v_ani_tobi'),        NULL,                           100, TRUE, 132,  NOW() - INTERVAL '1 day'),
  (deterministic_uuid('u_me'), deterministic_uuid('v_swahili_coast'),   NULL,                            45, FALSE, 700, NOW() - INTERVAL '6 hours'),
  (deterministic_uuid('u_me'), deterministic_uuid('v_zulu_thunder'),    NULL,                            15, FALSE, 250, NOW() - INTERVAL '2 hours')
ON CONFLICT (user_id, video_id) DO UPDATE SET progress = EXCLUDED.progress, completed = EXCLUDED.completed, watched_at = EXCLUDED.watched_at;

INSERT INTO watchlist (user_id, video_id)
VALUES
  (deterministic_uuid('u_me'), deterministic_uuid('v_op_s1e1')),
  (deterministic_uuid('u_me'), deterministic_uuid('v_matatu_54'))
ON CONFLICT DO NOTHING;

INSERT INTO comments (video_id, episode_id, user_id, user_display_name, user_avatar, text, likes_count, created_at) VALUES
  (deterministic_uuid('v_hero_lastkingdom'), NULL, deterministic_uuid('u_chiefuwa'), 'Chief Uwa Folktales', '/avatars/chiefuwa.png',
   'The birthmark scene gave me chills! Wait till you see S2. 👑', 128, NOW() - INTERVAL '2 days'),
  (deterministic_uuid('v_hero_lastkingdom'), NULL, deterministic_uuid('u_demo'), 'Demo Viewer', NULL,
   'Which tribe inspired the Forbidden Forest? I need the lore.', 45, NOW() - INTERVAL '1 day'),
  (deterministic_uuid('v_hero_lastkingdom'), NULL, deterministic_uuid('u_nala'), 'Nala Laughs', '/avatars/nala.png',
   'Adaeze is THAT girl. Animation quality is unreal.', 33, NOW() - INTERVAL '20 hours'),
  (deterministic_uuid('v_ga_s1e1'), NULL, deterministic_uuid('u_me'), 'Amara Okafor', '/avatars/amara.png',
   'Tell me why I yelled at my phone when the canoe turned around 😭', 2140, NOW() - INTERVAL '1 day');

INSERT INTO comment_likes (user_id, comment_id)
SELECT deterministic_uuid('u_me'), id FROM comments WHERE text LIKE '%chills%' OR text LIKE '%turned around%'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED: NOTIFICATIONS
-- ============================================================================

INSERT INTO notifications (user_id, type, title, message, image, link, read, created_at) VALUES
  (deterministic_uuid('u_me'), 'new_episode', 'New Episode Available',
   'The Last Kingdom S2 E2 — "The Brothers'' Betrayal" is now live.',
   'https://images.unsplash.com/photo-1489674267075-cee793167910?w=200&q=80', '/watch/v_lk_s2e2', FALSE, NOW() - INTERVAL '6 hours'),
  (deterministic_uuid('u_me'), 'series_release', 'Series Release',
   'Kofi Horror just launched "Ghosts of the Ashanti" Season 2.',
   'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&q=80', '/series/s_ghostsashanti', FALSE, NOW() - INTERVAL '2 days'),
  (deterministic_uuid('u_me'), 'comment', 'New Comment',
   'Ada replied to your comment on The Last Kingdom.', '', '/watch/v_hero_lastkingdom', FALSE, NOW() - INTERVAL '2 days'),
  (deterministic_uuid('u_me'), 'like', 'Likes You Got',
   'Your comment on The Red Canoe received 43 new likes.',
   'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=80', '/watch/v_redcanoe', TRUE, NOW() - INTERVAL '3 days'),
  (deterministic_uuid('u_me'), 'follow', 'New Follower',
   'Zanele Talks followed you.', '', '/creator/c_zanele', TRUE, NOW() - INTERVAL '4 days'),
  (deterministic_uuid('u_me'), 'unlock', 'Episode Unlocked',
   'You unlocked "The Forbidden Forest" (50 points deducted).',
   'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=80', '/watch/v_lk_s1e2', TRUE, NOW() - INTERVAL '5 days'),
  (deterministic_uuid('u_me'), 'system', 'Welcome to Aafstories',
   'You earned 150 welcome points. Spend them on any premium story!', '', '/wallet', FALSE, NOW() - INTERVAL '7 days'),
  (deterministic_uuid('u_chiefuwa'), 'unlock', 'Episode Unlocked',
   'A viewer unlocked "The Ascension" — 100 points earned.',
   'https://images.unsplash.com/photo-1519802157191-8e14a5d39d2c?w=200&q=80', NULL, FALSE, NOW() - INTERVAL '7 hours'),
  (deterministic_uuid('u_chiefuwa'), 'earnings', 'Earnings Update',
   'Your payout of ₦120,500 has been scheduled.', '', NULL, FALSE, NOW() - INTERVAL '1 day'),
  (deterministic_uuid('u_chiefuwa'), 'comment', 'New Comment',
   'Ada commented: "The birthmark scene gave me chills!"',
   'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=200&q=80', '/watch/v_hero_lastkingdom', TRUE, NOW() - INTERVAL '2 days'),
  (deterministic_uuid('u_chiefuwa'), 'follow', 'Followers',
   'Your creator page gained 1,240 followers this week.', '', NULL, TRUE, NOW() - INTERVAL '2 days');

-- ============================================================================
-- SEED: SEARCH INDEX (built from the seeded tables)
-- ============================================================================

INSERT INTO search_index (entity_type, entity_id, title, description, tags, genre, creator_name, country, language)
SELECT 'series', s.id, s.title, s.description, NULL, s.genre, cp.display_name, s.country, s.language
FROM series s JOIN creator_profiles cp ON cp.id = s.creator_id
ON CONFLICT (entity_type, entity_id) DO NOTHING;

INSERT INTO search_index (entity_type, entity_id, title, description, tags, genre, creator_name, country, language)
SELECT 'video', v.id, v.title, v.description, v.tags, v.genre, cp.display_name, v.country, v.language
FROM videos v JOIN creator_profiles cp ON cp.id = v.creator_id
ON CONFLICT (entity_type, entity_id) DO NOTHING;

INSERT INTO search_index (entity_type, entity_id, title, description, tags, genre, creator_name, country, language)
SELECT 'creator', cp.id, cp.display_name, cp.bio, NULL, cp.categories, cp.display_name, cp.country, NULL
FROM creator_profiles cp
ON CONFLICT (entity_type, entity_id) DO NOTHING;

-- ============================================================================
-- SEED: ANALYTICS (last 7 days of deterministic daily rows)
-- ============================================================================

INSERT INTO video_analytics_daily (video_id, date, views, watch_time_seconds, likes, shares, completions, revenue_points)
SELECT v.id, d, 1000 + (('x' || substr(md5(v.id || d::text), 1, 5))::bit(20)::int % 9000),
  (1000 + (('x' || substr(md5(v.id || d::text), 1, 5))::bit(20)::int % 9000)) * v.duration / 3,
  500 + (('x' || substr(md5(v.id || d::text), 6, 5))::bit(20)::int % 500),
  200 + (('x' || substr(md5(v.id || d::text), 11, 5))::bit(20)::int % 800),
  20 + (('x' || substr(md5(v.id || d::text), 16, 5))::bit(20)::int % 40),
  CASE WHEN v.monetization = 'premium' THEN 100 + (('x' || substr(md5(v.id || d::text), 21, 5))::bit(20)::int % 300) ELSE 0 END
FROM videos v
CROSS JOIN generate_series(CURRENT_DATE - 7, CURRENT_DATE - 1, INTERVAL '1 day') AS d
WHERE v.status = 'published'
ON CONFLICT (video_id, date) DO NOTHING;

INSERT INTO creator_analytics_daily (creator_id, date, views, watch_time_seconds, likes, shares, new_followers, revenue_points, revenue_ngn)
SELECT cp.id, d, 3000 + (('x' || substr(md5(cp.id || d::text), 1, 5))::bit(20)::int % 20000),
  (3000 + (('x' || substr(md5(cp.id || d::text), 1, 5))::bit(20)::int % 20000)) * 1200,
  1000 + (('x' || substr(md5(cp.id || d::text), 6, 5))::bit(20)::int % 4000),
  400 + (('x' || substr(md5(cp.id || d::text), 11, 5))::bit(20)::int % 1500),
  50 + (('x' || substr(md5(cp.id || d::text), 16, 5))::bit(20)::int % 300),
  500 + (('x' || substr(md5(cp.id || d::text), 21, 5))::bit(20)::int % 2000),
  (500 + (('x' || substr(md5(cp.id || d::text), 21, 5))::bit(20)::int % 2000)) * 60
FROM creator_profiles cp
CROSS JOIN generate_series(CURRENT_DATE - 7, CURRENT_DATE - 1, INTERVAL '1 day') AS d
WHERE cp.status = 'approved'
ON CONFLICT (creator_id, date) DO NOTHING;

-- ============================================================================
-- COMPLETION
-- ============================================================================

COMMENT ON FUNCTION deterministic_uuid(TEXT) IS 'Maps a stable text id to a deterministic UUID for repeatable seeding.';