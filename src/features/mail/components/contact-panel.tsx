import { SquarePen } from "lucide-react";
import { profile } from "@/data/profile";
import { safeMailto } from "@/lib/safe-url";
import { getProfileLink } from "@/features/social/utils/social-links";

/** Contact details from the central profile. Anything not configured is simply not shown. */
export function ContactPanel({ onCompose }: { onCompose: () => void }) {
  const mailto = safeMailto(profile.email);
  const links = (["github", "linkedin", "instagram"] as const)
    .map((p) => ({ p, link: getProfileLink(p) }))
    .filter((x) => x.link);
  const rows = [
    ...(mailto && profile.email ? [{ label: "Email", href: mailto, text: profile.email }] : []),
    ...links.map(({ p, link }) => ({ label: p === "github" ? "GitHub" : p === "linkedin" ? "LinkedIn" : "Instagram", href: link!.url, text: link!.url })),
  ];
  return (
    <div className="size-full overflow-y-auto px-6 py-5">
      <div className="mx-auto max-w-[560px]">
        <h2 className="text-[18px] font-semibold text-black/90">Contact</h2>
        <p className="mt-1 text-[13px] text-black/60">The quickest way to reach out is to write a message from here.</p>
        <button
          type="button"
          onClick={onCompose}
          className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md bg-(--accent) px-3 text-[13px] font-medium text-(--accent-fg) outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          <SquarePen className="size-4" aria-hidden />
          New Message
        </button>
        {rows.length > 0 ? (
          <dl className="mt-6 divide-y divide-black/[0.08] rounded-lg bg-raised/70 text-[13px] shadow-[0_0_0_0.5px_rgba(0,0,0,0.12)]">
            {rows.map((r) => (
              <div key={r.label} className="flex gap-3 px-3 py-2">
                <dt className="w-20 shrink-0 text-black/50">{r.label}</dt>
                <dd className="min-w-0 break-all">
                  <a
                    href={r.href}
                    target={r.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="text-(--link-color) underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-(--accent)"
                  >
                    {r.text}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-6 text-[12px] text-black/40 italic">No other contact details have been configured.</p>
        )}
        <p className="mt-6 text-[11px] text-black/40">
          Drafts and sent history are stored only in this browser. They are not uploaded unless you send a message.
        </p>
      </div>
    </div>
  );
}
