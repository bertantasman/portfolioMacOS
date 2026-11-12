"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useOverlayStore } from "@/store/overlay-store";
import { GRID_SPACING, ICON_SIZE, desktopSortKeys, useDesktopStore, type DesktopSortKey } from "@/store/desktop-store";
import { sortDesktop } from "../lib/arrange";
import { getDesktopItems, getSortAvailability } from "../lib/layout";

const sortLabels: Record<DesktopSortKey, string> = { name: "Name", kind: "Kind", modified: "Date Modified", size: "Size" };

/** Compact desktop View Options. Every control here changes the desktop right away. */
export function ViewOptionsPanel() {
  const open = useOverlayStore((s) => s.active === "view-options");
  const reduced = useShouldReduceMotion();
  return <AnimatePresence>{open && <Panel key="vo" reduced={reduced} />}</AnimatePresence>;
}

function Panel({ reduced }: { reduced: boolean }) {
  const close = useOverlayStore((s) => s.close);
  const iconSize = useDesktopStore((s) => s.iconSize);
  const gridSpacing = useDesktopStore((s) => s.gridSpacing);
  const sortBy = useDesktopStore((s) => s.sortBy);
  const setIconSize = useDesktopStore((s) => s.setIconSize);
  const setGridSpacing = useDesktopStore((s) => s.setGridSpacing);
  const setSortBy = useDesktopStore((s) => s.setSortBy);
  const reset = useDesktopStore((s) => s.resetViewOptions);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);
  const duration = reduced ? 0 : 0.16;
  const available = getSortAvailability(getDesktopItems(sortBy));

  const dismiss = () => {
    close("view-options");
    const el = previousFocus.current;
    if (el instanceof HTMLElement && el.isConnected) requestAnimationFrame(() => el.focus());
  };

  useEffect(() => {
    previousFocus.current = document.activeElement;
    panelRef.current?.focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const row = "flex items-center gap-3";
  const label = "w-24 shrink-0 text-[12px] text-black/75";

  return (
    <motion.div
      className="fixed inset-0 z-(--z-notification-center)"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-label="Desktop View Options"
        tabIndex={-1}
        initial={reduced ? false : { y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reduced ? undefined : { y: -4, opacity: 0 }}
        transition={{ duration, ease: "easeOut" }}
        className="absolute top-[calc(1.75rem+env(safe-area-inset-top)+10px)] right-3 flex w-[320px] max-w-[calc(100vw-24px)] flex-col gap-3 rounded-[14px] border border-black/10 bg-window p-4 text-black shadow-[0_16px_50px_rgba(0,0,0,0.35)] outline-none backdrop-blur-2xl backdrop-saturate-150"
      >
        <h2 className="text-[13px] font-semibold text-black/85">View Options</h2>
        <div className={row}>
          <label htmlFor="vo-size" className={label}>
            Icon size
          </label>
          <input
            id="vo-size"
            type="range"
            min={ICON_SIZE.min}
            max={ICON_SIZE.max}
            step={1}
            value={iconSize}
            onChange={(e) => setIconSize(Number(e.target.value))}
            aria-valuetext={`${iconSize} pixels`}
            className="h-1 min-w-0 flex-1 accent-(--accent)"
          />
          <span className="w-9 text-right text-[11px] text-black/50 tabular-nums">{iconSize}px</span>
        </div>
        <div className={row}>
          <label htmlFor="vo-spacing" className={label}>
            Grid spacing
          </label>
          <input
            id="vo-spacing"
            type="range"
            min={GRID_SPACING.min}
            max={GRID_SPACING.max}
            step={1}
            value={gridSpacing}
            onChange={(e) => setGridSpacing(Number(e.target.value))}
            aria-valuetext={`${gridSpacing} pixels`}
            className="h-1 min-w-0 flex-1 accent-(--accent)"
          />
          <span className="w-9 text-right text-[11px] text-black/50 tabular-nums">{gridSpacing}px</span>
        </div>
        <div className={row}>
          <label htmlFor="vo-sort" className={label}>
            Sort by
          </label>
          <select
            id="vo-sort"
            value={sortBy ?? ""}
            onChange={(e) => {
              const value = e.target.value as DesktopSortKey | "";
              if (value === "") setSortBy(null);
              else sortDesktop(value);
            }}
            className="h-6 min-w-0 flex-1 rounded-md border border-black/10 bg-raised px-1.5 text-[12px] text-black/85 outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
          >
            <option value="">None</option>
            {desktopSortKeys.map((key) => (
              <option key={key} value={key} disabled={!available[key]}>
                {sortLabels[key]}
                {available[key] ? "" : " (no data)"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={reset}
            className="h-6 rounded-md bg-black/[0.07] px-2.5 text-[12px] text-black/75 outline-none hover:bg-black/[0.12] focus-visible:ring-2 focus-visible:ring-(--accent)"
          >
            Use Defaults
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
