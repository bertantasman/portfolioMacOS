"use client";

import { useEffect, useRef } from "react";
import { useMobileStore } from "../store/mobile-store";

/**
 * The bar at the bottom of every app. A tap goes Home; swipe up goes Home; swipe up a little and hold opens the App
 * Switcher. Everything here is also a button somewhere else (the header's Home and Apps buttons), and the gesture only
 * starts on this strip, so it never competes with scrolling inside an app.
 */
export function HomeIndicator() {
  const goHome = useMobileStore((s) => s.goHome);
  const openOverlay = useMobileStore((s) => s.openOverlay);
  const state = useRef<{ y: number; hold: ReturnType<typeof setTimeout> | null; done: boolean } | null>(null);
  useEffect(() => () => {
    if (state.current?.hold) clearTimeout(state.current.hold);
  }, []);

  const clear = () => {
    if (state.current?.hold) clearTimeout(state.current.hold);
    state.current = null;
  };
  return (
    <button
      type="button"
      aria-label="Home. Swipe up and hold for the App Switcher."
      onClick={() => {
        // A drag also produces a click; only a plain tap should act here.
        if (state.current?.done) return;
        goHome();
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        state.current = { y: e.clientY, hold: null, done: false };
      }}
      onPointerMove={(e) => {
        const s = state.current;
        if (!s || s.done) return;
        const dy = s.y - e.clientY;
        if (dy > 120) {
          s.done = true;
          goHome();
        } else if (dy > 36 && !s.hold) {
          s.hold = setTimeout(() => {
            if (state.current) state.current.done = true;
            openOverlay("switcher");
          }, 350);
        } else if (dy <= 24 && s.hold) {
          clearTimeout(s.hold);
          s.hold = null;
        }
      }}
      onPointerUp={() => setTimeout(clear, 0)}
      onPointerCancel={clear}
      className="flex h-[calc(env(safe-area-inset-bottom)+28px)] w-full shrink-0 touch-none items-start justify-center pt-2 outline-none"
    >
      <span className="h-[5px] w-32 rounded-full bg-black/40 [button:focus-visible_&]:bg-(--accent)" />
    </button>
  );
}
