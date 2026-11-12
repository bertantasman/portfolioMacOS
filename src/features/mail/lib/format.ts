import { DISPLAY_LOCALE } from "@/config/locale";
const dateTime = new Intl.DateTimeFormat(DISPLAY_LOCALE, { dateStyle: "medium", timeStyle: "short" });
const shortDate = new Intl.DateTimeFormat(DISPLAY_LOCALE, { month: "short", day: "numeric" });
const timeOnly = new Intl.DateTimeFormat(DISPLAY_LOCALE, { hour: "numeric", minute: "2-digit" });

export const formatFull = (ms: number) => dateTime.format(new Date(ms));

/** Time for today, otherwise a short date, like Mail's list. */
export function formatListDate(ms: number, now = Date.now()) {
  const d = new Date(ms);
  return new Date(now).toDateString() === d.toDateString() ? timeOnly.format(d) : shortDate.format(d);
}

/** First line of a message body, for list previews. */
export const preview = (body: string) => body.replace(/\s+/g, " ").trim().slice(0, 120);
