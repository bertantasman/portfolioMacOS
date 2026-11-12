import { portfolioFileSystem as fs } from "@/data/portfolio-file-system";
import type { SpotlightItem, SpotlightTarget } from "@/features/spotlight/types/spotlight";
import { getExternalApps, isMobileAppId } from "./apps";

/** Where a search result leads in the mobile shell: one of its apps (with screens), or an external profile. */
export type MobileRoute = { kind: "app"; app: string; stack: readonly string[] } | { kind: "external"; url: string };

const APP_FOR_DESKTOP_APP: Record<string, string> = {
  finder: "files",
  safari: "safari",
  photos: "photos",
  notes: "notes",
  mail: "contact",
  "system-settings": "settings",
  preview: "resume",
};

const app = (id: string, stack: readonly string[] = []): MobileRoute => ({ kind: "app", app: id, stack });

/** Maps the shared search index's targets onto mobile destinations. Results with no mobile equivalent return null. */
export function routeForTarget(target: SpotlightTarget): MobileRoute | null {
  switch (target.kind) {
    case "application": {
      const external = getExternalApps().find((e) => e.id === target.appId);
      if (external) return { kind: "external", url: external.url };
      const id = APP_FOR_DESKTOP_APP[target.appId];
      return id && isMobileAppId(id) ? app(id) : null;
    }
    case "project":
      return app("projects", [target.projectId]);
    case "folder":
      return fs.getFile(target.folderId)?.type === "folder" ? app("files", [target.folderId]) : null;
    case "note":
      return app("notes", [target.noteId]);
    case "about":
      return app("about");
    case "file": {
      const file = fs.getFile(target.fileId);
      if (!file) return null;
      if (file.type === "project" && file.projectId) return app("projects", [file.projectId]);
      if (file.type === "image" && file.mediaId) return app("photos", [file.mediaId]);
      if (file.type === "document" && file.documentId) return app("resume");
      if (file.type === "document" && file.noteId) return app("notes", [file.noteId]);
      return null;
    }
  }
}

export const routeForItem = (item: SpotlightItem) => routeForTarget(item.target);

/** Splits text around the matches of `query` so a result can highlight them without injecting HTML. */
export function highlightParts(text: string, query: string): { text: string; match: boolean }[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [{ text, match: false }];
  const lower = text.toLowerCase();
  const marks = new Array<boolean>(text.length).fill(false);
  for (const term of terms) {
    for (let i = lower.indexOf(term); i !== -1; i = lower.indexOf(term, i + term.length)) {
      for (let j = i; j < i + term.length; j++) marks[j] = true;
    }
  }
  const parts: { text: string; match: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.match === marks[i]) last.text += text[i];
    else parts.push({ text: text[i], match: marks[i] });
  }
  return parts;
}
