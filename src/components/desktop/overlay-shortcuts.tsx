"use client";

import { useLaunchpadShortcut } from "@/features/launchpad/hooks/use-launchpad-shortcut";
import { useMissionControlShortcut } from "@/features/mission-control/hooks/use-mission-control-shortcut";
import { useSpotlightShortcut } from "@/features/spotlight/hooks/use-spotlight-shortcut";

/** Keyboard shortcuts for overlays that load on demand, so they work before the overlay's code has arrived. */
export function OverlayShortcuts() {
  useSpotlightShortcut();
  useLaunchpadShortcut();
  useMissionControlShortcut();
  return null;
}
