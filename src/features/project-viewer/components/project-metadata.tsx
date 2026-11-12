import type { MetadataRow } from "../utils/project-utils";
import { Section } from "./section";

export function ProjectMetadata({ rows }: { rows: MetadataRow[] }) {
  if (rows.length === 0) return null;
  return (
    <Section title="Information">
      <dl className="max-w-[420px] divide-y divide-black/[0.06] rounded-lg bg-black/[0.03] px-3 text-[12px] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.08)]">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-4 py-1.5">
            <dt className="text-black/50">{label}</dt>
            <dd className="text-right text-black/80">{value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
