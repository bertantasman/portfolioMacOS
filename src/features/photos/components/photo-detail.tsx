"use client";

import { motion } from "motion/react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import type { PortfolioMedia } from "@/types/media";
import { PhotoImage } from "./photo-image";
import { PhotoMetadata } from "./photo-metadata";

export function PhotoDetail({ media, infoOpen }: { media: PortfolioMedia; infoOpen: boolean }) {
  const reduced = useShouldReduceMotion();
  return (
    <div className="flex min-h-0 flex-1">
      <div className="relative min-w-0 flex-1 bg-[#1c1c1e]">
        <motion.div
          key={media.id}
          initial={reduced ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 flex items-center justify-center p-4"
        >
          <PhotoImage
            media={media}
            sizes="(max-width: 1200px) 70vw, 900px"
            className="h-auto max-h-full w-auto max-w-full rounded-sm object-contain shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          />
        </motion.div>
      </div>
      {infoOpen && <PhotoMetadata media={media} />}
    </div>
  );
}
