import { ALL_NOTES_ID, noteFolders, notes } from "@/data/notes";
import { profile, type DeveloperProfile } from "@/data/profile";
import { getProjectById, getRegistry, selectFeatured } from "@/lib/projects/registry";
import { useRepositoryStore } from "@/store/repository-store";
import { formatDateRange, formatProfileDate } from "@/lib/profile/format";
import { getCareerTimeline, getEducation, getExperience, getFullBio, getShortBio, getSkillGroups } from "@/lib/profile/selectors";
import { safeHttpUrl, safeMailto } from "@/lib/safe-url";
import type { Inline, NoteBlock, PortfolioNote } from "@/types/notes";

const text = (value: string, extra: Partial<Inline> = {}): Inline => ({ text: value, ...extra });
const para = (value: string): NoteBlock => ({ type: "paragraph", inline: [text(value)] });
const incomplete = (message: string): NoteBlock => ({ type: "incomplete", message });

const formatDate = formatProfileDate;
const dateRange = formatDateRange;

function aboutBlocks(p: DeveloperProfile): NoteBlock[] {
  const blocks: NoteBlock[] = [
    { type: "paragraph", inline: [text(p.fullName ?? p.displayName, { bold: true }), ...(p.headline ? [text(` — ${p.headline}`)] : [])] },
  ];
  const bio = getFullBio(p);
  const short = getShortBio(p);
  for (const paragraph of bio.length > 0 ? bio : short ? [short] : []) blocks.push(para(paragraph));
  const facts = [
    ...(p.location ? [{ label: "Location", value: [text(p.location)] }] : []),
    ...(p.currentFocus ? [{ label: "Current focus", value: [text(p.currentFocus)] }] : []),
  ];
  if (facts.length > 0) blocks.push({ type: "keyValue", rows: facts });
  if (p.languages.length > 0) {
    blocks.push({ type: "heading", text: "Languages" }, { type: "keyValue", rows: p.languages.map((l) => ({ label: l.language, value: [text(l.proficiency ?? "")] })) });
  }
  if (p.interests?.length) {
    blocks.push({ type: "heading", text: "Interests" }, { type: "list", items: p.interests.map((i) => [text(i)]) });
  }
  // The personal sections are the same paragraphs the About page shows (one source: the profile).
  if (p.beyondTheCode?.length) blocks.push({ type: "heading", text: "Beyond the Code" }, ...p.beyondTheCode.map(para));
  if (p.whatsNext?.length) blocks.push({ type: "heading", text: "What's Next" }, ...p.whatsNext.map(para));
  if (!short && !p.interests?.length && !p.currentFocus) {
    blocks.push(incomplete("A biography hasn't been added yet."));
  }
  return blocks;
}

/** "What Drives Me", the developer's approach to building products. */
function philosophyBlocks(p: DeveloperProfile): NoteBlock[] {
  if (!p.drives?.length) return [incomplete("A development philosophy hasn't been added yet.")];
  return p.drives.map(para);
}

function journeyBlocks(p: DeveloperProfile): NoteBlock[] {
  // "My Story" opens the note; the dated timeline (from the education and experience entries) follows it.
  const story: NoteBlock[] = p.story?.length ? [{ type: "heading", text: "My Story" }, ...p.story.map(para)] : [];
  const timeline = timelineBlocks(p);
  return timeline.length === 1 && timeline[0].type === "incomplete" ? (story.length ? story : timeline) : [...story, ...(story.length ? [{ type: "heading", text: "Timeline" } as NoteBlock] : []), ...timeline];
}

function timelineBlocks(p: DeveloperProfile): NoteBlock[] {
  // A hand-written timeline wins; otherwise the dated education and experience entries make one.
  if (p.journey.length === 0) {
    const derived = getCareerTimeline(p);
    if (derived.length === 0) return [incomplete("A development timeline hasn't been added yet.")];
    return derived.flatMap((m): NoteBlock[] => [{ type: "heading", text: formatDate(m.date) ?? m.date }, para(m.title)]);
  }
  return p.journey.flatMap((m): NoteBlock[] => [
    { type: "heading", text: m.title },
    ...(formatDate(m.date) ?? m.date ? [para((formatDate(m.date) ?? m.date)!)] : []),
    ...(m.description ? [para(m.description)] : []),
  ]);
}

