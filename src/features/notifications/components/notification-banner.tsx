"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useNotificationStore } from "@/store/notification-store";
import { activateNotification, getAppInfo } from "../hooks/use-notifications";
import type { DesktopNotification, NotificationPriority } from "../types/notification";

const DURATION: Record<NotificationPriority, number> = { low: 4000, normal: 5000, high: 8000 };

/** One banner. It hides itself after a few seconds, pausing while hovered or focused. */
export function NotificationBanner({ notification: n }: { notification: DesktopNotification }) {
  const dismissBanner = useNotificationStore((s) => s.dismissBanner);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(DURATION[n.priority]);
  const startedAt = useRef(0);
  const app = getAppInfo(n.appId);

  useEffect(() => {
    if (paused) return;
    startedAt.current = Date.now();
    const timer = setTimeout(() => dismissBanner(n.id), remaining.current);
    return () => {
      clearTimeout(timer);
      // Keep only the time that was left, so resuming doesn't restart the full countdown.
      remaining.current = Math.max(1000, remaining.current - (Date.now() - startedAt.current));
    };
  }, [paused, n.id, dismissBanner]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="group relative flex w-full items-start rounded-[18px] border border-black/10 bg-window shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-3xl backdrop-saturate-150"
    >
      <button
        type="button"
        onClick={() => {
          activateNotification(n);
          dismissBanner(n.id);
        }}
        className="flex min-w-0 flex-1 items-start gap-3 rounded-[18px] p-3 pr-9 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
      >
        <Image src={app.icon} alt="" width={72} height={72} unoptimized draggable={false} className="mt-0.5 size-9 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[13px] font-semibold text-black/90">{n.title}</span>
            <span className="shrink-0 text-[11px] text-black/45">Now</span>
          </span>
          <span className="block truncate text-[11px] text-black/45">{app.name}</span>
          {n.message && <span className="mt-0.5 line-clamp-2 block text-[12px] text-black/70">{n.message}</span>}
        </span>
      </button>
      <button
        type="button"
        aria-label={`Close notification: ${n.title}`}
        onClick={() => dismissBanner(n.id)}
        className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-black/10 text-black/55 opacity-0 outline-none group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-black/20 focus-visible:ring-2 focus-visible:ring-(--accent)"
      >
        <X className="size-3" aria-hidden />
      </button>
    </div>
  );
}
