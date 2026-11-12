import { applications, getApplication } from "@/config/applications";
import { portfolioFileSystem } from "@/data/portfolio-file-system";
import { getMediaById } from "@/data/media";
import { notes } from "@/data/notes";
import { getDocumentById } from "@/data/documents";
import { isAboutSection, type AboutSectionId } from "@/lib/profile/selectors";
import { getProjectById } from "@/lib/projects/registry";
import { isSettingsPageId } from "@/features/settings/lib/pages";
import { useOverlayStore } from "@/store/overlay-store";
import { useWindowStore } from "@/store/window-store";
import type { VirtualFile } from "@/lib/virtual-fs/types";
import type { ApplicationDefinition, ApplicationId, OpenKind } from "@/types/application";

/**
 * Cross-application navigation. Every function validates its target, uses the
 * window manager's deep-link requests, and returns false (with a dev warning)
 * instead of throwing when the target no longer exists.
 */

function fail(message: string): false {
  if (process.env.NODE_ENV !== "production") console.warn(`[navigation] ${message}`);
  return false;
}

const store = () => useWindowStore.getState();

/** Launches a Dock shortcut: opens its existing destination (Finder folder, note, or a new message in Mail). */
export function launchShortcut(app: ApplicationDefinition): boolean {
  const target = app.shortcut;
  if (!target) return false;
  switch (target.kind) {
    case "folder":
      return navigateFinderToFolder(target.folderId);
    case "note":
      return openNoteById(target.noteId);
    case "compose":
      return openMailCompose();
  }
}

export function openApplicationById(appId: string): boolean {
  try {
    const app = getApplication(appId as ApplicationId);
    if (app.type !== "internal") return fail(`"${appId}" is not an internal application.`);
  } catch {
    return fail(`Unknown application "${appId}".`);
  }
  const app = getApplication(appId as ApplicationId);
  if (app.shortcut) return launchShortcut(app);
  // Overlays such as Launchpad have no window; opening one closes any other overlay.
  if (app.overlay) {
    useOverlayStore.getState().open(app.overlay);
    return true;
  }
  store().launchApplication(appId as ApplicationId);
  return true;
}

export function openProjectById(projectId: string): boolean {
  if (!getProjectById(projectId)) return fail(`Unknown project "${projectId}".`);
  store().openProject(projectId);
  return true;
}

/** Opens (or restores and focuses) System Settings on a section, e.g. "wallpaper". */
export function openSystemSettings(page: string): boolean {
  if (!isSettingsPageId(page)) return fail(`Unknown System Settings section "${page}".`);
  store().openSettings(page);
  return true;
}

/** Opens Safari on the About page, optionally scrolled to a section such as "education". */
export function openSafariAbout(section?: AboutSectionId): boolean {
  if (section && !isAboutSection(section)) return fail(`Unknown About section "${section}".`);
  store().openSafari("about", section);
  return true;
}

/** Opens Mail with a new, empty message. */
export function openMailCompose(): boolean {
  store().openMail(true);
  return true;
}

export function openDocumentById(documentId: string): boolean {
  if (!getDocumentById(documentId)) return fail(`Unknown document "${documentId}".`);
  store().openDocument(documentId);
  return true;
}

export function navigateFinderToFolder(folderId: string): boolean {
  const folder = portfolioFileSystem.getFile(folderId);
  if (folder?.type !== "folder") return fail(`"${folderId}" is not a folder.`);
  // An alias (the Desktop's Projects) opens the real folder, so Finder lands in Documents › Projects.
  store().openFolder(folder.aliasOf ?? folder.id);
  return true;
}

/** Shows an item in Finder: its parent folder, with the item selected. */
export function revealFileInFinder(fileId: string): boolean {
  const file = portfolioFileSystem.getFile(fileId);
  if (!file?.parentId) return fail(`Unknown file "${fileId}".`);
  store().openFolder(file.parentId, file.id);
  return true;
}

export function openNoteById(noteId: string): boolean {
  if (!notes.some((n) => n.id === noteId)) return fail(`Unknown note "${noteId}".`);
  store().openNote(noteId);
  return true;
}

export function openMediaById(mediaId: string): boolean {
  if (!getMediaById(mediaId)) return fail(`Unknown media "${mediaId}".`);
  store().openMedia(mediaId);
  return true;
}

/** Which kind of thing a file opens as, for matching it to applications. */
export function getOpenKind(file: VirtualFile): OpenKind | undefined {
  if (file.type === "folder") return "folder";
  if (file.type === "project" && file.projectId) return "project";
  if (file.type === "image" && file.mediaId) return "image";
  if (file.type === "document" && file.documentId && file.extension === "pdf") return "pdf";
  if (file.type === "document" && file.noteId) return "note";
  return undefined;
}

/** Applications that can open this file, from the registry. Empty when nothing can. */
export function getOpenHandlers(file: VirtualFile): ApplicationDefinition[] {
  const kind = getOpenKind(file);
  return kind ? applications.filter((a) => a.opens?.includes(kind)) : [];
}

/**
 * Opens an item the same way double-clicking it in Finder does: folders in Finder, projects in
 * the Project Viewer, images in Photos, PDFs in Preview. Returns false when nothing can open it.
 */
export function openVirtualFile(fileId: string): boolean {
  const file = portfolioFileSystem.getFile(fileId);
  if (!file) return fail(`Unknown file "${fileId}".`);
  switch (getOpenKind(file)) {
    case "folder":
      return navigateFinderToFolder(file.id);
    case "project":
      return openProjectById(file.projectId!);
    case "image":
      return openMediaById(file.mediaId!);
    case "pdf":
      return openDocumentById(file.documentId!);
    case "note":
      return openNoteById(file.noteId!);
    default:
      return fail(`"${file.name}" has no application that can open it.`);
  }
}

/** Opens (or focuses) the Get Info window for an item. */
export function openInfoById(fileId: string): boolean {
  if (!portfolioFileSystem.getFile(fileId)) return fail(`Unknown file "${fileId}".`);
  store().openInfo(fileId);
  return true;
}
