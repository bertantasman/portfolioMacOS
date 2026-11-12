import { getFileKind } from "./kind";
import type { SortDirection, SortKey, VirtualFile } from "./types";

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

const byName = (a: VirtualFile, b: VirtualFile) => collator.compare(a.name, b.name);

function compareBy(key: SortKey, a: VirtualFile, b: VirtualFile): number {
  switch (key) {
    case "name":
      return byName(a, b);
    case "kind":
      return collator.compare(getFileKind(a), getFileKind(b));
    case "modified": {
      const at = a.modifiedAt ? Date.parse(a.modifiedAt) : NaN;
      const bt = b.modifiedAt ? Date.parse(b.modifiedAt) : NaN;
      return at - bt; // NaN is handled by the caller
    }
  }
}

export interface SortOptions {
  key?: SortKey;
  direction?: SortDirection;
  /** Folders first regardless of key and direction (Finder's default). */
  foldersFirst?: boolean;
}

/**
 * Returns a new, deterministically ordered array. Ties fall back to name, then
 * id. Files without a date sort last in either direction.
 */
export function sortFiles(
  files: readonly VirtualFile[],
  { key = "name", direction = "asc", foldersFirst = true }: SortOptions = {},
): VirtualFile[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...files].sort((a, b) => {
    if (foldersFirst && (a.type === "folder") !== (b.type === "folder")) {
      return a.type === "folder" ? -1 : 1;
    }
    let result = compareBy(key, a, b);
    if (Number.isNaN(result)) {
      const aMissing = !a.modifiedAt || Number.isNaN(Date.parse(a.modifiedAt));
      const bMissing = !b.modifiedAt || Number.isNaN(Date.parse(b.modifiedAt));
      if (aMissing !== bMissing) return aMissing ? 1 : -1;
      result = 0;
    } else {
      result *= sign;
    }
    return result || byName(a, b) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  });
}
