# BuGunluk case study

The BuGunluk project record is extended in place. There is one entry (`id: "bugunluk"`); no new application, project or category entry was created, and no UI was redesigned.

## 1. Case study structure

All content lives in `src/data/project-content/curated.ts` (entry `bugunluk`), typed by `ProjectCaseStudy` in `src/types/project-content.ts`. The Project Viewer shows only the parts that are written.

| Viewer section (nav label) | Source field | Notes |
| --- | --- | --- |
| Summary strip (top) | `caseStudy.summary` | Role, team, platform, technologies, status, start |
| Overview (incl. The problem, The solution) | `overview`, `problem`, `solution` | Existing component |
| How It Started | `caseStudy.origin` | Developer's words, verbatim |
| My Role (incl. Technical ownership) | `caseStudy.role` | See `docs/BUGUNLUK_PERSONAL_CONTRIBUTIONS.md` |
| User Experience | `caseStudy.audiences`, `userExperience`, `journeys` | Workers / employers, design, journeys |
| Technologies | `technologies` | Existing component |
| Technical Architecture | `caseStudy.architecture`, `highlights` | Six highlights, each with a verification note |
| Building Together | `caseStudy.collaboration` | Four short stages |
| The Biggest Challenge Wasn't the Code | `caseStudy.challenge` | Verbatim |
| What BuGunluk Taught Me | `caseStudy.reflection` | Verbatim |
| What BuGunluk Means to Me | `personalStory` | Verbatim; also previewed on the About page |
| Current Status | `caseStudy.currentStatus` | Badges, paragraphs, what's next |

New components are in `src/features/project-viewer/components/project-case-study.tsx`. Related existing sections are reused unchanged.

## 2. Verified source information

The source was accessible locally and was reviewed on 2026-10-27 (a read-only review of the project folder on the developer's Mac; nothing from it was copied into this repository).

Confirmed in code: native iOS project; SwiftUI; MVVM (ViewModels per screen, one `AppSessionViewModel`); Repository and Service layers; Firebase Authentication and Google Sign-In; Cloud Firestore; Firebase Cloud Messaging; Cloud Functions (`expireJobs`, `onMessageCreate`, `onJobCreate`); deterministic application id `"<jobId>_<workerId>"`; hiring transaction with idempotent onboarding message; payout states pending / paid / confirmed; Light/Dark switch; separate Worker and Employer tab navigation; loading, error and empty states; nearby-jobs filter and sorting. First commit is dated 2026-01-22 and the README's creation date is 9 Nov 2025.

Where the source differs from the brief or the README, the case study follows the source:

- **Job listings are not real-time.** Firestore listeners exist only for chats, messages and payouts. Jobs are fetched with one-off queries. Highlight 3 is therefore "Real-time messaging and payments".
- **The hiring flow is not one atomic operation.** The status change and the onboarding flag are a transaction; the job snapshot, chat update, payout creation and onboarding message follow it.
- **Location filtering already exists** (a 10 km "nearby" filter), so location-based search is not listed as future work.
- **README's future-work list is stale** (it lists messaging, push and maps as open). Only items still unfinished are shown under "What's next".
- **Notifications screen is sample data**; profile photos are not uploaded to Storage; the test targets contain only Xcode templates.

## 3. Content added

Overview, problem, solution, worker/employer capabilities, two-user design copy, design elements, two journeys, architecture, six engineering highlights and current status (PROMPT 42); the personal sections, summary strip and team story (PROMPT 43, see `docs/BUGUNLUK_PERSONAL_CONTRIBUTIONS.md`). The tagline/short description is the text suggested in the brief, used by Finder, Spotlight, Safari Projects, the desktop widget and the viewer (they read the same field). The category changed from the provisional Mobile Development to iOS Development, and the now-unused Mobile Development category was removed.

## 4. Technical highlights

Role-based flow, duplicate-application prevention, real-time messaging and payments, hiring workflow, payment status tracking (explicitly not payment processing), push notification infrastructure (exists in code; not claimed operational).

## 5. Current development status

"Active Development" and "Not Yet Publicly Released". No store buttons, download counts, ratings, revenue or launch date. The viewer's status badge reads "In Development".

## 6. Project Viewer integration

`getProjectDetail` passes `caseStudy` through; `ProjectViewer` renders the sections in the order above and adds them to the existing section navigation. No tabs were added. Layout was checked at desktop and 375 px width (no horizontal overflow).

## 7. Files modified

- `src/types/project-content.ts`, `src/data/project-content/curated.ts`, `src/data/projects.ts`, `src/data/project-categories.ts`
- `src/features/project-viewer/utils/project-detail.ts`, `components/project-viewer.tsx`, new `components/project-case-study.tsx`
- `tests/personal-story.test.ts` (updated for the new approved text), new `tests/bugunluk-case-study.test.ts`
- PROMPT 43 additions: see `docs/BUGUNLUK_PERSONAL_CONTRIBUTIONS.md`
- `docs/BUGUNLUK_CASE_STUDY.md`

## 8. Unverified details requiring confirmation

- **Screenshots.** Local screenshot folders exist (worker, employer, register flow, settings), but none is in the portfolio media library and none was published. They may show personal data, so they need your approval first.
- **Notifications.** Whether the Cloud Functions are deployed and push delivery works.
- **Team and legal details.** "More than 30 meetings", the lawyer friend, the team of four and the Android developer and project manager come from your own text and cannot be checked from code.
- **Superseded text.** The PROMPT 41 and 42 wordings of the BuGunluk story were replaced by the PROMPT 43 wording (one version only). The About page previews its first paragraph and the release statement.
- **Release.** The project folder contains an App Store export archive. This does not show a release and nothing about it is claimed.
- **Interface language.** The app is in Turkish; the case study says so.
- **Repository.** Private; no link is published.

## Screenshots (added 2026-11-12)

The gallery has 17 iPhone screenshots from the developer's own build: onboarding, login, role selection, worker registration, the worker flow (jobs, job details, applying, applications), the employer flow (reviewing an applicant, dashboard, creating a job), profile and settings, and four Dark Mode versions (which also show the Light and Dark Mode support). The jobs list is the cover. They were resized to 660×1435 JPEG and use sample data only (fictional worker, businesses and placeholder contact details). The Help & Support screens (light and dark) were **not** used because they show a placeholder support email address at a domain that may not be the developer's. Notes: the app's login screen shows the working name "JobLink", and some interface text is Turkish; both are visible in the screenshots and are not claimed to be final.
