"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { getExternalUrl, launchpadApplications } from "@/config/applications";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { openApplicationById } from "@/lib/navigation";
import { useLaunchpadStore } from "@/store/launchpad-store";
import { useOverlayStore } from "@/store/overlay-store";
import type { ApplicationDefinition } from "@/types/application";
import { useGridLayout } from "../hooks/use-grid-layout";
import { moveItem, orderApplications } from "../lib/order";
import { filterApplications } from "../lib/search";
import { AppIconImage, LaunchpadIcon, optionDomId } from "./launchpad-icon";
import { LaunchpadSearch } from "./launchpad-search";
import { PageIndicators } from "./page-indicators";

const LISTBOX_ID = "launchpad-applications";
const HELP_ID = "launchpad-help";
const DRAG_THRESHOLD = 6;
const EDGE_ZONE = 56;
const EDGE_DWELL_MS = 700;

interface DragState {
  id: string;
  from: number;
  over: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Launchpad: a desktop overlay (not a window). Mounted once on the desktop; the Dock,
 * Spotlight and Ctrl+Shift+L all open it through the shared overlay store.
 */
export function Launchpad() {
  const open = useOverlayStore((s) => s.active === "launchpad");
  const reduced = useShouldReduceMotion();

  // Saved order lives in localStorage; read it after hydration so server and client markup match.
  useEffect(() => {
    void useLaunchpadStore.persist.rehydrate();
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="launchpad"
          // The wallpaper underneath is blurred by this one layer: no second copy of the image.
          className="fixed inset-0 z-(--z-launchpad) bg-[rgb(0_0_0/0.28)] backdrop-blur-[26px] backdrop-saturate-125 [:root[data-theme=dark]_&]:bg-[rgb(0_0_0/0.4)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.22, ease: "easeOut" }}
        >
          <LaunchpadPanel reduced={reduced} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LaunchpadPanel({ reduced }: { reduced: boolean }) {
  const storedOrder = useLaunchpadStore((s) => s.applicationOrder);
  const setStoredOrder = useLaunchpadStore((s) => s.setApplicationOrder);
  const apps = useMemo(() => orderApplications(launchpadApplications, storedOrder), [storedOrder]);

  const [query, setQuery] = useState("");
  const visible = useMemo(() => filterApplications(apps, query), [apps, query]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [pageState, setPageState] = useState(0);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const areaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);
  const launchedRef = useRef(false);
  const gridRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const ghostRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const dragRef = useRef<DragState | null>(null);
  const cancelDragRef = useRef<(() => void) | null>(null);
  const suppressClickRef = useRef(false);
  const edgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelRef = useRef({ accumulated: 0, last: 0, lockedUntil: 0 });
  const geomRef = useRef({ page: 0, colCount: 1, rowsUsed: 1, perPage: 1, count: 0, cellWidth: 1, cellHeight: 1, pageCount: 1 });

  const layout = useGridLayout(areaRef);
  const count = visible.length;
  const perPage = layout?.perPage ?? 1;
  const pageCount = Math.max(1, Math.ceil(count / perPage));
  const page = Math.min(pageState, pageCount - 1);
  const searching = query.trim() !== "";
  const colCount = layout ? Math.min(layout.cols, Math.max(1, count)) : 1;
  const rowsUsed = layout ? Math.min(layout.rows, Math.max(1, Math.ceil(count / colCount))) : 1;

  const selectedIndex = visible.findIndex((a) => a.id === selectedId);
  // While searching, the first match is selected so Enter launches it; otherwise nothing is until a key is pressed.
  const activeIndex = selectedIndex >= 0 ? selectedIndex : searching && count > 0 ? 0 : -1;
  const activeApp = activeIndex >= 0 ? visible[activeIndex] : undefined;
  const shown = drag ? moveItem(visible, drag.from, drag.over) : visible;

  useEffect(() => {
    geomRef.current = {
      page,
      colCount,
      rowsUsed,
      perPage,
      count,
      cellWidth: layout?.cellWidth ?? 1,
      cellHeight: layout?.cellHeight ?? 1,
      pageCount,
    };
  });

  const applyGhost = () => {
    const el = ghostRef.current;
    if (!el) return;
    const { x, y, offsetX, offsetY } = pointerRef.current;
    el.style.transform = `translate(${x - offsetX}px, ${y - offsetY}px)`;
  };
  useLayoutEffect(() => {
    if (drag) applyGhost();
  });

  // Focus the search field on open; hand focus back afterwards unless an app took it.
  useEffect(() => {
    previousFocus.current = document.activeElement;
    inputRef.current?.focus();
    const dialog = dialogRef.current;
    return () => {
      cancelDragRef.current?.();
      const el = previousFocus.current;
      const active = document.activeElement;
      const free = !active || active === document.body || dialog?.contains(active);
      if (!launchedRef.current && free && el instanceof HTMLElement && el.isConnected) el.focus();
    };
  }, []);

  const close = () => useOverlayStore.getState().close("launchpad");

  const launch = (app: ApplicationDefinition) => {
    setNotice(null);
    if (app.type === "external") {
      const url = getExternalUrl(app);
      if (!url) return setNotice(`${app.name} isn't available right now.`);
      window.open(url, "_blank", "noopener,noreferrer");
      launchedRef.current = true;
      return close();
    }
    // The shared launcher focuses or restores an existing window before opening a new one.
    if (openApplicationById(app.id)) {
      launchedRef.current = true;
      close();
    } else setNotice(`${app.name} isn't available right now.`);
  };

  const goToPage = (next: number) => setPageState(clamp(next, 0, pageCount - 1));

  const select = (index: number) => {
    setSelectedId(visible[index].id);
    setPageState(Math.floor(index / perPage));
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setSelectedId(undefined);
    setPageState(0);
    setAnnouncement("");
    setNotice(null);
  };

  // ---- Drag to rearrange (pointer events; no library) ----

  const updateOver = (x: number, y: number) => {
    const g = geomRef.current;
    const current = dragRef.current;
    const grid = gridRefs.current[g.page];
    if (!current || !grid) return;
    const rect = grid.getBoundingClientRect();
    const col = clamp(Math.floor((x - rect.left) / g.cellWidth), 0, g.colCount - 1);
    const row = clamp(Math.floor((y - rect.top) / g.cellHeight), 0, g.rowsUsed - 1);
    const over = Math.min(g.page * g.perPage + row * g.colCount + col, g.count - 1);
    if (over !== current.over) {
      dragRef.current = { ...current, over };
      setDrag(dragRef.current);
    }
    // Dwelling at a screen edge flips to the neighbouring page.
    const direction = x < EDGE_ZONE ? -1 : x > window.innerWidth - EDGE_ZONE ? 1 : 0;
    const target = g.page + direction;
    if (direction !== 0 && target >= 0 && target < g.pageCount) {
      edgeTimerRef.current ??= setTimeout(() => {
        edgeTimerRef.current = null;
        setPageState(target);
        // Re-evaluate under the pointer once the new page is showing.
        setTimeout(() => updateOver(pointerRef.current.x, pointerRef.current.y), 60);
      }, EDGE_DWELL_MS);
    } else if (edgeTimerRef.current) {
      clearTimeout(edgeTimerRef.current);
      edgeTimerRef.current = null;
    }
  };

  const beginPress = (e: React.PointerEvent<HTMLButtonElement>, app: ApplicationDefinition, index: number) => {
    if (e.button !== 0 || searching) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    let started = false;

    const finish = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      cancelDragRef.current = null;
      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = null;
      }
      document.body.style.cursor = "";
      if (started) {
        const final = dragRef.current;
        dragRef.current = null;
        setDrag(null);
        if (commit && final && final.over !== final.from) {
          setStoredOrder(moveItem(apps, final.from, final.over).map((a) => a.id));
          setAnnouncement(`${app.name} moved to position ${final.over + 1} of ${apps.length}.`);
        }
        // The click that follows a drag must not launch the app.
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }
    };
    const onMove = (ev: PointerEvent) => {
      if (!started) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return;
        started = true;
        suppressClickRef.current = true;
        document.body.style.cursor = "grabbing";
        dragRef.current = { id: app.id, from: index, over: index };
        setDrag(dragRef.current);
        cancelDragRef.current = () => finish(false);
      }
      pointerRef.current = { x: ev.clientX, y: ev.clientY, offsetX: startX - rect.left, offsetY: startY - rect.top };
      applyGhost();
      updateOver(ev.clientX, ev.clientY);
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    // Until the drag starts, releasing without moving is just a click.
    cancelDragRef.current = () => finish(false);
  };

  // ---- Keyboard ----

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Global shortcuts (Spotlight, Launchpad) are handled on the document; let them through.
    if ((e.metaKey || e.ctrlKey) && e.code === "Space") return;
    if (e.ctrlKey && e.shiftKey && e.code === "KeyL") return;
    // Everything else stays in Launchpad so windows underneath never react.
    e.stopPropagation();

    if (e.key === "Escape") {
      e.preventDefault();
      if (dragRef.current) cancelDragRef.current?.();
      else if (searching) {
        updateQuery("");
        inputRef.current?.focus();
      } else close();
      return;
    }

    const delta =
      e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" ? colCount : e.key === "ArrowUp" ? -colCount : 0;
    if (delta !== 0) {
      e.preventDefault();
      if (count === 0 || dragRef.current) return;
      if (activeIndex < 0) return select(0);
      const target = activeIndex + delta;
      if (target < 0 || target >= count) return;
      if (e.altKey && !searching) {
        // Keyboard alternative to dragging: Option/Alt + arrow moves the selected app.
        setStoredOrder(moveItem(apps, activeIndex, target).map((a) => a.id));
        setPageState(Math.floor(target / perPage));
        setAnnouncement(`${apps[activeIndex].name} moved to position ${target + 1} of ${count}.`);
      } else select(target);
      return;
    }
    if (e.key === "PageDown" || e.key === "PageUp") {
      e.preventDefault();
      goToPage(page + (e.key === "PageDown" ? 1 : -1));
      return;
    }
    if (e.key === "Enter" && e.target === inputRef.current) {
      e.preventDefault();
      if (activeApp) launch(activeApp);
      return;
    }
    if (e.key === "Tab") {
      // Keep Tab inside Launchpad while it is open: search, clear button, page dots.
      const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>("input, button:not([tabindex='-1'])") ?? [])].filter(
        (el) => !el.closest("[inert]"),
      );
      if (focusable.length === 0) return;
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (index <= 0 ? focusable.length - 1 : index - 1) : index === focusable.length - 1 ? 0 : index + 1;
      e.preventDefault();
      focusable[next].focus();
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (pageCount <= 1 || dragRef.current) return;
    const w = wheelRef.current;
    if (e.timeStamp < w.lockedUntil) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    w.accumulated = e.timeStamp - w.last > 200 ? d : w.accumulated + d;
    w.last = e.timeStamp;
    if (Math.abs(w.accumulated) >= 50) {
      goToPage(page + (w.accumulated > 0 ? 1 : -1));
      w.accumulated = 0;
      // A trackpad's momentum would otherwise flip through every page.
      w.lockedUntil = e.timeStamp + 450;
    }
  };

