import type { EducationEntry, ExperienceEntry, SkillGroup } from "@/data/profile";
import { formatDateRange } from "./format";

/** One-line descriptions of the profile's files in Finder, shown in Get Info. The file text itself is `profileFileLines`. */
export const experienceSummary = (e: ExperienceEntry) => [e.role, formatDateRange(e.startDate, e.endDate, e.current)].filter(Boolean).join(" · ");
export const educationSummary = (e: EducationEntry) => [[e.degree, e.fieldOfStudy].filter(Boolean).join(", "), formatDateRange(e.startDate, e.graduationDate, e.current)].filter(Boolean).join(" · ");
export const skillGroupSummary = (g: SkillGroup) => g.skills.join(", ");
