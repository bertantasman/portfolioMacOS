import { create } from "zustand";
import type { ContextMenuTarget } from "@/features/context-menu/types/context-menu";
import { useOverlayStore } from "./overlay-store";

export interface Toast {
  id: number;
  text: string;
  tone: "success" | "error";
}

export interface Anchor {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface ContextMenuStore {
  /** What the open menu is for. Only plain data lives here; the entries are built when rendering. */
  target: ContextMenuTarget | null;
  x: number;
  y: number;
  viaKeyboard: boolean;
  /** Opened by hovering a control: no click-blocking layer, and it closes when the pointer leaves. */
  hover: boolean;
  /** The control that opened a hover menu; the pointer may rest on it without closing the menu. */
  anchor: Anchor | null;
  /** Changes on every request so a menu reopened on the same target still restarts. */
  requestId: number;
  toast: Toast | null;
  show: (target: ContextMenuTarget, x: number, y: number, viaKeyboard?: boolean, options?: { hover?: boolean; anchor?: Anchor }) => void;
  hide: () => void;
  showToast: (text: string, tone?: Toast["tone"]) => void;
  clearToast: (id: number) => void;
}

let counter = 0;

/**
 * Whether the menu is open is decided by the overlay store ("context-menu"), so opening Spotlight,
 * Launchpad and the rest closes it, and opening it closes them.
 */
export const useContextMenuStore = create<ContextMenuStore>()((set) => ({
  target: null,
  x: 0,
  y: 0,
  viaKeyboard: false,
  hover: false,
  anchor: null,
  requestId: 0,
  toast: null,
  show: (target, x, y, viaKeyboard = false, options) => {
    set({ target, x, y, viaKeyboard, hover: options?.hover ?? false, anchor: options?.anchor ?? null, requestId: ++counter });
    useOverlayStore.getState().open("context-menu");
  },
  hide: () => useOverlayStore.getState().close("context-menu"),
  showToast: (text, tone = "success") => set({ toast: { id: ++counter, text, tone } }),
  clearToast: (id) => set((s) => (s.toast?.id === id ? { toast: null } : s)),
}));
