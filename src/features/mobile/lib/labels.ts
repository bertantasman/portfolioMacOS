import { portfolioFileSystem as fs } from "@/data/portfolio-file-system";
import { getMediaById } from "@/data/media";
import { notes } from "@/data/notes";
import { getProjectById } from "@/lib/projects/registry";

/** A short description of the screen an app is on (a project's title, a folder's name), for the App Switcher. */
export function screenLabel(app: string, stack: readonly string[]): string | undefined {
  const top = stack[stack.length - 1];
  if (!top) return undefined;
  switch (app) {
    case "projects":
      return getProjectById(top)?.title;
    case "files":
      return fs.getFile(top)?.name;
    case "notes":
      return notes.find((n) => n.id === top)?.title;
    case "photos":
      return getMediaById(top)?.title;
    default:
      return undefined;
  }
}
