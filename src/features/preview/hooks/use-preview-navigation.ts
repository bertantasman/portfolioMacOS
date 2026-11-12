"use client";

import { useState } from "react";
import type { PageSize, ZoomMode } from "../types/preview";
import { MAX_ZOOM, MIN_ZOOM, computeScale, nextZoomPercent } from "../utils/pdf-utils";

/** Per-window page and zoom state. Each Preview window has its own. */
export function usePreviewNavigation(pages: readonly PageSize[], viewer: { width: number; height: number }) {
  const numPages = pages.length;
  const [page, setPageState] = useState(1);
  const [zoom, setZoom] = useState<ZoomMode>({ kind: "fit-width" });
  const [scrollRequest, setScrollRequest] = useState({ page: 1, id: 0 });

  // Fit modes depend on the viewer size and the current page; custom zoom is a fixed percentage.
  const scale = computeScale(zoom, viewer, pages[Math.min(page, numPages) - 1]);
  const percent = Math.round(scale * 100);
  const stepZoom = (z: ZoomMode, direction: 1 | -1): ZoomMode => ({
    kind: "custom",
    percent: nextZoomPercent(Math.round(computeScale(z, viewer, pages[Math.min(page, numPages) - 1]) * 100), direction),
  });
  const lastPage = Math.max(numPages, 1);

  return {
    page,
    zoom,
    scale,
    percent,
    scrollRequest,
    canZoomIn: percent < MAX_ZOOM,
    canZoomOut: percent > MIN_ZOOM,
    hasPrevious: page > 1,
    hasNext: page < lastPage,
    /** Page changed by scrolling; does not scroll again. */
    setVisiblePage: (n: number) => setPageState(Math.min(Math.max(n, 1), lastPage)),
    /** Jump to a page: updates the indicator and asks the viewer to scroll. */
    goToPage: (n: number) => {
      const target = Math.min(Math.max(n, 1), lastPage);
      setPageState(target);
      setScrollRequest((r) => ({ page: target, id: r.id + 1 }));
    },
    // Functional updates, so rapid repeated clicks keep stepping from the latest zoom.
    zoomIn: () => setZoom((z) => stepZoom(z, 1)),
    zoomOut: () => setZoom((z) => stepZoom(z, -1)),
    fitPage: () => setZoom({ kind: "fit-page" }),
    fitWidth: () => setZoom({ kind: "fit-width" }),
  };
}
