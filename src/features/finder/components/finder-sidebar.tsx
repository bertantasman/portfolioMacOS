import {
  CircleArrowDown,
  Clock,
  FileText,
  HardDrive,
  Laptop,
  Monitor,
  Radar,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { WindowDragArea } from "@/components/windows/window-chrome";
import type { VirtualFileSystem } from "@/lib/virtual-fs/filesystem";
import { sidebarSections } from "../data/sidebar";
import type { SidebarEntry, SidebarIconKey } from "../types/finder";

const icons: Record<SidebarIconKey, LucideIcon> = {
  airdrop: Radar,
  recents: Clock,
  applications: Rocket,
  desktop: Monitor,
  documents: FileText,
  downloads: CircleArrowDown,
  computer: Laptop,
  disk: HardDrive,
};

interface FinderSidebarProps {
  fs: VirtualFileSystem;
  currentFolderId: string;
  /** Only meaningful when the window is narrow, where the sidebar is a drawer. */
  open: boolean;
  onOpenFolder: (folderId: string) => void;
}

export function FinderSidebar({ fs, currentFolderId, open, onOpenFolder }: FinderSidebarProps) {
  return (
    <aside
      id="finder-sidebar"
      aria-label="Sidebar"
      data-open={open}
      className="flex w-[200px] shrink-0 flex-col border-r border-black/10 bg-sidebar/70 @max-[560px]:w-[160px] @max-[520px]:absolute @max-[520px]:inset-y-0 @max-[520px]:left-0 @max-[520px]:z-20 @max-[520px]:w-[230px] @max-[520px]:bg-sidebar @max-[520px]:shadow-[4px_0_24px_rgba(0,0,0,0.2)] @max-[520px]:data-[open=false]:hidden"
    >
      {/* Room for the traffic lights, which float over this corner. */}
      <WindowDragArea className="h-[52px] shrink-0" />
      <nav aria-label="Locations" className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {sidebarSections.map((section) => (
          <section key={section.id} aria-labelledby={`finder-sidebar-${section.id}`}>
            <h3
              id={`finder-sidebar-${section.id}`}
              className="px-2 pt-3 pb-1 text-[11px] font-semibold text-black/40"
            >
              {section.title}
            </h3>
            <ul>
              {section.entries.map((entry) => (
                <li key={entry.id}>
                  <SidebarButton
                    entry={entry}
                    fs={fs}
                    active={entry.folderId === currentFolderId}
                    onOpenFolder={onOpenFolder}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  );
}

function SidebarButton({
  fs,
  entry,
  active,
  onOpenFolder,
}: {
  fs: VirtualFileSystem;
  entry: SidebarEntry;
  active: boolean;
  onOpenFolder: (folderId: string) => void;
}) {
  const Icon = entry.icon ? icons[entry.icon] : null;
  // Location labels come from the file system so they match the root folder's name.
  const label = entry.label || (entry.folderId && fs.getFile(entry.folderId)?.name) || "";
  const { folderId } = entry;

  return (
    <button
      type="button"
      disabled={!folderId}
      aria-current={active ? "page" : undefined}
      onClick={folderId ? () => onOpenFolder(folderId) : undefined}
      className={`flex h-[26px] w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-black/85 outline-none focus-visible:ring-2 focus-visible:ring-(--accent) disabled:opacity-40 ${
        active ? "bg-black/10" : folderId ? "hover:bg-black/5" : ""
      }`}
    >
      {Icon ? (
        <Icon className="size-4 shrink-0 text-(--accent)" strokeWidth={1.75} aria-hidden />
      ) : (
        <span
          aria-hidden
          className="mx-[3px] size-[10px] shrink-0 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
      )}
      <span className="truncate">{label}</span>
    </button>
  );
}
