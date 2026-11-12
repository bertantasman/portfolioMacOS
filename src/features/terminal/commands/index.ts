import type { Command } from "../types/terminal";
import { cat } from "./cat";
import { cd } from "./cd";
import { clear } from "./clear";
import { help } from "./help";
import { ls } from "./ls";
import { open } from "./open";
import { about, education, experience, skills } from "./profile-commands";
import { pwd } from "./pwd";
import { whoami } from "./whoami";

/** Every command that actually works, in the order `help` lists them. */
export const commands: readonly Command[] = [help, whoami, about, skills, experience, education, pwd, ls, cd, cat, clear, open];

const byName = new Map(commands.map((c) => [c.name, c]));
export const getCommand = (name: string) => byName.get(name);