function skillsBlocks(p: DeveloperProfile): NoteBlock[] {
  if (getSkillGroups(p).length === 0) return [incomplete("Skills haven't been added yet.")];
  return getSkillGroups(p).flatMap((g): NoteBlock[] => [
    { type: "heading", text: g.name },
    { type: "list", items: g.skills.map((s) => [text(s)]) },
  ]);
}

function toolsBlocks(p: DeveloperProfile): NoteBlock[] {
  const tools = p.skillGroups.find((g) => g.id === "developer-tools" || g.name === "Developer Tools");
  const used = [...new Set(getRegistry().projects.flatMap((pr) => pr.technologies ?? []))];
  const blocks: NoteBlock[] = [];
  if (tools?.skills.length) {
    blocks.push({ type: "heading", text: "Developer Tools" }, { type: "list", items: tools.skills.map((s) => [text(s)]) });
  }
  if (used.length) {
    blocks.push({ type: "heading", text: "Used in projects" }, { type: "list", items: used.map((s) => [text(s)]) });
  }
  return blocks.length > 0 ? blocks : [incomplete("Tools and technologies haven't been added yet.")];
}

function educationBlocks(p: DeveloperProfile): NoteBlock[] {
  if (p.education.length === 0) return [incomplete("Education details haven't been added yet.")];
  const entries = getEducation(p);
  const certifications: NoteBlock[] = p.certifications.length
    ? [
        { type: "heading", text: "Certifications" },
        { type: "list", items: p.certifications.map((c) => [text([c.name, c.issuer, formatDate(c.issueDate)].filter(Boolean).join(" · "))]) },
      ]
    : [];
  return [...entries.flatMap((e): NoteBlock[] => {
    const rows = [
      ...(e.degree ? [{ label: "Degree", value: [text(e.degree)] }] : []),
      ...(e.fieldOfStudy ? [{ label: "Field of study", value: [text(e.fieldOfStudy)] }] : []),
      ...(dateRange(e.startDate, e.graduationDate, e.current) ? [{ label: "Dates", value: [text(dateRange(e.startDate, e.graduationDate, e.current)!)] }] : []),
    ];
    return [
      { type: "heading", text: e.institution },
      ...(rows.length ? [{ type: "keyValue", rows } as NoteBlock] : []),
      ...(e.description ? [para(e.description)] : []),
      ...(e.highlights?.length ? [{ type: "list", items: e.highlights.map((h) => [text(h)]) } as NoteBlock] : []),
    ];
  }), ...certifications];
}

function experienceBlocks(p: DeveloperProfile): NoteBlock[] {
  if (p.experience.length === 0) return [incomplete("Professional experience hasn't been added yet.")];
  return getExperience(p).flatMap((e): NoteBlock[] => {
    const dates = dateRange(e.startDate, e.endDate, e.current);
    return [
      { type: "heading", text: e.organization },
      { type: "paragraph", inline: [text(e.role, { bold: true }), ...(dates ? [text(` · ${dates}`)] : [])] },
      ...(e.description ? [para(e.description)] : []),
      ...(e.responsibilities?.length ? [{ type: "list", items: e.responsibilities.map((r) => [text(r)]) } as NoteBlock] : []),
      ...(e.technologies?.length ? [{ type: "keyValue", rows: [{ label: "Technologies", value: [text(e.technologies.join(", "))] }] } as NoteBlock] : []),
    ];
  });
}

function projectBlocks(filter: PortfolioNote["projectFilter"]): NoteBlock[] {
  const registry = getRegistry();
  // "Featured" is the explicit featured configuration only; the widget's "recent work" fallback is not a featured claim.
  const featured = selectFeatured(registry, registry.projects.length);
  const list = filter === "featured" ? (featured.configured ? featured.projects : []) : registry.projects.filter((p) => p.status === "in-development");
  if (list.length === 0) {
    return [incomplete(filter === "featured" ? "No projects have been featured yet." : "No projects are currently in progress.")];
  }
  return list.map((p): NoteBlock => ({ type: "project", projectId: p.id }));
}

