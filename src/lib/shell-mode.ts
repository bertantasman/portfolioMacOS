/** Phones and small windows get the mobile shell; everything wider keeps the desktop. */
export const MOBILE_MAX_WIDTH = 767;
export const MOBILE_QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`;

export type ShellMode = "mobile" | "desktop";

/** The shell for a viewport width in CSS pixels. */
export const shellModeFor = (width: number): ShellMode => (width <= MOBILE_MAX_WIDTH ? "mobile" : "desktop");
