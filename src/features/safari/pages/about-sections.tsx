"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { CertificationEntry, EducationEntry, ExperienceEntry, LanguageEntry, SkillGroup } from "@/data/profile";
import { formatDateRange, formatProfileDate } from "@/lib/profile/format";
import { getSkillProjectIds } from "@/lib/profile/selectors";
import { useDeveloperStatistics } from "@/lib/projects/use-statistics";
import { openProjectById } from "@/lib/navigation";
import { getProjectById } from "@/lib/projects/registry";
import { safeHttpUrl } from "@/lib/safe-url";

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2";

function ExternalName({ name, url }: { name: string; url: string | undefined }) {
  const safe = safeHttpUrl(url);
  if (!safe) return <>{name}</>;
  return (
    <a href={safe} target="_blank" rel="noopener noreferrer" aria-label={`${name} (opens in a new tab)`} className={`inline-flex items-center gap-1 rounded hover:underline ${focusRing}`}>
      {name}
      <ExternalLink className="size-3 text-black/35" aria-hidden />
    </a>
  );
}

/** Project chips for stable registry ids; ids the registry doesn't know are skipped. */
export function ProjectChips({ ids, label }: { ids: readonly string[] | undefined; label: string }) {
  const projects = (ids ?? []).map((id) => getProjectById(id)).filter((p) => p !== undefined);
  if (projects.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px]">
      <span className="text-black/45">{label}</span>
      {projects.map((p) => (
        <button key={p.id} type="button" onClick={() => openProjectById(p.id)} className={`rounded-md bg-black/[0.06] px-2 py-0.5 text-black/75 hover:bg-black/10 ${focusRing}`}>
          {p.title}
        </button>
      ))}
    </div>
  );
}

function Badges({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Technologies">
      {items.map((t) => (
        <li key={t} className="rounded-md bg-black/[0.06] px-2 py-0.5 text-[12px] text-black/70">
          {t}
        </li>
      ))}
    </ul>
  );
}

function Timeline({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <ol aria-label={label} className="mt-4 space-y-5 border-l border-black/10 pl-5">
      {children}
    </ol>
  );
}

function TimelineItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="relative">
      <span aria-hidden className="absolute top-1.5 -left-[25px] size-2 rounded-full bg-(--accent)" />
      {children}
    </li>
  );
}

