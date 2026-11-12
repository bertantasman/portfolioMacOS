"use client";

import { useEffect } from "react";
import { useOverlayStore } from "@/store/overlay-store";

/**
 * Ctrl+Shift+M toggles Mission Control. Browsers don't hand the native macOS Mission Control keys
 * to web pages, so this is a convenience; the Dock icon is the reliable way in.
 */
export function useMissionControlShortcut() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && !e.metaKey && !e.altKey && e.code === "KeyM") {
        e.preventDefault();
        useOverlayStore.getState().toggle("mission-control");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}
