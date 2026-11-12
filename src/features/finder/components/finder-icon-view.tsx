"use client";

import { useWindowChrome } from "@/components/windows/window-chrome";
import { useFinderItemKeys } from "../hooks/use-finder-item-keys";
import type { VirtualFile } from "@/lib/virtual-fs/types";
import { FinderItem } from "./finder-item";

interface ViewProps {
  label: string;
  items: readonly VirtualFile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (item: VirtualFile) => void;
}

const columnCount = (grid: HTMLElement) =>
  getComputedStyle(grid).gridTemplateColumns.split(" ").length;

export function FinderIconView({ label, items, selectedId, onSelect, onOpen }: ViewProps) {
  const { isFocused } = useWindowChrome();
  const onKeyDown = useFinderItemKeys({
    items,
    selectedId,
    onSelect,
    onOpen,
    getColumns: columnCount,
  });
  const tabbableId = items.some((i) => i.id === selectedId) ? selectedId : items[0]?.id;

  return (
    <div
      role="listbox"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] content-start gap-x-1 gap-y-2 p-3"
    >
      {items.map((item) => (
        <FinderItem
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          windowFocused={isFocused}
          tabbable={item.id === tabbableId}
          onSelect={onSelect}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
