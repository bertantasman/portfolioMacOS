"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useContextMenuStore } from "@/store/context-menu-store";
import { useOverlayStore } from "@/store/overlay-store";
import type { ContextMenuTarget } from "../types/context-menu";
import { buildMenuEntries } from "../utils/context-menu-actions";
import { menuInsets, positionMenu, type Point } from "../utils/context-menu-position";
import { MenuList, type MenuContext } from "./context-menu-items";

/** Right-click menus for the desktop and Finder. Mounted once; opened through the overlay store. */
export function ContextMenu() {
  const open = useOverlayStore((s) => s.active === "context-menu");
  const target = useContextMenuStore((s) => s.target);
  const requestId = useContextMenuStore((s) => s.requestId);
  const reduced = useShouldReduceMotion();
  return (
    <AnimatePresence>
      {open && target && <Menu key={requestId} target={target} reduced={reduced} />}
    </AnimatePresence>
  );
}

const enabledItems = (menu: Element) =>
  [...menu.querySelectorAll<HTMLElement>("[data-menu-item]")].filter(
    (el) => el.closest("[role=menu]") === menu && el.getAttribute("aria-disabled") !== "true",
  );

function Menu({ target, reduced }: { target: ContextMenuTarget; reduced: boolean }) {
  const { x, y, viaKeyboard, hover, anchor } = useContextMenuStore.getState();
  const hide = useContextMenuStore((s) => s.hide);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);
  const [pos, setPos] = useState<Point | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const duration = reduced ? 0 : 0.12;

  const entries = useMemo(() => buildMenuEntries(target), [target]);
  const label = target.type === "desktop" ? "Desktop" : target.type === "window-layout" ? "Window layout" : target.type === "widget" ? "Widget" : "Item";

  // Place the menu once its size is known; hidden until then so it never flashes in the wrong spot.
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    setPos(positionMenu({ x, y }, rect.width, rect.height, viewport, menuInsets(rect.height, viewport.height)));
  }, [x, y]);

  useEffect(() => {
    previousFocus.current = document.activeElement;
  }, []);

  // Focus only works once the menu is visible, i.e. after it has been placed.
  const placed = pos !== null;
  useEffect(() => {
    // A menu opened by hovering must not steal focus from the window.
    if (!placed || hover) return;
    const panel = panelRef.current;
    panel?.focus({ preventScroll: true });
    if (viaKeyboard && panel) enabledItems(panel.querySelector("[role=menu]")!)[0]?.focus();
  }, [placed, viaKeyboard, hover]);

  // Hover menus have no click-blocking layer, so they dismiss themselves: on a press outside, or
  // once the pointer has been away from both the menu and the control that opened it.
  useEffect(() => {
    if (!hover) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const inside = (px: number, py: number) => {
      const rects = [panelRef.current?.getBoundingClientRect(), anchor ?? undefined];
      return rects.some((r) => r && px >= r.left - 6 && px <= r.right + 6 && py >= r.top - 6 && py <= r.bottom + 6);
    };
    const onMove = (e: PointerEvent) => {
      if (inside(e.clientX, e.clientY)) {
        if (timer) clearTimeout(timer);
        timer = null;
      } else timer ??= setTimeout(() => useContextMenuStore.getState().hide(), 220);
    };
    const onDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) useContextMenuStore.getState().hide();
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, [hover, anchor]);

  const restoreFocus = () => {
    const el = previousFocus.current;
    if (el instanceof HTMLElement && el.isConnected) requestAnimationFrame(() => el.focus());
  };

  const ctx: MenuContext = {
    openSub,
    setOpenSub,
    activate: (entry) => {
      hide();
      entry.run();
      // If the action opened nothing that takes focus (e.g. Copy Name), hand it back.
      setTimeout(() => {
        const active = document.activeElement;
        if (!active || active === document.body) restoreFocus();
      }, 220);
    },
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const active = document.activeElement as HTMLElement | null;
    const menu = active?.closest("[role=menu]") ?? panelRef.current?.querySelector("[role=menu]");
    if (!menu) return;
    const items = enabledItems(menu);
    const index = active ? items.indexOf(active) : -1;
    const focus = (i: number) => items[(i + items.length) % items.length]?.focus();

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focus(index === -1 ? 0 : index + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focus(index === -1 ? -1 : index - 1);
        break;
      case "Home":
        e.preventDefault();
        focus(0);
        break;
      case "End":
        e.preventDefault();
        focus(-1);
        break;
      case "ArrowRight": {
        const id = active?.dataset.submenuTrigger;
        if (!id || active?.getAttribute("aria-disabled") === "true") break;
        e.preventDefault();
        setOpenSub(id);
        setTimeout(() => {
          const sub = panelRef.current?.querySelector(`[data-submenu="${id}"] [role=menu]`);
          if (sub) enabledItems(sub)[0]?.focus();
        }, 0);
        break;
      }
      case "ArrowLeft":
        if (menu.getAttribute("data-depth") === "1" && openSub) {
          e.preventDefault();
          const id = openSub;
          setOpenSub(null);
          panelRef.current?.querySelector<HTMLElement>(`[data-submenu-trigger="${id}"]`)?.focus();
        }
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        if (openSub) {
          const id = openSub;
          setOpenSub(null);
          panelRef.current?.querySelector<HTMLElement>(`[data-submenu-trigger="${id}"]`)?.focus();
        } else {
          hide();
          restoreFocus();
        }
        break;
      case "Tab":
        // Never trap focus: Tab simply dismisses the menu.
        hide();
        break;
    }
  };

  return (
    <motion.div
      className={`fixed inset-0 z-(--z-context-menu) ${hover ? "pointer-events-none" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      // A press outside closes the menu without reaching what is underneath.
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) hide();
      }}
      // A right-click outside closes this menu and goes on to whatever is underneath, which may open its own.
      onContextMenu={(e) => {
        e.preventDefault();
        const { clientX, clientY } = e;
        e.currentTarget.style.pointerEvents = "none";
        hide();
        document.elementFromPoint(clientX, clientY)?.dispatchEvent(
          new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX, clientY, button: 2 }),
        );
      }}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        initial={reduced ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduced ? undefined : { opacity: 0, scale: 0.99 }}
        transition={{ duration, ease: "easeOut" }}
        style={{ left: pos?.x ?? x, top: pos?.y ?? y, visibility: pos ? "visible" : "hidden", transformOrigin: "top left" }}
        className="pointer-events-auto absolute min-w-[200px] max-w-[calc(100vw-16px)] rounded-[10px] border border-black/10 bg-window p-1 text-black shadow-[0_12px_40px_rgba(0,0,0,0.35)] outline-none backdrop-blur-2xl backdrop-saturate-150"
      >
        <MenuList entries={entries} ctx={ctx} depth={0} label={label} />
      </motion.div>
    </motion.div>
  );
}
