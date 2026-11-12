"use client";

import type { ReactNode } from "react";
import type { MenuActionItem, MenuDefinition } from "@/types/menu";
import { MenuDropdown } from "./menu-dropdown";

interface MenuBarItemProps {
  menu: MenuDefinition;
  isOpen: boolean;
  /** True when the menu was opened with the keyboard, so focus moves into it. */
  focusOnOpen: boolean;
  /** Content of the trigger; defaults to the menu label. */
  children?: ReactNode;
  className?: string;
  onToggle: (id: string, viaKeyboard: boolean) => void;
  onHover: (id: string) => void;
  onSelect: (item: MenuActionItem) => void;
}

export function menuTriggerId(menuId: string) {
  return `menubar-trigger-${menuId}`;
}

export function MenuBarItem({
  menu,
  isOpen,
  focusOnOpen,
  children,
  className = "",
  onToggle,
  onHover,
  onSelect,
}: MenuBarItemProps) {
  const triggerId = menuTriggerId(menu.id);

  return (
    <div
      role="none"
      className={`relative ${className}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover(menu.id)}
    >
      <button
        id={triggerId}
        type="button"
        role="menuitem"
        data-menu-trigger={menu.id}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        // Keyboard-initiated clicks report detail === 0.
        onClick={(e) => onToggle(menu.id, e.detail === 0)}
        className="flex h-6 items-center rounded px-2.5 outline-none focus-visible:ring-2 focus-visible:ring-white/70 aria-expanded:bg-white/25"
      >
        {children ?? menu.label}
      </button>
      {isOpen && (
        <MenuDropdown
          menu={menu}
          labelledBy={triggerId}
          focusFirstItem={focusOnOpen}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}
