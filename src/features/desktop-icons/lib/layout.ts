import { sortFiles } from "@/lib/virtual-fs/sort";
import type { VirtualFile } from "@/lib/virtual-fs/types";
import type { DesktopIconPosition, DesktopSortKey } from "@/store/desktop-store";
import { portfolioFileSystem as fs } from "@/data/portfolio-file-system";

export type Cell = DesktopIconPosition;

const key = (c: Cell) => `${c.column}:${c.row}`;

/** Everything that appears on the desktop: the Desktop folder's items (the startup volume is not shown, as in current macOS). */
export function getDesktopItems(sortBy: DesktopSortKey | null): VirtualFile[] {
  const children = fs.getChildren("desktop");
  const sorted = sortFiles(children, { key: sortBy === "modified" ? "modified" : sortBy === "kind" ? "kind" : "name", foldersFirst: true });
  const ordered = sortBy === "size" ? bySize(sorted) : sorted;
  return [...ordered];
}

/** Items without a size sort last; ties keep their (name) order. */
function bySize(files: VirtualFile[]): VirtualFile[] {
  return [...files].sort((a, b) => (a.size ?? Infinity) - (b.size ?? Infinity) || 0);
}

/** Which sort options have real data behind them. Name and Kind always do. */
export function getSortAvailability(items: readonly VirtualFile[]): Record<DesktopSortKey, boolean> {
  return {
    name: true,
    kind: true,
    modified: items.some((i) => i.modifiedAt !== undefined),
    size: items.some((i) => i.size !== undefined),
  };
}

/** Cells in reading order for a desktop: down each column, columns counted from the right edge. */
export function cellAt(index: number, rows: number): Cell {
  const r = Math.max(1, rows);
  return { column: Math.floor(index / r), row: index % r };
}

/** Packs `ids` into consecutive cells, in the order given. */
export function arrange(ids: readonly string[], rows: number): Record<string, Cell> {
  const result: Record<string, Cell> = {};
  ids.forEach((id, i) => {
    result[id] = cellAt(i, rows);
  });
  return result;
}

/**
 * Where each item is drawn. Saved positions are honoured when they fit the current grid and
 * are free; everything else flows into the first free cell. Nothing here is saved, so a small
 * window reflows icons without losing the preferred layout.
 */
export function resolveLayout(
  ids: readonly string[],
  stored: Record<string, Cell>,
  cols: number,
  rows: number,
  /** Cells that are not available (under widgets). Icons are laid out around them. */
  blocked: ReadonlySet<string> = new Set(),
): Map<string, Cell> {
  const result = new Map<string, Cell>();
  const taken = new Set<string>(blocked);
  const waiting: string[] = [];
  for (const id of ids) {
    const cell = stored[id];
    if (cell && cell.column < cols && cell.row < rows && !taken.has(key(cell))) {
      result.set(id, cell);
      taken.add(key(cell));
    } else waiting.push(id);
  }
  let next = 0;
  for (const id of waiting) {
    let cell = cellAt(next, rows);
    while (taken.has(key(cell))) cell = cellAt(++next, rows);
    // More items than cells: the extras queue beyond the grid rather than overlapping.
    result.set(id, cell);
    taken.add(key(cell));
  }
  return result;
}

/** The free cell closest to `target` inside the grid, or null when the grid is full. */
export function nearestFreeCell(target: Cell, taken: ReadonlySet<string>, cols: number, rows: number): Cell | null {
  let best: Cell | null = null;
  let bestDistance = Infinity;
  for (let column = 0; column < cols; column++) {
    for (let row = 0; row < rows; row++) {
      if (taken.has(key({ column, row }))) continue;
      const distance = (column - target.column) ** 2 + (row - target.row) ** 2;
      if (distance < bestDistance) {
        best = { column, row };
        bestDistance = distance;
      }
    }
  }
  return best;
}

export const cellKey = key;

/** Item ids in their current on-screen order (column by column), used by Clean Up. */
export function idsInVisualOrder(layout: Map<string, Cell>): string[] {
  return [...layout.entries()].sort((a, b) => a[1].column - b[1].column || a[1].row - b[1].row).map(([id]) => id);
}
