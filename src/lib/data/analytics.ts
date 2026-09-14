import type {
  AnalyticsOverview,
  RetentionPoint,
  TopCountry,
  TopVideo,
  TrendPoint,
} from "@/types";

export const analyticsOverview: AnalyticsOverview = {
  totalViews: 12840000,
  watchTimeHours: 842000,
  followersCount: 84200,
  likesCount: 1280000,
  sharesCount: 284000,
  revenue: 1284000,
  viewsChange: 18.4,
  watchTimeChange: 12.1,
  followersChange: 8.7,
  revenueChange: 22.3,
};

export const viewsTrend: TrendPoint[] = [
  { label: "Week 1", value: 184000 },
  { label: "Week 2", value: 214000 },
  { label: "Week 3", value: 198000 },
  { label: "Week 4", value: 246000 },
  { label: "Week 5", value: 312000 },
  { label: "Week 6", value: 289000 },
  { label: "Week 7", value: 354000 },
  { label: "Week 8", value: 428000 },
];

export const watchTimeTrend: TrendPoint[] = [
  { label: "Week 1", value: 1.2 },
  { label: "Week 2", value: 1.5 },
  { label: "Week 3", value: 1.4 },
  { label: "Week 4", value: 1.8 },
  { label: "Week 5", value: 2.1 },
  { label: "Week 6", value: 1.9 },
  { label: "Week 7", value: 2.4 },
  { label: "Week 8", value: 2.8 },
];

export const revenueTrend: TrendPoint[] = [
  { label: "May", value: 82000 },
  { label: "Jun", value: 115000 },
  { label: "Jul", value: 98000 },
  { label: "Aug", value: 148000 },
  { label: "Sep", value: 192000 },
  { label: "Oct", value: 178000 },
  { label: "Nov", value: 214000 },
  { label: "Dec", value: 246000 },
];

export const retention: RetentionPoint[] = [
  { label: "0%", value: 100 },
  { label: "10%", value: 94 },
  { label: "20%", value: 88 },
  { label: "30%", value: 82 },
  { label: "40%", value: 76 },
  { label: "50%", value: 68 },
  { label: "60%", value: 57 },
  { label: "70%", value: 44 },
  { label: "80%", value: 31 },
  { label: "90%", value: 19 },
  { label: "100%", value: 9 },
];

export const topVideos: TopVideo[] = [
  {
    id: "v_hero_lastkingdom",
    title: "The Last Kingdom — The Prophecy",
    thumbnail: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=400&q=80",
    views: 1240000,
    watchTime: 180000,
    likes: 91000,
  },
  {
    id: "v_lk_s1e3",
    title: "The Last Kingdom — The Warrior",
    thumbnail: "https://images.unsplash.com/photo-1470784869199-0bf6c4c1b2b1?w=400&q=80",
    views: 873000,
    watchTime: 132000,
    likes: 55100,
  },
  {
    id: "v_lk_s1e5",
    title: "The Last Kingdom — The Alliance",
    thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=80",
    views: 712000,
    watchTime: 108000,
    likes: 41000,
  },
  {
    id: "v_lk_s1e4",
    title: "The Last Kingdom — The Return",
    thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",
    views: 795000,
    watchTime: 124000,
    likes: 48000,
  },
];

export const topCountries: TopCountry[] = [
  { code: "NG", name: "Nigeria", views: 5120000, flag: "🇳🇬" },
  { code: "GH", name: "Ghana", views: 2310000, flag: "🇬🇭" },
  { code: "KE", name: "Kenya", views: 1680000, flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", views: 1240000, flag: "🇿🇦" },
  { code: "GB", name: "United Kingdom", views: 890000, flag: "🇬🇧" },
  { code: "US", name: "United States", views: 780000, flag: "🇺🇸" },
];

export const followerGrowth: TrendPoint[] = [
  { label: "May", value: 61800 },
  { label: "Jun", value: 65400 },
  { label: "Jul", value: 69800 },
  { label: "Aug", value: 74200 },
  { label: "Sep", value: 78900 },
  { label: "Oct", value: 81200 },
  { label: "Nov", value: 83600 },
  { label: "Dec", value: 84200 },
];