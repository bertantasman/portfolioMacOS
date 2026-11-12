"use client";

import { useEffect } from "react";
import { useOverlayStore } from "@/store/overlay-store";

/**
 * Ctrl+Shift+L toggles Launchpad. Browsers don't expose the native macOS Launchpad
 * shortcuts, so this is only a convenience; the Dock icon is the reliable way in.
 */
export function useLaunchpadShortcut() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && !e.metaKey && !e.altKey && e.code === "KeyL") {
        e.preventDefault();
        useOverlayStore.getState().toggle("launchpad");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}
