import {
  INTERNAL_SCHEME,
  parseInternalAddress,
  safariRouteIds,
  type SafariRoute,
} from "../config/safari-routes";

export type AddressResolution =
  | { kind: "empty" }
  | { kind: "internal"; route: SafariRoute }
  | { kind: "external"; url: string }
  | { kind: "search"; query: string }
  | { kind: "invalid"; message: string };

const SCHEME_WITH_SLASHES = /^([a-z][a-z0-9+.-]*):\/\//i;
const OPAQUE_SCHEMES = /^(javascript|data|file|vbscript|blob|about|mailto|tel):/i;
const HOSTNAME = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d+)?(?:[/?#]\S*)?$/i;

/**
 * Returns a normalised URL only for https addresses with a host and no
 * embedded credentials. Everything else (http, javascript:, data:, file:, …) is rejected.
 */
export function parseExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname) return null;
    if (url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

/** Opens a validated https URL in a new browser tab. Returns false if rejected. */
export function openExternal(url: string): boolean {
  const safe = parseExternalUrl(url);
  if (!safe) return false;
  window.open(safe, "_blank", "noopener,noreferrer");
  return true;
}

export const searchUrl = (query: string) =>
  `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;

/** Classifies typed input. Pure; never navigates or sends anything anywhere. */
export function resolveAddress(input: string): AddressResolution {
  const text = input.trim();
  if (!text) return { kind: "empty" };

  const route = parseInternalAddress(text);
  if (route) return { kind: "internal", route };
  if (text.toLowerCase().startsWith(INTERNAL_SCHEME)) {
    return {
      kind: "invalid",
      message: `Unknown page. Try ${safariRouteIds.map((r) => INTERNAL_SCHEME + r).join(", ")}.`,
    };
  }

  const hasSpace = /\s/.test(text);
  if (!hasSpace) {
    const slashScheme = SCHEME_WITH_SLASHES.exec(text);
    if (slashScheme) {
      if (slashScheme[1].toLowerCase() === "https") {
        const url = parseExternalUrl(text);
        return url
          ? { kind: "external", url }
          : { kind: "invalid", message: "That web address isn't valid." };
      }
      return { kind: "invalid", message: "Only secure https:// addresses can be opened." };
    }
    if (OPAQUE_SCHEMES.test(text)) {
      return { kind: "invalid", message: "That kind of address isn't supported." };
    }
    if (HOSTNAME.test(text)) {
      const url = parseExternalUrl(`https://${text}`);
      if (url) return { kind: "external", url };
    }
  }
  return { kind: "search", query: text };
}
