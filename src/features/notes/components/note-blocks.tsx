import { ArrowUpRight, Info } from "lucide-react";
import { getProjectById } from "@/lib/projects/registry";
import { safeHttpUrl } from "@/lib/safe-url";
import type { Inline, NoteBlock } from "@/types/notes";

function Inlines({ inline }: { inline: readonly Inline[] }) {
  return (
    <>
      {inline.map((span, i) => {
        let node: React.ReactNode = span.text;
        if (span.bold) node = <strong className="font-semibold">{node}</strong>;
        if (span.italic) node = <em>{node}</em>;
        // Links are re-validated here so a bad URL renders as plain text, never a link.
        const href = span.href?.startsWith("mailto:") ? span.href : safeHttpUrl(span.href);
        if (href) {
          node = (
            <a
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="text-[#b8860b] underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
            >
              {node}
            </a>
          );
        }
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

/** Renders note blocks as React elements. No HTML is ever interpreted. */
export function NoteBlocks({
  blocks,
  onOpenProject,
}: {
  blocks: readonly NoteBlock[];
  onOpenProject: (projectId: string) => void;
}) {
  return (
    <div className="space-y-3 text-[14px] leading-[21px] text-black/85">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={i} className="pt-2 text-[16px] font-semibold text-black/90">
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={i}>
                <Inlines inline={block.inline} />
              </p>
            );
          case "list":
            return (
              <ul key={i} className="list-disc space-y-1 pl-5 marker:text-black/35">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inlines inline={item} />
                  </li>
                ))}
              </ul>
            );
          case "separator":
            return <hr key={i} className="border-black/10" />;
          case "keyValue":
            return (
              <dl key={i} className="space-y-1">
                {block.rows.map((row) => (
                  <div key={row.label} className="flex gap-3">
                    <dt className="w-28 shrink-0 text-black/50">{row.label}</dt>
                    <dd className="min-w-0 break-words">
                      <Inlines inline={row.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            );
          case "project": {
            const project = getProjectById(block.projectId);
            if (!project) return null;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onOpenProject(project.id)}
                aria-label={`Open project ${project.title}`}
                className="group block w-full rounded-lg bg-black/[0.04] p-3 text-left outline-none hover:bg-black/[0.07] focus-visible:ring-2 focus-visible:ring-(--accent)"
              >
                <span className="flex items-center justify-between gap-2 font-semibold">
                  {project.title}
                  <ArrowUpRight className="size-4 shrink-0 text-black/35 group-hover:text-black/60" aria-hidden />
                </span>
                <span className="mt-0.5 block text-[13px] text-black/60">{project.shortDescription}</span>
                {project.technologies && project.technologies.length > 0 && (
                  <span className="mt-1.5 block text-[12px] text-black/45">{project.technologies.join(" · ")}</span>
                )}
              </button>
            );
          }
          case "incomplete":
            return (
              <p key={i} className="flex items-start gap-2 text-[13px] text-black/40 italic">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                {block.message}
              </p>
            );
        }
      })}
    </div>
  );
}
