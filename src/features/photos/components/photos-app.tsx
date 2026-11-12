"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWindowChrome } from "@/components/windows/window-chrome";
import { getMediaById } from "@/data/media";
import { useElementWidth } from "@/features/notes/hooks/use-element-width";
import { ALL_PHOTOS_ID, getAlbumMedia, getAlbums } from "../lib/albums";
import { PhotoDetail } from "./photo-detail";
import { PhotoGrid } from "./photo-grid";
import { PhotosEmptyState } from "./photos-empty-state";
import { PhotosSidebar } from "./photos-sidebar";
import { THUMBNAIL_SIZES, PhotosToolbar } from "./photos-toolbar";

interface PhotosAppProps {
  /** Asks Photos to show an image; a new `requestId` is a new request, even for the same image. */
  request?: { mediaId: string; requestId: number };
}

/** One Photos window. View state is local, so windows don't share an album or selection. */
export function PhotosApp({ request }: PhotosAppProps) {
  const { isFocused } = useWindowChrome();
  const albums = useMemo(() => getAlbums(), []);
  const [albumId, setAlbumId] = useState(ALL_PHOTOS_ID);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [sizeIndex, setSizeIndex] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);
  const narrow = useElementWidth(rootRef) < 520;
  // Narrow windows keep the album list in a drawer that starts closed; wide ones show it.
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [wasNarrow, setWasNarrow] = useState(false);
  if (narrow !== wasNarrow) {
    setWasNarrow(narrow);
    setSidebarOpen(!narrow);
  }
  const [infoOpen, setInfoOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [handledRequest, setHandledRequest] = useState<number | undefined>();

  // React to launch requests (from Finder, Project Viewer, Terminal) whenever one arrives,
  // not only when the window first mounts.
  if (request && request.requestId !== handledRequest) {
    setHandledRequest(request.requestId);
    const target = getMediaById(request.mediaId);
    if (!target) {
      setNotice("That photo isn't in the library.");
      setDetailId(null);
    } else {
      setNotice(null);
      if (!getAlbumMedia(albumId).some((m) => m.id === target.id)) setAlbumId(ALL_PHOTOS_ID);
      setDetailId(target.id);
    }
  }

  const album = albums.find((a) => a.id === albumId) ?? albums[0];
  const items = useMemo(() => getAlbumMedia(album.id), [album.id]);
  const index = detailId ? items.findIndex((m) => m.id === detailId) : -1;
  const current = index >= 0 ? items[index] : undefined;

  const goTo = (offset: number) => {
    const next = items[index + offset];
    if (next) setDetailId(next.id);
  };
  const back = () => setDetailId(null);

  // Arrow keys and Escape work only while this window is the active one.
  useEffect(() => {
    if (!isFocused || !current) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest("input, textarea, select")) return;
      if (e.key === "ArrowLeft") goTo(-1);
      else if (e.key === "ArrowRight") goTo(1);
      else if (e.key === "Escape") back();
      else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  const selectAlbum = (id: string) => {
    setAlbumId(id);
    if (narrow) setSidebarOpen(false);
    setDetailId(null);
    setNotice(null);
  };

  return (
    <div ref={rootRef} className="@container relative flex size-full text-black">
      {sidebarOpen && <PhotosSidebar albums={albums} activeId={album.id} overlay={narrow} onSelect={selectAlbum} />}
      <div className="flex min-w-0 flex-1 flex-col bg-surface/90">
        <PhotosToolbar
          title={current ? current.title : album.title}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          sizeIndex={sizeIndex}
          onSizeChange={setSizeIndex}
          detail={
            current
              ? {
                  canGoPrevious: index > 0,
                  canGoNext: index < items.length - 1,
                  infoOpen,
                  onBack: back,
                  onPrevious: () => goTo(-1),
                  onNext: () => goTo(1),
                  onToggleInfo: () => setInfoOpen((open) => !open),
                }
              : undefined
          }
        />
        {current ? (
          <PhotoDetail media={current} infoOpen={infoOpen} />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            {notice && (
              <p role="alert" className="border-b border-black/10 bg-notice px-3 py-1.5 text-[12px] text-black/60">
                {notice}
              </p>
            )}
            {items.length === 0 ? (
              <PhotosEmptyState message={album.emptyMessage} />
            ) : (
              <PhotoGrid
                label={album.title}
                items={items}
                thumbnailPx={THUMBNAIL_SIZES[sizeIndex].px}
                onOpen={setDetailId}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
