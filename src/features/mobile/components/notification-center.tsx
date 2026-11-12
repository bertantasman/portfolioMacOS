"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { useProjectRegistry } from "@/lib/projects/registry";
import { buildNotices } from "../lib/notices";
import { useMobileStore } from "../store/mobile-store";
import { useNoticeStore } from "../store/notice-store";
import { OverlaySheet } from "./overlay-sheet";
import { useSwipe } from "./use-swipe";

/** Short pointers built from the portfolio's own content. They can be opened, dismissed one by one, or cleared. */
export function NotificationCenter() {
  const close = useMobileStore((s) => s.closeOverlay);
  const openApp = useMobileStore((s) => s.openApp);
  const registry = useProjectRegistry();
  const dismissed = useNoticeStore((s) => s.dismissed);
  const dismiss = useNoticeStore((s) => s.dismiss);
  const clear = useNoticeStore((s) => s.clear);
  const all = useMemo(() => buildNotices(registry), [registry]);
  const items = all.filter((n) => !dismissed.includes(n.id));
  const swipe = useSwipe((d) => d === "up" && close());
  return (
    <OverlaySheet label="Notification Center">
      <div {...swipe.handlers} className="max-h-full touch-pan-y overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold">Notifications</h2>
          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <button type="button" onClick={() => clear(all.map((n) => n.id))} className="h-11 rounded-full px-3 text-[14px] text-white/85 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/90">
                Clear all
              </button>
            )}
            <button type="button" data-autofocus onClick={close} aria-label="Close Notification Center" className="grid size-11 place-items-center rounded-full outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/90">
              <X className="size-5" aria-hidden />
            </button>
          </div>
        </div>
        {items.length === 0 ? (
          <p role="status" className="py-8 text-center text-[14px] text-white/75">No notifications</p>
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li key={n.id} className="flex items-stretch rounded-2xl bg-white/12">
                <button type="button" onClick={() => openApp(n.app, n.stack)} className="min-w-0 flex-1 rounded-2xl p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/90 active:bg-white/10">
                  <span className="block text-[14px] font-semibold">{n.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[13px] text-white/75">{n.message}</span>
                </button>
                <button type="button" onClick={() => dismiss(n.id)} aria-label={`Dismiss: ${n.title}`} className="grid w-11 shrink-0 place-items-center rounded-r-2xl text-white/70 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/90">
                  <X className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </OverlaySheet>
  );
}
