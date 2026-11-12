# Final portfolio audit

Audit date: 2026-10-26. Everything below was checked in the running application (real browser, desktop 1280 px and phone 375 px) or in the code and data, as stated. Items not checked are listed under Testing.

## Portfolio overview

An interactive macOS-style portfolio for **Bertan Taşman, Mobile Application Developer** (title from the CV; name as chosen by the developer). It has 10 analysed public GitHub projects (iOS 4, Android 2, Web 2, Backend 1, Desktop 1, AI/ML 1; UIKit 4, SwiftUI 0, Flutter 0), a CV-based profile (2 degrees, 3 positions), and verified GitHub, LinkedIn and Instagram links.

**Readiness: close, with one blocker: there is no public resume.** Everything else a recruiter needs is present and consistent. The blocker needs a decision from the developer, not more development.

## Content completeness

| Section | Status | Notes |
| --- | --- | --- |
| Who Am I | Complete | 131 words, first person, every claim traceable to the CV or the GitHub analysis. Contains one time-sensitive phrase ("I've just started a Master's degree"). |
| Professional summary | Complete | 37 words. |
| Education | Complete | Both degrees from the CV, current vs completed shown. |
| Experience | Complete | Three positions, CV wording, no invented technologies or results. |
| Skills | Complete, requires verification | Listed skills are the CV's. SwiftUI and Flutter are CV skills that no public repository demonstrates. |
| Projects | Partially complete | 10 verified public projects. The 3 private curated projects (BuGunluk, GeoAttend, macOS Portfolio; CourtRise and the BuGunluk and GeoAttend case studies were added later) are unverified. No screenshots exist. Featured projects were configured later (see the case-study docs). |
| GitHub | Complete | Real profile, avatar, 13 public repositories; GitHub's own bio is out of date. |
| LinkedIn | Complete | Built from the CV; URL from the developer's own site, confirmed. Not synchronised from LinkedIn, and says so. |
| Instagram | Complete (profile card) | Username and link only. No approved photos, so no photo section. |
| Resume | **Missing** | Blocked: the CV holds private details and no public version has been approved. |
| Contact | Partially complete | Email and social links work everywhere. Direct sending from the Mail app is unavailable (no email provider configured), and says so. |
| Developer statistics | Complete | One engine; identical counts in GitHub, Safari Projects and About. |

## Recruiter experience (simulated in the browser)

**HR recruiter, first 30 seconds.** Lock screen, then a plain-language welcome ("a personal portfolio... designed to look and feel like a Mac desktop"), dismissible with one click. Before this audit, the desktop afterwards never stated who the developer was; now a "Get in touch" widget shows the full name, role, email and links. Projects are one click away through Finder, Safari, GitHub or Spotlight, and each has a plain-language description. Resume: not findable (see below). Contact: found at once.
- Friction found and fixed: no identity on the desktop; Resume.pdf on the Desktop opened an error.
- Friction remaining: the first three projects listed everywhere are the private curated ones; a recruiter will not know which are verified. No screenshots.

**Technical recruiter.** The statistics overview shows platform counts, frameworks and a technology list with project counts, and each is a filter. Classifications are evidence-based (docs/DEVELOPER_STATISTICS.md). Repositories link to GitHub. Friction: SwiftUI and Flutter are listed as skills but have zero public projects; project complexity is described honestly as coursework and learning projects, with TaskFlow as the largest (a four-student team project).

**Hiring manager.** Professional presentation is consistent. Responsibilities are accurate and mostly use "contributes to / takes part in". Missing for a hiring decision: a resume, and featured projects that show the developer's strongest work.

**Phone width.** The welcome fits, Finder → iOS Development → Project Viewer works, no page-level horizontal overflow, tap targets enlarged earlier. The Project Viewer's section tabs scroll sideways by design.

## Project accuracy

- Every analysed project's description was written from repository evidence (docs/GITHUB_PROJECT_ANALYSIS.md); tests enforce unique ids, description length, evidence for every classification, and no unverified framework.
- Statistics: 13 repositories in scope, 13 analysed, 10 counted, 3 excluded (the empty SmartHat, the fork Programlamaya-Giris, the profile README repository).
- Not verifiable: the three private curated projects. Their text came from the developer; BuGunluk's category is marked provisional, and no repository is accessible for any of them.

