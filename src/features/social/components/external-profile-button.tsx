import { ExternalLink } from "lucide-react";

interface ExternalProfileButtonProps {
  /** Validated URL, or undefined when the profile isn't configured. */
  url: string | undefined;
  label: string;
  /** Brand colours for the enabled state. */
  className: string;
}

/** Opens the real profile in a new tab; disabled (and not a link) when no URL is configured. */
export function ExternalProfileButton({ url, label, className }: ExternalProfileButtonProps) {
  const base = "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
  if (!url) {
    return (
      <button type="button" disabled title="This profile link hasn't been configured." className={`${base} cursor-not-allowed bg-black/10 text-black/35`}>
        {label}
      </button>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`} className={`${base} ${className}`}>
      {label}
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  );
}
