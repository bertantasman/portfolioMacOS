"use client";

import { motion } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { takeTouchOrigin } from "../lib/last-touch";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { HomeIndicator } from "./home-indicator";
import { useDragPan } from "./use-drag-pan";

/** One app, full screen, opening with a short scale and fade (instant when motion is reduced). */
export function AppFrame({ label, children }: { label: string; children: ReactNode }) {
  const reduced = useShouldReduceMotion();
  // Read once when the app opens: the app grows out of the icon that was tapped and shrinks back into the same spot.
  const [origin] = useState(takeTouchOrigin);
  const ref = useRef<HTMLDivElement>(null);
  useDragPan(ref);
  return (
    <motion.div
      ref={ref}
      role="region"
      aria-label={label}
      className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-surface pt-[env(safe-area-inset-top)] text-black will-change-transform"
      style={{ transformOrigin: origin }}
      initial={reduced ? false : { opacity: 0, scale: 0.18, borderRadius: 40 }}
      animate={{ opacity: 1, scale: 1, borderRadius: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.18, borderRadius: 40 }}
      transition={{ duration: reduced ? 0 : 0.38, ease: [0.22, 1, 0.36, 1], opacity: { duration: reduced ? 0 : 0.18 } }}
    >
      {children}
      <HomeIndicator />
    </motion.div>
  );
}
