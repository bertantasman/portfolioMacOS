"use client";

import { useCallback } from "react";
import type { KeyboardEvent } from "react";
import type { VirtualFile } from "@/lib/virtual-fs/types";

interface Options {
  items: readonly VirtualFile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (item: VirtualFile) => void;
  /** Number of columns in the current layout (1 for a list). */
  getColumns: (container: HTMLElement) => number;
}

/** Arrow/Home/End move the selection, Enter opens it. Shared by both views. */
export function useFinderItemKeys({ items, selectedId, onSelect, onOpen, getColumns }: Options) {
  return useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (items.length === 0) return;
      const container = e.currentTarget;
      const index = items.findIndex((item) => item.id === selectedId);

      if (e.key === "Enter") {
        if (index === -1) return;
        e.preventDefault();
        onOpen(items[index]);
        return;
      }

      const columns = getColumns(container);
      let next: number;
      switch (e.key) {
        case "ArrowRight":
          if (columns === 1) return;
          next = index + 1;
          break;
        case "ArrowLeft":
          if (columns === 1) return;
          next = index - 1;
          break;
        case "ArrowDown":
          next = index === -1 ? 0 : index + columns;
          break;
        case "ArrowUp":
          next = index === -1 ? 0 : index - columns;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = items.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      next = Math.min(Math.max(next, 0), items.length - 1);
      const id = items[next].id;
      onSelect(id);
      container.querySelector<HTMLElement>(`[data-finder-item="${id}"]`)?.focus();
    },
    [items, selectedId, onSelect, onOpen, getColumns],
  );
}
