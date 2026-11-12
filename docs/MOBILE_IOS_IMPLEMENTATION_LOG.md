# Mobile (iOS-inspired) experience: implementation log

Date: 2026-11-12. Branch `main`. Nothing was committed, pushed or deployed for this work.

## Baseline (before the work)

- No `AdaptiveShell` or `MobileShell`. `src/app/page.tsx` always rendered the desktop; narrow screens only drew the same windows full-screen (`compact` in `window-store`).
- `useViewportMode` returns "desktop" on the server, so a root-level switch needs a mounted gate.
- Checks at the start: `npm test` 169 passing, typecheck, lint, build and audit clean.
- Window-coupled desktop apps (Project Viewer, Preview, Notes, Photos, Terminal, Settings, Mail, social apps) cannot be reused as-is; headless data, selectors and the project section components can.

## Architecture decisions

- **Breakpoint: 767 px.** `src/lib/shell-mode.ts` (`≤767px` mobile, `≥768px` desktop; chosen by the owner). Tablets and landscape tablets get the desktop.
- **`AdaptiveShell`** (`src/components/shell/adaptive-shell.tsx`) picks one shell with `matchMedia` through `useSyncExternalStore`. The server renders only a neutral splash, so there is no flash of two shells and no hydration mismatch. Each shell is its own lazy chunk; only the active one is mounted, so the other's timers and listeners do not run. `DesktopShell` is the old page body unchanged (Desktop, StartupController, OnboardingController).
- **Own state.** `src/features/mobile/store/mobile-store.ts` (phase, navigation, one overlay at a time, home page, session unlock) and a tiny notice store. Nothing in the mobile code uses the desktop window manager (a test enforces this), and the desktop's startup, onboarding, shortcuts and preloader are only mounted by the desktop shell (also tested).
- **Pure navigation** in `src/features/mobile/lib/router.ts` (launch, push, back, home, close, recents capped at 8, deep-link hash parse/format), tested as plain data. `history-sync.ts` keeps browser history in step: one entry per app and per detail screen, tagged with its depth; the in-app Back uses `history.back()`; Home rewinds with a single `history.go`; forward steps are undone; own `go()` calls are recognised so there are no loops.
- **Deep links** by hash: `#/projects/courtrise`, `#/resume`, `#/contact`. A deep link skips the lock screen. Refresh keeps the hash; unknown hashes are ignored.
- **One content source.** Apps are listed in `lib/apps.ts` (names, icons from `public/icons/apps`, categories); all content comes from the existing registries (projects, profile, documents, media, notes, virtual file system, Spotlight index, terminal commands). Project case-study sections are the same components the desktop Project Viewer uses.
- **Shared settings.** Appearance, accent and reduce-motion use the existing settings store, so they also affect the desktop (stated in Settings and Control Center). Unlock state is `sessionStorage` only.

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| A Adaptive shell | complete | shell-mode, AdaptiveShell, DesktopShell, store, router; desktop unchanged |
| B Lock and home | complete | lock (swipe up, Enter Portfolio, ArrowUp/Escape), status bar (decorative signal/Wi-Fi/battery), home with Start Here card (featured projects), apps, Dock (Projects, Safari, Resume, Contact), page dots, App Library page |
| C App model and gestures | complete | AppFrame transition, header Back/Home, home indicator (tap, swipe up, swipe-and-hold for the switcher), browser history, deep links |
| D Control and Notification Center | complete | status-bar swipe or tap; portfolio-only controls; notices built from portfolio content, dismiss and clear |
| E Spotlight and App Library | complete | shared search index mapped to mobile routes, safe highlighting; App Library with search and categories |
| F App Switcher | complete | cards for recent apps (max 8), tap to resume, swipe up or × to close |
| G Portfolio apps | complete | Projects (featured, all, category and status filters, search, full case study), About, Resume (view and download), Contact (mailto, copy, verified profiles) |
| H Safari, Files, Settings | complete (Terminal removed at the owner's request: not a phone app; it stays on the desktop) | Safari start page (internal pages and verified links only), Files (virtual folders), Settings (portfolio-only), Terminal (real built-in commands, command chips) |
| I Polish | partial | scale/fade transitions, press states, reduced motion honoured (instant transitions); no haptics, no wallpaper variants |
| J Responsive, accessibility, performance | partial | see validation; no Lighthouse run |
| K Tests and regression | partial | unit tests and manual browser checks; no automated browser tests (none installed) |
| Photos and Notes | complete | grid and viewer with Previous/Next; reading list and note view |

## Validation actually run

- `npm test`: 182 passing, 0 failing (13 new tests in `tests/mobile-shell.test.ts`: breakpoint, navigation reducer, recents cap, deep links, app registry, search-to-route mapping, highlighting, notices, no window-manager use, no desktop startup code, external links with `noopener noreferrer`).
- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run audit`: clean.
- Production build in the built-in browser, mobile emulation 375×812: lock screen shows, Enter Portfolio unlocks, home renders, Explore Projects → project list (27 items) → CourtRise detail (hash `#/projects/courtrise`, case-study sections, App Store link) → in-app Back → browser Back → Home indicator → Resume (View and Download links) → App Switcher (cards for recent apps, focus inside the dialog, Escape closes) → Search ("court" finds CourtRise, nonsense shows the empty message, selecting a result opens it and closes the overlay) → Control Center (dark appearance toggles the theme) → Notification Center (opens, Clear all shows the empty state, only one overlay at a time) → App Library (4 groups, social apps flagged as opening in a new tab). Every app (About, Files, Photos, Notes, Terminal, Settings, Safari, Contact) opened with content and no horizontal overflow. No page errors were raised.
- 320×568: lock and home fit; the home page scrolls vertically so every icon is reachable; Dock fully inside the screen; no horizontal overflow.
- Resize from 390 px (app open) to 1024 px: the mobile shell unmounted and the desktop mounted (after its chunk loaded); desktop Dock (Finder, Launchpad, Safari, Terminal, Projects, About Me, Contact), desktop icons (Projects, Resume.pdf), welcome guide and the Projects shortcut opening Finder all worked.

## Feel and polish pass (2026-11-12, after the first review)

- Apps now grow out of the icon that was tapped (and shrink back into it); the home screen recedes (scale 0.9, dimmed) behind an open app.
- Screens inside an app slide in from the right and back from the left; Control Center and Notification Center slide down from the top; Spotlight and the App Switcher scale and fade in. All of it is instant when reduce-motion is on.
- Home layout compacted so the Start Here card, both icon rows, the page dots, Search and the Dock fit without clipping on a 630 px-tall viewport (short-screen variants below 700 px height); the App Library fades out at the bottom instead of being cut off; softer icon shadows with a hairline highlight, spring-like press feedback, smooth page swiping.
- Checked in the browser: the zoom animation (transform 0.36 at 110 ms, origin at the tapped icon, ends at none), the home recede (0.9), the fit at a 387×630 viewport. Not checked frame by frame on a real device.

## Known issues and limits

- **Not run:** widths 430 and 768 in the browser (the 768 boundary is unit-tested), landscape, real devices, screen readers, Lighthouse, touch gestures (swipe handlers were written and reasoned about but not driven with real touch input; every gesture has a button).
- **Medium:** the mobile Projects/About text colours rely on the shared theme tokens; dark mode on mobile was only checked via the theme attribute flipping, not visually in every app.
- **Low:** Control Center and Notification Center are reachable from the home screen only (the status bar is not shown inside apps); in an app, the header's switcher button is the entry to the other overlays.
- **Low:** the Resume page embeds the PDF only where the browser reports a built-in viewer; otherwise it shows just View and Download. iOS Safari shows only the first page when embedded.
- **Low:** the in-app browser console showed one `frame-ancestors 'none'` message during the desktop check; it comes from something framing the page (the preview tool), not from the app, and was not seen on mobile.
- **Low:** the LinkedIn profile URL still carries the developer's old name slug (a known content item).
- A forward step in browser history is undone rather than replayed.

## Unverified assumptions

- Touch behaviour on real iOS/Android devices, `100dvh` with the address bar, and the virtual keyboard layout in Search and Terminal.
- That sharing the appearance setting with the desktop is what the owner wants.

## Remaining work, in priority order

1. Try it on a real phone (lock, swipe gestures, keyboard in Search).
2. Check dark mode visually in each mobile app and at 430 and 768 px.
3. Add Control Center and Notification Center access inside apps if wanted.
4. Optional polish: wallpaper choices, haptics, Photos pinch-zoom.
