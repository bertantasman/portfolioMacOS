# BuGunluk: personal contributions, ownership and challenges

Builds on `docs/BUGUNLUK_CASE_STUDY.md`. No new project, application, widget or window feature was added, and the BuGunluk iOS source was not modified.

## 1. Personal information incorporated

All from the developer (2026-10-27), used verbatim where it is first-person text:

- The idea came from the developer and a close friend; it began with two people.
- More than 30 meetings; some involved a friend who is a lawyer.
- The team later grew to four: an Android developer and a project manager (no names, no dates).
- The developer was responsible for the iOS application and the Firebase backend, and worked closely with their co-creator on product decisions and UI/UX design.
- The hardest part was understanding the legal considerations of connecting workers and employers.
- Role shown publicly: **Co-Creator & iOS / Firebase Developer**. Team: 4. Started: November 2025. Platform: iOS. Status: In Development.

## 2. Case study sections added or updated

Summary strip (top of the viewer), **How It Started**, **My Role** (with Technical Ownership), **Building Together**, **The Biggest Challenge Wasn't the Code**, **What BuGunluk Taught Me**, and **What BuGunluk Means to Me**. Order in the viewer: Overview, How It Started, My Role, User Experience, Technologies, Technical Architecture (incl. Engineering Highlights), Building Together, Biggest Challenge, What It Taught Me, What It Means, Current Status. The older "Story Behind It" group and the PROMPT 41/42 story wordings were removed so the text exists once. "Combine closely related sections" was applied by keeping Technical Ownership inside My Role and Highlights inside Architecture.

## 3. Technical responsibilities presented

Six ownership areas: native iOS development, application architecture, authentication and user management, backend and data management, real-time functionality, supporting infrastructure. They stay within what the source review showed (see the case study doc): MVVM layers, Firebase Authentication with Google Sign-In and role routing, Firestore repositories and models, listeners for chats and payouts. FCM and Cloud Functions are described as "documented integrations"; their deployment was not verified. Android work is never attributed to the developer.

## 4. Team collaboration details

Four short stages (beginning, product development, team expansion, collaboration) in a compact numbered list. No timeline animation, names, dates, company or organizational structure.

## 5. Legal challenge framing

Stated as a challenge the team worked through and discussed with a lawyer friend. Nothing says it was resolved, that legal clearance, regulatory approval, incorporation or finalized agreements exist, or that the platform is ready to launch, and no legal advice is given. A test scans the record for such claims.

## 6. Content architecture changes

`ProjectCaseStudy` (in `src/types/project-content.ts`) gained `summary`, `origin`, `role` (with `ownership`), `collaboration`, `challenge` and `reflection`, and lost `story`. All text lives in the BuGunluk entry in `src/data/project-content/curated.ts`. The emotional paragraph is `personalStory` (used once in the viewer and previewed on the About page). The header's main-technology chip now uses the first listed technology of curated content (Swift for BuGunluk). Finder, Safari, Spotlight and the desktop keep the concise description; Who Am I, Notes and other projects were reviewed and needed no change.

## 7. Files modified

`src/types/project-content.ts`, `src/data/project-content/curated.ts`, `src/features/project-viewer/components/project-viewer.tsx`, `components/project-case-study.tsx`, `utils/project-detail.ts`, `tests/personal-story.test.ts`, `tests/bugunluk-case-study.test.ts`, `docs/BUGUNLUK_CASE_STUDY.md`, `docs/BUGUNLUK_PERSONAL_CONTRIBUTIONS.md`.

## 8. Remaining questions and unverified claims

- Team size, meeting count, the lawyer friend and the two later roles cannot be checked from code.
- The header description still says "built collaboratively with a small team" (from PROMPT 42) while the summary says four people; both are true, say if you want "team of four" in the description.
- "Started: November 2025" follows the README's creation date (the first Git commit is dated January 2026).
- The summary lists "Firebase, Firestore" as requested; the technology badges list each Firebase service separately.
- Whether the Cloud Functions are deployed and push delivery works is still unconfirmed.
- Screenshots: none published.
