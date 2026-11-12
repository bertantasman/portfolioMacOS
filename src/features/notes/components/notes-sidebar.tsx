import { Folder, Notebook } from "lucide-react";
import { WindowDragArea } from "@/components/windows/window-chrome";
import { ALL_NOTES_ID, noteFolders } from "@/data/notes";
import { getFolderDocuments } from "../lib/content";

interface NotesSidebarProps {
  activeFolderId: string;
  /** Overlay mode for narrow windows. */
  overlay: boolean;
  onSelect: (folderId: string) => void;
}

export function NotesSidebar({ activeFolderId, overlay, onSelect }: NotesSidebarProps) {
  return (
    <aside
      aria-label="Notes folders"
      className={`flex w-[200px] shrink-0 flex-col border-r border-black/10 bg-sidebar @max-[860px]:w-[170px] ${
        overlay ? "absolute inset-y-0 left-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.15)]" : ""
      }`}
    >
      {/* Room for the traffic lights floating over this corner. */}
      <WindowDragArea className="h-[52px] shrink-0" />
      <nav aria-label="Folders" className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <ul>
          {noteFolders.map((folder) => {
            const active = folder.id === activeFolderId;
            const count = getFolderDocuments(folder.id).length;
            const Icon = folder.id === ALL_NOTES_ID ? Notebook : Folder;
            return (
              <li key={folder.id}>
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => onSelect(folder.id)}
                  className={`flex h-[28px] w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-black/85 outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${
                    active ? "bg-notes-selected" : "hover:bg-black/5"
                  }`}
                >
                  <Icon className="size-4 shrink-0 text-[#d9a400]" strokeWidth={1.75} aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                  <span aria-label={`${count} notes`} className="text-[12px] text-black/40">
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