## Professional profile

CV and portfolio agree on name, title, education, experience and skills. Conflicts that need the developer: surname spelling (CV "Tasman", GitHub "Taşman"), GitHub bio outdated (still says "student"), and the casual display name "Bertan" on the lock screen and welcome.

## Social profiles

GitHub: `github.com/bertantasman`. LinkedIn: the profile URL from the developer's published CV site, confirmed. Instagram: `instagram.com/bertantasmann` (as supplied; the handle differs by one letter from GitHub). No follower counts, posts or other social data are shown anywhere. All external links open in a new tab with `noopener noreferrer`.

## Resume

No public resume exists, and none is published. The CV contains private personal details (birth data, home address, phone number) and must not be used as is. The build output, source and docs were scanned and contain none of those details, and a test blocks any PDF or such detail from entering the repository.
Before this audit the Resume.pdf entries (Desktop, Finder, Spotlight) opened "Unable to Open Document". They are now hidden until a public file exists (`published: false` in `src/data/documents.ts`). To finish: approve a redacted PDF, add it at `public/documents/Resume.pdf`, and remove that flag; a test fails if the flag is removed without the file.
Preview functions (zoom, page navigation, download, print) could not be tested without a file.

## Contact

- Email link, social links, the Contact widget and Safari's Contact page all work (addresses checked in the browser).
- The Mail app's form cannot send: no email provider is configured. The server correctly answers 503 with `success: false`, the app says "Direct sending isn't available right now" and offers the user's own email app and Copy. No false success message exists.
- To enable sending, set `CONTACT_RECIPIENT_EMAIL`, `EMAIL_FROM_ADDRESS` and `RESEND_API_KEY` (see `.env.example`).

## Issues fixed

1. Resume.pdf led to an error (Desktop, Finder, Spotlight, Terminal): hidden until published, with a test that prevents a published-but-missing file.
2. The desktop did not identify the developer: the existing Contact widget is now a default widget (new visitors) and shows the full name.
3. Notes listed empty notes ("No content yet", "Development Philosophy", "Featured Projects"): notes without content are now left out.
4. Safari's Contact page offered only a button: it now lists email and the social links.
5. Page description (link previews, search results) was generic: now names the developer and role.
6. SmartHat (an empty repository) appeared as a project: hidden, with the reason recorded; the statistics keep the precise reason.
7. Terminal `cat` failed on Experience, Education and Skills entries: it now prints each entry.
8. Removed an unused Safari placeholder page ("future stage").

## Remaining issues (need the developer)

1. **Approve and add a public resume** (see above).
2. **Choose featured projects.** None are configured, so the Projects widget and desktop icons show the three unverified private projects first. Suggested candidates from the analysis: TaskFlow, GestureDeck (AI_DJ), InstaClone. Not applied automatically.
3. Surname spelling, GitHub bio, and whether the desktop should say "Bertan" or the full name.
4. Whether SwiftUI and Flutter should stay as CV skills with no matching public project (or whether private work can be shown later).
5. Verify the three private curated projects' descriptions, or add their repositories.
6. Configure the email provider if the form should send.
7. Screenshots: none exist; add them to `src/data/media.ts` per project.
8. The developer's published CV website (separate from this project) lists a phone number; consider reviewing it.
9. Revisit "I've just started a Master's degree" as time passes.

## Testing

- **Automated:** TypeScript, ESLint, the production build and the unit/integration suite (106 tests) were run; results in the final response.
- **Browser, desktop 1280 px:** first visit (lock screen, welcome), desktop identity, Safari About/Projects/Contact, Notes, Finder, Terminal (`help`, `whoami`, `ls`, `cd`, `cat`, `open`), GitHub, LinkedIn, Instagram, Spotlight, the contact API (503, no false success), accessibility scan (unnamed controls, image alt text, labelled external links).
- **Browser, phone 375 px:** welcome, Finder to Project Viewer, overflow checks.
- **Dark mode:** viewed on LinkedIn only; contrast was not measured.
- **Not tested:** Preview with a real resume, actually sending an email, keyboard-only navigation across all apps, a screen reader, tablet width this round.
