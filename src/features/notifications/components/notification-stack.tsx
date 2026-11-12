"use client";

import { AnimatePresence, motion } from "motion/react";
import { useShouldReduceMotion } from "@/hooks/use-should-reduce-motion";
import { useNotificationStore } from "@/store/notification-store";
import { NotificationBanner } from "./notification-banner";

/** Banner area, upper right below the menu bar. Shows at most three; the rest wait in a queue. */
export function NotificationStack() {
  const notifications = useNotificationStore((s) => s.notifications);
  const bannerIds = useNotificationStore((s) => s.bannerIds);
  const reduced = useShouldReduceMotion();
  const duration = reduced ? 0 : 0.28;

  const banners = bannerIds
    .map((id) => notifications.find((n) => n.id === id))
    .filter((n): n is NonNullable<typeof n> => n !== undefined)
    .reverse(); // newest on top

  const latest = banners[0];

  return (
    <>
      <div
        className="pointer-events-none fixed top-[calc(1.75rem+env(safe-area-inset-top)+8px)] right-2 z-(--z-notifications) flex w-[min(360px,calc(100vw-16px))] flex-col gap-2"
      >
        <AnimatePresence initial={false}>
          {banners.map((n) => (
            <motion.div
              key={n.id}
              layout={!reduced}
              className="pointer-events-auto"
              initial={{ opacity: 0, x: reduced ? 0 : 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduced ? 0 : 32, transition: { duration: duration * 0.7 } }}
              transition={{ duration, ease: "easeOut" }}
            >
              <NotificationBanner notification={n} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* One announcement for the newest banner only; never the whole history. */}
      <div role="status" aria-live={latest?.priority === "high" ? "assertive" : "polite"} className="sr-only">
        {latest ? `${latest.title}${latest.message ? `. ${latest.message}` : ""}` : ""}
      </div>
    </>
  );
}
