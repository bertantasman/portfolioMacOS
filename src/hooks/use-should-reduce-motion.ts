"use client";

import { useReducedMotion } from "motion/react";
import { useSettingsStore } from "@/store/settings-store";

/**
 * True when motion should be reduced: the OS asks for it OR the visitor turned
 * on Reduce Motion in System Settings. The app never overrides either choice.
 */
export function useShouldReduceMotion(): boolean {
  const system = useReducedMotion();
  const preference = useSettingsStore((s) => s.reduceMotion);
  return Boolean(system) || preference;
}
