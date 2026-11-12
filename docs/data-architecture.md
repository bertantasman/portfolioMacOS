# Portfolio data architecture

Every piece of content has one owner. Everything else is derived from it and never edited by hand.

| Content | Authoritative source | Derived views |
| --- | --- | --- |
| Identity, bio, education, experience, skills, certifications, languages, email, social links | `src/data/profile.ts` (social URLs: `siteConfig.profiles`) | Safari About, Notes, Terminal, LinkedIn/Instagram/GitHub apps, lock screen, widgets, Mail, Spotlight |
| Public repositories | GitHub, through `src/lib/github/*` (server) and `useRepositoryStore` (client) | Project registry |
| Hand-written projects | `src/data/projects.ts` | Project registry |
| Project narrative (tagline, features, technologies…) | `src/data/project-content/curated.ts` | Registry (`applyContent`), Project Viewer |
| Featured projects and their order | `src/data/project-content/featured.ts` (+ `featured` in `data/github-overrides.ts`) | Widget, Finder `Featured`, Safari About, LinkedIn, Notes |
| Repository tweaks (hide, rename, category) | `src/data/github-overrides.ts` | Registry |
| Screenshots | `src/data/media.ts` | Project Viewer gallery, Photos, Finder Pictures, LinkedIn/Instagram |
| Resume file | `src/data/documents.ts` (+ `public/documents/`) | Finder, Preview, Spotlight, Safari, Terminal |
| Virtual files | derived in `src/data/portfolio-file-system.ts` | Finder, Terminal, Spotlight |
| Search results | derived in `features/spotlight/utils/build-search-index.ts` | Spotlight |

## Project identity
* A GitHub project is `github:<numeric repository id>`. GitHub keeps the id through renames, so Finder file ids,
  Spotlight result ids, Project Viewer window ids and the featured list stay valid.
* A curated project keeps its own id. Link it to its repository with **`githubRepositoryId`** (survives a rename),
  or `githubRepository: "owner/name"` / `githubUrl`. A project with no link at all matches a repository only when
  its slug equals the repository name. An explicit link is never overridden by a similar name.
* Precedence: curated content > the curated project's own fields > GitHub metadata > neutral empty value.
  GitHub's empty description never replaces a curated one.

## Reconciliation
* A refresh replaces the repository list; a repository missing from a **complete** successful fetch is removed.
* A fetch that stops at the page limit (`truncated`) never removes anything.
* A failed fetch (rate limit, network, a failing later page) never produces a partial snapshot: the last good
  copy stays and is marked `stale`.

## Caching and refresh
| Layer | Behaviour |
| --- | --- |
| Next fetch cache | each GitHub request is reused for 1 hour |
| Server memory (`lib/github/repositories.ts`) | repositories and READMEs kept 1 hour; one in-flight fetch shared by all callers; a forced refresh hits GitHub at most once a minute; a rate limit is remembered until it resets |
| Client (`useRepositoryStore`) | `load()` runs once per page load and shares its request; `refresh()` shares an in-flight request; the list object is replaced only when it actually changed, so unrelated windows do not re-render |
| Registry (`deriveRegistry`) | cached per repository-list object |
| Spotlight index, Notes documents, Finder tree | rebuilt only when the repository list changes, never per keystroke |
| READMEs and screenshots | loaded on demand when a project is opened |

Stale data: content files are bundled, so editing them takes effect on the next dev reload or rebuild. GitHub data
becomes stale after 1 hour, on a manual refresh, or when the server restarts.

## Checks
* `npm test` – unit and integration tests (Node's built-in runner; no extra dependency).
* `npm run audit` – content audit: counts, missing descriptions/screenshots, invalid URLs, duplicate ids, broken
  references, missing files, unconfigured profile information. `-- --github` includes live repositories.
* Dev console: `portfolioAudit()`, `projectContentReport()`, `profileReport()`.
