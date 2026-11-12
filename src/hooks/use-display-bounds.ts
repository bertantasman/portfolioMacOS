"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { displayBounds } from "@/lib/window-display";
import { useWindowStore } from "@/store/window-store";
import type { Bounds, WindowState } from "@/types/window";

/** Where this window is drawn (see lib/window-display.ts). Stable between renders unless it actually moves. */
export function useDisplayBounds(win: Pick<WindowState, "position" | "size">): Bounds {
  const [compact, workspaceWidth, workspaceHeight, dockClearance] = useWindowStore(
    useShallow((s) => [s.compact, s.workspace.width, s.workspace.height, s.dockClearance] as const),
  );
  const { x, y } = win.position;
  const { width, height } = win.size;
  return useMemo(
    () => displayBounds({ position: { x, y }, size: { width, height } }, { compact, workspace: { width: workspaceWidth, height: workspaceHeight }, dockClearance }),
    [compact, workspaceWidth, workspaceHeight, dockClearance, x, y, width, height],
  );
}
