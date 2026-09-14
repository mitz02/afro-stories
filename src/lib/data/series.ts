import type { Episode, Season, Series } from "@/types";

export const series: Series[] = [
  // ============ THE LAST KINGDOM ============
  {
    id: "s_lastkingdom",
    slug: "the-last-kingdom",
    title: "The Last Kingdom",
    description:
      "A young warrior discovers that his bloodline carries an ancient power capable of saving — or destroying — his kingdom. An epic African fantasy spanning kingdoms, spirits, and destiny.",
    coverImage:
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1600&q=80",
    coverGradient: "from-amber-500/30 via-purple-900/40 to-black",
    creatorId: "c_chiefuwa",
    country: "NG",
    genre: ["Fantasy", "Adventure", "African Legends"],
    language: "English",
    ageRating: "16+",
    status: "published",
    totalViews: 4860000,
    totalLikes: 328000,
    followers: 268000,
    featured: true,
    completed: true,
    averageEpisodeDuration: 1850,
    monetization: "premium",
    seasons: [
      {
        id: "s1_lastkingdom",
        seriesId: "s_lastkingdom",
        seasonNumber: 1,
        title: "Season 1",
        description:
          "The prophecy awakens as Adaeze, a blacksmith's daughter, discovers the blood of kings flows in her veins.",
        episodeCount: 6,
      },
      {
        id: "s2_lastkingdom",
        seriesId: "s_lastkingdom",
        seasonNumber: 2,
        title: "Season 2",
        description:
          "The kingdom fractures as old alliances crumble and the shadow from the north grows stronger.",
        episodeCount: 6,
      },
    ],
    createdAt: "2024-01-10",
    updatedAt: "2025-08-22",
  },

  // ============ TALES OF THE SAVANNA ============
  {
    id: "s_totssavanna",
    slug: "tales-of-the-savanna",
    title: "Tales of the Savanna",
    description:
      "Beautifully animated folktales from the grasslands of East Africa. Each episode is a window into a different tribe's wisdom, humor, and magic.",
    coverImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    coverGradient: "from-emerald-500/30 via-teal-900/40 to-black",
    creatorId: "c_nyandwi",
    country: "RW",
    genre: ["Kids", "Animation", "Folklore"],
    language: "English",
    ageRating: "G",
    status: "published",
    totalViews: 2140000,
    totalLikes: 198000,
    followers: 89000,
    featured: false,
    completed: false,
    averageEpisodeDuration: 720,
    monetization: "free",
    seasons: [
      {
        id: "s1_tots",
        seriesId: "s_totssavanna",
        seasonNumber: 1,
        title: "Season 1",
        description: "Twelve tales from the heart of the savanna.",
        episodeCount: 12,
      },
    ],
    createdAt: "2024-04-02",
    updatedAt: "2025-09-01",
  },

  // ============ THE OMEGA PRINCESS ============
  {
    id: "s_omegaprincess",
    slug: "the-omega-princess",
    title: "The Omega Princess",
    description:
      "In the floating city of Lagos 2075, Princess Amara — last heir of a tech dynasty — must decide whether to save her people as a machine or as a human.",
    coverImage:
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1600&q=80",
    coverGradient: "from-cyan-500/30 via-violet-900/40 to-black",
    creatorId: "c_tobi",
    country: "NG",
    genre: ["Sci-Fi", "AI Stories", "Animation"],
    language: "English",
    ageRating: "12+",
    status: "published",
    totalViews: 3720000,
    totalLikes: 245000,
    followers: 156000,
    featured: true,
    completed: false,
    averageEpisodeDuration: 1350,
    monetization: "premium",
    seasons: [
      {
        id: "s1_omega",
        seriesId: "s_omegaprincess",
        seasonNumber: 1,
        title: "Season 1",
        description: "Five episodes of Lagos 2075.",
        episodeCount: 5,
      },
      {
        id: "s2_omega",
        seriesId: "s_omegaprincess",
        seasonNumber: 2,
        title: "Season 2",
        description: "The uprising.",
        episodeCount: 5,
      },
    ],
    createdAt: "2024-06-15",
    updatedAt: "2025-08-30",
  },

  // ============ SILENCED STONES ============
  {
    id: "s_silencedstones",
    slug: "silenced-stones",
    title: "Silenced Stones",
    description:
      "A documentary series tracing the untold histories carved into West Africa's ancient monuments and ruins. Where archaeology meets myth.",
    coverImage:
      "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=1600&q=80",
    coverGradient: "from-amber-700/40 via-stone-900/40 to-black",
    creatorId: "c_kwame",
    country: "GH",
    genre: ["Documentary", "History"],
    language: "English",
    ageRating: "PG",
    status: "published",
    totalViews: 890000,
    totalLikes: 54000,
    followers: 23000,
    featured: false,
    completed: true,
    averageEpisodeDuration: 2400,
    monetization: "free",
    seasons: [
      {
        id: "s1_stones",
        seriesId: "s_silencedstones",
        seasonNumber: 1,
        title: "Season 1",
        description: "Ghosts of the Sahel.",
        episodeCount: 4,
      },
    ],
    createdAt: "2024-09-01",
    updatedAt: "2025-07-20",
  },

  // ============ GHOSTS OF THE ASHANTI ============
  {
    id: "s_ghostsashanti",
    slug: "ghosts-of-the-ashanti",
    title: "Ghosts of the Ashanti",
    description:
      "Kofi Horror revisits the bone-chilling stories whispered in Kumasi after dark. Ghosts, curses, and the spirits that refuse to rest.",
    coverImage:
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1600&q=80",
    coverGradient: "from-red-900/40 via-black to-black",
    creatorId: "c_kofi",
    country: "GH",
    genre: ["Horror", "Folklore", "African Legends"],
    language: "English",
    ageRating: "16+",
    status: "published",
    totalViews: 2890000,
    totalLikes: 176000,
    followers: 98000,
    featured: true,
    completed: false,
    averageEpisodeDuration: 1080,
    monetization: "premium",
    seasons: [
      {
        id: "s1_ghosts",
        seriesId: "s_ghostsashanti",
        seasonNumber: 1,
        title: "Season 1",
        description: "Eight terrifying legends.",
        episodeCount: 8,
      },
      {
        id: "s2_ghosts",
        seriesId: "s_ghostsashanti",
        seasonNumber: 2,
        title: "Season 2",
        description: "The curse deepens.",
        episodeCount: 8,
      },
    ],
    createdAt: "2024-02-20",
    updatedAt: "2025-09-04",
  },

  // ============ TERANGA ============
  {
    id: "s_teranga",
    slug: "teranga",
    title: "Teranga",
    description:
      "From Dakar to Toronto, a Senegalese chef carries the concept of Teranga — sacred hospitality — across continents. A heartwarming African drama.",
    coverImage:
      "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=1600&q=80",
    coverGradient: "from-orange-500/30 via-purple-900/40 to-black",
    creatorId: "c_aida",
    country: "SN",
    genre: ["Drama", "Romance"],
    language: "French",
    ageRating: "PG",
    status: "published",
    totalViews: 1650000,
    totalLikes: 124000,
    followers: 45000,
    featured: false,
    completed: false,
    averageEpisodeDuration: 1580,
    monetization: "free",
    seasons: [
      {
        id: "s1_teranga",
        seriesId: "s_teranga",
        seasonNumber: 1,
        title: "Season 1",
        description: "Dakar.",
        episodeCount: 6,
      },
    ],
    createdAt: "2024-07-10",
    updatedAt: "2025-08-15",
  },

  // ============ THE NILE AFFAIR ============
  {
    id: "s_nileaffair",
    slug: "the-nile-affair",
    title: "The Nile Affair",
    description:
      "Cairo. 1923. An archaeologist, a singer, and a secret that the sands kept for three thousand years. A premium period romance.",
    coverImage:
      "https://images.unsplash.com/photo-1539650116574-5798617ca30b?w=1600&q=80",
    coverGradient: "from-amber-600/30 via-stone-900/40 to-black",
    creatorId: "c_amina",
    country: "EG",
    genre: ["Romance", "Drama", "History"],
    language: "Arabic",
    ageRating: "12+",
    status: "published",
    totalViews: 2040000,
    totalLikes: 158000,
    followers: 67000,
    featured: false,
    completed: true,
    averageEpisodeDuration: 2120,
    monetization: "premium",
    seasons: [
      {
        id: "s1_nile",
        seriesId: "s_nileaffair",
        seasonNumber: 1,
        title: "Season 1",
        description: "The dig begins.",
        episodeCount: 6,
      },
    ],
    createdAt: "2024-03-01",
    updatedAt: "2025-06-30",
  },

  // ============ LEGENDS OF ZULULAND ============
  {
    id: "s_zulu",
    slug: "legends-of-zulu",
    title: "Legends of Zululand",
    description:
      "Mythology from beneath Table Mountain to the Kingdom of the Zulu. Ancient gods, heroes, and the storms they rode.",
    coverImage:
      "https://images.unsplash.com/photo-1523428006214-e6b6691d35ff?w=1600&q=80",
    coverGradient: "from-rose-800/40 via-black to-black",
    creatorId: "c_zanele",
    country: "ZA",
    genre: ["Mythology", "Fantasy", "African Legends"],
    language: "English",
    ageRating: "12+",
    status: "published",
    totalViews: 1280000,
    totalLikes: 92000,
    followers: 34000,
    featured: false,
    completed: false,
    averageEpisodeDuration: 1250,
    monetization: "free",
    seasons: [
      {
        id: "s1_zulu",
        seriesId: "s_zulu",
        seasonNumber: 1,
        title: "Season 1",
        description: "Gods and warriors.",
        episodeCount: 5,
      },
    ],
    createdAt: "2024-10-01",
    updatedAt: "2025-08-28",
  },

  // ============ MATATU 54 ============
  {
    id: "s_matatu",
    slug: "matatu-54",
    title: "Matatu 54",
    description:
      "Every day on Nairobi's Route 54 is a sitcom. Ride with the crew of Matatu 54 as they navigate traffic, love triangles, and mkokoteni chaos.",
    coverImage:
      "https://images.unsplash.com/photo-1524095731963-b4e38d1b3329?w=1600&q=80",
    coverGradient: "from-blue-700/40 via-purple-900/40 to-black",
    creatorId: "c_nala",
    country: "KE",
    genre: ["Comedy", "Drama"],
    language: "Swahili",
    ageRating: "PG",
    status: "published",
    totalViews: 1760000,
    totalLikes: 134000,
    followers: 58000,
    featured: false,
    completed: false,
    averageEpisodeDuration: 780,
    monetization: "free",
    seasons: [
      {
        id: "s1_matatu",
        seriesId: "s_matatu",
        seasonNumber: 1,
        title: "Season 1",
        description: "Race against time.",
        episodeCount: 8,
      },
    ],
    createdAt: "2024-05-20",
    updatedAt: "2025-09-02",
  },

  // ============ THE MEDINA FILES ============
  {
    id: "s_medina",
    slug: "the-medina-files",
    title: "The Medina Files",
    description:
      "In Marrakesh's ancient medina, a detective with a gift for reading lies uncovers a conspiracy that reaches the highest councils of the kingdom.",
    coverImage:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1600&q=80",
    coverGradient: "from-stone-700/50 via-orange-900/40 to-black",
    creatorId: "c_ibrahim",
    country: "MA",
    genre: ["Thriller", "Drama", "Mystery"],
    language: "Arabic",
    ageRating: "16+",
    status: "published",
    totalViews: 985000,
    totalLikes: 72000,
    followers: 21000,
    featured: false,
    completed: true,
    averageEpisodeDuration: 2650,
    monetization: "premium",
    seasons: [
      {
        id: "s1_medina",
        seriesId: "s_medina",
        seasonNumber: 1,
        title: "Season 1",
        description: "Six episodes through the souks.",
        episodeCount: 6,
      },
    ],
    createdAt: "2024-08-05",
    updatedAt: "2025-07-10",
  },
];

