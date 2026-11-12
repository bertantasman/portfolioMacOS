import { profile, type DeveloperProfile, type EducationEntry, type ExperienceEntry } from "@/data/profile";
import { formatDateRange, formatProfileDate } from "./format";
import { getEducation, getExperience, getFullBio, getSkillGroups, getShortBio } from "./selectors";

/** Plain-text views of the profile for the Terminal. Empty sections say so instead of inventing content. */

export function aboutLines(p: DeveloperProfile = profile): string[] {
  const lines = [(p.fullName ?? p.displayName) + (p.headline ? ` — ${p.headline}` : "")];
  const bio = getFullBio(p);
  const short = getShortBio(p);
  for (const paragraph of bio.length > 0 ? bio : short ? [short] : []) lines.push("", paragraph);
  if (p.location) lines.push("", `Location: ${p.location}`);
  if (p.currentFocus) lines.push(`Current focus: ${p.currentFocus}`);
  if (lines.length === 1 && !p.headline) lines.push("", "A biography hasn't been added yet.");
  else if (bio.length === 0 && !short) lines.push("", "A biography hasn't been added yet.");
  return lines;
}

export function skillsLines(p: DeveloperProfile = profile): string[] {
  const groups = getSkillGroups(p);
  if (groups.length === 0) return ["Skills haven't been added yet."];
  return groups.flatMap((g) => [`${g.name}:`, `  ${g.skills.join(", ")}`]);
}

const experienceEntryLines = (e: ExperienceEntry): string[] => {
  const dates = formatDateRange(e.startDate, e.endDate, e.current);
  return [
    `${e.role} — ${e.organization}`,
    ...(dates ? [`  ${dates}`] : []),
    ...(e.technologies?.length ? [`  Technologies: ${e.technologies.join(", ")}`] : []),
    ...(e.description ? [`  ${e.description}`] : []),
    ...(e.responsibilities ?? []).map((r) => `  - ${r}`),
  ];
};

const educationEntryLines = (e: EducationEntry): string[] => {
  const dates = formatDateRange(e.startDate, e.graduationDate, e.current);
  const study = [e.degree, e.fieldOfStudy].filter(Boolean).join(", ");
  return [e.institution, ...(study ? [`  ${study}`] : []), ...(dates ? [`  ${dates}`] : []), ...(e.description ? [`  ${e.description}`] : []), ...(e.highlights ?? []).map((h) => `  - ${h}`)];
};

const joinEntries = (entries: string[][]) => entries.flatMap((lines, i) => (i > 0 ? ["", ...lines] : lines));

export function experienceLines(p: DeveloperProfile = profile): string[] {
  const entries = getExperience(p);
  return entries.length === 0 ? ["Professional experience hasn't been added yet."] : joinEntries(entries.map(experienceEntryLines));
}

export function educationLines(p: DeveloperProfile = profile): string[] {
  const entries = getEducation(p);
  return entries.length === 0 ? ["Education details haven't been added yet."] : joinEntries(entries.map(educationEntryLines));
}

/** The text of one profile document in the virtual file system ("experience:<id>", "education:<id>", "skills:<id>"). */
export function profileFileLines(fileId: string, p: DeveloperProfile = profile): string[] | undefined {
  const [kind, id] = [fileId.slice(0, fileId.indexOf(":")), fileId.slice(fileId.indexOf(":") + 1)];
  if (kind === "experience") {
    const e = p.experience.find((x) => x.id === id);
    return e && experienceEntryLines(e);
  }
  if (kind === "education") {
    const e = p.education.find((x) => x.id === id);
    return e && educationEntryLines(e);
  }
  if (kind === "skills") {
    const g = p.skillGroups.find((x) => x.id === id);
    return g && [`${g.name}:`, `  ${g.skills.join(", ")}`];
  }
  return undefined;
}

export const certificationLine = (c: DeveloperProfile["certifications"][number]) =>
  [c.name, c.issuer, formatProfileDate(c.issueDate)].filter(Boolean).join(" · ");
