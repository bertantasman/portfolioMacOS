import type { ReactNode } from "react";

export function Section({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} aria-label={title} className="scroll-mt-14">
      <h2 className="mb-2 text-[11px] font-semibold tracking-wide text-black/45 uppercase">{title}</h2>
      {children}
    </section>
  );
}
