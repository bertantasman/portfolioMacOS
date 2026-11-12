# Production readiness report

Date: 2026-10-26. Everything below was run or observed in this stage; nothing is estimated. The site has **not** been deployed.

## 1. Project overview
Next.js 16.4.3 (App Router, Turbopack), React 19.3, TypeScript, Tailwind 4, Zustand, Motion. npm with `package-lock.json`. One page (`/`) that is statically prerendered, four dynamic route handlers (`/api/contact`, `/api/github/repositories`, `/api/github/profile`, `/api/github/readme`) and `/robots.txt`. No middleware, no authentication, no database. No hosting configuration existed (no `vercel.json`, Dockerfile or CI), and the folder is not a git repository.

## 2. Current production readiness: **Ready with minor issues**
Technically ready: all checks pass, no secrets or private data are exposed, and no critical or high-severity technical defect remains. One decision is still open before a public launch: there is no public resume (a content decision, not a defect). Severity of the issues carried over from the content audit:

| Severity | Issue | Needs |
| --- | --- | --- |
| High | No public resume (hidden everywhere until approved) | Developer approval of a redacted PDF |
| ~~High~~ | ~~Surname spelling and display name~~ Resolved 2026-11-12: "Bertan Taşman" everywhere | Done |
| Medium | No featured projects chosen | Developer decision |
| Medium | Contact form cannot send (email variables not set) | Configuration on the host |
| Medium | Three private curated projects unverified; no screenshots | Developer content |
| Low | GitHub bio outdated; "just started a Master's" wording will age; published CV site lists a phone number | Developer |

**Baseline at the start of this stage:** typecheck, lint, 106 tests and the build all passed; no known runtime errors; missing: security headers, robots, social/Open Graph metadata, `typecheck` script, any deployment documentation. Everything fixed here was introduced earlier or missing, not caused by this stage, except the one regression described under Accessibility (introduced and fixed within this stage).

## 3. Security findings
- **Secrets.** None in the repository or in `.next/static` (scanned for the variable names, `Bearer`, provider URLs and key patterns). Env files are git-ignored. Secrets are read in exactly two server modules. No `NEXT_PUBLIC_` variable exists.
- **Dependencies.** `npm audit`: 0 vulnerabilities. No upgrades were needed or made.
- **API routes.** `/api/contact`: same-origin check, 20 KB body limit, per-client rate limit, key allow-list, honeypot, plain-text email, recipient fixed by configuration, the provider key and visitor text never logged, 503 with `success: false` when unconfigured (verified: no false success). `/api/github/readme`: repository name validated and restricted to the account's own repositories. GitHub requests use a fixed host and an allow-listed path set.
- **HTML and links.** The only raw HTML is the static theme script and (new) the schema.org data with `<` escaped. All external links use `noopener noreferrer`; unsafe URL schemes are rejected.
- **Private information.** No PDF exists in the project; source, docs and the production build output were scanned for the CV's private details (none found); a test fails if any appear.
- **Added: security headers** (`X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy: frame-ancestors 'none'`, `X-Frame-Options`, `Permissions-Policy`), verified on the production server.
- **Not added, deliberately:** a full CSP (the page needs inline scripts and styles; it would require nonces and dynamic rendering) and HSTS (the host provides it).
- **Third-party request:** the optional weather widget calls Open-Meteo from the visitor's browser, only if the visitor adds that widget and types a city. No key, no location permission.

## 4. Performance findings (production server, local, Chromium; no network throttling)
- **Cold first request after server start:** FCP 1.98 s, LCP 2.09 s (single measurement). **Warm / fresh visitor (three runs):** FCP 60-88 ms, LCP 88-100 ms, CLS 0.
- **Payload:** the HTML references 12 JS files, 297 KB gzip (936 KB raw); CSS 109 KB; HTML 52 KB; `public/` is 460 KB (wallpapers of 79-99 KB each, plus icons). 32 JS files (381 KB transferred) are loaded in total because applications and overlays are preloaded when the page is idle; they are not in the first paint path.
- **Requests:** one `/api/github/repositories` call at load; `/api/github/profile` only when the GitHub app opens; the README only when a project opens. With five apps open: exactly one request each, no duplicates.
- **Memory:** 6.6 MB JS heap after load.
- **Not measured:** Lighthouse (no tool available), INP, and any real-network or mobile-CPU timing. These numbers should not be read as Lighthouse scores.
- **Already in place from earlier stages:** on-demand loading of applications and overlays (about 21% smaller first load), the PDF engine loaded only by Preview, shared GitHub caching.

