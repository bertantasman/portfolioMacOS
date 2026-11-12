"use client";

import { useWindowChrome } from "@/components/windows/window-chrome";
import { useFinderItemKeys } from "../hooks/use-finder-item-keys";
import { formatModified, formatSize } from "../lib/format";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getFileKind } from "@/lib/virtual-fs/kind";
import type { SortDirection, SortKey, VirtualFile } from "@/lib/virtual-fs/types";
import { FileTypeIcon } from "@/components/file-icons";
import { contextMenuProps } from "@/features/context-menu/hooks/use-context-menu";

interface ViewProps {
  label: string;
  items: readonly VirtualFile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (item: VirtualFile) => void;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
}

// Columns drop away as the Finder window narrows (container queries).
const columns =
  "grid grid-cols-[minmax(0,1fr)_160px_80px_130px] @max-[620px]:grid-cols-[minmax(0,1fr)_160px_80px] @max-[460px]:grid-cols-[minmax(0,1fr)_80px] items-center gap-3";
const kindCell = "truncate @max-[620px]:hidden";
const dateCell = "truncate @max-[460px]:hidden";

const oneColumn = () => 1;

export function FinderListView({
  label,
  items,
  selectedId,
  onSelect,
  onOpen,
  sortKey,
  sortDirection,
  onSort,
}: ViewProps) {
  const { isFocused } = useWindowChrome();
  const onKeyDown = useFinderItemKeys({ items, selectedId, onSelect, onOpen, getColumns: oneColumn });
  const tabbableId = items.some((i) => i.id === selectedId) ? selectedId : items[0]?.id;

  return (
    <div>
      <div
        role="group"
        aria-label="Sort by column"
        className={`sticky top-0 z-10 h-6 border-b border-black/10 bg-surface/90 text-[11px] font-medium text-black/50 backdrop-blur px-[18px] ${columns}`}
      >
        <SortHeader label="Name" sortKey="name" active={sortKey} direction={sortDirection} onSort={onSort} />
        <SortHeader label="Date Modified" sortKey="modified" active={sortKey} direction={sortDirection} onSort={onSort} className={dateCell} />
        <span className="text-right">Size</span>
        <SortHeader label="Kind" sortKey="kind" active={sortKey} direction={sortDirection} onSort={onSort} className={kindCell} />
      </div>
      <div role="listbox" aria-label={label} onKeyDown={onKeyDown} className="px-1.5 py-1">
        {items.map((item, i) => {
          const selected = item.id === selectedId;
          const tone = selected
            ? isFocused
              ? "bg-(--accent) text-(--accent-fg)"
              : "bg-black/10 text-black/85"
            : `text-black/85 ${i % 2 === 1 ? "bg-black/[0.03]" : ""}`;
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={selected}
              data-finder-item={item.id}
              tabIndex={item.id === tabbableId ? 0 : -1}
              onClick={() => onSelect(item.id)}
              onDoubleClick={() => onOpen(item)}
              {...contextMenuProps({ type: "file", fileId: item.id, source: "finder" }, () => onSelect(item.id))}
              className={`h-6 w-full rounded-md text-left text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-inset px-3 ${columns} ${tone}`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileTypeIcon file={item} className="h-4 w-auto shrink-0" />
                <span className="truncate">{item.name}</span>
              </span>
              <span className={`${dateCell} ${selected && isFocused ? "text-(--accent-fg)/90" : "text-black/55"}`}>
                <Muted value={formatModified(item.modifiedAt)} />
              </span>
              <span className={`text-right ${selected && isFocused ? "text-(--accent-fg)/90" : "text-black/55"}`}>
                <Muted value={formatSize(item.size)} />
              </span>
              <span className={`${kindCell} ${selected && isFocused ? "text-(--accent-fg)/90" : "text-black/55"}`}>
                {getFileKind(item)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Missing metadata ("--") is drawn fainter than real values. */
function Muted({ value }: { value: string }) {
  return value === "--" ? <span className="opacity-50">{value}</span> : <>{value}</>;
}

function SortHeader({
  label,
  sortKey,
  active,
  direction,
  onSort,
  className = "",
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = active === sortKey;
  const Arrow = direction === "asc" ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      aria-label={`Sort by ${label}`}
      aria-pressed={isActive}
      onClick={() => onSort(sortKey)}
      className={`flex min-w-0 items-center gap-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${isActive ? "text-black/75" : ""} ${className}`}
    >
      <span className="truncate">{label}</span>
      {isActive && <Arrow className="size-3 shrink-0" aria-hidden />}
    </button>
  );
}
