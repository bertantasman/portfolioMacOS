# Desktop UX refinement

Feedback: the interface is creative but a little crowded; the Dock could hold fewer items, projects could be grouped rather than spread over the desktop, and first-time visitors could use some guidance. The functionality stays; the information architecture and discoverability change.

## Follow-up fix (PROMPT 49.1, 2026-11-12)

**Root cause of the "still cluttered" report.** The first refinement was committed and pushed to GitHub, but the Vercel project is not connected to the repository (the Vercel GitHub app has no access to it), so the deployed site was still the older build with 13 desktop icons and a 12-icon Dock. The code on `main` already had the cleaner desktop. In addition, the first pass left several things short of the brief, which this follow-up fixes: the Dock still contained Notes and Mail instead of Projects, About Me and Contact; the volume icon and two note icons were on the desktop; the widgets were unchanged in size; saved layouts were not migrated; and every project had the same purple icon. **The deployed site needs a new deploy to show any of this.**

**Where the desktop icons come from.** `DesktopIcons` renders `getDesktopItems()` (`src/features/desktop-icons/lib/layout.ts`), which lists the children of the virtual file system's `desktop` folder. That folder is built in `src/data/portfolio-file-system.ts`; before the first refinement it mapped every curated project to a `desktop:project:<id>` file. Nothing is hidden with CSS: those entries no longer exist. The desktop folder now holds one `desktop:projects` folder alias and the `desktop:resume` alias of the résumé document, and the startup volume is no longer listed (as in current macOS). A test asserts the rendered items are exactly `Projects` and `Resume.pdf`.

**Where the Dock comes from.** `src/config/applications.ts`: `inDock: true` apps, grouped by `dockSection`. Final Dock: **Finder, Launchpad, Safari | Terminal, Projects, About Me, Contact**. Projects, About Me and Contact are not applications, so they are registry entries with a `shortcut` (Projects: Finder at the Projects folder; About Me: the About Me note in Notes; Contact: a new message in Mail), launched by `launchShortcut()` in `src/lib/navigation.ts`. They are not `launchable`, so Launchpad and Spotlight do not list them as apps. Notes, Mail, Photos, GitHub, LinkedIn, Instagram, System Settings and Mission Control left the Dock and remain in Launchpad (10 apps, verified) and Spotlight. There is no running-apps section in this Dock, so nothing needed separating.

**Persisted state.** Desktop icon positions are saved in `localStorage` (`desktop-icons-v1`, keyed by file id). The store is now version 2 with a migration that empties `positions` for older saves and keeps icon size, spacing and sort. Verified in the browser: a v1 save with old project-icon positions, `sortBy: "kind"`, size 80 and spacing 12 loaded as two icons, with `sortBy`, size and spacing kept. Positions for ids that no longer exist were already ignored. Onboarding status, widgets and other settings are untouched. Widget positions are stored in grid cells, so the smaller widgets keep each visitor's arrangement.

**Widgets.** The grid cell shrank from 170 to 144 px (small 134 px, medium 278×134 px, previously 160 and 330×160): the whole cluster is about 40% smaller by area. Contents were tightened: clock text, Featured Projects padding and row height (the three projects still show), and the Contact widget keeps name, role, email and the four actions on one row without the Mail glyph. The default layout is unchanged (clock and projects on top, contact below), at the upper left.

**Project icons.** Project tiles now vary by category (blue phone for iOS and institutional apps, green for Android, orange globe for web, pink game controller for games, teal sparkle for AI, grey server for backend, purple brackets otherwise) in Finder, the desktop widget and Safari's Projects page. They are generic glyphs, not logos. There is no per-project artwork to use as an icon, so none was invented. The desktop folder is the macOS-style blue folder and the résumé is the red PDF page icon.

**Welcome.** Same single guide. Added one line: projects are in the Projects folder, Launchpad has the other apps, and Spotlight finds anything. Explore Projects opens the folder; Explore Desktop dismisses. The tour's Dock step was updated.

**Validation.** `npm test` 169 passing; typecheck, lint, audit and build clean. In a production build, with a simulated old saved layout: desktop icons were `Projects` and `Resume.pdf`; the Dock was the seven items above; Projects opened Finder at Documents › Projects with 20 items; About Me opened the note; Contact opened a new message; double-clicking the résumé opened a window; Launchpad listed all 10 apps; no console errors. Not checked: dev-mode hydration warnings; the 5-step tour visually.

**Not done / remaining.** Deploying (not asked; the Vercel link is still manual). `MobileShell` was not touched (it does not exist in this codebase yet).

---
## Original refinement (PROMPT 49)
## 1. Original problems

- The Dock pinned 12 apps in three groups (primary, social, system), including Mission Control, Photos, GitHub, LinkedIn, Instagram and System Settings.
- The Desktop showed every curated project (11) as its own icon, plus the résumé and the volume: 13 icons in all.
- The welcome dialog existed but offered "Explore Portfolio" / "View Projects" with generic copy, and nothing pointed at where to start.

## 2. Dock

Pinned apps are now six, in two groups separated by the existing thin separator:

| Group | Apps |
| --- | --- |
| Primary navigation | Finder, Launchpad, Safari |
| Developer identity | Terminal, Notes, Mail |

The registry (`src/config/applications.ts`) now separates two ideas that one flag used to cover: `launchable` (appears in Launchpad and Spotlight) and `inDock` (pinned by default). Nothing was removed from the portfolio: Mission Control, Photos, GitHub, LinkedIn, Instagram and System Settings are still in Launchpad and Spotlight (Mission Control also has its keyboard shortcut and menu entries). Magnification, tooltips, running indicators, bounce and the narrow-screen sizing are unchanged; the narrow-screen width calculation now includes the separator.

