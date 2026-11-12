"use client";

import { useMemo } from "react";
import { NoteBlocks } from "@/features/notes/components/note-blocks";
import { getFolderName, getNoteDocuments, sortDocuments, useNoteSources } from "@/features/notes/lib/content";
import { AppScreen } from "../components/app-screen";
import { useMobileStore } from "../store/mobile-store";
import { useStack } from "./use-stack";

/** The portfolio's notes (About Me, Skills, Education, Experience, Projects, Contact) as a reading list and a reading view. */
export default function NotesApp() {
  const stack = useStack("notes");
  const pushScreen = useMobileStore((s) => s.pushScreen);
  const openApp = useMobileStore((s) => s.openApp);
  const sources = useNoteSources();
  const docs = useMemo(() => {
    void sources;
    return sortDocuments(getNoteDocuments());
  }, [sources]);
  const id = stack[stack.length - 1];
  const doc = id ? docs.find((d) => d.note.id === id) : undefined;

  if (id) {
    return (
      <AppScreen title={doc?.note.title ?? "Note"} backLabel="Notes">
        {doc ? (
          <article className="pb-6">
            <h2 className="mb-4 text-[24px] leading-8 font-bold text-black/90">{doc.note.title}</h2>
            <NoteBlocks blocks={doc.blocks} onOpenProject={(projectId) => openApp("projects", [projectId])} />
          </article>
        ) : (
          <p role="status" className="py-10 text-center text-[14px] text-black/60">This note isn’t available.</p>
        )}
      </AppScreen>
    );
  }
  const folders = [...new Set(docs.map((d) => d.note.folderId))];
  return (
    <AppScreen title="Notes">
      {docs.length === 0 && <p role="status" className="py-10 text-center text-[14px] text-black/60">No notes yet.</p>}
      {folders.map((f) => (
        <section key={f} aria-label={getFolderName(f)} className="mb-5">
          <h2 className="mb-2 text-[13px] font-semibold tracking-wide text-black/50 uppercase">{getFolderName(f)}</h2>
          <ul className="divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-surface-2">
            {docs.filter((d) => d.note.folderId === f).map((d) => (
              <li key={d.note.id}>
                <button type="button" onClick={() => pushScreen(d.note.id)} className="block min-h-[56px] w-full px-4 py-2.5 text-left outline-none focus-visible:bg-black/[0.05] active:bg-black/[0.05]">
                  <span className="block truncate text-[16px] font-medium text-black/90">{d.note.title}</span>
                  <span className="line-clamp-1 block text-[13px] text-black/55">{d.preview}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </AppScreen>
  );
}
