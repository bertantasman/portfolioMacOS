import { profile, type DeveloperProfile, type EducationEntry, type ExperienceEntry, type SkillGroup } from "@/data/profile";
import { safeHttpUrl, safeMailto } from "@/lib/safe-url";
import { parseProfileDate, sortNewestFirst } from "./format";

/** Paragraphs of a blank-line separated text. */
export const paragraphsOf = (text: string | undefined): string[] =>
  (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export const getFullBio = (p: DeveloperProfile = profile) => paragraphsOf(p.bio);

/** The configured short biography, else the first paragraph of the full one. Never generated. */
export function getShortBio(p: DeveloperProfile = profile): string | undefined {
  return p.shortBio?.trim() || getFullBio(p)[0];
}

export const getEducation = (p: DeveloperProfile = profile): EducationEntry[] => sortNewestFirst(p.education);
export const getExperience = (p: DeveloperProfile = profile): ExperienceEntry[] => sortNewestFirst(p.experience);
export const getSkillGroups = (p: DeveloperProfile = profile): SkillGroup[] => p.skillGroups.filter((g) => g.skills.length > 0);

/** Featured skills that are really listed in a group, in the configured order. */
export function getFeaturedSkills(p: DeveloperProfile = profile): string[] {
  const known = new Set(p.skillGroups.flatMap((g) => g.skills));
  return (p.featuredSkills ?? []).filter((s) => known.has(s));
}

export const getSkillProjectIds = (skill: string, p: DeveloperProfile = profile): readonly string[] => p.skillProjects?.[skill] ?? [];

export type AboutSectionId = "introduction" | "story" | "drives" | "closeProject" | "beyond" | "next" | "education" | "experience" | "skills" | "work" | "projects" | "resume" | "contact";

export const ABOUT_SECTION_LABELS: Record<AboutSectionId, string> = {
  introduction: "About Me",
  story: "My Story",
  drives: "What Drives Me",
  closeProject: "A Project Close to Me",
  beyond: "Beyond the Code",
  next: "What's Next",
  education: "Education",
  experience: "Professional Experience",
  skills: "Technical Skills",
  work: "Work at a Glance",
  projects: "Featured Projects",
  resume: "Resume",
  contact: "Contact",
};

export function isAboutSection(value: string): value is AboutSectionId {
  return Object.hasOwn(ABOUT_SECTION_LABELS, value);
}

export interface ContactChannel {
  label: string;
  url: string;
  text: string;
}

/** Valid, visitor-facing contact links only. Anything missing or malformed is left out. */
export function getContactChannels(p: DeveloperProfile = profile): ContactChannel[] {
  const out: ContactChannel[] = [];
  const mail = safeMailto(p.email);
  if (mail && p.email) out.push({ label: "Email", url: mail, text: p.email });
  const web = safeHttpUrl(p.website);
  if (web) out.push({ label: "Website", url: web, text: web.replace(/^https?:\/\//, "").replace(/\/$/, "") });
  return out;
}

export interface CareerMilestone {
  /** ISO date, as written in the profile. */
  date: string;
  title: string;
}

/**
 * Dated moments from the education and experience entries, oldest first. Nothing is added: every milestone is a
 * start or an end date that the profile already records, so it can never disagree with those sections.
 */
export function getCareerTimeline(p: DeveloperProfile = profile): CareerMilestone[] {
  const out: CareerMilestone[] = [];
  for (const e of p.education) {
    const what = [e.degree, e.fieldOfStudy && !/in\s/i.test(e.degree ?? "") ? e.fieldOfStudy : undefined].filter(Boolean).join(", ") || "studies";
    if (e.startDate && parseProfileDate(e.startDate)) out.push({ date: e.startDate, title: `Began ${what} at ${e.institution}` });
    if (e.graduationDate && parseProfileDate(e.graduationDate)) out.push({ date: e.graduationDate, title: `Completed ${what} at ${e.institution}` });
  }
  for (const e of p.experience) {
    if (e.startDate && parseProfileDate(e.startDate)) out.push({ date: e.startDate, title: `Began as ${e.role} at ${e.organization}` });
    if (e.endDate && parseProfileDate(e.endDate)) out.push({ date: e.endDate, title: `Finished as ${e.role} at ${e.organization}` });
  }
  return out.sort((a, b) => parseProfileDate(a.date)!.sort - parseProfileDate(b.date)!.sort);
}
