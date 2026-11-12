import { FileText } from "lucide-react";
import type { NoteDocument } from "../lib/content";
import { NoteBlocks } from "./note-blocks";

interface NoteViewProps {
  doc: NoteDocument | undefined;
  contentRef: React.RefObject<HTMLDivElement | null>;
  onOpenProject: (projectId: string) => void;
}

export function NoteView({ doc, contentRef, onOpenProject }: NoteViewProps) {
  if (!doc) {
    return (
      <div role="status" className="flex size-full flex-col items-center justify-center gap-1 text-center">
        <FileText className="mb-1 size-10 text-black/20" strokeWidth={1.25} aria-hidden />
        <p className="text-[13px] text-black/40">No Note Selected</p>
      </div>
    );
  }
  return (
    <article
      ref={contentRef}
      tabIndex={-1}
      aria-labelledby="note-title"
      className="size-full overflow-y-auto px-8 py-6 outline-none @max-[560px]:px-5"
    >
      <div className="mx-auto max-w-[640px]">
        <h1 id="note-title" className="mb-4 text-[22px] leading-7 font-bold text-black/90">
          {doc.note.title}
        </h1>
        <NoteBlocks blocks={doc.blocks} onOpenProject={onOpenProject} />
      </div>
    </article>
  );
}
