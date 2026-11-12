"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { getWallpaper } from "@/config/wallpapers";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useSettingsStore } from "@/store/settings-store";

/**
 * The selected wallpaper. Nothing but the fallback colour is drawn until saved
 * settings have loaded, so a returning visitor never sees the wrong wallpaper
 * flash. Changing wallpapers cross-fades (instantly when motion is reduced).
 */
export function DesktopBackground() {
  const hydrated = useSettingsStore((s) => s.hydrated);
  const wallpaperId = useSettingsStore((s) => s.wallpaperId);
  const reduced = useShouldReduceMotion();
  const wallpaper = getWallpaper(wallpaperId);
  const duration = reduced ? 0 : 0.45;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-(--z-wallpaper) overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: wallpaper.fallbackColor }}
    >
      <AnimatePresence initial={false}>
        {hydrated && (
          <motion.div
            key={wallpaper.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // Keep the old wallpaper fully visible underneath until the new one has faded in.
            exit={{ opacity: 1, transition: { duration } }}
            transition={{ duration }}
          >
            <Image
              src={wallpaper.src}
              alt=""
              fill
              priority
              quality={90}
              sizes="100vw"
              draggable={false}
              className="object-cover select-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
