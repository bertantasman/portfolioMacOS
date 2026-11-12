"use client";

import { useLayoutEffect, useRef } from "react";
import { useViewportMode } from "@/hooks/use-viewport-mode";
import { AnimatePresence } from "motion/react";
import { MissionControlWindowFrame } from "@/features/mission-control/components/mission-control-window";
import { useWindowOverview } from "@/features/mission-control/hooks/use-window-overview";
import { dockIconSize } from "@/config/appearance";
import { useSettingsStore } from "@/store/settings-store";
import { SnapPreview } from "./snap-preview";
import { useOverlayStore } from "@/store/overlay-store";
import { useWindowStore } from "@/store/window-store";
import { MacWindow } from "./mac-window";

/**
 * Renders every window inside the workspace (the area below the menu bar) and
 * reports that area's size to the store for maximizing and clamping.
 */
export function WindowManager() {
  const windows = useWindowStore((s) => s.windows);
  const focusedId = useWindowStore((s) => s.focusedWindowId);
  const setWorkspace = useWindowStore((s) => s.setWorkspace);
  const overviewOpen = useOverlayStore((s) => s.active === "mission-control");
  const { layout } = useWindowOverview(overviewOpen);
  const ref = useRef<HTMLDivElement>(null);
  const dockSize = useSettingsStore((s) => s.dockSize);
  const setDockClearance = useWindowStore((s) => s.setDockClearance);
  const setCompact = useWindowStore((s) => s.setCompact);
  const compact = useViewportMode() === "compact";
  // Phone layout: only the top window is visible; the others stay mounted underneath with their state.
  const topId = compact ? windows.filter((w) => !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0]?.id : undefined;

  // The Dock covers the bottom of the workspace; snapped and maximized windows stop above it.
  useLayoutEffect(() => {
    setDockClearance(dockIconSize(dockSize) + 36);
  }, [dockSize, setDockClearance]);

  useLayoutEffect(() => {
    setCompact(compact);
  }, [compact, setCompact]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const report = () => setWorkspace({ width: el.clientWidth, height: el.clientHeight });
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, [setWorkspace]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-x-0 top-[calc(1.75rem+env(safe-area-inset-top))] bottom-0 isolate z-(--z-windows)"
    >
      <SnapPreview />
      <AnimatePresence>
        {windows.map((win) => (
          <MissionControlWindowFrame key={win.id} window={win} slot={layout[win.id]} active={overviewOpen}>
            <MacWindow window={win} isFocused={win.id === focusedId && !win.isMinimized} overview={overviewOpen} covered={compact && win.id !== topId} />
          </MissionControlWindowFrame>
        ))}
      </AnimatePresence>
    </div>
  );
}
