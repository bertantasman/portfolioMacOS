"use client";

import { useEffect, useState } from "react";
import { applications } from "@/config/applications";
import { performNotificationAction } from "../utils/notification-actions";
import { useNotificationStore } from "@/store/notification-store";
import type { DesktopNotification } from "../types/notification";

/** Application name and icon from the registry, with a fallback for unknown ids. */
export function getAppInfo(appId: string): { name: string; icon: string } {
  const app = applications.find((a) => a.id === appId);
  return app ? { name: app.name, icon: app.icon } : { name: "System", icon: "/icons/apps/system-settings.svg" };
}

/** Current time, refreshed every `intervalMs` while `active` (for relative timestamps). */
export function useNow(active: boolean, intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, intervalMs);
    return () => clearInterval(timer);
  }, [active, intervalMs]);
  return now;
}

/**
 * Activates a notification: marks it read and runs its action. Returns whether the
 * action ran (true when there is none). A missing target is a quiet no-op.
 */
export function activateNotification(n: DesktopNotification): boolean {
  useNotificationStore.getState().markRead(n.id);
  return n.action ? performNotificationAction(n.action) : true;
}
