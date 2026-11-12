/** The single source of truth for where the visitor is in the startup experience. */
export type StartupPhase =
  /** Before the client has read storage: what the server renders. */
  | "initializing"
  | "booting"
  | "locked"
  /** The lock screen is fading out; the desktop is revealed but not yet interactive. */
  | "unlocking"
  | "desktop";
