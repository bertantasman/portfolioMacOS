import type { WidgetInstance, WidgetSize } from "../types/widgets";

/** One grid cell is a small widget (134px) plus the gap to the next one. */
export const WIDGET_CELL = 144;
export const WIDGET_GAP = 10;

export const sizeSpan: Record<WidgetSize, { cols: number; rows: number }> = {
  small: { cols: 1, rows: 1 },
  medium: { cols: 2, rows: 1 },
  large: { cols: 2, rows: 2 },
};

const sizeOrder: readonly WidgetSize[] = ["small", "medium", "large"];

export const widgetPixelSize = (size: WidgetSize) => ({
  width: sizeSpan[size].cols * WIDGET_CELL - WIDGET_GAP,
  height: sizeSpan[size].rows * WIDGET_CELL - WIDGET_GAP,
});

export interface CellRect {
  col: number;
  row: number;
  cols: number;
  rows: number;
}

export interface Placement {
  col: number;
  row: number;
  size: WidgetSize;
}

export const rectsOverlap = (a: CellRect, b: CellRect) =>
  a.col < b.col + b.cols && b.col < a.col + a.cols && a.row < b.row + b.rows && b.row < a.row + a.rows;

const rectFor = (col: number, row: number, size: WidgetSize): CellRect => ({ col, row, ...sizeSpan[size] });

export const insideGrid = (r: CellRect, gridCols: number, gridRows: number) =>
  r.col >= 0 && r.row >= 0 && r.col + r.cols <= gridCols && r.row + r.rows <= gridRows;

export const isFree = (r: CellRect, occupied: readonly CellRect[]) => !occupied.some((o) => rectsOverlap(o, r));

/** The largest supported size, no bigger than the wanted one, that fits the grid at all. */
export function fitSize(wanted: WidgetSize, supported: readonly WidgetSize[], gridCols: number, gridRows: number): WidgetSize | null {
  for (let i = sizeOrder.indexOf(wanted); i >= 0; i--) {
    const size = sizeOrder[i];
    if (supported.includes(size) && sizeSpan[size].cols <= gridCols && sizeSpan[size].rows <= gridRows) return size;
  }
  return null;
}

/** The free spot closest to `near` (or the first one in reading order) for a widget of `size`. */
export function findFreeSpot(
  size: WidgetSize,
  occupied: readonly CellRect[],
  gridCols: number,
  gridRows: number,
  near: { col: number; row: number } = { col: 0, row: 0 },
): { col: number; row: number } | null {
  let best: { col: number; row: number } | null = null;
  let bestScore = Infinity;
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const rect = rectFor(col, row, size);
      if (!insideGrid(rect, gridCols, gridRows) || !isFree(rect, occupied)) continue;
      const score = (col - near.col) ** 2 + (row - near.row) ** 2;
      if (score < bestScore) {
        best = { col, row };
        bestScore = score;
      }
    }
  }
  return best;
}

/**
 * Where each widget is drawn on a grid of the given size. A widget keeps its saved position when
 * that still fits and is free; otherwise it moves to the nearest free spot, and is hidden (null)
 * only if the grid has no room at all. A widget that is too big for the grid is drawn smaller.
 * Nothing here is saved, so a small window never overwrites the layout the visitor chose.
 */
export function resolveWidgets(
  widgets: readonly WidgetInstance[],
  supportedSizes: (type: string) => readonly WidgetSize[],
  gridCols: number,
  gridRows: number,
): Map<string, Placement | null> {
  const result = new Map<string, Placement | null>();
  const occupied: CellRect[] = [];
  const waiting: { widget: WidgetInstance; size: WidgetSize }[] = [];

  for (const widget of widgets) {
    const size = fitSize(widget.size, supportedSizes(widget.type), gridCols, gridRows);
    if (!size) {
      result.set(widget.id, null);
      continue;
    }
    const rect = rectFor(widget.column, widget.row, size);
    if (insideGrid(rect, gridCols, gridRows) && isFree(rect, occupied)) {
      result.set(widget.id, { col: widget.column, row: widget.row, size });
      occupied.push(rect);
    } else waiting.push({ widget, size });
  }

  for (const { widget, size } of waiting) {
    const spot = findFreeSpot(size, occupied, gridCols, gridRows, { col: widget.column, row: widget.row });
    if (spot) {
      result.set(widget.id, { ...spot, size });
      occupied.push(rectFor(spot.col, spot.row, size));
    } else result.set(widget.id, null);
  }
  return result;
}

export const placementRect = (p: Placement): CellRect => rectFor(p.col, p.row, p.size);
