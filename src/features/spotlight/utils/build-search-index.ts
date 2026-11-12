import { applications } from "@/config/applications";
import { getDocumentById } from "@/data/documents";
import { portfolioFileSystem as fs } from "@/data/portfolio-file-system";
import { categoryName, getRegistry } from "@/lib/projects/registry";
import { classificationKeywords, getDeveloperStatistics } from "@/lib/projects/statistics";
import { useRepositoryStore } from "@/store/repository-store";
import { getFolderName, getNoteDocuments } from "@/features/notes/lib/content";
import { getFileKind } from "@/lib/virtual-fs/kind";
import { profile } from "@/data/profile";
import { formatDateRange } from "@/lib/profile/format";
import { getEducation, getExperience, getSkillGroups } from "@/lib/profile/selectors";
import type { SpotlightItem } from "../types/spotlight";


/** Builds the index from the existing registries. Nothing is copied by hand. */
export function buildSearchIndex(): SpotlightItem[] {
  const items: SpotlightItem[] = [];

  // Applications you can open (the Project Viewer is a document viewer, not launched by name).
  for (const app of applications) {
    if (app.type !== "internal" || !app.defaultInDock) continue;
    items.push({
      id: `app:${app.id}`,
      type: "application",
      category: "applications",
      title: app.name,
      subtitle: "Application",
      keywords: [app.id, ...(app.searchKeywords ?? [])],
      icon: { kind: "image", src: app.icon },
      target: { kind: "application", appId: app.id },
    });
  }

  const stats = getDeveloperStatistics(useRepositoryStore.getState().repositories);
  for (const project of getRegistry().projects) {
    const classification = stats.byProject.get(project.id);
    items.push({
      id: `project:${project.id}`,
      type: "project",
      category: "projects",
      title: project.title,
      subtitle: project.categories.map(categoryName).join(", ") || "Project",
      keywords: [project.slug, ...project.categories.map(categoryName), ...(project.technologies ?? []), ...(classification ? classificationKeywords(classification) : []), ...(project.repository?.fullName ? [project.repository.fullName] : [])],
      content: [project.shortDescription, project.longDescription].filter(Boolean).join(" "),
      icon: { kind: "project" },
      target: { kind: "project", projectId: project.id },
    });
  }

  // Files and folders. Project placements are skipped: they are the same projects listed above.
  const stack = [fs.rootId];
  while (stack.length > 0) {
    for (const file of fs.getChildren(stack.pop()!)) {
      if (file.type === "folder") stack.push(file.id);
      if (file.type === "project" || file.parentId === "desktop") continue;
      const parent = fs.getParent(file.id);
      items.push({
        id: `file:${file.id}`,
        type: file.type === "folder" ? "folder" : "file",
        category: "files",
        title: file.name,
        subtitle: parent && parent.id !== fs.rootId ? `${getFileKind(file)} — ${fs.getPathString(parent.id, " / ")}` : getFileKind(file),
        // Documents add their own search terms (e.g. "cv" for the resume) to the same record.
        keywords: [
          getFileKind(file),
          ...(file.extension ? [file.extension] : []),
          ...((file.documentId && getDocumentById(file.documentId)?.keywords) || []),
        ],
        icon: { kind: "file", file },
        target: file.type === "folder" ? { kind: "folder", folderId: file.id } : { kind: "file", fileId: file.id },
      });
    }
  }

  const notesIcon = applications.find((a) => a.id === "notes")?.icon ?? "";
  for (const doc of getNoteDocuments()) {
    items.push({
      id: `note:${doc.note.id}`,
      type: "note",
      category: "notes",
      title: doc.note.title,
      subtitle: `Note — ${getFolderName(doc.note.folderId)}`,
      keywords: [],
      // Real content only: placeholder text is never indexed.
      content: doc.haystack,
      icon: { kind: "image", src: notesIcon },
      target: { kind: "note", noteId: doc.note.id },
    });
  }
  items.push(...profileItems(applications.find((a) => a.id === "safari")?.icon ?? ""));
  return items;
}

/** Education, experience, skills and certifications, from the central profile. They open Safari's About page at the section. */
function profileItems(icon: string): SpotlightItem[] {
  const base = { type: "profile", category: "profile", icon: { kind: "image", src: icon } } as const;
  const items: SpotlightItem[] = [];
  // The person: searching their name, role or home city leads to the About page.
  items.push({
    ...base,
    id: "profile:about",
    title: profile.fullName ?? profile.displayName,
    subtitle: ["About Me", profile.headline].filter(Boolean).join(" — "),
    keywords: ["about", "who am i", "bio", profile.displayName, ...(profile.location ? [profile.location] : []), ...(profile.interests ?? [])],
    content: [profile.headline, profile.shortBio].filter(Boolean).join(" "),
    target: { kind: "about", section: "introduction" },
  });
  for (const e of getEducation()) {
    items.push({
      ...base,
      id: `profile:education:${e.id}`,
      title: e.institution,
      subtitle: ["Education", [e.degree, e.fieldOfStudy].filter(Boolean).join(", ")].filter(Boolean).join(" — "),
      keywords: ["education", "university", "school", "degree", ...(e.degree ? [e.degree] : []), ...(e.fieldOfStudy ? [e.fieldOfStudy] : [])],
      content: [e.description, ...(e.highlights ?? []), formatDateRange(e.startDate, e.graduationDate, e.current)].filter(Boolean).join(" "),
      target: { kind: "about", section: "education" },
    });
  }
  for (const e of getExperience()) {
    items.push({
      ...base,
      id: `profile:experience:${e.id}`,
      title: `${e.role} — ${e.organization}`,
      subtitle: "Professional Experience",
      keywords: ["experience", "work", "job", e.organization, ...(e.technologies ?? [])],
      content: [e.description, ...(e.responsibilities ?? [])].filter(Boolean).join(" "),
      target: { kind: "about", section: "experience" },
    });
  }
  for (const group of getSkillGroups()) {
    for (const skill of group.skills) {
      items.push({
        ...base,
        id: `profile:skill:${group.id}:${skill}`,
        title: skill,
        subtitle: `Skill — ${group.name}`,
        keywords: ["skill", "skills", group.name],
        target: { kind: "about", section: "skills" },
      });
    }
  }
  for (const c of profile.certifications) {
    items.push({
      ...base,
      id: `profile:certification:${c.id}`,
      title: c.name,
      subtitle: `Certification — ${c.issuer}`,
      keywords: ["certification", "certificate", c.issuer],
      target: { kind: "about", section: "education" },
    });
  }
  return items;
}

let cache: readonly SpotlightItem[] | undefined;
let cacheKey: unknown;

/** Built once per set of repositories, then reused for every keystroke. It is rebuilt only when GitHub data changes. */
export function getSearchIndex(): readonly SpotlightItem[] {
  const key = useRepositoryStore.getState().repositories;
  if (!cache || cacheKey !== key) {
    cache = buildSearchIndex();
    cacheKey = key;
  }
  return cache;
}
