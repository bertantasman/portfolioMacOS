import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

export interface DesktopIconPosition {
  column: number;
  row: number;
}

/** What Sort By can order desktop icons by. Only metadata that exists is ever offered. */
export const desktopSortKeys = ["name", "kind", "modified", "size"] as const;
export type DesktopSortKey = (typeof desktopSortKeys)[number];

export const ICON_SIZE = { min: 48, max: 96, default: 64 } as const;
export const GRID_SPACING = { min: 0, max: 24, default: 8 } as const;

export interface DesktopPreferences {
  /** Column counts from the right edge, rows from the top, as on macOS. Keyed by file system id. */
  positions: Record<string, DesktopIconPosition>;
  sortBy: DesktopSortKey | null;
  iconSize: number;
  gridSpacing: number;
}

interface DesktopStore extends DesktopPreferences {
  /** The grid the desktop currently fits. Measured at runtime, never saved. */
  metrics: { cols: number; rows: number };
  setMetrics: (cols: number, rows: number) => void;
  setPositions: (positions: Record<string, DesktopIconPosition>) => void;
  setSortBy: (key: DesktopSortKey | null) => void;
  setIconSize: (value: number) => void;
  setGridSpacing: (value: number) => void;
  resetViewOptions: () => void;
}

export const DESKTOP_STORAGE_KEY = "desktop-icons-v1";
const MAX_POSITIONS = 200;

const clamp = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;

/** Keeps only well-formed positions: string ids and small non-negative integers. */
export function sanitizePositions(raw: unknown): Record<string, DesktopIconPosition> {
  const result: Record<string, DesktopIconPosition> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return result;
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (Object.keys(result).length >= MAX_POSITIONS) break;
    if (!id || id.length > 128 || !value || typeof value !== "object") continue;
    const { column, row } = value as Record<string, unknown>;
    if (Number.isInteger(column) && Number.isInteger(row) && (column as number) >= 0 && (row as number) >= 0 && (column as number) < 500 && (row as number) < 500) {
      result[id] = { column: column as number, row: row as number };
    }
  }
  return result;
}

export function sanitizeDesktop(raw: unknown): DesktopPreferences {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    positions: sanitizePositions(r.positions),
    sortBy: (desktopSortKeys as readonly unknown[]).includes(r.sortBy) ? (r.sortBy as DesktopSortKey) : null,
    iconSize: clamp(r.iconSize, ICON_SIZE.min, ICON_SIZE.max, ICON_SIZE.default),
    gridSpacing: clamp(r.gridSpacing, GRID_SPACING.min, GRID_SPACING.max, GRID_SPACING.default),
  };
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

/** Desktop icon layout and view options. Separate from System Settings so "reset all" leaves it alone. */
export const useDesktopStore = create<DesktopStore>()(
  persist(
    (set) => ({
      ...sanitizeDesktop(undefined),
      metrics: { cols: 1, rows: 1 },
      setMetrics: (cols, rows) =>
        set((s) => (s.metrics.cols === cols && s.metrics.rows === rows ? s : { metrics: { cols, rows } })),
      setPositions: (positions) => set({ positions: sanitizePositions(positions) }),
      setSortBy: (sortBy) => set({ sortBy }),
      setIconSize: (value) => set({ iconSize: clamp(value, ICON_SIZE.min, ICON_SIZE.max, ICON_SIZE.default) }),
      setGridSpacing: (value) => set({ gridSpacing: clamp(value, GRID_SPACING.min, GRID_SPACING.max, GRID_SPACING.default) }),
      resetViewOptions: () => set({ iconSize: ICON_SIZE.default, gridSpacing: GRID_SPACING.default }),
    }),
    {
      name: DESKTOP_STORAGE_KEY,
      // v2: the Desktop was cleaned up (one Projects folder, the résumé, two notes). Saved icon positions from the
      // older, crowded desktop are dropped so nothing lands in a stale cell; icon size, spacing and sort are kept.
      version: 2,
      migrate: (persisted, version) => {
        const kept = sanitizeDesktop(persisted);
        return version < 2 ? { ...kept, positions: {} } : kept;
      },
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (s): DesktopPreferences => ({
        positions: s.positions,
        sortBy: s.sortBy,
        iconSize: s.iconSize,
        gridSpacing: s.gridSpacing,
      }),
      merge: (persisted, current) => ({ ...current, ...sanitizeDesktop(persisted) }),
    },
  ),
);
