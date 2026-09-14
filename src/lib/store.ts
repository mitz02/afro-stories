import { create } from "zustand";
import { persist } from "zustand/middleware";
import { currentUser } from "@/lib/data/creators";
import { currentWallet } from "@/lib/data/wallet";

interface WalletState {
  balance: number;
  lifetimePoints: number;
  buyPoints: (packageId: string) => void;
  deductPoints: (amount: number, description: string) => boolean;
  hasEnoughPoints: (amount: number) => boolean;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: currentWallet.balance,
      lifetimePoints: currentWallet.lifetimePoints,

      buyPoints: (packageId: string) => {
        const packages: Record<string, { points: number; bonus: number }> = {
          pp_100: { points: 100, bonus: 0 },
          pp_500: { points: 500, bonus: 50 },
          pp_1000: { points: 1000, bonus: 150 },
          pp_2500: { points: 2500, bonus: 500 },
        };
        const pkg = packages[packageId];
        if (!pkg) return;
        if (packageId === "pp_100" || packageId === "pp_500" || packageId === "pp_1000" || packageId === "pp_2500") {
          set((state) => ({
            balance: state.balance + pkg.points + pkg.bonus,
            lifetimePoints: state.lifetimePoints + pkg.points + pkg.bonus,
          }));
        }
      },

      deductPoints: (amount: number, _description: string) => {
        const state = get();
        if (state.balance < amount) return false;
        set((s) => ({ balance: s.balance - amount }));
        return true;
      },

      hasEnoughPoints: (amount: number) => get().balance >= amount,
    }),
    { name: "aafstories-wallet" }
  )
);

interface UnlocksState {
  unlockedEpisodeIds: string[];
  unlockEpisode: (episodeId: string) => void;
  isUnlocked: (episodeId: string) => boolean;
}

export const useUnlocksStore = create<UnlocksState>()(
  persist(
    (set, get) => ({
      unlockedEpisodeIds: [],
      unlockEpisode: (episodeId: string) =>
        set((state) => ({
          unlockedEpisodeIds: [...new Set([...state.unlockedEpisodeIds, episodeId])],
        })),
      isUnlocked: (episodeId: string) =>
        get().unlockedEpisodeIds.includes(episodeId),
    }),
    { name: "aafstories-unlocks" }
  )
);

interface WatchProgressState {
  progressByVideo: Record<string, number>;
  setProgress: (videoId: string, progress: number) => void;
  getProgress: (videoId: string) => number;
}

export const useWatchProgressStore = create<WatchProgressState>()(
  persist(
    (set, get) => ({
      progressByVideo: {
        v_hero_lastkingdom: 68,
        v_ani_tobi: 100,
        v_redcanoe: 12,
        v_amara_short: 44,
      },
      setProgress: (videoId: string, progress: number) =>
        set((state) => ({
          progressByVideo: { ...state.progressByVideo, [videoId]: progress },
        })),
      getProgress: (videoId: string) => get().progressByVideo[videoId] ?? 0,
    }),
    { name: "aafstories-watch-progress" }
  )
);

interface SocialState {
  likedVideoIds: Record<string, string[]>;
  followedCreators: string[];
  followedSeries: string[];
  savedVideoIds: string[];
  viewersFollowing: string[];
  toggleLike: (videoId: string, isCreator: boolean) => void;
  isLiked: (videoId: string, isCreator: boolean) => boolean;
  toggleFollowCreator: (creatorId: string) => void;
  isFollowingCreator: (creatorId: string) => boolean;
  toggleFollowSeries: (seriesId: string) => void;
  isFollowingSeries: (seriesId: string) => boolean;
  toggleSave: (videoId: string) => void;
  isSaved: (videoId: string) => boolean;
  toggleFollowing: (creatorId: string) => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      likedVideoIds: {
        v_hero_lastkingdom: ["u_me"],
        v_ani_tobi: ["u_me"],
      },
      followedCreators: ["c_chiefuwa", "c_tobi"],
      followedSeries: ["s_lastkingdom"],
      savedVideoIds: ["v_hero_lastkingdom"],
      viewersFollowing: ["u_amara", "u_ada", "u_kwame_fan", "u_zuri"],

      toggleLike: (videoId, isCreator) =>
        set((state) => {
          const isViewer = !isCreator;
          const group = isCreator ? "viewersNoop" : "likedVideoIds";
          void group;
          const key = videoId;
          const existing = state.likedVideoIds[key] ?? [];
          const userId = currentUser.id;
          const hasLiked = existing.includes(userId);
          const newLikes = hasLiked
            ? existing.filter((id) => id !== userId)
            : [...existing, userId];
          return {
            likedVideoIds: { ...state.likedVideoIds, [key]: newLikes },
          };
        }),

      isLiked: (videoId: string, isCreator: boolean) => {
        if (isCreator) return false;
        return (get().likedVideoIds[videoId] ?? []).includes(currentUser.id);
      },

      toggleFollowCreator: (creatorId: string) =>
        set((state) => ({
          followedCreators: state.followedCreators.includes(creatorId)
            ? state.followedCreators.filter((id) => id !== creatorId)
            : [...state.followedCreators, creatorId],
        })),

      isFollowingCreator: (creatorId: string) =>
        get().followedCreators.includes(creatorId),

      toggleFollowSeries: (seriesId: string) =>
        set((state) => ({
          followedSeries: state.followedSeries.includes(seriesId)
            ? state.followedSeries.filter((id) => id !== seriesId)
            : [...state.followedSeries, seriesId],
        })),

      isFollowingSeries: (seriesId: string) =>
        get().followedSeries.includes(seriesId),

      toggleSave: (videoId: string) =>
        set((state) => ({
          savedVideoIds: state.savedVideoIds.includes(videoId)
            ? state.savedVideoIds.filter((id) => id !== videoId)
            : [...state.savedVideoIds, videoId],
        })),

      isSaved: (videoId: string) => get().savedVideoIds.includes(videoId),

      toggleFollowing: (creatorId: string) =>
        set((state) => ({
          viewersFollowing: state.viewersFollowing.includes(creatorId)
            ? state.viewersFollowing.filter((id) => id !== creatorId)
            : [...state.viewersFollowing, creatorId],
        })),
    }),
    { name: "aafstories-social" }
  )
);

interface UiState {
  searchOpen: boolean;
  notificationsOpen: boolean;
  mobileNavVisible: boolean;
  setSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setMobileNavVisible: (visible: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      searchOpen: false,
      notificationsOpen: false,
      mobileNavVisible: true,
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
      setMobileNavVisible: (mobileNavVisible) => set({ mobileNavVisible }),
    }),
    { name: "aafstories-ui" }
  )
);

export type AuthRole = "viewer" | "creator";

interface AuthState {
  status: "guest" | "authenticated";
  role: AuthRole | null;
  login: (role: AuthRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: "guest",
      role: null,
      login: (role) => set({ status: "authenticated", role }),
      logout: () => set({ status: "guest", role: null }),
    }),
    { name: "aafstories-auth" }
  )
);

interface ToastState {
  toasts: { id: string; title: string; description?: string }[];
  showToast: (title: string, description?: string) => void;
  dismissToast: (id: string) => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  showToast: (title, description) => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({ toasts: [...state.toasts, { id, title, description }] }));
    setTimeout(() => get().dismissToast(id), 4000);
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));