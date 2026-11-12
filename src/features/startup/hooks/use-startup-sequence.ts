"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { useStartupStore } from "@/store/startup-store";
import { startupTiming } from "../utils/startup-timing";

/** Real readiness steps the boot bar reflects. Each one is optional: none can hold the visitor up. */
const MILESTONES = 3;

/**
 * Drives the boot screen. The bar advances with real milestones (fonts ready, saved settings loaded,
 * first frame painted), and the screen ends once they are done and a short minimum time has passed,
 * or at the maximum, whichever comes first. Skip simply ends it sooner.
 */
export function useStartupSequence(reduced: boolean) {
  const settingsReady = useSettingsStore((s) => s.hydrated);
  const finishBoot = useStartupStore((s) => s.finishBoot);
  const [fontsReady, setFontsReady] = useState(false);
  const [framePainted, setFramePainted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // document.fonts may be missing in old browsers; treat that as ready.
    Promise.resolve(document.fonts?.ready)
      .catch(() => undefined)
      .then(() => !cancelled && setFontsReady(true));
    const frame = requestAnimationFrame(() => setFramePainted(true));
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  const count = (fontsReady ? 1 : 0) + (settingsReady ? 1 : 0) + (framePainted ? 1 : 0);

  const minimum = reduced ? startupTiming.bootMinimumReduced : startupTiming.bootMinimum;
  const [minElapsed, setMinElapsed] = useState(false);
  useEffect(() => {
    const min = setTimeout(() => setMinElapsed(true), minimum);
    const max = setTimeout(finishBoot, startupTiming.bootMaximum);
    return () => {
      clearTimeout(min);
      clearTimeout(max);
    };
  }, [minimum, finishBoot]);

  useEffect(() => {
    if (minElapsed && count === MILESTONES) finishBoot();
  }, [minElapsed, count, finishBoot]);

  return { progress: count / MILESTONES };
}
