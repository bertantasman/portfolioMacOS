/** Virtual pages that exist only inside Safari; not real URLs or OS protocols. */
export const safariRoutes = {
  start: { title: "Start Page" },
  about: { title: "About Me" },
  projects: { title: "Projects" },
  contact: { title: "Contact" },
} as const;

export type SafariRoute = keyof typeof safariRoutes;

export const safariRouteIds = Object.keys(safariRoutes) as SafariRoute[];

export const INTERNAL_SCHEME = "portfolio://";

export const routeAddress = (route: SafariRoute) => `${INTERNAL_SCHEME}${route}`;
export const routeTitle = (route: SafariRoute) => safariRoutes[route].title;

export function isSafariRoute(value: string): value is SafariRoute {
  return Object.hasOwn(safariRoutes, value);
}

/** "portfolio://about" (any case, optional trailing slash) → "about"; otherwise null. */
export function parseInternalAddress(input: string): SafariRoute | null {
  const lower = input.trim().toLowerCase();
  if (!lower.startsWith(INTERNAL_SCHEME)) return null;
  const route = lower.slice(INTERNAL_SCHEME.length).replace(/\/+$/, "");
  return isSafariRoute(route) ? route : null;
}
