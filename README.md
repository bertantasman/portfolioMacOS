# Bertan Taşman — macOS Portfolio

An interactive, macOS-inspired desktop portfolio for a mobile application developer. Instead of a scrolling page, visitors get a small operating system: a boot and lock screen, a menu bar, a Dock, draggable windows and real "apps" that show projects, background and contact details. On a phone, windows open full screen and the same apps still work.

Built with **Next.js (App Router), React, TypeScript (strict), Tailwind CSS, Motion, Zustand and Lucide**.

> The site has not been deployed yet. See [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) and [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md).

## Contents

- [What visitors can do](#what-visitors-can-do)
- [Featured projects](#featured-projects)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Updating the content](#updating-the-content)
- [Quality, privacy and security](#quality-privacy-and-security)
- [Documentation](#documentation)
- [Status](#status)

## What visitors can do

**The desktop**

- Start from a boot animation and a lock screen, then enter a desktop with wallpaper, widgets, desktop icons and a Dock.
- Open several windows at once: move, resize, minimize, maximize and snap them to the screen halves. Mission Control shows all open windows, Launchpad shows all apps.
- Use Spotlight to search projects, files, notes and apps, and the Control Center for quick settings.
- See notifications, and add or remove widgets (clock, calendar, projects, contact, weather and quick settings).
- On narrow screens the layout switches to a compact mode where each window fills the screen.

**The apps**

| App | What it shows |
| --- | --- |
| Finder | A virtual file system: Documents (Projects, Education, Experience, Skills, Resume), Desktop, Pictures. |
| Project Viewer | A case study per project: overview, role, architecture, screenshots, links and status. |
| Safari | Internal pages: start page, About (story, education, experience, skills), Projects, Contact. |
| Notes | The profile written as notes: About Me, Skills, Education, Experience, Projects, Contact. |
| Photos | The screenshot library, grouped by project. |
| Preview | Opens the résumé PDF. |
| Terminal | A small shell on the virtual file system: `help`, `ls`, `cd`, `pwd`, `cat`, `open`, `clear`, `whoami`, plus profile commands such as `about`, `skills`, `experience` and `education`. |
| Mail | A contact form, with a `mailto:` fallback. |
| GitHub | The public repositories, loaded live from GitHub, with search, filters and developer statistics (counted from verified project data). |
| LinkedIn, Instagram | Profile cards that link to the real profiles. |
| System Settings | Appearance, wallpaper, Dock, notifications, sound, accessibility and an About page. |
| Get Info | Details for any file or project. |

## Featured projects

The portfolio presents these as full case studies. Their facts come from the developer and from reading the projects' own documentation and source; claims that could not be verified are left out or marked as such.

- **CourtRise**: a native iOS basketball training app, published on the App Store. Adaptive training targets, XP and attributes, Firebase, StoreKit 2, English and Turkish.
- **BuGunluk**: a two-sided job platform for students and employers, built with a small team. Native iOS and Firebase; in development.
- **GeoAttend**: a cross-platform event and attendance system with native iOS and Android apps and a Firebase backend, with server-side location verification. In development.
- **LineMaster**: a physics-based arcade game for iOS and Android. A playable prototype.

The public GitHub repositories (for example TaskFlow and GestureDeck) appear in Finder, Safari and the GitHub app next to them.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Animation | Motion for React |
| State | Zustand (one store per concern) |
| Icons | Lucide React |
| PDF | pdf.js, loaded only when Preview opens |
| Tests | Node's built-in test runner |

## Getting started

You need Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. No configuration is required: the contact form falls back to `mailto:` and GitHub is read anonymously.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests |
| `npm run audit` | Content audit: missing media, documents and bad links (`-- --github` adds live repositories) |
| `npm run stats-report` | Regenerates `docs/DEVELOPER_STATISTICS.md` |
| `npm run resume` | Regenerates `public/documents/Resume.pdf` (macOS only, needs the Swift toolchain) |

## Configuration

Everything is optional. Copy `.env.example` to `.env.local` to enable more.

| Variable | Purpose |
| --- | --- |
| `CONTACT_RECIPIENT_EMAIL`, `EMAIL_FROM_ADDRESS`, `RESEND_API_KEY` | Direct email delivery from the contact form (all three are needed). Without them, Mail offers drafts, copy and `mailto:`. |
| `GITHUB_USERNAME` | The account whose public repositories are shown. Falls back to the GitHub URL in `src/config/site.ts`. |
| `GITHUB_TOKEN` | Raises GitHub's rate limit from 60 to 5,000 requests per hour. Read only on the server. |
| `SITE_URL` | The public address, used for canonical and social metadata. |

Secrets are only ever read in server route handlers and are never sent to the browser.

## Project structure

```
src/
  app/            Next.js route, layout, metadata, API routes (/api/contact, /api/github/*)
  components/     Desktop shell: menu bar, Dock, windows, app loading, SEO summary
  config/         Site settings, application definitions, display locale
  data/           The content: profile, projects, media, documents, notes, file system
  features/       One folder per app or overlay (finder, safari, notes, terminal, ...)
  lib/            Pure logic: profile, project registry, GitHub client, virtual file system, window geometry
  store/          Zustand stores (windows, desktop, settings, notifications, ...)
  types/          Shared types
scripts/          Audit, statistics and résumé tooling, test loader hooks
tests/            Unit tests
docs/             Case-study notes, audits and reports
public/           Icons, wallpapers, project images, the résumé PDF
```

## How it works

- **One source of truth per kind of content.** The profile lives in `src/data/profile.ts`; Safari, Notes, Finder, Terminal, Spotlight and the résumé all read it, so nothing is written twice. See [`docs/data-architecture.md`](docs/data-architecture.md).
- **A unified project registry.** Hand-written projects (`src/data/projects.ts` and `src/data/project-content/`) and live GitHub repositories are merged into one list, with stable ids, so Finder, Safari, Spotlight and the Project Viewer always agree.
- **GitHub through the server.** `/api/github/*` routes allow-list what they fetch, cache for an hour and fall back to the last good data. Only public repositories are listed.
- **A window manager.** Window position, size, snapping and focus live in one store. Apps are loaded on demand, so the first load stays small.
- **A virtual file system.** Finder, Terminal and Spotlight share one tree. Folders and files are references to projects, media, documents and profile entries, not copies.
- **Accessible by design.** Keyboard navigation, visible focus, reduced-motion support and readable contrast. A text summary of the portfolio is rendered on the server for search engines and screen readers.

## Updating the content

| To change | Edit |
| --- | --- |
| Bio, education, experience, skills, links | `src/data/profile.ts` (social URLs in `src/config/site.ts`) |
| Add a hand-written project | `src/data/projects.ts`, then its narrative in `src/data/project-content/curated.ts` |
| Choose and order featured projects | `src/data/project-content/featured.ts` |
| Add a screenshot | Put the image in `public/images/<project>/`, then list it in `src/data/media.ts` with alt text |
| Hide, rename or recategorize a GitHub repository | `src/data/github-overrides.ts` |
| Update the résumé | Change the profile, then run `npm run resume` |

Run `npm run audit` and `npm test` afterwards. They catch missing files, broken links and content mistakes.

## Quality, privacy and security

- **Tests** cover the profile and project data, the registry, the GitHub client, the virtual file system, the window logic and every case study. They also enforce content rules, for example that no case study states downloads, revenue or other results that cannot be verified.
- **Privacy.** The developer's original CV is not in this repository. The public résumé is generated from the profile and carries professional content only. Tests fail if another PDF, a phone number, a birth detail or a street address appears in the source, the docs or the public assets.
- **Security.** The contact route checks the origin, limits body size and request rate, uses an allow-list of fields and a honeypot, and sends plain text to a fixed recipient. The site sends security headers (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame protection). External links use `rel="noopener noreferrer"`.
- **Private projects.** Where a project's source repository is private, no link is published.

## Documentation

| Document | Topic |
| --- | --- |
| [`docs/data-architecture.md`](docs/data-architecture.md) | Where every piece of content lives |
| [`docs/COURTRISE_CASE_STUDY.md`](docs/COURTRISE_CASE_STUDY.md) | CourtRise |
| [`docs/BUGUNLUK_CASE_STUDY.md`](docs/BUGUNLUK_CASE_STUDY.md), [`docs/BUGUNLUK_PERSONAL_CONTRIBUTIONS.md`](docs/BUGUNLUK_PERSONAL_CONTRIBUTIONS.md) | BuGunluk |
| [`docs/GEOATTEND_CASE_STUDY.md`](docs/GEOATTEND_CASE_STUDY.md) | GeoAttend |
| [`docs/LINEMASTER_CASE_STUDY.md`](docs/LINEMASTER_CASE_STUDY.md) | LineMaster |
| [`docs/GITHUB_PROJECT_ANALYSIS.md`](docs/GITHUB_PROJECT_ANALYSIS.md), [`docs/DEVELOPER_STATISTICS.md`](docs/DEVELOPER_STATISTICS.md) | Analysis of the public repositories |
| [`docs/CV_PROFILE_INTEGRATION.md`](docs/CV_PROFILE_INTEGRATION.md), [`docs/PERSONAL_STORY_INTEGRATION.md`](docs/PERSONAL_STORY_INTEGRATION.md) | How the profile and personal story were built |
| [`docs/FINAL_PORTFOLIO_AUDIT.md`](docs/FINAL_PORTFOLIO_AUDIT.md), [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md), [`docs/PRODUCTION_RELEASE_CHECKLIST.md`](docs/PRODUCTION_RELEASE_CHECKLIST.md), [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) | Audits and release |

## Status

The code is complete and tested. Before a public launch:

- Choose a host and a domain, and set `SITE_URL`.
- Add the email variables if the contact form should send directly.
- Re-run `npm run build`, `npm test` and `npm run audit`, and refresh the production-readiness report.

No open-source licence has been added yet.
