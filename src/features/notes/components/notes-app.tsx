"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWindowChrome } from "@/components/windows/window-chrome";
import { ALL_NOTES_ID, notes } from "@/data/notes";
import { useWindowStore } from "@/store/window-store";
import { useElementWidth } from "../hooks/use-element-width";
import { getFolderDocuments, getFolderName, searchDocuments, useNoteSources } from "../lib/content";
import { NoteView } from "./note-view";
import { NotesList } from "./notes-list";
import { NotesSidebar } from "./notes-sidebar";
import { NotesToolbar } from "./notes-toolbar";

const COMPACT_WIDTH = 760;

function openProject(projectId: string) {
  useWindowStore.getState().openProject(projectId);
}

interface NotesAppProps {
  /** Asks Notes to show a note; a new `requestId` is a new request. */
  request?: { noteId: string; requestId: number };
}

/** One Notes window. All state is local and survives minimizing. */
export function NotesApp({ request }: NotesAppProps) {
  const { isFocused } = useWindowChrome();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(rootRef);
  const compact = width < COMPACT_WIDTH;
  // Phone-sized: the note list and the note take turns filling the window.
  const narrow = width > 0 && width < 520;

  const [folderId, setFolderId] = useState(ALL_NOTES_ID);
  const [choice, setChoice] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  // null = automatic: folders show on wide windows, hide on narrow ones.
  const [sidebarPref, setSidebarPref] = useState<boolean | null>(null);
  const [listPref, setListPref] = useState(true);

  // Deep links (Spotlight, other apps): react to every new request, not only on mount.
  const [handledRequest, setHandledRequest] = useState<number | undefined>();
  if (request && request.requestId !== handledRequest) {
    setHandledRequest(request.requestId);
    const target = notes.find((n) => n.id === request.noteId);
    if (target) {
      setFolderId(target.folderId);
      setChoice(target.id);
      setQuery("");
      if (narrow) setListPref(false);
    }
  }

  const searching = query.trim().length > 0;
  const sources = useNoteSources();
  const docs = useMemo(
    () => (searching ? searchDocuments(query) : getFolderDocuments(folderId)),
    // `sources` changes when project data does, so derived notes are rebuilt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searching, query, folderId, sources],
  );
  // The explicit choice is used while it is still visible; otherwise the first note.
  const selected = docs.find((d) => d.note.id === choice) ?? docs[0];
  const sidebarVisible = sidebarPref ?? !compact;

  const select = (noteId: string) => {
    setChoice(noteId);
    if (narrow) setListPref(false);
  };
  const move = (offset: number) => {
    if (docs.length === 0) return;
    const index = selected ? docs.findIndex((d) => d.note.id === selected.note.id) : -1;
    const next = docs[Math.min(Math.max(index + offset, 0), docs.length - 1)];
    setChoice(next.note.id);
    document.querySelector<HTMLElement>(`[data-note-id="${next.note.id}"]`)?.scrollIntoView({ block: "nearest" });
  };

  // Shortcuts apply only while this window is the active one.
  useEffect(() => {
    if (!isFocused) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Inside the note itself the arrow keys scroll it, as usual.
      const inNote = contentRef.current?.contains(document.activeElement);
      if (inNote && (e.key === "ArrowDown" || e.key === "ArrowUp")) return;
      if (e.key === "ArrowDown") move(1);
      else if (e.key === "ArrowUp") move(-1);
      else if (e.key === "Enter" && selected) contentRef.current?.focus();
      else if (e.key === "Escape") {
        if (query) setQuery("");
        else if (document.activeElement === searchRef.current) searchRef.current?.blur();
        else return;
      } else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  const selectFolder = (id: string) => {
    setFolderId(id);
    setChoice(undefined);
    setQuery("");
    if (compact) setSidebarPref(false);
  };

  return (
    <div ref={rootRef} className="@container relative flex size-full bg-surface text-black">
      {sidebarVisible && (
        <NotesSidebar activeFolderId={folderId} overlay={compact} onSelect={selectFolder} />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <NotesToolbar
          title={selected?.note.title ?? getFolderName(folderId)}
          subtitle={searching ? "Search Results" : getFolderName(folderId)}
          sidebarVisible={sidebarVisible}
          listVisible={listPref}
          clearTrafficLights={!sidebarVisible || compact}
          query={query}
          searchRef={searchRef}
          onToggleSidebar={() => setSidebarPref(!sidebarVisible)}
          onToggleList={() => setListPref((v) => !v)}
          onQueryChange={setQuery}
        />
        <div className="flex min-h-0 flex-1">
          {listPref && (
            <div className={`overflow-y-auto border-black/10 bg-surface-2 ${narrow ? "min-w-0 flex-1" : "w-[260px] shrink-0 border-r @max-[860px]:w-[220px]"}`}>
              <NotesList
                label={searching ? "Search results" : getFolderName(folderId)}
                docs={docs}
                selectedId={selected?.note.id}
                searching={searching}
                onSelect={select}
              />
            </div>
          )}
          <main className={`min-w-0 flex-1 ${narrow && listPref ? "hidden" : ""}`}>
            <NoteView doc={selected} contentRef={contentRef} onOpenProject={openProject} />
          </main>
        </div>
      </div>
    </div>
  );
}
