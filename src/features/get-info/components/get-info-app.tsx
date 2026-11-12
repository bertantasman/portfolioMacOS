"use client";

import { Copy, FolderOpen } from "lucide-react";
import { FileTypeIcon } from "@/components/file-icons";
import { portfolioFileSystem as fs } from "@/data/portfolio-file-system";
import { getDocumentById } from "@/data/documents";
import { getProjectById } from "@/lib/projects/registry";
import { copyWithFeedback } from "@/features/context-menu/utils/context-menu-actions";
import { formatModified, formatSize } from "@/features/finder/lib/format";
import { revealFileInFinder } from "@/lib/navigation";
import { getFileKind } from "@/lib/virtual-fs/kind";
import { getVirtualPath } from "@/lib/virtual-fs/path";

/** One Get Info window. Everything shown comes from the virtual file system; missing details are left out. */
export function GetInfoApp({ fileId }: { fileId: string }) {
  const file = fs.getFile(fileId);
  if (!file) {
    return (
      <p role="status" className="grid size-full place-items-center bg-surface p-6 text-center text-[13px] text-black/50">
        This item is no longer available.
      </p>
    );
  }

  const parent = fs.getParent(file.id);
  const description =
    file.description ||
    (file.documentId && getDocumentById(file.documentId)?.description) ||
    (file.projectId && getProjectById(file.projectId)?.shortDescription) ||
    undefined;
  const path = getVirtualPath(fs, file.id);

  const rows: { label: string; value: string }[] = [
    { label: "Kind", value: getFileKind(file) },
    ...(file.size !== undefined ? [{ label: "Size", value: formatSize(file.size) }] : []),
    ...(parent ? [{ label: "Where", value: getVirtualPath(fs, parent.id) }] : []),
    ...(file.modifiedAt ? [{ label: "Modified", value: formatModified(file.modifiedAt) }] : []),
    ...(description ? [{ label: "About", value: description }] : []),
  ];

  const button =
    "flex h-7 items-center justify-center gap-1.5 rounded-md bg-black/[0.07] px-3 text-[12px] text-black/80 outline-none hover:bg-black/[0.12] focus-visible:ring-2 focus-visible:ring-(--accent)";

  return (
    <div className="flex size-full flex-col gap-4 overflow-y-auto bg-surface p-5 text-black">
      <header className="flex items-center gap-3">
        <FileTypeIcon file={file} className="h-14 w-auto max-w-[64px] shrink-0" />
        <div className="min-w-0">
          <h1 className="text-[15px] font-semibold break-words text-black/90">{file.name}</h1>
          <p className="text-[12px] text-black/50">{getFileKind(file)}</p>
        </div>
      </header>
      <dl className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-3 gap-y-2 border-t border-black/10 pt-3 text-[12px]">
        {rows.map((r) => (
          <div key={r.label} className="col-span-2 grid grid-cols-subgrid">
            <dt className="text-right text-black/45">{r.label}</dt>
            <dd className="break-words text-black/85 select-text">{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto flex flex-wrap gap-2 border-t border-black/10 pt-3">
        <button type="button" className={button} onClick={() => void copyWithFeedback(file.name, "Name")}>
          <Copy className="size-3.5" aria-hidden />
          Copy Name
        </button>
        <button type="button" className={button} onClick={() => void copyWithFeedback(path, "Path")}>
          <Copy className="size-3.5" aria-hidden />
          Copy Path
        </button>
        {parent && (
          <button type="button" className={button} onClick={() => revealFileInFinder(file.id)}>
            <FolderOpen className="size-3.5" aria-hidden />
            Show in Folder
          </button>
        )}
      </div>
    </div>
  );
}
