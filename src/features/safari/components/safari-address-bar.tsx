"use client";

import { useState } from "react";
import type { RefObject } from "react";
import { Globe, Loader2, Search } from "lucide-react";
import {
  routeAddress,
  routeTitle,
  safariRouteIds,
  type SafariRoute,
} from "../config/safari-routes";
import { resolveAddress, searchUrl } from "../lib/resolve-address";

type Suggestion =
  | { kind: "internal"; route: SafariRoute }
  | { kind: "external"; url: string }
  | { kind: "search"; query: string };

interface SafariAddressBarProps {
  address: string;
  loading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onOpenInternal: (route: SafariRoute) => void;
  onOpenExternal: (url: string) => void;
}

function getSuggestions(draft: string): Suggestion[] {
  const text = draft.trim();
  if (!text) return [];
  const result = resolveAddress(text);
  const list: Suggestion[] = [];
  if (result.kind === "internal") list.push({ kind: "internal", route: result.route });
  if (result.kind === "external") list.push({ kind: "external", url: result.url });
  const q = text.toLowerCase();
  for (const route of safariRouteIds) {
    const matches = routeAddress(route).includes(q) || routeTitle(route).toLowerCase().includes(q);
    if (matches && !(result.kind === "internal" && result.route === route)) {
      list.push({ kind: "internal", route });
    }
  }
  if (result.kind === "search") list.push({ kind: "search", query: result.query });
  return list;
}

export function SafariAddressBar({
  address,
  loading,
  inputRef,
  onOpenInternal,
  onOpenExternal,
}: SafariAddressBarProps) {
  const [draft, setDraft] = useState<string | null>(null); // null = not editing
  const [highlight, setHighlight] = useState(-1);
  const [message, setMessage] = useState<string | null>(null);

  const editing = draft !== null;
  const suggestions = editing ? getSuggestions(draft) : [];

  const stopEditing = () => {
    setDraft(null);
    setHighlight(-1);
    setMessage(null);
    inputRef.current?.blur();
  };

  const activate = (s: Suggestion) => {
    if (s.kind === "internal") onOpenInternal(s.route);
    // Only an explicit choice sends anything off-site.
    else if (s.kind === "external") onOpenExternal(s.url);
    else onOpenExternal(searchUrl(s.query));
    stopEditing();
  };

  const submit = () => {
    if (highlight >= 0 && suggestions[highlight]) return activate(suggestions[highlight]);
    const result = resolveAddress(draft ?? "");
    if (result.kind === "internal" || result.kind === "external") return activate(result);
    if (result.kind === "invalid") return setMessage(result.message);
    if (result.kind === "search") {
      // Typed text is not sent anywhere until the visitor picks the search row.
      setHighlight(suggestions.findIndex((s) => s.kind === "search"));
      setMessage("Choose the search option below to continue.");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      stopEditing();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (suggestions.length === 0) return;
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setHighlight((h) => {
        const next = h + step;
        if (next < -1) return suggestions.length - 1;
        return next >= suggestions.length ? -1 : next;
      });
    }
  };

  const listId = "safari-address-suggestions";

  return (
    <div role="search" className="relative mx-auto w-full max-w-[560px] min-w-0 flex-1">
      <div
        className={`flex h-7 items-center gap-1.5 rounded-lg bg-black/[0.06] px-2.5 transition-shadow ${
          editing ? "bg-raised shadow-[0_0_0_3px_rgba(10,96,255,0.35),0_0_0_0.5px_rgba(10,96,255,0.8)]" : "hover:bg-black/[0.08]"
        }`}
      >
        {editing ? (
          <Search className="size-3.5 shrink-0 text-black/40" aria-hidden />
        ) : (
          <Globe className="size-3.5 shrink-0 text-black/40" aria-hidden />
        )}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Address and search"
          aria-expanded={editing && (suggestions.length > 0 || !!message)}
          aria-controls={listId}
          aria-activedescendant={highlight >= 0 ? `${listId}-${highlight}` : undefined}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Search or enter website name"
          value={editing ? draft : address}
          onFocus={(e) => {
            setDraft(address);
            const input = e.currentTarget;
            requestAnimationFrame(() => input.select());
          }}
          onBlur={() => {
            setDraft(null);
            setHighlight(-1);
            setMessage(null);
          }}
          onChange={(e) => {
            setDraft(e.target.value);
            setHighlight(-1);
            setMessage(null);
          }}
          onKeyDown={onKeyDown}
          className={`min-w-0 flex-1 bg-transparent text-[13px] text-black/85 outline-none placeholder:text-black/40 ${
            editing ? "text-left" : "text-center"
          }`}
        />
        {loading && (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-black/45 motion-reduce:animate-none" aria-label="Loading" />
        )}
      </div>

      {editing && (suggestions.length > 0 || message) && (
        // Keep input focus while clicking inside the list.
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-9 right-0 left-0 z-50 overflow-hidden rounded-xl border border-black/10 bg-raised/95 p-1 text-[13px] shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl"
        >
          {message && (
            <p role="alert" className="px-2.5 py-1.5 text-[12px] text-[#c0392b]">
              {message}
            </p>
          )}
          <ul id={listId} role="listbox" aria-label="Suggestions">
            {suggestions.map((s, i) => (
              <li
                key={s.kind + (s.kind === "internal" ? s.route : s.kind === "external" ? s.url : s.query)}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === highlight}
                onClick={() => activate(s)}
                className={`flex cursor-default items-center gap-2 rounded-md px-2.5 py-1 ${
                  i === highlight ? "bg-(--accent) text-(--accent-fg)" : "hover:bg-black/5"
                }`}
              >
                {s.kind === "search" ? (
                  <Search className="size-3.5 shrink-0 opacity-60" aria-hidden />
                ) : (
                  <Globe className="size-3.5 shrink-0 opacity-60" aria-hidden />
                )}
                <span className="truncate">
                  {s.kind === "internal" && (
                    <>
                      {routeTitle(s.route)} <span className="opacity-55">— {routeAddress(s.route)}</span>
                    </>
                  )}
                  {s.kind === "external" && (
                    <>
                      Open <span className="opacity-70">{s.url}</span> in a new tab
                    </>
                  )}
                  {s.kind === "search" && <>Search the web for “{s.query}”</>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
