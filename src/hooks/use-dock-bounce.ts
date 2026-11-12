"use client";

import { useCallback, useEffect, useRef } from "react";
import { animate, useMotionValue } from "motion/react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";

/** Launch bounce: a main hop, then a smaller one, then settle (px, upward). */
const HOPS = [0, -26, 0, -11, 0];
const TIMES = [0, 0.3, 0.55, 0.78, 1];

/**
 * Returns a vertical offset motion value and a `bounce()` trigger. Apply `y`
 * to the icon; call `bounce()` from a click today, or from the application
 * launcher later. Does nothing when the user prefers reduced motion.
 */
export function useDockBounce() {
  const y = useMotionValue(0);
  const reducedMotion = useShouldReduceMotion();
  const controls = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => () => controls.current?.stop(), []);

  const bounce = useCallback(() => {
    if (reducedMotion) return;
    controls.current?.stop();
    controls.current = animate(y, HOPS, {
      duration: 0.85,
      times: TIMES,
      ease: ["easeOut", "easeIn", "easeOut", "easeIn"],
    });
  }, [reducedMotion, y]);

  return { y, bounce };
}
