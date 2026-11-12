"use client";

import { useEffect } from "react";
import { preloadAllWhenIdle } from "@/components/windows/app-loaders";
import { preloadOverlays } from "./overlay-loaders";

/** Warms the application chunks once the desktop is idle. Renders nothing. */
export function AppPreloader() {
  useEffect(() => preloadAllWhenIdle(preloadOverlays), []);
  return null;
}