**Difference from the brief:** the brief suggested "Projects", "About Me" and "Contact" as Dock items. There are no such applications in the registry, and inventing pseudo-apps would have meant new window routing. The nearest real apps are used instead (Finder and the Desktop's Projects folder for projects; Notes holds About Me; Mail is the contact form). Projects stays prominent through the Desktop folder, the welcome, the hint and the tour.

## 3. Projects folder

The Desktop has one **Projects** folder. It is a *folder alias* (`aliasOf` on a folder in the virtual file system), not a copy: it lists whatever Documents › Projects lists, so there is one project listing and no second database. The alias is validated (it must point at a real folder, not at a file or another alias), Terminal's `ls` and `cd` see the same contents, Spotlight does not index it twice, and double-clicking it opens Finder at the real Documents › Projects folder.

Documents › Projects now opens onto the 11 hand-written projects directly (CourtRise, BuGunluk, GeoAttend, LineMaster, ReadPoint, ChickenFlip, CourtRise Web, BuGunluk Web, ParsingFaceColor, POS Tracking System and the macOS Portfolio), next to the category folders (Featured, iOS Development, and so on) that lead to the GitHub repositories. Each is a reference to the project record, so opening one shows its existing case study. Project pages, ids and records are untouched. The folder carries the description "Explore my applications, games, and development work." (shown in Get Info).

Projects remain reachable through the Desktop folder, Finder, Spotlight, Safari › Projects and the Notes projects pages.

## 4. Desktop layout

Five icons: the volume, **Projects**, **About Me** (opens the About Me note), **Contact** (opens Contact Information) and **Resume.pdf** (the existing résumé document). The wallpaper, widgets and the icon grid are unchanged.

## 5. First-time guidance

There is one onboarding system (the existing welcome plus the optional tour); it was refined, not duplicated.

- **Welcome:** "Welcome to My Desktop. This isn't a traditional portfolio. Explore my projects, learn about my experience, and discover the software I've built through an interactive desktop." Actions: **Explore Projects** (primary; opens Documents › Projects), **Explore Desktop** (dismiss) and **View Resume** (a text link, shown only when the résumé is published; opens it in Preview). Close (X) and Escape dismiss it.
- **Projects hint:** if the welcome is dismissed without choosing an action (Explore Desktop, X or Escape), a small static bubble beside the Projects folder says "Start here to explore what I've built." with a faint ring on the icon. It goes away when dismissed, when Projects is opened, or after 15 seconds. It does not blink or pulse.
- **Tour (optional, started from Help › Take a Tour or System Settings › About):** the Projects step now highlights the Projects folder; the Dock step names the six pinned apps; the Mission Control step no longer points at a Dock icon that is not there (it shows the shortcut instead). Spotlight is still introduced by the tour; no further hints were added, to keep the desktop free of tooltips.

## 6. Persistence

Unchanged: `localStorage` key `portfolio-onboarding-status` (`in-progress` / `completed` / `skipped`). A visitor with any stored value is never invited again, and the welcome is saved as `in-progress` when it appears, so a refresh does not repeat it. The Projects hint lives only in memory, so a returning visitor never sees it. If storage is blocked the guide may show again; nothing breaks.

## 7. Accessibility

The Dock icons keep their accessible names; the Projects folder is a focusable listbox option (Enter opens it); welcome buttons are real buttons with focus rings, the dialog traps Tab and restores focus; the hint is a status region with a labelled dismiss button; nothing depends on hover; the hint and welcome respect reduced motion (no animation beyond the existing fade).

## 8. Mobile and shared data

The change touches shared data only (application flags, the file system). No desktop onboarding code was added to any mobile shell; the existing controller is unchanged in where it mounts. The Dock fits a 375 px viewport (checked, no horizontal overflow).

## 9. Files modified

`src/config/applications.ts`, `src/types/application.ts`, `src/components/dock/{dock,dock-item}.tsx`, `src/data/portfolio-file-system.ts`, `src/lib/virtual-fs/{types,validate,filesystem}.ts`, `src/lib/navigation.ts`, `src/features/spotlight/utils/build-search-index.ts`, `src/features/desktop-icons/components/desktop-icons.tsx`, `src/features/onboarding/{components/onboarding-welcome,components/onboarding-controller,data/onboarding-steps}.tsx/.ts`, `src/store/onboarding-store.ts`, new `tests/desktop-ux.test.ts`, this document.

## 10. Validation (2026-11-12)

- `npm test`: 167 passing, 0 failing (7 new tests: Dock size and order, removed apps still in Launchpad and Spotlight, one Projects folder and no project icons on the Desktop, alias contents equal the real folder with each curated project once, no duplicate Spotlight entries, alias validation, tour targets).
- `npm run typecheck`, `npm run lint`, `npm run audit` and `npm run build`: clean (audit warns that 6 projects have no screenshots, as before).
- In a production build in the browser: the welcome shows once; Explore Desktop leaves the hint; opening Projects shows 20 items (11 projects and 9 folders); after a reload there is no welcome; the Dock is Finder, Launchpad, Safari, Terminal, Notes, Mail; no console errors; at 375 px the Dock fits and the page does not scroll sideways.
- Not checked in a browser: the guided tour steps one by one, Launchpad and Spotlight visually (covered by unit tests), and dev-mode hydration warnings (the production build logged none).

## 11. Remaining concerns

- Projects has no pinned Dock icon (see section 2); say so if you want a dedicated Dock shortcut and I will add it as a proper application entry.
- The Projects folder mixes projects and category folders; a "Featured" sort order would be a further refinement.
- The mobile onboarding is out of scope here, as agreed.
