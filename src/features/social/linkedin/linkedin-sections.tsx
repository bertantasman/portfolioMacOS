import type { ReactNode } from "react";
import { profile } from "@/data/profile";
import { formatDateRange } from "@/lib/profile/format";
import { getEducation, getExperience, getFullBio, getShortBio, getSkillGroups } from "@/lib/profile/selectors";

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="rounded-lg border border-black/10 bg-raised/70 p-5">
      <h2 className="mb-3 text-[16px] font-semibold text-black/90">{title}</h2>
      {children}
    </section>
  );
}

const muted = (text: string) => <p className="text-[13px] text-black/40 italic">{text}</p>;

export function LinkedInAbout() {
  const summary = getShortBio();
  const paragraphs = getFullBio();
  return (
    <Card title="About">
      {summary ? (
        <div className="max-w-[70ch] text-[13px] leading-5 text-black/75">
          <p>{summary}</p>
          {paragraphs.length > 1 && (
            <details className="mt-2">
              <summary className="cursor-pointer rounded text-(--link-color) outline-none focus-visible:ring-2 focus-visible:ring-(--accent)">Read the full introduction</summary>
              <div className="mt-2 space-y-2">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </details>
          )}
        </div>
      ) : (
        muted("No biography has been added yet.")
      )}
    </Card>
  );
}

export function LinkedInExperience() {
  return (
    <Card title="Experience">
      {profile.experience.length === 0 ? (
        muted("No experience has been added yet.")
      ) : (
        <ul className="space-y-4">
          {getExperience().map((e) => {
            const dates = formatDateRange(e.startDate, e.endDate, e.current);
            return (
              <li key={e.id}>
                <h3 className="text-[14px] font-semibold text-black/90">{e.role}</h3>
                <p className="text-[13px] text-black/70">{e.organization}</p>
                {dates && <p className="text-[12px] text-black/45">{dates}</p>}
                {e.description && <p className="mt-1 text-[13px] text-black/70">{e.description}</p>}
                {e.responsibilities && e.responsibilities.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[13px] text-black/70">
                    {e.responsibilities.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                )}
                {e.technologies && e.technologies.length > 0 && (
                  <p className="mt-1 text-[12px] text-black/50">{e.technologies.join(" · ")}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export function LinkedInEducation() {
  return (
    <Card title="Education">
      {profile.education.length === 0 ? (
        muted("No education has been added yet.")
      ) : (
        <ul className="space-y-4">
          {getEducation().map((e) => {
            const dates = formatDateRange(e.startDate, e.graduationDate, e.current);
            const detail = [e.degree, e.fieldOfStudy].filter(Boolean).join(", ");
            return (
              <li key={e.id}>
                <h3 className="text-[14px] font-semibold text-black/90">{e.institution}</h3>
                {detail && <p className="text-[13px] text-black/70">{detail}</p>}
                {dates && <p className="text-[12px] text-black/45">{dates}</p>}
                {e.description && <p className="mt-1 text-[13px] text-black/70">{e.description}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export function LinkedInSkills() {
  return (
    <Card title="Skills">
      {getSkillGroups().length === 0 ? (
        muted("No skills have been added yet.")
      ) : (
        <div className="space-y-3">
          {getSkillGroups().map((g) => (
            <div key={g.id}>
              <h3 className="mb-1 text-[12px] font-semibold text-black/55">{g.name}</h3>
              <ul className="flex flex-wrap gap-1.5">
                {g.skills.map((s) => (
                  <li key={s} className="rounded-full border border-black/15 px-2.5 py-0.5 text-[12px] text-black/75">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
