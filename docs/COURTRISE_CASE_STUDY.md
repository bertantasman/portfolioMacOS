# CourtRise case study

CourtRise did not exist in the portfolio, so one new curated project was added (`id: "courtrise"`). There is no duplicate entry (the private GitHub repository is not in the public API listing, so it cannot appear as a second project). No application, desktop widget or window feature was added, and the CourtRise iOS source was not modified.

## 1. Overview

A native iOS basketball training app that turns practice into measurable progress: drills, adaptive targets, XP, attributes, streaks, daily missions, comparison and recommendations, with an optional Pro subscription. The Project Viewer shows a recruiter strip at the top (role, platform, status, built with, backend, monetization, languages), the App Store button, then the detail below.

## 2. Verified project information

Sources: the developer's brief, the public App Store listing (opened 2026-10-27) and a read-only review of the project folder on the developer's Mac (nothing was copied into this repository).

| Item | Result |
| --- | --- |
| App Store listing | Exists at the supplied URL (it redirects to the current slug). Free, in-app purchases, English and Turkish, category Sports, iPhone and iPad, requires iOS 26.2. No ratings yet: **none are shown or claimed**. |
| Version | The listing and the Xcode project show **1.4 (build 11)**. The README's "1.3 (build 10)" is out of date, so no version number is displayed on the site. |
| Bundle id / App ID | `com.bertantasman.courtriseios` / `6760609447` (match the project). Not displayed. |
| Pro product id | `courtrise_pro_monthly` in code. Not displayed; no price shown. |
| Colors | #FF6B00, #0E0E10, #1C1C1E confirmed in `AppTheme.swift`. |
| Localization | English and Turkish, string catalog, in-app language selector. The catalog has 900 strings (the brief says about 903). The number is not displayed. |
| Mascot states | normal, happy, sad, angry, tired, idea confirmed. |

## 3. App Store integration

The URL is registered in the project's content (`links.appStore`), the single place links are configured. The existing link component renders it as a prominent accent button, "View on the App Store", an ordinary `<a>` with `target="_blank"`, `rel="noopener noreferrer"`, an "(opens in a new tab)" accessible name and a visible focus ring. No tracking parameters, no download page, no ratings. A new project status, **Published on the App Store**, shows in the header, and the release section carries an "Available on the App Store" badge.

## 4. Case study sections

Viewer order: Overview (with The Problem and The Solution), Features (the nine capabilities), Technologies, **My Role**, A Structured Training Experience, Adaptive Training Difficulty, Turning Practice Into Progress, Building a Player Identity, Making Training Accessible, Building a Freemium Experience, Backend and Persistence, Built for Two Languages, Feedback That Feels Human, Visual Identity, Where Basketball Meets Development, Engineering Highlights, From Development to the App Store. They use one new generic section component beside the existing components.

## 5. Adaptive training explanation

Checked against `AdaptiveDrillDifficulty.swift`: applies to accuracy and repetition drills only; target range by player level; target placed in the range with 0.65 × level-band progress + 0.35 × attribute progress, then rounded and clamped; a required improvement threshold depends on player level and attribute level; a difficulty tier also grants a small XP bonus (not mentioned on the site). Described as rule-based, not AI, not validated, no promised improvement.

**Difference from the brief:** the brief says the threshold also varies with "Sharpness". The newest commit ("Replace sharpness with attribute inactivity decay") removed that: the threshold now uses only player level and attribute level, and the inactivity mechanic is a per-category rating decrease after each full 48 hours without training. The site describes the current behavior and never mentions sharpness (a test enforces this).

## 6. Gamification systems

XP, levels, five attributes, overall rating (floor of the average, confirmed), streaks, daily missions (a deterministic generator in code), and the inactivity decay above. Presented as in-app mechanics, not measurements of athletic ability.

## 7. Firebase architecture

Authentication, Firestore, Storage (profile images), local persistence for guest progress and preferences, and a centralized observable application model with dedicated services. No configuration or credentials are shown.

## 8. StoreKit integration

Code loads the product, runs purchase and restore flows and reads current entitlements. The site says the runtime price is used and shows no price. It states that a configured subscription proves no subscribers or revenue. The Pro list (library, recommendations, comparison, insights, streak protection) matches the Pro screen.

## 9. Localization

Presented as a user benefit (switch language in the app) without the key count.

## 10. Files modified

`src/types/project-content.ts`, `src/data/projects.ts`, `src/data/project-content/curated.ts`, `src/data/project-content/featured.ts`, `src/features/project-viewer/utils/project-utils.ts`, `components/project-links.tsx`, `components/project-case-study.tsx`, `components/project-viewer.tsx`, `tests/registry.test.ts`, new `tests/courtrise-case-study.test.ts`, `docs/COURTRISE_CASE_STUDY.md`.

Prioritization: the featured list (the portfolio's existing mechanism) was empty. It now lists CourtRise then BuGunluk. Nothing is hidden or reordered otherwise; remove the two ids in `featured.ts` to undo.

## 11. Unverified or needing confirmation

- **Screenshots.** Real App Store screenshots (`CourtRise_AppStore`), mascot art and an icon exist locally, but none was added to the portfolio. Tell me which you approve.
- **Basketball paragraph.** It is the text you supplied, labelled in the brief as proposed. Confirm it is accurate in your words.
- **Role (confirmed by the developer, 2026-10-27).** Solo Developer & Product Creator, shown in the summary strip and in a verbatim "My Role" section. This is the developer's own statement; the source and listing neither confirm nor contradict it (the listing names Ahmet Bertan Tasman as provider). The Engineering Highlights are therefore presented as the developer's own work.
- **Guest migration.** Documented in the README and present in code; edge cases not verified.
- **Release history.** No dates, review history or version history are stated.
- **Subscription.** The monthly product exists in code; whether it is live in App Store Connect was not checked.

## 12. Organic reach (added 2026-10-28)

The developer stated that they set up CourtRise's ASO settings themselves and reached about 30,000 App Store impressions with no paid advertising. It appears in the summary strip ("Organic reach") and in a short section, "Organic Discovery Through ASO". The figure comes from the developer (App Store Connect data was not available to this portfolio), and the time period was not given, so none is shown. It is labelled as impressions, with a note that it is not a download count. Still no ratings, downloads, subscribers or revenue are claimed. To confirm: the exact figure and period from App Store Connect.

## 13. Media (added 2026-11-12)

The gallery now has 14 images, all from the developer's own project and approved by the developer: the 8 English App Store screenshots (resized from 1320×2868 to 660×1434 JPEG) and the 6 mascot-state images the app uses (resized PNGs with transparency). They are in `public/images/courtrise/` and listed in `src/data/media.ts` with captions and alt text; Photos and Finder's Pictures folder show them too. The Turkish screenshots, the app icon, the AI video and unrelated folders were not used.
