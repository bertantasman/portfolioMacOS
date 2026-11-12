"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import { portfolioFileSystem as fs } from "@/data/portfolio-file-system";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import {
  navigateFinderToFolder,
  openApplicationById,
  openDocumentById,
  openMediaById,
  openNoteById,
  openProjectById,
  openSafariAbout,
  revealFileInFinder,
} from "@/lib/navigation";
import { useOverlayStore } from "@/store/overlay-store";
import { useSpotlightSearch } from "../hooks/use-spotlight-search";
import type { SpotlightItem } from "../types/spotlight";
import { SpotlightEmptyState } from "./spotlight-empty-state";
import { LISTBOX_ID, SpotlightResults, optionId } from "./spotlight-results";

/** Performs the item's action through the shared navigation layer. Returns false if the target is gone. */
function perform(item: SpotlightItem): boolean {
  const { target } = item;
  switch (target.kind) {
    case "application":
      return openApplicationById(target.appId);
    case "project":
      return openProjectById(target.projectId);
    case "folder":
      return navigateFinderToFolder(target.folderId);
    case "note":
      return openNoteById(target.noteId);
    case "about":
      return openSafariAbout(target.section);
    case "file": {
      const file = fs.getFile(target.fileId);
      // Open in a viewer when there is one; otherwise show the file in Finder.
      if (file?.type === "document" && file.documentId && openDocumentById(file.documentId)) return true;
      if (file?.type === "image" && file.mediaId && openMediaById(file.mediaId)) return true;
      if (file?.type === "document" && file.noteId && openNoteById(file.noteId)) return true;
      return revealFileInFinder(target.fileId);
    }
  }
}

/** Global search overlay (not a window). Mounted once on the desktop. */
export function Spotlight() {
  const open = useOverlayStore((s) => s.active === "spotlight");
  const reduced = useShouldReduceMotion();
  const duration = reduced ? 0 : 0.14;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="spotlight"
          className="fixed inset-0 z-(--z-overlay)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
        >
          <SpotlightPanel reduced={reduced} duration={duration} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SpotlightPanel({ reduced, duration }: { reduced: boolean; duration: number }) {
  const close = useOverlayStore((s) => s.close);
  const hide = () => close("spotlight");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<Element | null>(null);

  const groups = useSpotlightSearch(query);
  const flat = groups.flatMap((g) => g.items);
  const current = flat[Math.min(selected, flat.length - 1)];

  // Focus the field on open; give focus back to where it was when dismissed.
  useEffect(() => {
    previousFocus.current = document.activeElement;
    inputRef.current?.focus();
  }, []);

  const dismiss = () => {
    hide();
    const el = previousFocus.current;
    if (el instanceof HTMLElement && el.isConnected) requestAnimationFrame(() => el.focus());
  };

  const choose = (item: SpotlightItem | undefined) => {
    if (!item) return;
    // The opened window takes focus, so focus is not restored on success.
    if (perform(item)) hide();
    else setError("That item is no longer available.");
  };

  // Keep the highlighted row visible.
  useEffect(() => {
    if (current) document.getElementById(optionId(current))?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const move = (offset: number) => {
    if (flat.length === 0) return;
    setSelected((i) => (Math.min(i, flat.length - 1) + offset + flat.length) % flat.length);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // The global Cmd/Ctrl+Space toggle is handled on the document, so let it through.
    if ((e.metaKey || e.ctrlKey) && e.code === "Space") return;
    // Everything else stays inside Spotlight so windows underneath never react.
    e.stopPropagation();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(current);
    } else if (e.key === "Escape") {
      e.preventDefault();
      dismiss();
    } else if (e.key === "Tab") {
      e.preventDefault(); // focus stays in the search field
    }
  };

  return (
    <div
      className="fixed inset-0"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight Search"
        onKeyDown={onKeyDown}
        initial={reduced ? false : { opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? undefined : { opacity: 0, y: -4, scale: 0.99 }}
        transition={{ duration, ease: "easeOut" }}
        className="absolute top-[18vh] left-1/2 w-[650px] max-w-[calc(100vw-32px)] -translate-x-1/2 overflow-hidden rounded-[20px] border border-black/10 bg-window text-black shadow-[0_24px_70px_rgba(0,0,0,0.4)] backdrop-blur-3xl backdrop-saturate-150"
      >
        <div className="flex h-16 items-center gap-3 px-5">
          <Search className="size-[22px] shrink-0 text-black/45" strokeWidth={1.75} aria-hidden />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label="Spotlight Search"
            aria-expanded={flat.length > 0}
            aria-controls={LISTBOX_ID}
            aria-activedescendant={current ? optionId(current) : undefined}
            aria-autocomplete="list"
            placeholder="Spotlight Search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
              setError(null);
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-[22px] font-light text-black/90 outline-none placeholder:text-black/35"
          />
        </div>

        {(flat.length > 0 || query.trim() !== "") && (
          <div className="border-t border-black/10">
            {flat.length > 0 ? (
              <SpotlightResults
                groups={groups}
                selectedId={current?.id}
                onHover={(id) => setSelected(Math.max(0, flat.findIndex((i) => i.id === id)))}
                onChoose={choose}
              />
            ) : (
              <SpotlightEmptyState />
            )}
          </div>
        )}
        {error && (
          <p role="alert" className="border-t border-black/10 px-4 py-2 text-[12px] text-[#c0392b]">
            {error}
          </p>
        )}
        <p role="status" className="sr-only">
          {query.trim() ? `${flat.length} ${flat.length === 1 ? "result" : "results"}` : ""}
        </p>
      </motion.div>
    </div>
  );
}