export const seriesMap = new Map(series.map((s) => [s.id, s]));

export function getSeries(id: string): Series | undefined {
  return seriesMap.get(id);
}

export function getSeriesBySlug(slug: string): Series | undefined {
  return series.find((s) => s.slug === slug);
}

// ============ EPISODES ============

export const episodes: Episode[] = [
  // --- The Last Kingdom S1 ---
  {
    id: "e_lk_s1e1",
    seriesId: "s_lastkingdom",
    seasonNumber: 1,
    episodeNumber: 1,
    title: "The Prophecy",
    description:
      "When a wounded stranger arrives at the village with news of a coming war, blacksmith's daughter Adaeze discovers a birthmark that seals her fate.",
    thumbnail:
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1200&q=80",
    thumbnailGradient: "from-purple-800/60 to-black",
    videoId: "v_lk_s1e1",
    duration: 1850,
    monetization: "free",
    views: 1240000,
    likes: 91000,
    comments: 2140,
    publishedAt: "2024-01-15",
  },
  {
    id: "e_lk_s1e2",
    seriesId: "s_lastkingdom",
    seasonNumber: 1,
    episodeNumber: 2,
    title: "The Forbidden Forest",
    description:
      "To unlock her power, Adaeze must enter the Forbidden Forest — where the spirits of three fallen kings guard the secrets of her lineage.",
    thumbnail:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80",
    thumbnailGradient: "from-emerald-900/60 to-black",
    videoId: "v_lk_s1e2",
    duration: 1900,
    monetization: "premium",
    unlockPrice: 50,
    views: 982000,
    likes: 64200,
    comments: 1380,
    publishedAt: "2024-01-22",
  },
  {
    id: "e_lk_s1e3",
    seriesId: "s_lastkingdom",
    seasonNumber: 1,
    episodeNumber: 3,
    title: "The Warrior",
    description:
      "Adaeze takes her first command in the night battle of Ossi River. Some say a queen was born that evening.",
    thumbnail:
      "https://images.unsplash.com/photo-1470784869199-0bf6c4c1b2b1?w=1200&q=80",
    thumbnailGradient: "from-orange-800/60 to-black",
    videoId: "v_lk_s1e3",
    duration: 1780,
    monetization: "premium",
    unlockPrice: 50,
    views: 873000,
    likes: 55100,
    comments: 1105,
    publishedAt: "2024-01-29",
  },
  {
    id: "e_lk_s1e4",
    seriesId: "s_lastkingdom",
    seasonNumber: 1,
    episodeNumber: 4,
    title: "The Return",
    description:
      "The usurper has claimed the throne. Adaeze returns not to beg — but to take back what was stolen.",
    thumbnail:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80",
    thumbnailGradient: "from-red-900/60 to-black",
    videoId: "v_lk_s1e4",
    duration: 1940,
    monetization: "premium",
    unlockPrice: 75,
    views: 795000,
    likes: 48000,
    comments: 980,
    publishedAt: "2024-02-05",
  },
  {
    id: "e_lk_s1e5",
    seriesId: "s_lastkingdom",
    seasonNumber: 1,
    episodeNumber: 5,
    title: "The Alliance",
    description:
      "Ancient enemies become uneasy allies as the northern shadow spreads. Adaeze must choose who to trust.",
    thumbnail:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80",
    thumbnailGradient: "from-sky-900/60 to-black",
    videoId: "v_lk_s1e5",
    duration: 1820,
    monetization: "premium",
    unlockPrice: 50,
    views: 712000,
    likes: 41000,
    comments: 823,
    publishedAt: "2024-02-12",
  },
  {
    id: "e_lk_s1e6",
    seriesId: "s_lastkingdom",
    seasonNumber: 1,
    episodeNumber: 6,
    title: "The Ascension",
    description:
      "The final battle for the kingdom. A crown of fire or a funeral pyre — Adaeze decides which one the night will bring.",
    thumbnail:
      "https://images.unsplash.com/photo-1519802157191-8e14a5d39d2c?w=1200&q=80",
    thumbnailGradient: "from-amber-700/60 to-black",
    videoId: "v_lk_s1e6",
    duration: 2200,
    monetization: "premium",
    unlockPrice: 100,
    views: 968000,
    likes: 83000,
    comments: 2100,
    publishedAt: "2024-02-19",
  },

  // --- The Last Kingdom S2 ---
  {
    id: "e_lk_s2e1",
    seriesId: "s_lastkingdom",
    seasonNumber: 2,
    episodeNumber: 1,
    title: "The Queen's Decision",
    description:
      "Six months after the ascension, Adaeze rules over a divided kingdom. But a letter from the north changes everything.",
    thumbnail:
      "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=1200&q=80",
    thumbnailGradient: "from-purple-900/60 to-black",
    videoId: "v_lk_s2e1",
    duration: 1880,
    monetization: "premium",
    unlockPrice: 100,
    views: 690000,
    likes: 38900,
    comments: 742,
    publishedAt: "2025-08-22",
  },
  {
    id: "e_lk_s2e2",
    seriesId: "s_lastkingdom",
    seasonNumber: 2,
    episodeNumber: 2,
    title: "The Brothers' Betrayal",
    description:
      "The twin princes of the northern provinces stage a coup. Adaeze's most trusted generals walk into the trap.",
    thumbnail:
      "https://images.unsplash.com/photo-1489674267075-cee793167910?w=1200&q=80",
    thumbnailGradient: "from-red-800/60 to-black",
    videoId: "v_lk_s2e2",
    duration: 1750,
    monetization: "premium",
    unlockPrice: 100,
    views: 512000,
    likes: 28000,
    comments: 510,
    publishedAt: "2025-08-29",
  },

  // --- Tales of the Savanna ---
  {
    id: "e_tots_s1e1",
    seriesId: "s_totssavanna",
    seasonNumber: 1,
    episodeNumber: 1,
    title: "How the Baobab Got Its Shape",
    description:
      "A curious aardvark challenges the sky god to a dance contest — and the baobab tree never forgets what happened.",
    thumbnail:
      "https://images.unsplash.com/photo-1523633589114-88eaf4b4f1a8?w=1200&q=80",
    thumbnailGradient: "from-emerald-700/50 to-black",
    videoId: "v_tots_s1e1",
    duration: 720,
    monetization: "free",
    views: 418000,
    likes: 39200,
    comments: 610,
    publishedAt: "2024-04-08",
  },
  {
    id: "e_tots_s1e2",
    seriesId: "s_totssavanna",
    seasonNumber: 1,
    episodeNumber: 2,
    title: "The Greedy Crocodile",
    description:
      "Mamba the crocodile thinks he owns the whole river. The kingfisher teaches him a lesson about sharing.",
    thumbnail:
      "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=1200&q=80",
    thumbnailGradient: "from-teal-800/50 to-black",
    videoId: "v_tots_s1e2",
    duration: 690,
    monetization: "free",
    views: 356000,
    likes: 30400,
    comments: 445,
    publishedAt: "2024-04-15",
  },
  {
    id: "e_tots_s1e3",
    seriesId: "s_totssavanna",
    seasonNumber: 1,
    episodeNumber: 3,
    title: "Why the Moon Follows the Sun",
    description:
      "The story of two star-crossed spirits whose love created night and day across the savanna skies.",
    thumbnail:
      "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&q=80",
    thumbnailGradient: "from-indigo-800/60 to-black",
    videoId: "v_tots_s1e3",
    duration: 745,
    monetization: "free",
    views: 389000,
    likes: 35700,
    comments: 502,
    publishedAt: "2024-04-22",
  },

  // --- Ghosts of the Ashanti ---
  {
    id: "e_ga_s1e1",
    seriesId: "s_ghostsashanti",
    seasonNumber: 1,
    episodeNumber: 1,
    title: "The Red Canoe",
    description:
      "The most whispered story in Kumasi: the fisherman who was promised gold and came back with something else.",
    thumbnail:
      "https://images.unsplash.com/photo-1508776982115-11f8a0e0b4a1?w=1200&q=80",
    thumbnailGradient: "from-slate-900/70 to-black",
    videoId: "v_ga_s1e1",
    duration: 1150,
    monetization: "free",
    views: 884000,
    likes: 62000,
    comments: 1840,
    publishedAt: "2024-03-01",
  },
  {
    id: "e_ga_s1e2",
    seriesId: "s_ghostsashanti",
    seasonNumber: 1,
    episodeNumber: 2,
    title: "The Gilded Drum",
    description:
      "A royal drummer finds a golden drum at the riverbank. Every beat tells a warning he can't ignore.",
    thumbnail:
      "https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=1200&q=80",
    thumbnailGradient: "from-amber-900/50 to-black",
    videoId: "v_ga_s1e2",
    duration: 1080,
    monetization: "premium",
    unlockPrice: 50,
    views: 742000,
    likes: 49000,
    comments: 1210,
    publishedAt: "2024-03-08",
  },
  {
    id: "e_ga_s1e3",
    seriesId: "s_ghostsashanti",
    seasonNumber: 1,
    episodeNumber: 3,
    title: "The One Who Returned",
    description:
      "Fifty years after his funeral, the village elder walks home for his yam festival. He says he's not done with his stories.",
    thumbnail:
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&q=80",
    thumbnailGradient: "from-purple-950/60 to-black",
    videoId: "v_ga_s1e3",
    duration: 1215,
    monetization: "premium",
    unlockPrice: 50,
    views: 668000,
    likes: 41300,
    comments: 980,
    publishedAt: "2024-03-15",
  },

  // --- The Omega Princess ---
  {
    id: "e_op_s1e1",
    seriesId: "s_omegaprincess",
    seasonNumber: 1,
    episodeNumber: 1,
    title: "Neural Lagos",
    description:
      "Eko City 2075. Amara eyes are sockets of light, and half of Lagos runs on the code in her blood.",
    thumbnail:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
    thumbnailGradient: "from-violet-900/60 to-black",
    videoId: "v_op_s1e1",
    duration: 1380,
    monetization: "free",
    views: 1120000,
    likes: 86000,
    comments: 2310,
    publishedAt: "2024-06-20",
  },
  {
    id: "e_op_s1e2",
    seriesId: "s_omegaprincess",
    seasonNumber: 1,
    episodeNumber: 2,
    title: "The Overnight Uprising",
    description:
      "When the drones stop obeying the corporation, everyone in the floating city wants to know: who is the Omega Princess?",
    thumbnail:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    thumbnailGradient: "from-cyan-900/60 to-black",
    videoId: "v_op_s1e2",
    duration: 1420,
    monetization: "premium",
    unlockPrice: 50,
    views: 932000,
    likes: 68000,
    comments: 1740,
    publishedAt: "2024-06-27",
  },
  {
    id: "e_op_s1e3",
    seriesId: "s_omegaprincess",
    seasonNumber: 1,
    episodeNumber: 3,
    title: "Blood and Binary",
    description:
      "Amara discovers her own neural code was written by the machine she's been fighting — and her father is the author.",
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80",
    thumbnailGradient: "from-fuchsia-900/60 to-black",
    videoId: "v_op_s1e3",
    duration: 1360,
    monetization: "premium",
    unlockPrice: 50,
    views: 812000,
    likes: 58900,
    comments: 1450,
    publishedAt: "2024-07-04",
  },

  // --- Silenced Stones ---
  {
    id: "e_ss_s1e1",
    seriesId: "s_silencedstones",
    seasonNumber: 1,
    episodeNumber: 1,
    title: "The Walls of the Sahel",
    description:
      "Journey north to the forgotten citadels that protected West African learning for a thousand years.",
    thumbnail:
      "https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?w=1200&q=80",
    thumbnailGradient: "from-yellow-800/50 to-black",
    videoId: "v_ss_s1e1",
    duration: 2480,
    monetization: "free",
    views: 342000,
    likes: 21800,
    comments: 380,
    publishedAt: "2024-09-10",
  },
  {
    id: "e_ss_s1e2",
    seriesId: "s_silencedstones",
    seasonNumber: 1,
    episodeNumber: 2,
    title: "The Kingdom Beneath the Lake",
    description:
      "When Lake Volta rose in the 1960s, it swallowed towns whole. Divers search for what survived beneath the water.",
    thumbnail:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80",
    thumbnailGradient: "from-sky-900/50 to-black",
    videoId: "v_ss_s1e2",
    duration: 2300,
    monetization: "free",
    views: 296000,
    likes: 18400,
    comments: 302,
    publishedAt: "2024-09-17",
  },

  // --- Teranga ---
  {
    id: "e_tg_s1e1",
    seriesId: "s_teranga",
    seasonNumber: 1,
    episodeNumber: 1,
    title: "Dakar, Season One, Bissap",
    description:
      "Aminata wakes before the sun to set up her grandmother's bissap stall — and her phone keeps buzzing with the news that changes her future.",
    thumbnail:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
    thumbnailGradient: "from-orange-800/50 to-black",
    videoId: "v_tg_s1e1",
    duration: 1610,
    monetization: "free",
    views: 482000,
    likes: 35600,
    comments: 620,
    publishedAt: "2024-07-15",
  },
  {
    id: "e_tg_s1e2",
    seriesId: "s_teranga",
    seasonNumber: 1,
    episodeNumber: 2,
    title: "The Passport",
    description:
      "A visa interview at the Canadian embassy. Aminata carries a thermos of bissap because in her family, you never visit empty-handed.",
    thumbnail:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80",
    thumbnailGradient: "from-indigo-800/50 to-black",
    videoId: "v_tg_s1e2",
    duration: 1730,
    monetization: "free",
    views: 398000,
    likes: 28700,
    comments: 480,
    publishedAt: "2024-07-22",
  },
];

export const episodeMap = new Map(episodes.map((e) => [e.id, e]));

export function getEpisode(id: string): Episode | undefined {
  return episodeMap.get(id);
}

export function getEpisodesForSeries(seriesId: string, seasonNumber?: number): Episode[] {
  const eps = episodes.filter((e) => e.seriesId === seriesId);
  return seasonNumber ? eps.filter((e) => e.seasonNumber === seasonNumber) : eps;
}

export function getSeasonsForSeries(seriesId: string): Season[] {
  return seriesMap.get(seriesId)?.seasons ?? [];
}

export function getNextEpisode(seriesId: string, currentSeason: number, currentEpisode: number): Episode | undefined {
  const eps = getEpisodesForSeries(seriesId);
  return eps.find(
    (e) =>
      e.seasonNumber === currentSeason && e.episodeNumber === currentEpisode + 1
  ) ?? eps.find((e) => e.seasonNumber === currentSeason + 1 && e.episodeNumber === 1);
}