## 5. Responsive testing (production build, same windows open throughout)
| Width | Result |
| --- | --- |
| 1440 x 900 | Dock fits; all 5 open windows inside the viewport; no horizontal overflow |
| 1280 x 800 | Used for most desktop tests; no problems |
| 1024 x 768 | No page overflow; Dock fits. Two windows extend past the right edge: the window manager only guarantees the title bar stays reachable (design from an earlier stage); not changed |
| 820 x 1180 | Windows reflow into the viewport; Dock fits; no overflow |
| 375 x 812 | One full-screen window; 36 px Close button (44 px hit area); Dock fits (smallest icon 38 px); no overflow |
Touch-device testing was emulation only (mouse input), not a physical device. Tablet text readability and project cards at 820 px were checked structurally, not visually in detail.

## 6. Accessibility findings
- **Fixed in this stage:** the new invisible SEO summary initially contained links, which made four invisible Tab stops before the desktop (and Enter on one navigated the tab to GitHub). They were removed (the summary now has no focusable elements; links are given as structured data) and a test prevents a repeat. This probably also explains an unexplained tab navigation to github.com seen during testing; I could not otherwise reproduce it, so this is likely rather than proven.
- **Verified:** keyboard path lock screen to welcome to desktop to menu bar to Dock; Enter launches apps and focus moves into the window; welcome dialog traps focus and restores focus; an automated scan of Finder, Safari, GitHub, LinkedIn, Instagram, Notes and Mail found no unnamed controls, no images without alt text, and all new-tab links labelled.
- **Not verified:** a screen reader; reduced-motion in this stage (implemented earlier); measured colour contrast (dark mode viewed once on LinkedIn, text readable, not measured).

## 7. SEO status
Present and verified in the served HTML: accurate `<title>` and description (name and role from the profile), `robots` index/follow, Open Graph (`website`, title, description, locale), Twitter `summary`, a server-rendered text version of the portfolio (name, role, biography, education, experience, skills, public projects, contact) and a schema.org `Person` block. `robots.txt` allows `/` and disallows `/api/`. **Deliberately absent:** canonical URL and absolute Open Graph URLs (set `SITE_URL` once the domain is decided; nothing is guessed), a social preview image (no approved image exists), and a sitemap (one page). Hidden and forked repositories do not appear in the summary.

## 8. Functional testing (production build unless noted)
- **Passed:** lock screen and first visit; welcome (dismiss, persistence); desktop identity widget; Dock launching; windows (open, focus, resize between widths); Finder navigation to projects; Safari About, Projects and Contact; GitHub (profile, repositories, filters, statistics, one request each); LinkedIn and Instagram (real links, no fabricated content); Project Viewer (including README on demand); Notes; Terminal (earlier in the dev server, this stage: keyboard launch only); Spotlight (name, project, technology, LinkedIn); contact API (503 `success: false`).
- **Failed / not possible:** Resume: not testable, no public file exists. Contact form actually sending: not testable without provider credentials.
- **Not tested in this stage:** Photos, Preview with a PDF, Launchpad, Mission Control, Control Center, System Settings, drag/snap interactions (all tested in earlier stages).

## 9. Build results
| Check | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm test` | 107 of 107 passed |
| `npm run build` | passed (9 pages/routes generated) |
| `npm start` | served `/`, `/robots.txt` with the expected headers |
| `npm audit` | 0 vulnerabilities |

## 10. Deployment recommendation
Vercel (Hobby), from a git repository, with the environment variables in `docs/DEPLOYMENT_GUIDE.md`; preview deployment first, domain and `SITE_URL` afterwards. Reasoning and alternatives are in the guide. **Do not deploy until the developer approves.**

## 11. Remaining blockers and decisions
1. Public resume: approve a redacted PDF, or launch without one.
2. Surname spelling and display name.
3. Featured projects.
4. Whether to configure the contact form (email provider) before launch.
5. Create the git repository and choose the host account.
6. Domain decision.
7. Run Lighthouse on the preview deployment.

## 12. Files modified in this stage
New: `src/app/robots.ts`, `src/lib/site-url.ts`, `src/components/seo/portfolio-summary.tsx`, `docs/DEPLOYMENT_GUIDE.md`, `docs/PRODUCTION_RELEASE_CHECKLIST.md`, `docs/PRODUCTION_READINESS.md`.
Edited: `next.config.ts` (security headers), `package.json` (`typecheck` script, `engines`), `.env.example` (`SITE_URL`), `src/app/layout.tsx` (metadata), `src/app/page.tsx`, `tests/profile-cv.test.ts`.

## 13. Release checklist status
See `docs/PRODUCTION_RELEASE_CHECKLIST.md`. Open items: resume, surname and display name, featured projects, contact configuration, git repository, domain, deployment approval, Lighthouse.
