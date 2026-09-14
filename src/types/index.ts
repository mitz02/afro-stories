// =============================================
// Aafstories — Core Types
// =============================================

// ---------- Users & Creators ----------

export type UserRole = "viewer" | "creator" | "admin";

export type CreatorStatus = "pending" | "approved" | "suspended" | "rejected";

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  avatarGradient?: string;
  role: UserRole;
  country: CountryCode;
  verified: boolean;
  createdAt: string;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  avatarGradient: string;
  coverImage: string;
  bio: string;
  country: CountryCode;
  city: string;
  verified: boolean;
  status: CreatorStatus;
  followers: number;
  totalViews: number;
  totalVideos: number;
  totalSeries: number;
  joinedDate: string;
  categories: string[];
  featured?: boolean;
}

// ---------- Content ----------

export type VideoType = "single" | "series" | "short";

export type ContentOrigin = "ai_generated" | "ai_assisted" | "human";

export type VisibilityStatus =
  | "draft"
  | "processing"
  | "pending_review"
  | "published"
  | "rejected"
  | "suspended";

export type MonetizationType = "free" | "premium";

export type AgeRating = "G" | "PG" | "12+" | "16+" | "18+";

export interface Video {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  thumbnailGradient?: string;
  videoUrl?: string;
  hlsUrl?: string;
  duration: number; // seconds
  type: VideoType;
  origin: ContentOrigin;
  status: VisibilityStatus;
  monetization: MonetizationType;
  unlockPrice?: number; // points
  ageRating: AgeRating;
  genre: string[];
  language: string;
  country: CountryCode;
  tags: string[];
  views: number;
  likes: number;
  shares: number;
  createdAt: string;
  publishedAt?: string;
  featured?: boolean;
  creatorId: string;
  seriesId?: string;
  episodeId?: string;
}

// ---------- Series / Seasons / Episodes ----------

export interface Episode {
  id: string;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description: string;
  thumbnail: string;
  thumbnailGradient?: string;
  videoId: string;
  duration: number;
  monetization: MonetizationType;
  unlockPrice?: number;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
}

export interface Season {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: string;
  description: string;
  episodeCount: number;
}

export interface Series {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  coverGradient?: string;
  creatorId: string;
  country: CountryCode;
  genre: string[];
  language: string;
  ageRating: AgeRating;
  status: VisibilityStatus;
  totalViews: number;
  totalLikes: number;
  followers: number;
  featured?: boolean;
  completed: boolean;
  averageEpisodeDuration: number;
  monetization: MonetizationType;
  seasons: Season[];
  createdAt: string;
  updatedAt: string;
}

// ---------- Countries ----------

export type CountryCode =
  | "NG"
  | "GH"
  | "KE"
  | "ZA"
  | "ET"
  | "TZ"
  | "UG"
  | "RW"
  | "SN"
  | "CM"
  | "ZW"
  | "ZM"
  | "EG"
  | "MA"
  | "CI"
  | "BJ"
  | "SL"
  | "MZ"
  | "AO"
  | "MW";

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
  mux?: string;
  gradient: string;
  contentCount: number;
  creatorCount: number;
}

// ---------- Social ----------

export interface Comment {
  id: string;
  videoId: string;
  episodeId?: string;
  userId: string;
  userDisplayName: string;
  userAvatar: string;
  text: string;
  likes: number;
  pinned?: boolean;
  parentId?: string;
  createdAt: string;
  replies?: Comment[];
  reported?: boolean;
}

export interface Like {
  userId: string;
  videoId: string;
  createdAt: string;
}

export interface Follow {
  followerId: string;
  followeeId: string;
  followeeType: "creator" | "series";
  createdAt: string;
}

// ---------- Watched & Watchlist ----------

export interface WatchHistory {
  videoId: string;
  userId: string;
  watchedAt: string;
  progress: number; // 0-100
  completed: boolean;
  watchTime: number;
}

export interface WatchlistItem {
  videoId: string;
  userId: string;
  addedAt: string;
}

// ---------- Wallet & Economy ----------

export interface PointPackage {
  id: string;
  points: number;
  price: number; // NGN
  popular?: boolean;
  bonus?: number;
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: "purchase" | "unlock" | "refund" | "bonus";
  amount: number;
  description: string;
  createdAt: string;
  reference?: string;
  status: "pending" | "success" | "failed";
}

export interface PointWallet {
  userId: string;
  balance: number;
  lifetimePoints: number;
  transactions: PointTransaction[];
}

// ---------- Earnings ----------

export interface CreatorEarning {
  id: string;
  creatorId: string;
  videoId: string;
  episodeId?: string;
  amount: number; // in points or naira
  unlockedBy: string;
  platformCommission: number; // percentage
  netEarnings: number;
  createdAt: string;
}

export type WithdrawalStatus = "pending" | "processing" | "completed" | "failed";

export interface Withdrawal {
  id: string;
  creatorId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  createdAt: string;
  processedAt?: string;
}

export interface EarningsSummary {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  withdrawableBalance: number;
  totalPointsEarned: number;
  withdrawalHistory: Withdrawal[];
}

// ---------- Analytics ----------

export interface AnalyticsOverview {
  totalViews: number;
  watchTimeHours: number;
  followersCount: number;
  likesCount: number;
  sharesCount: number;
  revenue: number;
  viewsChange: number;
  watchTimeChange: number;
  followersChange: number;
  revenueChange: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface RetentionPoint {
  label: string;
  value: number;
}

export interface TopVideo {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  watchTime: number;
  likes: number;
}

export interface TopCountry {
  code: string;
  name: string;
  views: number;
  flag: string;
}

// ---------- Notifications ----------

export type NotificationType =
  | "new_episode"
  | "new_video"
  | "series_release"
  | "follow"
  | "like"
  | "comment"
  | "unlock"
  | "earnings"
  | "withdrawal"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  image?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// ---------- Reports & Moderation ----------

export type ReportCategory =
  | "copyright"
  | "violence"
  | "hate"
  | "scam"
  | "sexual"
  | "misleading"
  | "other";

export interface Report {
  id: string;
  videoId: string;
  reporterId: string;
  category: ReportCategory;
  description: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
  resolvedAt?: string;
}

// ---------- Auth ----------

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

// ---------- Recommended Feed ----------

export interface RecommendationContext {
  watchHistory: string[];
  genresWatched: string[];
  creatorsFollowed: string[];
  countriesWatched: CountryCode[];
  completionRate: number;
  likesGiven: string[];
  sharesGiven: string[];
  searchHistory: string[];
  savedVideos: string[];
}