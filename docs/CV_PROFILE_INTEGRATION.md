# CV and profile integration

How the developer's CV was turned into the portfolio's profile data. This report deliberately leaves out the CV's private personal details.

## Source

- **File analysed:** the Europass CV supplied by the developer (2 pages, generated 2026-10-19). It was read in place; no copy is stored in the repository, `public/`, or any generated file.
- **Single source of truth:** `src/data/profile.ts`. Safari About, Notes, Finder, Terminal and Spotlight all read it; nothing is duplicated in components.

## Extracted and published

| Item | Published value |
| --- | --- |
| Name | **Bertan Taşman**, used everywhere (decided by the developer, 2026-11-12). The CV and the App Store provider name use older spellings; they are not shown on the site |
| Title | Mobile Application Developer (the title of the current position) |
| Location | Venice, Italy (city only) |
| Contact | Work email only |
| Education | 2 entries (below) |
| Experience | 3 positions (below) |
| Skills | 5 groups, all listed in the CV |
| Spoken languages | Turkish (native), English (B2) |

### Education
1. **Ca' Foscari University of Venice**: Master's Degree, Computer Science and Information Technology. From 16 Oct 2026, **in progress**. The CV lists six key areas of study; they are shown as areas of study, not achievements.
2. **Istanbul Aydin University**: Bachelor of Science in Software Development (field of study given as Computer Science). 1 Sep 2021 to 6 Jul 2026, **completed**. Taught entirely in English.

### Experience
1. **Akıllı Otomat**, Mobile Application Developer / Software Project Coordinator: 3 Oct 2025 to present.
2. **BilgeAdam Teknoloji**, iOS Developer Intern: 1 Oct 2024 to 13 Jun 2025 (technologies: Swift, UIKit).
3. **Telpass**, Software Tester: 8 Feb 2024 to 7 Aug 2024.

Wording follows the CV's verbs ("develops", "contributes to", "takes part in", "oversees", "is involved in"). No technologies are listed for the current role because the CV names none for it. No employment type is stated, so none is shown.

### Skills and where each comes from
| Group | Skills | Source |
| --- | --- | --- |
| Programming Languages | Swift, Java, Python | CV summary |
| Mobile Development | iOS development, UIKit, SwiftUI (intermediate), Flutter, Android | CV skills list, CV summary, and the CV's description of the current role (iOS and Android apps) |
| Backend and Data | Firebase, JSON | CV summary; CV skills list |
| Developer Tools | Git, Postman | CV skills list |
| Software Engineering | Object-Oriented Programming, Analysing software specifications, Software testing | CV skills list; the Software Tester position |

- The only proficiency label is **"SwiftUI (intermediate)"**, because the CV itself states it. No other levels or percentages exist.
- **Technologies verified in public GitHub projects** are listed separately on the About page under "Also used in my public GitHub projects", so they are never mistaken for CV skills or proficiency. Skills link to the public projects that really use them, found in the verified project data.

## Matched and CV-only projects
- The CV names **no projects** (it refers only to "academic and personal projects"), so no CV project could be matched to a GitHub repository, and there are no CV-only projects. The three chat apps named under the Software Tester role were tested, not developed, and are not treated as projects.
- The public projects shown come from the GitHub analysis (`docs/GITHUB_PROJECT_ANALYSIS.md`); nothing was duplicated.

## Updated applications
- **Safari About:** full name and title, a 131-word "Who Am I", education, experience, skills, work overview, contact (email, GitHub).
- **Notes:** About Me, Education, Professional Experience, Technical Skills, Contact Information. "My Development Journey" is derived from the dated education and experience entries, so it cannot disagree with them.
- **Finder:** the Education, Experience and Skills folders list the real entries.
- **Terminal:** `whoami`, `about`, `skills`, `experience`, `education` print the profile.
- **Spotlight:** the person, both universities, the employers, skills and projects are searchable.

## Missing information and conflicts (need the developer's confirmation)
1. ~~Surname spelling~~ Resolved 2026-11-12: "Bertan Taşman" everywhere.
2. **Name shown.** The About page and Terminal use the full name; the lock screen, onboarding and widgets still say "Bertan".
3. **Title.** "Mobile Application Developer" comes from the current role. The developer's published CV website uses a different headline ("Software Engineering & AI Enthusiast | MSc Computer Science Student"); it was not adopted because the CV does not state it.
4. **Bachelor's degree.** The CV gives the degree as "Software Development" but the field of study as "Computer Science". Both are shown as written.
5. **SwiftUI and Flutter.** The CV lists them, but no public repository uses either (the statistics show 0 projects). They appear only as CV skills with no project links. This is not a contradiction (the work may be private), but it is visible to anyone who compares the two.
6. **Social links.** The CV contains no GitHub, LinkedIn, Instagram or personal-website link. GitHub is configured from the developer's own message. A LinkedIn URL exists on the developer's published CV website but is **not used** until confirmed. Instagram and a personal website: missing (for PROMPT 38).
7. **Time-sensitive wording.** "I've just started a Master's degree" will age; revisit it.
8. **Template remnant.** The CV's summary ends with stray template text ("Describe yourself here..."); it was ignored.

## Privacy review
- **Private details in the CV, not published anywhere:** birth data, nationality, the home street address and the phone number.
- **Scans.** A test (`tests/profile-cv.test.ts`) fails if a phone number, birth detail, street address or any PDF appears in source, public assets, docs or scripts. A scan of the production build output (`.next/static`, `.next/server`) found none of them.
- **Public by the developer's own choice, outside this project:** the developer's published CV website (a GitHub Pages site) already lists a phone number. This portfolio does not repeat it. The developer may want to review that page.

## Public resume status (superseded)
At the time of this report no résumé was published. See the update below: since 2026-11-12 a generated, privacy-trimmed `Resume.pdf` is published and the original CV is still not.

## Update 2026-11-12: public résumé

The developer asked for the CV to be added. The original CV contains personal identity details (birth and nationality information), a home street address, a phone number and a photo, and it spells the name "Tasman" and still has a template sentence ("Describe yourself here…"). It was therefore **not** copied into the project. Instead the portfolio publishes `public/documents/Resume.pdf`, generated from the profile registry (`npm run resume`, macOS only: `scripts/resume-data.ts` builds the content, `scripts/render-resume.swift` lays it out). It has the same professional content (summary, experience, education, selected projects, skills, languages) plus the public contact points (city, email, GitHub, LinkedIn). It is text-only (about 30 KB, selectable text) and appears on the Desktop and in Documents. Tests fail if any other PDF enters the project or if personal identity or address patterns appear in source, public assets or docs. If the developer prefers to publish the original CV as it is, that is a one-line change, but it would put the details above on a public site.

Also in this update: the About text and short summary now mention CourtRise (published), GeoAttend, LineMaster and BuGunluk; the name is "Bertan Taşman" everywhere; the Get in touch widget shows the email.
