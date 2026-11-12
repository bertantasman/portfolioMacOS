"use client";

import { useSettingsStore } from "@/store/settings-store";

/** Dimming at 50% brightness. Kept below full black so text and focus rings stay readable. */
const MAX_DIM = 0.45;

/**
 * Portfolio display brightness: a single black layer over the simulated desktop. It ignores the
 * pointer, so nothing underneath is blocked, and it never touches the visitor's real display.
 */
export function BrightnessOverlay() {
  const brightness = useSettingsStore((s) => s.brightness);
  if (brightness >= 100) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-(--z-brightness) bg-[#000]"
      style={{ opacity: ((100 - brightness) / 50) * MAX_DIM }}
    />
  );
}
