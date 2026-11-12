# Personal story integration

How the developer's personal story was added to the portfolio. All text is the developer's own approved wording, used verbatim (split into short paragraphs for readability only). Nothing was added beyond it: no dates, milestones, names, figures or claims.

## 1. Sections added
| Section | Where it appears |
| --- | --- |
| **My Story** | Safari About; also opens the "My Development Journey" note |
| **What Drives Me** | Safari About; also the "Development Philosophy" note |
| **A Project Close to Me** | Full story in the BuGunluk Project Viewer; a short preview on Safari About |
| **Beyond the Code** | Safari About; also in the "About Me" note |
| **What's Next** | Safari About; also in the "About Me" note |

## 2. Content registry changes
One source for each paragraph, in the existing registries (no new content system):
- `src/data/profile.ts` (`DeveloperProfile`): new optional fields `story`, `drives`, `beyondTheCode`, `whatsNext` (each a list of paragraphs) and `closeProjectId` (the project whose story is previewed).
- `src/types/project-content.ts`: new optional `ProjectContent.personalStory` (`title`, `paragraphs`, `previewParagraphs`).
- `src/data/project-content/curated.ts`: a content entry for the existing `bugunluk` project holding its story and an outcome line.
- `src/lib/profile/validate.ts`: checks that `closeProjectId` refers to a real project and that no paragraph is empty or repeated.

## 3. Who Am I integration (Safari About)
The About page keeps its existing layout and components. Order: About Me (introduction), Education, Professional Experience, Technical Skills, then the personal sections (My Story, What Drives Me, A Project Close to Me, Beyond the Code, What's Next), then Work at a Glance, Contact (and Resume and Featured Projects when they exist). The "On this page" navigation lists every section, so a recruiter can jump straight to Education, Experience, Skills or Contact. Each personal section is a heading with short paragraphs in the page's existing reading style; no new interactive elements except one button (below). No long paragraph appears twice on the page (checked in the browser and by a test).

## 4. Safari integration
Reuses the profile data; nothing is hardcoded in components. The only new control is "Read the full story about BuGunluk", which opens the BuGunluk Project Viewer window through the existing navigation service.

## 5. BuGunluk story integration
- The existing project is reused (id `bugunluk`); no duplicate was created.
- The Project Viewer shows the verified factual Overview first, then **A Project Close to Me**, then the existing Technical Details area, whose Outcomes now read "Team project, not yet released: developed collaboratively by a small team. It has not been publicly released."
- The About page shows only a preview (the introduction and the release statement); the full story lives in one place.
- Accuracy: the text says it is unreleased and a team effort. A test fails if it contains any figure, revenue, downloads, users, store names, launch dates, or a sole-ownership claim ("I built...").
- Only BuGunluk has a personal story; every other project is unchanged.

## 6. Notes integration
No notes were added. The existing "Development Philosophy" note (previously empty and hidden) now shows What Drives Me; "My Development Journey" opens with My Story, followed by the dated timeline derived from the verified education and experience; "About Me" gains Beyond the Code and What's Next. All three read from the same profile paragraphs, and Spotlight searches them.

## 7. Files modified
New: `src/features/project-viewer/components/project-story.tsx`, `tests/personal-story.test.ts`, `docs/PERSONAL_STORY_INTEGRATION.md`.
Edited: `src/data/project-categories.ts`, `src/data/projects.ts`, `src/data/profile.ts`, `src/types/project-content.ts`, `src/data/project-content/curated.ts`, `src/lib/profile/validate.ts`, `src/lib/profile/selectors.ts`, `src/features/safari/pages/about-page.tsx`, `src/features/project-viewer/utils/project-detail.ts`, `src/features/project-viewer/components/project-viewer.tsx`, `src/types/notes.ts`, `src/data/notes.ts`, `src/features/notes/lib/content.ts`.

## 8. Decisions from the developer (2026-10-27) and what changed
1. **BuGunluk is a mobile app** (private repository, so it can't be inspected). It is filed under a new neutral **Mobile Development** category rather than guessed as iOS or Android, and the old "provisional" marker was removed. It appears in Finder under Projects, Mobile Development. It is not counted in the developer statistics, which cover public repositories only.
2. **Release status.** Not released for reasons outside the developer's control. The portfolio states only that it "hasn't been publicly released yet", with no reason, and no status badge. (An offer to add test users through Apple's developer tools was made; nothing is needed from this project for that.)
3. **Availability.** "I'm available for new opportunities now." was added as the last line of What's Next. No date, offer or job title is implied. The wording is the developer's instruction put into plain words, not part of the earlier approved text.
4. **Overlap between the introduction and My Story** is left as it is.
5. **Order.** Education, Professional Experience and Technical Skills now come right after the introduction; the personal sections (My Story, What Drives Me, A Project Close to Me, Beyond the Code, What's Next) follow, then Work at a Glance, projects, resume and contact.

## 9. Open items
- Which mobile platform BuGunluk targets (iOS, Android, or both), if the developer wants that shown. Until then it stays under Mobile Development.
- The availability sentence will need updating when the situation changes.

## 10. Superseded by PROMPT 42

BuGunluk's story text, its "Mobile Development" category and its short description were replaced when the full case study was added. See `docs/BUGUNLUK_CASE_STUDY.md`.
