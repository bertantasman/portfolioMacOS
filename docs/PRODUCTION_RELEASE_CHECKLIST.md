# Production release checklist

Status as of 2026-10-26. `[x]` = verified, `[ ]` = open, `[~]` = partly verified (note says what).

## Content
- [x] Profile (name, title, education, experience, skills, languages) matches the CV.
- [x] **Name decided** (2026-11-12): "Bertan Taşman" everywhere, desktop included.
- [x] Projects: 10 public projects analysed and described from repository evidence.
- [~] Project statistics are accurate and identical in GitHub, Safari Projects and About (checked in the browser). Three private curated projects remain unverified and are not counted.
- [ ] **Featured projects chosen** (none are set; the Projects widget shows the unverified private projects first).
- [ ] **Public resume approved and added** (`public/documents/Resume.pdf`, then remove `published: false` in `src/data/documents.ts`). Currently hidden everywhere; not a technical fault.
- [x] Social links: GitHub, LinkedIn and Instagram are the URLs the developer supplied or confirmed.
- [ ] GitHub bio is out of date (still says "student"); the developer's own GitHub setting.

## Security
- [x] No secrets in the repository or the client bundle (scanned `.next/static`; env files are git-ignored; only `.env.example` exists).
- [x] Secrets are read only in `src/lib/server/email-provider.ts` and `src/lib/github/config.ts`; no `NEXT_PUBLIC_` variables exist.
- [x] No private documents: no PDF in the project; build output and source scanned for the CV's private details (none found); a test enforces it.
- [x] External links open with `noopener noreferrer`; unsafe URL schemes are rejected; the only raw HTML is a static theme script and the schema.org data (escaped).
- [x] `npm audit`: 0 known vulnerabilities (2026-10-26).
- [x] Security headers set (nosniff, referrer policy, `frame-ancestors 'none'`, X-Frame-Options, Permissions-Policy).
- [ ] A full Content-Security-Policy is **not** set (would need nonces); documented as a deliberate limit.

## Functionality
- [x] Desktop, Dock, windows, Finder, Safari, GitHub, LinkedIn, Instagram, Notes, Terminal, Spotlight, Project Viewer work (production build, browser).
- [x] Welcome guide: first visit, dismissal, persistence.
- [x] Keyboard: Tab order reaches the desktop, menu bar and Dock; Enter launches apps; dialogs trap focus.
- [~] Contact: email and social links work. **The Mail form cannot send until the three contact variables are set**; it says so and offers the visitor's email app. Sending itself has never been tested end to end.
- [ ] Resume opens in Preview (cannot be tested until a public PDF exists).
- [x] Phone, tablet and desktop widths checked (see the readiness report for what was and was not covered).

## Technical
- [x] `npm run typecheck` passes.
- [x] `npm run lint` passes.
- [x] `npm test` passes (107 tests).
- [x] `npm run build` passes; `npm start` serves the site and `/robots.txt`.
- [ ] Lighthouse / PageSpeed on the live URL (not run; no tool available here).

## Deployment
- [x] Hosting strategy documented (`docs/DEPLOYMENT_GUIDE.md`).
- [ ] Git repository created (the folder is not one yet).
- [ ] Environment variables configured on the host.
- [ ] Domain decision: **pending** (no domain assumed; `SITE_URL` left unset).
- [ ] **Deployment approval: pending.** Nothing has been deployed.
