import { create } from "zustand";

/** Which Notification Center items the visitor has dismissed this session. In memory only: nothing is stored. */
export const useNoticeStore = create<{ dismissed: readonly string[]; dismiss: (id: string) => void; clear: (ids: readonly string[]) => void }>()((set) => ({
  dismissed: [],
  dismiss: (id) => set((s) => (s.dismissed.includes(id) ? s : { dismissed: [...s.dismissed, id] })),
  clear: (ids) => set((s) => ({ dismissed: [...new Set([...s.dismissed, ...ids])] })),
}));
