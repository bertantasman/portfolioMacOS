"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDesktopStore } from "@/store/desktop-store";
import { useWidgetStore } from "@/store/widget-store";
import { getWidgetDefinition, supportedSizesOf } from "../registry/widget-registry";
import {
  WIDGET_CELL,
  WIDGET_GAP,
  findFreeSpot,
  placementRect,
  resolveWidgets,
  sizeSpan,
  widgetPixelSize,
  type CellRect,
} from "../utils/widget-layout";
import { WidgetContainer } from "./widget-container";

const DRAG_THRESHOLD = 5;
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

interface DragState {
  id: string;
  left: number;
  top: number;
  /** Where it would land: null when the desktop has no room for it. */
  target: { col: number; row: number } | null;
}

/**
 * The widget layer: desktop elements between the wallpaper and the windows. It is click-through
 * except for the widgets themselves, so empty desktop (right-click, icons) keeps working.
 */
export function DesktopWidgetLayer() {
  const widgets = useWidgetStore((s) => s.widgets);
  const hydrated = useWidgetStore((s) => s.hydrated);
  const moving = useWidgetStore((s) => s.moving);
  const setGrid = useWidgetStore((s) => s.setGrid);
  const setRects = useWidgetStore((s) => s.setRects);
  const moveWidget = useWidgetStore((s) => s.moveWidget);
  const iconCell = useDesktopStore((s) => s.iconSize + 36 + s.gridSpacing);

  const areaRef = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState<{ width: number; height: number } | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    void Promise.resolve(useWidgetStore.persist.rehydrate()).finally(() => useWidgetStore.setState({ hydrated: true }));
  }, []);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setArea((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // One icon column on the right stays with the desktop icons, so widgets never take every cell.
  const usableWidth = area ? Math.max(0, area.width - iconCell - 8) : 0;
  const cols = Math.max(0, Math.floor((usableWidth + WIDGET_GAP) / WIDGET_CELL));
  const rows = area ? Math.max(0, Math.floor((area.height + WIDGET_GAP) / WIDGET_CELL)) : 0;

  useEffect(() => {
    if (area) setGrid(cols, rows);
  }, [area, cols, rows, setGrid]);

  const placements = useMemo(() => resolveWidgets(widgets, supportedSizesOf, cols, rows), [widgets, cols, rows]);

  // Tell the desktop icons where the widgets are, so they step around them instead of underneath.
  useEffect(() => {
    const rects = widgets.flatMap((w) => {
      const p = placements.get(w.id);
      if (!p) return [];
      return [{ x: p.col * WIDGET_CELL, y: p.row * WIDGET_CELL, ...widgetPixelSize(p.size) }];
    });
    setRects(rects);
  }, [widgets, placements, setRects]);

  const occupiedExcept = (id: string): CellRect[] =>
    widgets.flatMap((w) => {
      const p = placements.get(w.id);
      return p && w.id !== id ? [placementRect(p)] : [];
    });

  const beginPress = (e: React.PointerEvent<HTMLElement>, id: string) => {
    if (e.button !== 0 || useWidgetStore.getState().moving) return;
    // Buttons, links, fields and sliders keep working; only the widget's own background drags it.
    if ((e.target as HTMLElement).closest("button, a, input, select, textarea, label, [data-no-drag]")) return;
    const p = placements.get(id);
    const areaEl = areaRef.current;
    if (!p || !areaEl) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origin = { left: p.col * WIDGET_CELL, top: p.row * WIDGET_CELL };
    const { width, height } = widgetPixelSize(p.size);
    let started = false;
    let latest: DragState | null = null;
    const others = occupiedExcept(id);

    const finish = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      if (!started) return;
      setDrag(null);
      if (commit && latest?.target) {
        const result = moveWidget(id, latest.target.col, latest.target.row);
        setAnnouncement(result.ok ? "Widget moved." : result.reason);
      }
    };
    const onMove = (ev: PointerEvent) => {
      if (!started) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return;
        started = true;
      }
      const rect = areaEl.getBoundingClientRect();
      const left = clamp(origin.left + ev.clientX - startX, 0, rect.width - width);
      const top = clamp(origin.top + ev.clientY - startY, 0, rect.height - height);
      // Snap to the grid; if that cell is taken, show the nearest free one (or none).
      const wantedCol = clamp(Math.round(left / WIDGET_CELL), 0, Math.max(0, cols - sizeSpan[p.size].cols));
      const wantedRow = clamp(Math.round(top / WIDGET_CELL), 0, Math.max(0, rows - sizeSpan[p.size].rows));
      const target = findFreeSpot(p.size, others, cols, rows, { col: wantedCol, row: wantedRow });
      latest = { id, left, top, target };
      setDrag(latest);
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };

  // Keyboard move mode: arrows step one cell, Enter places, Escape cancels.
  const movingId = moving?.id;
  useEffect(() => {
    if (!movingId) return;
    const name = getWidgetDefinition(widgets.find((w) => w.id === movingId)?.type ?? "")?.title ?? "Widget";
    // Entering move mode announces itself.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnnouncement(`Moving ${name} widget. Use the arrow keys, Return to place it, Escape to cancel.`);
    const onKeyDown = (e: KeyboardEvent) => {
      const store = useWidgetStore.getState();
      const steps: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (steps[e.key]) {
        e.preventDefault();
        e.stopPropagation();
        store.nudgeMove(...steps[e.key]);
        const m = useWidgetStore.getState().moving;
        if (m) setAnnouncement(`Column ${m.col + 1}, row ${m.row + 1}`);
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        store.commitMove();
        setAnnouncement(`${name} widget placed.`);
        document.querySelector<HTMLElement>(`[data-widget-id="${CSS.escape(movingId)}"]`)?.focus({ preventScroll: true });
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        store.cancelMove();
        setAnnouncement("Move cancelled.");
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [movingId, widgets]);

  const firstVisibleId = widgets.find((w) => placements.get(w.id))?.id;
  const dropTarget = drag ? drag.target : null;
  const dragPlacement = drag ? placements.get(drag.id) : undefined;

  return (
    <div className="pointer-events-none absolute inset-0 z-(--z-widgets)">
      <div ref={areaRef} className="absolute inset-x-2 top-[calc(1.75rem+env(safe-area-inset-top)+8px)] bottom-[104px]">
        {hydrated &&
          area &&
          widgets.map((w) => {
            const p = placements.get(w.id);
            if (!p) return null;
            const isMoving = moving?.id === w.id;
            return (
              <WidgetContainer
                key={w.id}
                instance={w}
                size={p.size}
                col={isMoving ? moving.col : p.col}
                row={isMoving ? moving.row : p.row}
                dragAt={drag?.id === w.id ? { left: drag.left, top: drag.top } : undefined}
                moving={isMoving}
                onboardingTarget={w.id === firstVisibleId}
                onPointerDown={(e) => beginPress(e, w.id)}
              />
            );
          })}
        {/* Where a dragged widget would land: accent when valid, red when there is no room. */}
        {drag && dragPlacement && (
          <div
            aria-hidden
            className={`pointer-events-none absolute rounded-[22px] border-2 border-dashed ${dropTarget ? "border-(--accent) bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]" : "border-[#ff453a] bg-[#ff453a]/10"}`}
            style={{
              left: (dropTarget ?? { col: dragPlacement.col }).col * WIDGET_CELL,
              top: (dropTarget ?? { row: dragPlacement.row }).row * WIDGET_CELL,
              ...widgetPixelSize(dragPlacement.size),
            }}
          />
        )}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
