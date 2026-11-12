import { create } from "zustand";
import { getApplication } from "@/config/applications";
import type { ApplicationId } from "@/types/application";
import type { DesktopNotification, NotifyInput } from "@/features/notifications/types/notification";
import { useSettingsStore } from "./settings-store";

export const MAX_HISTORY = 100;
export const MAX_BANNERS = 3;
const DEDUPE_MS = 2000;

interface NotificationStore {
  /** History, newest first. */
  notifications: DesktopNotification[];
  /** Banners on screen, oldest first. */
  bannerIds: string[];
  /** Notifications waiting for a free banner slot. */
  queue: string[];
  counter: number;
  recentKeys: Record<string, number>;

  /** Records a notification and, if allowed, shows a banner. Returns its id, or null if dropped. */
  addNotification: (input: NotifyInput) => string | null;
  /** Hides the banner only; the history entry stays. */
  dismissBanner: (id: string) => void;
  /** Removes the notification from history (and any banner). */
  dismissNotification: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

const bannersAllowed = () => {
  const s = useSettingsStore.getState();
  return s.notificationBanners && !s.doNotDisturb;
};

/** Shows queued banners while there is room (and banners are allowed). */
function promote(bannerIds: string[], queue: string[], exists: (id: string) => boolean) {
  let banners = bannerIds;
  let rest = queue.filter(exists);
  if (!bannersAllowed()) return { bannerIds: banners, queue: [] as string[] };
  while (banners.length < MAX_BANNERS && rest.length > 0) {
    banners = [...banners, rest[0]];
    rest = rest.slice(1);
  }
  return { bannerIds: banners, queue: rest };
}

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  bannerIds: [],
  queue: [],
  counter: 1,
  recentKeys: {},

  addNotification: (input) => {
    const settings = useSettingsStore.getState();
    const showBanner = bannersAllowed();
    const keep = settings.notificationHistory;
    if (!showBanner && !keep) return null;

    if (process.env.NODE_ENV !== "production") {
      try {
        getApplication(input.appId as ApplicationId);
      } catch {
        console.warn(`[notifications] Unknown application "${input.appId}"; using a fallback icon.`);
      }
    }

    const now = Date.now();
    const { counter, recentKeys } = get();
    if (input.dedupeKey && now - (recentKeys[input.dedupeKey] ?? 0) < DEDUPE_MS) return null;

    const notification: DesktopNotification = {
      id: `n-${counter}`,
      appId: input.appId,
      title: input.title,
      message: input.message,
      createdAt: now,
      priority: input.priority ?? "normal",
      read: false,
      action: input.action,
      transient: !keep || undefined,
    };

    set((state) => {
      const notifications = [notification, ...state.notifications].slice(0, MAX_HISTORY);
      const kept = new Set(notifications.map((n) => n.id));
      const wantsBanner = showBanner;
      const bannerIds = state.bannerIds.filter((id) => kept.has(id));
      const queue = state.queue.filter((id) => kept.has(id));
      const next = wantsBanner
        ? bannerIds.length < MAX_BANNERS
          ? { bannerIds: [...bannerIds, notification.id], queue }
          : { bannerIds, queue: [...queue, notification.id] }
        : { bannerIds, queue };
      return {
        notifications,
        ...next,
        counter: counter + 1,
        recentKeys: input.dedupeKey ? { ...state.recentKeys, [input.dedupeKey]: now } : state.recentKeys,
      };
    });
    return notification.id;
  },

  dismissBanner: (id) =>
    set((state) => {
      if (!state.bannerIds.includes(id)) return state;
      const notifications = state.notifications.filter((n) => !(n.id === id && n.transient));
      const exists = (x: string) => notifications.some((n) => n.id === x);
      return {
        notifications,
        ...promote(state.bannerIds.filter((b) => b !== id), state.queue, exists),
      };
    }),

  dismissNotification: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      const exists = (x: string) => notifications.some((n) => n.id === x);
      return {
        notifications,
        ...promote(state.bannerIds.filter((b) => b !== id), state.queue, exists),
      };
    }),

  markRead: (id) =>
    set((state) =>
      state.notifications.some((n) => n.id === id && !n.read)
        ? { notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }
        : state,
    ),

  markAllRead: () =>
    set((state) =>
      state.notifications.some((n) => !n.read)
        ? { notifications: state.notifications.map((n) => (n.read ? n : { ...n, read: true })) }
        : state,
    ),

  clearNotifications: () => set({ notifications: [], bannerIds: [], queue: [] }),
}));
