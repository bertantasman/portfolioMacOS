import { useDesktopStore, type DesktopSortKey } from "@/store/desktop-store";
import { arrange, getDesktopItems, idsInVisualOrder, resolveLayout } from "./layout";

/** Re-packs the icons into a tidy grid, keeping their current order. Files are untouched. */
export function cleanUpDesktop() {
  const { sortBy, positions, metrics, setPositions } = useDesktopStore.getState();
  const ids = getDesktopItems(sortBy).map((i) => i.id);
  const layout = resolveLayout(ids, positions, metrics.cols, metrics.rows);
  setPositions(arrange(idsInVisualOrder(layout), metrics.rows));
}

/** Sorts the icons by `key` (the volume stays first) and lays them out from the top right. */
export function sortDesktop(key: DesktopSortKey) {
  const { metrics, setPositions, setSortBy } = useDesktopStore.getState();
  setSortBy(key);
  setPositions(arrange(getDesktopItems(key).map((i) => i.id), metrics.rows));
}
