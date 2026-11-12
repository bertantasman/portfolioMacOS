"use client";

import { motion } from "motion/react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import type { Box } from "../utils/onboarding-position";

const PAD = 6;
const dim = "fixed bg-[rgb(0_0_0/0.42)]";

/**
 * Dims the desktop around the highlighted element with four panels (top, bottom, left, right) that
 * also stop stray clicks, leaving the element itself open to use unless the step says otherwise. The
 * panels and the outline move together when the step changes.
 */
export function OnboardingOverlay({ box, interactive }: { box: Box; interactive: boolean }) {
  const reduced = useShouldReduceMotion();
  const hole = { left: box.left - PAD, top: box.top - PAD, width: box.width + PAD * 2, height: box.height + PAD * 2 };
  const transition = { duration: reduced ? 0 : 0.3, ease: [0.32, 0.72, 0, 1] as const };
  const right = hole.left + hole.width;
  const bottom = hole.top + hole.height;
  const vw = typeof window === "undefined" ? 0 : window.innerWidth;
  const vh = typeof window === "undefined" ? 0 : window.innerHeight;

  return (
    <div className="fixed inset-0 z-(--z-onboarding) overflow-hidden">
      <motion.div aria-hidden initial={false} animate={{ left: 0, top: 0, width: vw, height: Math.max(0, hole.top) }} transition={transition} className={dim} />
      <motion.div aria-hidden initial={false} animate={{ left: 0, top: bottom, width: vw, height: Math.max(0, vh - bottom) }} transition={transition} className={dim} />
      <motion.div aria-hidden initial={false} animate={{ left: 0, top: hole.top, width: Math.max(0, hole.left), height: hole.height }} transition={transition} className={dim} />
      <motion.div aria-hidden initial={false} animate={{ left: right, top: hole.top, width: Math.max(0, vw - right), height: hole.height }} transition={transition} className={dim} />
      <motion.div aria-hidden initial={false} animate={hole} transition={transition} className="pointer-events-none fixed rounded-2xl border-2 border-(--accent)" />
      {/* A step whose target shouldn't be clicked gets an invisible cover over it. */}
      {!interactive && <div aria-hidden className="fixed bg-transparent" style={hole} />}
    </div>
  );
}
