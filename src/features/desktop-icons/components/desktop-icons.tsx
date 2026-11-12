"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FileTypeIcon } from "@/components/file-icons";
import { contextMenuProps } from "@/features/context-menu/hooks/use-context-menu";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { openVirtualFile } from "@/lib/navigation";
import type { VirtualFile } from "@/lib/virtual-fs/types";
import { DESKTOP_PROJECTS_ID } from "@/data/portfolio-file-system";
import { useDesktopStore } from "@/store/desktop-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useWidgetStore } from "@/store/widget-store";
import { cellKey, getDesktopItems, nearestFreeCell, resolveLayout, type Cell } from "../lib/layout";

const DRAG_THRESHOLD = 5;
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

interface DragState {
  id: string;
  left: number;
  top: number;
  target: Cell;
}

/**
 * The icons on the desktop: whatever is in the Desktop folder (the Projects folder and the résumé). They are
 * placed on a grid that starts at the top right, like macOS, and can be dragged, sorted and cleaned up.
 */
export function DesktopIcons() {
  const iconSize = useDesktopStore((s) => s.iconSize);
  const gridSpacing = useDesktopStore((s) => s.gridSpacing);
  const positions = useDesktopStore((s) => s.positions);
  const sortBy = useDesktopStore((s) => s.sortBy);
  const setMetrics = useDesktopStore((s) => s.setMetrics);
  const setPositions = useDesktopStore((s) => s.setPositions);
  const reduced = useShouldReduceMotion();
  const hint = useOnboardingStore((s) => s.hint);
  const dismissHint = useOnboardingStore((s) => s.dismissHint);

  const areaRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);
  const [area, setArea] = useState<{ width: number; height: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  useEffect(() => {
    void useDesktopStore.persist.rehydrate();
  }, []);

  // The Projects pointer is a gentle nudge, not a fixture: it goes away by itself after a while.
  useEffect(() => {
    if (!hint) return;
    const timer = setTimeout(dismissHint, 15000);
    return () => clearTimeout(timer);
  }, [hint, dismissHint]);

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

  const cellWidth = iconSize + 36 + gridSpacing;
  const cellHeight = iconSize + 44 + gridSpacing;
  const cols = area ? Math.max(1, Math.floor(area.width / cellWidth)) : 1;
  const rows = area ? Math.max(1, Math.floor(area.height / cellHeight)) : 1;

  useEffect(() => {
    if (area) setMetrics(cols, rows);
  }, [area, cols, rows, setMetrics]);

  const items = useMemo(() => getDesktopItems(sortBy), [sortBy]);
  // Icon cells covered by a widget are off limits: icons are laid out around widgets, never underneath.
  const widgetRects = useWidgetStore((s) => s.rects);
  const blocked = useMemo(() => {
    const set = new Set<string>();
    if (!area || widgetRects.length === 0) return set;
    for (let column = 0; column < cols; column++) {
      for (let row = 0; row < rows; row++) {
        const left = area.width - (column + 1) * cellWidth;
        const top = row * cellHeight;
        if (widgetRects.some((r) => left < r.x + r.width && r.x < left + cellWidth && top < r.y + r.height && r.y < top + cellHeight)) set.add(cellKey({ column, row }));
      }
    }
    return set;
  }, [widgetRects, area, cols, rows, cellWidth, cellHeight]);
  const layout = useMemo(
    () => resolveLayout(items.map((i) => i.id), positions, cols, rows, blocked),
    [items, positions, cols, rows, blocked],
  );

  const beginPress = (e: React.PointerEvent<HTMLButtonElement>, item: VirtualFile) => {
    if (e.button !== 0) return;
    const areaEl = areaRef.current;
    const cell = layout.get(item.id);
    if (!areaEl || !cell) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origin = {
      left: area ? area.width - (cell.column + 1) * cellWidth : 0,
      top: cell.row * cellHeight,
    };
    let started = false;
    let latest: DragState | null = null;

    const finish = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      if (!started) return;
      setDrag(null);
      if (commit && latest) {
        // Never overlap: if the target cell is taken, use the closest free one.
        const taken = new Set([...layout].filter(([id]) => id !== item.id).map(([, c]) => cellKey(c)));
        blocked.forEach((k) => taken.add(k));
        const spot = taken.has(cellKey(latest.target)) ? nearestFreeCell(latest.target, taken, cols, rows) : latest.target;
        if (spot) {
          const next: Record<string, Cell> = Object.fromEntries(layout);
          next[item.id] = spot;
          setPositions(next);
        }
      }
      // The click that follows a drag must not select or open anything.
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    };
    const onMove = (ev: PointerEvent) => {
      if (!started) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return;
        started = true;
        suppressClickRef.current = true;
        setSelectedId(item.id);
      }
      const rect = areaEl.getBoundingClientRect();
      const left = clamp(origin.left + (ev.clientX - startX), 0, rect.width - cellWidth);
      const top = clamp(origin.top + (ev.clientY - startY), 0, rect.height - cellHeight);
      const column = clamp(Math.floor((rect.width - (left + cellWidth / 2)) / cellWidth), 0, cols - 1);
      const row = clamp(Math.floor((top + cellHeight / 2) / cellHeight), 0, rows - 1);
      latest = { id: item.id, left, top, target: { column, row } };
      setDrag(latest);
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };

  const byCell = useMemo(() => new Map([...layout].map(([id, c]) => [cellKey(c), id])), [layout]);
  const onIconKeyDown = (e: React.KeyboardEvent, item: VirtualFile) => {
    const cell = layout.get(item.id);
    if (!cell) return;
    const step: Record<string, Cell> = {
      ArrowRight: { column: cell.column - 1, row: cell.row }, // columns count from the right edge
      ArrowLeft: { column: cell.column + 1, row: cell.row },
      ArrowUp: { column: cell.column, row: cell.row - 1 },
      ArrowDown: { column: cell.column, row: cell.row + 1 },
    };
    if (e.key === "Enter") {
      e.preventDefault();
      openVirtualFile(item.id);
    } else if (step[e.key]) {
      e.preventDefault();
      const next = byCell.get(cellKey(step[e.key]));
      if (next) {
        setSelectedId(next);
        document.querySelector<HTMLElement>(`[data-desktop-icon="${CSS.escape(next)}"]`)?.focus();
      }
    }
  };

  const tabbableId = selectedId && layout.has(selectedId) ? selectedId : items[0]?.id;

  return (
    <div
      className="absolute inset-0 z-(--z-desktop-icons)"
      onPointerDown={(e) => {
        if (!(e.target as HTMLElement).closest("[data-desktop-icon]")) setSelectedId(null);
      }}
      onContextMenu={(e) => {
        const { onContextMenu } = contextMenuProps({ type: "desktop" });
        onContextMenu(e);
      }}
    >
      <div ref={areaRef} role="listbox" aria-label="Desktop" className="absolute inset-x-2 top-[calc(1.75rem+env(safe-area-inset-top)+8px)] bottom-[104px]">
        {area && drag && (
          <div
            aria-hidden
            className="absolute rounded-lg bg-white/15"
            style={{
              width: cellWidth,
              height: cellHeight,
              left: area.width - (drag.target.column + 1) * cellWidth,
              top: drag.target.row * cellHeight,
            }}
          />
        )}
        {area &&
          items.map((item) => {
            const cell = layout.get(item.id);
            if (!cell) return null;
            const dragging = drag?.id === item.id;
            const selected = selectedId === item.id;
            const left = dragging ? drag.left : area.width - (cell.column + 1) * cellWidth;
            const top = dragging ? drag.top : cell.row * cellHeight;
            const menu = contextMenuProps({ type: "file", fileId: item.id, source: "desktop" }, () => setSelectedId(item.id));
            return (
              <div
                key={item.id}
                className={`absolute ${dragging ? "z-10 opacity-85" : reduced ? "" : "transition-[left,top] duration-200 ease-out"}`}
                style={{ width: cellWidth, height: cellHeight, left, top }}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={item.name}
                  data-desktop-icon={item.id}
                  data-onboarding-target={item.id === DESKTOP_PROJECTS_ID ? "onboarding-projects" : undefined}
                  tabIndex={item.id === tabbableId ? 0 : -1}
                  onClick={() => {
                    if (!suppressClickRef.current) setSelectedId(item.id);
                  }}
                  onDoubleClick={() => {
                    if (suppressClickRef.current) return;
                    if (item.id === DESKTOP_PROJECTS_ID) dismissHint();
                    openVirtualFile(item.id);
                  }}
                  onPointerDown={(e) => beginPress(e, item)}
                  onContextMenu={menu.onContextMenu}
                  onKeyDown={(e) => {
                    menu.onKeyDown(e);
                    if (!e.defaultPrevented) onIconKeyDown(e, item);
                  }}
                  className="group flex size-full touch-none cursor-default flex-col items-center gap-1 rounded-lg px-1 pt-1.5 outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  <span className={`grid place-items-center rounded-lg ${selected ? "bg-white/20" : item.id === DESKTOP_PROJECTS_ID && hint === "projects" ? "bg-white/10 ring-1 ring-white/40" : ""}`} style={{ width: iconSize + 8, height: iconSize }}>
                    <FileTypeIcon file={item} className="h-auto max-h-full w-auto max-w-full" />
                  </span>
                  <span
                    className={`line-clamp-2 max-w-full rounded px-1.5 text-[12px] leading-[15px] font-medium break-words [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] ${
                      selected ? "bg-(--accent) text-(--accent-fg) [text-shadow:none]" : "text-white"
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
                {item.id === DESKTOP_PROJECTS_ID && hint === "projects" && (
                  <div role="status" className="absolute top-3 right-full z-20 mr-1 flex w-max max-w-[200px] items-start gap-1.5 rounded-xl border border-white/25 bg-black/55 py-2 pr-1.5 pl-3 text-[12px] leading-4 text-white shadow-lg backdrop-blur-xl">
                    <span>Start here to explore what I’ve built.</span>
                    <button type="button" aria-label="Dismiss hint" onClick={dismissHint} className="grid size-5 shrink-0 place-items-center rounded-full text-white/70 outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/80">
                      <span aria-hidden>×</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

