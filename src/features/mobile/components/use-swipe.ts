"use client";

import { useRef, type PointerEvent } from "react";

export type SwipeDirection = "up" | "down" | "left" | "right";

/**
 * A small swipe recogniser for the designated gesture regions. It never replaces a control: every gesture also has a
 * button, and `consumeClick()` lets a button ignore the click that follows a swipe.
 */
export function useSwipe(onSwipe: (direction: SwipeDirection) => void, threshold = 36) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  return {
    handlers: {
      onPointerDown: (e: PointerEvent) => {
        start.current = { x: e.clientX, y: e.clientY };
        swiped.current = false;
      },
      onPointerUp: (e: PointerEvent) => {
        const s = start.current;
        start.current = null;
        if (!s) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
        swiped.current = true;
        onSwipe(Math.abs(dy) >= Math.abs(dx) ? (dy < 0 ? "up" : "down") : dx < 0 ? "left" : "right");
      },
      onPointerCancel: () => {
        start.current = null;
      },
    },
    /** True once after a swipe, so the click it produces can be skipped. */
    consumeClick: () => {
      const was = swiped.current;
      swiped.current = false;
      return was;
    },
  };
}
