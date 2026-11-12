"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useDisplayBounds } from "@/hooks/use-display-bounds";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import type { WindowState } from "@/types/window";
import type { OverviewSlot } from "../types/mission-control";
import { slotTransform } from "../utils/mission-control-layout";

interface FrameProps {
  window: WindowState;
  /** Where this window's preview goes while Mission Control is open. */
  slot: OverviewSlot | undefined;
  active: boolean;
  children: ReactNode;
}

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Wraps a real window. In Mission Control the wrapper moves and scales the window itself onto its
 * slot, so the preview is the live window (same state, same content) rather than a copy or a
 * screenshot. Outside Mission Control it is an identity transform and does nothing.
 */
export function MissionControlWindowFrame({ window: win, slot, active, children }: FrameProps) {
  const reduced = useShouldReduceMotion();
  const shown = useDisplayBounds(win);
  const target = active && slot ? slotTransform(slot, { x: shown.x, y: shown.y }) : { x: 0, y: 0, scale: 1 };
  return (
    <motion.div
      initial={false}
      animate={target}
      transition={{ duration: reduced ? 0 : 0.32, ease: EASE }}
      // Scale from the workspace corner; the window keeps its own position inside.
      style={{ originX: 0, originY: 0, zIndex: win.zIndex }}
      className="pointer-events-none absolute inset-0"
    >
      {children}
    </motion.div>
  );
}
