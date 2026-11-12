import type { SpotlightGroup, SpotlightItem } from "../types/spotlight";
import { SpotlightIcon } from "./spotlight-icon";

export const LISTBOX_ID = "spotlight-results";
export const optionId = (item: SpotlightItem) => `spotlight-opt-${item.id}`;

interface SpotlightResultsProps {
  groups: readonly SpotlightGroup[];
  selectedId: string | undefined;
  onHover: (itemId: string) => void;
  onChoose: (item: SpotlightItem) => void;
}

/** Category headings are plain labels: keyboard selection only ever lands on results. */
export function SpotlightResults({ groups, selectedId, onHover, onChoose }: SpotlightResultsProps) {
  return (
    <div id={LISTBOX_ID} role="listbox" aria-label="Search results" className="max-h-[min(450px,55vh)] overflow-y-auto p-2">
      {groups.map((group) => (
        <div key={group.category} role="group" aria-label={group.label}>
          <p aria-hidden className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold text-black/45">
            {group.label}
          </p>
          {group.items.map((item) => {
            const selected = item.id === selectedId;
            return (
              <div
                key={item.id}
                id={optionId(item)}
                role="option"
                aria-selected={selected}
                aria-label={item.subtitle ? `${item.title}, ${item.subtitle}` : item.title}
                onMouseMove={() => onHover(item.id)}
                onClick={() => onChoose(item)}
                className={`flex h-9 cursor-default items-center gap-2.5 rounded-lg px-2.5 text-[13px] ${
                  selected ? "bg-(--accent) text-(--accent-fg)" : "text-black/90"
                }`}
              >
                <SpotlightIcon icon={item.icon} />
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                {item.subtitle && (
                  <span className={`max-w-[45%] shrink-0 truncate text-[12px] ${selected ? "opacity-80" : "text-black/45"}`}>
                    {item.subtitle}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
