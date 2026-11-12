import type { SpotlightCategoryId, SpotlightGroup, SpotlightItem } from "../types/spotlight";

export const CATEGORY_ORDER: readonly { id: SpotlightCategoryId; label: string }[] = [
  { id: "applications", label: "Applications" },
  { id: "projects", label: "Projects" },
  { id: "files", label: "Files & Folders" },
  { id: "notes", label: "Notes" },
  { id: "profile", label: "Profile" },
];

export const MAX_RESULTS = 15;

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

/** Lower-case, accent-free, single-spaced. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** True when `a` and `b` differ by at most one insertion, deletion or substitution. */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else {
      if (++edits > 1) return false;
      if (a.length > b.length) i++;
      else if (a.length < b.length) j++;
      else {
        i++;
        j++;
      }
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** Match tiers, best first. */
const EXACT = 0;
const STARTS = 1;
const WORD_STARTS = 2;
const IN_TITLE = 3;
const KEYWORD = 4;
const CONTENT = 5;
const TYPO = 6;

interface Prepared {
  title: string;
  words: string[];
  keywords: string[];
  text: string; // subtitle + content
}

const prepared = new WeakMap<SpotlightItem, Prepared>();
function prepare(item: SpotlightItem): Prepared {
  let p = prepared.get(item);
  if (!p) {
    const title = normalize(item.title);
    p = {
      title,
      words: title.split(" "),
      keywords: item.keywords.map(normalize),
      text: normalize(`${item.subtitle ?? ""} ${item.content ?? ""}`),
    };
    prepared.set(item, p);
  }
  return p;
}

function tierForToken(p: Prepared, token: string, allowTypo: boolean): number | null {
  if (p.title === token) return EXACT;
  if (p.title.startsWith(token)) return STARTS;
  if (p.words.some((w) => w.startsWith(token))) return WORD_STARTS;
  if (p.title.includes(token)) return IN_TITLE;
  if (p.keywords.some((k) => k.includes(token))) return KEYWORD;
  if (p.text.includes(token)) return CONTENT;
  if (allowTypo && token.length >= 4 && p.words.some((w) => withinOneEdit(w, token))) return TYPO;
  return null;
}

/** Best tier for the whole query, or null when it doesn't match. */
export function scoreItem(item: SpotlightItem, query: string): number | null {
  const p = prepare(item);
  const whole = tierForToken(p, query, false);
  if (whole !== null) return whole;
  // Multi-word queries: every word must match somewhere; the weakest word sets the tier.
  const tokens = query.split(" ");
  let worst = 0;
  for (const token of tokens) {
    const tier = tierForToken(p, token, tokens.length === 1);
    if (tier === null) return null;
    worst = Math.max(worst, tier);
  }
  return worst;
}

/** Ranked, limited results: a Top Hit, then groups by category. Ties break by category order, title, then id: fully deterministic. */
export function searchItems(index: readonly SpotlightItem[], rawQuery: string): SpotlightGroup[] {
  const query = normalize(rawQuery);
  if (!query) return [];
  const order = new Map(CATEGORY_ORDER.map((c, i) => [c.id, i]));

  const ranked = index
    .map((item) => ({ item, tier: scoreItem(item, query) }))
    .filter((r): r is { item: SpotlightItem; tier: number } => r.tier !== null)
    .sort(
      (a, b) =>
        a.tier - b.tier ||
        order.get(a.item.category)! - order.get(b.item.category)! ||
        collator.compare(a.item.title, b.item.title) ||
        (a.item.id < b.item.id ? -1 : 1),
    )
    .slice(0, MAX_RESULTS);

  if (ranked.length === 0) return [];
  // The best match leads as the Top Hit, so Enter always opens the most relevant result.
  const [top, ...rest] = ranked.map((r) => r.item);
  return [{ category: "top", label: "Top Hit", items: [top] }, ...group(rest)];
}

/** Groups items by category, keeping rank order inside each group. */
export function group(items: readonly SpotlightItem[]): SpotlightGroup[] {
  return CATEGORY_ORDER.map(({ id, label }) => ({
    category: id,
    label,
    items: items.filter((i) => i.category === id),
  })).filter((g) => g.items.length > 0);
}
