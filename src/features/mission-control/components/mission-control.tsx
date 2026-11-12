"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useOverlayStore } from "@/store/overlay-store";
import { useWindowStore } from "@/store/window-store";
import { useWindowOverview } from "../hooks/use-window-overview";
import type { Direction } from "../types/mission-control";
import { neighbour } from "../utils/mission-control-navigation";
import { MissionControlEmptyState } from "./mission-control-empty-state";
import { MissionControlTile, tileDomId } from "./mission-control-tile";

const arrows: Record<string, Direction> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };

/**
 * Mission Control: a desktop overlay (not a window). The real windows are scaled into place by the
 * window manager (see MissionControlWindowFrame); this adds the blurred backdrop beneath them and
 * the labels and hit targets above them.
 */
export function MissionControl() {
  const open = useOverlayStore((s) => s.active === "mission-control");
  const reduced = useShouldReduceMotion();
  const duration = reduced ? 0.01 : 0.25;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          aria-hidden
          // Under the windows: it blurs the wallpaper and desktop icons, not the windows themselves.
          className="fixed inset-0 z-(--z-mission-control-backdrop) bg-[rgb(0_0_0/0.3)] backdrop-blur-[14px] [:root[data-theme=dark]_&]:bg-[rgb(0_0_0/0.45)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
        />
      )}
      {open && <Overview key="overview" reduced={reduced} duration={duration} />}
    </AnimatePresence>
  );
}

function Overview({ reduced, duration }: { reduced: boolean; duration: number }) {
  const { windows, order, layout } = useWindowOverview();
  const [chosenId, setChosenId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);
  const launchedRef = useRef(false);

  // The keyboard selection starts on the active window, and moves off any window that has gone.
  const focused = windows.find((w) => w.isFocused);
  const selectedId = chosenId && order.includes(chosenId) ? chosenId : (focused?.id ?? order[0]);

  const close = () => useOverlayStore.getState().close("mission-control");

  useEffect(() => {
    previousFocus.current = document.activeElement;
    const dialog = dialogRef.current;
    return () => {
      const el = previousFocus.current;
      const active = document.activeElement;
      const free = !active || active === document.body || dialog?.contains(active);
      if (!launchedRef.current && free && el instanceof HTMLElement && el.isConnected) el.focus();
    };
  }, []);

  // Keep real focus on the selected preview so screen readers and focus rings follow it.
  useEffect(() => {
    if (selectedId) document.getElementById(tileDomId(selectedId))?.focus({ preventScroll: true });
  }, [selectedId]);

  const select = (id: string) => {
    const store = useWindowStore.getState();
    const target = store.windows.find((w) => w.id === id);
    if (!target) return close(); // it closed while the overview was open
    // The existing window is restored and raised; nothing is recreated, so its state is untouched.
    if (target.isMinimized) store.restoreWindow(id);
    else store.focusWindow(id);
    launchedRef.current = true;
    close();
    setTimeout(() => document.querySelector<HTMLElement>(`[data-window-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true }), 150);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.code === "KeyM") return; // the global toggle handles it
    if ((e.metaKey || e.ctrlKey) && e.code === "Space") return; // so does Spotlight's
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (order.length === 0 || !selectedId) return;
    const direction = arrows[e.key];
    if (direction) {
      e.preventDefault();
      setChosenId(neighbour(layout, order, selectedId, direction));
    } else if (e.key === "Tab") {
      // Tab steps through the previews (and wraps) instead of leaving the overview.
      e.preventDefault();
      const i = order.indexOf(selectedId);
      setChosenId(order[(i + (e.shiftKey ? -1 : 1) + order.length) % order.length]);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setChosenId(e.key === "Home" ? order[0] : order[order.length - 1]);
    }
  };

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Mission Control"
      onKeyDown={onKeyDown}
      // Same box as the windows' workspace, so the slots line up with the real windows.
      className="fixed inset-x-0 top-[calc(1.75rem+env(safe-area-inset-top))] bottom-0 z-(--z-mission-control) overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration }}
      // A press on empty space closes the overview; presses never reach the windows underneath.
      onPointerDown={(e) => {
        if (!(e.target as HTMLElement).closest("[data-mc-tile]")) close();
      }}
    >
      <p className="sr-only" aria-live="polite">
        {order.length === 0 ? "No open windows." : `${order.length} ${order.length === 1 ? "window" : "windows"}. Use the arrow keys to choose one and Return to open it.`}
      </p>
      {order.length === 0 ? (
        <MissionControlEmptyState onClose={close} />
      ) : (
        <div role="listbox" aria-label="Open windows" className="absolute inset-0">
          <AnimatePresence>
            {windows.map((win) => {
              const slot = layout[win.id];
              return slot ? (
                <MissionControlTile key={win.id} window={win} slot={slot} selected={win.id === selectedId} reduced={reduced} onSelect={select} />
              ) : null;
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
