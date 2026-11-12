"use client";

import { memo, useCallback, useEffect, useId, useRef } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { useSnapPreviewStore } from "@/store/snap-preview-store";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useDisplayBounds } from "@/hooks/use-display-bounds";
import { useWindowDrag } from "@/hooks/use-window-drag";
import { useWindowResize } from "@/hooks/use-window-resize";
import { useWindowStore } from "@/store/window-store";
import type { Bounds, Point, WindowState } from "@/types/window";
import { WindowChromeContext } from "./window-chrome";
import { WindowContent } from "./window-content";
import { WindowControls } from "./window-controls";
import { WindowResizeHandles } from "./window-resize-handles";
import { WindowTitleBar } from "./window-title-bar";

interface MacWindowProps {
  window: WindowState;
  isFocused: boolean;
  /** Mission Control is showing: minimized windows are drawn too, and nothing inside is interactive. */
  overview?: boolean;
  /** Phone layout: another window is on top and fills the screen, so this one is hidden (still mounted, state kept). */
  covered?: boolean;
}

const EASE = [0.32, 0.72, 0, 1] as const;

const variants = {
  visible: { opacity: 1, scale: 1, y: 0 },
  minimized: { opacity: 0, scale: 0.88, y: 48 },
};

export const MacWindow = memo(function MacWindow({ window: win, isFocused, overview = false, covered = false }: MacWindowProps) {
  const titleId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = useShouldReduceMotion();
  const { focusWindow, closeWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow } =
    useWindowStore.getState();

  // Where the window is drawn: its own geometry, or the full screen on a phone.
  const shown = useDisplayBounds(win);
  const compact = useWindowStore((s) => s.compact);

  // Geometry lives in motion values so drags and resizes bypass React.
  const x = useMotionValue(shown.x);
  const y = useMotionValue(shown.y);
  const width = useMotionValue(shown.width);
  const height = useMotionValue(shown.height);

  // Follow store changes (maximize/restore, viewport re-fit). Animate only when
  // the maximized state flips; otherwise snap, which is a no-op after a drag.
  const wasMaximized = useRef(win.isMaximized);
  const wasSnap = useRef(win.snap);
  const { x: px, y: py, width: w, height: h } = shown;
  useEffect(() => {
    // Maximizing, snapping and restoring animate; other changes (viewport re-fit) apply at once.
    const flipped = wasMaximized.current !== win.isMaximized || wasSnap.current !== win.snap;
    wasMaximized.current = win.isMaximized;
    wasSnap.current = win.snap;
    const controls = [
      [x, px],
      [y, py],
      [width, w],
      [height, h],
    ].flatMap(([mv, target]) => {
      const value = mv as typeof x;
      if (value.get() === target) return [];
      if (flipped && !reducedMotion) {
        return [animate(value, target as number, { duration: 0.24, ease: EASE })];
      }
      value.set(target as number);
      return [];
    });
    return () => controls.forEach((c) => c.stop());
  }, [px, py, w, h, win.isMaximized, win.snap, reducedMotion, x, y, width, height]);

  // A closing window never leaves a snap preview behind.
  useEffect(() => {
    const id = win.id;
    return () => useSnapPreviewStore.getState().clear(id);
  }, [win.id]);

  const commitMove = useCallback((p: Point) => moveWindow(win.id, p), [moveWindow, win.id]);
  const commitResize = useCallback(
    (b: Bounds) => resizeWindow(win.id, b),
    [resizeWindow, win.id],
  );

  const dragHandlers = useWindowDrag({
    windowId: win.id,
    snappable: win.resizable && !compact,
    x,
    y,
    width,
    height,
    enabled: !win.isMaximized && !compact,
    onCommit: commitMove,
  });
  const { getHandleProps } = useWindowResize({
    x,
    y,
    width,
    height,
    minSize: win.minSize,
    maxSize: win.maxSize,
    onCommit: commitResize,
  });

  // Move keyboard focus into a newly opened window.
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  const duration = reducedMotion ? 0 : 0.18;
  const unified = win.titleBar === "unified";
  // Terminal-style windows keep a dark content surface in every theme; the chrome follows the theme.
  const darkContent = win.appearance === "dark";
  const chrome = {
    isFocused,
    canMaximize: win.resizable && !compact,
    dragHandlers,
    onToggleMaximize: () => toggleMaximize(win.id),
    onClose: () => closeWindow(win.id),
  };
  const layoutMenu = win.resizable ? win.id : undefined;
  const controls = (
    <WindowControls
      layoutWindowId={layoutMenu}
      isFocused={isFocused}
      isMaximized={win.isMaximized}
      canMaximize={win.resizable && !compact}
      compact={compact}
      onClose={() => closeWindow(win.id)}
      onMinimize={() => minimizeWindow(win.id)}
      onToggleMaximize={() => toggleMaximize(win.id)}
    />
  );

  return (
    <motion.section
      ref={rootRef}
      aria-labelledby={titleId}
      tabIndex={-1}
      inert={win.isMinimized || overview || covered}
      data-window-id={win.id}
      onPointerDownCapture={() => focusWindow(win.id)}
      onFocusCapture={() => focusWindow(win.id)}
      style={{ x, y, width, height, zIndex: win.zIndex }}
      className="pointer-events-auto absolute top-0 left-0 outline-none data-[covered=true]:invisible data-[minimized=true]:pointer-events-none"
      data-covered={covered && !overview}
      data-minimized={win.isMinimized}
    >
      <motion.div
        variants={variants}
        initial={reducedMotion ? "visible" : { opacity: 0, scale: 0.96, y: 10 }}
        animate={win.isMinimized && !overview ? "minimized" : "visible"}
        exit={{ opacity: 0, scale: 0.97, transition: { duration: reducedMotion ? 0 : 0.12 } }}
        transition={{ duration, ease: EASE }}
        style={{ transformOrigin: win.isMinimized && !overview ? "50% 100%" : "50% 50%" }}
        className="relative size-full"
      >
        <div
          className={`relative flex size-full flex-col overflow-hidden ${compact && !overview ? "rounded-none" : "rounded-xl"} ${
            darkContent ? "bg-[#1e1e1e]" : "bg-window backdrop-blur-3xl backdrop-saturate-150"
          } transition-shadow duration-150 ${
            isFocused
              ? "shadow-[0_0_0_0.5px_rgba(0,0,0,0.4),0_24px_70px_rgba(0,0,0,0.45)]"
              : "shadow-[0_0_0_0.5px_rgba(0,0,0,0.28),0_10px_30px_rgba(0,0,0,0.25)]"
          }`}
        >
          {unified ? (
            <>
              <h2 id={titleId} className="sr-only">
                {win.title}
              </h2>
              <div className={`pointer-events-none absolute top-0 z-30 flex items-center ${compact ? "left-2 h-[52px]" : "left-3.5 h-[52px]"}`}>
                <div className="pointer-events-auto">{controls}</div>
              </div>
            </>
          ) : (
            <WindowTitleBar
              titleId={titleId}
              title={win.title}
              isFocused={isFocused}
              isMaximized={win.isMaximized}
              canMaximize={win.resizable && !compact}
              compact={compact}
              dragHandlers={dragHandlers}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onToggleMaximize={() => toggleMaximize(win.id)}
              layoutWindowId={layoutMenu}
            />
          )}
          <div className={`min-h-0 flex-1 ${unified ? "overflow-hidden" : "overflow-auto"}`}>
            <WindowChromeContext.Provider value={chrome}>
              <WindowContent window={win} />
            </WindowChromeContext.Provider>
          </div>
        </div>
        {win.resizable && !win.isMaximized && !compact && <WindowResizeHandles getHandleProps={getHandleProps} />}
      </motion.div>
    </motion.section>
  );
});
