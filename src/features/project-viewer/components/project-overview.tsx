import { Section } from "./section";

function Paragraphs({ items }: { items: readonly string[] }) {
  return (
    <div className="max-w-[68ch] space-y-3 text-[13px] leading-[20px] text-black/80">
      {items.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/** What the project is, and (only when written down) the problem it addresses and how. */
export function ProjectOverview({ id, overview, problem, solution }: { id: string; overview: readonly string[]; problem: readonly string[]; solution: readonly string[] }) {
  return (
    <Section title="Overview" id={id}>
      <div className="space-y-4">
        <Paragraphs items={overview} />
        {problem.length > 0 && (
          <div>
            <h3 className="mb-1 text-[12px] font-semibold text-black/60">The problem</h3>
            <Paragraphs items={problem} />
          </div>
        )}
        {solution.length > 0 && (
          <div>
            <h3 className="mb-1 text-[12px] font-semibold text-black/60">The solution</h3>
            <Paragraphs items={solution} />
          </div>
        )}
      </div>
    </Section>
  );
}
