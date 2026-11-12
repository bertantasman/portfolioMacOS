import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { getWidgetDefinition, supportedSizesOf } from "@/features/widgets/registry/widget-registry";
import type { WidgetInstance, WidgetPreferences, WidgetSize } from "@/features/widgets/types/widgets";
import {
  findFreeSpot,
  insideGrid,
  isFree,
  placementRect,
  resolveWidgets,
  sizeSpan,
  type CellRect,
} from "@/features/widgets/utils/widget-layout";

export interface WidgetLayoutState {
  widgets: WidgetInstance[];
  prefs: WidgetPreferences;
}

/** What a restrained first layout looks like: a clock, the projects, and who to contact. */
export const defaultWidgets: readonly WidgetInstance[] = [
  { id: "clock-default", type: "clock", size: "small", column: 0, row: 0 },
  { id: "projects-default", type: "projects", size: "medium", column: 1, row: 0 },
  // Without this a first-time visitor never sees the developer's name or role on the desktop itself.
  { id: "contact-default", type: "contact", size: "medium", column: 0, row: 1 },
];

export const WIDGET_STORAGE_KEY = "desktop-widgets-v1";
const MAX_WIDGETS = 24;
const SIZES: readonly WidgetSize[] = ["small", "medium", "large"];

const isInt = (v: unknown, max: number): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) < max;

/**
 * Turns anything read from storage into a valid layout: unknown types, unsupported sizes, duplicate
 * ids and bad positions are dropped or repaired, so corrupted data can never break the desktop.
 */
export function sanitizeWidgets(raw: unknown): WidgetLayoutState | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.widgets)) return null;
  const seen = new Set<string>();
  const widgets: WidgetInstance[] = [];
  for (const item of r.widgets) {
    if (widgets.length >= MAX_WIDGETS || !item || typeof item !== "object") continue;
    const w = item as Record<string, unknown>;
    if (typeof w.id !== "string" || !w.id || w.id.length > 64 || seen.has(w.id)) continue;
    if (typeof w.type !== "string" || !getWidgetDefinition(w.type)) continue;
    const def = getWidgetDefinition(w.type)!;
    const size = SIZES.includes(w.size as WidgetSize) && def.supportedSizes.includes(w.size as WidgetSize) ? (w.size as WidgetSize) : def.defaultSize;
    seen.add(w.id);
    widgets.push({ id: w.id, type: w.type, size, column: isInt(w.column, 50) ? w.column : 0, row: isInt(w.row, 50) ? w.row : 0 });
  }
  const p = (r.prefs && typeof r.prefs === "object" ? r.prefs : {}) as Record<string, unknown>;
  const city = typeof p.weatherCity === "string" ? p.weatherCity.trim().slice(0, 80) : "";
  return { widgets, prefs: city ? { weatherCity: city } : {} };
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

export type WidgetResult = { ok: true; id?: string } | { ok: false; reason: string };

interface WidgetStore extends WidgetLayoutState {
  hydrated: boolean;
  /** The grid the desktop currently fits. Measured at runtime, never saved. */
  grid: { cols: number; rows: number };
  /** Widget outlines in pixels (inside the desktop area), so desktop icons can step around them. */
  rects: { x: number; y: number; width: number; height: number }[];
  /** Keyboard "Move Widget" mode: the widget being moved and where it would land. */
  moving: { id: string; col: number; row: number; startCol: number; startRow: number } | null;

  setGrid: (cols: number, rows: number) => void;
  setRects: (rects: WidgetStore["rects"]) => void;
  addWidget: (type: string, size?: WidgetSize) => WidgetResult;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, column: number, row: number) => WidgetResult;
  resizeWidget: (id: string, size: WidgetSize) => WidgetResult;
  setWeatherCity: (city: string) => void;
  resetWidgets: () => void;
  canResize: (id: string, size: WidgetSize) => boolean;
  startMove: (id: string) => void;
  nudgeMove: (dCol: number, dRow: number) => void;
  commitMove: () => void;
  cancelMove: () => void;
}

let counter = 0;
const newId = (type: string) => `${type}-${Date.now().toString(36)}${(counter++).toString(36)}`;

