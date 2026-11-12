import type { KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { routeTitle } from "../config/safari-routes";
import { currentRoute, type SafariTab } from "../types/safari";

interface SafariTabBarProps {
  tabs: readonly SafariTab[];
  activeTabId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNewTab: () => void;
}

export function tabElementId(tabId: string) {
  return `safari-tab-${tabId}`;
}
export const TAB_PANEL_ID = "safari-tab-panel";

export function SafariTabBar({ tabs, activeTabId, onSelect, onClose, onNewTab }: SafariTabBarProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const index = tabs.findIndex((t) => t.id === activeTabId);
    const next = tabs[(index + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    e.preventDefault();
    onSelect(next.id);
    requestAnimationFrame(() => document.getElementById(tabElementId(next.id))?.focus());
  };

  return (
    <div className="flex h-8 shrink-0 items-stretch border-b border-black/10 bg-sidebar/90">
      <div
        role="tablist"
        aria-label="Open tabs"
        onKeyDown={onKeyDown}
        className="flex min-w-0 flex-1 items-stretch overflow-x-auto"
      >
        {tabs.map((tab, i) => {
          const active = tab.id === activeTabId;
          const title = routeTitle(currentRoute(tab));
          return (
            <div
              key={tab.id}
              className={`group relative flex min-w-[96px] max-w-[220px] flex-1 items-center ${
                active ? "bg-surface-2" : "hover:bg-black/[0.04]"
              } ${i > 0 && !active ? "border-l border-black/10" : ""}`}
            >
              <button
                id={tabElementId(tab.id)}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={TAB_PANEL_ID}
                tabIndex={active ? 0 : -1}
                onClick={() => onSelect(tab.id)}
                className="h-full min-w-0 flex-1 truncate pr-7 pl-3 text-center text-[12px] text-black/75 outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-inset"
              >
                {title}
              </button>
              <button
                type="button"
                aria-label={`Close tab ${title}`}
                onClick={() => onClose(tab.id)}
                className="absolute left-1.5 grid size-4 place-items-center rounded text-black/45 opacity-0 outline-none group-hover:opacity-100 hover:bg-black/10 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-(--accent)"
              >
                <X className="size-3" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="New tab"
        onClick={onNewTab}
        className="grid w-8 shrink-0 place-items-center border-l border-black/10 text-black/55 outline-none hover:bg-black/[0.05] focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-inset"
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
