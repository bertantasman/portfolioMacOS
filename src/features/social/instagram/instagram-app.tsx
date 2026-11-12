"use client";

import { useRef, useState } from "react";
import { Images } from "lucide-react";
import { getInstagramMedia } from "./instagram-media";
import { profile } from "@/data/profile";
import { useWindowStore } from "@/store/window-store";
import { ExternalProfileButton } from "../components/external-profile-button";
import { ProfileAvatar } from "../components/profile-avatar";
import { getShortBio } from "@/lib/profile/selectors";
import { getProfileLink } from "../utils/social-links";
import { InstagramMediaGrid } from "./instagram-media-grid";
import { InstagramMediaViewer } from "./instagram-media-viewer";

const openProject = (projectId: string) => useWindowStore.getState().openProject(projectId);

/** An Instagram-inspired gallery of the shared media library. No posts, counts or comments are invented. */
export function InstagramApp() {
  const items = getInstagramMedia();
  const [openId, setOpenId] = useState<string | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const link = getProfileLink("instagram");
  const bio = getShortBio();
  const index = openId ? items.findIndex((m) => m.id === openId) : -1;

  const close = () => {
    setOpenId(null);
    const el = trigger.current;
    if (el?.isConnected) requestAnimationFrame(() => el.focus());
  };

  return (
    <div className="@container relative size-full overflow-hidden bg-surface text-black">
      <div className="size-full overflow-y-auto">
        <div className="mx-auto max-w-[760px] px-5 py-6">
          <header className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <span className="rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[3px]">
              <span className="block rounded-full bg-surface p-[3px]">
                <ProfileAvatar name={profile.fullName ?? profile.displayName} src={profile.avatar} className="size-[88px] text-[28px]" />
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-[20px] font-light">{link?.username ?? profile.displayName}</h1>
                <ExternalProfileButton url={link?.url} label="Open Instagram Profile" className="bg-[#0095f6] text-white hover:bg-[#1877f2]" />
              </div>
              {link?.username && <p className="mt-1 text-[13px] font-semibold">{profile.fullName ?? profile.displayName}</p>}
              {bio && <p className="mt-1 max-w-[56ch] text-[13px] text-black/70">{bio}</p>}
              {!link && <p className="mt-1 text-[11px] text-black/40">No Instagram profile is connected to this portfolio.</p>}
            </div>
          </header>

          {/* Only photos the owner approved for Instagram are shown; with none, there is just the profile card and its link. */}
          {items.length > 0 && (
          <div className="mt-6 border-t border-black/10 pt-2">
            <h2 className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-widest text-black/55 uppercase">
              <Images className="size-3.5" aria-hidden />
              Photos
            </h2>
            {(
              <InstagramMediaGrid
                items={items}
                onOpen={(id, el) => {
                  trigger.current = el;
                  setOpenId(id);
                }}
              />
            )}
          </div>
          )}
        </div>
      </div>

      {index >= 0 && (
        <InstagramMediaViewer
          items={items}
          index={index}
          onIndexChange={(i) => setOpenId(items[i].id)}
          onClose={close}
          onOpenProject={openProject}
        />
      )}
    </div>
  );
}
