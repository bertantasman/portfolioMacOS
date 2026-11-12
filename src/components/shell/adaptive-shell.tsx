"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { MOBILE_QUERY, type ShellMode } from "@/lib/shell-mode";

// Each shell is its own chunk, so a phone never downloads the desktop's code (and the reverse).
const DesktopShell = dynamic(() => import("./desktop-shell"), { ssr: false });
const MobileShell = dynamic(() => import("@/features/mobile/components/mobile-shell"), { ssr: false });

const subscribe = (onChange: () => void) => {
  const list = matchMedia(MOBILE_QUERY);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
};
const getSnapshot = (): ShellMode => (matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop");
// The server cannot know the viewport, so it renders only a neutral splash; the client picks one shell after hydration.
const getServerSnapshot = (): ShellMode | null => null;

/**
 * Chooses between the desktop and the mobile shell with a media query (not resize events), so it only switches when the
 * breakpoint is crossed. Only the active shell is mounted: the other one's listeners and timers do not run.
 */
export function AdaptiveShell() {
  const mode = useSyncExternalStore<ShellMode | null>(subscribe, getSnapshot, getServerSnapshot);
  if (mode === null) return <div aria-hidden className="fixed inset-0 bg-[#2a1a78]" />;
  return mode === "mobile" ? <MobileShell /> : <DesktopShell />;
}
