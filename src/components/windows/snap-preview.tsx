"use client";

import { AnimatePresence, motion } from "motion/react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useSnapPreviewStore } from "@/store/snap-preview-store";

/**
 * The outline shown while a window is dragged into a snap zone. It ignores the pointer, so it never
 * interferes with dragging, the Dock or the menu bar, and it exists only while a drag is under way.
 */
export function SnapPreview() {
  const bounds = useSnapPreviewStore((s) => s.bounds);
  const reduced = useShouldReduceMotion();
  const box = bounds ? { left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height } : null;
  return (
    <AnimatePresence>
      {box && (
        <motion.div
          key="snap-preview"
          aria-hidden
          initial={reduced ? false : { opacity: 0, ...box }}
          animate={{ opacity: 1, ...box }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.16, ease: "easeOut" }}
          className="pointer-events-none absolute z-(--z-windows) rounded-xl border border-[color-mix(in_srgb,var(--accent)_65%,transparent)] bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset]"
        />
      )}
    </AnimatePresence>
  );
}
