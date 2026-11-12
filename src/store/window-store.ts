import { create } from "zustand";
import { isCompactViewport } from "@/lib/viewport";
import { defaultWindowConfig, getApplication } from "@/config/applications";
import {
  boundsEqual,
  clampPosition,
  initialBounds,
  maximizedBounds,
} from "@/lib/window-geometry";
import type { SettingsPageId } from "@/features/settings/lib/pages";
import type { ApplicationId } from "@/types/application";
import { getDocumentById } from "@/data/documents";
import { getProjectById } from "@/lib/projects/registry";
import { portfolioFileSystem } from "@/data/portfolio-file-system";
import {
  calculateSnapGeometry,
  canWindowFitSnapPosition,
  clampWindowGeometry,
  isSnapTarget,
} from "@/lib/window-snapping";
import { DOCK_CLEARANCE } from "@/lib/window-geometry";
import type { Bounds, Point, Size, SnapTarget, WindowPayload, WindowState } from "@/types/window";

interface OpenWindowInput {
  appId: ApplicationId;
  title?: string;
  /** Stable id for document windows; generated when omitted. */
  id?: string;
  payload?: WindowPayload;
}

interface WindowStore {
  windows: WindowState[];
  focusedWindowId: string | null;
  /** Size of the area below the menu bar, measured by WindowManager. */
  workspace: Size;
  /** Space at the bottom reserved for the Dock; follows the Dock size setting. */
  dockClearance: number;
  /**
   * Phone-sized viewport: every window is shown full-screen (see lib/window-display.ts). Each window's own
   * desktop geometry is left untouched, so it returns exactly when the viewport grows again.
   */
  compact: boolean;
  nextWindowNumber: number;
  nextRequestId: number;

  openWindow: (input: OpenWindowInput) => string;
  /** Dock/launcher entry point: reuse the app's window, or open a new one. */
  launchApplication: (appId: ApplicationId) => string;
  /** Opens the project in its own Project Viewer window, or focuses/restores it. */
  openProject: (projectId: string) => string;
  /** Opens the document in its own Preview window, or focuses/restores it. */
  openDocument: (documentId: string) => string;
  /** Opens Photos on this image, reusing an existing Photos window. */
  openMedia: (mediaId: string) => string;
  /** Opens Finder at a folder (optionally selecting an item), reusing an existing Finder window. */
  openFolder: (folderId: string, selectId?: string) => string;
  /** Opens Notes on a note, reusing an existing Notes window. */
  openNote: (noteId: string) => string;
  /** Opens Safari (reusing its window) on an internal page, optionally at a section. */
  openSafari: (route: string, section?: string) => string;
  /** Opens Mail (reusing its window), optionally with a new message ready to write. */
  openMail: (compose: boolean) => string;
  /** Opens System Settings (reusing its window) on a section. */
  openSettings: (page: SettingsPageId) => string;
  /** Opens (or focuses/restores) the Get Info window for a file system item. */
  openInfo: (fileId: string) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  /** Restores a minimized window, or un-maximizes a maximized one. */
  /**
   * Restores a minimized window, or returns a maximized or snapped one to its floating bounds.
   */
  restoreWindow: (id: string) => void;
  /** Moves a window into a tiled layout (or Fill). Returns false when it is not allowed or does not fit. */
  snapWindow: (id: string, target: SnapTarget, options?: { restoreTo?: Bounds }) => boolean;
  /** Leaves a snapped layout for floating at `size` (used when a snapped window is dragged). */
  releaseSnap: (id: string, size?: Size) => void;
  setDockClearance: (clearance: number) => void;
  toggleMaximize: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, position: Point) => void;
  resizeWindow: (id: string, bounds: Bounds) => void;
  setWorkspace: (size: Size) => void;
  setCompact: (compact: boolean) => void;
  getWindowsByApp: (appId: ApplicationId) => WindowState[];
}

