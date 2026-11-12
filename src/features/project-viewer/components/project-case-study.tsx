import { Check } from "lucide-react";
import type { CaseStudyGroup, CaseStudySection, ProjectCaseStudy } from "@/types/project-content";
import { Section } from "./section";

const card = "rounded-lg bg-black/[0.04] p-3 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.08)]";

function Paragraphs({ items }: { items: readonly string[] }) {
  return (
    <div className="max-w-[68ch] space-y-3 text-[13px] leading-[20px] text-black/80">
      {items.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function Checklist({ group }: { group: CaseStudyGroup }) {
  return (
    <div className={card}>
      <h3 className="text-[13px] font-medium text-black/85">{group.title}</h3>
      {group.intro && <p className="mt-0.5 text-[12px] leading-[18px] text-black/60">{group.intro}</p>}
      <ul className="mt-2 space-y-1 text-[12px] leading-[18px] text-black/75">
        {group.items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-[3px] size-3 shrink-0 text-(--accent)" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The facts a reader needs first: role, team, platform, technologies, status and start. */
export function ProjectSummary({ summary }: { summary: NonNullable<ProjectCaseStudy["summary"]> }) {
  return (
    <dl aria-label="Project summary" className={`${card} grid gap-x-4 gap-y-2 text-[12px] leading-[18px] @[520px]:grid-cols-3`}>
      {summary.map((f) => (
        <div key={f.label} className="min-w-0">
          <dt className="font-semibold text-black/55">{f.label}</dt>
          <dd className="break-words text-black/85">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The developer's responsibilities in their own words, then what they owned, by area. */
export function ProjectRole({ id, role }: { id: string; role: NonNullable<ProjectCaseStudy["role"]> }) {
  return (
    <Section title={role.title} id={id}>
      <div className="space-y-4">
        <Paragraphs items={role.paragraphs} />
        {role.ownership && (
          <div>
            <h3 className="mb-1.5 text-[12px] font-semibold text-black/60">{role.ownership.title}</h3>
            <ul className="grid gap-2 @[520px]:grid-cols-2">
              {role.ownership.items.map((i) => (
                <li key={i.label} className={card}>
                  <h4 className="text-[13px] font-medium text-black/85">{i.label}</h4>
                  <p className="mt-0.5 text-[12px] leading-[18px] text-black/60">{i.value}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}

/** How the team came together, as a compact list of stages. */
export function ProjectCollaboration({ id, collaboration }: { id: string; collaboration: NonNullable<ProjectCaseStudy["collaboration"]> }) {
  return (
    <Section title={collaboration.title} id={id}>
      <ol className="space-y-2">
        {collaboration.stages.map((s, i) => (
          <li key={s.label} className="flex gap-3 text-[13px] leading-[20px]">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-(--accent)/10 text-[11px] font-medium text-(--accent)" aria-hidden>
              {i + 1}
            </span>
            <div className="min-w-0 max-w-[68ch]">
              <span className="font-medium text-black/85">{s.label}. </span>
              <span className="text-black/75">{s.value}</span>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** Who the product helps, the design approach, and the user journeys. */
export function ProjectExperience({ id, caseStudy }: { id: string; caseStudy: ProjectCaseStudy }) {
  const { audiences, userExperience, journeys } = caseStudy;
  return (
    <Section title="User Experience" id={id}>
      <div className="space-y-5">
        {audiences && audiences.length > 0 && (
          <div className="grid gap-2 @[520px]:grid-cols-2">
            {audiences.map((g) => (
              <Checklist key={g.title} group={g} />
            ))}
          </div>
        )}
        {userExperience && (
          <div>
            <h3 className="mb-1 text-[12px] font-semibold text-black/60">{userExperience.title}</h3>
            <Paragraphs items={userExperience.paragraphs} />
            {userExperience.designElements && (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={userExperience.designElements.title}>
                {userExperience.designElements.items.map((item) => (
                  <li key={item} className="rounded-md bg-black/[0.06] px-2 py-0.5 text-[11px] text-black/70">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {journeys && journeys.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-[12px] font-semibold text-black/60">How it works</h3>
            <div className="grid gap-2 @[520px]:grid-cols-2">
              {journeys.map((g) => (
                <div key={g.title} className={card}>
                  <h4 className="text-[13px] font-medium text-black/85">{g.title}</h4>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12px] leading-[18px] text-black/75 marker:text-black/35">
                    {g.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

/** Architecture and the engineering decisions worth highlighting, each with how far it was verified. */
export function ProjectEngineering({ id, caseStudy }: { id: string; caseStudy: ProjectCaseStudy }) {
  const { architecture, highlights } = caseStudy;
  return (
    <Section title="Technical Architecture" id={id}>
      <div className="space-y-5">
        {architecture && (
          <div className="space-y-3">
            <Paragraphs items={architecture.intro} />
            <dl className="grid gap-x-4 gap-y-2 text-[12px] leading-[18px] @[520px]:grid-cols-2">
              {architecture.facts.map((f) => (
                <div key={f.label}>
                  <dt className="font-semibold text-black/60">{f.label}</dt>
                  <dd className="text-black/80">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {highlights && highlights.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-[12px] font-semibold text-black/60">Engineering highlights</h3>
            <ul className="space-y-2">
              {highlights.map((h) => (
                <li key={h.title} className={card}>
                  <h4 className="text-[13px] font-medium text-black/85">{h.title}</h4>
                  <p className="mt-1 max-w-[68ch] text-[13px] leading-[20px] text-black/80">{h.body}</p>
                  {h.verification && <p className="mt-1 max-w-[68ch] text-[12px] leading-[18px] text-black/55">{h.verification}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}

/** Where the project stands today and what is still unfinished. Status is text, never color alone. */
export function ProjectCurrentStatus({ id, status }: { id: string; status: NonNullable<ProjectCaseStudy["currentStatus"]> }) {
  return (
    <Section title="Current Status" id={id}>
      <div className="space-y-3">
        <ul className="flex flex-wrap gap-1.5" aria-label="Development status">
          {status.badges.map((b) => (
            <li key={b} className="rounded-md bg-(--accent)/10 px-2 py-0.5 text-[11px] text-(--accent)">
              {b}
            </li>
          ))}
        </ul>
        <Paragraphs items={status.paragraphs} />
        {status.next && (
          <div>
            <h3 className="mb-1 text-[12px] font-semibold text-black/60">{status.next.title}</h3>
            <ul className="max-w-[68ch] list-disc space-y-1 pl-5 text-[13px] leading-[20px] text-black/80 marker:text-black/30">
              {status.next.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}

/** A generic case-study section: text, labelled items (with optional colour chips), bullets, badges and a caveat. */
export function ProjectCaseSection({ id, section }: { id: string; section: CaseStudySection }) {
  const { paragraphs, items, bulletsIntro, bullets, badges, note } = section;
  return (
    <Section title={section.title} id={id}>
      <div className="space-y-3">
        {badges && badges.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Status">
            {badges.map((b) => (
              <li key={b} className="rounded-md bg-(--accent)/10 px-2 py-0.5 text-[11px] text-(--accent)">
                {b}
              </li>
            ))}
          </ul>
        )}
        {paragraphs && <Paragraphs items={paragraphs} />}
        {items && items.length > 0 && (
          <ul className="grid gap-2 @[520px]:grid-cols-2">
            {items.map((i) => (
              <li key={i.label} className={card}>
                <h3 className="flex items-center gap-2 text-[13px] font-medium text-black/85">
                  {i.swatch && <span className="size-3.5 shrink-0 rounded-full shadow-[0_0_0_0.5px_rgba(0,0,0,0.3)]" style={{ backgroundColor: i.swatch }} aria-hidden />}
                  {i.label}
                </h3>
                {i.value && <p className="mt-0.5 text-[12px] leading-[18px] text-black/60">{i.value}</p>}
              </li>
            ))}
          </ul>
        )}
        {bulletsIntro && <p className="max-w-[68ch] text-[13px] leading-[20px] text-black/80">{bulletsIntro}</p>}
        {bullets && bullets.length > 0 && (
          <ul className="max-w-[68ch] list-disc space-y-1 pl-5 text-[13px] leading-[20px] text-black/80 marker:text-black/30">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
        {note && <p className="max-w-[68ch] text-[12px] leading-[18px] text-black/55">{note}</p>}
      </div>
    </Section>
  );
}
