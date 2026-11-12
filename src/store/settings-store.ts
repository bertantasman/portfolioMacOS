import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { accentColors, appearanceModes, type AppearanceMode } from "@/config/appearance";
import { defaultWallpaper, wallpapers } from "@/config/wallpapers";

export interface DesktopSettings {
  appearance: AppearanceMode;
  wallpaperId: string;
  /** Id from the accent palette. */
  accentColor: string;
  /** 0–100 */
  dockSize: number;
  dockMagnification: boolean;
  /** 0–100 */
  dockMagnificationStrength: number;
  reduceMotion: boolean;
  /** Portfolio display brightness, 50–100. Dims the simulated desktop only. */
  brightness: number;
  /** Reserved: there are no interface sounds yet, so nothing reads this. */
  soundEffectsEnabled: boolean;
  /** Notifications: suppress banners (history is still kept). */
  doNotDisturb: boolean;
  notificationBanners: boolean;
  notificationHistory: boolean;
}

export const defaultSettings: DesktopSettings = {
  appearance: "light",
  wallpaperId: defaultWallpaper.id,
  accentColor: accentColors[0].id,
  dockSize: 50,
  dockMagnification: true,
  dockMagnificationStrength: 50,
  reduceMotion: false,
  brightness: 100,
  soundEffectsEnabled: false,
  doNotDisturb: false,
  notificationBanners: true,
  notificationHistory: true,
};

const clampPercent = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : fallback;
const clampRange = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
const bool = (value: unknown, fallback: boolean) => (typeof value === "boolean" ? value : fallback);

/** Turns anything read from storage into valid settings; bad fields fall back to defaults. */
export function sanitizeSettings(raw: unknown): DesktopSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const d = defaultSettings;
  return {
    appearance: (appearanceModes as readonly unknown[]).includes(r.appearance) ? (r.appearance as AppearanceMode) : d.appearance,
    wallpaperId: wallpapers.some((w) => w.id === r.wallpaperId) ? (r.wallpaperId as string) : d.wallpaperId,
    accentColor: accentColors.some((a) => a.id === r.accentColor) ? (r.accentColor as string) : d.accentColor,
    dockSize: clampPercent(r.dockSize, d.dockSize),
    dockMagnification: bool(r.dockMagnification, d.dockMagnification),
    dockMagnificationStrength: clampPercent(r.dockMagnificationStrength, d.dockMagnificationStrength),
    reduceMotion: bool(r.reduceMotion, d.reduceMotion),
    // Added after v1: older saved settings simply fall back to full brightness.
    brightness: clampRange(r.brightness, 50, 100, d.brightness),
    soundEffectsEnabled: bool(r.soundEffectsEnabled, d.soundEffectsEnabled),
    // Fields added after v1 fall back to defaults for settings saved before they existed.
    doNotDisturb: bool(r.doNotDisturb, d.doNotDisturb),
    notificationBanners: bool(r.notificationBanners, d.notificationBanners),
    notificationHistory: bool(r.notificationHistory, d.notificationHistory),
  };
}

interface SettingsState extends DesktopSettings {
  /** True once stored settings have been read (on the client). */
  hydrated: boolean;
  setAppearance: (value: AppearanceMode) => void;
  setWallpaper: (id: string) => void;
  setAccentColor: (id: string) => void;
  setDockSize: (value: number) => void;
  setDockMagnification: (value: boolean) => void;
  setDockMagnificationStrength: (value: number) => void;
  setReduceMotion: (value: boolean) => void;
  setBrightness: (value: number) => void;
  setSoundEffects: (value: boolean) => void;
  setDoNotDisturb: (value: boolean) => void;
  setNotificationBanners: (value: boolean) => void;
  setNotificationHistory: (value: boolean) => void;
  reset: () => void;
}

export const SETTINGS_STORAGE_KEY = "desktop-settings";

/** localStorage that never throws (private mode, blocked storage, SSR). */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* ignore */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      hydrated: false,
      setAppearance: (appearance) => set(sanitizePatch({ appearance })),
      setWallpaper: (wallpaperId) => set(sanitizePatch({ wallpaperId })),
      setAccentColor: (accentColor) => set(sanitizePatch({ accentColor })),
      setDockSize: (dockSize) => set(sanitizePatch({ dockSize })),
      setDockMagnification: (dockMagnification) => set({ dockMagnification }),
      setDockMagnificationStrength: (dockMagnificationStrength) => set(sanitizePatch({ dockMagnificationStrength })),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setBrightness: (brightness) => set(sanitizePatch({ brightness })),
      setSoundEffects: (soundEffectsEnabled) => set({ soundEffectsEnabled }),
      setDoNotDisturb: (doNotDisturb) => set({ doNotDisturb }),
      setNotificationBanners: (notificationBanners) => set({ notificationBanners }),
      setNotificationHistory: (notificationHistory) => set({ notificationHistory }),
      reset: () => set({ ...defaultSettings }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      // Read storage on the client after hydration (see AppProviders) so server
      // and first client render match.
      skipHydration: true,
      partialize: (state): DesktopSettings => ({
        appearance: state.appearance,
        wallpaperId: state.wallpaperId,
        accentColor: state.accentColor,
        dockSize: state.dockSize,
        dockMagnification: state.dockMagnification,
        dockMagnificationStrength: state.dockMagnificationStrength,
        reduceMotion: state.reduceMotion,
        brightness: state.brightness,
        soundEffectsEnabled: state.soundEffectsEnabled,
        doNotDisturb: state.doNotDisturb,
        notificationBanners: state.notificationBanners,
        notificationHistory: state.notificationHistory,
      }),
      merge: (persisted, current) => ({ ...current, ...sanitizeSettings(persisted) }),
    },
  ),
);

/** Validates a partial update by sanitising it merged over defaults, keeping only the given keys. */
function sanitizePatch(patch: Partial<DesktopSettings>): Partial<DesktopSettings> {
  const clean = sanitizeSettings({ ...defaultSettings, ...patch });
  return Object.fromEntries(Object.keys(patch).map((k) => [k, clean[k as keyof DesktopSettings]]));
}
