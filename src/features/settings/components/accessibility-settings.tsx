"use client";

import { useReducedMotion } from "motion/react";
import { useSettingsStore } from "@/store/settings-store";
import { SettingsGroup, SettingsRow, SettingsToggle } from "./settings-controls";

export function AccessibilitySettings() {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const setReduceMotion = useSettingsStore((s) => s.setReduceMotion);
  const systemReduces = Boolean(useReducedMotion());

  return (
    <SettingsGroup title="Motion">
      <SettingsRow
        label="Reduce motion"
        htmlFor="reduce-motion"
        description="Turns off window, wallpaper and Dock animations, including the Dock bounce and magnification."
      >
        <SettingsToggle id="reduce-motion" label="Reduce motion" checked={reduceMotion} onChange={setReduceMotion} />
      </SettingsRow>
      {systemReduces && (
        <p className="px-3.5 py-2.5 text-[12px] text-black/50">
          Your device is already set to reduce motion, so motion stays reduced whatever you choose here.
        </p>
      )}
    </SettingsGroup>
  );
}
