"use client";

import { useEffect, type RefObject } from "react";

const canScroll = (el: HTMLElement, axis: "x" | "y") => {
  const style = getComputedStyle(el);
  if (axis === "y") return /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
  return /(auto|scroll)/.test(style.overflowX) && el.scrollWidth > el.clientWidth + 1;
};

/** The nearest element between the pointer and `root` that can scroll along `axis`. */
function scrollerFor(target: EventTarget | null, root: HTMLElement, axis: "x" | "y"): HTMLElement | null {
  for (let n = target as HTMLElement | null; n; n = n.parentElement) {
    if (canScroll(n, axis)) return n;
    if (n === root) break;
  }
  return null;
}

/**
 * Lets a mouse or pen drag scroll whatever is under the pointer, the way a finger does (touch already scrolls natively):
 * vertical lists and pages, horizontal chip rows and galleries. It lets go with a little momentum, and swallows the click
 * that ends a drag so nothing opens by accident. Drags that start in a text field are left alone.
 */
export function useDragPan(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let s: { x: number; y: number; axis: "x" | "y" | null; scroller: HTMLElement | null; origin: number; last: number; lastT: number; v: number; target: EventTarget | null } | null = null;
    let dragged = false;
    let frame = 0;
    const stopMomentum = () => cancelAnimationFrame(frame);

    const down = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      if ((e.target as HTMLElement).closest("input, textarea, select, [data-no-drag]")) return;
      stopMomentum();
      s = { x: e.clientX, y: e.clientY, axis: null, scroller: null, origin: 0, last: 0, lastT: 0, v: 0, target: e.target };
      dragged = false;
    };
    const move = (e: PointerEvent) => {
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (!s.axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        const axis = Math.abs(dy) >= Math.abs(dx) ? "y" : "x";
        const scroller = scrollerFor(s.target, root, axis);
        if (!scroller) {
          s = null; // nothing to scroll that way: leave the gesture to the page
          return;
        }
        s.axis = axis;
        s.scroller = scroller;
        s.origin = axis === "y" ? scroller.scrollTop : scroller.scrollLeft;
        s.last = axis === "y" ? e.clientY : e.clientX;
        s.lastT = e.timeStamp;
        dragged = true;
        scroller.style.scrollSnapType = "none";
        scroller.style.scrollBehavior = "auto";
        try {
          root.setPointerCapture(e.pointerId);
        } catch {
          /* the pointer already ended: the drag simply continues without capture */
        }
      }
      const pos = s.axis === "y" ? e.clientY : e.clientX;
      const delta = pos - (s.axis === "y" ? s.y : s.x);
      if (s.axis === "y") s.scroller!.scrollTop = s.origin - delta;
      else s.scroller!.scrollLeft = s.origin - delta;
      const dt = Math.max(1, e.timeStamp - s.lastT);
      s.v = 0.8 * s.v + 0.2 * ((s.last - pos) / dt); // px per ms, in scroll direction
      s.last = pos;
      s.lastT = e.timeStamp;
    };
    const end = (e: PointerEvent) => {
      if (!s) return;
      const { axis, scroller } = s;
      let v = e.timeStamp - s.lastT < 80 ? s.v * 16 : 0; // px per frame at release
      s = null;
      if (!axis || !scroller) return;
      const step = () => {
        v *= 0.95;
        if (Math.abs(v) < 0.4) {
          scroller.style.scrollSnapType = "";
          scroller.style.scrollBehavior = "";
          return;
        }
        if (axis === "y") scroller.scrollTop += v;
        else scroller.scrollLeft += v;
        frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    const click = (e: MouseEvent) => {
      if (!dragged) return;
      dragged = false;
      e.stopPropagation();
      e.preventDefault();
    };

    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", end);
    root.addEventListener("pointercancel", end);
    root.addEventListener("click", click, true);
    return () => {
      stopMomentum();
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", end);
      root.removeEventListener("pointercancel", end);
      root.removeEventListener("click", click, true);
    };
  }, [ref]);
}
