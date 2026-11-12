import type { ProjectPersonalStory } from "@/types/project-content";
import { Section } from "./section";

/** The developer's own words about why a project matters to them. Shown only when a project has one. */
export function ProjectStory({ id, story }: { id: string; story: ProjectPersonalStory }) {
  return (
    <Section title={story.title} id={id}>
      <div className="max-w-[68ch] space-y-3 text-[13px] leading-[20px] text-black/80">
        {story.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </Section>
  );
}
