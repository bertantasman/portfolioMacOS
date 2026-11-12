# Additional projects (added 2026-11-12)

Six projects were added next to CourtRise, BuGunluk, GeoAttend and LineMaster. Each is one curated record (`src/data/projects.ts`) with its content in `src/data/project-content/curated.ts`; Finder, Safari, Spotlight and the Project Viewer all read it. None links a source repository, because the repositories are private.

| Project | Kind | Evidence used | What the page claims |
| --- | --- | --- | --- |
| **ReadPoint** | Speed-reading iOS app | The public App Store listing (same developer account as CourtRise), the project's documentation and file structure | Published on the App Store, free, category Books. Feature list from the listing and from screenshots of the developer's own build (PDF/EPUB import, 150–900 WPM, two focus modes, five themes, punctuation-aware timing, summary). Whether each is in the published version was not compared |
| **ChickenFlip** | Arcade game, iOS and Android | The iOS README and code layout; the Android README, build files and tests | Prototype. iOS: SwiftUI and SpriteKit. Android: Kotlin, libGDX, Box2D, Jetpack Compose. Feature parity is not claimed |
| **CourtRise Web** | Marketing and legal website | The project's README and source; the live site (all seven routes answer) | Live at the site named as the developer website on CourtRise's App Store listing. Linked as the live demo |
| **BuGunluk Web** | Web employer portal | The project's Firebase integration notes, responsive checklist, dependencies and files | Prototype. Login, guard, dashboard and profile are described as wired to Firebase in its notes; other screens are HTML designs |
| **ParsingFaceColor** | Computer-vision experiment | The scripts, model code, requirements and colour list | A BiSeNet face-parsing model, region averaging and colour naming. No photos, no accuracy figures |
| **POS Tracking System** | Dashboard and API | The backend README, routes, schema, dependencies and frontend views | Early prototype. No authentication is claimed (the API has no login route) |

Role is shown as "Developer" for all six: every repository's history has one author, but "solo" was not stated by the developer, so it is not claimed. Tell me if any should read "Solo Developer".

## Skills

The skill groups were extended on the developer's instruction ("I can do everything now") with the technologies these and the earlier projects use: Kotlin, TypeScript, JavaScript, Android development, Jetpack Compose, Material 3, SpriteKit, libGDX, StoreKit 2, Cloud Firestore, Cloud Functions, Firebase Cloud Messaging, Express, Prisma, Next.js, React, Tailwind CSS, HTML and CSS, OpenCV, PyTorch and MVVM. The CV's own entries are unchanged, including "SwiftUI (intermediate)", the only level the CV states.

## Not added, and open points

- **GeoAttend screenshots.** The developer asked not to add them. GeoAttend itself is unchanged.
- **Screenshots (added later the same day).** ReadPoint and ChickenFlip have 6 iPhone screenshots each, from the developer's folders `readpointss` and `chickenflipss`, resized to 660×1435 JPEG with captions. The interface in them is Turkish. A few show the operating system's "back to app" label in the status bar (it reads "buGunluk" on three ReadPoint images and "ReadPoint" on five ChickenFlip ones); they were left unaltered. ReadPoint's screenshots show **five** themes (Light, Dark, Sepia, Night, Paper), where the project's documentation said three, so the page says five. The other four projects have no screenshots.
- **Other repositories seen but not added:** BerSim ("Miles Apart", TypeScript), LineMasterWeb (Python), the older `facem` repository, and the Android/iOS repositories already covered by existing projects.
- **Repository hygiene (for the developer, not shown on the site).** The private `takipSistemi` repository contains `backend/.env.bak` and `backend/prisma/dev.db`. The first has a database URL and a JWT secret entry (values not read here) and the second is a database file. They should be removed from the repository, and any real secret rotated.
- **ParsingFaceColor** declares neither PyTorch nor torchvision in `requirements.txt`, although the code imports them.
