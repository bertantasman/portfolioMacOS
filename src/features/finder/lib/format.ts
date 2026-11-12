import { DISPLAY_LOCALE } from "@/config/locale";
const dateFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatModified(iso?: string): string {
  return iso ? dateFormatter.format(new Date(iso)) : "--";
}

export function formatSize(bytes?: number): string {
  if (bytes === undefined) return "--";
  if (bytes < 1024) return `${bytes} bytes`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${Math.round(value * 10) / 10} ${units[unit]}`;
}
