import { DISPLAY_LOCALE } from "@/config/locale";
const formatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, { year: "numeric", month: "long", day: "numeric" });

/** Formats an ISO date, or returns undefined when it is missing or invalid. */
export function formatDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const time = Date.parse(iso);
  return Number.isNaN(time) ? undefined : formatter.format(new Date(time));
}
