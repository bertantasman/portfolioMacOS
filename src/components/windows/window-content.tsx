"use client";

import dynamic from "next/dynamic";
import { PlaceholderApp } from "@/components/applications/placeholder-app";
import { getApplication } from "@/config/applications";
import { getDocumentById } from "@/data/documents";
import { getMediaById } from "@/data/media";
import { getProjectById } from "@/lib/projects/registry";
import { useWindowStore } from "@/store/window-store";
import type { WindowState } from "@/types/window";
import { appLoaders } from "./app-loaders";
import { AppLoading } from "./app-loading";

// Application code is fetched when its first window opens (see app-loaders.ts).
const loading = () => <AppLoading />;
const FinderApp = dynamic(appLoaders.finder, { loading });
const SafariApp = dynamic(appLoaders.safari, { loading });
const TerminalApp = dynamic(appLoaders.terminal, { loading });
const NotesApp = dynamic(appLoaders.notes, { loading });
const SettingsApp = dynamic(appLoaders["system-settings"], { loading });
const PhotosApp = dynamic(appLoaders.photos, { loading });
const GitHubApp = dynamic(appLoaders.github, { loading });
const LinkedInApp = dynamic(appLoaders.linkedin, { loading });
const InstagramApp = dynamic(appLoaders.instagram, { loading });
const PreviewApp = dynamic(appLoaders.preview, { loading });
const MailApp = dynamic(appLoaders.mail, { loading });
const GetInfoApp = dynamic(appLoaders["get-info"], { loading });
const ProjectViewer = dynamic(appLoaders["project-viewer"], { loading });

function openProject(projectId: string) {
  // Only open projects that exist in the registry.
  if (getProjectById(projectId)) useWindowStore.getState().openProject(projectId);
}

function openMedia(mediaId: string) {
  // Ignore references to media that no longer exists.
  if (getMediaById(mediaId)) useWindowStore.getState().openMedia(mediaId);
}

function openDocument(documentId: string) {
  // Ignore references to documents that are not configured.
  if (getDocumentById(documentId)) useWindowStore.getState().openDocument(documentId);
}

function openNote(noteId: string) {
  useWindowStore.getState().openNote(noteId);
}

/** Chooses the content for a window. Real applications plug in here by appId. */
export function WindowContent({ window }: { window: WindowState }) {
  switch (window.appId) {
    case "finder":
      return <FinderApp
          onOpenProject={openProject}
          onOpenMedia={openMedia}
          onOpenDocument={openDocument}
          onOpenNote={openNote}
          request={window.payload.type === "folder" ? window.payload : undefined}
        />;
    case "safari":
      return <SafariApp request={window.payload.type === "safari" ? window.payload : undefined} />;
    case "terminal":
      return <TerminalApp />;
    case "notes":
      return <NotesApp request={window.payload.type === "note" ? window.payload : undefined} />;
    case "system-settings":
      return <SettingsApp request={window.payload.type === "settings" ? window.payload : undefined} />;
    case "photos":
      return <PhotosApp request={window.payload.type === "media" ? window.payload : undefined} />;
    case "github":
      return <GitHubApp />;
    case "linkedin":
      return <LinkedInApp />;
    case "instagram":
      return <InstagramApp />;
    case "preview":
      return window.payload.type === "document" ? <PreviewApp documentId={window.payload.documentId} /> : null;
    case "mail":
      return <MailApp request={window.payload.type === "mail" ? window.payload : undefined} />;
    case "get-info":
      return window.payload.type === "info" ? <GetInfoApp fileId={window.payload.fileId} /> : null;
    case "project-viewer":
      return window.payload.type === "project" ? (
        <ProjectViewer projectId={window.payload.projectId} />
      ) : null;
    default:
      return <PlaceholderApp app={getApplication(window.appId)} />;
  }
}
