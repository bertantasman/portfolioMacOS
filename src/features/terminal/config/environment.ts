import { terminalConfig } from "@/config/terminal";
import { projectCategories } from "@/data/project-categories";
import { portfolioFileSystem, ROOT_ID } from "@/data/portfolio-file-system";
import { getProjectById } from "@/lib/projects/registry";
import { useWindowStore } from "@/store/window-store";
import type { TerminalEnvironment } from "../types/terminal";

const categoryName = (id: string) => projectCategories.find((c) => c.id === id)?.name ?? id;

/** Wires the Terminal to the shared file system, project registry and window manager. */
export const terminalEnvironment: TerminalEnvironment = {
  fs: portfolioFileSystem,
  // The virtual root is the user's home folder.
  homeId: ROOT_ID,
  username: terminalConfig.username,
  hostname: terminalConfig.hostname,
  homePath: terminalConfig.homePath,
  displayName: terminalConfig.displayName,
  fullName: terminalConfig.fullName,
  role: terminalConfig.role,
  getProjectSummary: (projectId) => {
    const project = getProjectById(projectId);
    if (!project) return undefined;
    const lines = [project.title, project.shortDescription];
    if (project.categories.length > 0) {
      lines.push(`Categories: ${project.categories.map(categoryName).join(", ")}`);
    }
    if (project.status) lines.push(`Status: ${project.status}`);
    return lines;
  },
  openProject: (projectId) => {
    useWindowStore.getState().openProject(projectId);
  },
  openMedia: (mediaId) => {
    useWindowStore.getState().openMedia(mediaId);
  },
  openDocument: (documentId) => {
    useWindowStore.getState().openDocument(documentId);
  },
  openNote: (noteId) => {
    useWindowStore.getState().openNote(noteId);
  },
  openMail: () => {
    useWindowStore.getState().openMail(false);
  },
};
