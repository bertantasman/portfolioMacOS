"use client";

import { useState } from "react";
import Image from "next/image";
import { AppWindow } from "lucide-react";
import type { ApplicationDefinition } from "@/types/application";

interface LaunchpadIconProps {
  app: ApplicationDefinition;
  size: number;
  selected: boolean;
  /** The icon being dragged: its slot shows where it will land. */
  placeholder: boolean;
  dragEnabled: boolean;
  onActivate: () => void;
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
}

export const optionDomId = (id: string) => `launchpad-option-${id}`;

/** The registry's icon, drawn the same way as in the Dock. Falls back to a generic glyph if it fails to load. */
export function AppIconImage({ app, size }: { app: ApplicationDefinition; size: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        className="grid place-items-center rounded-[22%] bg-white/25 text-white"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <AppWindow style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={1.5} />
      </span>
    );
  }
  return (
    <Image
      src={app.icon}
      alt=""
      width={128}
      height={128}
      unoptimized
      draggable={false}
      onError={() => setFailed(true)}
      className="select-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
      style={{ width: size, height: size }}
    />
  );
}

export function LaunchpadIcon({ app, size, selected, placeholder, dragEnabled, onActivate, onPointerDown }: LaunchpadIconProps) {
  return (
    <button
      type="button"
      role="option"
      id={optionDomId(app.id)}
      aria-selected={selected}
      aria-label={app.name}
      tabIndex={-1}
      data-launchpad-keep
      onClick={onActivate}
      onPointerDown={onPointerDown}
      // Keep focus in the search field so keyboard control continues after a mouse press.
      onMouseDown={(e) => e.preventDefault()}
      className={`group flex size-full flex-col items-center justify-start gap-2 rounded-2xl px-1 pt-2 pb-1 outline-none transition-colors duration-100 hover:bg-white/10 ${
        selected ? "bg-white/20 ring-2 ring-(--accent)" : ""
      } ${placeholder ? "opacity-35" : ""} ${dragEnabled ? "cursor-grab touch-none" : "cursor-pointer"}`}
    >
      <span className="transition-[filter] duration-100 group-hover:brightness-110 group-active:brightness-90">
        <AppIconImage app={app} size={size} />
      </span>
      <span
        title={app.name}
        className="w-full truncate px-0.5 text-center text-[13px] leading-4 font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]"
      >
        {app.name}
      </span>
    </button>
  );
}
