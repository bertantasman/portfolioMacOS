"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useMobileStore } from "../store/mobile-store";
import { useDragPan } from "./use-drag-pan";

interface OverlaySheetProps {
  label: string;
  children: ReactNode;
  /** Where the panel sits. */
  placement?: "top" | "full";
  className?: string;
}

/**
 * The shared frame for the four overlays. Only one is ever open (the store holds a single overlay), tapping outside or
 * pressing Escape closes it, focus moves into it and returns to where it was, and motion follows the reduce-motion setting.
 */
export function OverlaySheet({ label, children, placement = "top", className = "" }: OverlaySheetProps) {
  const close = useMobileStore((s) => s.closeOverlay);
  const reduced = useShouldReduceMotion();
  const panel = useRef<HTMLDivElement>(null);
  useDragPan(panel);

  useEffect(() => {
    const previous = document.activeElement;
    const target = panel.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panel.current;
    target?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      // After the layers underneath stop being inert, so the focus actually lands.
      requestAnimationFrame(() => {
        if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
      });
    };
  }, [close]);

  return (
    <motion.div className="absolute inset-0 z-40" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.18 }}>
      <button type="button" tabIndex={-1} aria-hidden onClick={close} className="absolute inset-0 size-full bg-black/45 backdrop-blur-sm" />
      <motion.div
        initial={reduced ? false : placement === "top" ? { y: "-100%" } : { scale: 0.96, opacity: 0 }}
        animate={placement === "top" ? { y: 0 } : { scale: 1, opacity: 1 }}
        exit={reduced ? undefined : placement === "top" ? { y: "-100%" } : { scale: 0.96, opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`absolute inset-x-0 flex flex-col text-white outline-none ${placement === "full" ? "inset-y-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" : "top-0 max-h-full rounded-b-[32px] border-b border-white/20 bg-[#1d1b2e]/90 pt-[env(safe-area-inset-top)] backdrop-blur-2xl"} ${className}`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