  const dragApp = drag ? apps.find((a) => a.id === drag.id) : undefined;
  const iconSize = layout?.iconSize ?? 64;
  const status = announcement || (searching ? `${count} ${count === 1 ? "application" : "applications"}` : "");

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Launchpad"
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      onPointerDown={(e) => {
        // A press on empty space dismisses Launchpad, as on macOS.
        if (!(e.target as HTMLElement).closest("[data-launchpad-keep]")) close();
      }}
      className="absolute inset-0 flex flex-col items-center text-white"
    >
      <div className="shrink-0 pt-12 pb-3">
        <LaunchpadSearch
          ref={inputRef}
          value={query}
          onChange={updateQuery}
          onClear={() => {
            updateQuery("");
            inputRef.current?.focus();
          }}
          listboxId={LISTBOX_ID}
          activeDescendant={activeApp ? optionDomId(activeApp.id) : undefined}
          expanded={count > 0}
          describedBy={HELP_ID}
        />
        <p id={HELP_ID} className="sr-only">
          Use the arrow keys to choose an application and Return to open it. Hold Option or Alt with an arrow key to move the chosen
          application. Escape clears the search, then closes Launchpad.
        </p>
      </div>
      {notice && (
        <p role="alert" className="shrink-0 pb-2 text-[12px] text-white/90">
          {notice}
        </p>
      )}