/** Moves `id` to the top and renumbers every window to 1..n. */
function bringToFront(windows: WindowState[], id: string): WindowState[] {
  const order = windows.filter((w) => w.id !== id).sort((a, b) => a.zIndex - b.zIndex);
  const target = windows.find((w) => w.id === id);
  if (target) order.push(target);
  const rank = new Map(order.map((w, i) => [w.id, i + 1]));
  return windows.map((w) => (w.zIndex === rank.get(w.id) ? w : { ...w, zIndex: rank.get(w.id)! }));
}

/** Compacts z-indices after a removal. */
function renumber(windows: WindowState[]): WindowState[] {
  const rank = new Map(
    [...windows].sort((a, b) => a.zIndex - b.zIndex).map((w, i) => [w.id, i + 1]),
  );
  return windows.map((w) => (w.zIndex === rank.get(w.id) ? w : { ...w, zIndex: rank.get(w.id)! }));
}

/** The visible window that should take focus next (top-most), if any. */
function nextFocusable(windows: WindowState[], excludeId?: string): string | null {
  let best: WindowState | null = null;
  for (const w of windows) {
    if (w.id === excludeId || w.isMinimized) continue;
    if (!best || w.zIndex > best.zIndex) best = w;
  }
  return best?.id ?? null;
}

const boundsOf = (w: WindowState): Bounds => ({ ...w.position, ...w.size });

const patch = (windows: WindowState[], id: string, changes: Partial<WindowState>) =>
  windows.map((w) => (w.id === id ? { ...w, ...changes } : w));

type Get = () => WindowStore;
type Set = (partial: Partial<WindowStore> | ((state: WindowStore) => Partial<WindowStore>)) => void;

/**
 * Deep-link into an application: reuse its top-most window (restoring it if
 * minimized) and hand it a request through the window's payload, or open a new
 * window that starts with the request. Each request gets a fresh id, so an
 * already-open app reacts even when asked for the same target twice.
 */
function openWithPayload(
  get: Get,
  set: Set,
  appId: ApplicationId,
  makePayload: (requestId: number) => WindowPayload,
): string {
  const { windows, nextRequestId, openWindow, restoreWindow, focusWindow } = get();
  const payload = makePayload(nextRequestId);
  const existing = windows.filter((w) => w.appId === appId).sort((a, b) => b.zIndex - a.zIndex)[0];
  if (!existing) {
    set({ nextRequestId: nextRequestId + 1 });
    return openWindow({ appId, payload });
  }
  set((state) => ({
    nextRequestId: nextRequestId + 1,
    windows: patch(state.windows, existing.id, { payload }),
  }));
  if (existing.isMinimized) restoreWindow(existing.id);
  else focusWindow(existing.id);
  return existing.id;
}

/**
 * Re-fits every window after the workspace or Dock changes. Maximized windows fill the new area;
 * snapped windows are re-tiled when their layout still fits, and otherwise shown at their floating
 * bounds (the snap is kept, so the layout returns when the space does).
 */
function refit(windows: WindowState[], workspace: Size, dockClearance: number): WindowState[] {
  return windows.map((w) => {
    let target: Bounds | null = null;
    if (w.isMaximized) target = maximizedBounds(workspace, dockClearance);
    else if (w.snap) {
      target = canWindowFitSnapPosition(w, w.snap, workspace, dockClearance)
        ? calculateSnapGeometry(w.snap, workspace, dockClearance)
        : clampWindowGeometry(w.previousBounds ?? boundsOf(w), w, workspace, dockClearance);
    }
    if (target) {
      return boundsEqual(target, boundsOf(w))
        ? w
        : { ...w, position: { x: target.x, y: target.y }, size: { width: target.width, height: target.height } };
    }
    // A window bigger than the space now available (a smaller viewport) shrinks to fit, so it never
    // overflows the screen or hides its controls; otherwise only its position is kept in reach.
    const maxWidth = Math.max(240, workspace.width - 24);
    const maxHeight = Math.max(160, workspace.height - dockClearance);
    if (w.size.width > maxWidth || w.size.height > maxHeight) {
      const size = { width: Math.min(w.size.width, maxWidth), height: Math.min(w.size.height, maxHeight) };
      const minSize = { width: Math.min(w.minSize.width, size.width), height: Math.min(w.minSize.height, size.height) };
      const fitted = clampWindowGeometry({ ...w.position, ...size }, { minSize, resizable: w.resizable }, workspace, dockClearance);
      return { ...w, minSize, position: { x: fitted.x, y: fitted.y }, size: { width: fitted.width, height: fitted.height } };
    }
    const position = clampPosition(w.position, w.size, workspace);
    return position.x === w.position.x && position.y === w.position.y ? w : { ...w, position };
  });
}

