import { useEffect, useRef } from "react";
import { useContextMenuStore } from "@/store/context-menu-store";

interface WindowControlsProps {
  /** When set, the green button also opens the window layout menu for this window. */
  layoutWindowId?: string;
  isFocused: boolean;
  isMaximized: boolean;
  canMaximize: boolean;
  /** Phone layout: two large Close and Minimize buttons instead of the traffic lights. */
  compact?: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
}

const base =
  "grid size-3 place-items-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-[#0a60ff]/80 focus-visible:ring-offset-1";
const inactive = "border-black/10 bg-control-inactive";

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className="size-[10px] opacity-0 group-hover/controls:opacity-100 group-focus-within/controls:opacity-100"
    >
      {children}
    </svg>
  );
}

export function WindowControls({
  layoutWindowId,
  isFocused,
  isMaximized,
  canMaximize,
  compact = false,
  onClose,
  onMinimize,
  onToggleMaximize,
}: WindowControlsProps) {
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      if (pressTimer.current) clearTimeout(pressTimer.current);
    },
    [],
  );

  const openLayoutMenu = (el: HTMLElement, options: { keyboard?: boolean; hover?: boolean }) => {
    if (!layoutWindowId) return;
    const r = el.getBoundingClientRect();
    useContextMenuStore
      .getState()
      .show({ type: "window-layout", windowId: layoutWindowId }, r.left, r.bottom + 6, options.keyboard, {
        hover: options.hover,
        anchor: { left: r.left, top: r.top, right: r.right, bottom: r.bottom },
      });
  };
  const cancelTimers = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (pressTimer.current) clearTimeout(pressTimer.current);
    hoverTimer.current = pressTimer.current = null;
  };

  const tone = (active: string, hover: string) =>
    isFocused ? active : `${inactive} ${hover}`;

  if (compact) {
    // Touch layout: no hover, no maximize (the window already fills the screen). 36px buttons whose
    // hit areas reach 44px, with the same Close / Minimize meaning as on the desktop.
    const touch = "relative grid size-9 place-items-center rounded-full outline-none before:absolute before:-inset-1 before:content-[''] focus-visible:ring-2 focus-visible:ring-[#0a60ff]/80";
    return (
      <div role="group" aria-label="Window controls" className="flex items-center gap-1.5">
        <button type="button" aria-label="Close" onClick={onClose} className={`${touch} bg-[#ff5f57] text-[#4d0000]`}>
          <svg viewBox="0 0 12 12" aria-hidden className="size-4">
            <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" aria-label="Minimize" onClick={onMinimize} className={`${touch} bg-[#febc2e] text-[#5a3b00]`}>
          <svg viewBox="0 0 12 12" aria-hidden className="size-4">
            <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div role="group" aria-label="Window controls" className="group/controls flex items-center gap-2">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`${base} ${tone("border-[#e0443e] bg-[#ff5f57]", "group-hover/controls:border-[#e0443e] group-hover/controls:bg-[#ff5f57]")}`}
      >
        <Glyph>
          <path d="M3 3l6 6M9 3L3 9" stroke="#4d0000" strokeWidth="1.3" strokeLinecap="round" />
        </Glyph>
      </button>
      <button
        type="button"
        aria-label="Minimize"
        onClick={onMinimize}
        className={`${base} ${tone("border-[#dea123] bg-[#febc2e]", "group-hover/controls:border-[#dea123] group-hover/controls:bg-[#febc2e]")}`}
      >
        <Glyph>
          <path d="M2.5 6h7" stroke="#5a3b00" strokeWidth="1.3" strokeLinecap="round" />
        </Glyph>
      </button>
      <button
        type="button"
        aria-label={isMaximized ? "Restore" : "Maximize"}
        aria-disabled={!canMaximize}
        aria-haspopup={layoutWindowId ? "menu" : undefined}
        onClick={() => {
          // A long press that opened the layout menu is not also a click.
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          if (canMaximize) onToggleMaximize();
        }}
        // Layout menu: hover (after a short pause), long-press on touch, or Down arrow / Context Menu key.
        onPointerEnter={(e) => {
          if (!layoutWindowId || !canMaximize || e.pointerType !== "mouse") return;
          const el = e.currentTarget;
          hoverTimer.current = setTimeout(() => openLayoutMenu(el, { hover: true }), 450);
        }}
        onPointerLeave={cancelTimers}
        onPointerDown={(e) => {
          if (!layoutWindowId || !canMaximize || e.pointerType === "mouse") return;
          const el = e.currentTarget;
          pressTimer.current = setTimeout(() => {
            longPressed.current = true;
            openLayoutMenu(el, {});
          }, 500);
        }}
        onPointerUp={cancelTimers}
        onKeyDown={(e) => {
          if (!layoutWindowId || !canMaximize) return;
          if (e.key === "ArrowDown" || e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
            e.preventDefault();
            e.stopPropagation();
            openLayoutMenu(e.currentTarget, { keyboard: true });
          }
        }}
        className={`${base} ${
          canMaximize
            ? tone("border-[#1aab29] bg-[#28c840]", "group-hover/controls:border-[#1aab29] group-hover/controls:bg-[#28c840]")
            : inactive
        }`}
      >
        {canMaximize && (
          <Glyph>
            {isMaximized ? (
              <>
                <path d="M2.5 6.5h3v3z" fill="#0a4d0a" />
                <path d="M9.5 5.5h-3v-3z" fill="#0a4d0a" />
              </>
            ) : (
              <>
                <path d="M2.5 9.5v-4.5l4.5 4.5z" fill="#0a4d0a" />
                <path d="M9.5 2.5v4.5l-4.5-4.5z" fill="#0a4d0a" />
              </>
            )}
          </Glyph>
        )}
      </button>
    </div>
  );
}
