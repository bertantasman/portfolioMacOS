"use client";

import { DISPLAY_LOCALE } from "@/config/locale";
import { useSyncExternalStore } from "react";

const MINUTE = 60_000;
const SEPARATOR = "\u0000";

let timeFormat: Intl.DateTimeFormat | undefined;
let dateFormat: Intl.DateTimeFormat | undefined;

/** "10:42" in the visitor's locale and time zone: hour and minute only, without AM/PM. */
function formatTime(now: Date) {
  timeFormat ??= new Intl.DateTimeFormat(DISPLAY_LOCALE, { hour: "numeric", minute: "2-digit" });
  const parts = timeFormat.formatToParts(now).filter((p) => p.type !== "dayPeriod");
  return parts.map((p) => p.value).join("").trim().replace(/[\s ]+$/, "");
}

function getSnapshot() {
  dateFormat ??= new Intl.DateTimeFormat(DISPLAY_LOCALE, { weekday: "long", month: "long", day: "numeric" });
  const now = new Date();
  return `${formatTime(now)}${SEPARATOR}${dateFormat.format(now)}`;
}

const getServerSnapshot = () => "";

/** One timer, aimed at the next minute boundary; cleaned up when the lock screen goes away. */
function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    timer = setTimeout(() => {
      onChange();
      schedule();
    }, MINUTE - (Date.now() % MINUTE) + 50);
  };
  schedule();
  return () => clearTimeout(timer);
}

/** The current time and date for the lock screen. Empty strings until the client has rendered. */
export function useLockClock(): { time: string; date: string } {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [time = "", date = ""] = snapshot.split(SEPARATOR);
  return { time, date };
}
