"use client";

import { DISPLAY_LOCALE } from "@/config/locale";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

let formatter: Intl.DateTimeFormat | undefined;

function getSnapshot() {
  formatter ??= new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  // macOS separates the parts with spaces only: "Sun Oct 25 7:54 PM".
  return formatter.format(new Date()).replaceAll(",", "");
}

// The server has no timezone for the visitor, so it renders nothing and the
// client fills the time in after hydration.
const getServerSnapshot = () => "";

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

export function MenuClock() {
  const text = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <span className="inline-block min-w-[9.5rem] px-2 text-right whitespace-nowrap tabular-nums">
      {text}
    </span>
  );
}