      <div className="min-h-0 w-full max-w-[1280px] flex-1 px-4">
        <div ref={areaRef} className="size-full">
          <motion.div
            className="size-full overflow-hidden"
            initial={reduced ? false : { opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.97 }}
            transition={{ duration: reduced ? 0.01 : 0.24, ease: "easeOut" }}
          >
            {layout && count > 0 && (
              <motion.div
                role="listbox"
                id={LISTBOX_ID}
                aria-label="Applications"
                className="flex size-full"
                initial={false}
                animate={{ x: `${-page * 100}%` }}
                transition={{ duration: reduced ? 0 : 0.35, ease: [0.32, 0.72, 0, 1] }}
              >
                {Array.from({ length: pageCount }, (_, p) => (
                  <div
                    key={p}
                    role="group"
                    aria-label={`Page ${p + 1} of ${pageCount}`}
                    inert={p !== page}
                    className="flex h-full w-full shrink-0 items-center justify-center"
                  >
                    <div
                      ref={(el) => {
                        gridRefs.current[p] = el;
                      }}
                      className="grid content-start"
                      style={{
                        gridTemplateColumns: `repeat(${colCount}, ${layout.cellWidth}px)`,
                        gridAutoRows: `${layout.cellHeight}px`,
                        height: rowsUsed * layout.cellHeight,
                      }}
                    >
                      {shown.slice(p * perPage, (p + 1) * perPage).map((app) => {
                        const index = visible.findIndex((a) => a.id === app.id);
                        return (
                          <motion.div key={app.id} layout={drag && !reduced ? "position" : false} transition={{ duration: 0.2 }}>
                            <LaunchpadIcon
                              app={app}
                              size={iconSize}
                              selected={!drag && app.id === activeApp?.id}
                              placeholder={drag?.id === app.id}
                              dragEnabled={!searching}
                              onActivate={() => {
                                if (!suppressClickRef.current) launch(app);
                              }}
                              onPointerDown={(e) => beginPress(e, app, index)}
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
            {layout && count === 0 && (
              <div role="status" className="grid size-full place-items-center text-center">
                <div>
                  <p className="text-[17px] font-medium text-white">{searching ? "No Results" : "No Applications"}</p>
                  <p className="mt-1 text-[13px] text-white/70">
                    {searching ? "No applications match your search." : "There are no applications to show."}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Fixed-height row (clear of the Dock) so showing or hiding the dots never shifts the grid. */}
      <div className="mb-[calc(6.25rem+env(safe-area-inset-bottom))] flex h-7 shrink-0 items-center">
        <PageIndicators count={pageCount} page={page} onSelect={goToPage} />
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {drag &&
        dragApp &&
        layout &&
        createPortal(
          <div ref={ghostRef} aria-hidden className="pointer-events-none fixed top-0 left-0 z-[3000]" style={{ width: layout.cellWidth, height: layout.cellHeight }}>
            <div className="flex size-full scale-110 flex-col items-center gap-2 pt-2 opacity-95 drop-shadow-[0_14px_24px_rgba(0,0,0,0.45)]">
              <AppIconImage app={dragApp} size={iconSize} />
              <span className="w-full truncate px-0.5 text-center text-[13px] leading-4 font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">
                {dragApp.name}
              </span>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