export const useWindowStore = create<WindowStore>()((set, get) => ({
  windows: [],
  focusedWindowId: null,
  workspace: { width: 1280, height: 720 },
  dockClearance: DOCK_CLEARANCE,
  compact: false,
  nextWindowNumber: 1,
  nextRequestId: 1,

  openWindow: ({ appId, title, id: requestedId, payload }) => {
    const { windows, workspace, nextWindowNumber, dockClearance, compact } = get();
    const config = getApplication(appId).window ?? defaultWindowConfig;
    // On a phone the window is drawn full-screen anyway, so its saved geometry is sized for a normal
    // desktop. That way it is a sensible window if the viewport grows later, not a phone-sized sliver.
    const basis = compact ? { width: Math.max(workspace.width, 1280), height: Math.max(workspace.height, 720) } : workspace;
    const { bounds, minSize } = initialBounds(
      config.defaultSize,
      config.minSize,
      basis,
      windows.length,
      dockClearance,
    );
    const id = requestedId ?? `${appId}-${nextWindowNumber}`;
    const created: WindowState = {
      id,
      appId,
      title: title ?? config.title ?? getApplication(appId).name,
      position: { x: bounds.x, y: bounds.y },
      size: { width: bounds.width, height: bounds.height },
      minSize,
      resizable: config.resizable ?? true,
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length + 1,
      titleBar: config.titleBar ?? "standard",
      appearance: config.appearance ?? "light",
      payload: payload ?? { type: "application" },
    };
    set({
      windows: bringToFront([...windows, created], id),
      focusedWindowId: id,
      nextWindowNumber: nextWindowNumber + 1,
    });
    return id;
  },

  launchApplication: (appId) => {
    const { getWindowsByApp, restoreWindow, focusWindow, openWindow } = get();
    const existing = getWindowsByApp(appId).sort((a, b) => b.zIndex - a.zIndex)[0];
    if (!existing) return openWindow({ appId });
    if (existing.isMinimized) restoreWindow(existing.id);
    else focusWindow(existing.id);
    return existing.id;
  },

  openProject: (projectId) => {
    const { windows, restoreWindow, focusWindow, openWindow } = get();
    // One window per project: the id is derived from the project, not the app.
    const id = `project:${projectId}`;
    const existing = windows.find((w) => w.id === id);
    if (existing) {
      if (existing.isMinimized) restoreWindow(id);
      else focusWindow(id);
      return id;
    }
    const project = getProjectById(projectId);
    return openWindow({
      id,
      appId: "project-viewer",
      title: project ? `${project.title} — Project Viewer` : "Project Viewer",
      payload: { type: "project", projectId },
    });
  },

  openMedia: (mediaId) =>
    openWithPayload(get, set, "photos", (requestId) => ({ type: "media", mediaId, requestId })),

  openFolder: (folderId, selectId) =>
    openWithPayload(get, set, "finder", (requestId) => ({ type: "folder", folderId, selectId, requestId })),

  openSafari: (route, section) =>
    openWithPayload(get, set, "safari", (requestId) => ({ type: "safari", route, section, requestId })),

  openMail: (compose) =>
    openWithPayload(get, set, "mail", (requestId) => ({ type: "mail", compose, requestId })),

  openSettings: (page) =>
    openWithPayload(get, set, "system-settings", (requestId) => ({ type: "settings", page, requestId })),

  openInfo: (fileId) => {
    const { windows, restoreWindow, focusWindow, openWindow } = get();
    const id = `info:${fileId}`;
    const existing = windows.find((w) => w.id === id);
    if (existing) {
      if (existing.isMinimized) restoreWindow(id);
      else focusWindow(id);
      return id;
    }
    const file = portfolioFileSystem.getFile(fileId);
    return openWindow({ id, appId: "get-info", title: file ? `${file.name} Info` : "Info", payload: { type: "info", fileId } });
  },

  openNote: (noteId) =>
    openWithPayload(get, set, "notes", (requestId) => ({ type: "note", noteId, requestId })),

  openDocument: (documentId) => {
    const { windows, restoreWindow, focusWindow, openWindow } = get();
    // One Preview window per document; the id comes from the document, not the app.
    const id = `preview:${documentId}`;
    const existing = windows.find((w) => w.id === id);
    if (existing) {
      if (existing.isMinimized) restoreWindow(id);
      else focusWindow(id);
      return id;
    }
    const doc = getDocumentById(documentId);
    return openWindow({
      id,
      appId: "preview",
      title: doc?.filename ?? "Preview",
      payload: { type: "document", documentId },
    });
  },

  closeWindow: (id) =>
    set((state) => {
      if (!state.windows.some((w) => w.id === id)) return state;
      const windows = renumber(state.windows.filter((w) => w.id !== id));
      return {
        windows,
        focusedWindowId:
          state.focusedWindowId === id ? nextFocusable(windows) : state.focusedWindowId,
      };
    }),

  minimizeWindow: (id) =>
    set((state) => {
      const target = state.windows.find((w) => w.id === id);
      if (!target || target.isMinimized) return state;
      return {
        windows: patch(state.windows, id, { isMinimized: true }),
        focusedWindowId:
          state.focusedWindowId === id
            ? nextFocusable(state.windows, id)
            : state.focusedWindowId,
      };
    }),

  maximizeWindow: (id) =>
    set((state) => {
      const target = state.windows.find((w) => w.id === id);
      if (!target || !target.resizable || target.isMaximized) return state;
      const bounds = maximizedBounds(state.workspace, state.dockClearance);
      return {
        windows: bringToFront(
          patch(state.windows, id, {
            isMaximized: true,
            isMinimized: false,
            snap: undefined,
            // From a snapped layout, keep the floating bounds from before the first snap.
            previousBounds: target.snap && target.previousBounds ? target.previousBounds : boundsOf(target),
            position: { x: bounds.x, y: bounds.y },
            size: { width: bounds.width, height: bounds.height },
          }),
          id,
        ),
        focusedWindowId: id,
      };
    }),

  restoreWindow: (id) =>
    set((state) => {
      const target = state.windows.find((w) => w.id === id);
      if (!target) return state;
      if (target.isMinimized) {
        return {
          windows: bringToFront(patch(state.windows, id, { isMinimized: false }), id),
          focusedWindowId: id,
        };
      }
      if ((target.isMaximized || target.snap) && target.previousBounds) {
        // Back to the floating bounds from before snapping/maximizing, kept inside the current workspace.
        const prev = clampWindowGeometry(target.previousBounds, target, state.workspace, state.dockClearance);
        return {
          windows: patch(state.windows, id, {
            isMaximized: false,
            snap: undefined,
            previousBounds: undefined,
            position: { x: prev.x, y: prev.y },
            size: { width: prev.width, height: prev.height },
          }),
        };
      }
      if (target.isMaximized || target.snap) {
        // Nothing remembered: leave the layout but keep the current bounds.
        return { windows: patch(state.windows, id, { isMaximized: false, snap: undefined, previousBounds: undefined }) };
      }
      return state;
    }),

  toggleMaximize: (id) => {
    const target = get().windows.find((w) => w.id === id);
    if (!target) return;
    if (target.isMaximized) get().restoreWindow(id);
    else get().maximizeWindow(id);
  },

  focusWindow: (id) =>
    set((state) => {
      const target = state.windows.find((w) => w.id === id);
      if (!target) return state;
      if (target.isMinimized) return state; // restoreWindow handles this case
      const top = state.windows.reduce((m, w) => Math.max(m, w.zIndex), 0);
      if (state.focusedWindowId === id && target.zIndex === top) return state;
      return { windows: bringToFront(state.windows, id), focusedWindowId: id };
    }),

  moveWindow: (id, position) =>
    set((state) => {
      const target = state.windows.find((w) => w.id === id);
      if (!target || target.isMaximized) return state;
      const next = clampPosition(position, target.size, state.workspace);
      if (next.x === target.position.x && next.y === target.position.y) return state;
      // Moving a window by hand makes it floating, so a stale snap never disagrees with where it is.
      return { windows: patch(state.windows, id, { position: next, snap: undefined, previousBounds: target.snap ? undefined : target.previousBounds }) };
    }),

  resizeWindow: (id, bounds) =>
    set((state) => {
      const target = state.windows.find((w) => w.id === id);
      if (!target || target.isMaximized || !target.resizable) return state;
      const size = {
        width: Math.max(bounds.width, target.minSize.width),
        height: Math.max(bounds.height, target.minSize.height),
      };
      const position = clampPosition(bounds, size, state.workspace);
      if (boundsEqual({ ...position, ...size }, boundsOf(target))) return state;
      // A manual resize makes the window floating at the size the visitor chose.
      return { windows: patch(state.windows, id, { position, size, snap: undefined, previousBounds: undefined }) };
    }),

  setWorkspace: (workspace) =>
    set((state) => {
      if (
        workspace.width === state.workspace.width &&
        workspace.height === state.workspace.height
      ) {
        return state;
      }
      // While compact, windows are drawn full-screen from the workspace itself; their saved geometry waits.
      // The viewport is asked directly: the resize is reported before React has seen the media query change,
      // and refitting in that gap would shrink every window for good.
      const compact = state.compact || isCompactViewport();
      return { workspace, ...(compact ? {} : { windows: refit(state.windows, workspace, state.dockClearance) }) };
    }),

  setCompact: (compact) =>
    set((state) => {
      if (compact === state.compact) return state;
      // Leaving compact: bring every window's saved geometry back inside the current workspace.
      return { compact, ...(compact ? {} : { windows: refit(state.windows, state.workspace, state.dockClearance) }) };
    }),

  setDockClearance: (dockClearance) =>
    set((state) => {
      if (dockClearance === state.dockClearance) return state;
      return { dockClearance, ...(state.compact ? {} : { windows: refit(state.windows, state.workspace, dockClearance) }) };
    }),

  snapWindow: (id, target, options) => {
    if (!isSnapTarget(target)) return false;
    const state = get();
    const win = state.windows.find((w) => w.id === id);
    if (!win || !canWindowFitSnapPosition(win, target, state.workspace, state.dockClearance)) return false;
    if (target === "fill") {
      state.maximizeWindow(id);
      // Fill from a drag that left a snap: keep the floating bounds from before that snap.
      if (options?.restoreTo) {
        set((s) => ({ windows: patch(s.windows, id, { previousBounds: options.restoreTo }) }));
      }
      return true;
    }
    const bounds = calculateSnapGeometry(target, state.workspace, state.dockClearance);
    set({
      windows: bringToFront(
        patch(state.windows, id, {
          isMaximized: false,
          isMinimized: false,
          snap: target,
          // Remember the floating bounds once; moving between snaps never replaces them.
          previousBounds: options?.restoreTo ?? win.previousBounds ?? boundsOf(win),
          position: { x: bounds.x, y: bounds.y },
          size: { width: bounds.width, height: bounds.height },
        }),
        id,
      ),
      focusedWindowId: id,
    });
    return true;
  },

  releaseSnap: (id, size) =>
    set((state) => {
      const win = state.windows.find((w) => w.id === id);
      if (!win || !win.snap) return state;
      const next = size
        ? { width: Math.max(size.width, win.minSize.width), height: Math.max(size.height, win.minSize.height) }
        : win.size;
      return { windows: patch(state.windows, id, { snap: undefined, previousBounds: undefined, size: next }) };
    }),

  getWindowsByApp: (appId) => get().windows.filter((w) => w.appId === appId),
}));

/** App id of the focused window; lets the menu bar identify the active app later. */
export const selectActiveAppId = (state: WindowStore): ApplicationId | null =>
  state.windows.find((w) => w.id === state.focusedWindowId)?.appId ?? null;
