import { Pencil, Trash2 } from "lucide-react";
import type { LocalMessage } from "@/store/mail-store";
import { formatFull } from "../lib/format";
import { MailEmptyState } from "./mail-empty-state";

interface MessageDetailProps {
  kind: "drafts" | "sent";
  message: LocalMessage | undefined;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MessageDetail({ kind, message, onEdit, onDelete }: MessageDetailProps) {
  if (!message) return <MailEmptyState title="No Message Selected" message="Select a message to read it here." />;
  const action =
    "flex h-7 items-center gap-1.5 rounded-md bg-black/[0.06] px-2.5 text-[12px] text-black/75 outline-none hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-(--accent)";
  return (
    <article aria-labelledby="mail-subject" className="size-full overflow-y-auto px-6 py-5">
      <div className="mx-auto max-w-[640px]">
        <h2 id="mail-subject" className="text-[18px] leading-6 font-semibold break-words text-black/90">
          {message.subject.trim() || "(No Subject)"}
        </h2>
        <dl className="mt-3 space-y-0.5 border-b border-black/10 pb-3 text-[12px]">
          <div className="flex gap-2">
            <dt className="w-12 text-black/45">From</dt>
            <dd className="min-w-0 break-words text-black/80">{[message.fromName, message.fromEmail && `<${message.fromEmail}>`].filter(Boolean).join(" ") || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-12 text-black/45">To</dt>
            <dd className="text-black/80">Portfolio owner</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-12 text-black/45">{kind === "sent" ? "Sent" : "Edited"}</dt>
            <dd className="text-black/80">{formatFull(message.at)}</dd>
          </div>
        </dl>
        {/* Plain text only: React escapes it, and whitespace is preserved. */}
        <p className="mt-4 text-[13px] leading-5 break-words whitespace-pre-wrap text-black/85">{message.body || "This draft has no content yet."}</p>

        {kind === "sent" ? (
          <p className="mt-6 rounded-lg bg-black/[0.05] p-3 text-[12px] text-black/55">
            This is a local record of a submission, stored only in this browser. It shows that the email service accepted the message. It does not show
            that it was delivered, opened or read.
          </p>
        ) : (
          <div className="mt-6 flex gap-2">
            <button type="button" onClick={() => onEdit(message.id)} className={action}>
              <Pencil className="size-3.5" aria-hidden />
              Edit Draft
            </button>
            <button type="button" onClick={() => onDelete(message.id)} className={action}>
              <Trash2 className="size-3.5" aria-hidden />
              Delete Draft
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
