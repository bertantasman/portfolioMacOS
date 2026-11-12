import { TITLE_BAR_HEIGHT, maximizedBounds } from "@/lib/window-geometry";
import type { Bounds, Point, Size, SnapTarget, WindowSnapPosition, WindowState } from "@/types/window";

/** How close (px) the pointer must be to a side edge to snap to that half. */
export const SNAP_EDGE_THRESHOLD = 24;
/** Size (px) of the square at each screen corner that snaps to a quarter. */
export const SNAP_CORNER_THRESHOLD = 72;
/** How close to the top of the workspace the pointer must be, away from the corners, to fill. */
export const SNAP_TOP_THRESHOLD = 10;
/** Gap (px) between snapped windows and the workspace edges. */
export const SNAP_MARGIN = 6;

type Constraints = Pick<WindowState, "minSize" | "maxSize" | "resizable">;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

/** The area windows may use: the workspace below the menu bar, minus the Dock. */
export function getAvailableWorkspace(workspace: Size, dockClearance: number): Bounds {
  return { x: 0, y: 0, width: workspace.width, height: Math.max(TITLE_BAR_HEIGHT * 2, workspace.height - dockClearance) };
}

/** Where a window goes for a snap target. Deterministic; depends only on its arguments. */
export function calculateSnapGeometry(target: SnapTarget, workspace: Size, dockClearance: number): Bounds {
  if (target === "fill") return maximizedBounds(workspace, dockClearance);
  const area = getAvailableWorkspace(workspace, dockClearance);
  const m = SNAP_MARGIN;
  const halfW = Math.floor((area.width - m * 3) / 2);
  const fullH = area.height - m * 2;
  const halfH = Math.floor((area.height - m * 3) / 2);
  const left = m;
  const right = m * 2 + halfW;
  const top = m;
  const bottom = m * 2 + halfH;
  switch (target) {
    case "left":
      return { x: left, y: top, width: halfW, height: fullH };
    case "right":
      return { x: right, y: top, width: halfW, height: fullH };
    case "top-left":
      return { x: left, y: top, width: halfW, height: halfH };
    case "top-right":
      return { x: right, y: top, width: halfW, height: halfH };
    case "bottom-left":
      return { x: left, y: bottom, width: halfW, height: halfH };
    case "bottom-right":
      return { x: right, y: bottom, width: halfW, height: halfH };
  }
}

const isSnapTarget = (value: unknown): value is SnapTarget =>
  typeof value === "string" &&
  ["left", "right", "top-left", "top-right", "bottom-left", "bottom-right", "fill"].includes(value);

export { isSnapTarget };

/** Whether a window's constraints allow the layout: resizable, and the result is at least its minimum size. */
export function canWindowFitSnapPosition(win: Constraints, target: SnapTarget, workspace: Size, dockClearance: number): boolean {
  if (!win.resizable) return false;
  const g = calculateSnapGeometry(target, workspace, dockClearance);
  if (g.width <= 0 || g.height <= 0) return false;
  return g.width >= win.minSize.width && g.height >= win.minSize.height;
}

/**
 * The snap target for a pointer position (workspace coordinates), ignoring whether any window
 * could use it: corners first, then the side edges, then the top edge in the middle for Fill.
 */
export function detectSnapZone(pointer: Point, workspace: Size): SnapTarget | null {
  const { x, y } = pointer;
  const c = SNAP_CORNER_THRESHOLD;
  const nearLeft = x <= c;
  const nearRight = x >= workspace.width - c;
  const nearTop = y <= c;
  const nearBottom = y >= workspace.height - c;
  if (nearLeft && nearTop) return "top-left";
  if (nearRight && nearTop) return "top-right";
  if (nearLeft && nearBottom) return "bottom-left";
  if (nearRight && nearBottom) return "bottom-right";
  if (x <= SNAP_EDGE_THRESHOLD) return "left";
  if (x >= workspace.width - SNAP_EDGE_THRESHOLD) return "right";
  if (y <= SNAP_TOP_THRESHOLD) return "fill";
  return null;
}

/** A corner that doesn't fit falls back to the half on that side; a half that doesn't fit gives nothing. */
export function resolveSnapZone(pointer: Point, win: Constraints, workspace: Size, dockClearance: number): SnapTarget | null {
  const zone = detectSnapZone(pointer, workspace);
  if (!zone) return null;
  const fits = (t: SnapTarget) => canWindowFitSnapPosition(win, t, workspace, dockClearance);
  if (fits(zone)) return zone;
  const half: WindowSnapPosition | null = zone.endsWith("left") ? "left" : zone.endsWith("right") ? "right" : null;
  return half && half !== zone && fits(half) ? half : null;
}

/** Fits bounds into the available area, never below the window's minimum size. */
export function clampWindowGeometry(bounds: Bounds, win: Constraints, workspace: Size, dockClearance: number): Bounds {
  const area = getAvailableWorkspace(workspace, dockClearance);
  const width = clamp(bounds.width, win.minSize.width, Math.max(win.minSize.width, area.width - SNAP_MARGIN * 2));
  const height = clamp(bounds.height, win.minSize.height, Math.max(win.minSize.height, area.height - SNAP_MARGIN));
  return {
    width,
    height,
    x: clamp(bounds.x, 0, Math.max(0, area.width - width)),
    y: clamp(bounds.y, 0, Math.max(0, area.height - height)),
  };
}
