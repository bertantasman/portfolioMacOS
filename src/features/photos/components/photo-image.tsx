"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { PortfolioMedia } from "@/types/media";

interface PhotoImageProps {
  media: PortfolioMedia;
  /** Use the smaller thumbnail file when one is configured. */
  thumbnail?: boolean;
  /** Fill a sized, positioned parent (grid cells); otherwise use the intrinsic size. */
  fill?: boolean;
  sizes: string;
  className?: string;
}

/** An image that shows a quiet placeholder instead of a broken-image icon if its file is missing. */
export function PhotoImage({ media, thumbnail = false, fill = false, sizes, className }: PhotoImageProps) {
  const [failed, setFailed] = useState(false);
  const src = thumbnail ? (media.thumbnailSrc ?? media.src) : media.src;

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`Image unavailable: ${media.alt}`}
        className={`grid place-items-center bg-black/[0.06] text-black/30 ${fill ? "absolute inset-0" : "size-full"}`}
      >
        <ImageOff className="size-1/4 max-h-10 max-w-10" strokeWidth={1.5} aria-hidden />
      </div>
    );
  }

  const onError = () => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[photos] Could not load "${src}" for media "${media.id}".`);
    }
    setFailed(true);
  };

  return fill ? (
    <Image src={src} alt={media.alt} fill sizes={sizes} quality={90} onError={onError} className={className} />
  ) : (
    <Image
      src={src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      quality={90}
      onError={onError}
      className={className}
    />
  );
}
