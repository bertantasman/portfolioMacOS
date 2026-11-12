import { Pin } from "lucide-react";
import type { NoteDocument } from "../lib/content";

interface NotesListProps {
  label: string;
  docs: readonly NoteDocument[];
  selectedId: string | undefined;
  searching: boolean;
  onSelect: (noteId: string) => void;
}

export function NotesList({ label, docs, selectedId, searching, onSelect }: NotesListProps) {
  if (docs.length === 0) {
    return (
      <div role="status" className="grid h-full place-items-center p-4 text-center text-[13px] text-black/40">
        {searching ? "No Results" : "No Notes"}
      </div>
    );
  }

  const hasPinned = !searching && docs.some((d) => d.note.pinned);
  return (
    <ul aria-label={label} role="listbox" className="p-2">
      {docs.map((doc, i) => {
        const selected = doc.note.id === selectedId;
        const startsRegular = hasPinned && !doc.note.pinned && (i === 0 || docs[i - 1].note.pinned);
        return (
          <li key={doc.note.id} role="presentation">
            {hasPinned && i === 0 && doc.note.pinned && <GroupLabel>Pinned</GroupLabel>}
            {startsRegular && <GroupLabel>Notes</GroupLabel>}
            <button
              type="button"
              role="option"
              aria-selected={selected}
              data-note-id={doc.note.id}
              onClick={() => onSelect(doc.note.id)}
              className={`block w-full rounded-lg px-2.5 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${
                selected ? "bg-notes-selected" : "hover:bg-black/[0.04]"
              }`}
            >
              <span className="flex items-center gap-1 text-[13px] font-semibold text-black/90">
                <span className="truncate">{doc.note.title}</span>
                {doc.note.pinned && <Pin className="size-3 shrink-0 rotate-45 text-black/40" aria-label="Pinned" />}
              </span>
              <span className="block truncate text-[12px] text-black/50">
                {doc.hasContent ? doc.preview : <em>No content yet</em>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-2.5 pt-1 pb-1 text-[11px] font-semibold text-black/40">{children}</p>;
}
