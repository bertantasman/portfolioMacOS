"use client";

import { useState } from "react";
import Image from "next/image";

/** The configured profile image, or the name's initial when there is none (or it fails to load). */
export function ProfileAvatar({
  name,
  src,
  className = "size-20",
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <Image
        src={src}
        alt={`${name} profile photo`}
        width={160}
        height={160}
        quality={90}
        onError={() => setFailed(true)}
        className={`${className} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={`${name} (no profile photo)`}
      className={`${className} grid shrink-0 place-items-center rounded-full bg-black/10 text-[1.6em] font-semibold text-black/45`}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
