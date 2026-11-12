import { List, PanelLeft, Search, X } from "lucide-react";
import type { RefObject } from "react";
import { WindowDragArea } from "@/components/windows/window-chrome";

interface NotesToolbarProps {
  title: string;
  subtitle?: string;
  sidebarVisible: boolean;
  listVisible: boolean;
  /** Extra left padding so the title clears the traffic lights when the sidebar is hidden. */
  clearTrafficLights: boolean;
  query: string;
  searchRef: RefObject<HTMLInputElement | null>;
  onToggleSidebar: () => void;
  onToggleList: () => void;
  onQueryChange: (query: string) => void;
}

const button =
  "grid h-7 w-8 shrink-0 place-items-center rounded-md text-black/60 outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-(--accent)";

export function NotesToolbar({
  title,
  subtitle,
  sidebarVisible,
  listVisible,
  clearTrafficLights,
  query,
  searchRef,
  onToggleSidebar,
  onToggleList,
  onQueryChange,
}: NotesToolbarProps) {
  return (
    <WindowDragArea
      className={`flex h-[52px] shrink-0 items-center gap-1 border-b border-black/10 bg-surface-2 pr-3 ${
        clearTrafficLights ? "pl-[84px]" : "pl-3"
      }`}
    >
      <button type="button" aria-label="Show folders" aria-pressed={sidebarVisible} onClick={onToggleSidebar} className={`${button} ${sidebarVisible ? "bg-black/[0.07]" : ""}`}>
        <PanelLeft className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </button>
      <button type="button" aria-label="Show note list" aria-pressed={listVisible} onClick={onToggleList} className={`${button} ${listVisible ? "bg-black/[0.07]" : ""}`}>
        <List className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </button>

      <div className="mr-auto ml-2 min-w-0 pr-2 @max-[700px]:hidden">
        <p className="truncate text-[13px] leading-4 font-semibold text-black/85">{title}</p>
        {subtitle && <p className="truncate text-[11px] leading-3 text-black/40">{subtitle}</p>}
      </div>
      <div className="mr-auto @min-[701px]:hidden" />

      <div role="search" className="relative flex h-7 w-[180px] items-center rounded-md bg-black/[0.06] focus-within:bg-raised focus-within:ring-2 focus-within:ring-(--accent)">
        <Search className="pointer-events-none absolute left-2 size-3.5 text-black/40" aria-hidden />
        <input
          ref={searchRef}
          type="text"
          aria-label="Search notes"
          placeholder="Search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="h-full min-w-0 flex-1 bg-transparent pr-6 pl-7 text-[13px] text-black/85 outline-none placeholder:text-black/40"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onQueryChange("")}
            className="absolute right-1 grid size-5 place-items-center rounded-full text-black/40 outline-none hover:text-black/70 focus-visible:ring-2 focus-visible:ring-(--accent)"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        )}
      </div>
    </WindowDragArea>
  );
}
