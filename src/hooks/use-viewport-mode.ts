"use client";

import { useSyncExternalStore } from "react";

export type ViewportMode = "desktop" | "tablet" | "compact";

import { COMPACT_QUERY, TABLET_QUERY } from "@/lib/viewport";

function subscribe(onChange: () => void) {
  const lists = [matchMedia(COMPACT_QUERY), matchMedia(TABLET_QUERY)];
  lists.forEach((l) => l.addEventListener("change", onChange));
  return () => lists.forEach((l) => l.removeEventListener("change", onChange));
}

const getSnapshot = (): ViewportMode => (matchMedia(COMPACT_QUERY).matches ? "compact" : matchMedia(TABLET_QUERY).matches ? "tablet" : "desktop");
// The server cannot know the viewport; the layout is CSS-responsive until the client reports it.
const getServerSnapshot = (): ViewportMode => "desktop";

/** The viewport class, from media queries (not resize events), so it only changes when a breakpoint is crossed. */
export function useViewportMode(): ViewportMode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
