import type { VirtualFile } from "@/lib/virtual-fs/types";
import { FileTypeIcon } from "@/components/file-icons";
import { contextMenuProps } from "@/features/context-menu/hooks/use-context-menu";

interface FinderItemProps {
  item: VirtualFile;
  selected: boolean;
  /** Selection is blue while the window is focused, grey otherwise. */
  windowFocused: boolean;
  tabbable: boolean;
  onSelect: (id: string) => void;
  onOpen: (item: VirtualFile) => void;
}

/** One icon-view cell. */
export function FinderItem({ item, selected, windowFocused, tabbable, onSelect, onOpen }: FinderItemProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      data-finder-item={item.id}
      tabIndex={tabbable ? 0 : -1}
      onClick={() => onSelect(item.id)}
      onDoubleClick={() => onOpen(item)}
      {...contextMenuProps({ type: "file", fileId: item.id, source: "finder" }, () => onSelect(item.id))}
      className="group flex flex-col items-center gap-1 rounded-md p-1 text-center outline-none"
    >
      <span
        className={`grid size-[68px] place-items-center rounded-lg group-focus-visible:ring-2 group-focus-visible:ring-(--accent) ${
          selected ? "bg-black/[0.12]" : ""
        }`}
      >
        <FileTypeIcon file={item} className="h-[52px] w-auto max-w-[56px]" />
      </span>
      <span
        className={`line-clamp-2 max-w-full rounded px-1.5 text-[12px] leading-[15px] break-words ${
          selected
            ? windowFocused
              ? "bg-(--accent) text-(--accent-fg)"
              : "bg-black/15 text-black/85"
            : "text-black/85"
        }`}
      >
        {item.name}
      </span>
    </button>
  );
}
