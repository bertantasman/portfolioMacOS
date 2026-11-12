"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Inbox, Send } from "lucide-react";
import { useMailStore } from "@/store/mail-store";
import { useElementWidth } from "@/features/notes/hooks/use-element-width";
import { useContactAvailability } from "../hooks/use-contact-availability";
import { ComposePanel } from "./compose-panel";
import { ContactPanel } from "./contact-panel";
import { MailEmptyState } from "./mail-empty-state";
import { MailSidebar, type Mailbox } from "./mail-sidebar";
import { MailToolbar } from "./mail-toolbar";
import { MessageDetail } from "./message-detail";
import { MessageList } from "./message-list";

const COMPACT_WIDTH = 760;
const titles: Record<Mailbox, string> = { inbox: "Inbox", drafts: "Drafts", sent: "Sent", contact: "Contact" };

interface MailAppProps {
  /** Asks Mail to start a new message; a new `requestId` is a new request. */
  request?: { compose: boolean; requestId: number };
}

/** One Mail window. Drafts and Sent history are shared through the local mail store. */
export function MailApp({ request }: MailAppProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(rootRef);
  const compact = width < COMPACT_WIDTH;
  const availability = useContactAvailability();

  const drafts = useMailStore((s) => s.drafts);
  const sent = useMailStore((s) => s.sent);
  const deleteDraft = useMailStore((s) => s.deleteDraft);

  const [mailbox, setMailbox] = useState<Mailbox>("inbox");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [sidebarPref, setSidebarPref] = useState<boolean | null>(null);
  // `key` gives each compose session fresh state; `draftId` continues an existing draft.
  const [compose, setCompose] = useState<{ key: number; draftId: string | null } | null>(null);
  const [handledRequest, setHandledRequest] = useState<number | undefined>();

  // Saved drafts and Sent history live in localStorage; read them once the page is interactive.
  useEffect(() => {
    void useMailStore.persist.rehydrate();
  }, []);

  if (request && request.requestId !== handledRequest) {
    setHandledRequest(request.requestId);
    if (request.compose) setCompose({ key: request.requestId, draftId: null });
  }

  const list = mailbox === "drafts" ? drafts : mailbox === "sent" ? sent : [];
  const selected = list.find((m) => m.id === selectedId) ?? list[0];
  const sidebarVisible = sidebarPref ?? !compact;
  const draftToEdit = useMemo(() => drafts.find((d) => d.id === compose?.draftId) ?? null, [drafts, compose?.draftId]);

  const openCompose = (draftId: string | null = null) => setCompose({ key: Date.now(), draftId });
  const selectMailbox = (box: Mailbox) => {
    setMailbox(box);
    setSelectedId(undefined);
    if (compact) setSidebarPref(false);
  };

  const subtitle =
    mailbox === "drafts" ? `${drafts.length} ${drafts.length === 1 ? "draft" : "drafts"}` :
    mailbox === "sent" ? `${sent.length} local ${sent.length === 1 ? "record" : "records"}` : undefined;

  return (
    <div ref={rootRef} className="@container relative flex size-full bg-surface text-black">
      {sidebarVisible && (
        <MailSidebar
          active={mailbox}
          counts={{ drafts: drafts.length, sent: sent.length }}
          overlay={compact}
          onSelect={selectMailbox}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <MailToolbar
          title={titles[mailbox]}
          subtitle={subtitle}
          sidebarVisible={sidebarVisible}
          clearTrafficLights={!sidebarVisible || compact}
          onToggleSidebar={() => setSidebarPref(!sidebarVisible)}
          onCompose={() => openCompose()}
        />
        <div className="flex min-h-0 flex-1">
          {mailbox === "inbox" && (
            <MailEmptyState
              icon={Inbox}
              title="No Messages"
              message="This portfolio does not connect to a personal inbox."
            />
          )}
          {mailbox === "contact" && <ContactPanel onCompose={() => openCompose()} />}
          {(mailbox === "drafts" || mailbox === "sent") &&
            (list.length === 0 ? (
              <MailEmptyState
                icon={mailbox === "drafts" ? FileText : Send}
                title={mailbox === "drafts" ? "No Drafts" : "No Sent Messages"}
                message={
                  mailbox === "drafts"
                    ? "Messages you start writing are saved here, on this device."
                    : "Messages you submit successfully are recorded here, on this device."
                }
              />
            ) : (
              <>
                <div className="w-[270px] shrink-0 overflow-y-auto border-r border-black/10 bg-surface-2 @max-[860px]:w-[230px]">
                  <MessageList
                    label={titles[mailbox]}
                    messages={list}
                    selectedId={selected?.id}
                    kind={mailbox}
                    onSelect={setSelectedId}
                    onOpen={(id) => openCompose(id)}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <MessageDetail
                    kind={mailbox}
                    message={selected}
                    onEdit={(id) => openCompose(id)}
                    onDelete={(id) => deleteDraft(id)}
                  />
                </div>
              </>
            ))}
        </div>
      </div>
      {compose && (
        <ComposePanel
          key={compose.key}
          draft={draftToEdit}
          availability={availability}
          onClose={() => setCompose(null)}
        />
      )}
    </div>
  );
}
