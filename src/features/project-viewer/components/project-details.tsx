import { ExternalLink } from "lucide-react";
import type { ProjectDetail } from "../utils/project-detail";
import { Section } from "./section";

/** Technical details, challenges, role and outcomes: each appears only when it has been written down. */
export function ProjectDetails({ id, detail }: { id: string; detail: ProjectDetail }) {
  const { technicalDetails, challenges, responsibilities, outcomes } = detail;
  const heading = "mb-1.5 text-[12px] font-semibold text-black/60";
  return (
    <Section title="Technical Details" id={id}>
      <div className="space-y-5 text-[13px] leading-[20px] text-black/80">
        {technicalDetails.length > 0 && (
          <dl className="space-y-3">
            {technicalDetails.map((d) => (
              <div key={d.title}>
                <dt className="text-[12px] font-semibold text-black/60">{d.title}</dt>
                <dd className="max-w-[68ch]">{d.body}</dd>
              </div>
            ))}
          </dl>
        )}
        {challenges.length > 0 && (
          <div>
            <h3 className={heading}>Challenges</h3>
            <ul className="space-y-3">
              {challenges.map((c) => (
                <li key={c.title} className="rounded-lg bg-black/[0.04] p-3 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.08)]">
                  <h4 className="font-medium text-black/85">{c.title}</h4>
                  <p className="mt-1 max-w-[68ch]">{c.challenge}</p>
                  {c.approach && (
                    <p className="mt-1 max-w-[68ch] text-black/65">
                      <span className="font-medium">Approach: </span>
                      {c.approach}
                    </p>
                  )}
                  {c.result && (
                    <p className="mt-1 max-w-[68ch] text-black/65">
                      <span className="font-medium">Result: </span>
                      {c.result}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {responsibilities.length > 0 && (
          <div>
            <h3 className={heading}>My role</h3>
            <ul className="list-disc space-y-1 pl-5 marker:text-black/30">
              {responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}
        {outcomes.length > 0 && (
          <div>
            <h3 className={heading}>Outcomes</h3>
            <ul className="space-y-1.5">
              {outcomes.map((o) => (
                <li key={o.label}>
                  <span className="font-medium text-black/85">{o.label}</span>
                  {o.description && <span className="text-black/65"> — {o.description}</span>}
                  {o.evidenceUrl && (
                    <a href={o.evidenceUrl} target="_blank" rel="noopener noreferrer" aria-label={`${o.label}: evidence (opens in a new tab)`} className="ml-1.5 inline-flex items-center gap-0.5 text-(--link-color) hover:underline">
                      Source
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}
