"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useOverlayStore } from "@/store/overlay-store";
import { useWidgetStore } from "@/store/widget-store";
import { widgetRegistry } from "../registry/widget-registry";
import type { WidgetSize } from "../types/widgets";
import { sizeSpan, widgetPixelSize } from "../utils/widget-layout";
import { widgetComponents } from "../widgets";
import { WidgetSizeSelector } from "./widget-size-selector";
import { WidgetSurface } from "./widget-surface";

/** The Widget Gallery: a floating panel listing every widget type, with a live preview and sizes. */
export function WidgetGallery() {
  const open = useOverlayStore((s) => s.active === "widget-gallery");
  const reduced = useShouldReduceMotion();
  return <AnimatePresence>{open && <Panel key="gallery" reduced={reduced} />}</AnimatePresence>;
}

function Panel({ reduced }: { reduced: boolean }) {
  const close = useOverlayStore((s) => s.close);
  const addWidget = useWidgetStore((s) => s.addWidget);
  const resetWidgets = useWidgetStore((s) => s.resetWidgets);
  const grid = useWidgetStore((s) => s.grid);
  const [selectedType, setSelectedType] = useState(widgetRegistry[0].type);
  const [sizes, setSizes] = useState<Record<string, WidgetSize>>({});
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);
  const duration = reduced ? 0 : 0.18;

  const def = widgetRegistry.find((w) => w.type === selectedType) ?? widgetRegistry[0];
  const size = sizes[def.type] && def.supportedSizes.includes(sizes[def.type]) ? sizes[def.type] : def.defaultSize;
  const Preview = widgetComponents[def.type];
  const { width: pw, height: ph } = widgetPixelSize(size);
  // The preview is drawn at the real size and scaled down only if the panel is short of room.
  const scale = Math.min(1, 300 / Math.max(pw, ph));
  const fitsDesktop = sizeSpan[size].cols <= grid.cols && sizeSpan[size].rows <= grid.rows;

  const dismiss = () => {
    close("widget-gallery");
    const el = previousFocus.current;
    if (el instanceof HTMLElement && el.isConnected) requestAnimationFrame(() => el.focus());
  };

  useEffect(() => {
    previousFocus.current = document.activeElement;
    panelRef.current?.focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (confirmingReset) setConfirmingReset(false);
      else dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmingReset]);

  const add = () => {
    const result = addWidget(def.type, size);
    setMessage(result.ok ? { text: `${def.title} added to the desktop.`, ok: true } : { text: result.reason, ok: false });
  };

  return (
    <motion.div
      className="fixed inset-0 z-(--z-notification-center) grid place-items-center p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Widget Gallery"
        tabIndex={-1}
        initial={reduced ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduced ? undefined : { opacity: 0, scale: 0.99 }}
        transition={{ duration, ease: "easeOut" }}
        className="flex max-h-[calc(100dvh-24px)] w-[min(720px,100%)] flex-col overflow-hidden rounded-[20px] border border-black/10 bg-window text-black shadow-[0_24px_80px_rgba(0,0,0,0.4)] outline-none backdrop-blur-3xl backdrop-saturate-150"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-black/10 px-5 py-3">
          <h2 className="text-[15px] font-semibold text-black/90">Widgets</h2>
          <button type="button" aria-label="Close Widget Gallery" onClick={dismiss} className="grid size-7 place-items-center rounded-md text-black/55 outline-none hover:bg-black/[0.07] focus-visible:ring-2 focus-visible:ring-(--accent)">
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto sm:flex-row">
          <nav aria-label="Widget types" className="shrink-0 border-b border-black/10 p-2 sm:w-[190px] sm:border-r sm:border-b-0">
            <ul className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
              {widgetRegistry.map((w) => {
                const active = w.type === def.type;
                return (
                  <li key={w.type} className="shrink-0">
                    <button
                      type="button"
                      aria-current={active ? "true" : undefined}
                      onClick={() => {
                        setSelectedType(w.type);
                        setMessage(null);
                      }}
                      className={`flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${active ? "bg-(--accent) text-(--accent-fg)" : "text-black/85 hover:bg-black/[0.06]"}`}
                    >
                      <w.icon className="size-4 shrink-0" aria-hidden />
                      {w.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <section aria-label={`${def.title} widget`} className="flex min-w-0 flex-1 flex-col items-center gap-4 p-5">
            <div className="grid min-h-[200px] w-full flex-1 place-items-center">
              {/* A live preview at the real widget size. Nothing inside it reacts. */}
              <div aria-hidden inert style={{ width: pw * scale, height: ph * scale }}>
                <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                  <WidgetSurface size={size}>
                    <Preview size={size} preview />
                  </WidgetSurface>
                </div>
              </div>
            </div>
            <p className="max-w-[360px] text-center text-[13px] text-black/60">{def.description}</p>
            <WidgetSizeSelector
              sizes={def.supportedSizes}
              value={size}
              onChange={(s) => {
                setSizes((prev) => ({ ...prev, [def.type]: s }));
                setMessage(null);
              }}
            />
            <button
              type="button"
              onClick={add}
              disabled={!fitsDesktop}
              className="h-8 rounded-full bg-(--accent) px-5 text-[13px] font-medium text-(--accent-fg) outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-40"
            >
              Add Widget
            </button>
            {!fitsDesktop && <p className="text-[12px] text-black/50">This size doesn’t fit the desktop at this screen size.</p>}
            <p role="status" className={`min-h-4 text-[12px] ${message?.ok === false ? "text-[#c0392b]" : "text-black/55"}`}>
              {message?.text}
            </p>
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-black/10 px-5 py-2.5">
          {confirmingReset ? (
            <>
              <p className="text-[12px] text-black/70">Replace your widgets with the default layout?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmingReset(false)} className="h-7 rounded-md bg-black/[0.07] px-3 text-[12px] text-black/80 outline-none focus-visible:ring-2 focus-visible:ring-(--accent)">
                  Cancel
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => {
                    resetWidgets();
                    setConfirmingReset(false);
                    setMessage({ text: "Widgets reset to the default layout.", ok: true });
                  }}
                  className="h-7 rounded-md bg-(--accent) px-3 text-[12px] font-medium text-(--accent-fg) outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  Reset
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[12px] text-black/45">Right-click a widget to resize, move or remove it.</p>
              <button type="button" onClick={() => setConfirmingReset(true)} className="h-7 rounded-md px-2.5 text-[12px] text-black/65 outline-none hover:bg-black/[0.07] focus-visible:ring-2 focus-visible:ring-(--accent)">
                Reset Widgets…
              </button>
            </>
          )}
        </footer>
      </motion.div>
    </motion.div>
  );
}
