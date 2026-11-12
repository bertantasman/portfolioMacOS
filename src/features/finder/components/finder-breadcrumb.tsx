import { ChevronRight } from "lucide-react";
import type { VirtualFileSystem } from "@/lib/virtual-fs/filesystem";
import { FolderIcon } from "@/components/file-icons";

interface FinderBreadcrumbProps {
  fs: VirtualFileSystem;
  folderId: string;
  itemCount: number;
  selectedCount: number;
  onOpenFolder: (folderId: string) => void;
}

export function FinderBreadcrumb({
  fs,
  folderId,
  itemCount,
  selectedCount,
  onOpenFolder,
}: FinderBreadcrumbProps) {
  const path = fs.getBreadcrumbs(folderId);
  const status =
    selectedCount > 0
      ? `${selectedCount} of ${itemCount} selected`
      : `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <div className="flex h-[26px] shrink-0 items-center gap-3 border-t border-black/10 bg-surface/80 px-3 text-[11px] text-black/60">
      <nav aria-label="Path" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center">
          {path.map((item, i) => {
            const isCurrent = i === path.length - 1;
            return (
              <li
                key={item.id}
                className={`flex items-center ${isCurrent ? "min-w-0 shrink" : "min-w-0 shrink-[3]"}`}
              >
                {i > 0 && <ChevronRight className="mx-0.5 size-3 shrink-0 text-black/30" aria-hidden />}
                <button
                  type="button"
                  aria-current={isCurrent ? "page" : undefined}
                  disabled={isCurrent}
                  onClick={() => onOpenFolder(item.id)}
                  className="flex min-w-0 items-center gap-1 rounded px-1 outline-none enabled:hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-(--accent) disabled:text-black/80"
                >
                  <FolderIcon className="h-3 w-[14px] shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <span role="status" className="shrink-0 whitespace-nowrap @max-[420px]:hidden">
        {status}
      </span>
    </div>
  );
}
