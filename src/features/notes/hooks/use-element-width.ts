"use client";

import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";

/** Tracks an element's width (used to collapse columns in narrow windows). */
export function useElementWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(1000);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}
