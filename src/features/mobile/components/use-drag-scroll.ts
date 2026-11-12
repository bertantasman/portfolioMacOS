"use client";

import { useEffect, type RefObject } from "react";

/**
 * Makes a paged, snapping scroller draggable with a mouse or pen (touch already scrolls natively). A horizontal drag moves
 * between pages and settles on the nearest one; a vertical drag scrolls the page under the pointer when it is taller than
 * the screen. The click that ends a drag is swallowed so it never opens an app by accident.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: { x: number; y: number; left: number; top: number; page: HTMLElement | null } | null = null;
    let axis: "x" | "y" | null = null;
    let dragged = false;

    const pageAt = (target: EventTarget | null) => {
      for (let n = target as HTMLElement | null; n && n !== el; n = n.parentElement) {
        if (n.parentElement === el) return n;
      }
      return null;
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      const page = pageAt(e.target);
      start = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: page?.scrollTop ?? 0, page };
      axis = null;
      dragged = false;
    };
    const move = (e: PointerEvent) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
        dragged = true;
        el.style.scrollSnapType = "none";
        el.style.scrollBehavior = "auto";
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* the pointer already ended */
        }
      }
      if (axis === "x") el.scrollLeft = start.left - dx;
      else if (start.page) start.page.scrollTop = start.top - dy;
    };
    const end = () => {
      if (!start) return;
      const wasX = axis === "x";
      start = null;
      axis = null;
      el.style.scrollBehavior = "";
      if (wasX) {
        const page = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
        el.scrollTo({ left: page * el.clientWidth, behavior: "smooth" });
        // Snapping comes back once the page has settled.
        setTimeout(() => {
          el.style.scrollSnapType = "";
        }, 350);
      } else el.style.scrollSnapType = "";
    };
    const click = (e: MouseEvent) => {
      if (!dragged) return;
      dragged = false;
      e.stopPropagation();
      e.preventDefault();
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("click", click, true);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
      el.removeEventListener("click", click, true);
    };
  }, [ref]);
}
