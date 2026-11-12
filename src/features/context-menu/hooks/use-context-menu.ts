import type { KeyboardEvent, MouseEvent } from "react";
import { useContextMenuStore } from "@/store/context-menu-store";
import type { ContextMenuTarget } from "../types/context-menu";

/**
 * Props that make an element open a context menu: right-click, the Context Menu key and Shift+F10.
 * `before` runs first (for example, to select the item the menu is about).
 */
export function contextMenuProps(target: ContextMenuTarget, before?: () => void) {
  const show = useContextMenuStore.getState().show;
  return {
    onContextMenu: (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      before?.();
      show(target, e.clientX, e.clientY);
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key !== "ContextMenu" && !(e.shiftKey && e.key === "F10")) return;
      e.preventDefault();
      e.stopPropagation();
      before?.();
      // No pointer: open beside the focused element.
      const rect = e.currentTarget.getBoundingClientRect();
      show(target, rect.left + rect.width * 0.6, rect.top + rect.height * 0.6, true);
    },
  };
}
