"use client";

import { DISPLAY_LOCALE } from "@/config/locale";

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Moon } from "lucide-react";
import { SettingsToggle } from "@/features/settings/components/settings-controls";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useNotificationStore } from "@/store/notification-store";
import { useOverlayStore } from "@/store/overlay-store";
import { useSettingsStore } from "@/store/settings-store";
import { activateNotification, useNow } from "../hooks/use-notifications";
import type { DesktopNotification } from "../types/notification";
import { NotificationEmptyState } from "./notification-empty-state";
import { NotificationGroup } from "./notification-group";

const dateFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, { weekday: "long", month: "long", day: "numeric" });

/** Notification Center: a desktop overlay (not a window), opened from the menu bar clock. */
export function NotificationCenter() {
  const open = useOverlayStore((s) => s.active === "notification-center");
  const reduced = useShouldReduceMotion();
  return (
    <AnimatePresence>
      {open && <Panel key="nc" reduced={reduced} />}
    </AnimatePresence>
  );
}

function Panel({ reduced }: { reduced: boolean }) {
  const close = useOverlayStore((s) => s.close);
  const history = useNotificationStore((s) => s.notifications);
  const dismissNotification = useNotificationStore((s) => s.dismissNotification);
  const clearNotifications = useNotificationStore((s) => s.clearNotifications);
  const doNotDisturb = useSettingsStore((s) => s.doNotDisturb);
  const setDoNotDisturb = useSettingsStore((s) => s.setDoNotDisturb);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);
  const now = useNow(true);
  const duration = reduced ? 0 : 0.22;

  // Only notifications kept in history; banner-only ones are not listed.
  const groups = useMemo(() => {
    const byApp = new Map<string, DesktopNotification[]>();
    for (const n of history) {
      if (n.transient) continue;
      byApp.set(n.appId, [...(byApp.get(n.appId) ?? []), n]); // history is newest first
    }
    // Groups with the most recent activity come first.
    return [...byApp.entries()].sort((a, b) => b[1][0].createdAt - a[1][0].createdAt);
  }, [history]);

  const dismiss = () => {
    close("notification-center");
    const el = previousFocus.current;
    if (el instanceof HTMLElement && el.isConnected) requestAnimationFrame(() => el.focus());
  };

  useEffect(() => {
    previousFocus.current = document.activeElement;
    panelRef.current?.focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activate = (n: DesktopNotification) => {
    // Missing targets are handled (and logged) by the navigation layer.
    if (activateNotification(n) && n.action) close("notification-center");
  };

  const hasAny = groups.length > 0;

  return (
    <motion.div
      className="fixed inset-0 z-(--z-notification-center)"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      // Clicking anywhere outside the panel closes it; nothing behind receives the click.
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-label="Notification Center"
        tabIndex={-1}
        initial={reduced ? false : { x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={reduced ? undefined : { x: 32, opacity: 0 }}
        transition={{ duration, ease: "easeOut" }}
        className="absolute top-[calc(1.75rem+env(safe-area-inset-top)+6px)] right-2 bottom-[104px] flex w-[380px] max-w-[calc(100vw-16px)] flex-col overflow-hidden rounded-[20px] border border-black/10 bg-window text-black shadow-[0_16px_60px_rgba(0,0,0,0.35)] outline-none backdrop-blur-3xl backdrop-saturate-150"
      >
        <header className="shrink-0 px-4 pt-3.5 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-black/90">Notification Center</h2>
              <p className="text-[12px] text-black/45">{dateFormatter.format(now)}</p>
            </div>
            <button
              type="button"
              onClick={clearNotifications}
              disabled={!hasAny}
              className="h-6 rounded-md bg-black/[0.07] px-2.5 text-[12px] text-black/70 outline-none enabled:hover:bg-black/[0.12] focus-visible:ring-2 focus-visible:ring-(--accent) disabled:opacity-40"
            >
              Clear All
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-[12px] bg-black/[0.05] px-3 py-2">
            <span className="flex items-center gap-2 text-[13px] text-black/85">
              <Moon className="size-4 text-black/55" aria-hidden />
              Do Not Disturb
            </span>
            <SettingsToggle label="Do Not Disturb" checked={doNotDisturb} onChange={setDoNotDisturb} />
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-1 pb-3">
          {hasAny ? (
            <div className="space-y-4">
              {groups.map(([appId, items]) => (
                <NotificationGroup
                  key={appId}
                  appId={appId}
                  notifications={items}
                  now={now}
                  onActivate={activate}
                  onRemove={(n) => dismissNotification(n.id)}
                />
              ))}
            </div>
          ) : (
            <NotificationEmptyState />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
