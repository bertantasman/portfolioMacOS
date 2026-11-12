"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { getAccent } from "@/config/appearance";
import { useSettingsStore } from "@/store/settings-store";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Loads saved settings after hydration and applies them to the document:
 * theme (data-theme), accent colour, and reduce-motion. The matching inline
 * script in the layout applies the same values before first paint.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const appearance = useSettingsStore((s) => s.appearance);
  const accentColor = useSettingsStore((s) => s.accentColor);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  useEffect(() => {
    void Promise.resolve(useSettingsStore.persist.rehydrate()).finally(() => {
      useSettingsStore.setState({ hydrated: true });
    });
  }, []);

  // Theme. In Auto mode, follow the system and react to it changing.
  useEffect(() => {
    const root = document.documentElement;
    if (appearance !== "auto") {
      root.dataset.theme = appearance;
      return;
    }
    const query = window.matchMedia(DARK_QUERY);
    const apply = () => {
      root.dataset.theme = query.matches ? "dark" : "light";
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [appearance]);

  useEffect(() => {
    const accent = getAccent(accentColor);
    const style = document.documentElement.style;
    style.setProperty("--accent-color", accent.value);
    style.setProperty("--accent-fg", accent.foreground);
  }, [accentColor]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
  }, [reduceMotion]);

  // "user" honours the OS setting; "always" is the visitor's own Reduce Motion choice.
  return <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>{children}</MotionConfig>;
}
