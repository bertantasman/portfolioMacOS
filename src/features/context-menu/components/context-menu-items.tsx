"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import type { MenuEntry } from "../types/context-menu";
import { LayoutDiagram } from "./layout-diagram";

export interface MenuContext {
  openSub: string | null;
  setOpenSub: (id: string | null) => void;
  activate: (entry: Extract<MenuEntry, { kind: "item" }>) => void;
}

const itemClass =
  "flex h-[22px] w-full items-center gap-1.5 rounded-[5px] pr-2 pl-1 text-left text-[13px] text-black/90 outline-none focus:bg-(--accent) focus:text-(--accent-fg) aria-disabled:pointer-events-none aria-disabled:text-black/30";

export function ContextMenuSeparator() {
  return <div role="separator" className="mx-2 my-1 h-px bg-black/10" />;
}

/** One menu list: the top-level menu or a submenu. `depth` 1 lists don't close their parent on hover. */
export function MenuList({ entries, ctx, depth, label }: { entries: MenuEntry[]; ctx: MenuContext; depth: 0 | 1; label: string }) {
  return (
    <div role="menu" aria-label={label} data-depth={depth} className="flex flex-col">
      {entries.map((entry) => {
        if (entry.kind === "separator") return <ContextMenuSeparator key={entry.id} />;
        if (entry.kind === "submenu") return <SubmenuRow key={entry.id} entry={entry} ctx={ctx} />;
        return <ContextMenuItem key={entry.id} entry={entry} ctx={ctx} depth={depth} />;
      })}
    </div>
  );
}

function CheckColumn({ checked }: { checked?: boolean }) {
  return (
    <span aria-hidden className="grid size-3.5 shrink-0 place-items-center">
      {checked && <Check className="size-3" strokeWidth={2.5} />}
    </span>
  );
}

function ContextMenuItem({ entry, ctx, depth }: { entry: Extract<MenuEntry, { kind: "item" }>; ctx: MenuContext; depth: 0 | 1 }) {
  const radio = entry.checked !== undefined;
  return (
    <button
      type="button"
      role={radio ? "menuitemradio" : "menuitem"}
      aria-checked={radio ? entry.checked : undefined}
      aria-disabled={entry.disabled || undefined}
      aria-label={entry.ariaLabel}
      data-menu-item
      tabIndex={-1}
      onPointerEnter={(e) => {
        if (depth === 0) ctx.setOpenSub(null);
        if (!entry.disabled) e.currentTarget.focus({ preventScroll: true });
      }}
      onClick={() => {
        if (!entry.disabled) ctx.activate(entry);
      }}
      className={itemClass}
    >
      <CheckColumn checked={entry.checked} />
      {entry.diagram && <LayoutDiagram kind={entry.diagram} />}
      <span className="flex-1 truncate">{entry.label}</span>
      {entry.shortcut && <span aria-hidden className="pl-4 text-[12px] opacity-60">{entry.shortcut}</span>}
    </button>
  );
}

function SubmenuRow({ entry, ctx }: { entry: Extract<MenuEntry, { kind: "submenu" }>; ctx: MenuContext }) {
  const open = ctx.openSub === entry.id;
  return (
    <div className="relative">
      <button
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-disabled={entry.disabled || undefined}
        data-menu-item
        data-submenu-trigger={entry.id}
        tabIndex={-1}
        onPointerEnter={(e) => {
          if (entry.disabled) return;
          e.currentTarget.focus({ preventScroll: true });
          ctx.setOpenSub(entry.id);
        }}
        onClick={() => !entry.disabled && ctx.setOpenSub(open ? null : entry.id)}
        className={itemClass}
      >
        <CheckColumn />
        <span className="flex-1 truncate">{entry.label}</span>
        <ChevronRight className="size-3.5 opacity-70" aria-hidden />
      </button>
      {open && <Submenu id={entry.id} label={entry.label} items={entry.items} ctx={ctx} />}
    </div>
  );
}

/** Opens beside its row; flips to the left (and shifts up) when the right/bottom would be clipped. */
function Submenu({ id, label, items, ctx }: { id: string; label: string; items: MenuEntry[]; ctx: MenuContext }) {
  const ref = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<{ flip: boolean; shift: number }>({ flip: false, shift: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const flip = rect.right > window.innerWidth - 8;
    const overflow = rect.bottom - (window.innerHeight - 8);
    setPlacement({ flip, shift: overflow > 0 ? -overflow : 0 });
  }, []);

  return (
    <div
      ref={ref}
      data-submenu={id}
      style={{ top: -5 + placement.shift }}
      className={`absolute z-10 min-w-[170px] rounded-[10px] border border-black/10 bg-window p-1 shadow-[0_10px_34px_rgba(0,0,0,0.3)] backdrop-blur-2xl backdrop-saturate-150 ${
        placement.flip ? "right-[calc(100%-4px)]" : "left-[calc(100%-4px)]"
      }`}
    >
      <MenuList entries={items} ctx={ctx} depth={1} label={label} />
    </div>
  );
}
