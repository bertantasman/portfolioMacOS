"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent } from "react";
import type { MotionValue } from "motion/react";
import { resolveResize } from "@/lib/window-geometry";
import type { Bounds, ResizeEdge, Size } from "@/types/window";

interface UseWindowResizeOptions {
  x: MotionValue<number>;
  y: MotionValue<number>;
  width: MotionValue<number>;
  height: MotionValue<number>;
  minSize: Size;
  maxSize?: Size;
  /** Called once, on release, with the final bounds. */
  onCommit: (bounds: Bounds) => void;
}

interface Session {
  pointerId: number;
  edge: ResizeEdge;
  startX: number;
  startY: number;
  start: Bounds;
}

/** Edge/corner resizing with the same motion-value strategy as dragging. */
export function useWindowResize({
  x,
  y,
  width,
  height,
  minSize,
  maxSize,
  onCommit,
}: UseWindowResizeOptions) {
  const session = useRef<Session | null>(null);

  const read = useCallback(
    (): Bounds => ({ x: x.get(), y: y.get(), width: width.get(), height: height.get() }),
    [x, y, width, height],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const s = session.current;
      if (!s || s.pointerId !== e.pointerId) return;
      const next = resolveResize(
        s.start,
        s.edge,
        e.clientX - s.startX,
        e.clientY - s.startY,
        minSize,
        maxSize,
      );
      x.set(next.x);
      y.set(next.y);
      width.set(next.width);
      height.set(next.height);
    },
    [x, y, width, height, minSize, maxSize],
  );

  const end = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const s = session.current;
      if (!s || s.pointerId !== e.pointerId) return;
      session.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      onCommit(read());
    },
    [onCommit, read],
  );

  const getHandleProps = useCallback(
    (edge: ResizeEdge) => ({
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        session.current = {
          pointerId: e.pointerId,
          edge,
          startX: e.clientX,
          startY: e.clientY,
          start: read(),
        };
      },
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    }),
    [onPointerMove, end, read],
  );

  return { getHandleProps };
}
