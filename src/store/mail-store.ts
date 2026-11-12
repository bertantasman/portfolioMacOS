import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

/** A draft or sent message. Stored only in this browser's localStorage; never uploaded. */
export interface LocalMessage {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
  /** ms since epoch: last edit for drafts, submission time for sent messages. */
  at: number;
}

const MAX_DRAFTS = 20;
const MAX_SENT = 50;
const MAX_FIELD = 6000;

interface MailStore {
  drafts: LocalMessage[];
  sent: LocalMessage[];
  /** Inserts or updates a draft (newest first). */
  saveDraft: (draft: Omit<LocalMessage, "at">) => void;
  deleteDraft: (id: string) => void;
  /** Records a message the server confirmed it handed to the email provider. */
  addSent: (message: Omit<LocalMessage, "at">) => void;
  deleteSent: (id: string) => void;
}

const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* storage full or blocked: drafts just won't persist */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

function sanitizeList(value: unknown, max: number): LocalMessage[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: LocalMessage[] = [];
  for (const raw of value) {
    const m = raw as Partial<Record<keyof LocalMessage, unknown>> | null;
    if (!m || typeof m !== "object") continue;
    const { id, fromName, fromEmail, subject, body, at } = m;
    if (
      typeof id !== "string" || !id || seen.has(id) ||
      typeof fromName !== "string" || typeof fromEmail !== "string" ||
      typeof subject !== "string" || typeof body !== "string" ||
      typeof at !== "number" || !Number.isFinite(at)
    ) {
      continue;
    }
    seen.add(id);
    out.push({
      id,
      fromName: fromName.slice(0, MAX_FIELD),
      fromEmail: fromEmail.slice(0, MAX_FIELD),
      subject: subject.slice(0, MAX_FIELD),
      body: body.slice(0, MAX_FIELD),
      at,
    });
    if (out.length >= max) break;
  }
  return out;
}

export const MAIL_STORAGE_KEY = "mail-local-v1";

export const useMailStore = create<MailStore>()(
  persist(
    (set) => ({
      drafts: [],
      sent: [],
      saveDraft: (draft) =>
        set((state) => ({
          drafts: [{ ...draft, at: Date.now() }, ...state.drafts.filter((d) => d.id !== draft.id)].slice(0, MAX_DRAFTS),
        })),
      deleteDraft: (id) => set((state) => ({ drafts: state.drafts.filter((d) => d.id !== id) })),
      addSent: (message) =>
        set((state) => ({ sent: [{ ...message, at: Date.now() }, ...state.sent].slice(0, MAX_SENT) })),
      deleteSent: (id) => set((state) => ({ sent: state.sent.filter((m) => m.id !== id) })),
    }),
    {
      name: MAIL_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      // Read storage on the client after hydration (Mail triggers it) so server and first client render match.
      skipHydration: true,
      partialize: (state) => ({ drafts: state.drafts, sent: state.sent }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as { drafts?: unknown; sent?: unknown };
        return { ...current, drafts: sanitizeList(p.drafts, MAX_DRAFTS), sent: sanitizeList(p.sent, MAX_SENT) };
      },
    },
  ),
);
