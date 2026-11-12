"use client";

import { DISPLAY_LOCALE } from "@/config/locale";

import { useMinuteNow } from "../hooks/use-minute-clock";
import type { WidgetProps } from "../types/widgets";

function weekNumber(date: Date) {
  // ISO 8601 week number.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7);
}

/** The visitor's local time, locale-aware, updated once a minute. */
export function ClockWidget({ size }: WidgetProps) {
  const now = useMinuteNow();
  if (!now) return null;
  const time = new Intl.DateTimeFormat(DISPLAY_LOCALE, { hour: "numeric", minute: "2-digit" }).format(now);
  const weekday = new Intl.DateTimeFormat(DISPLAY_LOCALE, { weekday: "long" }).format(now);
  const date = new Intl.DateTimeFormat(DISPLAY_LOCALE, { month: "long", day: "numeric" }).format(now);
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (size === "small") {
    return (
      <div className="flex size-full flex-col items-center justify-center text-center">
        <span className="text-[11px] font-semibold tracking-wide text-(--accent) uppercase">{weekday}</span>
        <time className="text-[34px] leading-tight font-light tabular-nums text-black/90">{time}</time>
      </div>
    );
  }
  if (size === "medium") {
    return (
      <div className="flex size-full flex-col justify-center px-5">
        <span className="text-[12px] font-semibold tracking-wide text-(--accent) uppercase">{weekday}</span>
        <time className="text-[52px] leading-none font-light tabular-nums text-black/90">{time}</time>
        <span className="mt-1 text-[14px] text-black/60">{date}</span>
      </div>
    );
  }
  return (
    <div className="flex size-full flex-col justify-between p-6">
      <div>
        <span className="text-[13px] font-semibold tracking-wide text-(--accent) uppercase">{weekday}</span>
        <time className="block text-[84px] leading-none font-light tabular-nums text-black/90">{time}</time>
        <span className="mt-2 block text-[17px] text-black/65">{date}</span>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-[12px]">
        <div>
          <dt className="text-black/45">Time zone</dt>
          <dd className="truncate font-medium text-black/80">{zone.replaceAll("_", " ")}</dd>
        </div>
        <div>
          <dt className="text-black/45">Week</dt>
          <dd className="font-medium text-black/80">{weekNumber(now)}</dd>
        </div>
      </dl>
    </div>
  );
}
