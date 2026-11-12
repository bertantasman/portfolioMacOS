"use client";

import Image from "next/image";

interface AppIconProps {
  name: string;
  icon: string;
  onOpen: () => void;
  /** Hide the label (the Dock). The name stays as the accessible label. */
  hideLabel?: boolean;
  external?: boolean;
  /** A slightly smaller tile on short screens (the Dock). */
  compact?: boolean;
}

/** A home-screen icon: a 60 px tile with its label. At least 44 px tall to tap, with a visible pressed and focus state. */
export function AppIcon({ name, icon, onOpen, hideLabel, external, compact }: AppIconProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={external ? `${name} (opens in a new tab)` : name}
      className="group flex min-h-[44px] select-none flex-col items-center gap-1.5 rounded-2xl p-1 outline-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-white/90"
    >
      <Image src={icon} alt="" width={128} height={128} unoptimized loading="eager" draggable={false} className={`${compact ? "size-[60px] [@media(max-height:700px)]:size-[52px]" : "size-[60px]"} rounded-[14px] shadow-[0_3px_10px_rgba(0,0,0,0.28),inset_0_0_0_0.5px_rgba(255,255,255,0.25)] transition-[transform,filter] duration-150 ease-out group-active:scale-[0.88] group-active:brightness-90`} />
      {!hideLabel && <span aria-hidden className="max-w-[72px] truncate text-[11px] leading-3 font-medium tracking-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{name}</span>}
    </button>
  );
}
