import {
  Clock,
  Folder,
  Globe,
  Image as ImageIcon,
  Images,
  Smartphone,
  Sparkles,
  TabletSmartphone,
  type LucideIcon,
} from "lucide-react";
import { WindowDragArea } from "@/components/windows/window-chrome";
import type { Album, AlbumSection } from "../lib/albums";

const icons: Record<string, LucideIcon> = {
  all: Images,
  recents: Clock,
  "all-projects": Folder,
  "category:ios-development": Smartphone,
  "category:android-development": TabletSmartphone,
  "category:web-development": Globe,
  "category:artificial-intelligence": Sparkles,
};

const sections: { id: AlbumSection; title: string }[] = [
  { id: "library", title: "Library" },
  { id: "albums", title: "Albums" },
  { id: "projects", title: "Project Albums" },
];

interface PhotosSidebarProps {
  albums: readonly Album[];
  activeId: string;
  /** Narrow windows: drawn over the content instead of beside it. */
  overlay?: boolean;
  onSelect: (id: string) => void;
}

export function PhotosSidebar({ albums, activeId, overlay = false, onSelect }: PhotosSidebarProps) {
  return (
    <aside
      aria-label="Photos sidebar"
      className={`flex shrink-0 flex-col border-r border-black/10 ${overlay ? "absolute inset-y-0 left-0 z-20 w-[230px] bg-sidebar shadow-[4px_0_24px_rgba(0,0,0,0.2)]" : "w-[200px] bg-sidebar/70 @max-[640px]:w-[168px]"}`}
    >
      {/* Room for the traffic lights floating over this corner. */}
      <WindowDragArea className="h-[52px] shrink-0" />
      <nav aria-label="Albums" className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {sections.map((section) => {
          const items = albums.filter((a) => a.section === section.id);
          if (items.length === 0) return null;
          return (
            <section key={section.id} aria-labelledby={`photos-sidebar-${section.id}`}>
              <h2
                id={`photos-sidebar-${section.id}`}
                className="px-2 pt-3 pb-1 text-[11px] font-semibold text-black/40"
              >
                {section.title}
              </h2>
              <ul>
                {items.map((album) => {
                  const Icon = icons[album.id] ?? ImageIcon;
                  const active = album.id === activeId;
                  return (
                    <li key={album.id}>
                      <button
                        type="button"
                        aria-current={active ? "page" : undefined}
                        onClick={() => onSelect(album.id)}
                        className={`flex h-[26px] w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-black/85 outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${
                          active ? "bg-black/10" : "hover:bg-black/5"
                        }`}
                      >
                        <Icon className="size-4 shrink-0 text-(--accent)" strokeWidth={1.75} aria-hidden />
                        <span className="truncate">{album.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </nav>
    </aside>
  );
}
