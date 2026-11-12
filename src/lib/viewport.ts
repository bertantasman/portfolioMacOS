// Phone: narrow, or a landscape phone (short and touch). Tablet: below laptop width.
export const COMPACT_QUERY = "(max-width: 639px), (max-height: 500px) and (pointer: coarse)";
export const TABLET_QUERY = "(max-width: 1023px)";

/** Whether the viewport is phone-sized right now. Read synchronously so layout changes and state agree. */
export const isCompactViewport = () => typeof window !== "undefined" && window.matchMedia(COMPACT_QUERY).matches;
