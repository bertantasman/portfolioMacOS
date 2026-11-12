# LineMaster case study

LineMaster did not exist in the portfolio, so one curated project was added (`id: "linemaster"`). There is no duplicate. No application or desktop feature was added, and neither LineMaster repository was modified (both were only read).

## 1. Project overview

A physics-based endless arcade game: the player swings between glowing anchors above a procedurally generated city using one finger. Shown as a **Playable Prototype** (a new project status). The Project Viewer has a summary strip (role, type, platforms, iOS stack, Android stack, status), then 21 sections in the order of the brief: My Role, One-Finger Physics Gameplay, Engineering the Swing, A Different Kind of Start, Anchor Mechanics, An Endless Procedural City, A Living Game World, Dynamic Visual Themes, Rewarding Precision, Bonus Mode, Risk and Reaction, Progress Beyond a Single Run, Power-Ups and Strategy, Daily Challenges, Player Customization, Visuals Generated in Code, Sound Design Through Code, Game Architecture, Cross-Platform Development, What LineMaster Taught Me, Current Status.

## 2. Verified developer ownership

Solo Game Developer & Creator, confirmed by the developer (2026-10-27) for both versions. The "My Role" and "What LineMaster Taught Me" texts are verbatim. The commit history of both projects is consistent with one author, but history cannot prove authorship.

## 3. iOS architecture

Checked against the iOS project (README, code layout and key files): SwiftUI hosting a SpriteKit `GameScene`; `Gameplay/` classes for player, rope (`WebController`), anchors, map generation, hazards, bonus stars, themes and day/night; `Game/` managers for score, currency, skins, trails, power-ups and daily challenges; `Support/` for tuning, sound, haptics and physics categories. Verified in code: `atan2` for the flick angle, a 1,500 m day length computed from distance (stateless), a 500 m bonus distance, a seeded random generator for daily challenges, 30 skins, 11 bundled WAV effects, `UserDefaults` persistence.

## 4. Android availability and verification limits

The brief said the Android stack was unknown. An Android project exists locally and its build files show **Kotlin and libGDX** (with Box2D) and Firebase Analytics, in a `core` module plus an `app` module. That is all the site says: Kotlin and libGDX, independent development, and "no claim of feature parity". The source also contains physics-parity test tooling and a daily-challenge test, but they were not used to claim parity. No Android-specific rendering, audio or architecture claims are made. No store listing is mentioned.

## 5. Physics mechanics

Rope attachment, gravity, momentum, tangential release, flick direction by `atan2`, velocity adjustment, spin tracking, the hold-to-wind-up launch, anchor types (normal, boost, fragile, spin-to-boost) and the 30°–37° combo window (×1.5 up to ×3.0). Presented as a tuned game model, "not a physically perfect simulation", with no benchmarks.

## 6. Procedural generation

Buildings, anchors, hazards, bonus stars, theme transitions and day/night, generated as the player advances. Described as rule-based, not machine learning; no algorithm beyond the documented systems is described.

## 7. Progression systems

Distance scoring, best score, diamonds, unlocks, daily challenges and power-ups, stored locally. No cloud sync, no multiplayer.

## 8. Customization

30 ball skins, 30 trail styles, dynamic or fixed city themes, unlocked with diamonds. The code also has an accessories feature (not in the README); it is not on the site because its status is unclear. The rewarded-ad option is a placeholder and is described as one.

## 9. Daily challenges

Three per day (Easy, Medium, Hard; the last slot can roll Epic), chosen deterministically from a day-seeded generator, tracked locally.

## 10. Audio and visuals

11 synthesized WAV effects played with AVAudioPlayer, no licensed music. **Correction to the brief and README:** the README says the game uses no image assets, but the current iOS code loads PNG images for character skins and UI icons (and the git history shows they were added later). The site therefore says most visuals are built from SpriteKit shapes and actions, not all. No Android rendering claim.

## 11. GitHub integration

**The repository is private.** The brief calls it public, but both GitHub's public API and the public web page return "not found", and the repository's visibility is Private. The site's GitHub integration lists public repositories only, so LineMaster does not appear in it, and publishing a "View Source on GitHub" button would send visitors to a 404 page and expose a private repository URL. No link or button was added, and no Android repository URL was invented. If you make the repository public, the link can be added in one line (`links.github` in `curated.ts`).

## 12. Development status

Playable Prototype. No store listing, downloads, revenue, reviews or release dates. The iOS code includes Firebase Analytics events; the site does not mention this, and you may want to disclose it in a privacy note if the game is ever released.

## 13. Files modified

`src/types/project-content.ts`, `src/data/projects.ts`, `src/data/project-categories.ts` (new "Game Development"), `src/data/project-content/curated.ts`, `src/data/project-content/featured.ts` (LineMaster appended; nothing reordered), `src/features/project-viewer/utils/project-utils.ts` (status label), `tests/registry.test.ts`, new `tests/linemaster-case-study.test.ts`, `docs/LINEMASTER_CASE_STUDY.md`.

## 14. Unverified information

- Repository visibility and the GitHub button (see section 11).
- Whether the Android version matches iOS feature for feature.
- Exact tuning values (only the figures you gave are shown).
- Screenshots (added 2026-11-12): 10 English gameplay captures from the developer's folder of store-style photos (5 iPhone, 5 iPad simulator), resized to JPEG and shown in the project gallery with captions. They show real gameplay and no personal data. The Turkish versions were not used. Their presence in a store-photos folder is not treated as a release: the page still says Playable Prototype.
- The PNG skin and accessory artwork's origin and usage rights were not checked.
