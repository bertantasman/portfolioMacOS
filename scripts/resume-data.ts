// Prints the public résumé's content as JSON, built only from the profile and project registries so the PDF can never say
// more than the site does. It deliberately has none of the personal identity or contact details (or the photo) that the
// developer's original CV contains, and that CV must not be published. Rendered by scripts/render-resume.swift.
import { profile } from "../src/data/profile";
import { getRegistry } from "../src/lib/projects/registry";
import { getEducation, getExperience, getShortBio, getSkillGroups } from "../src/lib/profile/selectors";
import { formatDateRange } from "../src/lib/profile/format";
import { siteConfig } from "../src/config/site";

const registry = getRegistry();
const statusNote: Record<string, string> = {
  courtrise: "Published on the App Store",
  geoattend: "Active development",
  linemaster: "Playable prototype",
  bugunluk: "In development, not publicly released",
};
const projects = ["courtrise", "geoattend", "linemaster", "bugunluk"].flatMap((id) => {
  const p = registry.byId.get(id);
  if (!p) return [];
  return [{ name: p.title, status: statusNote[id], text: p.shortDescription, url: p.content?.links?.appStore }];
});

const data = {
  name: profile.fullName ?? profile.displayName,
  headline: profile.headline,
  contact: [profile.location, profile.email, siteConfig.profiles.github.replace(/^https:\/\//, ""), decodeURIComponent(siteConfig.profiles.linkedin).replace(/^https:\/\/(www\.)?/, "")].filter(Boolean),
  summary: getShortBio(),
  experience: getExperience().map((e) => ({
    org: e.organization,
    role: e.role,
    dates: formatDateRange(e.startDate, e.endDate, e.current),
    location: e.location,
    bullets: e.responsibilities ?? [],
  })),
  education: getEducation().map((e) => ({
    institution: e.institution,
    degree: [e.degree, e.fieldOfStudy].filter(Boolean).join(", "),
    dates: formatDateRange(e.startDate, e.graduationDate, e.current),
    location: e.location,
    note: e.description,
  })),
  projects,
  skills: getSkillGroups().map((g) => ({ name: g.name, items: g.skills.join(", ") })),
  languages: profile.languages.map((l) => `${l.language}${l.proficiency ? `: ${l.proficiency}` : ""}`),
};
console.log(JSON.stringify(data, null, 2));
