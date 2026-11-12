import { aboutLines, educationLines, experienceLines, skillsLines } from "@/lib/profile/text";
import { line, type Command } from "../types/terminal";

const fromProfile = (name: string, description: string, lines: () => string[]): Command => ({
  name,
  description,
  run: () => ({ output: lines().map((text) => line(text)) }),
});

/** Read-only views of the central developer profile. */
export const about = fromProfile("about", "About the developer", aboutLines);
export const skills = fromProfile("skills", "List technical skills", skillsLines);
export const experience = fromProfile("experience", "Show professional experience", experienceLines);
export const education = fromProfile("education", "Show education", educationLines);