export function EducationTimeline({ entries }: { entries: readonly EducationEntry[] }) {
  return (
    <Timeline label="Education">
      {entries.map((e) => {
        const study = [e.degree, e.fieldOfStudy].filter(Boolean).join(", ");
        const dates = formatDateRange(e.startDate, e.graduationDate, e.current);
        return (
          <TimelineItem key={e.id}>
            <h3 className="text-[15px] font-semibold text-black/85">
              <ExternalName name={e.institution} url={e.institutionUrl} />
            </h3>
            {study && <p className="text-[14px] text-black/70">{study}</p>}
            <p className="text-[12px] text-black/45">{[dates, e.location].filter(Boolean).join(" · ")}</p>
            {e.description && <p className="mt-1.5 text-[14px] leading-6 text-black/65">{e.description}</p>}
            {e.highlights?.length ? (
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[14px] leading-6 text-black/65">
                {e.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : null}
            <ProjectChips ids={e.projectIds} label="Academic projects" />
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}

export function ExperienceTimeline({ entries }: { entries: readonly ExperienceEntry[] }) {
  return (
    <Timeline label="Professional experience">
      {entries.map((e) => {
        const dates = formatDateRange(e.startDate, e.endDate, e.current);
        return (
          <TimelineItem key={e.id}>
            <h3 className="text-[15px] font-semibold text-black/85">{e.role}</h3>
            <p className="text-[14px] text-black/70">
              <ExternalName name={e.organization} url={e.organizationUrl} />
            </p>
            <p className="text-[12px] text-black/45">{[dates, e.kind && e.kind.replace("-", " "), e.location].filter(Boolean).join(" · ")}</p>
            {e.description && <p className="mt-1.5 text-[14px] leading-6 text-black/65">{e.description}</p>}
            {e.responsibilities?.length ? (
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[14px] leading-6 text-black/65">
                {e.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : null}
            {e.technologies?.length ? <Badges items={e.technologies} /> : null}
            <ProjectChips ids={e.projectIds} label="Related projects" />
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}

/** Skill groups as badges. A skill with configured projects is a button that lists them. */
export function SkillGroups({ groups, featured }: { groups: readonly SkillGroup[]; featured: readonly string[] }) {
  const [selected, setSelected] = useState<string>();
  const featuredSet = new Set(featured);
  const stats = useDeveloperStatistics();
  const listed = new Set(groups.flatMap((g) => g.skills.map((s) => s.toLowerCase().replace(/\s*\(.*\)$/, ""))));
  // A skill leads to the public projects that really use it: configured by hand, or found by name in the verified project data.
  const projectsFor = (skill: string): readonly string[] => {
    const manual = getSkillProjectIds(skill);
    if (manual.length > 0) return manual;
    const bare = skill.toLowerCase().replace(/\s*\(.*\)$/, "");
    return stats.technologies.find((t) => t.name.toLowerCase() === bare)?.projectIds ?? [];
  };
  // Technologies seen in the public repositories but not listed as skills in the CV. Shown separately, never as proficiency.
  const seenInProjects = stats.technologies.map((t) => t.name).filter((n) => !listed.has(n.toLowerCase()));
  return (
    <div className="mt-4 space-y-4">
      {featured.length > 0 && (
        <div>
          <h3 className="text-[12px] font-semibold tracking-wide text-black/45 uppercase">Featured</h3>
          <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Featured skills">
            {featured.map((s) => (
              <li key={s} className="rounded-md bg-(--accent) px-2.5 py-0.5 text-[13px] font-medium text-(--accent-fg)">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {groups.map((g) => (
        <div key={g.id}>
          <h3 className="text-[12px] font-semibold tracking-wide text-black/45 uppercase">{g.name}</h3>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {g.skills.map((s) => {
              const linked = projectsFor(s).some((id) => getProjectById(id));
              return (
                <li key={s}>
                  {linked ? (
                    <button
                      type="button"
                      aria-pressed={selected === s}
                      onClick={() => setSelected(selected === s ? undefined : s)}
                      className={`rounded-md px-2.5 py-0.5 text-[13px] ${selected === s ? "bg-(--accent) text-(--accent-fg)" : "bg-black/[0.06] text-black/75 hover:bg-black/10"} ${focusRing}`}
                    >
                      {s}
                    </button>
                  ) : (
                    <span className={`inline-block rounded-md px-2.5 py-0.5 text-[13px] text-black/75 ${featuredSet.has(s) ? "bg-black/10" : "bg-black/[0.06]"}`}>{s}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {selected && <ProjectChips ids={projectsFor(selected)} label={`Projects using ${selected.replace(/\s*\(.*\)$/, "")}:`} />}
      {seenInProjects.length > 0 && (
        <div>
          <h3 className="text-[12px] font-semibold tracking-wide text-black/45 uppercase">Also used in my public GitHub projects</h3>
          <p className="mt-1.5 text-[13px] leading-6 text-black/60">{seenInProjects.join(" · ")}</p>
        </div>
      )}
    </div>
  );
}

export function CertificationList({ entries }: { entries: readonly CertificationEntry[] }) {
  return (
    <ul className="mt-3 space-y-2" aria-label="Certifications">
      {entries.map((c) => (
        <li key={c.id} className="text-[14px] text-black/75">
          <span className="font-medium text-black/85">
            <ExternalName name={c.name} url={c.credentialUrl} />
          </span>{" "}
          <span className="text-black/50">
            · {c.issuer}
            {formatProfileDate(c.issueDate) && ` · ${formatProfileDate(c.issueDate)}`}
            {formatProfileDate(c.expirationDate) && ` · Expires ${formatProfileDate(c.expirationDate)}`}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function LanguageList({ entries }: { entries: readonly LanguageEntry[] }) {
  return (
    <ul className="mt-3 space-y-1" aria-label="Languages">
      {entries.map((l) => (
        <li key={l.id} className="text-[14px] text-black/75">
          <span className="font-medium text-black/85">{l.language}</span>
          {l.proficiency && <span className="text-black/50"> · {l.proficiency}</span>}
        </li>
      ))}
    </ul>
  );
}
