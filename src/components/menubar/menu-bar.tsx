"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { appMenus, appleMenu } from "@/config/menus";
import { useOnboardingStore } from "@/store/onboarding-store";
import { lockScreen } from "@/features/startup/utils/lock";
import { useOverlayStore } from "@/store/overlay-store";
import type { MenuActionItem } from "@/types/menu";
import { AboutDialog } from "./about-dialog";
import { AppleMenu } from "./apple-menu";
import { MenuBarItem } from "./menu-bar-item";
import { SystemStatus } from "./system-status";

interface OpenMenu {
  id: string;
  viaKeyboard: boolean;
}

const triggerSelector = (id?: string) =>
  id ? `[data-menu-trigger="${id}"]` : "[data-menu-trigger]";

export function MenuBar() {
  const rootRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<OpenMenu | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const controlCenterOpen = useOverlayStore((s) => s.active === "control-center");
  // Control Center and a menu dropdown never show together.
  if (controlCenterOpen && open) setOpen(null);

  const focusTrigger = useCallback((id: string) => {
    rootRef.current?.querySelector<HTMLButtonElement>(triggerSelector(id))?.focus();
  }, []);

  const closeMenu = useCallback(
    (restoreFocus: boolean) => {
      if (open && restoreFocus) focusTrigger(open.id);
      setOpen(null);
    },
    [open, focusTrigger],
  );

  // Dismiss on outside press, Escape and viewport resize while a menu is open.
  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeMenu(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu(true);
    };
    const onResize = () => closeMenu(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen, closeMenu]);

  const handleToggle = (id: string, viaKeyboard: boolean) =>
    setOpen((current) => (current?.id === id ? null : { id, viaKeyboard }));

  const handleHover = (id: string) =>
    setOpen((current) => (current && current.id !== id ? { id, viaKeyboard: false } : current));

  const handleSelect = (item: MenuActionItem) => {
    if (item.disabled) return;
    if (item.action === "open-about") setAboutOpen(true);
    closeMenu(false);
    // Visual only: shows the lock screen over the desktop; nothing is closed or secured.
    if (item.action === "lock-screen") lockScreen();
    // Restarts the tutorial from its first step. Windows and settings are left exactly as they are.
    if (item.action === "take-tour") useOnboardingStore.getState().start();
  };

  const closeAbout = useCallback(() => {
    setAboutOpen(false);
    focusTrigger(appleMenu.id);
  }, [focusTrigger]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const root = rootRef.current;
    if (!root) return;
    const target = e.target as HTMLElement;
    const triggerEl = target.closest<HTMLElement>("[data-menu-trigger]");
    const inMenu = target.closest('[role="menu"]');

    // Horizontal: move between top-level menus (only the visible ones).
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const triggers = [...root.querySelectorAll<HTMLElement>(triggerSelector())].filter(
        (el) => el.offsetParent !== null,
      );
      const currentId =
        triggerEl?.dataset.menuTrigger ?? open?.id;
      const index = triggers.findIndex((el) => el.dataset.menuTrigger === currentId);
      if (index === -1) return;
      e.preventDefault();
      const step = e.key === "ArrowRight" ? 1 : -1;
      const next = triggers[(index + step + triggers.length) % triggers.length];
      if (open) setOpen({ id: next.dataset.menuTrigger!, viaKeyboard: true });
      else next.focus();
      return;
    }

    if (triggerEl && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setOpen({ id: triggerEl.dataset.menuTrigger!, viaKeyboard: true });
      return;
    }

    if (inMenu) {
      const items = [
        ...inMenu.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
      ];
      const index = items.indexOf(target as HTMLButtonElement);
      let next: HTMLButtonElement | undefined;
      if (e.key === "ArrowDown") next = items[(index + 1) % items.length];
      else if (e.key === "ArrowUp") next = items[(index - 1 + items.length) % items.length];
      else if (e.key === "Home") next = items[0];
      else if (e.key === "End") next = items[items.length - 1];
      else if (e.key === "Tab") closeMenu(false);
      if (next) {
        e.preventDefault();
        next.focus();
      }
    }
  };

  const menuProps = (id: string) => ({
    isOpen: open?.id === id,
    focusOnOpen: open?.id === id && open.viaKeyboard,
    onToggle: handleToggle,
    onHover: handleHover,
    onSelect: handleSelect,
  });

  return (
    <>
      <header
        ref={rootRef}
        role="menubar"
        aria-label="Menu bar"
        onKeyDown={handleKeyDown}
        className="absolute inset-x-0 top-0 z-(--z-menubar) flex h-[calc(1.75rem+env(safe-area-inset-top))] items-center justify-between bg-(--menubar-bg) pt-[env(safe-area-inset-top)] pr-1.5 pl-2 text-[13px] text-white backdrop-blur-2xl backdrop-saturate-150 select-none"
      >
        <div className="flex min-w-0 items-center">
          <AppleMenu {...menuProps(appleMenu.id)} />
          {appMenus.map((menu, index) => (
            <MenuBarItem
              key={menu.id}
              menu={menu}
              {...menuProps(menu.id)}
              // Only the application menu survives on narrow screens.
              className={`${index === 0 ? "font-semibold" : "hidden sm:block"}`}
            />
          ))}
        </div>
        <SystemStatus />
      </header>
      {aboutOpen && <AboutDialog onClose={closeAbout} />}
    </>
  );
}
