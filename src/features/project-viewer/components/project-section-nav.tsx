"use client";

import { useState } from "react";

export interface NavItem {
  id: string;
  label: string;
}

/** A sticky row of jump links. It lists only the sections that exist, and is skipped for short pages. */
export function ProjectSectionNav({ items, onSelect }: { items: readonly NavItem[]; onSelect: (id: string) => void }) {
  const [current, setCurrent] = useState<string | null>(null);
  if (items.length < 3) return null;
  return (
    <nav aria-label="Project sections" className="sticky top-0 z-20 -mx-6 mb-1 border-b border-black/[0.08] bg-surface/90 px-6 py-1.5 backdrop-blur">
      <ul className="flex gap-1 overflow-x-auto">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <button
              type="button"
              aria-current={current === item.id ? "true" : undefined}
              onClick={() => {
                setCurrent(item.id);
                onSelect(item.id);
              }}
              className={`h-6 rounded-md px-2.5 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-(--accent) ${
                current === item.id ? "bg-(--accent)/10 font-medium text-(--accent)" : "text-black/65 hover:bg-black/[0.06]"
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
