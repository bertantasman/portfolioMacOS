# Bertan Taşman — macOS Portfolio

An interactive, macOS-inspired desktop portfolio for a mobile application developer. Visitors open Finder, Safari, Notes, Photos, Terminal, Mail and more to explore projects, background and contact details. It also works on a phone, where windows open full screen.

Built with Next.js (App Router), React, TypeScript (strict), Tailwind CSS, Motion, Zustand and Lucide.

## What is in it

- **Projects** as case studies in a Project Viewer: CourtRise (published on the App Store), BuGunluk, GeoAttend, LineMaster, plus the public GitHub repositories, which are loaded through server routes and cached.
- **One source of truth** for content: `src/data/profile.ts` (background), `src/data/projects.ts` and `src/data/project-content/` (projects), `src/data/media.ts` (images), `src/data/documents.ts` (résumé).
- **A generated résumé** (`public/documents/Resume.pdf`) that carries professional content only.
- A hardened contact form (`/api/contact`) that falls back to a `mailto:` link when no email provider is configured.

## Commands

```bash
npm run dev          # development server on http://localhost:3000
npm run build        # production build
npm run start        # serve the production build
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm test             # unit tests (Node's built-in runner)
npm run audit        # content audit: missing media, documents, bad links
npm run resume       # regenerate public/documents/Resume.pdf (macOS only)
```

## Configuration

Copy `.env.example` to `.env.local` to enable the optional features (contact email delivery, a GitHub token for a higher rate limit, the public site URL). Nothing is required to run the site; secrets are only ever read on the server.

## Documentation

The `docs/` folder holds the case-study notes, the data architecture, the content audits and the production-readiness reports. Start with `docs/data-architecture.md`.
