"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent } from "react";
import type { MotionValue } from "motion/react";
import { clampPosition } from "@/lib/window-geometry";
import { calculateSnapGeometry, resolveSnapZone } from "@/lib/window-snapping";
import { useSnapPreviewStore } from "@/store/snap-preview-store";
import { useWindowStore } from "@/store/window-store";
import type { Bounds, Point, SnapTarget, WindowState } from "@/types/window";

interface UseWindowDragOptions {
  windowId: string;
  x: MotionValue<number>;
  y: MotionValue<number>;
  width: MotionValue<number>;
  height: MotionValue<number>;
  enabled: boolean;
  /** Whether dragging to a screen edge may snap this window. */
  snappable: boolean;
  /** Called once, on release, with the final position (not when the drag ended in a snap). */
  onCommit: (position: Point) => void;
}

interface Session {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  /** Where the workspace sits in the page, so pointer positions can be turned into workspace ones. */
  workspaceLeft: number;
  workspaceTop: number;
  /** Where along the title bar the pointer grabbed the window (0–1). */
  grabRatio: number;
  constraints: Pick<WindowState, "minSize" | "maxSize" | "resizable">;
  moved: boolean;
  zone: SnapTarget | null;
  /** The floating bounds a snapped window is returning from, so re-snapping keeps them. */
  floating?: Bounds;
}

const DRAG_THRESHOLD = 3;

/**
 * Title-bar dragging. Moves write straight to motion values (no React or store
 * updates per pointer event); the store is updated once when the drag ends. Dragging toward an edge
 * shows a snap preview, and releasing there snaps the window. Dragging a snapped window floats it.
 */
export function useWindowDrag({ windowId, x, y, width, height, enabled, snappable, onCommit }: UseWindowDragOptions) {
  const session = useRef<Session | null>(null);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled || e.button !== 0) return;
      // Leave interactive controls (buttons, fields, links) to work normally.
      if ((e.target as HTMLElement).closest("button, a, input, select, textarea, [data-no-drag]")) return;
      const win = useWindowStore.getState().windows.find((w) => w.id === windowId);
      if (!win) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = e.currentTarget.closest("section")?.getBoundingClientRect();
      session.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: x.get(),
        originY: y.get(),
        workspaceLeft: rect ? rect.left - x.get() : 0,
        workspaceTop: rect ? rect.top - y.get() : 0,
        grabRatio: rect && rect.width > 0 ? Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) : 0.5,
        constraints: { minSize: win.minSize, maxSize: win.maxSize, resizable: win.resizable },
        moved: false,
        zone: null,
      };
    },
    [enabled, windowId, x, y],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const s = session.current;
      if (!s || s.pointerId !== e.pointerId) return;
      const store = useWindowStore.getState();

      if (!s.moved) {
        if (Math.hypot(e.clientX - s.startX, e.clientY - s.startY) < DRAG_THRESHOLD) return;
        s.moved = true;
        const win = store.windows.find((w) => w.id === windowId);
        if (win?.snap) {
          // Leave the snapped layout: back to the floating size, with the pointer keeping its place on the title bar.
          s.floating = win.previousBounds;
          const size = win.previousBounds
            ? { width: Math.max(win.previousBounds.width, win.minSize.width), height: Math.max(win.previousBounds.height, win.minSize.height) }
            : { width: width.get(), height: height.get() };
          width.set(size.width);
          height.set(size.height);
          s.originX = s.startX - s.workspaceLeft - s.grabRatio * size.width;
          s.originY = y.get();
          store.releaseSnap(windowId, size);
        }
      }

      const next = clampPosition(
        { x: s.originX + e.clientX - s.startX, y: s.originY + e.clientY - s.startY },
        { width: width.get(), height: height.get() },
        store.workspace,
      );
      x.set(next.x);
      y.set(next.y);

      if (!snappable) return;
      const zone = resolveSnapZone(
        { x: e.clientX - s.workspaceLeft, y: e.clientY - s.workspaceTop },
        s.constraints,
        store.workspace,
        store.dockClearance,
      );
      // Only touch the preview store when the zone actually changes.
      if (zone !== s.zone) {
        s.zone = zone;
        const preview = useSnapPreviewStore.getState();
        if (zone) preview.show(windowId, zone, calculateSnapGeometry(zone, store.workspace, store.dockClearance));
        else preview.clear(windowId);
      }
    },
    [windowId, snappable, x, y, width, height],
  );

  const end = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const s = session.current;
      if (!s || s.pointerId !== e.pointerId) return;
      session.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      useSnapPreviewStore.getState().clear(windowId);
      const cancelled = e.type === "pointercancel";
      if (s.moved && !cancelled && s.zone && useWindowStore.getState().snapWindow(windowId, s.zone, { restoreTo: s.floating })) return;
      onCommit({ x: x.get(), y: y.get() });
    },
    [onCommit, windowId, x, y],
  );

  return { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end };
}
