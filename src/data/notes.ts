import type { NoteFolder, PortfolioNote } from "@/types/notes";

export const ALL_NOTES_ID = "all";

/** "All Notes" is virtual; the other folders hold notes. */
export const noteFolders: readonly NoteFolder[] = [
  { id: ALL_NOTES_ID, name: "All Notes" },
  { id: "personal", name: "Personal" },
  { id: "development", name: "Development" },
  { id: "education", name: "Education" },
  { id: "experience", name: "Experience" },
  { id: "projects", name: "Projects" },
  { id: "contact", name: "Contact" },
];

// Note content comes from central data (profile, projects); this list only says
// which notes exist, where they live and how their content is derived. Sibling
// order is the declared order. No dates are set because none are known.
export const notes: readonly PortfolioNote[] = [
  { id: "about-me", title: "About Me", folderId: "personal", contentType: "profile", pinned: true },
  { id: "development-journey", title: "My Development Journey", folderId: "personal", contentType: "journey" },
  { id: "technical-skills", title: "Technical Skills", folderId: "development", contentType: "skills" },
  { id: "development-philosophy", title: "Development Philosophy", folderId: "development", contentType: "philosophy" },
  { id: "tools-technologies", title: "Tools & Technologies", folderId: "development", contentType: "tools" },
  { id: "education", title: "Education", folderId: "education", contentType: "education" },
  { id: "professional-experience", title: "Professional Experience", folderId: "experience", contentType: "experience" },
  { id: "current-projects", title: "Current Projects", folderId: "projects", contentType: "projects", projectFilter: "current" },
  { id: "featured-projects", title: "Featured Projects", folderId: "projects", contentType: "projects", projectFilter: "featured" },
  { id: "contact-information", title: "Contact Information", folderId: "contact", contentType: "contact" },
];
