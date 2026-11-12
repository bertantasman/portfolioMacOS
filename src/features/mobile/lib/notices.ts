import { getDocumentById, isPublished } from "@/data/documents";
import { profile } from "@/data/profile";
import { selectFeatured, type ProjectRegistry } from "@/lib/projects/registry";

export interface MobileNotice {
  id: string;
  title: string;
  message: string;
  /** What tapping it opens. */
  app: string;
  stack?: readonly string[];
}

/**
 * The Notification Center's items, all built from the portfolio's own content: a welcome pointer, the featured projects
 * and the résumé when one is published. Nothing here is a message from a person, and nothing needs a permission.
 */
export function buildNotices(registry: ProjectRegistry): MobileNotice[] {
  const notices: MobileNotice[] = [
    { id: "welcome", title: "Start here", message: "My projects are in the Projects app. Search finds anything.", app: "projects" },
  ];
  for (const p of selectFeatured(registry, 3).projects) {
    notices.push({ id: `featured:${p.id}`, title: `Featured: ${p.title}`, message: p.tagline ?? p.shortDescription, app: "projects", stack: [p.id] });
  }
  const resume = profile.resume ? getDocumentById(profile.resume.documentId) : undefined;
  if (resume && isPublished(resume)) notices.push({ id: "resume", title: "Resume", message: "The résumé is available to view and download.", app: "resume" });
  return notices;
}
