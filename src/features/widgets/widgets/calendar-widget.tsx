"use client";

import { DISPLAY_LOCALE } from "@/config/locale";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMinuteNow } from "../hooks/use-minute-clock";
import type { WidgetProps } from "../types/widgets";

/** First day of the week for the visitor's locale (1 = Monday … 7 = Sunday); Monday if unknown. */
function firstWeekday(): number {
  try {
    const locale = new Intl.Locale(DISPLAY_LOCALE) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    return (locale.getWeekInfo?.() ?? locale.weekInfo)?.firstDay ?? 1;
  } catch {
    return 1;
  }
}

/** The cells of a month: leading blanks for weekday alignment, then 1…days (leap years included). */
export function monthCells(year: number, month: number, weekStart: number): (number | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const first = new Date(year, month, 1).getDay() || 7; // 1 = Monday … 7 = Sunday
  const blanks = (first - weekStart + 7) % 7;
  return [...Array<null>(blanks).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
}

/** A real calendar. It shows dates only: there are no events, and none are invented. */
export function CalendarWidget({ size, preview }: WidgetProps) {
  const now = useMinuteNow();
  const [offset, setOffset] = useState(0);
  if (!now) return null;

  if (size === "small") {
    return (
      <div className="flex size-full flex-col items-center justify-center text-center">
        <span className="text-[12px] font-semibold tracking-wide text-(--accent) uppercase">{new Intl.DateTimeFormat(DISPLAY_LOCALE, { weekday: "long" }).format(now)}</span>
        <span className="text-[56px] leading-none font-light text-black/90">{now.getDate()}</span>
        <span className="mt-1 text-[12px] text-black/55">{new Intl.DateTimeFormat(DISPLAY_LOCALE, { month: "long" }).format(now)}</span>
      </div>
    );
  }

  const shown = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const weekStart = firstWeekday();
  const cells = monthCells(shown.getFullYear(), shown.getMonth(), weekStart);
  const monthName = new Intl.DateTimeFormat(DISPLAY_LOCALE, { month: "long", year: "numeric" }).format(shown);
  // Seven weekday labels, starting from the locale's first day (2024-01-01 was a Monday).
  const labels = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(DISPLAY_LOCALE, { weekday: "narrow" }).format(new Date(2024, 0, 1 + ((weekStart - 1 + i) % 7))),
  );
  const isCurrentMonth = offset === 0;
  const large = size === "large";
  const nav = "grid size-6 place-items-center rounded-md text-black/60 outline-none hover:bg-black/[0.07] focus-visible:ring-2 focus-visible:ring-(--accent)";

  const gridCells = (
    <div role="grid" aria-label={monthName} className={`grid grid-cols-7 content-start ${large ? "flex-1 gap-y-0.5" : "w-[210px] shrink-0"} text-center`}>
      {labels.map((l, i) => (
        <span key={i} role="columnheader" className={`text-black/40 ${large ? "text-[12px]" : "text-[9px] leading-4"}`}>
          {l}
        </span>
      ))}
      {cells.map((day, i) => {
        const today = isCurrentMonth && day === now.getDate();
        return (
          <span key={i} role="gridcell" aria-current={today ? "date" : undefined} className="grid place-items-center">
            {day !== null && (
              <span className={`grid place-items-center rounded-full tabular-nums ${large ? "size-9 text-[14px]" : "size-[19px] text-[10px]"} ${today ? "bg-(--accent) font-semibold text-(--accent-fg)" : "text-black/80"}`}>{day}</span>
            )}
          </span>
        );
      })}
    </div>
  );
  const controls = (
    <div className="flex items-center gap-0.5">
      <button type="button" aria-label="Previous month" tabIndex={preview ? -1 : 0} onClick={() => setOffset((o) => o - 1)} className={nav}>
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      {!isCurrentMonth && (
        <button type="button" aria-label="Back to this month" tabIndex={preview ? -1 : 0} onClick={() => setOffset(0)} className="h-6 rounded-md px-1.5 text-[11px] text-(--accent) outline-none hover:bg-black/[0.07] focus-visible:ring-2 focus-visible:ring-(--accent)">
          Today
        </button>
      )}
      <button type="button" aria-label="Next month" tabIndex={preview ? -1 : 0} onClick={() => setOffset((o) => o + 1)} className={nav}>
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </div>
  );

  // Medium is wide but short, so the month name and arrows sit beside the grid instead of above it.
  if (!large) {
    return (
      <div className="flex size-full items-center gap-3 px-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-[15px] leading-tight font-semibold text-black/85">{monthName}</h3>
          {controls}
        </div>
        {gridCells}
      </div>
    );
  }
  return (
    <div className="flex size-full flex-col p-5">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-[17px] font-semibold text-black/85">{monthName}</h3>
        {controls}
      </div>
      {gridCells}
    </div>
  );
}
