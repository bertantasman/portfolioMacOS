"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useContextMenuStore } from "@/store/context-menu-store";

/** A small, brief confirmation (or error) for actions like Copy Name. Announced to screen readers. */
export function ContextMenuToast() {
  const toast = useContextMenuStore((s) => s.toast);
  const clearToast = useContextMenuStore((s) => s.clearToast);
  const reduced = useShouldReduceMotion();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => clearToast(toast.id), toast.tone === "error" ? 4500 : 1800);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          role={toast.tone === "error" ? "alert" : "status"}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.16 }}
          className="pointer-events-none absolute bottom-[112px] left-1/2 z-(--z-notifications) max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-full border border-black/10 bg-window px-3.5 py-1.5 text-[12px] text-black/85 shadow-[0_8px_28px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
        >
          {toast.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
