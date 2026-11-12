"use client";

import { forwardRef } from "react";
import { Search, X } from "lucide-react";

interface LaunchpadSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  listboxId: string;
  activeDescendant: string | undefined;
  expanded: boolean;
  describedBy?: string;
}

export const LaunchpadSearch = forwardRef<HTMLInputElement, LaunchpadSearchProps>(function LaunchpadSearch(
  { value, onChange, onClear, listboxId, activeDescendant, expanded, describedBy },
  ref,
) {
  return (
    <div
      data-launchpad-keep
      className="relative flex h-8 w-[min(240px,calc(100vw-48px))] items-center rounded-lg border border-white/25 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] focus-within:border-white/50 focus-within:bg-white/20"
    >
      <Search className="pointer-events-none absolute left-2.5 size-3.5 text-white/75" strokeWidth={2} aria-hidden />
      <input
        ref={ref}
        type="text"
        role="combobox"
        aria-label="Search applications"
        aria-controls={listboxId}
        aria-expanded={expanded}
        aria-activedescendant={activeDescendant}
        aria-autocomplete="list"
        aria-describedby={describedBy}
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="size-full min-w-0 bg-transparent pr-8 pl-8 text-[14px] text-white outline-none placeholder:text-white/60"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="absolute right-1.5 grid size-5 place-items-center rounded-full text-white/80 outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/80"
        >
          <X className="size-3" strokeWidth={2.5} aria-hidden />
        </button>
      )}
    </div>
  );
});
