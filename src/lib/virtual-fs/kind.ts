import type { VirtualFile } from "./types";

/** Human-readable kind, as shown in Finder's Kind column. */
export function getFileKind(file: VirtualFile): string {
  if (file.kind) return file.kind;
  switch (file.type) {
    case "folder":
      return "Folder";
    case "project":
      return "Project";
    case "image":
      return "Image";
    case "application":
      return "Application";
    case "document":
      return file.extension === "pdf" ? "PDF Document" : file.extension === "md" ? "Markdown Document" : "Document";
  }
}
