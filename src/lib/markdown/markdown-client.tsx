"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText } from "@/lib/clipboard";

/** A code block with a Copy button. Plain monospace text that scrolls sideways; no highlighting library. */
export function CodeBlock({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded-lg bg-black/[0.06] p-3 pr-16 font-mono text-[12px] leading-[18px]" tabIndex={0}>
        <code>{text}</code>
      </pre>
      <button
        type="button"
        onClick={async () => {
          setState((await copyText(text)) ? "copied" : "failed");
          setTimeout(() => setState("idle"), 1800);
        }}
        aria-label="Copy code"
        className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-raised/90 px-1.5 py-0.5 text-[11px] text-black/65 opacity-0 shadow-[0_0_0_0.5px_rgba(0,0,0,0.2)] outline-none group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:ring-2 focus-visible:ring-(--accent)"
      >
        {state === "copied" ? <Check className="size-3" aria-hidden /> : <Copy className="size-3" aria-hidden />}
        {state === "copied" ? "Copied" : state === "failed" ? "Couldn’t copy" : "Copy"}
      </button>
      <span role="status" className="sr-only">
        {state === "copied" ? "Code copied" : state === "failed" ? "Couldn’t copy the code" : ""}
      </span>
    </div>
  );
}

/** A README image that disappears (rather than showing a broken icon) if it can't load. */
export function MarkdownImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return alt ? <span className="text-black/50">{alt}</span> : null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote README images; hosts are allow-listed in safe-markdown
    <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="inline max-w-full rounded" />
  );
}
