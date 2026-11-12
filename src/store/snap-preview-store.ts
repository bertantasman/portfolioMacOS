import { create } from "zustand";
import type { Bounds, SnapTarget } from "@/types/window";

interface SnapPreviewStore {
  /** The window being dragged into a snap zone, and where it would land. Null when there is none. */
  windowId: string | null;
  target: SnapTarget | null;
  bounds: Bounds | null;
  show: (windowId: string, target: SnapTarget, bounds: Bounds) => void;
  /** Clears the preview; with an id, only if it belongs to that window. */
  clear: (windowId?: string) => void;
}

/** Transient: lives only while a window is being dragged, never saved. */
export const useSnapPreviewStore = create<SnapPreviewStore>()((set) => ({
  windowId: null,
  target: null,
  bounds: null,
  show: (windowId, target, bounds) => set({ windowId, target, bounds }),
  clear: (windowId) =>
    set((s) => (windowId !== undefined && s.windowId !== windowId ? s : s.windowId === null ? s : { windowId: null, target: null, bounds: null })),
}));
