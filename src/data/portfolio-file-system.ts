import { siteConfig } from "@/config/site";
import { createFileSystem, type VirtualFileSystem } from "@/lib/virtual-fs/filesystem";
import { assertValidFileSystem } from "@/lib/virtual-fs/validate";
import type { VirtualFile } from "@/lib/virtual-fs/types";
import { projectCategories } from "./project-categories";
import { getProjectById, getRegistry } from "@/lib/projects/registry";
import { useRepositoryStore } from "@/store/repository-store";
import type { PortfolioProject } from "@/types/project";
import { getDocumentById, isPublished } from "./documents";
import { profile } from "./profile";
import { getAllMedia, getMediaById } from "./media";
import { notes } from "./notes";
import { educationSummary, experienceSummary, skillGroupSummary } from "@/lib/profile/files";
import { profileFileLines } from "@/lib/profile/text";


export const ROOT_ID = "macbook";
/** The Projects folder on the Desktop: an alias of the real Projects folder. */
export const DESKTOP_PROJECTS_ID = "desktop:projects";
export const FOLDER = {
  desktop: "desktop",
  documents: "documents",
  downloads: "downloads",
  applications: "applications",
  pictures: "pictures",
  projects: "projects",
  experience: "experience",
  education: "education",
  skills: "skills",
  featured: "featured",
} as const;

const folder = (id: string, name: string, parentId: string): VirtualFile => ({
  id,
  name,
  type: "folder",
  parentId,
});

/**
 * What a profile entry's file carries: its text (Terminal's `cat`), a one-line description (Get Info), and the note
 * that opens when it is double-clicked. All of it comes from the profile registry (the text is the same `cat` prints).
 */
const profileFile = (fileId: string, description: string, noteId: string): Pick<VirtualFile, "extension" | "textContent" | "description" | "noteId"> => ({
  extension: "md",
  textContent: (profileFileLines(fileId) ?? []).join("\n"),
  description: description || undefined,
  noteId,
});

function resumeFiles(): VirtualFile[] {
  const resume = profile.resume ? getDocumentById(profile.resume.documentId) : undefined;
  // An unpublished resume (no approved public PDF yet) is not shown anywhere.
  if (!resume || !isPublished(resume)) return [];
  const entry = (id: string, parentId: string): VirtualFile => ({
    id,
    name: resume.filename,
    type: "document",
    parentId,
    extension: resume.filename.split(".").pop()?.toLowerCase(),
    documentId: resume.id,
  });
  // The Documents entry keeps its long-standing id; the Desktop one is an alias of it.
  return [entry(resume.id, FOLDER.documents), entry(`desktop:${resume.id}`, FOLDER.desktop)];
}

