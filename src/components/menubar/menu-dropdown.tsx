"use client";

import { useLayoutEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import type { MenuActionItem, MenuDefinition } from "@/types/menu";

const VIEWPORT_MARGIN = 8;

interface MenuDropdownProps {
  menu: MenuDefinition;
  labelledBy: string;
  focusFirstItem: boolean;
  onSelect: (item: MenuActionItem) => void;
}

export function MenuDropdown({
  menu,
  labelledBy,
  focusFirstItem,
  onSelect,
}: MenuDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Keep the dropdown inside the viewport and move keyboard focus if needed.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { left, right } = el.getBoundingClientRect();
    const overflowRight = right - (window.innerWidth - VIEWPORT_MARGIN);
    const overflowLeft = VIEWPORT_MARGIN - left;
    if (overflowRight > 0) el.style.translate = `${-overflowRight}px 0`;
    else if (overflowLeft > 0) el.style.translate = `${overflowLeft}px 0`;
    if (focusFirstItem) {
      el.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    }
  }, [focusFirstItem]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-labelledby={labelledBy}
      className="absolute top-full left-0 mt-px min-w-56 rounded-[10px] border border-white/15 bg-neutral-900/60 p-1.5 text-[13px] text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl backdrop-saturate-150"
    >
      {menu.items.map((entry) =>
        entry.type === "separator" ? (
          <div
            key={entry.id}
            role="separator"
            className="mx-2.5 my-1.5 h-px bg-white/15"
          />
        ) : (
          <button
            key={entry.id}
            type="button"
            role="menuitem"
            disabled={entry.disabled}
            onClick={() => onSelect(entry)}
            className="flex h-[22px] w-full items-center gap-6 rounded-md px-2.5 text-left whitespace-nowrap outline-none enabled:focus:bg-(--accent) enabled:focus:text-(--accent-fg) enabled:hover:bg-(--accent) enabled:hover:text-(--accent-fg) disabled:text-white/30"
          >
            <span className="flex-1">{entry.label}</span>
            {entry.shortcut && (
              <span className="text-white/55 tracking-wide [button:focus_&]:text-white/80">
                {entry.shortcut}
              </span>
            )}
            {entry.hasSubmenu && <ChevronRight className="-mr-1 size-3.5" aria-hidden />}
          </button>
        ),
      )}
    </div>
  );
}
