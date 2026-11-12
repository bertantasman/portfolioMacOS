"use client";

import { useCallback, useMemo, useState } from "react";
import { portfolioFileSystem } from "@/data/portfolio-file-system";
import type { VirtualFileSystem } from "@/lib/virtual-fs/filesystem";
import { isFolder } from "@/lib/virtual-fs/filesystem";
import { sortFiles } from "@/lib/virtual-fs/sort";
import { useRepositoryStore } from "@/store/repository-store";
import type { SortDirection, SortKey, VirtualFile } from "@/lib/virtual-fs/types";
import { useFinderNavigation } from "../hooks/use-finder-navigation";
import type { FinderViewMode, OpenDocumentHandler, OpenMediaHandler, OpenNoteHandler, OpenProjectHandler } from "../types/finder";
import { FinderBreadcrumb } from "./finder-breadcrumb";
import { FinderIconView } from "./finder-icon-view";
import { FinderListView } from "./finder-list-view";
import { FinderSidebar } from "./finder-sidebar";
import { FinderToolbar } from "./finder-toolbar";

interface FinderAppProps {
  fileSystem?: VirtualFileSystem;
  /** Invoked when a project item is opened. Unset until a project viewer exists. */
  onOpenProject?: OpenProjectHandler;
  /** Invoked when an image from the media library is opened. */
  onOpenMedia?: OpenMediaHandler;
  /** Invoked when a document (e.g. a PDF) is opened. */
  onOpenDocument?: OpenDocumentHandler;
  onOpenNote?: OpenNoteHandler;
  /** Asks Finder to go to a folder (and select an item); a new `requestId` is a new request. */
  request?: { folderId: string; selectId?: string; requestId: number };
}

/** One Finder window. All state is local, so windows navigate independently. */
export function FinderApp({ fileSystem = portfolioFileSystem, onOpenProject, onOpenMedia, onOpenDocument, onOpenNote, request }: FinderAppProps) {
  const initialFolderId = fileSystem.getFile("documents") ? "documents" : fileSystem.rootId;
  const { currentFolderId, canGoBack, canGoForward, goTo, goBack, goForward } =
    useFinderNavigation(initialFolderId);
  // GitHub repositories arriving or refreshing rebuild the Projects folders; redraw without losing the current folder.
  const repositories = useRepositoryStore((s) => s.repositories);
  // Narrow windows (a phone, or a small floating window) show the sidebar as a drawer on demand.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<FinderViewMode>("icon");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  // Selection is remembered with its folder, so it clears itself on navigation.
  const [selection, setSelection] = useState<{ folderId: string; itemId: string } | null>(null);

  // Deep links (Spotlight, other apps): react to every new request, not only on mount.
  const [handledRequest, setHandledRequest] = useState<number | undefined>();
  if (request && request.requestId !== handledRequest) {
    setHandledRequest(request.requestId);
    const target = fileSystem.getFile(request.folderId);
    if (target?.type === "folder") {
      goTo(target.id);
      const selected = request.selectId ? fileSystem.getFile(request.selectId) : undefined;
      if (selected?.parentId === target.id) setSelection({ folderId: target.id, itemId: selected.id });
    }
  }

  const folder = fileSystem.getFile(currentFolderId) ?? fileSystem.getFile(fileSystem.rootId)!;
  const items = useMemo(
    () => {
      void repositories;
      return sortFiles(fileSystem.getChildren(folder.id), { key: sortKey, direction: sortDirection });
    },
    [fileSystem, folder.id, sortKey, sortDirection, repositories],
  );
  const selectedId = selection?.folderId === folder.id ? selection.itemId : null;
  const selectedCount = selectedId && items.some((i) => i.id === selectedId) ? 1 : 0;

  const select = useCallback(
    (itemId: string) => setSelection({ folderId: folder.id, itemId }),
    [folder.id],
  );
  const open = useCallback(
    (file: VirtualFile) => {
      if (isFolder(file)) goTo(file.id);
      else if (file.type === "project" && file.projectId) onOpenProject?.(file.projectId, file);
      else if (file.type === "image" && file.mediaId) onOpenMedia?.(file.mediaId, file);
      else if (file.type === "document" && file.documentId) onOpenDocument?.(file.documentId, file);
      else if (file.type === "document" && file.noteId) onOpenNote?.(file.noteId, file);
      // Other files stay selectable until viewers exist.
    },
    [goTo, onOpenProject, onOpenMedia, onOpenDocument, onOpenNote],
  );
  const changeSort = useCallback(
    (key: SortKey) => {
      // Clicking the active column flips direction; a new column starts ascending.
      setSortDirection((d) => (key === sortKey && d === "asc" ? "desc" : "asc"));
      setSortKey(key);
    },
    [sortKey],
  );
  const changeSortKey = useCallback((key: SortKey) => {
    setSortKey(key);
    setSortDirection("asc");
  }, []);

  const viewProps = { label: folder.name, items, selectedId, onSelect: select, onOpen: open };

  return (
    <div className="@container relative flex size-full text-black">
      <FinderSidebar
        fs={fileSystem}
        currentFolderId={folder.id}
        open={sidebarOpen}
        onOpenFolder={(id) => {
          goTo(id);
          setSidebarOpen(false);
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col bg-surface/90">
        <FinderToolbar
          title={folder.name}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          viewMode={viewMode}
          sortKey={sortKey}
          onSortKeyChange={changeSortKey}
          onBack={goBack}
          onForward={goForward}
          onViewModeChange={setViewMode}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <div
          className="@container min-h-0 flex-1 overflow-auto"
          onClick={(e) => {
            setSidebarOpen(false);
            if (!(e.target as HTMLElement).closest("button, select")) setSelection(null);
          }}
        >
          {items.length === 0 ? (
            <p role="status" className="grid h-full min-h-24 place-items-center text-[13px] text-black/35">
              This folder is empty
            </p>
          ) : viewMode === "icon" ? (
            <FinderIconView {...viewProps} />
          ) : (
            <FinderListView
              {...viewProps}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={changeSort}
            />
          )}
        </div>
        <FinderBreadcrumb
          fs={fileSystem}
          folderId={folder.id}
          itemCount={items.length}
          selectedCount={selectedCount}
          onOpenFolder={goTo}
        />
      </div>
    </div>
  );
}
