import {
  navigateFinderToFolder,
  openApplicationById,
  openMediaById,
  openNoteById,
  openProjectById,
} from "@/lib/navigation";
import type { NotificationAction } from "../types/notification";

/** Runs a notification's action through the shared navigation layer. False if the target is gone. */
export function performNotificationAction(action: NotificationAction): boolean {
  switch (action.type) {
    case "open-application":
      return openApplicationById(action.appId);
    case "open-project":
      return openProjectById(action.projectId);
    case "open-folder":
      return navigateFinderToFolder(action.folderId);
    case "open-note":
      return openNoteById(action.noteId);
    case "open-media":
      return openMediaById(action.mediaId);
  }
}
