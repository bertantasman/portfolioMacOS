"use client";

import { useMemo } from "react";
import { displayBounds } from "@/lib/window-display";
import { useWindowStore } from "@/store/window-store";
import type { OverviewLayout, OverviewWindow } from "../types/mission-control";
import { layoutOverview } from "../utils/mission-control-layout";

export interface WindowOverview {
  windows: OverviewWindow[];
  /** Preview order: open windows first, then minimized ones. */
  order: string[];
  layout: OverviewLayout;
}

/**
 * The overview, derived from the window manager's own state: nothing is copied or kept separately,
 * so windows that open, close, minimize or move are reflected the next time this runs.
 */
export function useWindowOverview(enabled = true): WindowOverview {
  const windows = useWindowStore((s) => s.windows);
  const focusedId = useWindowStore((s) => s.focusedWindowId);
  const workspace = useWindowStore((s) => s.workspace);
  const compact = useWindowStore((s) => s.compact);
  const dockClearance = useWindowStore((s) => s.dockClearance);

  return useMemo(() => {
    // Closed overview: nothing to lay out, so window changes cost nothing here.
    if (!enabled) return { windows: [], order: [], layout: {} };
    const items: OverviewWindow[] = windows.map((w) => {
      // Previews match what is on screen: on a phone every window is drawn full-screen.
      const b = displayBounds(w, { compact, workspace, dockClearance });
      return { id: w.id, appId: w.appId, title: w.title, isMinimized: w.isMinimized, isFocused: w.id === focusedId && !w.isMinimized, width: b.width, height: b.height, x: b.x, y: b.y };
    });
    const ordered = [...items.filter((w) => !w.isMinimized), ...items.filter((w) => w.isMinimized)];
    return { windows: ordered, order: ordered.map((w) => w.id), layout: layoutOverview(ordered, workspace) };
  }, [enabled, windows, focusedId, workspace, compact, dockClearance]);
}
