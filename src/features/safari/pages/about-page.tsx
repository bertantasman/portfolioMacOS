"use client";

import { useEffect, useRef } from "react";
import { Download, Eye, Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { ProfileAvatar } from "@/features/social/components/profile-avatar";
import { getProfileLink } from "@/features/social/utils/social-links";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { openDocumentById, openMailCompose, openProjectById } from "@/lib/navigation";
import {
  ABOUT_SECTION_LABELS,
  getContactChannels,
  getEducation,
  getExperience,
  getFeaturedSkills,
  getFullBio,
  getShortBio,
  getSkillGroups,
  type AboutSectionId,
} from "@/lib/profile/selectors";
import { getResumeDocument, useDocumentAvailability } from "@/lib/profile/resume";
import { selectFeatured, useProjectRegistry } from "@/lib/projects/registry";
import { STAT_CATEGORIES } from "@/lib/projects/statistics";
import { useDeveloperStatistics } from "@/lib/projects/use-statistics";
import { CertificationList, EducationTimeline, ExperienceTimeline, LanguageList, SkillGroups } from "./about-sections";

export interface AboutAnchor {
  section: AboutSectionId;
  /** Changes on every request so the same section can be scrolled to again. */
  nonce: number;
}

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2";
const buttonClass = `inline-flex h-9 items-center gap-2 rounded-lg px-4 text-[14px] font-medium ${focusRing}`;

function Section({ id, setRef, children }: { id: AboutSectionId; setRef: (id: AboutSectionId) => (el: HTMLElement | null) => void; children: React.ReactNode }) {
  return (
    <section ref={setRef(id)} aria-labelledby={`about-${id}`} className="scroll-mt-16 border-t border-black/10 pt-8">
      <h2 id={`about-${id}`} className="text-[20px] font-semibold text-black/85">
        {ABOUT_SECTION_LABELS[id]}
      </h2>
      {children}
    </section>
  );
}

/** A run of short paragraphs in the page's reading style. */
function Paragraphs({ items }: { items: readonly string[] }) {
  return (
    <div className="mt-3 max-w-[68ch] space-y-3 text-[15px] leading-7 text-black/70">
      {items.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}

/** The developer's professional page, built only from the central profile. Sections without content are not shown. */
export function AboutPage({ anchor, onOpenProjects }: { anchor?: AboutAnchor; onOpenProjects?: () => void }) {
  const registry = useProjectRegistry();
  const stats = useDeveloperStatistics();
  // The kinds of work the public projects actually contain, in display order (frameworks are details, not fields of work).
  const fields = STAT_CATEGORIES.filter((c) => c.group !== "framework" && stats.categoryCounts[c.id] > 0);
  const reduced = useShouldReduceMotion();
  const refs = useRef<Partial<Record<AboutSectionId, HTMLElement | null>>>({});
  const setRef = (id: AboutSectionId) => (el: HTMLElement | null) => {
    refs.current[id] = el;
  };

  const resume = getResumeDocument();
  const resumeFile = useDocumentAvailability(resume?.src);
  const education = getEducation();
  const experience = getExperience();
  const skillGroups = getSkillGroups();
  const featuredSkills = getFeaturedSkills();
  // Only explicitly featured projects; the widget's "recent work" fallback is not a featured claim.
  const featured = selectFeatured(registry, 6);
  const featuredProjects = featured.configured ? featured.projects : [];
  const bio = getFullBio();
  // The personal sections (all from the profile). The close-to-me project's full story lives in the Project Viewer;
  // here only its preview paragraphs appear, so no long paragraph is shown twice on the page.
  const closeProject = profile.closeProjectId ? registry.byId.get(profile.closeProjectId) : undefined;
  const closeStory = closeProject?.content?.personalStory;
  const closePreview = closeStory ? (closeStory.previewParagraphs ?? [0]).flatMap((i) => (closeStory.paragraphs[i] ? [closeStory.paragraphs[i]] : [])) : [];
  const shortBio = getShortBio();
  const channels = getContactChannels();
  const social = (["github", "linkedin", "instagram"] as const).flatMap((p) => {
    const link = getProfileLink(p);
    return link ? [{ label: `${p[0].toUpperCase()}${p.slice(1)}`, url: link.url }] : [];
  });
  // The headline is already in the page header, so it does not make an introduction by itself.
  const hasIntro = Boolean(shortBio || profile.location || profile.currentFocus || profile.interests?.length);

  const sections: AboutSectionId[] = [
    ...(hasIntro ? (["introduction"] as const) : []),
    ...(education.length ? (["education"] as const) : []),
    ...(experience.length ? (["experience"] as const) : []),
    ...(skillGroups.length ? (["skills"] as const) : []),
    ...(profile.story?.length ? (["story"] as const) : []),
    ...(profile.drives?.length ? (["drives"] as const) : []),
    ...(closeProject && closePreview.length ? (["closeProject"] as const) : []),
    ...(profile.beyondTheCode?.length ? (["beyond"] as const) : []),
    ...(profile.whatsNext?.length ? (["next"] as const) : []),
    ...(fields.length ? (["work"] as const) : []),
    ...(featuredProjects.length ? (["projects"] as const) : []),
    ...(resume && resumeFile === "present" ? (["resume"] as const) : []),
    "contact",
  ];

  const scrollTo = (id: AboutSectionId) => refs.current[id]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

  const section = anchor?.section;
  const nonce = anchor?.nonce;
  const present = section ? sections.includes(section) : false;
  useEffect(() => {
    if (!section || !present) return;
    refs.current[section]?.scrollIntoView({ behavior: "auto", block: "start" });
  }, [section, nonce, present]);

  const hasSubstance = hasIntro || education.length > 0 || experience.length > 0 || skillGroups.length > 0;

  return (
    <div className="@container min-h-full bg-surface">
      <article className="mx-auto max-w-[760px] px-6 py-10 @[640px]:px-10">
        <header className="flex items-center gap-4">
          <ProfileAvatar name={profile.fullName ?? profile.displayName} src={profile.avatar} className="size-16 shrink-0 text-[20px]" />
          <div className="min-w-0">
            <h1 className="text-[28px] leading-8 font-semibold text-black/85">{profile.fullName ?? profile.displayName}</h1>
            {profile.headline && <p className="text-[15px] text-black/60">{profile.headline}</p>}
          </div>
        </header>

        {sections.length > 2 && (
          <nav aria-label="On this page" className="sticky top-0 z-10 -mx-2 mt-6 flex flex-wrap gap-1.5 bg-surface/90 px-2 py-2 backdrop-blur">
            {sections.map((id) => (
              <button key={id} type="button" onClick={() => scrollTo(id)} className={`rounded-md bg-black/[0.06] px-2.5 py-1 text-[12px] text-black/70 hover:bg-black/10 ${focusRing}`}>
                {ABOUT_SECTION_LABELS[id]}
              </button>
            ))}
          </nav>
        )}

        {!hasSubstance && (
          <p className="mt-8 text-[14px] leading-6 text-black/50">Profile details haven’t been added yet. Education, experience and skills will appear here once they are provided.</p>
        )}

        <div className="mt-8 space-y-8">
          {hasIntro && (
            <Section id="introduction" setRef={setRef}>
              <div className="mt-3 space-y-3 text-[15px] leading-7 text-black/70">
                {(bio.length > 0 ? bio : shortBio ? [shortBio] : []).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {(profile.location || profile.currentFocus) && (
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[14px]">
                  {profile.location && (
                    <>
                      <dt className="text-black/45">Location</dt>
                      <dd className="text-black/75">{profile.location}</dd>
                    </>
                  )}
                  {profile.currentFocus && (
                    <>
                      <dt className="text-black/45">Current focus</dt>
                      <dd className="text-black/75">{profile.currentFocus}</dd>
                    </>
                  )}
                </dl>
              )}
              {profile.interests?.length ? (
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Interests">
                  {profile.interests.map((i) => (
                    <li key={i} className="rounded-md bg-black/[0.06] px-2.5 py-0.5 text-[13px] text-black/70">
                      {i}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Section>
          )}

          {education.length > 0 && (
            <Section id="education" setRef={setRef}>
              <EducationTimeline entries={education} />
              {profile.certifications.length > 0 && (
                <>
                  <h3 className="mt-6 text-[15px] font-semibold text-black/85">Certifications</h3>
                  <CertificationList entries={profile.certifications} />
                </>
              )}
            </Section>
          )}

          {experience.length > 0 && (
            <Section id="experience" setRef={setRef}>
              <ExperienceTimeline entries={experience} />
            </Section>
          )}

          {skillGroups.length > 0 && (
            <Section id="skills" setRef={setRef}>
              <SkillGroups groups={skillGroups} featured={featuredSkills} />
              {profile.languages.length > 0 && (
                <>
                  <h3 className="mt-6 text-[15px] font-semibold text-black/85">Languages</h3>
                  <LanguageList entries={profile.languages} />
                </>
              )}
            </Section>
          )}

          {profile.story?.length ? (
            <Section id="story" setRef={setRef}>
              <Paragraphs items={profile.story} />
            </Section>
          ) : null}

          {profile.drives?.length ? (
            <Section id="drives" setRef={setRef}>
              <Paragraphs items={profile.drives} />
            </Section>
          ) : null}

          {closeProject && closePreview.length > 0 && (
            <Section id="closeProject" setRef={setRef}>
              <Paragraphs items={closePreview} />
              <button type="button" onClick={() => openProjectById(closeProject.id)} className={`mt-3 ${buttonClass} bg-black/[0.06] text-black/80 hover:bg-black/10`}>
                Read the full story about {closeProject.title}
              </button>
            </Section>
          )}

          {profile.beyondTheCode?.length ? (
            <Section id="beyond" setRef={setRef}>
              <Paragraphs items={profile.beyondTheCode} />
            </Section>
          ) : null}

          {profile.whatsNext?.length ? (
            <Section id="next" setRef={setRef}>
              <Paragraphs items={profile.whatsNext} />
            </Section>
          ) : null}

          {fields.length > 0 && (
            <Section id="work" setRef={setRef}>
              <p className="mt-3 text-[15px] leading-7 text-black/70">
                Explore my work across {fields.map((c) => c.tag).reduce((out, tag, i, all) => out + (i === 0 ? "" : i === all.length - 1 ? " and " : ", ") + tag, "")} projects.
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Projects by field">
                {fields.map((c) => (
                  <li key={c.id} className="rounded-md bg-black/[0.06] px-2.5 py-0.5 text-[13px] text-black/70">
                    {c.label} <span className="text-black/50">{stats.categoryCounts[c.id]}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[12px] text-black/45">Based on {stats.totalProjects} public GitHub {stats.totalProjects === 1 ? "project" : "projects"}.</p>
              {onOpenProjects && (
                <button type="button" onClick={onOpenProjects} className={`mt-3 ${buttonClass} bg-black/[0.06] text-black/80 hover:bg-black/10`}>
                  Browse Projects
                </button>
              )}
            </Section>
          )}

          {featuredProjects.length > 0 && (
            <Section id="projects" setRef={setRef}>
              <ul className="mt-3 grid gap-3 @[560px]:grid-cols-2">
                {featuredProjects.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => openProjectById(p.id)} className={`block h-full w-full rounded-xl border border-black/10 p-3 text-left hover:bg-black/[0.03] ${focusRing}`}>
                      <span className="block text-[14px] font-semibold text-black/85">{p.title}</span>
                      {p.shortDescription && <span className="mt-0.5 line-clamp-2 block text-[13px] text-black/55">{p.shortDescription}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {resume && resumeFile === "present" && (
            <Section id="resume" setRef={setRef}>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => openDocumentById(resume.id)} className={`${buttonClass} bg-(--accent) text-(--accent-fg)`}>
                  <Eye className="size-4" aria-hidden />
                  View Resume
                </button>
                <a href={resume.src} download={resume.filename} className={`${buttonClass} bg-black/[0.06] text-black/80 hover:bg-black/10`}>
                  <Download className="size-4" aria-hidden />
                  Download Resume
                </a>
              </div>
            </Section>
          )}

          <Section id="contact" setRef={setRef}>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => openMailCompose()} className={`${buttonClass} bg-(--accent) text-(--accent-fg)`}>
                <Mail className="size-4" aria-hidden />
                Write a Message
              </button>
            </div>
            {(channels.length > 0 || social.length > 0) && (
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
                {channels.map((c) => (
                  <li key={c.label}>
                    <a href={c.url} className={`rounded text-(--accent) hover:underline ${focusRing}`}>
                      {c.text}
                    </a>
                  </li>
                ))}
                {social.map((s) => (
                  <li key={s.label}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} (opens in a new tab)`} className={`rounded text-(--accent) hover:underline ${focusRing}`}>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </article>
    </div>
  );
}
