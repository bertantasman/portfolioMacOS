import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

export interface LaunchpadPreferences {
  /** Application ids in the visitor's order. Validated against the registry when read. */
  applicationOrder: string[];
}

interface LaunchpadStore extends LaunchpadPreferences {
  setApplicationOrder: (order: readonly string[]) => void;
  /** Back to the registry's default order. */
  resetApplicationOrder: () => void;
}

export const LAUNCHPAD_STORAGE_KEY = "launchpad-v1";

const MAX_IDS = 100;

/** Only strings survive, capped and deduplicated; the registry check happens in resolveOrder. */
function sanitizeIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  for (const id of raw) {
    if (typeof id === "string" && id.length > 0 && id.length <= 64) seen.add(id);
    if (seen.size >= MAX_IDS) break;
  }
  return [...seen];
}

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

/** Its own small store, so System Settings' "reset all" never touches the app layout. */
export const useLaunchpadStore = create<LaunchpadStore>()(
  persist(
    (set) => ({
      applicationOrder: [],
      setApplicationOrder: (order) => set({ applicationOrder: sanitizeIds(order) }),
      resetApplicationOrder: () => set({ applicationOrder: [] }),
    }),
    {
      name: LAUNCHPAD_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (s): LaunchpadPreferences => ({ applicationOrder: s.applicationOrder }),
      merge: (persisted, current) => ({
        ...current,
        applicationOrder: sanitizeIds((persisted as Partial<LaunchpadPreferences> | undefined)?.applicationOrder),
      }),
    },
  ),
);
