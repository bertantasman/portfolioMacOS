export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

type Placement = "top" | "bottom" | "left" | "right";

const GAP = 14;
const MARGIN = 12;
/** Space the menu bar takes at the top of the page. */
const TOP_INSET = 34;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/**
 * Where to put a card of `size` next to `target`: on the preferred side if it fits, otherwise the
 * opposite side, then the other axis, and always clamped inside the viewport. Null means nothing
 * fits well, and the caller shows a centred card instead.
 */
export function placeTooltip(
  target: Box,
  size: { width: number; height: number },
  viewport: { width: number; height: number },
  preferred: Placement = "bottom",
): { left: number; top: number; placement: Placement } | null {
  const fits: Record<Placement, boolean> = {
    top: target.top - GAP - size.height >= TOP_INSET,
    bottom: target.top + target.height + GAP + size.height <= viewport.height - MARGIN,
    left: target.left - GAP - size.width >= MARGIN,
    right: target.left + target.width + GAP + size.width <= viewport.width - MARGIN,
  };
  const opposite: Record<Placement, Placement> = { top: "bottom", bottom: "top", left: "right", right: "left" };
  const order: Placement[] = [preferred, opposite[preferred], ...(preferred === "top" || preferred === "bottom" ? (["right", "left"] as const) : (["bottom", "top"] as const))];
  const placement = order.find((p) => fits[p]);
  if (!placement) return null;

  const centreX = target.left + target.width / 2 - size.width / 2;
  const centreY = target.top + target.height / 2 - size.height / 2;
  const left = placement === "left" ? target.left - GAP - size.width : placement === "right" ? target.left + target.width + GAP : centreX;
  const top = placement === "top" ? target.top - GAP - size.height : placement === "bottom" ? target.top + target.height + GAP : centreY;
  return {
    placement,
    left: clamp(left, MARGIN, viewport.width - size.width - MARGIN),
    top: clamp(top, TOP_INSET, viewport.height - size.height - MARGIN),
  };
}
