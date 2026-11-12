import { create } from "zustand";
import type { StartupPhase } from "@/features/startup/types/startup";
import { hasCompletedStartup, markStartupCompleted } from "@/features/startup/utils/startup-storage";
import { useOverlayStore } from "./overlay-store";

interface StartupStore {
  phase: StartupPhase;
  /** Reads storage on the client: returning visitors go to the desktop, new ones boot. Runs once. */
  hydrate: () => void;
  /** Boot is over (finished or skipped). */
  finishBoot: () => void;
  /** Shows the lock screen from the desktop. Windows and state are untouched. */
  lock: () => void;
  /** Starts the unlock transition. */
  unlock: () => void;
  /** The transition is done: the desktop is interactive. */
  completeUnlock: () => void;
}

/**
 * One authoritative phase for the whole startup experience; there are no separate booleans to
 * disagree. It owns nothing but that phase: windows, settings and notifications live elsewhere.
 */
export const useStartupStore = create<StartupStore>()((set, get) => ({
  phase: "initializing",

  hydrate: () => {
    if (get().phase !== "initializing") return;
    set({ phase: hasCompletedStartup() ? "desktop" : "booting" });
  },

  finishBoot: () => {
    if (get().phase === "booting") set({ phase: "locked" });
  },

  lock: () => {
    if (get().phase !== "desktop") return;
    // Transient overlays (Spotlight, menus, Launchpad, …) are closed; their underlying state is kept.
    useOverlayStore.getState().close();
    set({ phase: "locked" });
  },

  unlock: () => {
    if (get().phase === "locked") set({ phase: "unlocking" });
  },

  completeUnlock: () => {
    if (get().phase !== "unlocking") return;
    markStartupCompleted();
    set({ phase: "desktop" });
  },
}));
