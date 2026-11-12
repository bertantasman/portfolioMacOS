import { create } from "zustand";

export type OverlayName = "spotlight" | "notification-center" | "launchpad" | "control-center" | "context-menu" | "view-options" | "mission-control" | "widget-gallery";

interface OverlayStore {
  /** The one overlay currently open. Opening one closes the other. */
  active: OverlayName | null;
  open: (name: OverlayName) => void;
  /** Closes `name` if it is the open overlay (or whichever is open when omitted). */
  close: (name?: OverlayName) => void;
  toggle: (name: OverlayName) => void;
}

export const useOverlayStore = create<OverlayStore>()((set) => ({
  active: null,
  open: (name) => set({ active: name }),
  close: (name) => set((s) => (name === undefined || s.active === name ? { active: null } : s)),
  toggle: (name) => set((s) => ({ active: s.active === name ? null : name })),
}));
