"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Laptop } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useStartupStore } from "@/store/startup-store";
import { useStartupSequence } from "../hooks/use-startup-sequence";
import { startupTiming } from "../utils/startup-timing";

/** Minimal boot screen: the portfolio's own monogram (never an Apple logo) and a thin progress bar. */
export function BootScreen() {
  const reduced = useShouldReduceMotion();
  const finishBoot = useStartupStore((s) => s.finishBoot);
  const { progress } = useStartupSequence(reduced);
  const [skipVisible, setSkipVisible] = useState(false);
  const initial = siteConfig.owner.name.trim().charAt(0).toUpperCase();

  useEffect(() => {
    const timer = setTimeout(() => setSkipVisible(true), startupTiming.skipDelay);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") finishBoot();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [finishBoot]);

  const duration = reduced ? 0 : startupTiming.fade / 1000;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio startup screen"
      className="fixed inset-0 z-(--z-startup) overflow-hidden bg-[#0b0b0d] text-white"
      initial={false}
      exit={{ opacity: 0 }}
      transition={{ duration }}
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-12">
          <span aria-hidden className="grid size-20 place-items-center rounded-[22px] bg-white/[0.07] text-white/90 ring-1 ring-white/10">
            {initial ? <span className="text-[38px] leading-none font-light">{initial}</span> : <Laptop className="size-9" strokeWidth={1.25} />}
          </span>
          {/* Thin bar that follows real start-up steps. No percentage is shown. */}
          <div role="progressbar" aria-label="Starting up" className="h-[3px] w-[200px] overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full origin-left rounded-full bg-white/85"
              initial={false}
              animate={{ scaleX: Math.max(0.06, progress) }}
              transition={{ duration: reduced ? 0 : 0.35, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] flex justify-center">
        <button
          type="button"
          onClick={finishBoot}
          aria-label="Skip introduction"
          tabIndex={skipVisible ? 0 : -1}
          className={`rounded-full px-4 py-1.5 text-[13px] text-white/60 outline-none transition-opacity duration-300 hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-white/70 ${
            skipVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          Skip
        </button>
      </div>
    </motion.div>
  );
}
