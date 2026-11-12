"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

export interface GridLayout {
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  iconSize: number;
  perPage: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Columns, rows and icon size that fit an area. Pure, so it can be reasoned about on its own. */
export function computeLayout(width: number, height: number): GridLayout {
  const cols = clamp(Math.floor(width / 118), 2, 7);
  const rows = clamp(Math.floor(height / 128), 1, 5);
  const cellWidth = Math.min(Math.floor(width / cols), 168);
  const cellHeight = Math.min(Math.floor(height / rows), 164);
  const iconSize = clamp(Math.floor(Math.min(cellWidth * 0.62, cellHeight * 0.58)), 48, 96);
  return { cols, rows, cellWidth, cellHeight, iconSize, perPage: cols * rows };
}

/** Measures the grid area and derives the layout. Null until the first measurement. */
export function useGridLayout(ref: RefObject<HTMLElement | null>): GridLayout | null {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize((prev) =>
        prev && Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1 ? prev : { width, height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size ? computeLayout(size.width, size.height) : null;
}
