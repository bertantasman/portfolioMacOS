import type { Size } from "@/types/window";
import type { OverviewLayout, OverviewSlot, OverviewWindow } from "../types/mission-control";

/** Space kept clear around the overview, and the label that sits under each preview. */
export const OVERVIEW_PADDING = { x: 32, top: 20, bottom: 112 } as const;
export const OVERVIEW_GAP = 28;
export const OVERVIEW_LABEL_HEIGHT = 44;
const MIN_SCALE = 0.06;

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Item = Pick<OverviewWindow, "id" | "width" | "height">;

/**
 * Packs previews into a region without overlap. For every possible column count it works out the
 * largest uniform scale at which all previews (plus their labels) fit, then keeps the best one. The
 * last row is centred. Nothing about specific applications is assumed.
 */
function packGrid(items: readonly Item[], region: Region, maxScale: number): OverviewLayout {
  const n = items.length;
  if (n === 0) return {};

  let best = { columns: 1, scale: 0 };
  for (let columns = 1; columns <= n; columns++) {
    const rows = Math.ceil(n / columns);
    const cellW = (region.width - (columns - 1) * OVERVIEW_GAP) / columns;
    const cellH = (region.height - (rows - 1) * OVERVIEW_GAP) / rows;
    let scale = maxScale;
    for (const item of items) {
      scale = Math.min(scale, cellW / item.width, (cellH - OVERVIEW_LABEL_HEIGHT) / item.height);
    }
    if (scale > best.scale + 1e-6) best = { columns, scale };
  }

  const { columns } = best;
  const scale = Math.max(MIN_SCALE, best.scale);
  const rows = Math.ceil(n / columns);
  const cellW = (region.width - (columns - 1) * OVERVIEW_GAP) / columns;
  const tallest = Math.max(...items.map((i) => i.height * scale));
  const rowH = tallest + OVERVIEW_LABEL_HEIGHT;
  const blockH = rows * rowH + (rows - 1) * OVERVIEW_GAP;
  const top = region.y + Math.max(0, (region.height - blockH) / 2);

  const layout: OverviewLayout = {};
  items.forEach((item, i) => {
    const row = Math.floor(i / columns);
    const inRow = Math.min(columns, n - row * columns);
    const rowW = inRow * cellW + (inRow - 1) * OVERVIEW_GAP;
    const left = region.x + (region.width - rowW) / 2 + (i % columns) * (cellW + OVERVIEW_GAP);
    const width = item.width * scale;
    const height = item.height * scale;
    layout[item.id] = {
      x: left + (cellW - width) / 2,
      // Previews are centred in their row; the label sits right below.
      y: top + row * (rowH + OVERVIEW_GAP) + (tallest - height) / 2,
      width,
      height,
      scale,
      labelWidth: cellW,
    };
  });
  return layout;
}

/**
 * Lays out the overview for `workspace`. Open windows fill the main area; minimized ones go in a
 * smaller strip along the bottom so they stay reachable and are clearly set apart.
 */
export function layoutOverview(windows: readonly OverviewWindow[], workspace: Size): OverviewLayout {
  const region: Region = {
    x: OVERVIEW_PADDING.x,
    y: OVERVIEW_PADDING.top,
    width: Math.max(80, workspace.width - OVERVIEW_PADDING.x * 2),
    height: Math.max(80, workspace.height - OVERVIEW_PADDING.top - OVERVIEW_PADDING.bottom),
  };
  const open = windows.filter((w) => !w.isMinimized);
  const minimized = windows.filter((w) => w.isMinimized);

  if (minimized.length === 0) return packGrid(open, region, 0.9);
  if (open.length === 0) return packGrid(minimized, region, 0.6);

  const stripH = Math.min(region.height * 0.3, 190);
  const main: Region = { ...region, height: region.height - stripH - OVERVIEW_GAP };
  const strip: Region = { ...region, y: region.y + main.height + OVERVIEW_GAP, height: stripH };
  return { ...packGrid(open, main, 0.9), ...packGrid(minimized, strip, 0.3) };
}

/** The transform that moves a window (drawn at its real position) onto its slot. */
export function slotTransform(slot: OverviewSlot, window: Pick<OverviewWindow, "x" | "y">) {
  return { x: slot.x - slot.scale * window.x, y: slot.y - slot.scale * window.y, scale: slot.scale };
}
