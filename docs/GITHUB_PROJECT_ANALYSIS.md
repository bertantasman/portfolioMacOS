# GitHub project analysis

Developer-facing audit of the public repositories of the connected GitHub account. Visitors never see this page, the evidence or the confidence levels; they see the written descriptions in `src/data/project-content/curated.ts`.

- **Account:** `bertantasman` (https://github.com/bertantasman)
- **Analysed:** 2026-10-26, from the GitHub REST API (all pages), each repository's file tree, its README and project notes where present, and its main source files.
- **Public repositories discovered:** 13 (one API page; no further page; ids unique)
- **Repositories analysed:** 13 of 13
- **Repositories with public text integrated:** 12 (the 13th, the profile README repository, is not a project and is hidden)
- **Confidence:** high 6, medium 6, low 1
- **Not analysed:** `buGunluk` (linked from the CV website) returns 404 and is not a public repository, so it could not be inspected. The curated BuGunluk description is unchanged. The macOS portfolio's own repository is also not public.

## Inventory

| ID | Repository | Language | Fork | Archived | README | Branch | Last push | Topics |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1229286523 | [AI_DJ](https://github.com/bertantasman/AI_DJ) | Python | no | no | no | main | 2026-05-04 | – |
| 739529864 | [bertantasman](https://github.com/bertantasman/bertantasman) | – | no | no | yes | main | 2026-03-20 | config, github-config |
| 911681469 | [Contact-App](https://github.com/bertantasman/Contact-App) | Swift | no | no | no | main | 2025-01-03 | – |
| 998793837 | [ImageProcessing](https://github.com/bertantasman/ImageProcessing) | Jupyter Notebook | no | no | yes | main | 2025-06-09 | – |
| 962026935 | [InstaClone](https://github.com/bertantasman/InstaClone) | Swift | no | no | no | main | 2025-07-03 | – |
| 739096794 | [Math-Exam](https://github.com/bertantasman/Math-Exam) | Java | no | no | no | main | 2024-01-06 | – |
| 911678187 | [MovieApp](https://github.com/bertantasman/MovieApp) | Swift | no | no | no | main | 2025-01-03 | – |
| 739478338 | [Number-Guess](https://github.com/bertantasman/Number-Guess) | Java | no | no | no | main | 2024-01-05 | – |
| 1432054028 | [portfolio](https://github.com/bertantasman/portfolio) | JavaScript | no | no | yes | main | 2026-10-24 | – |
| 601302440 | [Programlamaya-Giris](https://github.com/bertantasman/Programlamaya-Giris) | – | yes | no | yes | Programlamaya-Giriş | 2023-02-22 | – |
| 1264257996 | [SmartHat](https://github.com/bertantasman/SmartHat) | – | no | no | no | main | 2026-06-09 | – |
| 1178906645 | [TaskFlow](https://github.com/bertantasman/TaskFlow) | JavaScript | no | no | yes | main | 2026-05-15 | – |
| 911682415 | [Tech-Category-App](https://github.com/bertantasman/Tech-Category-App) | Swift | no | no | no | main | 2025-01-03 | – |

## Project-by-project audit

### AI_DJ → shown as “GestureDeck”

- **URL:** https://github.com/bertantasman/AI_DJ
- **Project ID:** `github:1229286523`
- **Type:** prototype · **Confidence:** high · **Public text:** yes
- **Statistics fields:** platforms: desktop · frameworks: – · areas: computer-vision · README: no · fork: no
- **Short description:** A prototype that lets someone control music with hand gestures in front of a webcam. It recognises hand poses in real time and turns them into DJ-style actions such as play, pause, track changes, short loops, volume and a filter effect.
- **Technologies (evidence-based):** Python, OpenCV, MediaPipe, NumPy, SciPy, sounddevice, SoundFile
- **Evidence:**
  - `PROJECT.md`: Calls the project GestureDeck, a local, playlist-based, camera-controlled DJ prototype; lists goals and future ideas.
  - `main.py`: Implements hold-to-confirm gestures, two-hand swipes for track changes, 0.5s and 1s loops, hand-height volume and filter, keyboard shortcuts, and a preview window.
  - `gesture_detector.py`: MediaPipe hand tracking with up to two hands; classifies by extended finger count.
  - `audio_engine.py / requirements.txt`: Audio playback with sounddevice, soundfile, NumPy and a SciPy filter; waveform bars. pygame (named in PROJECT.md) is not used.
- **Unresolved questions:**
  - The implementation is further along than PROJECT.md's MVP plan; confirm whether it is still in development.
  - The repository description is in Turkish and calls it 'hand song control'.

### bertantasman

- **URL:** https://github.com/bertantasman/bertantasman
- **Project ID:** `github:739529864`
- **Type:** not-a-project · **Confidence:** high · **Public text:** no (hidden from the project list)
- **Statistics fields:** platforms: – · frameworks: – · areas: – · README: yes · fork: no
- **Evidence:**
  - `README.md`: The GitHub profile README (a repository named after the account); it contains profile badges, not a project.
- **Unresolved questions:**
  - Hidden from the project list through data/github-overrides.ts.

### Contact-App → shown as “Contact App”

- **URL:** https://github.com/bertantasman/Contact-App
- **Project ID:** `github:911681469`
- **Type:** learning-project · **Confidence:** medium · **Public text:** yes
- **Statistics fields:** platforms: ios · frameworks: uikit · areas: – · README: no · fork: no
- **Short description:** A simple iPhone contact book. Users add people with a name, surname, phone number and gender, edit existing entries and delete them after a confirmation. Contacts are kept in memory while the app is open.
- **Technologies (evidence-based):** Swift, UIKit
- **Evidence:**
  - `ui/views/Anasayfa.swift`: Table of contacts with empty-state label, swipe-to-delete with confirmation.
  - `ui/views/KisiKayit.swift`: Form for name, surname, phone and gender with empty-field validation.
  - `repository tree`: No Core Data model or storage code was found, so contacts appear to live in memory only.
- **Unresolved questions:**
  - No README. The in-memory conclusion rests on the absence of storage code.

### ImageProcessing → shown as “Image Processing Final Project”

- **URL:** https://github.com/bertantasman/ImageProcessing
- **Project ID:** `github:998793837`
- **Type:** academic-project · **Confidence:** high · **Public text:** yes
- **Statistics fields:** platforms: other · frameworks: – · areas: image-processing · README: yes · fork: no
- **Short description:** A university image-processing assignment with six problems solved in Python. A notebook applies techniques such as grayscale conversion, intensity transformations, blurring, noise filtering, sharpening and contrast enhancement to sample images.
- **Technologies (evidence-based):** Python, OpenCV, NumPy, Matplotlib, Jupyter Notebook
- **Evidence:**
  - `README.md`: UYG332 Image Processing final project; six problems in Python and OpenCV; libraries listed.
  - `final_project.ipynb`: Six code cells using OpenCV colour conversion, intensity transformations, Gaussian and median filtering, blur-subtract sharpening and CLAHE.
- **Unresolved questions:**
  - The exact content of each of the six problems is not described in text; techniques were read from the code.

### InstaClone

- **URL:** https://github.com/bertantasman/InstaClone
- **Project ID:** `github:962026935`
- **Type:** learning-project · **Confidence:** medium · **Public text:** yes
- **Statistics fields:** platforms: ios · frameworks: uikit · areas: – · README: no · fork: no
- **Short description:** An iPhone app modelled on Instagram. Users sign up, share photos with captions, like and comment on posts, edit their profile and exchange direct messages, with posts and chats stored in an online backend.
- **Technologies (evidence-based):** Swift, UIKit, Firebase Authentication, Cloud Firestore, Firebase Storage, SDWebImage
- **Evidence:**
  - `UI/Login/*.swift`: Firebase email/password sign-up and login; profile creation in Firestore.
  - `UI/Share/sharePostScreen.swift`: Camera or library photo uploaded to Firebase Storage, post saved in Firestore with a description.
  - `UI/Home/homeScreen.swift, UI/Comments, UI/Messages`: Realtime feed, likes, comments and one-to-one chats through Firestore listeners; images loaded with SDWebImage.
- **Unresolved questions:**
  - No README: the purpose ('learning project') is inferred from the code, not stated.
  - Whether the app was run against a live Firebase project is unknown.
  - A Firebase configuration file (GoogleService-Info.plist) is committed to the public repository.

### Math-Exam → shown as “Math Exam”

- **URL:** https://github.com/bertantasman/Math-Exam
- **Project ID:** `github:739096794`
- **Type:** learning-project · **Confidence:** medium · **Public text:** yes
- **Statistics fields:** platforms: android · frameworks: android-views · areas: – · README: no · fork: no
- **Short description:** An Android app with four math practice modes: arithmetic quizzes, powers, factorials and a quadratic-equation solver. The quiz modes ask randomly generated questions and keep a score.
- **Technologies (evidence-based):** Java, Android, Gradle
- **Evidence:**
  - `MainActivity.java`: Start screen opening four activities.
  - `Basit.java, usluRakamlar.java, Faktoriyel.java`: Randomly generated question rounds with answer checking.
  - `KokBulmaca.java`: Quadratic equation roots from three inputs using the discriminant.
  - `app/release/app-release.aab`: A packaged release build is committed.
- **Unresolved questions:**
  - No README. Whether the app was published to a store is unknown, so no publication is claimed.

### MovieApp → shown as “Movie App”

- **URL:** https://github.com/bertantasman/MovieApp
- **Project ID:** `github:911678187`
- **Type:** learning-project · **Confidence:** medium · **Public text:** yes
- **Statistics fields:** platforms: ios · frameworks: uikit · areas: – · README: no · fork: no
- **Short description:** An iPhone app for browsing movies. Users search for films by title, keep scrolling to load more results, and open a detail page with a poster and information for each movie, loaded from the OMDb online movie database.
- **Technologies (evidence-based):** Swift, UIKit, Alamofire, RxSwift, OMDb API, CocoaPods
- **Evidence:**
  - `filmlerDaoRepository.swift`: Alamofire requests to the OMDb API for search, paging and details, decoded with JSONDecoder.
  - `ViewController.swift / ViewModels`: Search bar with live updates, load-more on scroll; MVVM folder structure.
  - `filmDetayView.swift`: Detail screen with poster, description, cast and details.
  - `ViewControllerViewModel.swift, filmlerDaoRepository.swift`: RxSwift BehaviorSubject exposes the film list to the screen, which subscribes to it.
- **Unresolved questions:**
  - No README: purpose inferred from the code.
  - An OMDb API key is hardcoded in the public source and should be revoked and moved out of the repository.

### Number-Guess → shown as “Number Guess”

- **URL:** https://github.com/bertantasman/Number-Guess
- **Project ID:** `github:739478338`
- **Type:** learning-project · **Confidence:** high · **Public text:** yes
- **Statistics fields:** platforms: android · frameworks: android-views · areas: – · README: no · fork: no
- **Short description:** A number-guessing game for Android. The player has five attempts to find a hidden number between 1 and 50, gets 'go up' or 'go down' hints, and loses points for every wrong guess.
- **Technologies (evidence-based):** Java, Android, Gradle
- **Evidence:**
  - `MainActivity.java`: Random number 1-50, five attempts, higher/lower hints, score from 100 minus 20 per wrong guess.
  - `app/release/app-release.apk`: A packaged release build is committed.
- **Unresolved questions:**
  - No README. Publication status unknown.

### portfolio → shown as “CV Website”

- **URL:** https://github.com/bertantasman/portfolio
- **Project ID:** `github:1432054028`
- **Type:** website · **Confidence:** medium · **Public text:** yes
- **Statistics fields:** platforms: web · frameworks: – · areas: – · README: yes · fork: no
- **Short description:** A personal CV website published on GitHub Pages. It presents a short biography, experience, education, skills and contact links, and was created from a workshop template that builds the site with AI-assisted tooling.
- **Technologies (evidence-based):** HTML, JavaScript, GitHub Pages
- **Evidence:**
  - `README.md`: A workshop template ('Portfolio template, 90-minute version') for building a site with AI agents on GitHub Pages.
  - `site/content.json`: Filled with this developer's biography, experience, education, skills and links.
  - `GitHub API`: Created from fabkrum/portfolio-template-90; GitHub Pages enabled; two commits on 2026-10-24.
- **Unresolved questions:**
  - This is the CV site, not the macOS portfolio. The macOS portfolio's own repository is not among the public repositories.

### Programlamaya-Giris → shown as “Programlamaya Giriş (fork)”

- **URL:** https://github.com/bertantasman/Programlamaya-Giris
- **Project ID:** `github:601302440`
- **Type:** fork · **Confidence:** high · **Public text:** yes
- **Statistics fields:** platforms: – · frameworks: – · areas: – · README: yes · fork: yes
- **Short description:** A fork of an open-source Turkish collection of introductory programming exercises and solutions, such as printing text and dates and calculating factorials, written in many languages. The material comes from the original project.
- **Technologies (evidence-based):** –
- **Evidence:**
  - `GitHub API`: Fork of BilgisayarKavramlari/Programlamaya-Giris (507 stars).
  - `commit history`: Recent history consists of the upstream maintainers' merges; no commits by this account were seen.
  - `repository tree`: Introductory exercises (Hello World, dates, factorial, polynomial roots) in about ten languages.
- **Unresolved questions:**
  - Whether any file was changed by this account was not determined beyond the commit history.

### SmartHat → shown as “SmartHat”

- **URL:** https://github.com/bertantasman/SmartHat
- **Project ID:** `github:1264257996`
- **Type:** empty · **Confidence:** low · **Public text:** yes
- **Statistics fields:** platforms: – · frameworks: – · areas: – · README: no · fork: no
- **Short description:** A repository created for a project called SmartHat. It does not contain any files yet, so there is no code or documentation to describe.
- **Technologies (evidence-based):** –
- **Evidence:**
  - `GitHub API`: The repository is empty (size 0, 'Git Repository is empty').
- **Unresolved questions:**
  - What SmartHat is intended to be. Add a description or code, or hide the repository.

### TaskFlow

- **URL:** https://github.com/bertantasman/TaskFlow
- **Project ID:** `github:1178906645`
- **Type:** academic-project · **Confidence:** high · **Public text:** yes
- **Statistics fields:** platforms: web, backend · frameworks: express · areas: distributed-systems · README: yes · fork: no
- **Short description:** A task management system built for a university course on distributed systems. Users register, log in and share tasks privately, publicly or with chosen colleagues, while separate services handle accounts, tasks, notifications and monitoring.
- **Technologies (evidence-based):** JavaScript, HTML, CSS, Node.js, Express, JWT, SQLite, RabbitMQ, Docker, Prometheus, Grafana, Jest
- **Evidence:**
  - `README.md`: Lists four student authors; describes services, access rules, frontend features, API and tech stack.
  - `project.md`: States it is a distributed-systems university assignment.
  - `docker-compose.yml, */index.js, tests/`: Confirms gateway, auth, task and notification services, RabbitMQ, Prometheus, Grafana and Jest tests.
- **Unresolved questions:**
  - Which parts were written by this developer is not stated. No individual contribution is claimed.
  - The notification service only logs events (per the README).

### Tech-Category-App → shown as “Tech Category App”

- **URL:** https://github.com/bertantasman/Tech-Category-App
- **Project ID:** `github:911682415`
- **Type:** learning-project · **Confidence:** medium · **Public text:** yes
- **Statistics fields:** platforms: ios · frameworks: uikit · areas: – · README: no · fork: no
- **Short description:** A small iPhone product catalogue for technology items. Users browse four categories (computers, phones, watches and headphones) and open a product to see its photo, price, any previous price and a detailed description.
- **Technologies (evidence-based):** Swift, UIKit
- **Evidence:**
  - `kategoriApp/Anasayfa.swift`: Four categories with twelve hard-coded products (names, prices, old prices, descriptions in Turkish).
  - `urunler/, urun/urunView.swift`: Product list per category and a detail page with image, price, struck-through old price and description.
- **Unresolved questions:**
  - No README: purpose inferred. No network or storage code.

## Needs manual review

- **Hardcoded API key (MovieApp).** An OMDb API key is written into the source of the public repository. Revoke it, create a new one and keep it out of the code.
- **Firebase configuration file (InstaClone).** `GoogleService-Info.plist` is committed to a public repository. Firebase keys identify an app rather than grant access, but make sure the project's security rules and API key restrictions are set.
- **SmartHat** is empty. It is hidden from the project list (an override in `src/data/github-overrides.ts`); add a description or code and remove the override to show it.
- **portfolio** is the CV website from a workshop template, not the macOS portfolio. Confirm the wording is what you want.
- **TaskFlow** was built by four students. The text says so and claims no individual contribution; add a “My role” entry (`responsibilities`) if you want to state yours.
- **Programlamaya-Giris** is a fork with no visible changes by this account. It is hidden from the project list (forks are) and described as another project's work.
- **Repositories without a README.** Eight of the 13 have none (AI_DJ has a `PROJECT.md` instead, and SmartHat is empty). The other six rest mainly on source code, which is why most are rated medium confidence. Adding READMEs would also fill the Project Viewer's README section. None of the repositories has GitHub topics, and no project has screenshots yet.
- **Featured projects** are not configured (`src/data/project-content/featured.ts` is empty). Nothing was featured automatically.

See `docs/DEVELOPER_STATISTICS.md` for the platform, framework and technology counts derived from these records.

## Method

1. Fetched every repository page for the account and checked the count and id uniqueness.
2. Read each repository's full file tree, README and project notes where present, then representative source files (entry points, main screens, services, build files).
3. Recorded technologies only where a file proves them (imports, manifests, package files). For example Swift is not taken to mean SwiftUI: the iOS projects use UIKit, and no repository contains Flutter or SwiftUI code.
4. Wrote the summary and overview first and the technology list last, kept implemented behaviour separate from plans (GestureDeck's PROJECT.md lists MVP goals and future ideas; only what the code does is stated), and labelled maturity conservatively.
5. Recorded statistics-ready fields (platforms, frameworks, areas, README, fork) per repository, only where a file proves them, so a later stage can count projects without re-reading prose. No totals are calculated here.
6. Stored the public text in `curated.ts` and the evidence in `analysis.ts`, validated by `tests/project-analysis.test.ts`.