function buildFiles(): VirtualFile[] {
  const registry = getRegistry();
  const projects = registry.projects;
  const usedCategories = projectCategories.filter((c) => projects.some((p) => p.categories.includes(c.id)));
  const hasFeatured = projects.some((p) => p.featured === true);
  // Two siblings may not share a name; a clash gets the project id appended so both stay reachable.
  const names = new Set<string>();
  const unique = (parentId: string, project: PortfolioProject) => {
    const key = `${parentId}\u0000${project.title.toLowerCase()}`;
    if (!names.has(key)) {
      names.add(key);
      return project.title;
    }
    return `${project.title} (${project.id.replace(/^github:/, "")})`;
  };
  const placement = (id: string, parentId: string, project: PortfolioProject): VirtualFile => ({
    id,
    name: unique(parentId, project),
    type: "project",
    parentId,
    projectId: project.id,
  });

  return [
  { id: ROOT_ID, name: `${siteConfig.owner.name}’s MacBook`, type: "folder", parentId: null, kind: "Volume" },
  folder(FOLDER.desktop, "Desktop", ROOT_ID),
  folder(FOLDER.documents, "Documents", ROOT_ID),
  folder(FOLDER.downloads, "Downloads", ROOT_ID),
  folder(FOLDER.applications, "Applications", ROOT_ID),
  folder(FOLDER.pictures, "Pictures", ROOT_ID),

  folder(FOLDER.projects, "Projects", FOLDER.documents),
  folder(FOLDER.experience, "Experience", FOLDER.documents),
  folder(FOLDER.education, "Education", FOLDER.documents),
  folder(FOLDER.skills, "Skills", FOLDER.documents),
  // The resume file and its Desktop alias are references to the document registry, never a second resume.
  ...resumeFiles(),

  // The Desktop keeps a short, intentional set: one Projects folder (an alias of Documents › Projects, so there is a
  // single project listing), the résumé above, and two profile notes. Individual projects live inside Projects.
  { id: DESKTOP_PROJECTS_ID, name: "Projects", type: "folder", parentId: FOLDER.desktop, aliasOf: FOLDER.projects, description: "Explore my applications, games, and development work." },
  { id: "desktop:about-me", name: "About Me", type: "document", parentId: FOLDER.desktop, extension: "md", noteId: "about-me", description: "Who I am and what I build." },
  { id: "desktop:contact", name: "Contact", type: "document", parentId: FOLDER.desktop, extension: "md", noteId: "contact-information", description: "How to get in touch." },

  // One folder per category that has projects in it, plus Featured when any project is featured.
  ...usedCategories.map((c) => folder(c.id, c.name, FOLDER.projects)),
  ...(hasFeatured ? [folder(FOLDER.featured, "Featured", FOLDER.projects)] : []),

  // The hand-written projects (apps, games, web work) sit directly in Projects, so the folder opens onto them;
  // repositories are reached through the category folders below.
  ...projects.filter((p) => p.source === "curated").map((project) => placement(`project:${project.id}@${FOLDER.projects}`, FOLDER.projects, project)),

  // Each project is placed once per category it belongs to. These are
  // references (projectId), not copies of the project.
  ...projects.flatMap((project) => [
    ...project.categories.map((categoryId) => placement(`project:${project.id}@${categoryId}`, categoryId, project)),
    ...(project.featured === true ? [placement(`project:${project.id}@${FOLDER.featured}`, FOLDER.featured, project)] : []),
  ]),

  // Pictures mirrors the media library: one image file per media record.
  ...getAllMedia().map(
    (m): VirtualFile => ({
      id: `media:${m.id}`,
      name: m.src.split("/").pop() ?? m.id,
      type: "image",
      parentId: FOLDER.pictures,
      mediaId: m.id,
      extension: m.src.split(".").pop()?.toLowerCase(),
    }),
  ),

  ...profile.experience.map(
    (e): VirtualFile => ({
      id: `experience:${e.id}`,
      name: e.organization,
      type: "document",
      parentId: FOLDER.experience,
      ...profileFile(`experience:${e.id}`, experienceSummary(e), "professional-experience"),
    }),
  ),
  ...profile.education.map(
    (e): VirtualFile => ({
      id: `education:${e.id}`,
      name: e.institution,
      type: "document",
      parentId: FOLDER.education,
      ...profileFile(`education:${e.id}`, educationSummary(e), "education"),
    }),
  ),
  ...profile.skillGroups.map(
    (g): VirtualFile => ({
      id: `skills:${g.id}`,
      name: g.name,
      type: "document",
      parentId: FOLDER.skills,
      ...profileFile(`skills:${g.id}`, skillGroupSummary(g), "technical-skills"),
    }),
  ),
];
}

const validationOptions = {
  rootId: ROOT_ID,
  hasProject: (id: string) => getProjectById(id) !== undefined,
  hasMedia: (id: string) => getMediaById(id) !== undefined,
  hasDocument: (id: string) => getDocumentById(id) !== undefined,
  hasNote: (id: string) => notes.some((n) => n.id === id),
};

function build(): VirtualFileSystem<PortfolioProject> {
  const files = buildFiles();
  if (process.env.NODE_ENV !== "production") {
    assertValidFileSystem(files, validationOptions);
  }
  return createFileSystem(files, { rootId: ROOT_ID, resolveProject: getProjectById });
}

let current = build();

/**
 * The portfolio's virtual file system. Its project folders follow the unified project registry, so when the
 * GitHub repositories load or refresh the folders are rebuilt in place; everything that holds this object
 * (Finder, Terminal, Spotlight, desktop icons) keeps working and sees the new contents.
 */
export const portfolioFileSystem: VirtualFileSystem<PortfolioProject> = {
  get rootId() {
    return current.rootId;
  },
  getFile: (id) => current.getFile(id),
  getChildren: (folderId) => current.getChildren(folderId),
  getParent: (id) => current.getParent(id),
  getPath: (id) => current.getPath(id),
  getPathString: (id, separator) => current.getPathString(id, separator),
  getBreadcrumbs: (id) => current.getBreadcrumbs(id),
  resolveProject: (file) => current.resolveProject(file),
};

// Rebuild when the repository list changes. Components that need to redraw subscribe to the same store.
useRepositoryStore.subscribe((state, previous) => {
  if (state.repositories !== previous.repositories) current = build();
});
