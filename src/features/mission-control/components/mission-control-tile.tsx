"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { applications } from "@/config/applications";
import type { OverviewSlot, OverviewWindow } from "../types/mission-control";

interface TileProps {
  window: OverviewWindow;
  slot: OverviewSlot;
  selected: boolean;
  reduced: boolean;
  onSelect: (id: string) => void;
}

export const tileDomId = (id: string) => `mission-control-window-${id}`;

/**
 * The interactive layer for one window: a transparent button over the live window plus its label.
 * The window itself is drawn by the window manager; nothing is rendered twice.
 */
export function MissionControlTile({ window: win, slot, selected, reduced, onSelect }: TileProps) {
  const app = applications.find((a) => a.id === win.appId);
  const appName = app?.name ?? "Window";
  // Only repeat the application's name when the title doesn't already say it.
  const showApp = !win.title.toLowerCase().includes(appName.toLowerCase());
  const status = [win.isMinimized ? "minimized" : null, win.isFocused ? "active" : null].filter(Boolean).join(", ");
  const box = { left: slot.x, top: slot.y, width: slot.width, height: slot.height };

  return (
    <motion.div
      className="absolute"
      initial={reduced ? false : { opacity: 0, ...box }}
      animate={{ opacity: 1, ...box }}
      exit={reduced ? undefined : { opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.32, ease: [0.32, 0.72, 0, 1] }}
    >
      <button
        type="button"
        role="option"
        id={tileDomId(win.id)}
        aria-selected={selected}
        aria-label={`${appName}: ${win.title}${status ? `, ${status}` : ""}`}
        data-mc-tile
        tabIndex={selected ? 0 : -1}
        onClick={() => onSelect(win.id)}
        className={`absolute inset-0 cursor-pointer rounded-[10px] outline-none transition-[box-shadow,background-color] duration-100 hover:bg-white/10 hover:shadow-[0_0_0_3px_var(--accent)] focus-visible:shadow-[0_0_0_3px_var(--accent)] ${
          selected ? "shadow-[0_0_0_3px_var(--accent)]" : win.isFocused ? "shadow-[0_0_0_1.5px_rgba(255,255,255,0.55)]" : ""
        }`}
      />
      <div
        className="pointer-events-none absolute top-full left-1/2 mt-2 flex -translate-x-1/2 flex-col items-center text-center"
        style={{ width: Math.max(slot.width, Math.min(slot.labelWidth, 220)) }}
      >
        <span className="flex max-w-full items-center gap-1.5">
          {app && <Image src={app.icon} alt="" width={64} height={64} unoptimized draggable={false} className="size-[18px] shrink-0" />}
          <span className="truncate text-[13px] leading-4 font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{win.title}</span>
        </span>
        <span className="max-w-full truncate text-[11px] leading-4 text-white/70 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
          {[showApp ? appName : null, win.isMinimized ? "Minimized" : null].filter(Boolean).join(" · ")}
        </span>
      </div>
    </motion.div>
  );
}
