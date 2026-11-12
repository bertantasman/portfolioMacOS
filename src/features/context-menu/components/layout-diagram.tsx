import type { SnapTarget } from "@/types/window";

/** The part of a tiny screen a layout fills, drawn with a plain SVG (no image assets). */
const regions: Record<SnapTarget, [number, number, number, number]> = {
  fill: [1, 1, 16, 11],
  left: [1, 1, 7.5, 11],
  right: [9.5, 1, 7.5, 11],
  "top-left": [1, 1, 7.5, 5],
  "top-right": [9.5, 1, 7.5, 5],
  "bottom-left": [1, 7, 7.5, 5],
  "bottom-right": [9.5, 7, 7.5, 5],
};

export function LayoutDiagram({ kind }: { kind: SnapTarget }) {
  const [x, y, w, h] = regions[kind];
  return (
    <svg viewBox="0 0 18 13" aria-hidden className="h-[13px] w-[18px] shrink-0">
      <rect x="0.5" y="0.5" width="17" height="12" rx="2" fill="none" stroke="currentColor" strokeOpacity="0.6" />
      <rect x={x} y={y} width={w} height={h} rx="1" fill="currentColor" fillOpacity="0.85" />
    </svg>
  );
}