function contactBlocks(p: DeveloperProfile): NoteBlock[] {
  const link = (label: string, url: string | undefined, display: string | undefined) =>
    url && display ? [{ label, value: [text(display, { href: url })] }] : [];
  const rows = [
    ...link("Email", safeMailto(p.email), p.email),
    ...link("Website", safeHttpUrl(p.website), p.website),
    ...link("GitHub", safeHttpUrl(p.socialLinks.github), p.socialLinks.github),
    ...link("LinkedIn", safeHttpUrl(p.socialLinks.linkedin), p.socialLinks.linkedin),
    ...link("Instagram", safeHttpUrl(p.socialLinks.instagram), p.socialLinks.instagram),
  ];
  return rows.length > 0 ? [{ type: "keyValue", rows }] : [incomplete("No contact information has been added yet.")];
}

/** Builds a note's blocks from the central data. Pure; safe to cache. */
export function buildNoteBlocks(note: PortfolioNote): readonly NoteBlock[] {
  switch (note.contentType) {
    case "profile":
      return aboutBlocks(profile);
    case "journey":
      return journeyBlocks(profile);
    case "philosophy":
      return philosophyBlocks(profile);
    case "skills":
      return skillsBlocks(profile);
    case "tools":
      return toolsBlocks(profile);
    case "education":
      return educationBlocks(profile);
    case "experience":
      return experienceBlocks(profile);
    case "projects":
      return projectBlocks(note.projectFilter);
    case "contact":
      return contactBlocks(profile);
    case "static":
      return note.blocks && note.blocks.length > 0 ? note.blocks : [incomplete("This note hasn't been written yet.")];
  }
}

const inlineText = (inline: readonly Inline[]) => inline.map((i) => i.text).join("");

/** Plain text of the real content. Placeholder ("incomplete") blocks are excluded. */
export function blocksToSearchText(blocks: readonly NoteBlock[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case "heading":
        parts.push(b.text);
        break;
      case "paragraph":
        parts.push(inlineText(b.inline));
        break;
      case "list":
        b.items.forEach((item) => parts.push(inlineText(item)));
        break;
      case "keyValue":
        b.rows.forEach((r) => parts.push(r.label, inlineText(r.value)));
        break;
      case "project": {
        const project = getProjectById(b.projectId);
        if (project) parts.push(project.title, project.shortDescription, ...(project.technologies ?? []));
        break;
      }
      case "separator":
      case "incomplete":
        break;
    }
  }
  return parts.join(" ");
}

export interface NoteDocument {
  note: PortfolioNote;
  blocks: readonly NoteBlock[];
  /** Lower-cased title + content, for search. */
  haystack: string;
  /** Short plain-text preview; empty for notes with no real content yet. */
  preview: string;
  hasContent: boolean;
}

let cache: readonly NoteDocument[] | undefined;
let cacheKey: unknown;

/** Re-renders the caller when the project data that notes are derived from changes. */
export const useNoteSources = () => useRepositoryStore((s) => s.repositories);

/** All notes with their content, built once per set of repositories and reused. */
export function getNoteDocuments(): readonly NoteDocument[] {
  const key = useRepositoryStore.getState().repositories;
  if (cache && cacheKey === key) return cache;
  cacheKey = key;
  cache = notes.map((note): NoteDocument => {
    const blocks = buildNoteBlocks(note);
    const content = blocksToSearchText(blocks);
    return {
      note,
      blocks,
      haystack: `${note.title} ${content}`.toLowerCase(),
      preview: content.slice(0, 120),
      hasContent: content.length > 0,
    };
  }).filter((d) => d.hasContent); // A note with nothing to say yet is left out instead of showing "No content yet".
  return cache;
}

/** Pinned notes first; otherwise the declared order. Deterministic. */
export function sortDocuments(docs: readonly NoteDocument[]): NoteDocument[] {
  const order = new Map(notes.map((n, i) => [n.id, i]));
  return [...docs].sort(
    (a, b) =>
      Number(!!b.note.pinned) - Number(!!a.note.pinned) || order.get(a.note.id)! - order.get(b.note.id)!,
  );
}

export function getFolderDocuments(folderId: string): NoteDocument[] {
  const docs = getNoteDocuments().filter((d) => folderId === ALL_NOTES_ID || d.note.folderId === folderId);
  return sortDocuments(docs);
}

export function searchDocuments(query: string): NoteDocument[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return sortDocuments(getNoteDocuments().filter((d) => d.haystack.includes(q)));
}

export const getFolderName = (id: string) => noteFolders.find((f) => f.id === id)?.name ?? "Notes";
