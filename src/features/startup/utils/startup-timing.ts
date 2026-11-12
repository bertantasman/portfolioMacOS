/** Startup timings in milliseconds. Short on purpose: the sequence is an introduction, not a wait. */
export const startupTiming = {
  /** The boot screen stays at least this long so the animation reads as intentional. */
  bootMinimum: 1100,
  /** Reduce Motion: no animation to show, so only a brief hold. */
  bootMinimumReduced: 350,
  /** Boot waits for its milestones no longer than this, however slow they are. */
  bootMaximum: 2200,
  /** The Skip button appears after this delay. */
  skipDelay: 500,
  /** Lock screen fade-out and desktop reveal. */
  unlock: 550,
  fade: 350,
} as const;
