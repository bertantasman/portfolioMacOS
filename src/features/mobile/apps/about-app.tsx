"use client";

import { profile } from "@/data/profile";
import { getDocumentById, isPublished } from "@/data/documents";
import { formatDateRange } from "@/lib/profile/format";
import { ABOUT_SECTION_LABELS, getEducation, getExperience, getFullBio, getSkillGroups, paragraphsOf } from "@/lib/profile/selectors";
import { AppScreen } from "../components/app-screen";
import { useMobileStore } from "../store/mobile-store";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-2 text-[20px] font-bold text-black/90">{title}</h2>
      {children}
    </section>
  );
}
const Paragraphs = ({ items }: { items: readonly string[] | undefined }) => (
  <div className="space-y-3 text-[15px] leading-[23px] text-black/80">{(items ?? []).map((p, i) => <p key={i}>{p}</p>)}</div>
);

/** Who the developer is, from the shared profile: story, experience, education and skills. Nothing is written here. */
export default function AboutApp() {
  const openApp = useMobileStore((s) => s.openApp);
  const name = (profile.fullName ?? profile.displayName)?.trim();
  const bio = getFullBio();
  const resume = profile.resume ? getDocumentById(profile.resume.documentId) : undefined;
  const hasResume = !!resume && isPublished(resume);
  const cta = "h-11 rounded-full px-5 text-[15px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-(--accent) active:scale-95";
  return (
    <AppScreen title="About">
      <div className="pb-6">
        <h2 className="text-[26px] leading-8 font-bold text-black/90">{name}</h2>
        {profile.headline && <p className="mt-0.5 text-[15px] text-black/60">{profile.headline}</p>}
        {profile.location && <p className="text-[13px] text-black/45">{profile.location}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => openApp("projects")} className={`${cta} bg-(--accent) text-(--accent-fg)`}>View Projects</button>
          {hasResume && <button type="button" onClick={() => openApp("resume")} className={`${cta} bg-black/[0.07] text-black/85`}>Resume</button>}
          <button type="button" onClick={() => openApp("contact")} className={`${cta} bg-black/[0.07] text-black/85`}>Contact</button>
        </div>
        <div className="mt-5"><Paragraphs items={bio.length > 0 ? bio : paragraphsOf(profile.shortBio)} /></div>

        {profile.story && profile.story.length > 0 && <Section title={ABOUT_SECTION_LABELS.story}><Paragraphs items={profile.story} /></Section>}
        {profile.drives && profile.drives.length > 0 && <Section title={ABOUT_SECTION_LABELS.drives}><Paragraphs items={profile.drives} /></Section>}
        {profile.beyondTheCode && profile.beyondTheCode.length > 0 && <Section title={ABOUT_SECTION_LABELS.beyond}><Paragraphs items={profile.beyondTheCode} /></Section>}
        {profile.whatsNext && profile.whatsNext.length > 0 && <Section title={ABOUT_SECTION_LABELS.next}><Paragraphs items={profile.whatsNext} /></Section>}

        {getExperience().length > 0 && (
          <Section title={ABOUT_SECTION_LABELS.experience}>
            <ul className="space-y-3">
              {getExperience().map((e) => (
                <li key={e.id} className="rounded-2xl border border-black/10 bg-surface-2 p-3.5">
                  <p className="text-[16px] font-semibold text-black/90">{e.role}</p>
                  <p className="text-[14px] text-black/70">{e.organization}{e.location ? ` · ${e.location}` : ""}</p>
                  <p className="text-[12px] text-black/50">{formatDateRange(e.startDate, e.endDate, e.current)}</p>
                  {e.description && <p className="mt-1.5 text-[14px] leading-5 text-black/75">{e.description}</p>}
                </li>
              ))}
            </ul>
          </Section>
        )}
        {getEducation().length > 0 && (
          <Section title={ABOUT_SECTION_LABELS.education}>
            <ul className="space-y-3">
              {getEducation().map((e) => (
                <li key={e.id} className="rounded-2xl border border-black/10 bg-surface-2 p-3.5">
                  <p className="text-[16px] font-semibold text-black/90">{e.institution}</p>
                  <p className="text-[14px] text-black/70">{[e.degree, e.fieldOfStudy].filter(Boolean).join(", ")}</p>
                  <p className="text-[12px] text-black/50">{formatDateRange(e.startDate, e.graduationDate, e.current)}</p>
                </li>
              ))}
            </ul>
          </Section>
        )}
        {getSkillGroups().length > 0 && (
          <Section title={ABOUT_SECTION_LABELS.skills}>
            <div className="space-y-4">
              {getSkillGroups().map((g) => (
                <div key={g.id}>
                  <h3 className="mb-1.5 text-[13px] font-semibold text-black/55">{g.name}</h3>
                  <ul className="flex flex-wrap gap-1.5">{g.skills.map((s) => <li key={s} className="rounded-full bg-black/[0.07] px-3 py-1 text-[13px] text-black/80">{s}</li>)}</ul>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </AppScreen>
  );
}
