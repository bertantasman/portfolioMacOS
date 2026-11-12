/** Where the last press landed, so an app can open by growing out of the icon that was tapped. Plain module state: no re-renders. */
let point: { x: number; y: number } | null = null;

export const rememberTouch = (x: number, y: number) => {
  point = { x, y };
};

/** The last press as a CSS transform-origin, or the screen centre when there is none (a keyboard or a deep link). */
export function takeTouchOrigin(): string {
  const p = point;
  point = null;
  return p ? `${Math.round(p.x)}px ${Math.round(p.y)}px` : "50% 50%";
}
