"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { getWallpaper } from "@/config/wallpapers";
import { profile } from "@/data/profile";
import { ProfileAvatar } from "@/features/social/components/profile-avatar";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useSettingsStore } from "@/store/settings-store";
import { useStartupStore } from "@/store/startup-store";
import { useLockClock } from "../hooks/use-lock-clock";
import { startupTiming } from "../utils/startup-timing";

/**
 * The lock screen: a presentation layer, not a security boundary. It shows the current wallpaper,
 * the time and date, and the developer profile, with one action: Enter Desktop. No password,
 * no biometrics, nothing pretending to protect anything.
 */
export function LockScreen({ unlocking }: { unlocking: boolean }) {
  const reduced = useShouldReduceMotion();
  const unlock = useStartupStore((s) => s.unlock);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const wallpaperId = useSettingsStore((s) => s.wallpaperId);
  const wallpaper = getWallpaper(wallpaperId);
  const { time, date } = useLockClock();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const name = profile.displayName?.trim() || "Portfolio";
  const headline = profile.headline?.trim();

  // Focus the one action, and let Enter work even when focus has drifted to the page itself.
  useEffect(() => {
    buttonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.ctrlKey || e.metaKey || e.altKey) return;
      const active = document.activeElement;
      if (!active || active === document.body) {
        e.preventDefault();
        unlock();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [unlock]);

  const full = reduced ? 0 : startupTiming.unlock / 1000;
  const fade = reduced ? 0 : startupTiming.fade / 1000;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Lock screen"
      className="fixed inset-0 z-(--z-startup) overflow-hidden text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: unlocking ? 0 : 1 }}
      transition={{ duration: unlocking ? full : fade, ease: "easeOut" }}
      // Clicking empty space also continues; the button below stays the clear, labelled way in.
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[data-lock-card]")) unlock();
      }}
    >
      {/* Same wallpaper, same image URL as the desktop, so nothing extra is downloaded. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: wallpaper.fallbackColor }}
        animate={{ scale: unlocking && !reduced ? 1.04 : 1 }}
        transition={{ duration: full, ease: "easeOut" }}
      >
        {hydrated && !imageFailed && (
          <Image
            key={wallpaper.id}
            src={wallpaper.src}
            alt=""
            fill
            priority
            quality={90}
            sizes="100vw"
            draggable={false}
            onError={() => setImageFailed(true)}
            className="object-cover select-none"
          />
        )}
        <div className="absolute inset-0 bg-[rgb(0_0_0/0.25)] backdrop-blur-[6px] [:root[data-theme=dark]_&]:bg-[rgb(0_0_0/0.42)]" />
      </motion.div>

      <motion.div
        className="relative flex h-dvh flex-col items-center justify-between px-6 pt-[max(12vh,3rem)] pb-[max(2.5rem,env(safe-area-inset-bottom))]"
        animate={{ opacity: unlocking ? 0 : 1, y: unlocking && !reduced ? -8 : 0 }}
        transition={{ duration: reduced ? 0 : 0.25 }}
      >
        <div className="flex flex-col items-center text-center [text-shadow:0_2px_14px_rgba(0,0,0,0.35)]">
          {/* Reserved height, so the layout does not jump when the client fills in the time. */}
          <p className="min-h-[1.5em] text-[clamp(15px,2.4vw,22px)] font-medium text-white/90">{date}</p>
          <p aria-label={time ? `Current time ${time}` : undefined} className="min-h-[1em] text-[clamp(64px,14vw,132px)] leading-none font-light tracking-tight tabular-nums">
            {time}
          </p>
        </div>

        <div data-lock-card className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-2 ring-white/50 [&>[role=img]]:bg-white/25 [&>[role=img]]:text-white">
            <ProfileAvatar name={name} src={profile.avatar} className="size-[clamp(64px,12vw,88px)]" />
          </div>
          <h1 className="text-[clamp(18px,3vw,22px)] font-semibold [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">{name}</h1>
          {headline && <p className="-mt-2 max-w-[320px] text-[14px] text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">{headline}</p>}
          <button
            ref={buttonRef}
            type="button"
            onClick={unlock}
            disabled={unlocking}
            aria-label="Enter desktop"
            className="mt-2 h-10 min-w-[150px] rounded-full bg-(--accent) px-6 text-[14px] font-medium text-(--accent-fg) shadow-[0_6px_20px_rgba(0,0,0,0.3)] outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 active:brightness-95 disabled:opacity-80"
          >
            Enter Desktop
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
