"use client";

import { motion } from "motion/react";
import { ChevronUp } from "lucide-react";
import { profile } from "@/data/profile";
import { useLockClock } from "@/features/startup/hooks/use-lock-clock";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useMobileStore } from "../store/mobile-store";
import { useSwipe } from "./use-swipe";
import { Wallpaper } from "./wallpaper";

/** The mobile lock screen: the time, who this is, and three ways in (swipe up, tap Enter Portfolio, or the keyboard). */
export function LockScreen({ unlocking }: { unlocking: boolean }) {
  const { time, date } = useLockClock();
  const unlock = useMobileStore((s) => s.unlock);
  const finishUnlock = useMobileStore((s) => s.finishUnlock);
  const reduced = useShouldReduceMotion();
  const swipe = useSwipe((d) => d === "up" && unlock(), 60);
  const name = (profile.fullName ?? profile.displayName)?.trim();

  return (
    <motion.div
      role="dialog"
      aria-label="Lock screen"
      className="absolute inset-0 z-50 touch-none overflow-hidden text-white"
      {...swipe.handlers}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "Escape") unlock();
      }}
      initial={false}
      animate={unlocking ? { y: "-100%", opacity: reduced ? 0 : 0.6 } : { y: 0, opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.32, ease: [0.32, 0.72, 0, 1] }}
      onAnimationComplete={() => unlocking && finishUnlock()}
    >
      <Wallpaper />
      <div className="absolute inset-0 bg-black/10" aria-hidden />
      <div className="relative flex size-full flex-col items-center px-6 pt-[calc(env(safe-area-inset-top)+56px)] pb-[calc(env(safe-area-inset-bottom)+20px)] text-center">
        <p className="text-[17px] font-medium text-white/90">{date || " "}</p>
        <p className="text-[84px] leading-[1] font-light tracking-tight tabular-nums [text-shadow:0_2px_16px_rgba(0,0,0,0.25)] max-[360px]:text-[68px]" suppressHydrationWarning>
          {time || " "}
        </p>
        <div className="mt-auto flex flex-col items-center gap-3">
          <p className="text-[20px] font-semibold">{name}</p>
          {profile.headline && <p className="max-w-[28ch] text-[14px] text-white/80">{profile.headline}</p>}
          <button
            type="button"
            autoFocus
            onClick={unlock}
            className="mt-3 h-12 rounded-full bg-white/90 px-8 text-[16px] font-semibold text-black outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-95"
          >
            Enter Portfolio
          </button>
          <p className="mt-3 flex items-center gap-1 text-[13px] text-white/75">
            <ChevronUp className="size-4" aria-hidden />
            Swipe up to open
          </p>
        </div>
      </div>
    </motion.div>
  );
}
