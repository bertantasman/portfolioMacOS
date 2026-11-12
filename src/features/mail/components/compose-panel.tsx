"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, Loader2, Mail, Send, Trash2, X } from "lucide-react";
import { profile } from "@/data/profile";
import { CONTACT_LIMITS, validateContact, type ContactField, type ContactFieldErrors, type ContactResponse } from "@/lib/contact-schema";
import { notify } from "@/lib/notify";
import { safeMailto } from "@/lib/safe-url";
import { useMailStore, type LocalMessage } from "@/store/mail-store";
import type { ContactAvailability } from "../hooks/use-contact-availability";

interface ComposePanelProps {
  /** An existing draft to continue, or null for a new message. */
  draft: LocalMessage | null;
  availability: ContactAvailability;
  onClose: () => void;
}

type Phase = "editing" | "sending" | "sent";

const AUTOSAVE_MS = 700;
const newId = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const signature = (f: Fields) => JSON.stringify([f.fromName, f.fromEmail, f.subject, f.body]);
interface Fields {
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
}

/** A compose sheet inside the Mail window. Drafts save locally; sending needs real provider confirmation. */
export function ComposePanel({ draft, availability, onClose }: ComposePanelProps) {
  const saveDraft = useMailStore((s) => s.saveDraft);
  const deleteDraft = useMailStore((s) => s.deleteDraft);
  const addSent = useMailStore((s) => s.addSent);

  const [fields, setFields] = useState<Fields>({
    fromName: draft?.fromName ?? "",
    fromEmail: draft?.fromEmail ?? "",
    subject: draft?.subject ?? "",
    body: draft?.body ?? "",
  });
  const [draftId] = useState(() => draft?.id ?? newId());
  const [savedSig, setSavedSig] = useState(() => (draft ? signature(fields) : ""));
  const [savedAt, setSavedAt] = useState<number | null>(draft?.at ?? null);
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<ContactFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("editing");
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [copied, setCopied] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const sendingRef = useRef(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const ids = { name: useId(), email: useId(), subject: useId(), body: useId() };

  const sig = signature(fields);
  const hasContent = Object.values(fields).some((v) => v.trim() !== "");
  const dirty = hasContent && sig !== savedSig;
  const validation = validateContact({ name: fields.fromName, email: fields.fromEmail, subject: fields.subject, message: fields.body });
  const clientErrors: ContactFieldErrors = validation.ok ? {} : validation.errors;
  const errorFor = (field: ContactField) => (touched[field] ? clientErrors[field] : undefined) ?? serverErrors[field];
  const canSend = availability === "available" && phase === "editing" && validation.ok;

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  const persist = () => {
    saveDraft({ id: draftId, ...fields });
    setSavedSig(sig);
    setSavedAt(Date.now());
  };

  // Debounced autosave: writes to localStorage only after a pause in typing.
  useEffect(() => {
    if (phase !== "editing" || !dirty) return;
    const timer = setTimeout(persist, AUTOSAVE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, phase, dirty]);

  const update = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setServerErrors({});
  };
  const touch = (field: ContactField) => () => setTouched((t) => ({ ...t, [field]: true }));

  const requestClose = () => {
    if (phase === "sent" || !hasContent || !dirty) onClose();
    else setConfirmingClose(true);
  };

  const send = async () => {
    setTouched({ name: true, email: true, subject: true, message: true });
    if (sendingRef.current || availability !== "available" || !validation.ok) return;
    sendingRef.current = true; // blocks duplicate submissions even before React re-renders
    setPhase("sending");
    setError(null);
    const { data } = validation;
    const fail = (message: string) => {
      setError(message);
      setPhase("editing");
      notify({ appId: "mail", title: "Message not sent", message, dedupeKey: `mail-fail-${draftId}-${message}` });
    };
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, website: honeypot }),
      });
      let result: ContactResponse | undefined;
      try {
        result = (await response.json()) as ContactResponse;
      } catch {
        result = undefined;
      }
      if (response.ok && result?.success === true) {
        addSent({ id: newId(), fromName: data.name, fromEmail: data.email, subject: data.subject, body: data.message });
        deleteDraft(draftId);
        setPhase("sent");
        notify({ appId: "mail", title: "Message submitted", message: `“${data.subject}” was submitted successfully.`, dedupeKey: `mail-sent-${draftId}` });
      } else {
        setServerErrors(result?.errors ?? {});
        fail(result?.message ?? "Your message could not be sent. Please try again.");
      }
    } catch {
      fail("Couldn't reach the server. Check your connection and try again.");
    } finally {
      sendingRef.current = false;
    }
  };

  const mailto = safeMailto(profile.email);
  const mailtoHref =
    mailto && hasContent
      ? `${mailto}?subject=${encodeURIComponent(fields.subject)}&body=${encodeURIComponent(`${fields.body}\n\n— ${fields.fromName}`)}`
      : mailto;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${fields.subject}\n\n${fields.body}\n\n— ${fields.fromName} <${fields.fromEmail}>`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy to the clipboard. Select the text and copy it manually.");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (confirmingClose) setConfirmingClose(false);
      else requestClose();
    } else if (mod && e.key === "Enter") {
      e.preventDefault();
      if (canSend) void send();
    } else if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (hasContent && phase === "editing") persist();
    }
  };

  const input =
    "w-full min-w-0 bg-transparent py-1.5 text-[13px] text-black/90 outline-none placeholder:text-black/30 disabled:opacity-60";
  const row = "flex items-start gap-3 border-b border-black/10 px-4";
  const label = "w-14 shrink-0 pt-[7px] text-[12px] text-black/45";
  const errorLine = (field: ContactField, id: string) => {
    const text = errorFor(field);
    return text ? (
      <p id={id} role="alert" className="pb-1.5 text-[11px] text-[#c0392b]">
        <span aria-hidden>⚠ </span>
        {text}
      </p>
    ) : null;
  };
  const describedBy = (field: ContactField, id: string) => (errorFor(field) ? `${id}-err` : undefined);

  return (
    <div className="absolute inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[rgb(0_0_0/0.25)] p-3 pt-8" onKeyDown={onKeyDown}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New Message"
        className="relative w-[min(640px,100%)] rounded-xl bg-window text-black shadow-[0_0_0_0.5px_rgba(0,0,0,0.3),0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-3xl"
      >
        <header className="flex items-center justify-between gap-2 border-b border-black/10 px-4 py-2.5">
          <h2 className="text-[13px] font-semibold text-black/85">New Message</h2>
          <div className="flex items-center gap-1">
            <span className="mr-1 text-[11px] text-black/40" aria-live="polite">
              {phase === "editing" && (dirty ? "Unsaved changes" : savedAt ? "Draft saved on this device" : "")}
            </span>
            {phase === "editing" && (
              <button
                type="button"
                aria-label="Delete draft"
                disabled={!hasContent && !savedAt}
                onClick={() => {
                  deleteDraft(draftId);
                  onClose();
                }}
                className="grid size-7 place-items-center rounded-md text-black/55 outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-(--accent) disabled:opacity-30"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            )}
            <button
              type="button"
              aria-label="Close"
              onClick={requestClose}
              className="grid size-7 place-items-center rounded-md text-black/55 outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-(--accent)"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </header>

        {phase === "sent" ? (
          <div role="status" className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-[#34c759]/15 text-[#248a3d]">
              <Check className="size-6" aria-hidden />
            </span>
            <p className="text-[15px] font-semibold text-black/85">Message submitted</p>
            <p className="max-w-[360px] text-[13px] text-black/55">
              Your message has been submitted successfully. It&apos;s saved in Sent on this device. That doesn&apos;t mean it has been read.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 h-8 rounded-md bg-(--accent) px-4 text-[13px] font-medium text-(--accent-fg) outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              Done
            </button>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <div className={row}>
              <label htmlFor={ids.name} className={label}>From</label>
              <div className="min-w-0 flex-1">
                <input
                  ref={firstFieldRef}
                  id={ids.name}
                  value={fields.fromName}
                  onChange={update("fromName")}
                  onBlur={touch("name")}
                  maxLength={CONTACT_LIMITS.name.max + 20}
                  placeholder="Your name"
                  autoComplete="name"
                  aria-invalid={!!errorFor("name")}
                  aria-describedby={describedBy("name", ids.name)}
                  disabled={phase === "sending"}
                  className={input}
                />
                {errorLine("name", `${ids.name}-err`)}
              </div>
            </div>
            <div className={row}>
              <label htmlFor={ids.email} className={label}>Email</label>
              <div className="min-w-0 flex-1">
                <input
                  id={ids.email}
                  type="email"
                  value={fields.fromEmail}
                  onChange={update("fromEmail")}
                  onBlur={touch("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!errorFor("email")}
                  aria-describedby={describedBy("email", ids.email)}
                  disabled={phase === "sending"}
                  className={input}
                />
                {errorLine("email", `${ids.email}-err`)}
              </div>
            </div>
            <div className={row}>
              <span className={label}>To</span>
              {/* Fixed: the real recipient is set on the server and can't be changed from here. */}
              <p className="min-w-0 flex-1 truncate py-1.5 text-[13px] text-black/70">{profile.email ?? "Portfolio owner"}</p>
            </div>
            <div className={row}>
              <label htmlFor={ids.subject} className={label}>Subject</label>
              <div className="min-w-0 flex-1">
                <input
                  id={ids.subject}
                  value={fields.subject}
                  onChange={update("subject")}
                  onBlur={touch("subject")}
                  maxLength={CONTACT_LIMITS.subject.max + 20}
                  placeholder="Subject"
                  aria-invalid={!!errorFor("subject")}
                  aria-describedby={describedBy("subject", ids.subject)}
                  disabled={phase === "sending"}
                  className={input}
                />
                {errorLine("subject", `${ids.subject}-err`)}
              </div>
            </div>
            <div className="px-4 py-2">
              <label htmlFor={ids.body} className="sr-only">Message</label>
              <textarea
                id={ids.body}
                value={fields.body}
                onChange={update("body")}
                onBlur={touch("message")}
                rows={9}
                placeholder="Write your message…"
                aria-invalid={!!errorFor("message")}
                aria-describedby={describedBy("message", ids.body)}
                disabled={phase === "sending"}
                className="w-full resize-y bg-transparent py-1 text-[13px] leading-5 text-black/90 outline-none placeholder:text-black/30 disabled:opacity-60"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">{errorLine("message", `${ids.body}-err`)}</div>
                <span className={`shrink-0 text-[11px] ${fields.body.trim().length > CONTACT_LIMITS.message.max ? "text-[#c0392b]" : "text-black/35"}`}>
                  {fields.body.trim().length}/{CONTACT_LIMITS.message.max}
                </span>
              </div>
            </div>

            {/* Honeypot: invisible to people, tempting to bots. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="absolute -left-[9999px] size-px opacity-0"
            />

            {availability === "unavailable" && (
              <p role="status" className="mx-4 mb-2 rounded-lg bg-[#ffcc00]/15 px-3 py-2 text-[12px] text-black/70">
                Direct sending isn&apos;t available right now, so this message can&apos;t be sent from here. Your draft is saved on this device
                {mailtoHref ? ", and you can send it from your own email app instead." : ". You can copy it and send it yourself."}
              </p>
            )}
            {error && (
              <p role="alert" className="mx-4 mb-2 rounded-lg bg-[#ff3b30]/10 px-3 py-2 text-[12px] text-[#b3261e]">
                {error}
              </p>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-black/10 px-4 py-2.5">
              <p className="text-[11px] text-black/40">Drafts stay in this browser until you send.</p>
              <div className="flex items-center gap-2">
                {availability === "unavailable" && (
                  <>
                    <button
                      type="button"
                      onClick={copy}
                      disabled={!hasContent}
                      className="flex h-7 items-center gap-1.5 rounded-md bg-black/[0.07] px-2.5 text-[12px] text-black/75 outline-none hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-(--accent) disabled:opacity-40"
                    >
                      <Copy className="size-3.5" aria-hidden />
                      {copied ? "Copied" : "Copy Message"}
                    </button>
                    {mailtoHref && (
                      <a
                        href={mailtoHref}
                        className="flex h-7 items-center gap-1.5 rounded-md bg-black/[0.07] px-2.5 text-[12px] text-black/75 outline-none hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-(--accent)"
                      >
                        <Mail className="size-3.5" aria-hidden />
                        Open in Email App
                      </a>
                    )}
                  </>
                )}
                <button
                  type="submit"
                  disabled={!canSend}
                  aria-busy={phase === "sending"}
                  title={availability === "unavailable" ? "Direct sending isn't available right now." : undefined}
                  className="flex h-7 items-center gap-1.5 rounded-md bg-(--accent) px-3 text-[13px] font-medium text-(--accent-fg) outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-40"
                >
                  {phase === "sending" ? <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden /> : <Send className="size-3.5" aria-hidden />}
                  {phase === "sending" ? "Sending…" : "Send"}
                </button>
              </div>
            </footer>
          </form>
        )}

        {confirmingClose && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[rgb(0_0_0/0.3)] p-4">
            <div role="alertdialog" aria-modal="true" aria-labelledby="close-title" aria-describedby="close-desc" className="w-[320px] rounded-xl bg-surface p-5 text-center shadow-[0_0_0_0.5px_rgba(0,0,0,0.25),0_16px_50px_rgba(0,0,0,0.35)]">
              <h3 id="close-title" className="text-[14px] font-semibold text-black/90">Save this message as a draft?</h3>
              <p id="close-desc" className="mt-1.5 text-[12px] text-black/55">
                You have changes that haven&apos;t been saved yet. Drafts are stored only in this browser.
              </p>
              <div className="mt-4 flex flex-col gap-1.5">
                <button
                  type="button"
                  autoFocus
                  onClick={() => {
                    persist();
                    onClose();
                  }}
                  className="h-7 rounded-md bg-(--accent) text-[13px] font-medium text-(--accent-fg) outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteDraft(draftId);
                    onClose();
                  }}
                  className="h-7 rounded-md bg-black/[0.07] text-[13px] text-black/80 outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingClose(false)}
                  className="h-7 rounded-md bg-black/[0.07] text-[13px] text-black/80 outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
