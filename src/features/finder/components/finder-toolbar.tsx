import { ChevronLeft, ChevronRight, Ellipsis, LayoutGrid, List, PanelLeft, Search } from "lucide-react";
import { WindowDragArea } from "@/components/windows/window-chrome";
import type { SortKey } from "@/lib/virtual-fs/types";
import type { FinderViewMode } from "../types/finder";

interface FinderToolbarProps {
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  viewMode: FinderViewMode;
  sortKey: SortKey;
  onSortKeyChange: (key: SortKey) => void;
  onBack: () => void;
  onForward: () => void;
  onViewModeChange: (mode: FinderViewMode) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const buttonClass =
  "grid h-7 w-8 place-items-center rounded-md text-black/65 outline-none enabled:hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-(--accent) disabled:text-black/25";

export function FinderToolbar({
  title,
  canGoBack,
  canGoForward,
  viewMode,
  sortKey,
  onSortKeyChange,
  onBack,
  onForward,
  onViewModeChange,
  sidebarOpen,
  onToggleSidebar,
}: FinderToolbarProps) {
  return (
    <WindowDragArea className="flex h-[52px] shrink-0 items-center gap-1 border-b border-black/10 bg-surface/80 pr-3 pl-3 @max-[520px]:pl-[92px]">
      {/* Narrow windows keep the sidebar in a drawer. */}
      <button
        type="button"
        aria-label="Sidebar"
        aria-expanded={sidebarOpen}
        aria-controls="finder-sidebar"
        onClick={onToggleSidebar}
        className={`${buttonClass} hidden @max-[520px]:grid`}
      >
        <PanelLeft className="size-[18px]" aria-hidden />
      </button>
      <button type="button" aria-label="Back" disabled={!canGoBack} onClick={onBack} className={buttonClass}>
        <ChevronLeft className="size-[18px]" strokeWidth={2.25} aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Forward"
        disabled={!canGoForward}
        onClick={onForward}
        className={buttonClass}
      >
        <ChevronRight className="size-[18px]" strokeWidth={2.25} aria-hidden />
      </button>
      <h2 className="mr-auto ml-2 min-w-0 truncate pr-2 text-[15px] font-semibold text-black/85">
        {title}
      </h2>

      <div role="group" aria-label="View" className="flex rounded-md bg-black/[0.06] p-0.5">
        {(
          [
            { mode: "icon", label: "Icon view", Icon: LayoutGrid },
            { mode: "list", label: "List view", Icon: List },
          ] as const
        ).map(({ mode, label, Icon }) => (
          <button
            key={mode}
            type="button"
            aria-label={label}
            aria-pressed={viewMode === mode}
            onClick={() => onViewModeChange(mode)}
            className={`grid h-6 w-8 place-items-center rounded-[5px] outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${
              viewMode === mode
                ? "bg-raised text-black/80 shadow-[0_0_0_0.5px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.12)]"
                : "text-black/55 hover:text-black/75"
            }`}
          >
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        ))}
      </div>
      <select
        aria-label="Sort by"
        value={sortKey}
        onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
        className="h-7 rounded-md bg-black/[0.06] px-1.5 text-[12px] text-black/70 outline-none focus-visible:ring-2 focus-visible:ring-(--accent) @max-[620px]:hidden"
      >
        <option value="name">Name</option>
        <option value="modified">Date Modified</option>
        <option value="kind">Kind</option>
      </select>
      {/* Not implemented yet: shown disabled instead of pretending to work. */}
      <button type="button" aria-label="More options" disabled className={`${buttonClass} @max-[560px]:hidden`}>
        <Ellipsis className="size-[18px]" aria-hidden />
      </button>
      <button type="button" aria-label="Search" disabled className={`${buttonClass} @max-[560px]:hidden`}>
        <Search className="size-4" aria-hidden />
      </button>
    </WindowDragArea>
  );
}
