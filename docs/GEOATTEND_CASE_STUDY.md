# GeoAttend case study

"GeoAttend" is a **portfolio pseudonym**, not a registered product name, brand or company. The organization the application serves is not named, described or hinted at anywhere in this portfolio. No application source was modified: the iOS app, the Android app and the Firebase backend were only read.

## 1. Public project identity

| Field | Value |
| --- | --- |
| Name / id / slug | GeoAttend / `geoattend` / `geoattend` (the earlier working id `location-based-attendance` was neutral but is retired, so no route, key or test refers to it) |
| Focus line | Cross-Platform Event & Attendance Management |
| Short description (card, Finder, Spotlight, Safari) | "An independently developed native iOS and Android system for event management, organization workflows, secure attendance verification, and administrative reporting." |
| Category | Institutional Mobile Application (new), plus iOS Development and Android Development |
| Status | Active Development (shown as "In Development") |
| Technologies | SwiftUI, Kotlin, Jetpack Compose, Firebase, Cloud Functions (full badge list in the viewer) |

One record in `src/data/projects.ts` plus one content entry in `src/data/project-content/curated.ts`. The description is stored once and read by every app. No repository or store link is published.

## 2. Developer's verified ownership

Confirmed by the developer (2026-10-27): independently developed the iOS app, the Android app and the Firebase backend, including Cloud Functions, Firestore security rules, location-based attendance verification, authentication, administrative workflows and architecture. Shown as **Solo Full-Stack Mobile Developer** (supporting label: End-to-End Mobile & Backend Development) with the approved "My Role" text verbatim. No collaborators, employer or contract are mentioned. Code cannot prove who wrote it; this is the developer's statement.

## 3. iOS architecture
SwiftUI app; Firebase Authentication, Firestore and callable Cloud Functions; foreground location access; Firebase App Check configuration (confirmed in the iOS source).

## 4. Android architecture
Kotlin, Jetpack Compose, Material 3, Firebase Authentication, Firestore and Functions, Maps Compose, Places SDK and Google Play Services Location (confirmed in the Gradle dependencies). App Check is **not** listed for Android because it is not in its dependencies.

## 5. Shared Firebase backend
Authentication, Firestore, callable Cloud Functions (registration, profile update, check-in), server-side authorization and Firestore security rules. Attendance records are created only by the function.

## 6. Attendance verification
The check-in function authenticates the caller, confirms they are an approved member (or an administrator) of the event's organization, rejects check-ins before the event starts or after it ends, computes the Haversine distance on the server against the event's radius, and creates the attendance record inside a transaction, which prevents duplicates. Security rules deny client writes to attendance records.

## 7. Security boundaries
The server decides; the client only reports a location. The page says this is a design that keeps the decision on the server and that it is **not fraud-proof**. No configuration, keys, identifiers or access codes appear.

## 8. Organization workflows
Event management, organization and membership management, attendance verification, member requests and titles "where supported", reporting.

## 9. Reporting and export
The brief says Excel export is Android-specific. **The source shows the iOS app also builds and shares an attendance workbook** (an export action with a share sheet), so the page says "export workbook reports" without limiting it to Android. Please confirm the intended wording.

## 10. Planned backend evolution
Approved text, verbatim, with a "Planned, not completed" badge. Firebase is stated as the current backend. No replacement technology is named, and a test blocks PostgreSQL, MySQL, MongoDB, Supabase, Node.js, NestJS, Spring, .NET and "REST API" from the record.

## 11. Development status
Active Development. No release, store listing, users, attendance data or production readiness is claimed. Whether the apps are distributed to anyone is unknown to this portfolio.

## 12. Files modified
`src/data/projects.ts`, `src/data/project-categories.ts`, `src/data/project-content/curated.ts`, `src/data/project-content/featured.ts`, `tests/personal-story.test.ts`, `tests/registry.test.ts`, `docs/FINAL_PORTFOLIO_AUDIT.md`; new `tests/geoattend-case-study.test.ts`, `docs/GEOATTEND_CASE_STUDY.md`. Featured list is now CourtRise, BuGunluk, GeoAttend (appended; nothing reordered or hidden).

## 13. Public disclosure audit results
Scope: portfolio source, docs, tests, scripts, `public/` assets and file names, README, package metadata, the Next.js build output and the generated type cache, plus the metadata, structured data and search content, which are all generated from the same project records.

| Category | Result |
| --- | --- |
| Organization name, abbreviation, branding, affiliation-related wording | None found in the portfolio before or after this change. The old public title was already neutral. |
| Original project/repository name | Not present. The two private repositories are not exposed by the public GitHub listing the site uses. |
| Route paths and asset URLs | The retired working id was replaced by `geoattend`. No asset or route includes an identifying term. |
| Screenshots | None are published. A local screenshot folder exists (admin, user, login/register) and was **not** used, since it may show the organization's name or member data. |
| Internal links, identifiers, access codes, member or attendance data | None found. |
| Private repository references | None published. |

A test now scans source, docs, tests, scripts and public assets (content and file names) for the protected terms and access-code wording and fails if any appear. The terms are assembled from fragments, so the test file itself does not contain them.

## 14. Remaining questions
- Excel export: Android only, or both apps (the source shows both)?
- Approve anonymized screenshots only; none of the existing ones were used.
- Whether the apps are distributed beyond development is not stated, so none is implied.
