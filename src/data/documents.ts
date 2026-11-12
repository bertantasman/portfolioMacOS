// Documents that Preview can open. Files live under /public/documents and are
// served as static assets. Only documents listed here can be opened: the viewer
// never accepts arbitrary paths or URLs.

export interface PortfolioDocument {
  /** Stable identifier used by the virtual file system, Spotlight, Terminal and Preview windows. */
  id: string;
  /** Name shown in Preview's toolbar. */
  title: string;
  /** Name used when downloading. */
  filename: string;
  /** Static asset path under /documents. The file must be added to /public/documents. */
  src: string;
  mimeType: "application/pdf";
  description?: string;
  /** Defaults to true. */
  downloadable?: boolean;
  /**
   * Whether the file is approved and present for visitors. Defaults to true. While false the document does not
   * appear in Finder, on the Desktop, in Spotlight or in Terminal, so nobody is led to a file that is not there.
   */
  published?: boolean;
  /** Extra Spotlight search terms (the title and filename are always searchable). */
  keywords?: readonly string[];
}

// The resume is a privacy-trimmed PDF generated from the profile (npm run resume; scripts/resume-data.ts and
// scripts/render-resume.swift). The developer's original CV also holds personal identity and contact details and a photo;
// it is deliberately NOT published. The public résumé carries the same professional content without them.
export const documents: readonly PortfolioDocument[] = [
  {
    id: "resume",
    title: "Resume",
    filename: "Resume.pdf",
    src: "/documents/Resume.pdf",
    mimeType: "application/pdf",
    downloadable: true,
    keywords: ["resume", "cv", "curriculum vitae"],
  },
];

export const isPublished = (d: PortfolioDocument) => d.published !== false;

/** Only same-origin PDFs under /documents; no traversal, schemes or hosts. */
export function isSafeDocumentPath(src: string): boolean {
  return /^\/documents\/[A-Za-z0-9._ -]+\.pdf$/i.test(src) && !src.includes("..");
}

if (process.env.NODE_ENV !== "production") {
  const seen = new Set<string>();
  for (const d of documents) {
    if (seen.has(d.id)) throw new Error(`Duplicate document id "${d.id}".`);
    seen.add(d.id);
    if (!isSafeDocumentPath(d.src)) throw new Error(`Document "${d.id}" has an unsafe path "${d.src}".`);
  }
}

const byId = new Map(documents.map((d) => [d.id, d]));

export const getDocumentById = (id: string): PortfolioDocument | undefined => byId.get(id);
