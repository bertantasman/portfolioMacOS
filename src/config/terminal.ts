import { profile } from "@/data/profile";

export const terminalConfig = {
  username: "bertan",
  hostname: "macbook",
  shell: "zsh",
  /** Shown by `whoami`. */
  displayName: profile.displayName,
  /** The formal name `whoami` shows, when the profile has one. */
  fullName: profile.fullName,
  role: profile.headline ?? "",
  /** Cosmetic prefix for `pwd`; the virtual root is the home directory. */
  homePath: "/Users/bertan",
} as const;
