import type { Direction, OverviewLayout } from "../types/mission-control";

/**
 * The preview to move to from `currentId`. Left/right/up/down pick the nearest preview that lies
 * that way, favouring the one most in line. At the end of a row, left/right continue through the
 * previews in order, so every preview is reachable from the arrow keys alone.
 */
export function neighbour(layout: OverviewLayout, order: readonly string[], currentId: string, direction: Direction): string {
  const current = layout[currentId];
  if (!current) return order[0] ?? currentId;
  const cx = current.x + current.width / 2;
  const cy = current.y + current.height / 2;

  let best: string | null = null;
  let bestScore = Infinity;
  for (const id of order) {
    if (id === currentId || !layout[id]) continue;
    const slot = layout[id];
    const dx = slot.x + slot.width / 2 - cx;
    const dy = slot.y + slot.height / 2 - cy;
    const ahead = direction === "right" ? dx : direction === "left" ? -dx : direction === "down" ? dy : -dy;
    if (ahead <= 1) continue;
    const across = direction === "left" || direction === "right" ? Math.abs(dy) : Math.abs(dx);
    const score = ahead + across * 2;
    if (score < bestScore) {
      best = id;
      bestScore = score;
    }
  }
  if (best) return best;

  if (direction === "left" || direction === "right") {
    const index = order.indexOf(currentId);
    const step = direction === "right" ? 1 : -1;
    return order[(index + step + order.length) % order.length] ?? currentId;
  }
  return currentId;
}
