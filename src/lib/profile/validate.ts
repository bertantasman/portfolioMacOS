import { getDocumentById } from "@/data/documents";
import { profile, type DeveloperProfile } from "@/data/profile";
import { safeHttpUrl, safeMailto } from "@/lib/safe-url";
import { parseProfileDate } from "./format";

export interface ProfileIssue {
  path: string;
  message: string;
}

const AVATAR = /^\/[A-Za-z0-9._/-]+\.(?:png|jpe?g|webp|avif|svg)$/i;

/** Checks configuration the developer controls. Nothing here throws: bad optional data is reported and skipped. */
export function validateProfile(p: DeveloperProfile = profile, knownProjectIds?: ReadonlySet<string>): ProfileIssue[] {
  const issues: ProfileIssue[] = [];
  const add = (path: string, message: string) => issues.push({ path, message });
  const url = (path: string, value: string | undefined) => {
    if (value && !safeHttpUrl(value)) add(path, `"${value}" is not a valid http(s) URL.`);
  };
  const date = (path: string, value: string | undefined) => {
    if (value && !parseProfileDate(value)) add(path, `"${value}" is not a valid date (use YYYY, YYYY-MM or YYYY-MM-DD).`);
  };
  const unique = (name: string, ids: readonly string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) add(name, `Duplicate id "${id}".`);
      seen.add(id);
    }
  };
  const projects = (path: string, ids: readonly string[] | undefined) => {
    for (const id of ids ?? []) if (knownProjectIds && !knownProjectIds.has(id)) add(path, `Unknown project "${id}".`);
  };

  if (!p.displayName.trim()) add("displayName", "The name is empty.");
  if (p.email && !safeMailto(p.email)) add("email", `"${p.email}" is not a valid email address.`);
  url("website", p.website);
  if (p.avatar && !AVATAR.test(p.avatar)) add("avatar", `"${p.avatar}" should be an image path under /public, such as /images/profile.jpg.`);
  for (const [platform, value] of Object.entries(p.socialLinks)) url(`socialLinks.${platform}`, value);

  unique("education", p.education.map((e) => e.id));
  unique("experience", p.experience.map((e) => e.id));
  unique("certifications", p.certifications.map((c) => c.id));
  unique("languages", p.languages.map((l) => l.id));
  unique("skillGroups", p.skillGroups.map((g) => g.id));

  for (const e of p.education) {
    const at = `education.${e.id}`;
    date(`${at}.startDate`, e.startDate);
    date(`${at}.graduationDate`, e.graduationDate);
    url(`${at}.institutionUrl`, e.institutionUrl);
    projects(`${at}.projectIds`, e.projectIds);
  }
  for (const e of p.experience) {
    const at = `experience.${e.id}`;
    date(`${at}.startDate`, e.startDate);
    date(`${at}.endDate`, e.endDate);
    if (e.current && e.endDate) add(at, "A current position should not have an end date.");
    url(`${at}.organizationUrl`, e.organizationUrl);
    projects(`${at}.projectIds`, e.projectIds);
  }
  for (const c of p.certifications) {
    date(`certifications.${c.id}.issueDate`, c.issueDate);
    date(`certifications.${c.id}.expirationDate`, c.expirationDate);
    url(`certifications.${c.id}.credentialUrl`, c.credentialUrl);
  }

  const listed = new Set(p.skillGroups.flatMap((g) => g.skills));
  for (const skill of p.featuredSkills ?? []) if (!listed.has(skill)) add("featuredSkills", `"${skill}" is not listed in any skill group.`);
  for (const [skill, ids] of Object.entries(p.skillProjects ?? {})) {
    if (!listed.has(skill)) add("skillProjects", `"${skill}" is not listed in any skill group.`);
    projects(`skillProjects.${skill}`, ids);
  }

  if (p.closeProjectId && knownProjectIds && !knownProjectIds.has(p.closeProjectId)) add("closeProjectId", `Unknown project "${p.closeProjectId}".`);
  for (const [name, paragraphs] of [["story", p.story], ["drives", p.drives], ["beyondTheCode", p.beyondTheCode], ["whatsNext", p.whatsNext]] as const) {
    if (paragraphs?.some((x) => !x.trim())) add(name, "Contains an empty paragraph.");
    if (paragraphs && new Set(paragraphs).size !== paragraphs.length) add(name, "Contains a repeated paragraph.");
  }

  if (p.resume) {
    if (!getDocumentById(p.resume.documentId)) add("resume.documentId", `No document "${p.resume.documentId}" in data/documents.ts.`);
    date("resume.updatedAt", p.resume.updatedAt);
  }
  return issues;
}

/** What visitors can't see yet because it hasn't been provided. Developer-facing. */
export function getMissingProfileInfo(p: DeveloperProfile = profile, resumeFileFound?: boolean): string[] {
  const missing: string[] = [];
  if (!p.headline) missing.push("Professional headline");
  if (!p.shortBio && !p.bio) missing.push("Biography (shortBio / bio)");
  else if (!p.bio) missing.push("Full biography (bio) — the About page uses the short one");
  if (!p.location) missing.push("Location");
  if (!p.email) missing.push("Contact email");
  if (!p.avatar) missing.push("Profile image (initials are shown)");
  if (p.education.length === 0) missing.push("Education");
  if (p.experience.length === 0) missing.push("Professional experience");
  if (p.skillGroups.length === 0) missing.push("Skills");
  else if (!p.featuredSkills?.length) missing.push("Featured skills");
  for (const platform of ["github", "linkedin", "instagram"] as const) {
    if (!p.socialLinks[platform]) missing.push(`${platform[0].toUpperCase()}${platform.slice(1)} profile URL`);
  }
  if (resumeFileFound === false) missing.push("Resume file (public/documents/Resume.pdf)");
  return missing;
}
