"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

const getSnapshot = () => Math.floor(Date.now() / MINUTE);
// The server doesn't know the visitor's time zone, so widgets render no time until the client has.
const getServerSnapshot = () => 0;

/** One timer aimed at the next minute boundary; removed when the widget goes away. */
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

/** The current date, refreshed once a minute. Null until the client has rendered. */
export function useMinuteNow(): Date | null {
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return minute === 0 ? null : new Date(minute * MINUTE);
}
