import { maximizedBounds } from "@/lib/window-geometry";
import type { Bounds, Size, WindowState } from "@/types/window";

export interface DisplayContext {
  compact: boolean;
  workspace: Size;
  dockClearance: number;
}

/**
 * Where a window is drawn. On a desktop that is its own geometry. On a phone-sized viewport every window
 * fills the workspace above the Dock, and its saved geometry is not touched, so it is exactly where it was
 * when the viewport grows again. Mission Control, the window itself and snapping all read this one rule.
 */
export function displayBounds(win: Pick<WindowState, "position" | "size">, ctx: DisplayContext): Bounds {
  if (ctx.compact) return maximizedBounds(ctx.workspace, ctx.dockClearance);
  return { x: win.position.x, y: win.position.y, width: win.size.width, height: win.size.height };
}
