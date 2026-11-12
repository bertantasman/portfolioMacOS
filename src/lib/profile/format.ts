const DATE = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

export interface ParsedDate {
  year: number;
  month?: number;
  /** Sortable value: missing months and days sort as the start of the period. */
  sort: number;
}

/** Parses "2023", "2023-09" or "2023-09-15". Anything else, or an impossible date, is undefined. */
export function parseProfileDate(value: string | undefined): ParsedDate | undefined {
  const match = value ? DATE.exec(value.trim()) : null;
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : undefined;
  const day = match[3] ? Number(match[3]) : undefined;
  if (month !== undefined && (month < 1 || month > 12)) return undefined;
  if (day !== undefined && (day < 1 || day > new Date(Date.UTC(year, month!, 0)).getUTCDate())) return undefined;
  return { year, month, sort: year * 10000 + (month ?? 1) * 100 + (day ?? 1) };
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "September 2023" for a month, "2023" for a year; never invents a missing month. */
export function formatProfileDate(value: string | undefined): string | undefined {
  const parsed = parseProfileDate(value);
  if (!parsed) return undefined;
  return parsed.month ? `${MONTHS[parsed.month - 1]} ${parsed.year}` : String(parsed.year);
}

/**
 * "September 2021 – June 2025", "2022 – Present" (only when `current`), "From 2022" or "Until 2024".
 * Undefined when no date is known.
 */
export function formatDateRange(start: string | undefined, end: string | undefined, current?: boolean): string | undefined {
  const from = formatProfileDate(start);
  const to = formatProfileDate(end);
  if (from && to) return `${from} – ${to}`;
  if (from) return current ? `${from} – Present` : `From ${from}`;
  if (to) return `Until ${to}`;
  return current ? "Present" : undefined;
}

/** Newest first. Current entries lead; entries without a usable date keep their configured order, last. */
export function sortNewestFirst<T extends { startDate?: string; endDate?: string; graduationDate?: string; current?: boolean }>(
  entries: readonly T[],
): T[] {
  const key = (e: T) => {
    if (e.current) return Number.MAX_SAFE_INTEGER;
    return parseProfileDate(e.endDate ?? e.graduationDate)?.sort ?? parseProfileDate(e.startDate)?.sort ?? -1;
  };
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => key(b.entry) - key(a.entry) || a.index - b.index)
    .map((x) => x.entry);
}
