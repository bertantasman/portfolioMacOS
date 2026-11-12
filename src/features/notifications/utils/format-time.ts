import { DISPLAY_LOCALE } from "@/config/locale";
const relative = new Intl.RelativeTimeFormat(DISPLAY_LOCALE, { numeric: "always", style: "short" });
const dateTime = new Intl.DateTimeFormat(DISPLAY_LOCALE, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** "Now", "2 min. ago", "1 hr. ago", then a date. Always from the real creation time. */
export function formatRelativeTime(createdAt: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - createdAt) / 1000));
  if (seconds < 60) return "Now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return relative.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return relative.format(-hours, "hour");
  return dateTime.format(new Date(createdAt));
}