/** Where every widget is drawn right now, as cell rectangles (hidden widgets are left out). */
function occupiedBy(state: Pick<WidgetStore, "widgets" | "grid">, ignoreId?: string): CellRect[] {
  const placed = resolveWidgets(state.widgets, supportedSizesOf, state.grid.cols, state.grid.rows);
  return state.widgets.flatMap((w) => {
    const p = placed.get(w.id);
    return p && w.id !== ignoreId ? [placementRect(p)] : [];
  });
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: [...defaultWidgets],
      prefs: {},
      hydrated: false,
      grid: { cols: 3, rows: 3 },
      rects: [],
      moving: null,

      setGrid: (cols, rows) => set((s) => (s.grid.cols === cols && s.grid.rows === rows ? s : { grid: { cols, rows } })),
      setRects: (rects) =>
        set((s) =>
          s.rects.length === rects.length && s.rects.every((r, i) => r.x === rects[i].x && r.y === rects[i].y && r.width === rects[i].width && r.height === rects[i].height)
            ? s
            : { rects },
        ),

      addWidget: (type, size) => {
        const def = getWidgetDefinition(type);
        if (!def) return { ok: false, reason: "That widget isn’t available." };
        const wanted = size && def.supportedSizes.includes(size) ? size : def.defaultSize;
        const state = get();
        if (state.widgets.length >= MAX_WIDGETS) return { ok: false, reason: "That’s the most widgets the desktop can hold." };
        const spot = findFreeSpot(wanted, occupiedBy(state), state.grid.cols, state.grid.rows);
        if (!spot) return { ok: false, reason: "There’s no room left on the desktop. Remove a widget or make one smaller." };
        const widget: WidgetInstance = { id: newId(type), type, size: wanted, column: spot.col, row: spot.row };
        set({ widgets: [...state.widgets, widget] });
        return { ok: true, id: widget.id };
      },

      removeWidget: (id) => set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id), moving: s.moving?.id === id ? null : s.moving })),

      moveWidget: (id, column, row) => {
        const state = get();
        const widget = state.widgets.find((w) => w.id === id);
        if (!widget) return { ok: false, reason: "That widget is gone." };
        const placed = resolveWidgets(state.widgets, supportedSizesOf, state.grid.cols, state.grid.rows).get(id);
        const size = placed?.size ?? widget.size;
        // The target must be free; if it isn't, the nearest free cell is used. Overlap is never allowed.
        const spot = findFreeSpot(size, occupiedBy(state, id), state.grid.cols, state.grid.rows, { col: column, row });
        if (!spot) return { ok: false, reason: "There’s no free space for that widget." };
        set({ widgets: state.widgets.map((w) => (w.id === id ? { ...w, column: spot.col, row: spot.row } : w)) });
        return { ok: true };
      },

      canResize: (id, size) => {
        const state = get();
        const widget = state.widgets.find((w) => w.id === id);
        if (!widget || !supportedSizesOf(widget.type).includes(size)) return false;
        const span = sizeSpan[size];
        if (span.cols > state.grid.cols || span.rows > state.grid.rows) return false;
        return findFreeSpot(size, occupiedBy(state, id), state.grid.cols, state.grid.rows, { col: widget.column, row: widget.row }) !== null;
      },

      resizeWidget: (id, size) => {
        const state = get();
        const widget = state.widgets.find((w) => w.id === id);
        if (!widget) return { ok: false, reason: "That widget is gone." };
        if (!supportedSizesOf(widget.type).includes(size)) return { ok: false, reason: "That size isn’t supported." };
        // Stay where it is when the bigger footprint is free; otherwise move to the nearest spot that fits.
        const spot = findFreeSpot(size, occupiedBy(state, id), state.grid.cols, state.grid.rows, { col: widget.column, row: widget.row });
        if (!spot) return { ok: false, reason: "There isn’t room for that size." };
        set({ widgets: state.widgets.map((w) => (w.id === id ? { ...w, size, column: spot.col, row: spot.row } : w)) });
        return { ok: true };
      },

      setWeatherCity: (city) => set((s) => ({ prefs: { ...s.prefs, weatherCity: city.trim().slice(0, 80) || undefined } })),

      resetWidgets: () => set((s) => ({ widgets: [...defaultWidgets], prefs: s.prefs, moving: null })),

      startMove: (id) => {
        const state = get();
        const placed = resolveWidgets(state.widgets, supportedSizesOf, state.grid.cols, state.grid.rows).get(id);
        if (placed) set({ moving: { id, col: placed.col, row: placed.row, startCol: placed.col, startRow: placed.row } });
      },
      nudgeMove: (dCol, dRow) => {
        const state = get();
        const m = state.moving;
        if (!m) return;
        const widget = state.widgets.find((w) => w.id === m.id);
        if (!widget) return;
        const placed = resolveWidgets(state.widgets, supportedSizesOf, state.grid.cols, state.grid.rows).get(m.id);
        const size = placed?.size ?? widget.size;
        const rect: CellRect = { col: m.col + dCol, row: m.row + dRow, ...sizeSpan[size] };
        // A step into the edge or another widget is simply refused.
        if (insideGrid(rect, state.grid.cols, state.grid.rows) && isFree(rect, occupiedBy(state, m.id))) {
          set({ moving: { ...m, col: rect.col, row: rect.row } });
        }
      },
      commitMove: () => {
        const m = get().moving;
        if (!m) return;
        set({ moving: null });
        get().moveWidget(m.id, m.col, m.row);
      },
      cancelMove: () => set({ moving: null }),
    }),
    {
      name: WIDGET_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (s): WidgetLayoutState => ({ widgets: s.widgets, prefs: s.prefs }),
      merge: (persisted, current) => {
        const clean = sanitizeWidgets(persisted);
        return clean ? { ...current, ...clean } : current;
      },
    },
  ),
);
