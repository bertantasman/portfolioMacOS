export interface Point {
  x: number;
  y: number;
}

interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/**
 * Where to put a menu of `width`×`height` opened at `point`: right and below the pointer, flipped
 * to the other side when it would leave the allowed area, then clamped so it is never clipped.
 */
export function positionMenu(point: Point, width: number, height: number, viewport: { width: number; height: number }, insets: Insets): Point {
  const maxX = viewport.width - insets.right;
  const maxY = viewport.height - insets.bottom;
  let x = point.x;
  let y = point.y;
  if (x + width > maxX) x = point.x - width;
  if (y + height > maxY) y = point.y - height;
  return { x: clamp(x, insets.left, maxX - width), y: clamp(y, insets.top, maxY - height) };
}

/** Insets for a top-level menu: clear of the menu bar, and of the Dock when it fits. */
export function menuInsets(menuHeight: number, viewportHeight: number): Insets {
  const top = 32;
  const dock = 96;
  const bottom = viewportHeight - top - dock >= menuHeight ? dock : 8;
  return { top, right: 8, bottom, left: 8 };
}
