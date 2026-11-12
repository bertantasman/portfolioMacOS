import type { TechnologyGroup } from "../utils/project-detail";
import { Section } from "./section";

/** Technology badges, grouped by role only where the content says what the roles are. */
export function ProjectTechnologies({ id, groups }: { id: string; groups: readonly TechnologyGroup[] }) {
  return (
    <Section title="Technologies" id={id}>
      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.label ?? "all"}>
            {g.label && <h3 className="mb-1.5 text-[12px] font-semibold text-black/55">{g.label}</h3>}
            <ul className="flex flex-wrap gap-1.5">
              {g.items.map((tech) => (
                <li key={tech} className="rounded-md bg-black/[0.06] px-2 py-0.5 text-[12px] text-black/75 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.08)]">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
