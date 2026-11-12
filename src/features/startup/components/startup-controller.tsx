"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useStartupStore } from "@/store/startup-store";
import { useWindowStore } from "@/store/window-store";
import { takeSavedFocus } from "../utils/lock";
import { startupTiming } from "../utils/startup-timing";
import { BootScreen } from "./boot-screen";
import { LockScreen } from "./lock-screen";

/**
 * Runs the startup experience on top of the desktop. The desktop is never unmounted: while a startup
 * screen is up it is simply made inert and covered, so windows, settings and notifications carry on
 * untouched underneath.
 */
export function StartupController() {
  const phase = useStartupStore((s) => s.phase);
  const hydrate = useStartupStore((s) => s.hydrate);
  const completeUnlock = useStartupStore((s) => s.completeUnlock);
  const reduced = useShouldReduceMotion();
  const previousPhase = useRef(phase);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // The inline script marks first visits so the cover is up before React; hand over once the phase is known.
  useEffect(() => {
    if (phase !== "initializing") delete document.documentElement.dataset.startup;
  }, [phase]);

  // The desktop cannot be clicked, focused or read by assistive tech while a startup screen is showing.
  const covered = phase === "booting" || phase === "locked" || phase === "unlocking";
  useEffect(() => {
    const main = document.querySelector("main");
    main?.toggleAttribute("inert", covered);
    return () => main?.removeAttribute("inert");
  }, [covered]);

  // Keyboard shortcuts for the desktop (Spotlight, Launchpad, …) are ignored while covered. Plain keys
  // still reach the startup screens, and browser shortcuts are left alone.
  useEffect(() => {
    if (!covered) return;
    const block = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) e.stopImmediatePropagation();
    };
    window.addEventListener("keydown", block, true);
    return () => window.removeEventListener("keydown", block, true);
  }, [covered]);

  // After the unlock transition, the desktop becomes interactive.
  useEffect(() => {
    if (phase !== "unlocking") return;
    const timer = setTimeout(completeUnlock, reduced ? 0 : startupTiming.unlock);
    return () => clearTimeout(timer);
  }, [phase, reduced, completeUnlock]);

  // Back on the desktop: give focus back to the window that was active, else to where it was.
  useEffect(() => {
    const was = previousPhase.current;
    previousPhase.current = phase;
    if (phase !== "desktop" || was !== "unlocking") return;
    const saved = takeSavedFocus();
    const focusedId = useWindowStore.getState().focusedWindowId;
    const target =
      (focusedId && document.querySelector<HTMLElement>(`[data-window-id="${CSS.escape(focusedId)}"]`)) ||
      (saved instanceof HTMLElement && saved.isConnected && saved !== document.body ? saved : null);
    target?.focus({ preventScroll: true });
  }, [phase]);

  return (
    <AnimatePresence>
      {phase === "initializing" && (
        // Server-rendered; shown only on first visits (see globals.css), so returning visitors never see it.
        <div key="cover" aria-hidden className="startup-cover fixed inset-0 z-(--z-startup) bg-[#0b0b0d]" />
      )}
      {phase === "booting" && <BootScreen key="boot" />}
      {(phase === "locked" || phase === "unlocking") && <LockScreen key="lock" unlocking={phase === "unlocking"} />}
    </AnimatePresence>
  );
}
