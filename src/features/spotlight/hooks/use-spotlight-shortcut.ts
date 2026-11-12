"use client";

import { useEffect } from "react";
import { useOverlayStore } from "@/store/overlay-store";

/**
 * Cmd+Space (macOS) or Ctrl+Space toggles Spotlight. One listener, mounted once.
 * Browsers and operating systems may reserve this shortcut, so the menu bar
 * icon opens the same overlay as a reliable alternative.
 */
export function useSpotlightShortcut() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.code === "Space") {
        e.preventDefault();
        useOverlayStore.getState().toggle("spotlight");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}
