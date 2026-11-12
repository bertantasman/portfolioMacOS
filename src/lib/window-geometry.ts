import type { Bounds, Point, ResizeEdge, Size } from "@/types/window";

export const TITLE_BAR_HEIGHT = 40;
/** How much of a window must stay on screen horizontally. */
export const MIN_VISIBLE_WIDTH = 120;
/** Space reserved at the bottom for the Dock when sizing and placing windows. */
export const DOCK_CLEARANCE = 88;
const CASCADE_STEP = 28;
const CASCADE_SLOTS = 6;
const SIDE_MARGIN = 12;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

/** Keeps the title bar reachable: below the menu bar, and part of it on screen. */
export function clampPosition(position: Point, size: Size, workspace: Size): Point {
  return {
    x: clamp(position.x, MIN_VISIBLE_WIDTH - size.width, workspace.width - MIN_VISIBLE_WIDTH),
    y: clamp(position.y, 0, workspace.height - TITLE_BAR_HEIGHT),
  };
}

export function maximizedBounds(workspace: Size, dockClearance = DOCK_CLEARANCE): Bounds {
  return {
    x: 0,
    y: 0,
    width: workspace.width,
    height: Math.max(TITLE_BAR_HEIGHT * 2, workspace.height - dockClearance),
  };
}

/** Initial size and cascaded, roughly centred position that fits the viewport. */
export function initialBounds(
  defaultSize: Size,
  minSize: Size,
  workspace: Size,
  openCount: number,
  dockClearance = DOCK_CLEARANCE,
): { bounds: Bounds; minSize: Size } {
  const availableHeight = Math.max(workspace.height - dockClearance, TITLE_BAR_HEIGHT * 2);
  const maxWidth = Math.max(workspace.width - SIDE_MARGIN * 2, 200);
  const effectiveMin = {
    width: Math.min(minSize.width, maxWidth),
    height: Math.min(minSize.height, availableHeight),
  };
  const width = clamp(defaultSize.width, effectiveMin.width, maxWidth);
  const height = clamp(defaultSize.height, effectiveMin.height, availableHeight);
  const offset = (openCount % CASCADE_SLOTS) * CASCADE_STEP;
  const x = clamp((workspace.width - width) / 2 + offset, 0, workspace.width - width);
  const y = clamp((availableHeight - height) / 2 + offset, 0, availableHeight - height);
  return { bounds: { x, y, width, height }, minSize: effectiveMin };
}

/** Applies a pointer delta to the start bounds for the dragged edge/corner. */
export function resolveResize(
  start: Bounds,
  edge: ResizeEdge,
  dx: number,
  dy: number,
  minSize: Size,
  maxSize: Size | undefined,
): Bounds {
  const maxW = maxSize?.width ?? Infinity;
  const maxH = maxSize?.height ?? Infinity;
  let { x, y, width, height } = start;

  if (edge.includes("e")) {
    width = clamp(start.width + dx, minSize.width, maxW);
  }
  if (edge.includes("w")) {
    width = clamp(start.width - dx, minSize.width, maxW);
    x = start.x + start.width - width;
  }
  if (edge.includes("s")) {
    height = clamp(start.height + dy, minSize.height, maxH);
  }
  if (edge.includes("n")) {
    height = clamp(start.height - dy, minSize.height, maxH);
    y = start.y + start.height - height;
    if (y < 0) {
      // Never push the title bar under the menu bar.
      y = 0;
      height = clamp(start.y + start.height, minSize.height, maxH);
    }
  }
  return { x, y, width, height };
}

export function boundsEqual(a: Bounds, b: Bounds) {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}
